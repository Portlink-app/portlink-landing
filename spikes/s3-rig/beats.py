# One Harbour v4, Step 7 (G4): procedural Blender Cycles rig for beats b00..b06.
# Models:
#   - expedition_cruise (150,0 x 24,5 m, L/B 6,16, G1 rev 5 approved, razor-sharp boot-top, flush glazing)
#   - harbour_launch    (13,8 x 4,2 m Nordic port-agent pilot launch with tubular D-fender & raked wheelhouse)
#   - ship_tender       (9,8 x 3,4 m streamlined expedition ship tender with flush panoramic cabin)
#   - tour_boat         (10,6 x 3,5 m offshore RIB tour boat with tubular hypalon collar, saddle seats, twin outboards & tubular A-frame arch; zero pawn figures)
#   - iceberg           (38 x 24 x 16 m flat-faceted calved tabular/pinnacled glacial iceberg prop for beat 5)
#
# Usage:
#   /Applications/Blender.app/Contents/MacOS/Blender -b -P spikes/s3-rig/beats.py -- <out_dir> <beat_id> <w> <h> <samples> <frames>
# Writes plate_NNNN.png, shadow_NNNN.png, and camera.json (with vessel_type, segment, hull, secs).
import bpy, bmesh, sys, math, time, json, random, os
from mathutils import Vector

a = sys.argv[sys.argv.index("--") + 1:]
OUT, BEAT, W, H, SAMPLES, NF = a[0], a[1], int(a[2]), int(a[3]), int(a[4]), int(a[5])
os.makedirs(OUT, exist_ok=True)

LOA, BEAM, DRAFT, DECK = 150.0, 24.5, 5.6, 9.0
X0, X1 = -LOA / 2, LOA / 2
random.seed(7)

def lin(h):
    h = h.lstrip("#")
    c = [int(h[i:i+2], 16) / 255 for i in (0, 2, 4)]
    return tuple(x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c)

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
ship = bpy.data.objects.new("SHIP", None); sc.collection.objects.link(ship)
world_root = bpy.data.objects.new("SET", None); sc.collection.objects.link(world_root)
craft = bpy.data.objects.new("CRAFT", None); sc.collection.objects.link(craft)

