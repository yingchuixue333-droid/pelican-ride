import {CROPS,crop,growth,ready} from './model.js?v=20261123a';
import {growthProfile,frameDelay} from './growth.js?v=20261123a';
import {sprite,images,assetsReady} from './assets.js?v=20261123a';
export {assetsReady};
import {visualPhase} from './presentation.js?v=20261123a';
const INK='#40584b';
function ellipse(c,x,y,rx,ry,fill,stroke=null){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.lineWidth=2;c.strokeStyle=stroke;c.stroke();}}
function path(c,points,fill,stroke=null){c.beginPath();for(let i=0;i<points.length;i++)c[i?'lineTo':'moveTo'](...points[i]);c.closePath();if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.lineWidth=2;c.strokeStyle=stroke;c.stroke();}}
function line(c,x,y,x2,y2,color=INK,width=2){c.beginPath();c.moveTo(x,y);c.lineTo(x2,y2);c.strokeStyle=color;c.lineWidth=width;c.stroke();}
function leaf(c,x,y,a,scale=1){c.save();c.translate(x,y);c.rotate(a);ellipse(c,0,-11*scale,7*scale,15*scale,'#719564');line(c,0,0,0,-24*scale,'#527851',1.5);c.restore();}
function star(c,x,y,r,color){let pts=[];for(let i=0;i<8;i++){let a=i*Math.PI/4;pts.push([x+Math.cos(a)*(i%2?r*.3:r),y+Math.sin(a)*(i%2?r*.3:r)]);}path(c,pts,color);}
export function plantArt(c,id,x,y,size=1,stage=3,variant=0,t=0,visual={}){c.save();c.translate(x,y);c.scale(size*(variant===2?1.25:1),size*(variant===2?1.25:1));c.rotate(Math.sin(t*1.5+x)*.025);c.lineWidth=1.6;
 if(stage===0&&!visual.established){line(c,0,2,0,-17,'#58835a',2);leaf(c,-1,-8,-.85,.55);leaf(c,1,-10,.85,.55);c.restore();return;}
 const shape=crop(id).shape;
 const grow=visual.established?1:stage===1?.72:stage===2?.88:1;c.scale(grow,grow);let color=visual.color||(variant===1?'#e4bc54':crop(id).color);
 if(stage===1&&shape!=='tree'&&shape!=='leaf'){drawLeaves(c,shape);c.restore();return;}
 if(visual.flowering&&shape!=='tree'){drawLeaves(c,shape);for(let j=-1;j<=1;j++)blossom(c,j*14,-25+(j===0?-8:0),crop(id).color,4);c.restore();return;}
 if(shape==='radish'){path(c,[[-15,-13],[-17,0],[-10,16],[0,26],[9,16],[17,0],[14,-13]],color,INK);ellipse(c,-1,-12,15,8,'#f3ded1',INK);leaf(c,0,-17,-.6);leaf(c,0,-17,.6);leaf(c,0,-20,0,.8);line(c,0,25,3,32,'#b99b79',1.5);}
 if(shape==='wheat'){for(let k=-1;k<=1;k++){c.save();c.translate(k*12,0);c.rotate(k*.18);line(c,0,12,0,-45,'#8d9762',2);for(let j=0;j<4;j++){for(let side of [-1,1]){c.save();c.translate(side*4,-15-j*9+(side<0?0:-4));c.rotate(side*.65);ellipse(c,0,0,3.4,6.5,color);c.restore();}}line(c,0,-42,0,-55,'#b59c56',1);c.restore();}}
 if(shape==='berry'){leaf(c,0,-14,-.7);leaf(c,0,-14,.7);path(c,[[-18,-11],[-20,0],[-14,12],[0,27],[14,12],[20,0],[18,-11],[0,-18]],color,INK);for(let i=0;i<7;i++)ellipse(c,((i*13)%27)-13,-5+Math.floor(i/3)*9,1.5,2,'#ffebbc');path(c,[[-17,-10],[-7,-17],[0,-12],[8,-19],[17,-11],[7,-8],[0,-4],[-6,-9]],'#668952',INK);}
 if(shape==='tomato'){line(c,0,12,0,-45,'#61885a',3);leaf(c,0,-32,.8,.8);leaf(c,0,-25,-.8,.9);for(let k=-1;k<=1;k++){ellipse(c,k*14,-4+(k===0?14:0),15,15,color,INK);path(c,[[k*14-8,-16+(k===0?14:0)],[k*14,-20+(k===0?14:0)],[k*14+8,-16+(k===0?14:0)],[k*14,-12+(k===0?14:0)]],'#5d8550');}}
 if(shape==='pumpkin'){line(c,0,-17,4,-33,'#668257',6);leaf(c,2,-29,.8,.7);ellipse(c,0,1,29,23,color,INK);ellipse(c,0,1,17,23,null,'#a77741');ellipse(c,0,1,6,23,null,'#a77741');ellipse(c,-12,-8,7,4,'#f2c577');}
 if(shape==='moon'){line(c,0,20,0,-23,'#68875c',3);leaf(c,0,8,-.9,.8);leaf(c,0,13,.9,.8);for(let i=0;i<5;i++){let a=i*Math.PI*2/5;c.save();c.translate(Math.sin(a)*14,-27+Math.cos(a)*14);c.rotate(-a);ellipse(c,0,0,9,16,variant===1?color:'#c1b5df',INK);c.restore();}ellipse(c,0,-27,8,8,'#f3d68a',INK);}
 if(shape==='leaf'){for(let k=-2;k<=2;k++){c.save();c.rotate(k*.33);ellipse(c,k*4,-10,12,25,color,INK);line(c,k*4,10,k*4,-31,'#587950',1.3);c.restore();}}
 if(shape==='carrot'){path(c,[[-14,-17],[12,-17],[9,8],[-2,34],[-11,9]],color,INK);leaf(c,0,-21,-.5);leaf(c,0,-21,.5);for(let j=0;j<3;j++)line(c,-9+j*2,-7+j*10,1,-9+j*10,'#b47e42',1.3);}
 if(shape==='root'){ellipse(c,0,1,23,21,color,INK);leaf(c,0,-18,-.5,.8);leaf(c,0,-18,.5,.8);ellipse(c,-8,-4,4,2,'#e9d8ac');line(c,0,22,4,29,'#9b8b6a',1.3);}
 if(shape==='corn'){ellipse(c,0,-5,14,32,color,INK);for(let x=-7;x<=7;x+=7)for(let y=-23;y<=14;y+=8)ellipse(c,x,y,2,3,'#f1d98c');path(c,[[-4,27],[-25,3],[-27,-23],[-9,-2]],'#72945d',INK);path(c,[[4,27],[25,3],[27,-23],[9,-2]],'#8aaa6b',INK);}
 if(shape==='pod'){line(c,0,24,0,-40,'#688959',3);leaf(c,0,-24,-.8,.85);leaf(c,0,-16,.8,.85);for(let k=-1;k<=1;k++){c.save();c.translate(k*13,-7);c.rotate(k*.35);ellipse(c,0,0,7,25,color,INK);for(let j=-1;j<=1;j++)ellipse(c,0,j*12,4,5,'#b4c98a');c.restore();}}
 if(shape==='vine'){line(c,0,25,0,-39,'#6b8d5b',3);leaf(c,0,-29,-.7);leaf(c,0,-20,.7);for(let k=-1;k<=1;k++){c.save();c.translate(k*16,0);c.rotate(k*.2);ellipse(c,0,0,9,24,color,INK);line(c,-3,-14,-3,12,'#dae1a48a',2);c.restore();}}
 if(shape==='pepper'){line(c,0,20,0,-40,'#6a895a',3);leaf(c,0,-25,.7);ellipse(c,-9,-1,13,22,color,INK);ellipse(c,9,-1,13,22,color,INK);ellipse(c,0,-1,9,23,color,INK);line(c,0,-20,5,-32,'#5f8154',4);}
 if(shape==='melon'){ellipse(c,0,3,29,23,color,INK);for(let k=-1;k<=1;k++){c.beginPath();c.ellipse(k*7,3,10,22,0,-Math.PI/2,Math.PI/2);c.strokeStyle='#668759';c.lineWidth=2;c.stroke();}line(c,0,-20,8,-32,'#658b58',3);leaf(c,7,-30,.7,.7);}
 if(shape==='mushroom'){path(c,[[-7,-3],[8,-3],[12,25],[-11,25]],'#e3d4b0',INK);c.beginPath();c.ellipse(0,-6,28,23,0,Math.PI,Math.PI*2);c.closePath();c.fillStyle=color;c.fill();c.strokeStyle=INK;c.stroke();ellipse(c,0,-5,28,7,'#e0ccac',INK);for(let k=-1;k<=1;k++)ellipse(c,k*13,-19+(k===0?-5:0),3,2,'#e9d7b0');}
 if(shape==='grape'){line(c,0,-36,5,-48,'#6a8455',3);leaf(c,3,-38,.9,.9);for(let row=0;row<4;row++)for(let j=0;j<4-row;j++)ellipse(c,(j-(3-row)/2)*13,-19+row*13,8,8,color,INK);}
 if(shape==='pineapple'){ellipse(c,0,2,21,29,color,INK);for(let j=-1;j<=1;j++)line(c,-16,-12+j*12,16,6+j*12,'#9f9855',1.3);for(let j=-1;j<=1;j++)line(c,-16,6+j*12,16,-12+j*12,'#9f9855',1.3);for(let k=-1;k<=1;k++)leaf(c,0,-25,k*.6,1.1);}
 if(shape==='flower'){line(c,0,24,0,-25,'#718b59',3);leaf(c,0,7,-.8);for(let k=0;k<9;k++){c.save();c.translate(Math.sin(k*7)*15,-27+Math.cos(k*7)*15);c.rotate(-k*7);ellipse(c,0,0,6,13,color,INK);c.restore();}ellipse(c,0,-27,12,12,'#a68c58',INK);}
 if(shape==='lotus'){for(let k=-1;k<=1;k++){ellipse(c,k*16,4,13,17,color,INK);for(let j=0;j<4;j++)ellipse(c,k*16+Math.cos(j*Math.PI/2)*6,4+Math.sin(j*Math.PI/2)*8,2,3,'#917e6d');}leaf(c,5,-16,.6,1.2);}
 if(shape==='tree'){line(c,0,24,0,-41,'#99785b',10);line(c,0,-15,-25,-42,'#99785b',6);ellipse(c,0,24,23,6,'#6d835332');ellipse(c,-29,-41,25,24,'#7fa56b',INK);ellipse(c,28,-41,26,25,'#8aad72',INK);ellipse(c,0,-57,32,27,'#90b377',INK);if(stage>=2)for(let j=0;j<6;j++){let fx=[-31,-12,18,34,0,3][j],fy=[-45,-62,-59,-39,-31,-77][j];if(visual.flowering)blossom(c,fx,fy,'#f1d6bd',4);else ellipse(c,fx,fy,(visual.smallFruit?4:7),(visual.smallFruit?5:8),color,INK);}}
 if(variant===3){star(c,-28,-22,6,'#fff6ce');star(c,25,-39,7,'#fff6ce');star(c,19,13,4,'#eee8ff');}c.restore();}
