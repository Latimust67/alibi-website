const fs=require('fs'),path=require('path'),sharp=require('../../node_modules/sharp');
const root=__dirname,out=path.resolve(root,'../../src/assets/art/sign');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const frames=[];
 for(let i=1;i<=61;i++){
  const file=`frame-${String(i).padStart(3,'0')}.webp`;
  const info=await sharp(path.join(root,'sequence-v1',file.replace('.webp','.png'))).webp({quality:88,alphaQuality:90}).toFile(path.join(out,file));
  frames.push({index:i-1,file,bytes:info.size});
 }
 fs.copyFileSync(path.join(out,frames[0].file),path.join(out,'poster-desktop.webp'));
 const phone=await sharp(path.join(root,'proof/sign-proof.png')).trim().resize({width:720}).webp({quality:88,alphaQuality:90}).toFile(path.join(out,'poster-phone.webp'));
 const manifest={width:1440,height:900,frameCount:61,frames,totalBytes:frames.reduce((a,b)=>a+b.bytes,0),phonePosterBytes:phone.size,maximumDecodedFrames:8,estimatedDecodedFrameBytes:1440*900*4,estimatedMaximumDecodedCacheBytes:8*1440*900*4};
 fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify(manifest,null,2));console.log(JSON.stringify(manifest));
})();