def mat(name, col, rough, metal=0.0, trans=0.0, coat=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = next(n for n in m.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
    b.inputs['Base Color'].default_value = (*lin(col), 1)
    b.inputs['Roughness'].default_value = rough
    b.inputs['Metallic'].default_value = metal
    for k in ('Transmission Weight', 'Transmission'):
        if k in b.inputs: b.inputs[k].default_value = trans; break
    for k in ('Coat Weight', 'Clearcoat'):
        if k in b.inputs: b.inputs[k].default_value = coat; break
    return m

def grain(m, scale, amt, dark, bump=0.25, bricks=False):
    nt = m.node_tree; b = next(n for n in nt.nodes if n.type == 'BSDF_PRINCIPLED')
    tc = nt.nodes.new('ShaderNodeTexCoord'); nz = nt.nodes.new('ShaderNodeTexNoise')
    nz.inputs['Scale'].default_value = scale; nz.inputs['Detail'].default_value = 8
    nt.links.new(tc.outputs['Object'], nz.inputs['Vector'])
    mix = nt.nodes.new('ShaderNodeMix'); mix.data_type = 'RGBA'
    mix.inputs[6].default_value = b.inputs['Base Color'].default_value
    mix.inputs[7].default_value = (*lin(dark), 1)
    ramp = nt.nodes.new('ShaderNodeMapRange')
    ramp.inputs['From Min'].default_value = 0.5 - amt
    ramp.inputs['From Max'].default_value = 0.5 + amt
    nt.links.new(nz.outputs['Fac'], ramp.inputs['Value'])
    nt.links.new(ramp.outputs['Result'], mix.inputs['Factor'])
    out = mix.outputs[2]
    if bricks:
        br = nt.nodes.new('ShaderNodeTexBrick'); br.inputs['Scale'].default_value = 0.08
        br.inputs['Mortar Size'].default_value = 0.015
        br.inputs['Color1'].default_value = (1, 1, 1, 1)
        br.inputs['Color2'].default_value = (0.93, 0.93, 0.93, 1)
        br.inputs['Mortar'].default_value = (0.78, 0.78, 0.78, 1)
        nt.links.new(tc.outputs['Object'], br.inputs['Vector'])
        mul = nt.nodes.new('ShaderNodeMix'); mul.data_type = 'RGBA'; mul.blend_type = 'MULTIPLY'
        mul.inputs['Factor'].default_value = 1.0
        nt.links.new(out, mul.inputs[6]); nt.links.new(br.outputs['Color'], mul.inputs[7])
        out = mul.outputs[2]
    nt.links.new(out, b.inputs['Base Color'])
    bp = nt.nodes.new('ShaderNodeBump'); bp.inputs['Strength'].default_value = bump
    nt.links.new(nz.outputs['Fac'], bp.inputs['Height']); nt.links.new(bp.outputs['Normal'], b.inputs['Normal'])
    return m

M = {
    "hull": mat("Hull", "#07090c", 0.88, 0.0, coat=0.0),
    "navy_hull": mat("NavyHull", "#0a1c34", 0.45, 0.05, coat=0.18),
    "boot": mat("Boot", "#6e1d1d", 0.5),
    "white": mat("White", "#eef0f1", 0.30, coat=0.3),
    "alum": mat("Aluminium", "#cdd4dc", 0.35, 0.45, coat=0.15),
    "glass": mat("Glass", "#08111a", 0.05, 0.75),
    "rail": mat("Rail", "#9fb4c4", 0.05, 0.0, trans=0.6),
    "steel": mat("Steel", "#b8c2cc", 0.22, 0.85),
    "dark": mat("Dark", "#1b232b", 0.48),
    "sponson": mat("Sponson", "#121820", 0.55, coat=0.1),
    "funtop": mat("FunTop", "#101418", 0.45),
    "orange": mat("SignalOrange", "#d86524", 0.38, coat=0.4),
    "boat": mat("TenderHull", "#152b47", 0.42, coat=0.25),
    "concrete": grain(mat("Concrete", "#7f8388", 0.9), 0.35, 0.35, "#5d6166", 0.3, bricks=True),
    "fender": mat("Fender", "#121416", 0.68),
    "shed": mat("Shed", "#b9c0c6", 0.6),
    "roof": mat("Roof", "#3a4148", 0.55),
    "rope": mat("Rope", "#d9d2c0", 0.8),
    "hill": grain(mat("Hill", "#3b4a44", 0.95), 0.045, 0.4, "#1d2824", 0.8),
    "snow": grain(mat("Snow", "#dde6ee", 0.62), 0.03, 0.25, "#9fb0c0", 0.35),
    "ice": grain(mat("Ice", "#8db7d4", 0.28, trans=0.32, coat=0.45), 0.14, 0.38, "#3a688c", 0.4),
}
_hb = next(n for n in M["hull"].node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
for k in ('Specular IOR Level', 'Specular'):
    if k in _hb.inputs: _hb.inputs[k].default_value = 0.08; break

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
    else:
        for p in o.data.polygons: p.use_smooth = False
    return o

def block(name, sx, sy, sz, loc, m, bevel=0.22, nose=0.0, parent=None, taper=0.0):
    me = bpy.data.meshes.new(name); bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    if nose > 0:
        bmesh.ops.subdivide_edges(bm, edges=[e for e in bm.edges if abs(e.verts[0].co.x - e.verts[1].co.x) > 0.5],
                                  cuts=10, use_grid_fill=True)
    for v in bm.verts:
        x = v.co.x
        if nose > 0 and x > 0.5 - nose:
            t = (x - (0.5 - nose)) / nose
            v.co.y *= max(0.22, math.cos(t * math.pi / 2)) ** 0.55
        if taper:
            v.co.x *= 1 - taper * (v.co.z + 0.5)
        v.co.x *= sx; v.co.y *= sy; v.co.z *= sz
    bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new(name, me); sc.collection.objects.link(o); o.location = loc
    return finish(o, parent or ship, m, bevel)

def tube_curve(name, pts, radius, m, parent, cyclic=False, res=10):
    cu = bpy.data.curves.new(name, 'CURVE')
    cu.dimensions = '3D'
    cu.bevel_depth = radius
    cu.bevel_resolution = res
    cu.use_fill_caps = not cyclic
    sp = cu.splines.new('POLY')
    sp.points.add(len(pts) - 1)
    for idx, p in enumerate(pts):
        sp.points[idx].co = (p[0], p[1], p[2], 1.0)
    sp.use_cyclic_u = cyclic
    o = bpy.data.objects.new(name, cu)
    sc.collection.objects.link(o)
    o.parent = parent
    o.data.materials.append(m)
    return o

def rows(name, n, step, proto_fn, axis=0):
    o = proto_fn()
    ar = o.modifiers.new("Arr", 'ARRAY'); ar.count = n; ar.use_relative_offset = False
    ar.use_constant_offset = True; ar.constant_offset_displace = (step, 0, 0) if axis == 0 else (0, step, 0)
    o.modifiers.move(len(o.modifiers) - 1, 0)
    return o

def build_small_hull(name, loa, beam, draft, freeboard, parent, hull_mat, boot_mat, boot_z=0.18):
    """Lofted deep-V marine hull centered at origin, bow toward +x, with exact horizontal boot-top loop."""
    x0, x1 = -loa / 2, loa / 2
    nu = 56
    z_fracs = [0.0, 0.16, 0.30, 0.44, 0.56, 0.68, 0.80, 0.90, 1.0]
    nz = len(z_fracs) - 1
    me = bpy.data.meshes.new(name); bm = bmesh.new(); verts = {}
    for i in range(nu + 1):
        u = i / nu
        zt = freeboard * (1.0 + 0.32 * (max(0.0, u - 0.50) / 0.50) ** 1.8)
        for side in (-1, 1):
            for j, zf in enumerate(z_fracs):
                if j == 3:
                    z = boot_z
                else:
                    z = -draft + zf * (zt + draft)
                xs = x1 - 0.14 * loa * (1.0 - zf)
                xa = x0 + 0.04 * loa * max(0.0, -z / max(0.1, draft))
                x = xa + u * (xs - xa)
                # Deep-V hull section with hard chine near zf=0.44
                hb = (beam / 2) * (0.28 + 0.72 * min(1.0, zf / 0.72) ** 0.48)
                if u > 0.48:
                    t = (u - 0.48) / 0.52
                    flare = 1.0 + 0.14 * zf * (1.0 - t * 0.5)
                    hb *= max(0.0, 1.0 - t ** 1.75) ** 0.62 * flare
                elif u < 0.16:
                    t = (0.16 - u) / 0.16
                    hb *= 1.0 - 0.12 * t * t
                verts[(i, side, j)] = bm.verts.new((x, side * hb, z))
    for i in range(nu):
        for side in (-1, 1):
            for j in range(nz):
                q = [verts[(i, side, j)], verts[(i+1, side, j)], verts[(i+1, side, j+1)], verts[(i, side, j+1)]]
                bm.faces.new(q if side > 0 else q[::-1])
        bm.faces.new([verts[(i, 1, 0)], verts[(i+1, 1, 0)], verts[(i+1, -1, 0)], verts[(i, -1, 0)]])
    bm.faces.new([verts[(0, -1, j)] for j in range(nz + 1)] + [verts[(0, 1, j)] for j in range(nz, -1, -1)])
    bm.faces.new([verts[(i, -1, nz)] for i in range(nu + 1)] + [verts[(i, 1, nz)] for i in range(nu, -1, -1)][1:-1])
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.008)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    for f in bm.faces:
        f.material_index = 1 if f.calc_center_median().z < boot_z else 0
    bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new(name, me); sc.collection.objects.link(o)
    return finish(o, parent, [hull_mat, boot_mat], 0.0)

def build_expedition_ship():
    STEM_RAKE = math.tan(math.radians(27))
    STEM_TOP = DECK + 3.2
    def stem_x(z):
        x0 = X1 - STEM_TOP * STEM_RAKE
        return x0 + z * STEM_RAKE if z >= 0 else x0 + z * 0.45
    def stern_x(z):
        return X0 + max(0.0, -1.0 - z) * 3.2
    def half_breadth(x, z):
        hb = BEAM / 2
        r = 3.0; zb = -DRAFT + r
        if z < zb:
            dz = zb - z; hb = hb - r + math.sqrt(max(0.0, r*r - dz*dz))
        xs = 18.0
        if x > xs:
            t = min(1.0, (x - xs) / max(1e-3, stem_x(z) - xs))
            fine = 1.0 + 0.6 * max(0.0, -z) / DRAFT
            hb *= max(0.0, 1 - t ** 2.0) ** (0.5 * fine)
        xa = X0 + 22.0
        if x < xa:
            t = (xa - x) / 22.0
            hb *= 1 - 0.10 * t * t - 0.25 * t * t * max(0.0, -z) / DRAFT
        return hb
    def sheer(x):
        t = max(0.0, (x - 10) / (X1 - 10)); return DECK + 3.2 * t * t

    BOOT_TOP_Z = 0.85
    NU, NZ = 120, 22
    me = bpy.data.meshes.new("HULL"); bm = bmesh.new(); verts = {}
    for i in range(NU + 1):
        u = i / NU
        zt = sheer(stern_x(-DRAFT) + u * (X1 - X0))
        for side in (-1, 1):
            for j in range(NZ + 1):
                zf = j / NZ
                if j == 9:
                    z = BOOT_TOP_Z
                elif j < 9:
                    z = -DRAFT + (j / 9.0) * (BOOT_TOP_Z + DRAFT)
                else:
                    z = BOOT_TOP_Z + ((j - 9) / (NZ - 9.0)) * (zt - BOOT_TOP_Z)
                x = stern_x(z) + u * (stem_x(z) - stern_x(z))
                y = side * half_breadth(x, z)
                verts[(i, side, j)] = bm.verts.new((x, y, z))
    for i in range(NU):
        for side in (-1, 1):
            for j in range(NZ):
                q = [verts[(i, side, j)], verts[(i+1, side, j)], verts[(i+1, side, j+1)], verts[(i, side, j+1)]]
                bm.faces.new(q if side > 0 else q[::-1])
        q = [verts[(i, -1, 0)], verts[(i+1, -1, 0)], verts[(i+1, 1, 0)], verts[(i, 1, 0)]]
        bm.faces.new(q[::-1])
    bm.faces.new([verts[(0, -1, j)] for j in range(NZ + 1)] + [verts[(0, 1, j)] for j in range(NZ, -1, -1)])
    bm.faces.new([verts[(i, -1, NZ)] for i in range(NU + 1)] + [verts[(i, 1, NZ)] for i in range(NU, -1, -1)][1:-1])
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.02)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    for f in bm.faces:
        f.material_index = 1 if f.calc_center_median().z < BOOT_TOP_Z else 0
    bm.to_mesh(me); bm.free()
    hull = bpy.data.objects.new("HULL", me); sc.collection.objects.link(hull)
    finish(hull, ship, [M["hull"], M["boot"]], 0.0)

    # Flush superstructure decks D1..D5 (no protruding lower-hull studs)
    H5 = 2.9; XF = 36.0
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
            y = side * (wd/2 + 0.015)
            if kind == "balc":
                block(f"{name}R{side}", L*0.70, 0.14, 1.9, (cx - L*0.06, y, z0 + 1.45), M["dark"], 0.03)
                block(f"{name}G{side}", L*0.70, 0.08, 0.9, (cx - L*0.06, side*(wd/2 + 0.12), z0 + 0.85), M["rail"], 0.02)
            else:
                rows(f"{name}W{side}", n, 2.6, lambda: block(f"{name}w{side}", 1.8, 0.06, 1.2 if kind == "win" else 1.5,
                     (xa + 3.0, y, z0 + h*0.55), M["glass"], 0.03))
        if kind != "bridge":
            block(f"{name}FW", 0.12, wd*0.55, h*0.36, (xf + 0.02, 0, z0 + h*0.58), M["glass"], 0.04)
    ZB = DECK + 4*H5 + H5*0.58
    block("BRIDGEFW", 0.35, BEAM - 0.7, 1.35, (XF - 0.05, 0, ZB), M["glass"], 0.06)
    for side in (-1, 1):
        block(f"BRIDGESW{side}", 9.0, 0.15, 1.35, (XF - 4.6, side*((BEAM - 0.9)/2 + 0.03), ZB), M["glass"], 0.05)
    block("WINGS", 3.0, BEAM - 0.2, 0.5, (XF - 7.0, 0, DECK + 4*H5 + 0.5), M["white"], 0.12)
    block("OBS", 26, BEAM - 6, 2.4, (10, 0, DECK + 5*H5 + 1.2), M["white"], 0.15, nose=0.08)
    rows("OBSW-1", 9, 2.8, lambda: block("obsw-1", 2.0, 0.06, 1.2, (-0.5, -(BEAM-6)/2 - 0.02, DECK + 5*H5 + 1.3), M["glass"], 0.03))
    block("OBSFW", 0.12, (BEAM-6)*0.8, 1.4, (22.9, 0, DECK + 5*H5 + 1.3), M["glass"], 0.04)
    block("MAST", 0.7, 0.7, 6.0, (17, 0, DECK + 5*H5 + 5.2), M["white"], 0.1)
    block("YARD", 0.5, 5.0, 0.4, (17, 0, DECK + 5*H5 + 7.0), M["white"], 0.1)
    block("RADAR", 3.6, 0.5, 0.3, (17.3, 0, DECK + 5*H5 + 8.4), M["dark"], 0.1)
    block("FUNNEL", 8.0, 5.5, 5.0, (-24, 0, DECK + 4*H5 + 2.5), M["white"], 0.9, nose=0.35, taper=0.2)
    block("FUNTOP", 6.4, 5.2, 0.9, (-24.8, 0, DECK + 4*H5 + 5.3), M["funtop"], 0.3, nose=0.35)
    for side in (-1, 1):
        block(f"RECESS{side}", 22, 0.5, 3.0, (-35, side*(BEAM/2 - 0.5), DECK + H5 + 1.5), M["funtop"], 0.05)
        for k in range(2):
            block(f"BOAT{side}{k}", 8.0, 2.4, 2.0, (-40 + k*10.0, side*(BEAM/2 - 1.6), DECK + H5 + 1.3),
                  M["orange"], 0.6, nose=0.3)
    for side in (-1, 1):
        block(f"AFTRAIL{side}", 24, 0.10, 1.0, (X0 + 13, side*(BEAM/2 - 0.3), DECK + 0.5), M["rail"], 0.02)
    block("AFTRAILX", 0.10, BEAM - 0.8, 1.0, (X0 + 1.2, 0, DECK + 0.5), M["rail"], 0.02)
    block("CRANE", 0.8, 0.8, 5.0, (X0 + 8, -6, DECK + 2.5), M["orange"], 0.1)
    block("JIB", 9.0, 0.5, 0.5, (X0 + 12, -6, DECK + 4.8), M["orange"], 0.1)
    block("ZODIACS", 10, 6, 0.9, (X0 + 14, 3, DECK + 0.45), M["dark"], 0.4)
    return hull, sheer

def build_quay(sheer, with_lines=True):
    QY = BEAM / 2 + 4.9
    block("QUAY", 520, 260, 6.0, (0, QY + 130, 0.0), M["concrete"], 0.3, parent=world_root)
    block("FENDERS", 470, 0.5, 1.4, (0, QY - 0.25, 2.0), M["fender"], 0.2, parent=world_root)
    for k, fx in enumerate((-58, -30, -2, 26, 52)):
        bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=(QY - BEAM/2)/2, depth=4.2,
                                            location=(fx, (QY + BEAM/2)/2, 0.7), rotation=(0, math.pi/2, 0))
        fo = bpy.context.object; fo.name = f"YOKO{k}"; finish(fo, world_root, M["fender"], 0.0)
    rows("BOLL", 12, 22.0, lambda: block("bollard", 0.7, 0.7, 0.9, (-121, QY + 2.0, 3.45), M["dark"], 0.3, parent=world_root))
    if with_lines:
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
    rows("LAMP", 6, 40.0, lambda: block("lamp", 0.35, 0.35, 12, (-100, QY + 18, 9.0), M["dark"], 0.05, parent=world_root))