function drawLeaves(c,shape){const low=['radish','carrot','root','lotus','mushroom','pumpkin','melon'].includes(shape);line(c,0,15,0,low?-12:-36,'#62845a',3);for(let k=-1;k<=1;k++){leaf(c,k*4,low?-7:-16,k*.8,low?1:.9);if(!low&&k)leaf(c,k*3,-30,k*.7,.65);}}
function blossom(c,x,y,color,r=4,petal='#f4e5ce'){for(let j=0;j<5;j++)ellipse(c,x+Math.cos(j*1.256)*r,y+Math.sin(j*1.256)*r,r*.7,r*.7,petal);ellipse(c,x,y,r*.55,r*.55,color);}
export function blendColor(a,b,t){t=Math.max(0,Math.min(1,t));const rgb=s=>[1,3,5].map(i=>parseInt(s.slice(i,i+2),16));let x=rgb(a),y=rgb(b);return '#'+x.map((n,i)=>Math.round(n+(y[i]-n)*t).toString(16).padStart(2,'0')).join('');}
export function growingPlant(c,id,x,y,size,v,t=0){
 const meta=crop(id),nonFlower=['radish','carrot','root','leaf','lotus','mushroom','wheat','corn'].includes(meta.shape),ripeness=Math.max(0,Math.min(1,(v.progress-.64)/.36));
 const stage=v.phase===4?3:v.phase===3?3:v.phase,visual={established:v.established,flowering:v.phase===2&&!nonFlower,smallFruit:v.phase===3&&v.progress<.82,color:v.phase===3?blendColor('#809a67',meta.color,ripeness):undefined};
 const expansion=v.phase===3&&!v.established?.86+.14*ripeness:1;plantArt(c,id,x,y,size*expansion,stage,0,t,visual);
}
export const SOIL_ART=[{soil:'#88532d',ridge:'#b17943',frame:'#ad773c',badge:'#e1bf7e'},{soil:'#67482c',ridge:'#94633a',frame:'#758444',badge:'#d4dfab'},{soil:'#493b28',ridge:'#795637',frame:'#b4925b',badge:'#f0d58a'}];
export function drawIcon(canvas,id,variant=0){canvas.width=120;canvas.height=120;let c=canvas.getContext('2d');c.clearRect(0,0,120,120);if(!sprite(c,id,60,116,112,112))plantArt(c,id,60,crop(id).shape==='tree'?87:75,crop(id).shape==='tree'?.95:1.1,3,0);}
export const POSITIONS=Array.from({length:12},(_,i)=>({x:142+(i%3)*218,y:382+Math.floor(i/3)*143}));
export const SCENE_WIDTH=720,SCENE_HEIGHT=960;
function round(c,x,y,w,h,r,fill,stroke){c.beginPath();c.roundRect(x,y,w,h,r);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=3;c.stroke();}}
function paintedMelonLeaf(c,x,y,angle,scale){
 c.save();
 c.translate(x,y);
 c.rotate(angle);
 c.scale(scale,scale);
 const green=c.createLinearGradient(-16,-35,18,1);
 green.addColorStop(0,'#9fb867');
 green.addColorStop(.52,'#618b4d');
 green.addColorStop(1,'#385f42');
 c.beginPath();
 c.moveTo(0,0);
 c.bezierCurveTo(-23,-8,-25,-25,-13,-25);
 c.bezierCurveTo(-17,-39,-4,-33,0,-45);
 c.bezierCurveTo(5,-33,20,-36,15,-25);
 c.bezierCurveTo(29,-24,20,-7,0,0);
 c.fillStyle=green;
 c.fill();
 line(c,0,-2,0,-37,'#c7d38c99',1.4);
 for(const side of [-1,1]){
  line(c,0,-12,side*13,-23,'#b1c28088',1);
  line(c,0,-23,side*9,-30,'#b1c28077',1);
 }
 c.restore();
}

