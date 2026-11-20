# One Harbour v4, beat 1: 150 m expedition cruise ship alongside a generic Norwegian quay. Cycles, 1 unit = 1 m.
# Our own procedural model: no name, no livery, no cranes, no containers, no hatches (plan G1a).
# Args after "--": out_dir width height samples [frames] [travel_m]
# Writes plate (RGBA: ship, quay, land above z=0), shadow (contact shadow on z=0) and camera.json
# (same contract as rig.py, plus vessel_type / segment for the segment guard and the measured L/B).
import bpy, bmesh, sys, math, time, json, random
from mathutils import Vector
a = sys.argv[sys.argv.index("--")+1:]
OUT, W, H, SAMPLES = a[0], int(a[1]), int(a[2]), int(a[3])
NF = int(a[4]) if len(a) > 4 else 1
TRAVEL = float(a[5]) if len(a) > 5 else 0.0
LOA, BEAM, DRAFT, DECK = 150.0, 24.5, 5.6, 9.0      # L/B 6,12 (G1a window 5,8 to 6,4)
X0, X1 = -LOA/2, LOA/2
random.seed(7)

def lin(h):
    h = h.lstrip("#"); c = [int(h[i:i+2], 16)/255 for i in (0, 2, 4)]
    return tuple(x/12.92 if x <= 0.04045 else ((x+0.055)/1.055)**2.4 for x in c)
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
ship = bpy.data.objects.new("SHIP", None); sc.collection.objects.link(ship)
world_root = bpy.data.objects.new("SET", None); sc.collection.objects.link(world_root)