def build_fjord(qy_offset=17.15):
    """Fjord mountain ranges rooted below z=0 (-6 m) so they meet the water plane seamlessly with zero gap."""
    def hills(name, y0, depth, peak, seed, xspan=7200, snow=380):
        random.seed(seed); nx, ny = 160, 44
        me = bpy.data.meshes.new(name); bm = bmesh.new(); vv = []
        waves = [(random.uniform(0.0015, 0.0055), random.uniform(0, 6.28), random.uniform(0.3, 1.0)) for _ in range(6)]
        for j in range(ny + 1):
            row = []
            for i in range(nx + 1):
                x = -xspan/2 + xspan * i / nx; t = j / ny
                n = sum(a * math.sin(x * f + p + t * 3.1) for f, p, a in waves) / 3.0
                z = -6.0 + (peak + 6.0) * math.sin(t * math.pi / 1.55) ** 1.15 * (0.68 + 0.32 * n)
                row.append(bm.verts.new((x, y0 + depth * t, z)))
            vv.append(row)
        for j in range(ny):
            for i in range(nx):
                f = bm.faces.new([vv[j][i], vv[j][i+1], vv[j+1][i+1], vv[j+1][i]])
                f.material_index = 1 if f.calc_center_median().z > snow else 0
        bm.to_mesh(me); bm.free()
        o = bpy.data.objects.new(name, me); sc.collection.objects.link(o)
        finish(o, world_root, [M["hill"], M["snow"]], 0.0)
    hills("FJORD_NEAR", qy_offset + 240, 1450, 240, 3, snow=185)
    hills("FJORD_FAR", qy_offset + 1650, 2600, 640, 11, 9600, snow=350)
    for o in sc.objects:
        if o.name == "FJORD_FAR": o.data.materials[0] = mat("HillFar", "#71869a", 0.95)

