import {oval,stroke} from './field-paint.js';

export const WATER_GATE={x:641,y:856};
const side=695;

function ditch(c,from,bend,to,flow){
 stroke(c,from,bend,to,'#694b33b8',9);
 stroke(c,from,bend,to,'#b48d58',5.4);
 if(flow)stroke(c,from,bend,to,'#62bfd4',3.5);
}
export function paintIrrigationGround(c,positions){
 const {x,y}=WATER_GATE;
 ditch(c,[x,y+31],[side+8,y-8],[side,positions[0].y+41],false);
 for(let row=0;row<4;row++){
  const p=positions[row*3+2],edge=p.y+49;
  ditch(c,[side,edge],[p.x+38,edge+20],[p.x-77,edge+4],false);
 }
 oval(c,x+12,y+10,46,13,'#243e3763',-.17);
 stroke(c,[x-26,y+13],[x+16,y+37],[x+38,y+13],'#675843',15);
 stroke(c,[x-27,y+9],[x+16,y+32],[x+38,y+9],'#b69b6f',8);
 for(const offset of [-31,29]){
  stroke(c,[x+offset,y+14],[x+offset-2,y-9],[x+offset-4,y-26],'#6b4834',11);
  stroke(c,[x+offset-2,y+12],[x+offset-4,y-9],[x+offset-6,y-25],'#b17a48',4);
 }
 stroke(c,[x-38,y-22],[x,y-26],[x+33,y-21],'#6a4936',12);
 stroke(c,[x-38,y-24],[x,y-27],[x+33,y-24],'#dbac6b',5);
 for(const offset of [-14,0,14])stroke(c,[x+offset,y-20],[x+offset,y-6],[x+offset,y+8],'#9a724a',9);
 stroke(c,[x-24,y-4],[x,y-6],[x+23,y-4],'#d9a46a',4);
 stroke(c,[x+5,y-29],[x+11,y-42],[x+16,y-52],'#805635',5);
 oval(c,x+16,y-52,10,5,'#c99052',-.25);
}

export function paintIrrigationFlow(c,positions,indices,age,reduced){
 const {x,y}=WATER_GATE;
 const pct=reduced?1:Math.min(1,age/.75);
 const furthest=Math.min(...indices.map(i=>positions[i].y+48));
 c.save();
 c.globalAlpha=age>1?Math.max(0,(1.6-age)/.6):.94;
 const front=y+27+(furthest-y-27)*pct;
 stroke(c,[x,y+31],[side+10,y-13],[side,front],'#64c3d8',6);
 stroke(c,[x+1,y+30],[side+7,y-13],[side,front],'#d1f1ee',2);
 for(const i of indices){
  const {x,y}=positions[i],edge=y+48;
  if(front>edge+10)continue;
  stroke(c,[side,edge],[x+44,edge+13],[x+44,edge-6],'#63c0d4',5);
  stroke(c,[side-5,edge],[x+48,edge+11],[x+44,edge-6],'#d5f6ed',1.7);
 }
 c.restore();
}
