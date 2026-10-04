import bpy, math, json, time
from pathlib import Path
from mathutils import Vector

ROOT=Path(__file__).resolve().parent
OUT=ROOT/'proof'
OUT.mkdir(parents=True,exist_ok=True)
started=time.monotonic()
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

def mat(name,color,rough=.7,metal=0):
 m=bpy.data.materials.new(name);m.use_nodes=True
 p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*color,1);p.inputs['Roughness'].default_value=rough;p.inputs['Metallic'].default_value=metal
 return m

green=mat('Matte painted Alibi green',(.036,.462,.026),.76)
edge=mat('Dark painted steel box',(.022,.065,.038),.62,.18)
bolt=mat('Weathered steel bolt',(.20,.23,.18),.45,.65)
def box(name,loc,scale,material,bevel=.015):
 bpy.ops.mesh.primitive_cube_add(size=1,location=loc)
 obj=bpy.context.object;obj.name=name;obj.dimensions=scale
 bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 obj.data.materials.append(material)
 if bevel:
  mod=obj.modifiers.new('Small physical bevel','BEVEL');mod.width=bevel;mod.segments=3
  obj.modifiers.new('Weighted corner normals','WEIGHTED_NORMAL')
 return obj

# Boxed sign with one upright underneath, as observed in the source photograph.
# Proportions and simplified face are an original interpretation. Official glyph paths
# retain the source identity; no replica claim or invented sign ornament.
box('Supported sign box',(0,0,2.85),(4.8,.25,2.9),edge,.035)
box('Front painted face',(0,-.141,2.85),(4.52,.025,2.61),green,.006)
box('Upright support',(-1.47,.035,.42),(.30,.32,3.05),edge,.018)
box('Rear mounting shoe',(-1.47,.06,1.37),(.53,.43,.33),edge,.012)

face=bpy.data.materials.new('Authentic mark on painted face');face.use_nodes=True
n=face.node_tree.nodes;p=n.get('Principled BSDF');p.inputs['Roughness'].default_value=.8
t=n.new('ShaderNodeTexImage');t.image=bpy.data.images.load(str(ROOT/'sign-face.png'));t.image.pack()
face.node_tree.links.new(t.outputs['Color'],p.inputs['Base Color'])
bpy.ops.mesh.primitive_plane_add(size=2,location=(0,-.157,2.85),rotation=(math.pi/2,0,0))
obj=bpy.context.object;obj.name='Authentic logo artwork';obj.scale=(2.26,1.305,1);obj.data.materials.append(face)
for x in [-2.13,2.13]:
 for z in [1.68,4.02]:
  bpy.ops.mesh.primitive_uv_sphere_add(segments=16,ring_count=8,radius=.035,location=(x,-.186,z))
  obj=bpy.context.object;obj.name='Face screw';obj.scale=(1,.4,1);obj.data.materials.append(bolt)

def aim(obj,point):obj.rotation_euler=(Vector(point)-obj.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.object.camera_add(location=(4.4,-12.5,4.0))
camera=bpy.context.object;camera.name='Proof camera';aim(camera,(0,0,2.30));camera.data.type='ORTHO';camera.data.ortho_scale=7.0
bpy.context.scene.camera=camera
for name,loc,power,size in [('Broad daylight',(-3,-5,7),850,6),('Soft edge light',(4,1,6),650,5)]:
 bpy.ops.object.light_add(type='AREA',location=loc);light=bpy.context.object;light.name=name;light.data.energy=power;light.data.shape='DISK';light.data.size=size;aim(light,(0,0,2.6))
scene=bpy.context.scene;scene.world.color=(.25,.25,.25)
scene.render.engine='BLENDER_EEVEE';scene.render.resolution_x=1400;scene.render.resolution_y=1150;scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG';scene.render.image_settings.color_mode='RGBA';scene.render.film_transparent=True
scene.render.filepath=str(OUT/'sign-proof.png')
scene.view_settings.view_transform='Standard';scene.view_settings.look='None';scene.view_settings.exposure=-.4
if hasattr(scene,'eevee'):scene.eevee.taa_render_samples=32
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'alibi-sign.blend'))
model_seconds=time.monotonic()-started
render_started=time.monotonic();bpy.ops.render.render(write_still=True)
result={'blender':bpy.app.version_string,'engine':scene.render.engine,'width':1400,'height':1150,'model_seconds':model_seconds,'render_seconds':time.monotonic()-render_started,'total_script_seconds':time.monotonic()-started,'source':'Original shallow boxed sign and upright support; authentic Alibi SVG mark, no venue geometry or synthetic photography'}
(OUT/'benchmark.json').write_text(json.dumps(result,indent=2))
print('SIGN_BENCHMARK '+json.dumps(result))
