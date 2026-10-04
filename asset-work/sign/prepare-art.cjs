const fs=require('fs'),path=require('path'),sharp=require('../../node_modules/sharp');
const root=__dirname;
(async()=>{
 const source='/Users/larsen/Desktop/Alibis wesbite/incline-demo/source-assets/official/alibi-logo-bug-grey.svg';
 const svg=fs.readFileSync(source,'utf8').replace(/<svg[^>]+>/,'<svg xmlns="http://www.w3.org/2000/svg" width="610" height="718" viewBox="-3 -3 153 179">').replaceAll('fill:#ccc;fill-rule:nonzero;','fill:#09251b;stroke:#f8f4e9;stroke-width:1.25;paint-order:stroke fill;fill-rule:nonzero;');
 fs.writeFileSync(path.join(root,'outlined-official-mark.svg'),svg);
 const mark=await sharp(Buffer.from(svg)).png().toBuffer();
 await sharp({create:{width:1600,height:925,channels:3,background:'#35b52c'}}).composite([{input:mark,left:495,top:92}]).png().toFile(path.join(root,'sign-face.png'));
 const manifestPath=path.resolve(root,'../../src/data/images.json');const images=JSON.parse(fs.readFileSync(manifestPath));
 const originals={
  'dining-hall':'/Users/larsen/Desktop/Alibis wesbite/incline-demo/source-assets/official-extra/iph-dining-hall-long-tables.jpg',
  'pizza-and-pints':'/Users/larsen/Desktop/Alibis wesbite/incline-demo/source-assets/official-extra/pizza-and-pints.jpg',
  'deck':'/Users/larsen/Desktop/Alibis wesbite/incline-demo/source-assets/official-extra/iph-deck-outdoor-bar-sunny.jpg'
 };
 for(const [key,file] of Object.entries(originals))for(const format of ['avif','webp','jpg']){
  const name=`img/${key}-1920.${format}`,out=path.resolve(root,'../../src/assets',name);
  const im=sharp(file).resize({width:1920,withoutEnlargement:true});
  const info=await (format==='avif'?im.avif({quality:63,effort:4}):format==='webp'?im.webp({quality:88}):im.jpeg({quality:88,mozjpeg:true})).toFile(out);
  images[key][format]=images[key][format].filter(i=>i[0]!==1920).concat([[1920,name,info.size]]).sort((a,b)=>a[0]-b[0]);
 }
 fs.writeFileSync(manifestPath,JSON.stringify(images,null,2));
 console.log('Prepared real photo derivatives and outlined official-mark texture.');
})();
