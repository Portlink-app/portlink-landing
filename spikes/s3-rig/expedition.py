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

def grain(m, scale, amt, dark, bump=0.25, bricks=False):
    """Object-space noise (and optional slab joints) into base colour and bump: no flat CG surfaces."""
    nt = m.node_tree; b = next(n for n in nt.nodes if n.type == 'BSDF_PRINCIPLED')
    tc = nt.nodes.new('ShaderNodeTexCoord'); nz = nt.nodes.new('ShaderNodeTexNoise')
    nz.inputs['Scale'].default_value = scale; nz.inputs['Detail'].default_value = 8
    nt.links.new(tc.outputs['Object'], nz.inputs['Vector'])
    mix = nt.nodes.new('ShaderNodeMix'); mix.data_type = 'RGBA'
    mix.inputs[6].default_value = b.inputs['Base Color'].default_value; mix.inputs[7].default_value = (*lin(dark), 1)
    ramp = nt.nodes.new('ShaderNodeMapRange'); ramp.inputs['From Min'].default_value = 0.5 - amt
    ramp.inputs['From Max'].default_value = 0.5 + amt
    nt.links.new(nz.outputs['Fac'], ramp.inputs['Value']); nt.links.new(ramp.outputs['Result'], mix.inputs['Factor'])
    out = mix.outputs[2]
    if bricks:
        br = nt.nodes.new('ShaderNodeTexBrick'); br.inputs['Scale'].default_value = 0.08
        br.inputs['Mortar Size'].default_value = 0.015; br.inputs['Color1'].default_value = (1, 1, 1, 1)
        br.inputs['Color2'].default_value = (0.93, 0.93, 0.93, 1); br.inputs['Mortar'].default_value = (0.78, 0.78, 0.78, 1)
        nt.links.new(tc.outputs['Object'], br.inputs['Vector'])
        mul = nt.nodes.new('ShaderNodeMix'); mul.data_type = 'RGBA'; mul.blend_type = 'MULTIPLY'
        mul.inputs['Factor'].default_value = 1.0
        nt.links.new(out, mul.inputs[6]); nt.links.new(br.outputs['Color'], mul.inputs[7]); out = mul.outputs[2]
    nt.links.new(out, b.inputs['Base Color'])
    bp = nt.nodes.new('ShaderNodeBump'); bp.inputs['Strength'].default_value = bump
    nt.links.new(nz.outputs['Fac'], bp.inputs['Height']); nt.links.new(bp.outputs['Normal'], b.inputs['Normal'])
    return m

