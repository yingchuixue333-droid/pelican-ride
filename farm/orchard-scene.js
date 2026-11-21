import {TREE_SPRITES} from './tree-sprites.js?v=20261123b';
import {fruitArt as vectorFruit,treeGeometry} from './orchard-vector-fallback.js?v=20261123b';
export {treeGeometry};
export const TREE_SPOTS=[{x:150,y:1130},{x:150,y:1130},{x:150,y:1130}];
const images={},failed=new Set();
const load=(key,file)=>new Promise(resolve=>{if(typeof Image==='undefined')return resolve(false);let im=new Image();im.onload=()=>{images[key]=im;resolve(true);};im.onerror=()=>{failed.add(key);resolve(false);};im.src=new URL('./rain-assets/'+file,import.meta.url).href;});
export const rainAssetsReady=Promise.all([load('garden','garden.webp'),load('apple','apple.webp'),load('items','items.webp'),load('trees','trees.webp'),load('growth','growth.webp'),load('young','young-trees.webp'),load('peachCanopy','peach-canopy.webp'),load('plum','plum-orchard-tree.webp')]);
function plumFruit(c,x,y,r,look){
 c.save();c.translate(x,y);c.rotate(look.turn||0);
 const scale=r*(look.size||1)*.93;
 c.scale(scale,scale);
 c.beginPath();c.moveTo(.04,-.62);c.bezierCurveTo(-.34,-.83,-.72,-.49,-.76,-.11);
 c.bezierCurveTo(-.83,.37,-.48,.79,-.04,.83);
 c.bezierCurveTo(.43,.86,.73,.41,.75,-.06);
 c.bezierCurveTo(.77,-.48,.40,-.80,.04,-.62);c.closePath();
 const color=c.createRadialGradient(-.33,-.34,.05,.05,.1,1);
 color.addColorStop(0,look.variant==='sunny'?'#d49fab':'#b9aaca');
 color.addColorStop(.37,look.variant==='blush'?'#985b80':'#7e639e');
 color.addColorStop(.76,'#493558');
 color.addColorStop(1,'#2d223c');
 c.fillStyle=color;c.fill();
 c.save();c.clip();
 const bloom=c.createRadialGradient(-.34,-.36,0,-.34,-.36,.61);
 bloom.addColorStop(0,'#f6e7f36b');bloom.addColorStop(1,'#f6e7f300');
 c.fillStyle=bloom;c.fillRect(-1,-1,2,2);
 c.beginPath();c.moveTo(.04,-.61);c.bezierCurveTo(.19,-.41,.49,.05,.16,.76);
 c.strokeStyle='#3c244f73';c.lineWidth=.044;c.stroke();
 c.restore();
 c.beginPath();c.moveTo(.05,-.62);c.quadraticCurveTo(-.03,-.88,.12,-1.02);
 c.strokeStyle='#766144';c.lineWidth=.075;c.lineCap='round';c.stroke();
 c.restore();
}
export function fruitArt(c,id,x,y,r=40,look={}){if(id==='plum'){plumFruit(c,x,y,r,look);return;}if(!images.items){vectorFruit(c,id,x,y,r,look);return;}let im=images.items,cw=im.width/2,ch=im.height/2,cell=id==='pear'?1:id==='peach'?2:0;c.save();c.translate(x,y);c.rotate(look.turn||0);let size=look.size||1;c.scale(size,size);if(look.variant==='sunny')c.filter='saturate(.9) sepia(.14)';c.drawImage(im,(cell%2)*cw,Math.floor(cell/2)*ch,cw,ch,-r*1.3,-r*1.55,r*2.6,r*2.6);c.restore();}
const sites=[[.65,.66],[.45,.43],[.72,.44],[.49,.58]];
const plumSites=[[.68,.51],[.27,.39],[.51,.31],[.78,.32]];
export function treeLayout(v){
 if(v.tree.id==='apple'&&v.stage===3)return {hero:true,x:0,y:80,w:720,h:1080,rootX:145,rootY:1130};
 if(v.tree.id==='plum'){
  const w=[278,480,575,650][v.stage],h=Math.min(790,w*(images.plum?images.plum.height/images.plum.width:1.14));
  return {key:images.plum?'plum':'trees',crop:images.plum?[0,0,images.plum.width,images.plum.height]:TREE_SPRITES['trees-0'].crop,x:(720-w)/2,y:1130-h,w,h,rootX:360-w*.105,rootY:1130};
 }
 if(v.tree.id==='peach'&&v.stage===3){
  const w=660,h=w*731/800;
  return {key:'peachCanopy',crop:[0,0,800,731],x:30,y:1130-h,w,h,rootX:219,rootY:1130};
 }
 let id=v.tree.id,stage=v.stage,key=stage===3?'trees-'+(id==='pear'?0:1):id==='apple'?'growth-'+stage:'young-trees-'+((id==='peach'?3:0)+stage),sprite=TREE_SPRITES[key],crop=sprite.crop,scale=Math.min((id==='peach'?668:640)/crop[2],840/crop[3])*(id==='peach'?[.56,1,1,1]:[.55,.78,.94,1])[stage],w=crop[2]*scale,h=crop[3]*scale,x=(720-w)/2,y=1120-h;
 return {key:stage===3?'trees':id==='apple'?'growth':'young',crop,x,y,w,h,rootX:x+w*sprite.root,rootY:1120};
}
export function fruitPositions(v){if(!v)return [];let box=treeLayout(v);return v.fruits.map(f=>{let k=(f.serial-1)%4;if(box.hero)return {...f,x:sites[k][0]*720,y:80+sites[k][1]*1080+38,r:k===0?43:35};let site=(v.tree.id==='plum'?plumSites:box.key==='peachCanopy'?[[.63,.58],[.43,.40],[.82,.48],[.25,.58]]:v.tree.id==='peach'?[[.68,.51],[.46,.43],[.79,.42],[.37,.59]]:[[.68,.46],[.43,.23],[.79,.3],[.4,.42]])[k];return {...f,x:box.x+site[0]*box.w,y:box.y+site[1]*box.h,r:Math.max(23,Math.min(35,box.w*.065))*(1+(v.rank?.milestone||0)*.035)};});}
function basket(c,count,recent=[]){if(!images.items)return;let im=images.items,cw=im.width/2,ch=im.height/2;c.save();c.translate(594,1040);c.rotate(-.045);c.drawImage(im,cw,ch,cw,ch,-103,-100,206,206);if(count){for(let j=0;j<Math.min(3,recent.length);j++)fruitArt(c,recent[j],-24+j*26,10-j%2*8,15,{size:1,turn:(j-1)*.12});c.drawImage(im,cw,ch+ch*.55,cw,ch*.45,-103,13,206,93);}c.restore();}
function drawMilestoneBlossoms(c,view,box){
 const tier=view.rank?.milestone||0;
 if(!tier)return;
 const palette={peach:'#f1b5b6',plum:'#edcfdf',pear:'#f4edcb'};
 const petals=palette[view.tree.id]||'#f3e8be';
 const branches=[[.38,.40],[.6,.31],[.48,.51],[.73,.39],[.27,.49],[.65,.54],[.43,.24],[.55,.42],[.78,.52],[.34,.31]];
 c.save();c.globalAlpha=.84;
 for(let i=0;i<tier*2;i++){
  const [fx,fy]=branches[i],x=box.x+box.w*fx,y=box.y+box.h*fy;
  const radius=4+(i%3)+tier*.45;
  c.fillStyle=petals;
  for(let petal=0;petal<5;petal++){
   const a=petal*Math.PI*.4;
   c.beginPath();c.ellipse(x+Math.cos(a)*radius,y+Math.sin(a)*radius,radius*.72,radius*.53,a,0,Math.PI*2);c.fill();
  }
  c.fillStyle=tier===5?'#f9cf67':'#d6a16a';
  c.beginPath();c.arc(x,y,radius*.38,0,Math.PI*2);c.fill();
 }
 c.restore();
}
export function createOrchardScene(canvas){let c=canvas.getContext('2d'),effects=[],stats={frames:0,treeBuilds:0,backgroundBuilds:0},picked=0,recent=[];
 function camera(){return {z:1,x:0,y:0};}
 function points(vs,focus=0){let i=focus??0,v=vs[i],cam=camera();return v?fruitPositions(v).map(f=>({...f,index:i,x:f.x*cam.z+cam.x,y:f.y*cam.z+cam.y,r:f.r*cam.z})):[];}
 function render(vs,focus=0,t=0,reduced=false){if(!c)return;let width=Math.max(1,Math.round(canvas.clientWidth*Math.min(globalThis.devicePixelRatio||1,2))),height=Math.max(1,Math.round(canvas.clientHeight*Math.min(globalThis.devicePixelRatio||1,2)));if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;}c.setTransform(width/720,0,0,height/1280,0,0);c.clearRect(0,0,720,1280);if(images.garden)c.drawImage(images.garden,0,0,720,1280);else{c.fillStyle='#d6e6ce';c.fillRect(0,0,720,1280);}let v=vs[focus??0],cam=camera();c.save();c.translate(cam.x,cam.y);c.scale(cam.z,cam.z);if(v){let box=treeLayout(v),sway=reduced?0:Math.sin(t*.75)*.0025,recoil=effects.find(e=>t-e.at<.65);if(recoil)sway+=Math.sin((t-recoil.at)*20)*.008*(1-(t-recoil.at)/.65);c.save();c.translate(box.rootX,box.rootY);c.rotate(sway);c.translate(-box.rootX,-box.rootY);if(box.hero&&images.apple)c.drawImage(images.apple,box.x,box.y,box.w,box.h);else if(images[box.key])c.drawImage(images[box.key],...box.crop,box.x,box.y,box.w,box.h);else if(box.key==='peachCanopy'&&images.trees){const old=TREE_SPRITES['trees-1'].crop,height=box.w*old[3]/old[2];c.drawImage(images.trees,...old,box.x,box.rootY-height,box.w,height);}else{c.strokeStyle='#7b6948';c.lineWidth=12;c.beginPath();c.moveTo(box.rootX,box.rootY);c.lineTo(box.rootX,box.rootY-200);c.stroke();}c.restore();drawMilestoneBlossoms(c,v,box);for(let f of fruitPositions(v)){c.strokeStyle='#87704d';c.lineWidth=2;c.beginPath();c.moveTo(f.x-3,f.y-f.r*1.7);c.quadraticCurveTo(f.x+2,f.y-f.r*1.3,f.x,f.y-f.r);c.stroke();fruitArt(c,v.tree.id,f.x,f.y,f.r,f);}}c.restore();
 // Damp contact shadow belongs to the same tree foot, not to a floating UI card.
 c.save();c.globalCompositeOperation='multiply';c.globalAlpha=.13;c.fillStyle='#4b5c32';c.beginPath();c.ellipse(v?treeLayout(v).rootX:148,v?treeLayout(v).rootY+3:1133,v?Math.min(85,treeLayout(v).w*.2):0,12,-.1,0,Math.PI*2);c.fill();c.restore();basket(c,picked,recent);
 for(let e of effects){let p=Math.min(1,Math.max(0,(t-e.at)/.95)),drop=p*p,x=e.x+(588-e.x)*p,y=e.y+(1040-e.y)*drop-Math.sin(p*Math.PI)*45;fruitArt(c,e.id,x,y,e.r*(1-.6*p),{...e.fruit,turn:e.fruit.turn+p*.6});}stats.frames++;canvas.dataset.frames=stats.frames;canvas.dataset.activeEffects=effects.length;canvas.dataset.assets=images.apple&&images.items?'ready':'loading';}
 return {render,points,camera,stats,get flying(){return effects.length;},settle(t,reduced){effects=effects.filter(e=>!reduced&&t-e.at<.95);},setBasket(n,items=[]){picked=n;recent=items;},pop(index,id,fruit,focus,vs,t){let p=points(vs,focus).find(p=>p.token===fruit.token);if(p)effects.push({index,id,fruit,...p,at:t});},clear(){effects=[];},delay(reduced=false){return reduced?1000:effects.length?32:110;}};
}
