// Let the browser own scrolling and pinch zoom. A plot changes only on a tap.
export function bindPlotTaps(root,onTap){
 let pending=null;
 const indexOf=target=>{let button=target?.closest?.('[data-plot]');if(!button||!root.contains(button))return null;let n=Number(button.dataset.plot);return Number.isInteger(n)&&n>=0&&n<12?n:null;};
 function down(e){if(e.isPrimary===false){pending=null;return;}if(e.button>0)return;let index=indexOf(e.target);pending=index===null?null:{id:e.pointerId,index,x:e.clientX,y:e.clientY,moved:false};}
 function move(e){if(pending&&pending.id===e.pointerId&&Math.hypot(e.clientX-pending.x,e.clientY-pending.y)>10)pending.moved=true;}
 function cancel(){pending=null;}
 function leave(e){if(e.pointerType==='mouse')cancel();}
 function click(e){let index=indexOf(e.target),tap=pending;pending=null;if(index===null)return;if(e.detail===0||tap&&!tap.moved&&tap.index===index)onTap(index);}
 const handlers={pointerdown:down,pointermove:move,pointercancel:cancel,pointerleave:leave,click};
 for(let [name,fn] of Object.entries(handlers))root.addEventListener(name,fn,{passive:true});
 return {cancel,destroy(){for(let [name,fn] of Object.entries(handlers))root.removeEventListener(name,fn);pending=null;}};
}