def build_harbour_launch():
    """13,8 x 4,2 m Nordic port-agent pilot launch with continuous tubular D-fender and flush glazing."""
    loa, beam, draft, fb = 13.8, 4.2, 1.25, 1.55
    h = build_small_hull("LAUNCH_HULL", loa, beam, draft, fb, craft, M["navy_hull"], M["boot"], boot_z=0.16)
    # Continuous curved rubber D-fender around the gunwale perimeter
    collar_pts = []
    for k in range(33):
        ang = -math.pi + (2 * math.pi * k / 32)
        u = (math.cos(ang) + 1.0) / 2.0
        x = -loa * 0.49 + u * loa * 0.98
        side = 1 if math.sin(ang) >= 0 else -1
        hb = (beam / 2) * (1.0 if u <= 0.48 else max(0.06, (1.0 - ((u - 0.48) / 0.52) ** 1.75) ** 0.62))
        if u < 0.16:
            hb *= 1.0 - 0.12 * ((0.16 - u) / 0.16) ** 2
        z = fb * (1.0 + 0.30 * (max(0.0, u - 0.50) / 0.50) ** 1.8) - 0.08
        collar_pts.append((x, side * hb * abs(math.sin(ang)) ** 0.15 if 0 < k < 32 and k != 16 else (x, 0.0, z)[1], z))
    # Build clean port + starboard gunwale fender tubes meeting at bow and transom
    fender_loop = []
    for i in range(25):
        u = i / 24.0
        x = -loa * 0.47 + u * loa * 0.93
        hb = (beam / 2 + 0.06) * (1.0 if u <= 0.48 else max(0.04, (1.0 - ((u - 0.48) / 0.52) ** 1.75) ** 0.62))
        if u < 0.16: hb *= 1.0 - 0.12 * ((0.16 - u) / 0.16) ** 2
        z = fb * (1.0 + 0.30 * (max(0.0, u - 0.50) / 0.50) ** 1.8) - 0.08
        fender_loop.append((x, -hb, z))
    for i in range(24, -1, -1):
        x, yn, z = fender_loop[i]
        fender_loop.append((x, -yn, z))
    tube_curve("LAUNCH_FENDER", fender_loop, 0.19, M["fender"], craft, cyclic=True)
    # Signal orange bow fender wrap
    bow_pts = [p for p in fender_loop if p[0] > loa * 0.24]
    if len(bow_pts) >= 4:
        tube_curve("LAUNCH_BOW_BAND", bow_pts, 0.205, M["orange"], craft, cyclic=False)

    # Recessed non-skid work deck
    block("LAUNCH_DECK", 12.2, 3.65, 0.22, (-0.3, 0.0, fb - 0.08), M["dark"], 0.08, nose=0.38, parent=craft)
    # Coaming plinth
    block("LAUNCH_COAMING", 6.2, 2.95, 0.42, (0.3, 0.0, fb + 0.22), M["white"], 0.10, nose=0.28, parent=craft)
    # Sleek aluminum wheelhouse with flush dark glazing band
    block("LAUNCH_CABIN_LOW", 5.6, 2.76, 0.82, (0.35, 0.0, fb + 0.72), M["white"], 0.12, nose=0.26, taper=0.06, parent=craft)
    block("LAUNCH_GLASS_CORE", 5.38, 2.66, 0.66, (0.42, 0.0, fb + 1.34), M["glass"], 0.04, nose=0.26, taper=0.08, parent=craft)
    block("LAUNCH_ROOF", 5.85, 2.86, 0.20, (0.25, 0.0, fb + 1.74), M["white"], 0.08, nose=0.26, parent=craft)
    block("LAUNCH_VISOR", 0.65, 2.60, 0.14, (3.05, 0.0, fb + 1.70), M["orange"], 0.05, nose=0.35, parent=craft)
    # Window mullions (flush with cabin walls)
    for mx in (-1.6, -0.3, 1.0, 2.1):
        for side in (-1, 1):
            block(f"LAUNCH_MUL_{mx}_{side}", 0.12, 0.06, 0.68, (mx, side * 1.32, fb + 1.34), M["white"], 0.02, parent=craft)
    # Foredeck & roof safety grab rails (tubular stainless steel)
    for side in (-1, 1):
        tube_curve(f"LAUNCH_FRAIL{side}", [
            (2.8, side * 1.35, fb + 0.1), (2.8, side * 1.35, fb + 0.72),
            (5.1, side * 0.65, fb + 0.98), (5.1, side * 0.65, fb + 0.35)
        ], 0.035, M["steel"], craft)
        tube_curve(f"LAUNCH_RRAIL{side}", [
            (-2.1, side * 1.15, fb + 1.82), (-2.1, side * 1.15, fb + 2.02),
            (2.4, side * 1.05, fb + 2.02), (2.4, side * 1.05, fb + 1.82)
        ], 0.03, M["steel"], craft)
    # Tripod radar mast & open-array scanner
    tube_curve("LAUNCH_MAST_MAIN", [(-0.4, 0.0, fb + 1.82), (-0.7, 0.0, fb + 3.15)], 0.07, M["white"], craft)
    for side in (-1, 1):
        tube_curve(f"LAUNCH_MAST_LEG{side}", [(-1.1, side * 0.55, fb + 1.82), (-0.65, 0.0, fb + 2.95)], 0.04, M["white"], craft)
    block("LAUNCH_RADAR_PED", 0.38, 0.38, 0.26, (-0.7, 0.0, fb + 3.25), M["white"], 0.06, parent=craft)
    block("LAUNCH_RADAR_BAR", 0.24, 1.45, 0.14, (-0.68, 0.0, fb + 3.45), M["white"], 0.05, parent=craft)
    return h