M = {
    "hull": mat("Hull", "#07090c", 0.55, 0.0, coat=0.12), "boot": mat("Boot", "#6e1d1d", 0.5),
    "white": mat("White", "#eef0f1", 0.32, coat=0.3), "glass": mat("Glass", "#0b141e", 0.06, 0.7),
    "rail": mat("Rail", "#9fb4c4", 0.05, 0.0, trans=0.6), "dark": mat("Dark", "#1c242c", 0.5),
    "funtop": mat("FunTop", "#101418", 0.45), "orange": mat("Lifeboat", "#e2702c", 0.4, coat=0.5), "boat": mat("Tender", "#a9542c", 0.5, coat=0.3),
    "concrete": grain(mat("Concrete", "#7f8388", 0.9), 0.35, 0.35, "#5d6166", 0.3, bricks=True), "fender": mat("Fender", "#121416", 0.7),
    "shed": mat("Shed", "#b9c0c6", 0.6), "roof": mat("Roof", "#3a4148", 0.55),
    "rope": mat("Rope", "#d9d2c0", 0.8), "land": mat("Land", "#46585a", 0.95),
    "hill": grain(mat("Hill", "#3b4a44", 0.95), 0.045, 0.4, "#1d2824", 0.8), "snow": grain(mat("Snow", "#c9d3dc", 0.7), 0.02, 0.3, "#8e9aa6", 0.4),
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
STEM_RAKE = math.tan(math.radians(27))   # rev 4: stem raked 27 deg forward above the waterline
STEM_TOP = DECK + 3.2                     # deck height at the stem (sheer at X1)
def stem_x(z):          # bow profile: straight raked stem above water, short ice knuckle swept aft below
    x0 = X1 - STEM_TOP * STEM_RAKE        # stem at the waterline
    return x0 + z * STEM_RAKE if z >= 0 else x0 + z * 0.45
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
    t = max(0.0, (x - 10) / (X1 - 10)); return DECK + 3.2 * t * t
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
# ---------- superstructure: expedition profile, 5 decks plus an observation deck ----------
# Blunt, slightly raked white front stacked almost vertically over the bow (HX-style outline, no livery);
# aft ends terrace down to an open aft deck at hull-deck level. Everything stays inside the beam.
# (name, x_aft, x_fwd, z_base, height, width, kind)
H5 = 2.9
XF = 36.0   # rev 4: one flush, near-vertical front; terraces stay aft only
DECKS = [("D1", -50, XF, DECK + 0*H5, H5, BEAM - 0.5, "win"),
         ("D2", -45, XF, DECK + 1*H5, H5, BEAM - 0.5, "balc"),
         ("D3", -39, XF, DECK + 2*H5, H5, BEAM - 0.5, "balc"),
         ("D4", -31, XF, DECK + 3*H5, H5, BEAM - 0.9, "win"),
         ("D5", -22, XF, DECK + 4*H5, H5, BEAM - 0.9, "bridge")]
for name, xa, xf, z0, h, wd, kind in DECKS:
    L = xf - xa; cx = (xa + xf) / 2
    block(name, L, wd, h, (cx, 0, z0 + h/2), M["white"], 0.15, nose=min(0.06, 1.6 / L))
    n = int((L * 0.78) / 2.6)
    for side in (-1, 1):
        y = side * (wd/2 + 0.04)
        if kind == "balc":   # recessed balcony band with glass rail
            block(f"{name}R{side}", L*0.70, 0.3, 1.9, (cx - L*0.06, y, z0 + 1.45), M["dark"], 0.05)
            block(f"{name}G{side}", L*0.70, 0.12, 0.9, (cx - L*0.06, side*(wd/2 + 0.2), z0 + 0.85), M["rail"], 0.02)
        else:
            rows(f"{name}W{side}", n, 2.6, lambda: block(f"{name}w{side}", 1.8, 0.25, 1.2 if kind == "win" else 1.5,
                 (xa + 3.0, y, z0 + h*0.55), M["glass"], 0.08))
    # forward-facing glazing on every deck front (the expedition "face")
    if kind != "bridge":
        block(f"{name}FW", 0.8, wd*0.55, h*0.36, (xf - 0.25, 0, z0 + h*0.58), M["glass"], 0.1)
# wraparound bridge on D5: one continuous glass band across the front and round both sides
ZB = DECK + 4*H5 + H5*0.58
block("BRIDGEFW", 0.9, BEAM - 0.7, 1.35, (XF - 0.2, 0, ZB), M["glass"], 0.12)
for side in (-1, 1):
    block(f"BRIDGESW{side}", 9.0, 0.5, 1.35, (XF - 4.6, side*((BEAM - 0.9)/2 + 0.05), ZB), M["glass"], 0.12)
# bridge wings to the ship's side on D5
block("WINGS", 3.0, BEAM - 0.2, 0.5, (XF - 7.0, 0, DECK + 4*H5 + 0.5), M["white"], 0.12)
# observation deck (6th) and compact mast on the bridge roof
block("OBS", 26, BEAM - 6, 2.4, (10, 0, DECK + 5*H5 + 1.2), M["white"], 0.15, nose=0.08)
rows("OBSW-1", 9, 2.8, lambda: block("obsw-1", 2.0, 0.25, 1.2, (-0.5, -(BEAM-6)/2 - 0.04, DECK + 5*H5 + 1.3), M["glass"], 0.06))
block("OBSFW", 0.8, (BEAM-6)*0.8, 1.4, (22.8, 0, DECK + 5*H5 + 1.3), M["glass"], 0.1)
block("MAST", 0.7, 0.7, 6.0, (17, 0, DECK + 5*H5 + 5.2), M["white"], 0.1)
block("YARD", 0.5, 5.0, 0.4, (17, 0, DECK + 5*H5 + 7.0), M["white"], 0.1)
block("RADAR", 3.6, 0.5, 0.3, (17.3, 0, DECK + 5*H5 + 8.4), M["dark"], 0.1)
# compact funnel aft on D4: low, raked, dark cap
block("FUNNEL", 8.0, 5.5, 5.0, (-24, 0, DECK + 4*H5 + 2.5), M["white"], 0.9, nose=0.35, taper=0.2)
block("FUNTOP", 6.4, 5.2, 0.9, (-24.8, 0, DECK + 4*H5 + 5.3), M["funtop"], 0.3, nose=0.35)
# rev 4: two tenders per side tucked aft, set deep into a dark recess band on D2
for side in (-1, 1):
    block(f"RECESS{side}", 22, 0.5, 3.0, (-35, side*(BEAM/2 - 0.5), DECK + H5 + 1.5), M["funtop"], 0.05)
    for k in range(2):
        block(f"BOAT{side}{k}", 8.0, 2.4, 2.0, (-40 + k*10.0, side*(BEAM/2 - 1.6), DECK + H5 + 1.3),
              M["boat"], 0.8, nose=0.3)
# open aft deck: rails and a small crane over the zodiac platform
for side in (-1, 1):
    block(f"AFTRAIL{side}", 24, 0.12, 1.0, (X0 + 13, side*(BEAM/2 - 0.3), DECK + 0.5), M["rail"], 0.02)
block("AFTRAILX", 0.12, BEAM - 0.8, 1.0, (X0 + 1.2, 0, DECK + 0.5), M["rail"], 0.02)
block("CRANE", 0.8, 0.8, 5.0, (X0 + 8, -6, DECK + 2.5), M["orange"], 0.1)
block("JIB", 9.0, 0.5, 0.5, (X0 + 12, -6, DECK + 4.8), M["orange"], 0.1)
block("ZODIACS", 10, 6, 0.9, (X0 + 14, 3, DECK + 0.45), M["dark"], 0.4)
# foredeck: low white bulwark following the hull flare, open bow mooring deck forward of the superstructure
# ---------- quay: concrete apron on the far (+y) side, fenders, bollards, mooring lines, shed, fjord hills ----------
QY = BEAM/2 + 2.4                      # quay face; pneumatic fenders fill the gap, hull parallel to it
block("QUAY", 520, 260, 6.0, (0, QY + 130, 0.0), M["concrete"], 0.3, parent=world_root)      # top at z=3
block("FENDERS", 470, 0.5, 1.4, (0, QY - 0.25, 2.0), M["fender"], 0.2, parent=world_root)
for k, fx in enumerate((-58, -30, -2, 26, 52)):          # floating pneumatic fenders between hull and quay
    bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=1.05, depth=4.2, location=(fx, BEAM/2 + 1.15, 0.7),
                                        rotation=(0, math.pi/2, 0))
    fo = bpy.context.object; fo.name = f"YOKO{k}"; finish(fo, world_root, M["fender"], 0.0)
