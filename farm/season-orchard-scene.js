import {seasonTreesReady,seasonArtReady} from './season-sprites.js?v=20261122f';
import {branchFruitPoints,orchardFrame,paintOrchardTree,orchardFruit,paintBasket} from './orchard-paint.js?v=20261122f';

const width=720,height=1280;
export const BASKET_POINT={x:616,y:1106};
const {x:basketX,y:basketY}=BASKET_POINT;
const garden=new Image();
garden.src=new URL('./rain-assets/garden.webp',import.meta.url);
const drawOrder=[3,4,0,2,1];

export function createSeasonOrchardScene(canvas){
 const ctx=canvas.getContext('2d'),cache=[];
 let effects=[],recent=[],legacy=false;
 function layer(view,index,points){
  const frame=orchardFrame(index,view),fruits=points.filter(p=>p.index===index);
  const key=JSON.stringify([view.tree.id,view.stage,view.rank?.milestone,seasonTreesReady(),fruits.map(p=>p.token)]);
  if(cache[index]?.key===key)return cache[index];
  const board=cache[index]?.board||document.createElement('canvas');
  board.width=460;board.height=565;
  const x=frame.x-board.width/2,y=frame.y-board.height+37;
  const c=board.getContext('2d');
  c.translate(-x,-y);paintOrchardTree(c,view,frame,fruits,0,true);
  return cache[index]={key,board,x,y,frame};
 }
 function render(views,t,reduced){
  const density=Math.min(2,devicePixelRatio||1);
  const w=Math.round(canvas.clientWidth*density),h=Math.round(canvas.clientHeight*density);
  if(!w||!h)return;
  if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
  ctx.setTransform(w/width,0,0,h/height,0,0);
  if(garden.complete&&garden.naturalWidth)ctx.drawImage(garden,0,0,width,height);
  else{ctx.fillStyle='#d9e7c9';ctx.fillRect(0,0,width,height);}
  const points=branchFruitPoints(views);
  for(const i of drawOrder){
   if(!views[i])continue;
   const {board,x,y,frame}=layer(views[i],i,points);
   ctx.save();ctx.translate(frame.x,frame.y);
   if(!reduced)ctx.rotate(Math.sin(t*.84+i*1.6)*.004);
   ctx.drawImage(board,x-frame.x,y-frame.y);ctx.restore();
  }
  paintBasket(ctx,basketX,basketY,recent.slice(0,Math.max(0,recent.length-effects.length)),legacy);
  for(const event of effects){
   const p=Math.min(1,(t-event.start)/.72);
   orchardFruit(ctx,event.id,event.x+(basketX-event.x)*p,event.y+(basketY-event.y)*p*p-Math.sin(p*Math.PI)*49,event.r*(1-p*.48),event);
  }
 }
 return {
  render,points:branchFruitPoints,ready:seasonArtReady,
  delay:reduced=>reduced?500:effects.length?32:125,
  settle(t,reduced){effects=effects.filter(e=>!reduced&&t-e.start<.72);},
  pop(f,id){effects.push({...f,id,start:performance.now()/1000});},
  setBasket(items,hasLegacy){recent=items;legacy=hasLegacy;},
  clear(){effects=[];},
 };
}
