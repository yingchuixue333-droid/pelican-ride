import {CROPS,crop,growth,ready} from './model.js?v=20261108a';
import {sprite,images,assetsReady} from './assets.js?v=20261108b';
export {assetsReady};
import {visualPhase} from './presentation.js?v=20261108a';
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
function blossom(c,x,y,color,r=4){for(let j=0;j<5;j++)ellipse(c,x+Math.cos(j*1.256)*r,y+Math.sin(j*1.256)*r,r*.7,r*.7,'#f4e5ce');ellipse(c,x,y,r*.55,r*.55,color);}
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
function canopy(c,id,x,y,size,v,t){
 // Established plants keep a full stem/canopy; flowers and fruit return over the cycle.
 if(v.phase===4&&sprite(c,id,x,y+30,178*size,165*size))return;
 if(v.phase===3&&v.progress>.82&&sprite(c,id,x,y+30,170*size,157*size))return;
 const shape=crop(id).shape;
 if(v.phase===0){for(let dx of [-42,0,42])plantArt(c,id,x+dx,y-2,.67,0,0,t);return;}
 if(shape==='tree'){
  if(id==='banana'){line(c,x,y+4,x,y-82,'#8a8f43',9);for(let j=-2;j<=2;j++){c.save();c.translate(x,y-71);c.rotate(j*.45);ellipse(c,0,-28,13,47,j%2?'#7ba33b':'#4c8536', '#3d6934');c.restore();}}
  else{line(c,x,y+6,x,y-70,'#86603c',10);for(let k of [-1,1])line(c,x,y-24,x+k*34,y-64,'#795c37',5);for(let j=-1;j<=1;j++){ellipse(c,x+j*34,y-65-(j===0?20:0),38,36,'#4d8537','#3f6b2e');ellipse(c,x+j*34-6,y-76-(j===0?20:0),25,20,'#79a94b');}}
  if(v.phase===2)for(let j=0;j<5;j++)blossom(c,x+Math.sin(j*2.4)*47,y-65+Math.cos(j*2.4)*24,'#e3c36c',5);
  if(v.phase===3)for(let j=0;j<6;j++)ellipse(c,x+Math.sin(j*2.4)*49,y-66+Math.cos(j*2.4)*28,5,6,blendColor('#739644',crop(id).color,Math.max(0,(v.progress-.5)*2)),'#52713b');
 }else{
  const established=v.established,scale=established?1:v.phase===1?.72:.95;
  if(sprite(c,'seedling',x,y+8,144*scale,133*scale)){
   if(['vine','tomato','grape','pod'].includes(shape)){line(c,x-46,y+5,x-46,y-89,'#977447',5);line(c,x+46,y+5,x+46,y-89,'#977447',5);line(c,x-46,y-69,x+46,y-69,'#af8a57',4);}
   if(v.phase===2&&!['leaf','root','wheat','corn','radish','carrot','mushroom','lotus'].includes(shape))for(let j=-1;j<=1;j++)blossom(c,x+j*28,y-42-Math.abs(j)*6,'#dabd59',5);
   if(v.phase===3)for(let j=-1;j<=1;j++)ellipse(c,x+j*29,y-24,6,8,blendColor('#84a147',crop(id).color,.35),'#57703a');
  }else for(let dx of [-34,26])growingPlant(c,id,x+dx,y-8,.8,v,t);
 }
}
export function createScene(canvas){const c=canvas.getContext('2d'),w=SCENE_WIDTH,h=SCENE_HEIGHT;let effects=[];
 function resize(){let d=Math.min(2,globalThis.devicePixelRatio||1);canvas.width=w*d;canvas.height=h*d;c.setTransform(d,0,0,d,0,0);}
 function render(s,now,t,reduced=false,{selected=-1}={}){
  c.clearRect(0,0,w,h);if(images.garden)c.drawImage(images.garden,0,0,w,h);else{c.fillStyle='#d3b175';c.fillRect(0,0,w,h);c.fillStyle='#78a359';c.fillRect(0,0,w,285);}
  // Water highlights are short strokes rather than a full-screen particle layer.
  if(!reduced)for(let j=0;j<8;j++){let x=(j*101+t*13)%720;line(c,x,919+Math.sin(j)*12,x+17,919+Math.sin(j)*12,'#d7eee18a',2);}
  for(let i=0;i<12;i++){
   let{x,y}=POSITIONS[i],p=s.plots[i],locked=i>=s.plotCount,soil=s.soil?.[i]||0,ground=SOIL_ART[soil];
   if(locked){ellipse(c,x,y+18,88,35,'#909b4b33');for(let j=-2;j<=2;j++){let yy=y+13+Math.sin(j*3)*17;leaf(c,x+j*30,yy,j*.35,.7);ellipse(c,x+j*34+11,yy+9,7,4,j%2?'#ba9d65':'#d8bc85','#9e8852');}continue;}
   c.save();ellipse(c,x+4,y+41,101,21,'#724c3030');
   // Irregular earthen mound: no planter-box frame or flat card shape.
   c.beginPath();c.moveTo(x-88,y-43);c.quadraticCurveTo(x-37,y-55,x+67,y-48);c.quadraticCurveTo(x+96,y-48,x+98,y-17);c.lineTo(x+96,y+30);c.quadraticCurveTo(x+94,y+56,x+66,y+57);c.lineTo(x-72,y+58);c.quadraticCurveTo(x-103,y+55,x-100,y+24);c.lineTo(x-98,y-13);c.quadraticCurveTo(x-100,y-36,x-88,y-43);c.closePath();c.fillStyle=ground.frame;c.fill();c.strokeStyle='#86532d';c.lineWidth=3;c.stroke();
   c.save();c.clip();c.fillStyle=ground.soil;c.fillRect(x-92,y-45,183,94);
   for(let k=0;k<5;k++){let yy=y-31+k*17;c.beginPath();c.moveTo(x-79,yy);c.quadraticCurveTo(x,yy-4,x+78,yy+1);c.strokeStyle=ground.ridge;c.globalAlpha=.45;c.lineWidth=3;c.stroke();}c.globalAlpha=1;c.restore();
   for(let j=0;j<85;j++){let xx=x-83+(j*37%164),yy=y-43+(j*29%83);ellipse(c,xx,yy,2+(j%3),1.3,j%2?'#deb17699':'#3b2d2255');}
   if(p?.watered){c.globalAlpha=.23;c.fillStyle='#3f392c';c.beginPath();c.roundRect(x-90,y-48,180,97,18);c.fill();c.globalAlpha=1;for(let j=-1;j<=1;j++)ellipse(c,x+j*53,y+30,13,4,'#84b8ad88');}
   if(selected===i){c.strokeStyle='#fff0a9';c.lineWidth=4;c.setLineDash([9,5]);c.beginPath();c.roundRect(x-101,y-57,202,116,23);c.stroke();c.setLineDash([]);}
   if(p){let v=visualPhase(s,p,now);c.save();let sway=reduced?0:Math.sin(t*1.3+i)*.007;c.translate(x,y);c.rotate(sway);canopy(c,p.id,0,0,1,v,reduced?0:t);c.restore();if(v.phase===4){ellipse(c,x+79,y-62,13,13,'#fff3bf','#a38d4d');line(c,x+73,y-62,x+77,y-58,'#527d36',3);line(c,x+77,y-58,x+85,y-67,'#527d36',3);}}
   else for(let j=-1;j<=1;j++)ellipse(c,x+j*42,y+2,5,2,'#4b392a66');
   c.fillStyle=ground.badge;c.font='bold 14px Georgia';c.textAlign='center';c.fillText(['I','II','III'][soil],x-79,y+44);c.restore();
  }
  effects=effects.filter(e=>t-e.start<e.life);for(let e of effects){let a=Math.max(0,(t-e.start)/e.life);if(a>1||t<e.start)continue;let{x,y}=e;c.save();c.globalAlpha=1-a;
   if(e.kind==='harvest'&&!reduced){let tx=x+(650-x)*a,ty=y-(y-45)*a;sprite(c,e.id,tx,ty,75*(1-a*.6),75*(1-a*.6));for(let j=0;j<5;j++)ellipse(c,x+Math.sin(j*2.4)*a*51,y-18-Math.cos(j*2.4)*a*25-a*25,2,2,'#f7dd83');}
   if(e.kind==='plant'&&!reduced)for(let j=-1;j<=1;j++)ellipse(c,x+j*33,y-70+Math.min(70,a*180),3,5,'#e6d39b','#8b6742');
   if(e.kind==='water'&&!reduced)for(let j=0;j<9;j++)ellipse(c,x-60+j*15,y-80+((a*140+j*9)%98),2,5,'#a9e0e0');
   if(e.kind==='soil'){c.strokeStyle='#f7df98';c.lineWidth=4;c.strokeRect(x-100-a*7,y-52-a*7,200+a*14,108+a*14);}
   c.font='bold 23px system-ui';c.textAlign='center';c.lineWidth=4;c.strokeStyle='#516338';c.strokeText(e.text,x,y-77-(reduced?0:a*38));c.fillStyle='#fff4cf';c.fillText(e.text,x,y-77-(reduced?0:a*38));c.restore();}
 }
 resize();return{resize,render,pop(i,text,kind,now,id=null,delay=0){let p=POSITIONS[i];if(p)effects.push({x:p.x,y:p.y,text,kind,id,start:performance.now()/1000+delay,life:.85});}};
}