rows("BOLL", 12, 22.0, lambda: block("bollard", 0.7, 0.7, 0.9, (-121, QY + 2.0, 3.45), M["dark"], 0.3,
     parent=world_root))
def line(name, p0, p1, sag=1.2):
    cu = bpy.data.curves.new(name, 'CURVE'); cu.dimensions = '3D'; cu.bevel_depth = 0.16
    sp = cu.splines.new('BEZIER'); sp.bezier_points.add(1)
    for bp, p in zip(sp.bezier_points, (p0, p1)):
        bp.co = p; bp.handle_left_type = bp.handle_right_type = 'AUTO'
    mid = (Vector(p0) + Vector(p1)) / 2 - Vector((0, 0, sag))
    sp.bezier_points.add(1); sp.bezier_points[2].co = sp.bezier_points[1].co
    sp.bezier_points[1].co = mid
    for bp in sp.bezier_points: bp.handle_left_type = bp.handle_right_type = 'AUTO'
    o = bpy.data.objects.new(name, cu); sc.collection.objects.link(o); o.data.materials.append(M["rope"])
    o.parent = world_root
for nm, xs, xb in (("HEAD", 68, 92), ("HEAD2", 66, 96), ("FBREAST", 54, 56), ("FSPRING", 40, 20),
                   ("ASPRING", -50, -30), ("ABREAST", -68, -70), ("STERN", -72, -96), ("STERN2", -73, -101)):
    line(nm, (xs, BEAM/2 - 0.2, sheer(xs) - 0.4), (xb, QY + 2.0, 3.8), 1.6)
block("SHED", 110, 34, 11, (-40, QY + 62, 3 + 5.5), M["shed"], 0.3, parent=world_root)
block("SHEDROOF", 112, 36, 1.0, (-40, QY + 62, 3 + 11.4), M["roof"], 0.3, parent=world_root)
rows("LAMP", 6, 40.0, lambda: block("lamp", 0.35, 0.35, 12, (-100, QY + 18, 9.0), M["dark"], 0.05,
     parent=world_root))