function drawStarMelon(c,x,y,v){
 c.save();
 c.translate(x,y+14);
 const full=v.phase===4;
 const leafScale=v.phase===0?.72:.9+v.progress*.55;
 const spread=v.phase===0?15:40+v.progress*16;
 ellipse(c,0,9,spread+5,8,'#26341f3d');
 for(const side of [-1,1]){
  line(c,0,4,side*spread,-14,'#537248',4);
  paintedMelonLeaf(c,side*spread,-12,side*.94,leafScale);
  if(v.phase>0)paintedMelonLeaf(c,side*spread*.47,-20,side*.58,leafScale*.94);
 }
 paintedMelonLeaf(c,0,-8,-.12,leafScale);
 if(v.phase===2)blossom(c,24,-29,'#ae8743',7,'#f4d37d');
 if(v.phase>=3){
  const size=full?35:14+v.progress*9;
  for(const [dx,dy,scale] of [[-16,-12,1],[37,1,.65]]){
   const r=size*scale;
   const blue=c.createLinearGradient(dx-r,dy-r,dx+r,dy+r);
   blue.addColorStop(0,full?'#e0e6d9':'#c3cb91');
   blue.addColorStop(.43,full?'#91a7c7':'#849b69');
   blue.addColorStop(1,full?'#495979':'#45654a');
   ellipse(c,dx+2,dy+r*.65,r*.93,r*.22,'#25372349');
   ellipse(c,dx,dy,r,r*.79,blue);
   for(const rib of [-.55,0,.55]){
    c.beginPath();
    c.moveTo(dx,dy-r*.72);
    c.quadraticCurveTo(dx+r*1.45*rib,dy,dx+r*rib*.3,dy+r*.74);
    c.lineWidth=1.4;
    c.strokeStyle=full?'#e7ebdd6b':'#dae3b054';
    c.stroke();
   }
   line(c,dx,dy-r*.69,dx+4,dy-r*.95,'#66704e',3);
  }
  paintedMelonLeaf(c,-50,5,-1.1,.95);
  if(full)star(c,-21,-31,6,'#fff1c7');
 }
 c.restore();
}

