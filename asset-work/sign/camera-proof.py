import bpy,json,math,time
from pathlib import Path
from mathutils import Vector
from bpy_extras.object_utils import world_to_camera_view
ROOT=Path(__file__).resolve().parent
bpy.ops.wm.open_mainfile(filepath=str(ROOT/'alibi-sign.blend'))
scene=bpy.context.scene;camera=scene.camera
scene.render.resolution_x=1440;scene.render.resolution_y=900
camera.data.type='PERSP';camera.data.lens=48
start=Vector((2.8,-11,4.25));direction=Vector((1.4,0,2.55))-start
camera.location=start;camera.rotation_euler=direction.to_track_quat('-Z','Y').to_euler()
camera.keyframe_insert(data_path='location',frame=1)
camera.location=start+Vector((4.5,2.5,.1));camera.keyframe_insert(data_path='location',frame=61)
# Rendering samples have a linear camera translation; scroll easing belongs to the page.
if camera.animation_data and camera.animation_data.action:
 for layer in camera.animation_data.action.layers:
  for strip in layer.strips:
   for bag in strip.channelbags:
    for curve in bag.fcurves:
     for point in curve.keyframe_points:point.interpolation='LINEAR'
scene.frame_start=1;scene.frame_end=61;scene.render.fps=30
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'alibi-sign-camera.blend'))
out=ROOT/'sequence-v1';out.mkdir(exist_ok=True)
records=[]
for frame in range(1,62):
 scene.frame_set(frame);bpy.context.view_layer.update()
 corners=[world_to_camera_view(scene,camera,bpy.data.objects['Supported sign box'].matrix_world@Vector(v)) for v in bpy.data.objects['Supported sign box'].bound_box]
 bounds=[min(p.x for p in corners),max(p.x for p in corners),min(p.y for p in corners),max(p.y for p in corners)]
 scene.render.filepath=str(out/f'frame-{frame:03d}.png');start_time=time.monotonic();bpy.ops.render.render(write_still=True)
 records.append({'frame':frame,'camera':list(camera.location),'box_normalized':bounds,'render_seconds':time.monotonic()-start_time})
(out/'poses.json').write_text(json.dumps(records,indent=2))
print(json.dumps(records))