def mat(name, col, rough, metal=0.0, trans=0.0, coat=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = next(n for n in m.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
    b.inputs['Base Color'].default_value = (*lin(col), 1)
    b.inputs['Roughness'].default_value = rough; b.inputs['Metallic'].default_value = metal
    for k in ('Transmission Weight', 'Transmission'):
        if k in b.inputs: b.inputs[k].default_value = trans; break
    for k in ('Coat Weight', 'Clearcoat'):
        if k in b.inputs: b.inputs[k].default_value = coat; break
    return m

M = {
    "hull": mat("Hull", "#16202c", 0.33, 0.1, coat=0.4), "boot": mat("Boot", "#6e1d1d", 0.5),
    "white": mat("White", "#eef0f1", 0.32, coat=0.3), "glass": mat("Glass", "#0b141e", 0.06, 0.7),
    "rail": mat("Rail", "#9fb4c4", 0.05, 0.0, trans=0.6), "dark": mat("Dark", "#1c242c", 0.5),
    "funtop": mat("FunTop", "#101418", 0.45), "orange": mat("Lifeboat", "#e2702c", 0.4, coat=0.5),
    "concrete": mat("Concrete", "#8d9196", 0.88), "fender": mat("Fender", "#121416", 0.7),
    "shed": mat("Shed", "#b9c0c6", 0.6), "roof": mat("Roof", "#3a4148", 0.55),
    "rope": mat("Rope", "#d9d2c0", 0.8), "land": mat("Land", "#2c3a35", 0.95),
    "hill": mat("Hill", "#24333a", 0.95), "snow": mat("Snow", "#c9d3dc", 0.7),
}

def finish(o, parent, m, bevel=0.0, smooth=True):
    o.parent = parent
    if isinstance(m, list):
        for x in m: o.data.materials.append(x)
    else:
        o.data.materials.append(m)
    if bevel > 0:
        bv = o.modifiers.new("Bevel", 'BEVEL'); bv.width = bevel; bv.segments = 3; bv.limit_method = 'ANGLE'
    if smooth:
        for p in o.data.polygons: p.use_smooth = True
        o.modifiers.new("WN", 'WEIGHTED_NORMAL')
    return o

def block(name, sx, sy, sz, loc, m, bevel=0.25, nose=0.0, parent=None, taper=0.0):
    """Box; nose > 0 rounds the +x end over that fraction of length (superstructure fronts)."""
    me = bpy.data.meshes.new(name); bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    if nose > 0:
        bmesh.ops.subdivide_edges(bm, edges=[e for e in bm.edges if abs(e.verts[0].co.x - e.verts[1].co.x) > 0.5],
                                  cuts=8, use_grid_fill=True)
    for v in bm.verts:
        x = v.co.x
        if nose > 0 and x > 0.5 - nose:
            t = (x - (0.5 - nose)) / nose
            v.co.y *= max(0.25, math.cos(t * math.pi / 2)) ** 0.5
        if taper:
            v.co.x *= 1 - taper * (v.co.z + 0.5)
        v.co.x *= sx; v.co.y *= sy; v.co.z *= sz
    bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new(name, me); sc.collection.objects.link(o); o.location = loc
    return finish(o, parent or ship, m, bevel)

def rows(name, n, step, proto_fn, axis=0):
    """n copies of one small block along x (windows, mullions, bollards) via an array modifier."""
    o = proto_fn()
    ar = o.modifiers.new("Arr", 'ARRAY'); ar.count = n; ar.use_relative_offset = False
    ar.use_constant_offset = True; ar.constant_offset_displace = (step, 0, 0) if axis == 0 else (0, step, 0)
    o.modifiers.move(len(o.modifiers)-1, 0)
    return o

# ---------- hull: lofted sections, flat bottom with bilge radius, raked ice-class stem, transom stern ----------
def stem_x(z):          # bow profile: near-vertical ice stem below water, raked and flared above
    return X1 - 3.5 + 3.5 * min(1.0, max(0.0, (z + DRAFT) / (DECK + DRAFT))) ** 1.4
def stern_x(z):         # transom above z=-1, cut-up run below
    return X0 + max(0.0, -1.0 - z) * 3.2
def half_breadth(x, z):
    hb = BEAM / 2
    r = 3.0; zb = -DRAFT + r                                    # bilge radius
    if z < zb:
        dz = zb - z; hb = hb - r + math.sqrt(max(0.0, r*r - dz*dz))
    xs = 18.0                                                   # parallel body ends, bow entrance starts
    if x > xs:
        t = min(1.0, (x - xs) / max(1e-3, stem_x(z) - xs))
        fine = 1.0 + 0.6 * max(0.0, -z) / DRAFT                 # finer entrance below water
        hb *= max(0.0, 1 - t ** 2.0) ** (0.5 * fine)
    xa = X0 + 22.0
    if x < xa:                                                  # aft run narrows a little to the transom
        t = (xa - x) / 22.0
        hb *= 1 - 0.10 * t * t - 0.25 * t * t * max(0.0, -z) / DRAFT
    return hb
def sheer(x):          # deck edge rises toward the bow
    t = max(0.0, (x - 10) / (X1 - 10)); return DECK + 2.2 * t * t
NU, NZ = 120, 22
me = bpy.data.meshes.new("HULL"); bm = bmesh.new(); grid = []
for i in range(NU + 1):
    u = i / NU; ring = []
    for j in range(NZ + 1):
        zf = j / NZ
        for side in (-1, 1):
            pass
        ring.append(zf)
    grid.append(ring)
verts = {}
for i in range(NU + 1):
    u = i / NU
    for side in (-1, 1):
        for j in range(NZ + 1):
            zf = j / NZ
            zt = sheer(stern_x(-DRAFT) + u * (X1 - X0))
            z = -DRAFT + zf * (zt + DRAFT)
            x = stern_x(z) + u * (stem_x(z) - stern_x(z))
            y = side * half_breadth(x, z)
            verts[(i, side, j)] = bm.verts.new((x, y, z))
for i in range(NU):
    for side in (-1, 1):
        for j in range(NZ):
            q = [verts[(i, side, j)], verts[(i+1, side, j)], verts[(i+1, side, j+1)], verts[(i, side, j+1)]]
            f = bm.faces.new(q if side > 0 else q[::-1])
    # keel strip joins the two bottom rows
    q = [verts[(i, -1, 0)], verts[(i+1, -1, 0)], verts[(i+1, 1, 0)], verts[(i, 1, 0)]]
    bm.faces.new(q[::-1])
# transom and deck caps
bm.faces.new([verts[(0, -1, j)] for j in range(NZ + 1)] + [verts[(0, 1, j)] for j in range(NZ, -1, -1)])
bm.faces.new([verts[(i, -1, NZ)] for i in range(NU + 1)] + [verts[(i, 1, NZ)] for i in range(NU, -1, -1)][1:-1])
bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.02)
bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
for f in bm.faces:                                     # boot topping band at the waterline
    f.material_index = 1 if f.calc_center_median().z < 0.9 else 0
bm.to_mesh(me); bm.free()
hull = bpy.data.objects.new("HULL", me); sc.collection.objects.link(hull)
finish(hull, ship, [M["hull"], M["boot"]], 0.0)

# portholes along the parallel body, both sides
for side in (-1, 1):
    rows(f"PORT{side}", 26, 3.0, lambda: block(f"PORTHOLE{side}", 0.9, 0.3, 0.9,
         (-62, side * (BEAM/2 + 0.02), 4.6), M["glass"], 0.2))
    rows(f"PORTB{side}", 26, 3.0, lambda: block(f"PORTHOLE2{side}", 0.9, 0.3, 0.9,
         (-60.5, side * (BEAM/2 + 0.02), 6.8), M["glass"], 0.2))
# white bulwark on the foredeck, open bow
block("BULWARK", 34, BEAM - 0.4, 1.4, (X1 - 22, 0, sheer(X1 - 20) + 0.5), M["white"], 0.3, nose=0.45)

# ---------- superstructure: stepped white decks, window rows, balcony bands, bridge with wings ----------
# (name, x_aft, x_fwd, z_base, height, width, kind)
DECKS = [("D4", -68, 30, DECK, 3.0, BEAM - 0.6, "win"),
         ("D5", -66, 27, DECK + 3.0, 3.0, BEAM - 0.6, "balc"),
         ("D6", -63, 24, DECK + 6.0, 3.0, BEAM - 0.9, "balc"),
         ("D7", -56, 21, DECK + 9.0, 3.0, BEAM - 1.6, "balc"),
         ("D8", -44, 17, DECK + 12.0, 3.0, BEAM - 2.6, "win"),
         ("D9", -30, 12, DECK + 15.0, 2.8, BEAM - 5.0, "win")]
for name, xa, xf, z0, h, wd, kind in DECKS:
    L = xf - xa; cx = (xa + xf) / 2
    block(name, L, wd, h, (cx, 0, z0 + h/2), M["white"], 0.18, nose=min(0.35, 9.0 / L))
    n = int((L * 0.80) / 2.8)
    for side in (-1, 1):
        y = side * (wd/2 + 0.04)
        if kind == "win":
            rows(f"{name}W{side}", n, 2.8, lambda: block(f"{name}w{side}", 2.0, 0.25, 1.25,
                 (xa + 3.0, y, z0 + h*0.55), M["glass"], 0.08))
        else:   # balcony: dark recess band, glass rail in front, white divider fins
            block(f"{name}R{side}", L*0.82, 0.3, 2.0, (cx - L*0.04, side*(wd/2 + 0.02), z0 + 1.5), M["dark"], 0.05)
            block(f"{name}G{side}", L*0.82, 0.12, 1.0, (cx - L*0.04, side*(wd/2 + 0.5), z0 + 0.9), M["rail"], 0.02)
            rows(f"{name}F{side}", int(L*0.82/6.0)+1, 6.0, lambda: block(f"{name}f{side}", 0.25, 1.1, 2.4,
                 (cx - L*0.45, side*(wd/2 + 0.3), z0 + 1.6), M["white"], 0.04))
    if name in ("D4", "D5", "D6"):            # forward-facing glazed lounge on the rounded fronts
        block(f"{name}FW", 1.5, wd*0.55, h*0.5, (xf - 1.2, 0, z0 + h*0.55), M["glass"], 0.2, nose=0.5)
# bridge: wraparound glazing and wings to the ship's sides
block("BRIDGE", 14, BEAM - 4.0, 3.2, (15, 0, DECK + 16.6), M["white"], 0.2, nose=0.4)
block("BRIDGEGL", 6.0, BEAM - 3.8, 1.3, (19.0, 0, DECK + 17.0), M["glass"], 0.15, nose=0.6)
block("WINGS", 4.0, BEAM + 0.6, 1.4, (17.0, 0, DECK + 16.0), M["white"], 0.15)
block("WINGGL", 3.6, BEAM + 0.7, 0.7, (17.0, 0, DECK + 16.9), M["glass"], 0.08)
# lifeboats in a recess along deck 5, both sides
for side in (-1, 1):
    for k in range(4):
        block(f"BOAT{side}{k}", 9.5, 3.2, 2.6, (-48 + k*11.5, side*(BEAM/2 + 0.4), DECK + 4.6),
              M["orange"], 0.9, nose=0.3)
# funnel: white, raked aft, dark top; mast with radar on the top deck
block("FUNNEL", 10, 6.5, 9.0, (-24, 0, DECK + 22.0), M["white"], 1.2, nose=0.3, taper=0.25)
block("FUNTOP", 7.5, 6.2, 1.2, (-25.2, 0, DECK + 26.8), M["funtop"], 0.4, nose=0.3)
block("MAST", 0.8, 0.8, 9.0, (6, 0, DECK + 22.3), M["white"], 0.1)
block("YARD", 0.6, 7.0, 0.5, (6, 0, DECK + 24.5), M["white"], 0.1)
block("RADAR", 4.5, 0.6, 0.35, (6.4, 0, DECK + 26.3), M["dark"], 0.1)
block("SUNDECK", 14, BEAM - 9, 1.0, (-5, 0, DECK + 18.3), M["white"], 0.2)

# ---------- quay: concrete apron on the far (+y) side, fenders, bollards, mooring lines, shed, fjord hills ----------
QY = BEAM/2 + 1.6
block("QUAY", 520, 260, 6.0, (0, QY + 130, 0.0), M["concrete"], 0.3, parent=world_root)      # top at z=3
block("FENDERS", 470, 0.9, 1.6, (0, QY - 0.4, 1.6), M["fender"], 0.3, parent=world_root)
rows("BOLL", 12, 22.0, lambda: block("bollard", 0.7, 0.7, 0.9, (-121, QY + 2.0, 3.45), M["dark"], 0.3,
     parent=world_root))
def line(name, p0, p1, sag=1.2):
    cu = bpy.data.curves.new(name, 'CURVE'); cu.dimensions = '3D'; cu.bevel_depth = 0.09
    sp = cu.splines.new('BEZIER'); sp.bezier_points.add(1)
    for bp, p in zip(sp.bezier_points, (p0, p1)):
        bp.co = p; bp.handle_left_type = bp.handle_right_type = 'AUTO'
    mid = (Vector(p0) + Vector(p1)) / 2 - Vector((0, 0, sag))
    sp.bezier_points.add(1); sp.bezier_points[2].co = sp.bezier_points[1].co
    sp.bezier_points[1].co = mid
    for bp in sp.bezier_points: bp.handle_left_type = bp.handle_right_type = 'AUTO'
    o = bpy.data.objects.new(name, cu); sc.collection.objects.link(o); o.data.materials.append(M["rope"])
    o.parent = world_root
for nm, xs, xb in (("HEAD", 66, 89), ("FSPRING", 40, 23), ("ASPRING", -50, -33), ("STERN", -72, -99)):
    line(nm, (xs, BEAM/2 - 0.2, sheer(xs) - 0.4), (xb, QY + 2.0, 3.8))
block("SHED", 110, 34, 11, (-40, QY + 62, 3 + 5.5), M["shed"], 0.3, parent=world_root)
block("SHEDROOF", 112, 36, 1.0, (-40, QY + 62, 3 + 11.4), M["roof"], 0.3, parent=world_root)
rows("LAMP", 6, 40.0, lambda: block("lamp", 0.35, 0.35, 12, (-100, QY + 18, 9.0), M["dark"], 0.05,
     parent=world_root))
# fjord walls: displaced grids far behind, snow above 380 m
def hills(name, y0, depth, peak, seed, xspan=6000):
    random.seed(seed); nx, ny = 160, 40
    me = bpy.data.meshes.new(name); bm = bmesh.new(); vv = []
    waves = [(random.uniform(0.0015, 0.006), random.uniform(0, 6.28), random.uniform(0.3, 1.0)) for _ in range(6)]
    for j in range(ny + 1):
        row = []
        for i in range(nx + 1):
            x = -xspan/2 + xspan * i / nx; t = j / ny
            n = sum(a * math.sin(x * f + p + t * 3.1) for f, p, a in waves) / 3.0
            z = 3 + peak * math.sin(t * math.pi / 1.6) ** 1.3 * (0.65 + 0.35 * n)
            row.append(bm.verts.new((x, y0 + depth * t, z)))
        vv.append(row)
    for j in range(ny):
        for i in range(nx):
            f = bm.faces.new([vv[j][i], vv[j][i+1], vv[j+1][i+1], vv[j+1][i]])
            f.material_index = 1 if f.calc_center_median().z > 380 else 0
    bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new(name, me); sc.collection.objects.link(o)
    finish(o, world_root, [M["hill"], M["snow"]], 0.0)
hills("FJORD_NEAR", QY + 260, 1400, 520, 3)
hills("FJORD_FAR", QY + 1700, 2600, 900, 11, 9000)

bpy.context.view_layer.update()
def bounds(objs):
    mn = Vector((1e9,)*3); mx = Vector((-1e9,)*3)
    for o in objs:
        if o.type in ('MESH', 'CURVE'):
            for c in o.bound_box:
                w = o.matrix_world @ Vector(c); mn = Vector(map(min, mn, w)); mx = Vector(map(max, mx, w))
    return mn, mx
ship_objs = [o for o in sc.objects if o.parent is ship]
hmn, hmx = bounds([hull]); mn, mx = bounds(ship_objs)
LB = (hmx.x - hmn.x) / (hmx.y - hmn.y)
print("HULL", tuple(round(v, 1) for v in hmn), tuple(round(v, 1) for v in hmx), "L/B", round(LB, 2))
print("SHIP", tuple(round(v, 1) for v in mn), tuple(round(v, 1) for v in mx))

bpy.ops.mesh.primitive_plane_add(size=4000, location=(0, 0, 0)); sea = bpy.context.object; sea.name = "SEA"

def sun(name, src, col, en, ang):
    d = bpy.data.lights.new(name, 'SUN'); d.color = col; d.energy = en; d.angle = math.radians(ang)
    o = bpy.data.objects.new(name, d); sc.collection.objects.link(o)
    o.rotation_euler = (-Vector(src)).normalized().to_track_quat('-Z', 'Y').to_euler(); return o
lights = [sun("KEY", (-0.55, -1.0, 1.05), (1, 0.97, 0.93), 4.5, 0.6)]
lights += [sun("RIM", (-1.0, 1.0, 0.16), lin("#f5b53d"), 6.0, 0.9)]
lights += [sun("COLD", (1.0, 0.55, 0.30), lin("#4f7db8"), 3.0, 2.0)]
w = bpy.data.worlds.new("W"); sc.world = w; w.use_nodes = True
bg = next(n for n in w.node_tree.nodes if n.type == 'BACKGROUND')
bg.inputs['Color'].default_value = (*lin("#5b7690"), 1); bg.inputs['Strength'].default_value = 0.45
# aerial perspective: volume scatter in the world so the fjord walls fade toward the sky colour
vol = w.node_tree.nodes.new('ShaderNodeVolumeScatter') if hasattr(bpy.types, 'ShaderNodeVolumeScatter') else None
out_w = next(n for n in w.node_tree.nodes if n.type == 'OUTPUT_WORLD')
if vol:
    vol.inputs['Color'].default_value = (*lin("#7f98ae"), 1); vol.inputs['Density'].default_value = 0.00045
    w.node_tree.links.new(vol.outputs[0], out_w.inputs['Volume'])

portrait = H > W
cam = bpy.data.objects.new("CAM", bpy.data.cameras.new("CAM")); sc.collection.objects.link(cam); sc.camera = cam
cd = cam.data; cd.lens = 50; cd.sensor_width = 36; cd.sensor_fit = 'HORIZONTAL' if not portrait else 'VERTICAL'
cd.sensor_height = 36 if portrait else 24
L = mx.x - mn.x
dist = L * (2.9 if portrait else 1.45)
tgt = Vector(((mn.x + mx.x) / 2, 0, max(0.0, mx.z) * 0.42))
dirv = Vector((0.62, -0.78, 0.10)).normalized()
cam.location = tgt + dirv * dist
cam.rotation_euler = (tgt - cam.location).to_track_quat('-Z', 'Y').to_euler()
cd.dof.use_dof = True; cd.dof.focus_distance = (tgt - cam.location).length; cd.dof.aperture_fstop = 2.8
cd.clip_end = 12000

r = sc.render; r.resolution_x, r.resolution_y = W, H; r.resolution_percentage = 100
r.film_transparent = True; r.image_settings.file_format = 'PNG'; r.image_settings.color_mode = 'RGBA'
looks = [i.identifier for i in sc.view_settings.bl_rna.properties['look'].enum_items_static]
sc.view_settings.view_transform = 'AgX'
sc.view_settings.look = 'AgX - Medium High Contrast' if 'AgX - Medium High Contrast' in looks else 'None'
r.engine = 'CYCLES'
cy = sc.cycles; cy.samples = SAMPLES; cy.use_denoising = True; cy.device = 'GPU'
try:
    pr = bpy.context.preferences.addons['cycles'].preferences
    pr.compute_device_type = 'METAL'; pr.get_devices()
    for d in pr.devices: d.use = True
except Exception as ex: print("gpu", ex)

meshes = [o for o in sc.objects if o.type in ('MESH', 'CURVE') and o is not sea]
ts = {}
sc.frame_start = 1; sc.frame_end = NF
x0 = -TRAVEL / 2
if NF > 1:
    ship.location.x = x0; ship.keyframe_insert("location", index=0, frame=1)
    ship.location.x = x0 + TRAVEL; ship.keyframe_insert("location", index=0, frame=NF)
def go(name):
    if NF > 1:
        r.filepath = f"{OUT}/{name}_"; bpy.ops.render.render(animation=True)
    else:
        r.filepath = f"{OUT}/{name}_0001.png"; bpy.ops.render.render(write_still=True)
sea.is_holdout = True; sea.is_shadow_catcher = False
t = time.time(); go("plate"); ts["plate"] = (time.time()-t)/NF
sea.is_holdout = False; sea.is_shadow_catcher = True
for o in meshes: o.visible_camera = False
for o in lights: o.hide_render = True
if vol: w.node_tree.links.remove(next(l for l in w.node_tree.links if l.to_socket == out_w.inputs['Volume']))
sun("CONTACT", (-0.15, -0.2, 1.0), (1, 1, 1), 4.0, 12.0)
cy.samples = max(32, SAMPLES // 2)
r.resolution_percentage = 50
t = time.time(); go("shadow"); ts["shadow"] = (time.time()-t)/NF
json.dump({"position": list(cam.location), "target": list(tgt), "lens_mm": cd.lens, "sensor_mm": 36,
           "sensor_fit": cd.sensor_fit, "focus_m": cd.dof.focus_distance, "fstop": cd.dof.aperture_fstop,
           "width": W, "height": H, "z_up": True, "frames": NF,
           "ship_x": [x0 + TRAVEL * i / max(1, NF-1) for i in range(NF)], "secs": {k: round(v, 2) for k, v in ts.items()},
           "vessel_type": "expedition_cruise", "segment": "cruise",
           "hull": {"loa_m": round(hmx.x - hmn.x, 2), "beam_m": round(hmx.y - hmn.y, 2), "l_over_b": round(LB, 2)}},
          open(f"{OUT}/camera.json", "w"), indent=1)
print("SECS", {k: round(v, 2) for k, v in ts.items()}, "DEVICE", cy.device)