def build_ship_tender():
    """9,8 x 3,4 m streamlined expedition ship tender with flush panoramic glazing."""
    loa, beam, draft, fb = 9.8, 3.4, 0.90, 1.28
    h = build_small_hull("TENDER_HULL", loa, beam, draft, fb, craft, M["boat"], M["dark"], boot_z=0.14)
    fender_loop = []
    for i in range(25):
        u = i / 24.0
        x = -loa * 0.47 + u * loa * 0.93
        hb = (beam / 2 + 0.05) * (1.0 if u <= 0.48 else max(0.04, (1.0 - ((u - 0.48) / 0.52) ** 1.75) ** 0.62))
        if u < 0.16: hb *= 1.0 - 0.12 * ((0.16 - u) / 0.16) ** 2
        z = fb * (1.0 + 0.30 * (max(0.0, u - 0.50) / 0.50) ** 1.8) - 0.06
        fender_loop.append((x, -hb, z))
    for i in range(24, -1, -1):
        x, yn, z = fender_loop[i]
        fender_loop.append((x, -yn, z))
    tube_curve("TENDER_FENDER", fender_loop, 0.15, M["fender"], craft, cyclic=True)

    block("TENDER_DECK", 8.8, 2.95, 0.18, (-0.1, 0.0, fb - 0.05), M["dark"], 0.06, nose=0.35, parent=craft)
    # Low-profile limousine tender cabin: white lower skirt, flush continuous dark glass core, signal orange roof cap
    block("TENDER_CABIN_BASE", 5.8, 2.68, 0.52, (-0.35, 0.0, fb + 0.28), M["white"], 0.12, nose=0.28, taper=0.06, parent=craft)
    block("TENDER_GLASS_BAND", 5.55, 2.58, 0.54, (-0.32, 0.0, fb + 0.74), M["glass"], 0.04, nose=0.28, taper=0.10, parent=craft)
    block("TENDER_ROOF_WHITE", 5.70, 2.64, 0.16, (-0.38, 0.0, fb + 1.08), M["white"], 0.08, nose=0.28, parent=craft)
    block("TENDER_ROOF_CAP", 5.20, 2.35, 0.14, (-0.42, 0.0, fb + 1.20), M["orange"], 0.08, nose=0.28, parent=craft)
    for mx in (-2.2, -1.0, 0.2, 1.4):
        for side in (-1, 1):
            block(f"TENDER_MUL_{mx}_{side}", 0.10, 0.05, 0.56, (mx, side * 1.28, fb + 0.74), M["white"], 0.02, parent=craft)
    # Forward boarding well & stainless boarding handrails
    block("TENDER_BOW_WELL", 1.85, 1.95, 0.36, (3.15, 0.0, fb + 0.16), M["dark"], 0.08, nose=0.35, parent=craft)
    for side in (-1, 1):
        tube_curve(f"TENDER_RAIL{side}", [
            (2.3, side * 1.05, fb + 0.25), (2.3, side * 1.05, fb + 0.82),
            (4.0, side * 0.55, fb + 0.92), (4.0, side * 0.55, fb + 0.35)
        ], 0.03, M["steel"], craft)
    bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.34, depth=0.24, location=(0.6, 0.0, fb + 1.36))
    rd = bpy.context.object; rd.name = "TENDER_RADOME"; finish(rd, craft, M["white"], 0.06)
    return h

