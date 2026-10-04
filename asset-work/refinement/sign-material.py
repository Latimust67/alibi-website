import bpy,json,time
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parent
out=ROOT/'sign-material';out.mkdir(exist_ok=True)
bpy.ops.wm.open_mainfile(filepath=str(ROOT.parent/'sign/alibi-sign-camera.blend'))
scene=bpy.context.scene;scene.frame_set(1)
for name in ['Matte painted Alibi green','Authentic mark on painted face','Dark painted steel box','Weathered steel bolt']:
 mat=bpy.data.materials.get(name)
 if not mat:continue
 shader=mat.node_tree.nodes.get('Principled BSDF')
 shader.inputs['Roughness'].default_value=.95
 shader.inputs['Metallic'].default_value=0
 shader.inputs['Specular IOR Level'].default_value=.08
 if name=='Weathered steel bolt':shader.inputs['Base Color'].default_value=(.13,.16,.12,1)
obj=bpy.data.objects['Supported sign box']
for modifier in obj.modifiers:
 if modifier.type=='BEVEL':modifier.width=.012
key=bpy.data.objects['Broad daylight'];key.location=(0,-9,3.5);key.data.energy=1850;key.data.size=10
key.rotation_euler=(Vector((0,0,2.85))-key.location).to_track_quat('-Z','Y').to_euler()
rim=bpy.data.objects['Soft edge light'];rim.data.energy=100;rim.data.size=6
scene.render.filepath=str(out/'frame-001.png')
bpy.ops.wm.save_as_mainfile(filepath=str(out/'alibi-sign-matte-comparison.blend'))
start=time.monotonic();bpy.ops.render.render(write_still=True)
(out/'comparison.json').write_text(json.dumps({'purpose':'One representative comparison; flatter face lighting, narrow existing bevel and quieter bolts, no geometry/art/camera replacement','frame':1,'render_seconds':time.monotonic()-start},indent=2))
