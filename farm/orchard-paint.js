import {treePicture,fruitPicture} from './season-sprites.js?v=20261122i';
import {blade,fruitRound,glaze,oval,stroke} from './field-paint.js';

const schemes={
 peach:{
  bark:['#583835','#906045','#d7a66d'],leaves:['#376540','#72984d','#c4cf76'],
  branches:[[-80,-60,-108,-145,-126,-201],[-24,-117,-72,-241,-91,-284],[30,-94,77,-152,123,-190],[21,-155,62,-231,71,-264],[0,-186,8,-254,1,-319]],
  crown:[[-109,-221,55,48],[-79,-280,66,50],[-14,-316,66,42],[57,-290,64,47],[110,-231,59,46],[-39,-238,59,49],[26,-243,58,44]],
  fruit:[[-107,-199],[-56,-259],[40,-222],[112,-201]],
 },
 plum:{
  bark:['#403537','#755548','#b98c6f'],leaves:['#304e3d','#5a7750','#aeb77c'],
  branches:[[-37,-80,-106,-125,-125,-180],[-26,-109,-55,-157,-85,-237],[20,-117,54,-193,105,-245],[3,-148,-3,-227,46,-281],[29,-105,76,-124,134,-164]],
  crown:[[-106,-206,72,50],[-70,-252,69,46],[4,-285,62,44],[63,-269,68,43],[111,-219,61,46],[100,-174,59,36],[-15,-207,66,51]],
  fruit:[[-109,-182],[-58,-229],[38,-238],[116,-160]],
 },
 pear:{
  bark:['#514136','#87674a','#cba36d'],leaves:['#426747','#83a356','#c9d778'],
  branches:[[-13,-122,-74,-156,-112,-207],[21,-131,70,-170,108,-217],[-1,-182,-48,-224,-66,-277],[9,-195,54,-263,75,-308],[0,-187,13,-295,1,-359]],
  crown:[[-94,-230,58,48],[-59,-280,57,45],[1,-350,57,46],[53,-311,55,48],[96,-235,54,49],[11,-258,55,51],[-24,-211,64,43]],
  fruit:[[-84,-205],[-29,-285],[31,-246],[104,-205]],
 },
};
export const ORCHARD_HEIGHT=1280;
// Slots keep their save indices. Beds only map those indices onto the screen.
export const ORCHARD_BEDS=[[0,2,1,5],[3,4,6]];
const nearLeft={x:164,y:500,z:1.02},nearRight={x:552,y:493,z:1.01};
const frontLeft={x:192,y:867,z:1.18},frontRight={x:514,y:846,z:1.06};
const roots=[nearLeft,frontLeft,nearRight,nearLeft,nearRight,frontRight,frontLeft];
const stageSize=[.39,.68,.87,1];
const matureSites={
 peach:[[.24,.52],[.49,.34],[.67,.55],[.82,.47]],
 plum:[[.22,.50],[.39,.37],[.62,.54],[.82,.45]],
 pear:[[.26,.52],[.46,.33],[.63,.44],[.78,.55]],
 persimmon:[[.21,.47],[.41,.29],[.67,.39],[.82,.51]],
 loquat:[[.22,.48],[.38,.32],[.60,.41],[.78,.49]],
};
const treeWidths={peach:[118,221,276,325],plum:[126,228,277,331],pear:[104,171,224,282],persimmon:[108,183,233,294],loquat:[102,171,218,268]};
function orchardPicture(id,stage,root){
 const image=treePicture(id,stage);
 if(!image)return null;
 const w=treeWidths[id][stage]*root.z,h=w*image.source[3]/image.source[2];
 return {...image,x:root.x-w/2,y:root.y-h+7,w,h};
}
const angle=(value)=>Math.sin(value*2.197);