# fjord walls: displaced grids far behind, snow above 380 m
def hills(name, y0, depth, peak, seed, xspan=6000, snow=380):
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
            f.material_index = 1 if f.calc_center_median().z > snow else 0
    bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new(name, me); sc.collection.objects.link(o)
    finish(o, world_root, [M["hill"], M["snow"]], 0.0)
hills("FJORD_NEAR", QY + 260, 1400, 230, 3, snow=190)
hills("FJORD_FAR", QY + 1700, 2600, 620, 11, 9000, snow=360)
for o in sc.objects:
    if o.name == "FJORD_FAR": o.data.materials[0] = mat("HillFar", "#71869a", 0.95)

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
lights += [sun("RIM", (-1.0, 1.0, 0.16), lin("#f3d9b0"), 2.6, 0.9)]
lights += [sun("COLD", (1.0, 0.55, 0.30), lin("#4f7db8"), 3.0, 2.0)]
w = bpy.data.worlds.new("W"); sc.world = w; w.use_nodes = True
bg = next(n for n in w.node_tree.nodes if n.type == 'BACKGROUND')
bg.inputs['Color'].default_value = (*lin("#5b7690"), 1); bg.inputs['Strength'].default_value = 0.45
wt = w.node_tree; out_bg = next(n for n in wt.nodes if n.type == 'OUTPUT_WORLD')
sky = wt.nodes.new('ShaderNodeBackground'); sky.inputs['Strength'].default_value = 1.0
stc = wt.nodes.new('ShaderNodeTexCoord'); ssep = wt.nodes.new('ShaderNodeSeparateXYZ')
scr = wt.nodes.new('ShaderNodeValToRGB'); el = scr.color_ramp.elements
el[0].position = 0.0; el[0].color = (*lin("#c3ccd2"), 1); el[1].position = 0.32; el[1].color = (*lin("#3f5f80"), 1)
mid = el.new(0.09); mid.color = (*lin("#93a9bb"), 1)
wt.links.new(stc.outputs['Generated'], ssep.inputs['Vector']); wt.links.new(ssep.outputs['Z'], scr.inputs['Fac'])
wt.links.new(scr.outputs['Color'], sky.inputs['Color'])
lp = wt.nodes.new('ShaderNodeLightPath'); msh = wt.nodes.new('ShaderNodeMixShader')
wt.links.new(lp.outputs['Is Camera Ray'], msh.inputs['Fac']); wt.links.new(bg.outputs[0], msh.inputs[1])
wt.links.new(sky.outputs[0], msh.inputs[2]); wt.links.new(msh.outputs[0], out_bg.inputs['Surface'])
# aerial perspective: volume scatter in the world so the fjord walls fade toward the sky colour
vol = None   # a world volume swallows sun lights (measured: all-black plate); haze lives in the hill colours
out_w = next(n for n in w.node_tree.nodes if n.type == 'OUTPUT_WORLD')
if vol:
    vol.inputs['Color'].default_value = (*lin("#7f98ae"), 1); vol.inputs['Density'].default_value = 0.00045
    w.node_tree.links.new(vol.outputs[0], out_w.inputs['Volume'])

portrait = H > W
cam = bpy.data.objects.new("CAM", bpy.data.cameras.new("CAM")); sc.collection.objects.link(cam); sc.camera = cam
cd = cam.data; cd.lens = 50; cd.sensor_width = 36; cd.sensor_fit = 'HORIZONTAL' if not portrait else 'VERTICAL'
cd.sensor_height = 36 if portrait else 24
L = mx.x - mn.x
dist = L * (2.9 if portrait else 1.55)
tgt = Vector(((mn.x + mx.x) / 2 + 10, 0, max(0.0, mx.z) * 0.50))
dirv = Vector((0.50, -0.86, 0.065)).normalized()   # near-level so the fjord walls enter frame
cam.location = tgt + dirv * dist
cam.rotation_euler = (tgt - cam.location).to_track_quat('-Z', 'Y').to_euler()
cd.dof.use_dof = True; cd.dof.focus_distance = (tgt - cam.location).length; cd.dof.aperture_fstop = 2.8
cd.clip_end = 12000

r = sc.render; r.resolution_x, r.resolution_y = W, H; r.resolution_percentage = 100
r.film_transparent = False; r.image_settings.file_format = 'PNG'; r.image_settings.color_mode = 'RGBA'
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
sea.is_holdout = False; sea.is_shadow_catcher = True; r.film_transparent = True
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
