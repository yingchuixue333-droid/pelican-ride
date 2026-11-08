// Observe gestures without capturing pointers or blocking native scroll/zoom.
export function bindPlotTaps(root,onTap,{onHold=()=>{},holdMs=550}={}){
 let pending=null,timer=null;
 const indexOf=target=>{let b=target?.closest?.('[data-plot]');if(!b||!root.contains(b))return null;let n=Number(b.dataset.plot);return Number.isInteger(n)&&n>=0&&n<12?n:null;};
 function clearTimer(){clearTimeout(timer);timer=null;}
 function cancel(){clearTimer();pending=null;}
 function down(e){cancel();if(e.isPrimary===false||e.button>0)return;let index=indexOf(e.target);if(index===null)return;pending={id:e.pointerId,index,x:e.clientX,y:e.clientY,moved:false,held:false};if(onHold)timer=setTimeout(()=>{if(pending&&!pending.moved){pending.held=true;onHold(pending.index);}},holdMs);}
 function move(e){if(pending&&pending.id===e.pointerId&&Math.hypot(e.clientX-pending.x,e.clientY-pending.y)>10){pending.moved=true;clearTimer();}}
 function leave(e){if(e.pointerType==='mouse')cancel();}
 function up(){clearTimer();}
 function click(e){let index=indexOf(e.target),tap=pending;cancel();if(index===null)return;if(e.detail===0||tap&&!tap.moved&&!tap.held&&tap.index===index)onTap(index);}
 const handlers={pointerdown:down,pointermove:move,pointerup:up,pointercancel:cancel,pointerleave:leave,click};for(let [name,fn]of Object.entries(handlers))root.addEventListener(name,fn,{passive:true});
 return {cancel,destroy(){for(let[name,fn]of Object.entries(handlers))root.removeEventListener(name,fn);cancel();}};
}