def build_tour_boat():
    """10,6 x 3,5 m offshore RIB tour boat with tubular hypalon collar, saddle seats, twin outboards & tubular A-frame arch (zero pawn figures)."""
    loa, beam, draft, fb = 10.6, 3.5, 0.72, 0.96
    h = build_small_hull("RIB_HULL", loa, beam, draft, fb, craft, M["navy_hull"], M["dark"], boot_z=0.10)
    # Authentic cylindrical hypalon collar tube wrapping the gunwales to a raised bow nose
    rib_loop = []
    for i in range(29):
        u = i / 28.0
        x = -loa * 0.46 + u * loa * 0.94
        hb = (beam / 2 - 0.12) * (1.0 if u <= 0.46 else max(0.05, (1.0 - ((u - 0.46) / 0.54) ** 1.7) ** 0.60))
        z = fb * (0.94 + 0.36 * (max(0.0, u - 0.48) / 0.52) ** 1.75)
        rib_loop.append((x, -hb, z))
    for i in range(28, -1, -1):
        x, yn, z = rib_loop[i]
        rib_loop.append((x, -yn, z))
    tube_curve("RIB_SPONSON_TUBE", rib_loop, 0.42, M["sponson"], craft, cyclic=False, res=14)
    # Outer rubbing strake & signal-orange bow wear patch tube
    tube_curve("RIB_RUB_STRAKE", rib_loop, 0.435 if False else 0.12, M["fender"], craft, cyclic=False)
    bow_collar = [p for p in rib_loop if p[0] > loa * 0.25]
    if len(bow_collar) >= 4:
        tube_curve("RIB_BOW_COLLAR", bow_collar, 0.435, M["orange"], craft, cyclic=False, res=12)

    # Non-skid cockpit sole
    block("RIB_FLOOR", 8.4, 2.35, 0.16, (-0.35, 0.0, fb - 0.12), M["dark"], 0.05, nose=0.30, parent=craft)
    # Center helm console with flush acrylic windshield and stainless grab rail
    block("RIB_CONSOLE", 1.25, 1.12, 1.05, (1.15, 0.0, fb + 0.42), M["dark"], 0.10, nose=0.22, taper=0.12, parent=craft)
    block("RIB_WINDSHIELD", 0.65, 0.98, 0.48, (1.28, 0.0, fb + 1.05), M["glass"], 0.04, nose=0.20, taper=0.18, parent=craft)
    tube_curve("RIB_CONSOLE_RAIL", [
        (0.75, -0.54, fb + 0.85), (1.55, -0.48, fb + 1.34),
        (1.55, 0.48, fb + 1.34), (0.75, 0.54, fb + 0.85)
    ], 0.026, M["steel"], craft)

    # 8 contoured marine jockey/saddle seats with backrest bolsters (no primitive pawn spheres)
    for rx, pairs in ((2.65, (-0.48, 0.48)), (-0.25, (-0.56, 0.56)), (-1.55, (-0.56, 0.56)), (-2.85, (-0.56, 0.56))):
        for py in pairs:
            block(f"RIB_SEAT_{rx}_{py}", 0.68, 0.44, 0.46, (rx, py, fb + 0.16), M["dark"], 0.08, parent=craft)
            block(f"RIB_PAD_{rx}_{py}", 0.58, 0.40, 0.10, (rx + 0.03, py, fb + 0.42), M["sponson"], 0.05, parent=craft)
            block(f"RIB_BACK_{rx}_{py}", 0.12, 0.40, 0.34, (rx - 0.26, py, fb + 0.56), M["orange"] if rx > 2.0 else M["dark"], 0.05, parent=craft)

    # Tubular stainless A-frame radar arch at the stern (never a solid wall)
    for side in (-1, 1):
        tube_curve(f"RIB_ARCH_FWD_{side}", [
            (-3.75, side * 1.18, fb + 0.25), (-3.95, side * 1.02, fb + 1.75), (-3.95, 0.0, fb + 1.82)
        ], 0.048, M["steel"], craft)
        tube_curve(f"RIB_ARCH_AFT_{side}", [
            (-4.35, side * 1.14, fb + 0.25), (-4.05, side * 1.00, fb + 1.75), (-4.05, 0.0, fb + 1.82)
        ], 0.042, M["steel"], craft)
    block("RIB_NAV_POD", 0.32, 0.64, 0.12, (-4.0, 0.0, fb + 1.90), M["white"], 0.04, parent=craft)

    # Twin outboard engines on the transom
    for side in (-1, 1):
        block(f"RIB_OB_COWL_{side}", 0.72, 0.46, 0.68, (-4.95, side * 0.52, fb + 0.35), M["dark"], 0.12, nose=0.25, parent=craft)
        block(f"RIB_OB_LEG_{side}", 0.36, 0.18, 0.95, (-4.90, side * 0.52, fb - 0.35), M["dark"], 0.05, parent=craft)
    return h

def build_iceberg(loc=(-10.0, 32.0, -2.5)):
    """Flat-faceted calved glacial iceberg prop for beat 5 (planar bisect cliffs, sharp ridges, zero smooth sphere dome)."""
    random.seed(23)
    me = bpy.data.meshes.new("ICEBERG"); bm = bmesh.new()
    bmesh.ops.create_icosphere(bm, subdivisions=4, radius=1.0)
    for v in bm.verts:
        nx, ny, nz = v.co.x, v.co.y, v.co.z
        ang = math.atan2(ny, nx)
        rad = math.hypot(nx, ny)
        # Angular faceted spire and tabular shoulder profile
        lobe = (
            0.28 * math.cos(ang * 3.0 + 0.4)
            + 0.18 * math.sin(ang * 5.0 - 1.1)
            + 0.12 * math.cos(ang * 8.0 + nz * 4.0)
        )
        facet = abs(math.sin(nx * 3.8 + ny * 2.4)) - 0.45 * abs(math.cos(ny * 4.6 - nz * 3.2))
        x = nx * 18.0 * (1.0 + 0.25 * lobe + 0.10 * facet)
        y = ny * 11.5 * (1.0 + 0.22 * lobe - 0.08 * facet)
        if nz < -0.10:
            z = -3.0
        else:
            u = (nz + 0.10) / 1.10
            # Tabular plateau on positive x, sharp pinnacle ridge on negative x
            spire = 1.32 if nx < 0.05 else 0.74
            z = (u ** 0.62) * 14.5 * spire + 2.2 * facet * u
            # Waterline wave-cut erosion notch around z = 0.2..1.3 m
            if 0.0 < z < 1.5:
                notch = 0.86 + 0.14 * abs(z - 0.75) / 0.75
                x *= notch; y *= notch
        v.co = Vector((x, y, z))

    # Calving fracture planes: bisect and displace along planar shear surfaces
    for co, no in (
        ((6.5, -4.2, 5.0), (0.78, -0.58, 0.22)),
        ((-7.5, -3.8, 6.2), (-0.72, -0.64, 0.26)),
        ((1.5, -5.8, 7.5), (0.15, -0.92, 0.35)),
        ((-3.0, 4.5, 9.8), (-0.20, 0.35, 0.91)),
    ):
        geom = bm.verts[:] + bm.edges[:] + bm.faces[:]
        bmesh.ops.bisect_plane(bm, geom=geom, dist=0.01, plane_co=co, plane_no=no, clear_outer=False, clear_inner=False)
        pno = Vector(no).normalized(); pco = Vector(co)
        for v in bm.verts:
            d = (v.co - pco).dot(pno)
            if d > 0:
                v.co -= pno * (d * 0.58)

    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    for f in bm.faces:
        c = f.calc_center_median()
        # Snow on upper tabular ledges and gentle slopes; glacial blue ice on steep sheer cliffs and waterline
        f.material_index = 1 if (c.z > 2.4 and f.normal.z > 0.48) else 0
    bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new("ICEBERG", me); sc.collection.objects.link(o); o.location = loc
    # smooth=False keeps the crystalline planar calving facets sharp
    return finish(o, world_root, [M["ice"], M["snow"]], 0.0, smooth=False)