export function drawPlant(c,id,x,y,v,t=0,soil=0,wet=false){
 if(id==='starwumpkin'){drawStarMelon(c,x,y,v);return;}
 const p=growthProfile(id,v),scale=v.phase===0?Math.max(.36,p.scale):p.scale,w=p.width*scale*(v.phase>=3?1.08:1),h=p.height*scale,base=y+25;
 c.save();
 // All silhouettes share a planted baseline. Root crops disappear beneath the soil lip.
 ellipse(c,x+3,y+19,Math.max(9,w*.29),Math.max(3,w*.052),'#322b203c');
 if(p.buried){c.beginPath();c.rect(x-105,y-190,210,205);c.clip();}
 const leafReady=sprite(c,id,x,base,w,h,true);
 if(!leafReady){growingPlant(c,id,x,y-8,p.scale*.95,{...v,phase:Math.min(v.phase,2)},t);}
 if(p.mix>0){c.save();c.globalAlpha=p.mix;if(!sprite(c,id,x,base,w,h)&&v.phase===4)growingPlant(c,id,x,y-8,.95,v,t);c.restore();}
 const flowerColor=id==='moon'?'#bda4df':id==='strawflower'?'#e19aa4':id==='peach'||id==='cherry'?'#efbec7':id==='tomato'||id==='cucumber'||id==='pumpkin'?'#e8cc58':'#f0e1b3';
 if(p.flowers>.03){c.save();c.globalAlpha=p.flowers*.9;let points=p.family==='tree'?[[-40,-88],[14,-105],[45,-74],[-10,-61]]:p.family==='vine'?[[-42,-65],[25,-89],[35,-36]]:[[-34,-52],[13,-69],[38,-43]];for(let [dx,dy]of points)blossom(c,x+dx*p.scale,y+dy*p.scale,'#ccb05e',4.3*p.scale,flowerColor);c.restore();}
 if(p.grain>.03){c.save();c.globalAlpha=p.grain;for(let k=-1;k<=1;k++){let xx=x+k*31*p.scale,yy=y-70*p.scale;line(c,xx,y+9,xx,yy-17,'#638936',2);if(id==='corn'){for(let j=0;j<4;j++)line(c,xx,yy-8,xx+(j-1.5)*9,yy-26,'#c4b966',2);}else for(let j=0;j<5;j++){ellipse(c,xx-3,yy-j*6,3,4,'#9ab156');ellipse(c,xx+3,yy-j*6-3,3,4,'#a8b965');}}c.restore();}
 c.restore();
 if(p.buried){const dirt=wet?'#59412c':SOIL_ART[soil].soil;for(let j=-3;j<=3;j++)ellipse(c,x+j*13,y+16+Math.sin(j*2)*1.5,8,2.1,dirt);}
}
function harvestToken(c,id,x,y,size){if(!id)return;const shape=crop(id).shape;c.save();c.translate(x,y);c.scale(size,size);if(['tree','pepper','tomato','vine'].includes(shape)){ellipse(c,-8,0,15,shape==='vine'?22:16,crop(id).color,'#52623b');ellipse(c,13,5,13,shape==='vine'?20:15,crop(id).color,'#52623b');line(c,0,-11,0,-26,'#64713e',3);leaf(c,0,-19,.6,.5);}else if(id==='blueberry'){for(let j=0;j<5;j++)ellipse(c,Math.sin(j*2.4)*14,Math.cos(j*2.4)*13,10,10,'#6f8ba6','#4c6574');}else plantArt(c,id,0,0,.75,3,0,0);c.restore();}
function soilPath(c,x,y){
 c.beginPath();
 c.moveTo(x-81,y-33);
 c.bezierCurveTo(x-64,y-45,x-33,y-41,x-9,y-44);
 c.bezierCurveTo(x+32,y-43,x+71,y-45,x+87,y-30);
 c.bezierCurveTo(x+96,y-15,x+92,y-5,x+98,y+9);
 c.bezierCurveTo(x+97,y+25,x+105,y+37,x+81,y+47);
 c.bezierCurveTo(x+45,y+56,x+18,y+47,x-9,y+52);
 c.bezierCurveTo(x-31,y+53,x-50,y+47,x-71,y+50);
 c.bezierCurveTo(x-103,y+46,x-100,y+32,x-97,y+20);
 c.bezierCurveTo(x-97,y+2,x-96,y-21,x-81,y-33);
 c.closePath();
}
const soilArtTier=(s,i)=>s.fieldProgress?Math.min(2,Math.floor((s.soil?.[i]||0)/3)):(s.soil?.[i]||0);
function drawGround(c,s,w,h){
 c.clearRect(0,0,w,h);if(images.garden)c.drawImage(images.garden,0,0,w,h);else{c.fillStyle='#d3b175';c.fillRect(0,0,w,h);c.fillStyle='#78a359';c.fillRect(0,0,w,285);}
 for(let i=0;i<12;i++){
  let{x,y}=POSITIONS[i],locked=i>=s.plotCount,soil=soilArtTier(s,i),ground=SOIL_ART[soil],wet=!!s.plots[i]?.watered;
  if(locked){ellipse(c,x,y+18,88,35,'#909b4b33');for(let j=-2;j<=2;j++){let yy=y+13+Math.sin(j*3)*17;leaf(c,x+j*30,yy,j*.35,.7);ellipse(c,x+j*34+11,yy+9,7,4,j%2?'#ba9d65':'#d8bc85','#9e8852');}continue;}
  c.save();
  ellipse(c,x+5,y+43,103,23,'#2d392b37');
  ellipse(c,x+3,y+36,101,20,'#3c432842');
  soilPath(c,x,y+9);
  c.fillStyle=wet?'#4d4131':soil===2?'#594430':'#684a32';
  c.fill();
  soilPath(c,x,y);
  c.clip();
  const soilLight=c.createLinearGradient(x-72,y-50,x+70,y+56);
  soilLight.addColorStop(0,wet?'#8a684a':'#bc8d60');
  soilLight.addColorStop(.56,ground.soil);
  soilLight.addColorStop(1,wet?'#503e30':'#73563c');
  c.fillStyle=soilLight;
  c.fillRect(x-104,y-58,208,118);
  for(let row=0;row<3;row++){
   const yy=y-28+row*30;
   for(const [dy,color,width] of [[3,'#41372b50',7],[0,'#e2b78445',3]]){
    c.beginPath();
    c.moveTo(x-89,yy+dy+3);
    c.quadraticCurveTo(x-17,yy+dy-13,x+92,yy+dy+2);
    c.strokeStyle=color;
    c.lineWidth=width;
    c.stroke();
   }
  }
  for(let j=0;j<76;j++){
   const xx=x-95+(j*57+i*17)%190;
   const yy=y-46+(j*31+i*11)%97;
   ellipse(c,xx,yy,1+j%4,.8+j%2,j%3?'#e7bc8438':'#332b204b');
  }
  c.restore();
  for(let pebble=0;pebble<9;pebble++){
   const px=x-92+(pebble*47+i*6)%184;
   const py=y+44+(pebble*7+i)%12;
   ellipse(c,px,py,2+pebble%5,1.2+pebble%3*.45,pebble%2?'#896345b8':'#ad865bba');
  }
 }
}
const makeCanvas=()=>typeof document!=='undefined'?document.createElement('canvas'):typeof OffscreenCanvas!=='undefined'?new OffscreenCanvas(1,1):null;
export function createScene(canvas,{createCanvas=makeCanvas}={}){
 const c=canvas.getContext('2d'),w=SCENE_WIDTH,h=SCENE_HEIGHT,ground=createCanvas(),gc=ground?.getContext('2d');let effects=[],groundKey='',plants=new Map(),stats={frames:0,groundBuilds:0,plantBuilds:0};
 const layered=!!(ground&&canvas.parentNode&&canvas.before);if(layered){ground.className='ground-layer';ground.setAttribute('aria-hidden','true');canvas.before(ground);}
 function resize(){let d=Math.min(2,globalThis.devicePixelRatio||1);canvas.width=w*d;canvas.height=h*d;c.setTransform(d,0,0,d,0,0);if(ground){ground.width=w*d;ground.height=h*d;gc.setTransform(d,0,0,d,0,0);}groundKey='';plants.clear();}
 function render(s,now,t,reduced=false,{selected=-1}={}){
  stats.frames++;const assetKey=Object.keys(images).sort().join(',');const key=[!!images.garden,s.plotCount,s.soil?.join(','),s.plots.map(p=>!!p?.watered).join(',')].join('|');
  if(key!==groundKey||!gc){drawGround(gc||c,s,w,h);groundKey=key;stats.groundBuilds++;}
  if(gc){c.clearRect(0,0,w,h);if(!layered)c.drawImage(ground,0,0,w,h);}
  if(!reduced)for(let j=0;j<8;j++){let xx=(j*101+t*7)%720;line(c,xx,919+Math.sin(j)*12,xx+15,919+Math.sin(j)*12,'#d7eee16a',1.5);}
  for(let i=0;i<12;i++){
   let{x,y}=POSITIONS[i],p=s.plots[i],soil=soilArtTier(s,i);if(i>=s.plotCount)continue;
   if(selected===i){c.save();c.strokeStyle='#fff0a9';c.lineWidth=3;c.setLineDash([9,5]);soilPath(c,x,y);c.stroke();c.restore();}
   if(p){
    let v=visualPhase(s,p,now),bucket=Math.floor(v.progress*100),k=[p.id,p.cycle>1,bucket,v.phase,soil,p.watered,assetKey].join('|'),entry=plants.get(i);
    if(!entry||entry.key!==k){let layer=entry?.canvas||createCanvas();if(layer){layer.width=440;layer.height=440;let pc=layer.getContext('2d');pc.setTransform(2,0,0,2,220,360);drawPlant(pc,p.id,0,0,{...v,progress:v.phase===4?1:bucket/100},0,soil,p.watered);entry={key:k,canvas:layer};plants.set(i,entry);stats.plantBuilds++;}}
    c.save();c.translate(x,y);if(!reduced)c.rotate(Math.sin(t*.9+i)*.003);if(entry)c.drawImage(entry.canvas,-110,-180,220,220);else drawPlant(c,p.id,0,0,v,0,soil,p.watered);c.restore();
    if(v.phase===4&&!reduced){
     const twinkle=(1+Math.sin(t*2+i))/2;
     c.save();c.globalAlpha=.65+twinkle*.35;
     star(c,x+66,y-46,7+twinkle*3,'#fff3cb');
     c.restore();
    }
   }else{plants.delete(i);for(let j=-1;j<=1;j++)ellipse(c,x+j*42,y+2,5,2,'#4b392a66');}
  }
  effects=effects.filter(e=>t-e.start<e.life);for(let e of effects){let a=Math.max(0,(t-e.start)/e.life);if(a>1||t<e.start)continue;let{x,y}=e;c.save();c.globalAlpha=1-a;
   if((e.kind==='harvest'||e.kind==='mutation')&&!reduced){
    const mutant=e.kind==='mutation',tx=x+Math.sin(a*Math.PI)*18,ty=y-a*52;
    c.save();
    if(mutant)c.filter='hue-rotate(65deg) saturate(1.35)';
    harvestToken(c,e.id,tx,ty,(mutant?.70:.55)*(1-a*.6));
    c.restore();
    for(let j=0;j<5;j++){
     const px=x+Math.sin(j*2.4)*a*51,py=y-18-Math.cos(j*2.4)*a*25-a*25;
     if(mutant)star(c,px,py,6,'#e5c4fc');
     else ellipse(c,px,py,2,2,'#f7dd83');
    }
   }
   if(e.kind==='plant'&&!reduced)for(let j=-1;j<=1;j++)ellipse(c,x+j*33,y-70+Math.min(70,a*180),3,5,'#e6d39b','#8b6742');
   if(e.kind==='water'&&!reduced)for(let j=0;j<9;j++)ellipse(c,x-60+j*15,y-80+((a*140+j*9)%98),2,5,'#a9e0e0');
   if(e.kind==='soil'){c.strokeStyle='#f7df98';c.lineWidth=4;c.strokeRect(x-100-a*7,y-52-a*7,200+a*14,108+a*14);}
   c.font='bold 23px system-ui';c.textAlign='center';c.lineWidth=4;c.strokeStyle='#516338';c.strokeText(e.text,x,y-77-(reduced?0:a*38));c.fillStyle='#fff4cf';c.fillText(e.text,x,y-77-(reduced?0:a*38));c.restore();}
 }
 resize();return{resize,render,get stats(){return{...stats,cachedPlants:plants.size,layered};},delay(t,reduced=false,covered=false){return frameDelay(effects.some(e=>t-e.start<e.life),reduced,covered);},pop(i,text,kind,now,id=null,delay=0){let p=POSITIONS[i];if(p)effects.push({x:p.x,y:p.y,text,kind,id,start:performance.now()/1000+delay,life:.85});}};
}
