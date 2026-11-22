import {seasonTreesReady,seasonArtReady} from './season-sprites.js?v=20261122h';
import {ORCHARD_HEIGHT,branchFruitPoints,orchardFrame,paintOrchardBed,paintOrchardTree,paintBasket} from './orchard-paint.js?v=20261122h';

const width=720,height=ORCHARD_HEIGHT;
const garden=new Image();
garden.src=new URL('./rain-assets/orchard-beds.webp',import.meta.url);

function orchardPoints(views,order){
 return branchFruitPoints(views.map((view,index)=>order.includes(index)?view:null));
}
export function createSeasonOrchardScene(canvas,basketCanvas){
 const ctx=canvas.getContext('2d'),cache=[];
 const basketContext=basketCanvas.getContext('2d');
 let basketKey='';
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
 function render(views,drawOrder,t,reduced){
  const density=Math.min(2,devicePixelRatio||1);
  const w=Math.round(canvas.clientWidth*density),h=Math.round(canvas.clientHeight*density);
  if(!w||!h)return;
  if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
  ctx.setTransform(w/width,0,0,h/height,0,0);
  if(garden.complete&&garden.naturalWidth)ctx.drawImage(garden,0,0,width,height);
  else{ctx.fillStyle='#d9e7c9';ctx.fillRect(0,0,width,height);}
  const points=orchardPoints(views,drawOrder);
  for(const i of drawOrder)if(i<views.length)paintOrchardBed(ctx,i,views[i]);
  for(const i of drawOrder){
   if(!views[i])continue;
   const {board,x,y,frame}=layer(views[i],i,points);
   ctx.save();ctx.translate(frame.x,frame.y);
   if(!reduced)ctx.rotate(Math.sin(t*.84+i*1.6)*.004);
   ctx.drawImage(board,x-frame.x,y-frame.y);ctx.restore();
  }
 }
 return {
  render,points:orchardPoints,ready:seasonArtReady,
  delay:reduced=>reduced?500:150,
  setBasket(fruits,legacy){
   const key=JSON.stringify([fruits,legacy]);
   if(key===basketKey)return;
   basketKey=key;
   basketContext.clearRect(0,0,150,145);
   paintBasket(basketContext,73,104,fruits,legacy);
  },
 };
}