# ---------- Scene setup per beat ----------
hull, sheer = build_expedition_ship()
portrait = H > W
travel_obj = ship
travel_m = 0.0
vessel_type = "expedition_cruise"
segment = "cruise"
props = []
hull_meta = {"loa_m": 150.0, "beam_m": 24.5, "l_over_b": 6.16}

if BEAT == "b00":
    # Hero: 150 m expedition ship moored at the quay (G1 rev 5 exact framing)
    build_quay(sheer, with_lines=True)
    build_fjord(BEAM / 2 + 4.9)
    travel_m = 0.0
    dist = 150.0 * (2.9 if portrait else 1.55)
    tgt = Vector((10.0, 0.0, 16.0))
    dirv = Vector((0.50, -0.86, 0.065)).normalized()
elif BEAT == "b01":
    # Beat 1: Ship in profile under way along the fjord coast
    build_fjord(110.0)
    travel_m = 48.0
    dist = 150.0 * (2.65 if portrait else 1.38)
    tgt = Vector((4.0, 0.0, 14.0))
    dirv = Vector((0.14, -0.985, 0.055)).normalized()
elif BEAT == "b02":
    # Beat 2: High-angle / top-down three-quarter ship under way with wake
    build_fjord(180.0)
    travel_m = 56.0
    dist = 150.0 * (2.35 if portrait else 1.45)
    tgt = Vector((0.0, 0.0, 8.0))
    dirv = Vector((0.36, -0.68, 0.63)).normalized()
elif BEAT == "b03":
    # Beat 3: Harbour launch approaching the raked bow of the moored expedition ship at the quay
    build_quay(sheer, with_lines=True)
    build_fjord(BEAM / 2 + 4.9)
    build_harbour_launch()
    craft.location = (72.0, -22.0, 0.0)
    craft.rotation_euler = (0.0, 0.0, math.radians(14.0))
    travel_obj = craft
    travel_m = 18.0
    vessel_type = "harbour_launch"
    segment = "port_agent"
    hull_meta = {"loa_m": 13.8, "beam_m": 4.2, "l_over_b": 3.29}
    dist = 58.0 * (1.55 if portrait else 1.0)
    tgt = Vector((64.0, -10.0, 5.8))
    dirv = Vector((0.68, -0.73, 0.072)).normalized()
elif BEAT == "b04":
    # Beat 4: Ship's tender heading toward shore with the anchored expedition ship out in the fjord bay
    build_fjord(195.0)
    ship.location = (-58.0, 125.0, 0.0)
    ship.rotation_euler = (0.0, 0.0, math.radians(-24.0))
    build_ship_tender()
    craft.location = (4.0, 0.0, 0.0)
    craft.rotation_euler = (0.0, 0.0, math.radians(-10.0))
    travel_obj = craft
    travel_m = 16.0
    vessel_type = "ship_tender"
    segment = "dmc"
    hull_meta = {"loa_m": 9.8, "beam_m": 3.4, "l_over_b": 2.88}
    dist = 38.0 * (1.55 if portrait else 1.0)
    tgt = Vector((0.0, 10.0, 4.0))
    dirv = Vector((0.52, -0.85, 0.072)).normalized()
elif BEAT == "b05":
    # Beat 5: Offshore RIB tour boat cruising past a sculpted flat-faceted glacial iceberg
    for o in [o for o in sc.objects if o.parent is ship]:
        o.hide_render = True; o.visible_camera = False
    build_fjord(175.0)
    build_iceberg(loc=(-8.0, 28.0, -2.5))
    build_tour_boat()
    craft.location = (0.0, 0.0, 0.0)
    travel_obj = craft
    travel_m = 16.0
    vessel_type = "tour_boat"
    segment = "tour_operator"
    props = ["iceberg"]
    hull_meta = {"loa_m": 10.6, "beam_m": 3.5, "l_over_b": 3.03}
    dist = 48.0 * (1.55 if portrait else 1.0)
    tgt = Vector((-2.5, 11.5, 4.6))
    dirv = Vector((-0.46, -0.88, 0.072)).normalized()
elif BEAT == "b06":
    # Beat 6: Expedition ship departs, stern three-quarter and wake
    build_quay(sheer, with_lines=False)
    build_fjord(BEAM / 2 + 4.9)
    travel_m = 52.0
    dist = 150.0 * (2.6 if portrait else 1.42)
    tgt = Vector((-12.0, 0.0, 14.0))
    dirv = Vector((-0.62, -0.77, 0.12)).normalized()
else:
    raise ValueError(f"Unknown beat: {BEAT}")

bpy.ops.mesh.primitive_plane_add(size=4000, location=(0, 0, 0))
sea = bpy.context.object; sea.name = "SEA"