export function orchardFrame(index,view){
 const root=roots[index],id=view?.tree.id;
 const stage=view?.stage??0,style=schemes[id]||schemes.peach;
 return {...root,stage,scale:root.z*stageSize[stage],style,picture:orchardPicture(id,stage,root)};
}
function bedShape(c,w,y){
 c.beginPath();c.moveTo(-w,y+7);
 c.bezierCurveTo(-w*.96,y-14,-w*.58,y-28,-w*.22,y-27);
 c.bezierCurveTo(w*.07,y-31,w*.56,y-32,w*.85,y-15);
 c.bezierCurveTo(w*1.08,y-9,w*.98,y+17,w*.69,y+23);
 c.bezierCurveTo(w*.25,y+37,-w*.32,y+30,-w*.66,y+27);
 c.bezierCurveTo(-w*.89,y+22,-w,y+17,-w,y+7);c.closePath();
}
export function paintOrchardBed(c,index,view){
 const {x,y,z}=orchardFrame(index,view),w=101*z;
 c.save();c.translate(x,y);
 oval(c,5,16,w*1.07,31*z,'#66503238',-.035);
 bedShape(c,w,12*z);
 c.fillStyle=glaze(c,0,13,w*2,45,['#67462c','#88603b','#ad8053']);c.fill();
 bedShape(c,w,0);
 c.fillStyle=glaze(c,0,4,w*2,58,['#84603a','#ac8252','#c7a46b']);c.fill();c.clip();
 for(let row=0;row<3;row++){
  const ry=8+row*9;
  stroke(c,[-w*.87,ry+5],[-w*.22,ry-8],[w*.82,ry+3],'#684a344a',3.7);
  stroke(c,[-w*.85,ry+1],[-w*.22,ry-12],[w*.8,ry],'#e4bd8455',2.4);
 }
 for(let i=0;i<49;i++){
  const x=((i*59)%207-103)*z,y=((i*41)%55-25)*z;
  oval(c,x,y,.8+i%4*.42,.9+i%3*.35,i%3?'#e2c18e81':'#624a398c',-.2);
 }
 c.restore();
}
export function branchFruitPoints(views){
 return views.flatMap((view,index)=>{
  if(!view)return [];
  const f=orchardFrame(index,view);
  return view.fruits.map(fruit=>{
   const site=(fruit.serial-1)%4;
   if(f.picture){
    const p=f.picture,[x,y]=matureSites[view.tree.id][site];
    return {...fruit,index,x:p.x+x*p.w,y:p.y+y*p.h,r:(f.stage===3?20:f.stage===2?19:17)*f.z};
   }
   const [x,y]=f.style.fruit[site];
   return {...fruit,index,x:f.x+x*f.scale,y:f.y+y*f.scale,r:Math.max(16,22*f.scale),local:[x,y]};
  });
 });
}
function bough(c,x,y,w,points,colors){
 const [cx,cy,dx,dy,tx,ty]=points;
 c.beginPath();c.moveTo(x-w,y);
 c.bezierCurveTo(cx-w*.68,cy,dx-w*.51,dy,tx-2,ty);
 c.bezierCurveTo(dx+w*.70,dy+7,cx+w*.72,cy+4,x+w,y);
 c.closePath();
 c.fillStyle=glaze(c,x,(y+ty)*.47,95,80,colors);c.fill();
 stroke(c,[x-w*.48,y-4],[dx-w*.25,dy+16],[tx,ty],'#ddb17e66',Math.max(1,w*.22));
}
function foliage(c,[x,y,w,h],palette,seed,light=false){
 const tone=light?[palette[0],palette[2], '#e0dc92']:palette;
 oval(c,x,y+6,w*.98,h*.82,glaze(c,x,y,w*1.8,h*1.7,tone),-.07);
 for(let i=0;i<17;i++){
  const a=i*2.399+seed, radius=Math.sqrt((i+.4)/17);
  const xx=x+Math.cos(a)*w*radius,yy=y+Math.sin(a)*h*radius;
  const len=15+(i*7+seed)%19;
  blade(c,xx,yy,len,7+(i%4)*2,a*.64,tone,i%5===0);
 }
 stroke(c,[x-w*.48,y-h*.47],[x-w*.17,y-h*.78],[x+w*.13,y-h*.72],'#f1df9c48',2.4);
}
export function orchardFruit(c,id,x,y,r,look={}){
 if(fruitPicture(c,id,x,y,r,look))return;
 const k=look.size||1;
 c.save();c.translate(x,y);c.rotate(look.turn||0);c.scale(k,k);
 if(id==='pear'){
  c.beginPath();c.moveTo(-6,-r*.97);
  c.bezierCurveTo(12,-r*1.06,7,-r*.5,r*.69,-r*.12);
  c.bezierCurveTo(r*1.28,r*.9,r*.53,r*1.16,0,r*1.13);
  c.bezierCurveTo(-r*.95,r*1.14,-r*1.25,r*.56,-r*.79,r*.01);
  c.bezierCurveTo(-r*.45,-r*.42,-r*.47,-r*.86,-6,-r*.97);
  c.fillStyle=glaze(c,0,0,r*2,r*2,['#99762d','#deb95e','#fbdfa0']);c.fill();
  for(let i=0;i<12;i++)oval(c,((i*17)%23-11)*r*.06,((i*29)%23-7)*r*.058,1.2,.8,'#9e7c4670');
 }else if(id==='persimmon'){
  fruitRound(c,0,0,r*.98,r*.79,['#a84b22','#e78b39','#ffd484'],.04);
  stroke(c,[r*.12,-r*.6],[r*.27,0],[r*.04,r*.65],'#a64e2659',1.3);
  for(let i=0;i<4;i++)blade(c,0,-r*.6,r*.62,r*.23,i*1.37,['#55542f','#788545','#afad63']);
 }else if(id==='loquat'){
  fruitRound(c,0,0,r*.71,r*.94,['#a7662f','#e0a249','#ffe09c'],-.15);
  oval(c,r*.13,r*.75,r*.14,r*.09,'#775035',-.1);
  for(let i=0;i<7;i++)oval(c,((i*7)%13-6)*r*.078,((i*11)%15-5)*r*.07,.7,.55,'#a06b4057');
 }else if(id==='plum'){
  fruitRound(c,0,0,r*.84,r*1.02,['#4b304f','#795078','#c791a9'],-.17);
  stroke(c,[0,-r*.75],[r*.33,-r*.08],[r*.12,r*.79],'#472d505c',2);
  for(let i=0;i<30;i++){
   const a=i*2.399,rad=Math.sqrt(i/30)*r*.75;
   oval(c,Math.cos(a)*rad,Math.sin(a)*rad,1.1+(i%3)*.24,.85,i%3?'#d5a6b279':'#5b3d575c',a);
  }
  stroke(c,[-r*.61,-r*.35],[-r*.44,-r*.72],[-r*.18,-r*.68],'#dfb3c989',2);
 }else{
  fruitRound(c,0,0,r*.98,r*.92,['#a34f49','#e38671','#ffd39d'],.14);
  stroke(c,[r*.04,-r*.76],[r*.6,-r*.18],[r*.13,r*.88],'#b659586e',2);
 }
 stroke(c,[0,-r*.71],[-r*.22,-r*1.18],[-r*.04,-r*1.42],'#887044',Math.max(1.5,r*.13));
 blade(c,0,-r*.87,r*.75,r*.25,.86,['#47704c','#83a25c','#c7d382']);
 c.restore();
}
function wood(c,frame){
 const {style,stage}=frame,p=style.bark;
 for(let i=0;i<3;i++){
  const x=(i-1)*16;
  stroke(c,[x*.46,-8],[x,3],[x*1.62+1,9-i],p[0],10-i);
  stroke(c,[x*.38,-12],[x,2],[x*1.52,7-i],p[1],5-i*.6);
 }
 const trunk=style===schemes.plum?[4,-56,-35,-149,-25,-229]:style===schemes.pear?[8,-86,-6,-178,5,-253]:[-20,-81,25,-151,4,-215];
 bough(c,0,-1,stage===0?13:25,trunk,p);
 const count=[2,4,5,5][stage];
 for(let i=0;i<count;i++){
  const branch=style.branches[i];
  bough(c,style===schemes.plum?-10:4,branch[1]+43,stage===0?8:14-i,branch,p);
  if(stage>0){
   const [,,dx,dy,tx,ty]=branch;
   stroke(c,[dx,dy],[dx+(tx-dx)*.92,dy-33],[tx+(i%2?18:-19),ty-32],p[1],4);
  }
 }
 for(let i=0;i<6;i++){
  const yy=-15-i*23,xx=angle(i)*9;
  stroke(c,[xx-2,yy],[xx-8,yy-11],[xx-1,yy-19],'#4e373855',2);
 }
}
function blossom(c,x,y,r,petals){
 for(let i=0;i<5;i++){
  const angle=i*Math.PI*.4;
  oval(c,x+r*Math.cos(angle),y+r*Math.sin(angle),r*.69,r*.51,petals,angle);
 }
 oval(c,x,y,2.2,1.7,'#d4a559');
}
export function paintOrchardTree(c,view,frame,fruits,t,reduced){
 const {x,y,scale,stage,style}=frame,id=view.tree.id,wind=reduced?0:Math.sin(t*.74+x)*.004;
 oval(c,x+17,y+9,76*scale,16*scale,'#53563049',-.08);
 oval(c,x+1,y+3,41*scale,10*scale,'#423c2a4a');
 if(frame.picture){
  const p=frame.picture;
  c.drawImage(p.image,...p.source,p.x,p.y,p.w,p.h);
  for(const f of fruits){
   const {x,y,r}=f;
   stroke(c,[x-8,y-r*1.52],[x-2,y-r*1.43],[x,y-r*.82],style.bark[1],2.2);
   orchardFruit(c,id,x,y,r,f);
   c.save();c.beginPath();c.moveTo(x-r*.92,y-r*1.55);
   c.quadraticCurveTo(x-r*.28,y-r*.73,x+r*.53,y-r*1.1);
   c.lineTo(x+r*.45,y-r*1.76);c.closePath();c.clip();
   c.drawImage(p.image,...p.source,p.x,p.y,p.w,p.h);
   c.restore();
  }
  return;
 }
 c.save();c.translate(x,y);c.scale(scale,scale);c.rotate(wind);
 const clusters=stage===0?style.crown.slice(0,3).map(([x,y,w,h],i)=>[x*.72,y*.88,w*.65,h*.75]):stage===1?style.crown.slice(0,5):style.crown;
 for(let i=0;i<clusters.length;i++)if(i%2===0)foliage(c,clusters[i],style.leaves,i+stage);
 wood(c,frame);
 for(let i=0;i<clusters.length;i++)if(i%2||stage===0)foliage(c,clusters[i],style.leaves,i+stage,i%3===1);
 if(stage>0){
  const flowers=['#f5c0bb','#ebdbe4','#f8e7c5'][style===schemes.peach?0:style===schemes.plum?1:2];
  for(let i=0;i<Math.min(7,stage+(view.rank?.milestone||0));i++){
   const [cx,cy,w,h]=clusters[i%clusters.length];
   blossom(c,cx+w*.32+Math.sin(i)*7,cy+h*.45,4.1+i%2,flowers);
  }
 }
 c.restore();
 for(const f of fruits){
  const r=f.r,xx=f.x,yy=f.y;
  stroke(c,[xx-8,yy-r*1.75],[xx-1,yy-r*1.55],[xx,yy-r*.87],style.bark[1],2.4);
  orchardFruit(c,id,xx,yy,r,f);
  blade(c,xx-4,yy-r*.81,r*.95,r*.29,-1.07,style.leaves);
 }
}
export function paintBasket(c,x,y,items,legacy){
 oval(c,x+9,y+20,65,15,'#4d382d52');
 // Handle and the shaded mouth sit behind the fruit.
 stroke(c,[x-49,y-7],[x-10,y-130],[x+50,y-7],'#70492e',13);
 stroke(c,[x-49,y-11],[x-10,y-130],[x+50,y-11],'#d0a46c',7);
 for(let i=0;i<11;i++){
  const k=i/10,u=1-k,hx=u*u*(x-49)+2*u*k*(x-10)+k*k*(x+50);
  const hy=u*u*(y-11)+2*u*k*(y-130)+k*k*(y-11);
  stroke(c,[hx-3,hy+1],[hx,hy-2],[hx+4,hy-1],'#8e6245',2.1);
 }
 oval(c,x,y-16,58,19,glaze(c,x,y-16,116,42,['#4c362b','#885c3d','#d9a578']));
 oval(c,x,y-17,51,14,'#624634');
 if(legacy)oval(c,x-3,y-24,37,10,glaze(c,x,y-25,62,26,['#6e7450','#a4a67b','#d7cb9b']),-.09);
 const places=[[-30,-21],[25,-20],[-11,-30],[11,-20]];
 for(const [i,id] of items.slice(-4).entries()){
  const [dx,dy]=places[i];
  orchardFruit(c,id,x+dx,y+dy,i%2?14:15,{turn:(i-1)*.12});
 }
 c.save();c.beginPath();c.moveTo(x-58,y-16);c.quadraticCurveTo(x,y+5,x+58,y-16);
 c.lineTo(x+41,y+23);c.quadraticCurveTo(x,y+44,x-41,y+23);c.closePath();
 c.fillStyle=glaze(c,x,y,116,56,['#805233','#ba8658','#e8b582']);c.fill();c.clip();
 for(let row=0;row<7;row++){
  const yy=y-15+row*7;
  stroke(c,[x-60,yy],[x,yy+23],[x+60,yy],row%2?'#a16b46':'#dbaf7b',4);
  for(let i=-6;i<=6;i++){
   const xx=x+i*9+(row%2?4:0),lift=10*(1-Math.pow(i/7,2));
   stroke(c,[xx-1,yy+lift-2],[xx+1,yy+lift+2],[xx,yy+lift+6],i%3?'#7b543b8c':'#f2c99ab0',1.55);
  }
 }
 c.restore();
 stroke(c,[x-59,y-17],[x,y+8],[x+59,y-17],'#e5b784',5);
 stroke(c,[x-41,y+23],[x,y+39],[x+41,y+23],'#855638',5);
}
