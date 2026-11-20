# S3 lighting rig on a placeholder hull, Cycles. Real scale (1 unit = 1 m).
# Args after "--": out_dir width height samples [glb]
# Writes: plate.png (RGBA, hull above the waterline only), shadow.png (RGBA contact shadow on z=0 only),
# camera.json (position, target, lens, sensor, focus) so the live three.js water uses the same camera.
import bpy, bmesh, sys, math, time, json
from mathutils import Vector
a = sys.argv[sys.argv.index("--")+1:]
OUT, W, H, SAMPLES = a[0], int(a[1]), int(a[2]), int(a[3])
GLB = a[4] if len(a) > 4 else ""
def lin(h):
    h = h.lstrip("#"); c = [int(h[i:i+2], 16)/255 for i in (0, 2, 4)]
    return tuple(x/12.92 if x <= 0.04045 else ((x+0.055)/1.055)**2.4 for x in c)
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
ship = bpy.data.objects.new("SHIP", None); sc.collection.objects.link(ship)

def mat(name, col, rough, metal=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = next(n for n in m.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
    b.inputs['Base Color'].default_value = (*lin(col), 1)
    b.inputs['Roughness'].default_value = rough; b.inputs['Metallic'].default_value = metal
    return m

def block(name, sx, sy, sz, loc, m, bevel=0.35, bow=0.0):
    """Box with optional tapered bow (fraction of length) and bevelled edges."""
    me = bpy.data.meshes.new(name); bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    if bow > 0:
        bmesh.ops.subdivide_edges(bm, edges=[e for e in bm.edges if abs(e.verts[0].co.x - e.verts[1].co.x) > 0.5],
                                  cuts=6, use_grid_fill=True)
    for v in bm.verts:
        x = v.co.x
        if bow > 0 and x > 0.5 - bow:
            t = (x - (0.5 - bow)) / bow                      # 0 at shoulder, 1 at stem
            v.co.y *= max(0.0, math.cos(t * math.pi / 2)) ** 0.8
            v.co.x += 0.06 * t * (v.co.z + 0.5)                # raked stem
        v.co.x *= sx; v.co.y *= sy; v.co.z *= sz
    bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new(name, me); sc.collection.objects.link(o)
    o.location = loc; o.parent = ship; me.materials.append(m)
    bv = o.modifiers.new("Bevel", 'BEVEL'); bv.width = bevel; bv.segments = 3; bv.limit_method = 'ANGLE'
    for p in me.polygons: p.use_smooth = True
    o.modifiers.new("WN", 'WEIGHTED_NORMAL')
    return o

if GLB:
    bpy.ops.import_scene.gltf(filepath=GLB)
else:
    # placeholder: 180 m expedition-cruise proportions, 7 m draft, stepped white superstructure
    hullc = mat("Hull", "#1b2433", 0.42, 0.15); white = mat("White", "#e9ecef", 0.38)
    glass = mat("Glass", "#0c1622", 0.08, 0.6); boot = mat("Boot", "#7a1f1f", 0.55)
    block("HULL", 180, 28, 16, (0, 0, 1.0), hullc, 0.45, bow=0.22)        # z from -7 to 9
    block("BOOT", 176, 28.2, 2.2, (-1, 0, -0.6), boot, 0.2, bow=0.22)      # boot top band at the waterline
    for i, (L, z, x) in enumerate(((140, 9.0+1.6, -12), (124, 12.2+1.6, -16), (104, 15.4+1.6, -20),
                                   (80, 18.6+1.6, -22), (46, 21.8+1.6, -14))):
        block(f"DECK{i}", L, 25 - i*1.4, 3.2, (x, 0, z), white, 0.25, bow=0.05)
        block(f"WIN{i}", L*0.96, 25.2 - i*1.4, 1.1, (x, 0, z + 0.3), glass, 0.05, bow=0.05)
    block("BRIDGE", 10, 30, 3.0, (14, 0, 22.8), white, 0.25)
    block("FUNNEL", 12, 7, 9, (-36, 0, 27.6), mat("Funnel", "#0a2342", 0.4), 0.8)
bpy.context.view_layer.update()
mn = Vector((1e9,)*3); mx = Vector((-1e9,)*3)
for o in sc.objects:
    if o.type == 'MESH':
        for c in o.bound_box:
            w = o.matrix_world @ Vector(c); mn = Vector(map(min, mn, w)); mx = Vector(map(max, mx, w))
print("BOUNDS", tuple(round(v, 1) for v in mn), tuple(round(v, 1) for v in mx))

# waterline plane at z=0: holdout in the plate pass (cuts the hull below water), shadow catcher in the shadow pass
bpy.ops.mesh.primitive_plane_add(size=2000, location=(0, 0, 0)); sea = bpy.context.object; sea.name = "SEA"

# lights: hard key upper left, low amber sun rim, cold edge in the shadow side
def sun(name, src, col, en, ang):
    d = bpy.data.lights.new(name, 'SUN'); d.color = col; d.energy = en; d.angle = math.radians(ang)
    o = bpy.data.objects.new(name, d); sc.collection.objects.link(o)
    o.rotation_euler = (-Vector(src)).normalized().to_track_quat('-Z', 'Y').to_euler(); return o
lights = [sun("KEY", (-0.55, -1.0, 1.05), (1, 0.97, 0.93), 4.5, 0.6)]
lights += [sun("RIM", (-1.0, 1.0, 0.16), lin("#f5b53d"), 9.0, 0.9)]
lights += [sun("COLD", (1.0, 0.55, 0.30), lin("#4f7db8"), 3.0, 2.0)]
w = bpy.data.worlds.new("W"); sc.world = w; w.use_nodes = True
bg = next(n for n in w.node_tree.nodes if n.type == 'BACKGROUND')
bg.inputs['Color'].default_value = (*lin("#0a2342"), 1); bg.inputs['Strength'].default_value = 0.35

# camera: 50 mm on a 36 mm sensor, near-still, low 3/4 view; portrait pulls back so the hull fits the width
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
cd.dof.use_dof = True; cd.dof.focus_distance = (tgt - cam.location).length; cd.dof.aperture_fstop = 1.4
cd.clip_end = 5000

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

meshes = [o for o in sc.objects if o.type == 'MESH' and o is not sea]
ts = {}
# pass 1: plate. Sea is a holdout: everything under z=0 becomes transparent; the hull keeps lighting.
sea.is_holdout = True; sea.is_shadow_catcher = False
r.filepath = f"{OUT}/plate.png"; t = time.time(); bpy.ops.render.render(write_still=True); ts["plate"] = time.time()-t
# pass 2: contact shadow only. Hull invisible to camera, still casts; sea catches.
sea.is_holdout = False; sea.is_shadow_catcher = True
for o in meshes: o.visible_camera = False
for o in lights: o.hide_render = True
# contact light: near overhead and soft, so the catcher holds a tight band at the hull, not a long cast shadow
sun("CONTACT", (-0.15, -0.2, 1.0), (1, 1, 1), 4.0, 12.0)
cy.samples = max(32, SAMPLES // 2)
r.filepath = f"{OUT}/shadow.png"; t = time.time(); bpy.ops.render.render(write_still=True); ts["shadow"] = time.time()-t
json.dump({"position": list(cam.location), "target": list(tgt), "lens_mm": cd.lens, "sensor_mm": 36,
           "sensor_fit": cd.sensor_fit, "focus_m": cd.dof.focus_distance, "fstop": cd.dof.aperture_fstop,
           "width": W, "height": H, "z_up": True, "secs": {k: round(v, 2) for k, v in ts.items()}},
          open(f"{OUT}/camera.json", "w"), indent=1)
print("SECS", {k: round(v, 2) for k, v in ts.items()}, "DEVICE", cy.device)
