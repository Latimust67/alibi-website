/* Original transparent Blender frames; active only on the desktop motion path.
 * Keep at most8 decoded bitmaps. One decode in flight; no all-frame preload. */
window.createAlibiSignSequence=(canvas,poster)=>{
 const ctx=canvas.getContext('2d',{alpha:true});
 if(!ctx||!window.createImageBitmap||navigator.connection?.saveData)return null;
 const cache=new Map(),abort=new AbortController();
 let target=0,direction=1,working=false,disposed=false,failed=false,lastPaint=-1,generation=0;
 const count=Number(canvas.dataset.frames)||61;
 canvas.width=1440;canvas.height=900;
 const paint=()=>{
  if(disposed||failed)return;
  const exact=cache.get(target);
  const nearest=exact?target:[...cache.keys()].sort((a,b)=>Math.abs(a-target)-Math.abs(b-target))[0];
  if(nearest===undefined||Math.abs(nearest-target)>2){canvas.hidden=true;poster.style.opacity='1';return;}
  const bitmap=cache.get(nearest);cache.delete(nearest);cache.set(nearest,bitmap);
  if(nearest!==lastPaint){ctx.clearRect(0,0,canvas.width,canvas.height);ctx.drawImage(bitmap,0,0);lastPaint=nearest;}
  canvas.hidden=false;poster.style.opacity='0';
  canvas.dataset.frame=String(nearest);canvas.dataset.cache=String(cache.size);
 };
 const fallback=()=>{
  if(disposed||failed)return;
  failed=true;generation++;abort.abort();canvas.hidden=true;poster.style.opacity='1';canvas.dataset.fallback='poster';
  for(const bitmap of cache.values())bitmap.close();cache.clear();canvas.dataset.cache='0';delete canvas.dataset.frame;
  canvas.width=0;canvas.height=0;
 };
 const desired=()=>[target,target+direction,target+direction*2,target+direction*3,target-direction].filter(i=>i>=0&&i<count);
 const pump=async()=>{
  if(working||disposed||failed||document.hidden)return;
  working=true;const jobGeneration=generation;
  try{
   while(!disposed&&!failed&&!document.hidden&&jobGeneration===generation){
    const next=desired().find(i=>!cache.has(i));if(next===undefined)break;
    const response=await fetch(`/assets/art/sign/frame-${String(next+1).padStart(3,'0')}.webp`,{signal:abort.signal});
    if(disposed||failed||jobGeneration!==generation)break;
    if(!response.ok)throw new Error('Sign frame unavailable');
    const bitmap=await createImageBitmap(await response.blob());
    if(disposed||failed||jobGeneration!==generation){bitmap.close();break;}
    while(cache.size>=8){const oldest=cache.keys().next().value;cache.get(oldest).close();cache.delete(oldest);}
    cache.set(next,bitmap);paint();
   }
  }catch(error){fallback();}
  finally{working=false;}
 };
 const request=index=>{index=Math.min(count-1,Math.max(0,Math.round(index)));if(index!==target)direction=index>target?1:-1;target=index;paint();pump();};
 const visible=()=>{if(!document.hidden)pump();};document.addEventListener('visibilitychange',visible);
 const lost=()=>fallback();
 canvas.addEventListener('contextlost',lost);
 request(0);
 return {request,dispose(){if(disposed)return;disposed=true;generation++;abort.abort();document.removeEventListener('visibilitychange',visible);canvas.removeEventListener('contextlost',lost);for(const bitmap of cache.values())bitmap.close();cache.clear();ctx.clearRect(0,0,canvas.width,canvas.height);canvas.hidden=true;canvas.dataset.cache='0';canvas.width=0;canvas.height=0;poster.style.removeProperty('opacity');}};
};