def sun(name, src, col, en, ang):
    d = bpy.data.lights.new(name, 'SUN'); d.color = col; d.energy = en; d.angle = math.radians(ang)
    o = bpy.data.objects.new(name, d); sc.collection.objects.link(o)
    o.rotation_euler = (-Vector(src)).normalized().to_track_quat('-Z', 'Y').to_euler()
    return o

lights = [
    sun("KEY", (-0.55, -1.0, 1.05), (1, 0.97, 0.93), 4.5, 0.6),
    sun("RIM", (-1.0, 1.0, 0.16), lin("#f3d9b0"), 2.6, 0.9),
    sun("COLD", (1.0, 0.55, 0.30), lin("#4f7db8"), 3.0, 2.0),
]

w = bpy.data.worlds.new("W"); sc.world = w; w.use_nodes = True
bg = next(n for n in w.node_tree.nodes if n.type == 'BACKGROUND')
bg.inputs['Color'].default_value = (*lin("#5b7690"), 1); bg.inputs['Strength'].default_value = 0.45
wt = w.node_tree; out_bg = next(n for n in wt.nodes if n.type == 'OUTPUT_WORLD')
sky = wt.nodes.new('ShaderNodeBackground'); sky.inputs['Strength'].default_value = 1.0
stc = wt.nodes.new('ShaderNodeTexCoord'); ssep = wt.nodes.new('ShaderNodeSeparateXYZ')
scr = wt.nodes.new('ShaderNodeValToRGB'); el = scr.color_ramp.elements
el[0].position = 0.0; el[0].color = (*lin("#c3ccd2"), 1)
el[1].position = 0.32; el[1].color = (*lin("#3f5f80"), 1)
mid = el.new(0.09); mid.color = (*lin("#93a9bb"), 1)
wt.links.new(stc.outputs['Generated'], ssep.inputs['Vector']); wt.links.new(ssep.outputs['Z'], scr.inputs['Fac'])
wt.links.new(scr.outputs['Color'], sky.inputs['Color'])
lp = wt.nodes.new('ShaderNodeLightPath'); msh = wt.nodes.new('ShaderNodeMixShader')
wt.links.new(lp.outputs['Is Camera Ray'], msh.inputs['Fac']); wt.links.new(bg.outputs[0], msh.inputs[1])
wt.links.new(sky.outputs[0], msh.inputs[2]); wt.links.new(msh.outputs[0], out_bg.inputs['Surface'])

cam = bpy.data.objects.new("CAM", bpy.data.cameras.new("CAM")); sc.collection.objects.link(cam); sc.camera = cam
cd = cam.data; cd.lens = 50; cd.sensor_width = 36; cd.sensor_fit = 'HORIZONTAL' if not portrait else 'VERTICAL'
cd.sensor_height = 36 if portrait else 24
cam.location = tgt + dirv * dist
cam.rotation_euler = (tgt - cam.location).to_track_quat('-Z', 'Y').to_euler()
cd.dof.use_dof = True; cd.dof.focus_distance = (tgt - cam.location).length; cd.dof.aperture_fstop = 4.0
cd.clip_end = 12000

r = sc.render; r.resolution_x, r.resolution_y = W, H; r.resolution_percentage = 100
r.film_transparent = False; r.image_settings.file_format = 'PNG'; r.image_settings.color_mode = 'RGBA'
r.use_persistent_data = True
looks = [i.identifier for i in sc.view_settings.bl_rna.properties['look'].enum_items_static]
sc.view_settings.view_transform = 'AgX'
sc.view_settings.look = 'AgX - Medium High Contrast' if 'AgX - Medium High Contrast' in looks else 'None'
r.engine = 'CYCLES'
cy = sc.cycles; cy.samples = SAMPLES; cy.use_denoising = True; cy.device = 'GPU'
cy.use_adaptive_sampling = True; cy.adaptive_threshold = 0.03
try:
    pr = bpy.context.preferences.addons['cycles'].preferences
    pr.compute_device_type = 'METAL'; pr.get_devices()
    for d in pr.devices: d.use = True
except Exception as ex:
    print("gpu", ex)

meshes = [o for o in sc.objects if o.type in ('MESH', 'CURVE') and o is not sea and not o.hide_render]
ts = {}
sc.frame_start = 1; sc.frame_end = NF
base_x = travel_obj.location.x - travel_m / 2
if NF > 1:
    for f in range(1, NF + 1):
        travel_obj.location.x = base_x + travel_m * (f - 1) / (NF - 1)
        travel_obj.keyframe_insert("location", index=0, frame=f)

def go(name):
    if NF > 1:
        r.filepath = f"{OUT}/{name}_"; bpy.ops.render.render(animation=True)
    else:
        r.filepath = f"{OUT}/{name}_0001.png"; bpy.ops.render.render(write_still=True)

sea.is_holdout = True; sea.is_shadow_catcher = False
t = time.time(); go("plate"); ts["plate"] = (time.time() - t) / NF
sea.is_holdout = False; sea.is_shadow_catcher = True; r.film_transparent = True
for o in meshes:
    o.visible_camera = False
    if o.name in ("FJORD_NEAR", "FJORD_FAR", "QUAY", "SHED", "SHEDROOF"):
        o.hide_render = True
for o in lights: o.hide_render = True
sun("CONTACT", (-0.15, -0.2, 1.0), (1, 1, 1), 4.0, 12.0)
cy.samples = max(12, SAMPLES // 2)
r.resolution_percentage = 50
t = time.time(); go("shadow"); ts["contactPass"] = (time.time() - t) / NF

json.dump({
    "beat": BEAT,
    "position": [round(v, 3) for v in cam.location],
    "target": [round(v, 3) for v in tgt],
    "lens_mm": cd.lens,
    "sensor_mm": 36,
    "sensor_fit": cd.sensor_fit,
    "focus_m": round(cd.dof.focus_distance, 3),
    "fstop": cd.dof.aperture_fstop,
    "width": W,
    "height": H,
    "z_up": True,
    "frames": NF,
    "ship_x": [round(base_x + travel_m * i / max(1, NF - 1), 3) for i in range(NF)],
    "secs": {k: round(v, 2) for k, v in ts.items()},
    "vessel_type": vessel_type,
    "segment": segment,
    "props": props,
    "hull": hull_meta,
}, open(f"{OUT}/camera.json", "w"), indent=1)
print("BEAT_DONE", BEAT, "SECS", {k: round(v, 2) for k, v in ts.items()})
