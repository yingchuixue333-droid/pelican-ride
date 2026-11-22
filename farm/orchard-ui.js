import {treeView,harvestFruit,harvestTree,observeOrchard,sellBasket} from './orchard.js?v=20261123b';
import {exactCountdown} from './presentation.js?v=20261122e';
import {createSeasonOrchardScene} from './season-orchard-scene.js';
import {orchardFrame} from './orchard-paint.js';

export function bindOrchardTaps(root,action){let pending=null;const target=e=>e.target.closest?.('[data-orchard-action]');let down=e=>{pending=null;let b=target(e);if(b&&e.isPrimary!==false&&!(e.button>0))pending={b,id:e.pointerId,x:e.clientX,y:e.clientY,moved:false};},move=e=>{if(pending&&e.pointerId===pending.id&&Math.hypot(e.clientX-pending.x,e.clientY-pending.y)>10)pending.moved=true;},cancel=()=>pending=null,click=e=>{let b=target(e),p=pending;pending=null;if(b&&(e.detail===0||p&&p.b===b&&!p.moved))action(b,e);};let handlers={pointerdown:down,pointermove:move,pointercancel:cancel,click};for(let[k,v]of Object.entries(handlers))root.addEventListener(k,v,{passive:true});return {cancel,destroy(){for(let[k,v]of Object.entries(handlers))root.removeEventListener(k,v);}};}
export function createOrchardUI({getState,now,transact,tone,reduced}){
 const $=id=>document.getElementById(id),panel=$('treeDetails');
 const scene=createSeasonOrchardScene($('orchardCanvas'));
 let active=document.body.classList.contains('orchard-mode'),focus=null,signature='',wasFocused;
 const pending=new Set();
 scene.ready.then(()=>{signature='';update(now());});
 const views=(s=getState(),n=now())=>s.orchard.trees.map((_,i)=>treeView(s,i,n));
 function show(open,index=null){
  if(open){focus=index;wasFocused=document.activeElement;}
  panel.hidden=!open;$('treePanelBackdrop').hidden=!open;
  $('basketText').setAttribute('aria-expanded',String(open&&focus===null));
  if(open){update(now());$('closeTreeDetails').focus({preventScroll:true});}
  else if(active&&wasFocused?.isConnected)wasFocused.focus({preventScroll:true});
 }
 $('basketText').onclick=()=>show(panel.hidden);
 $('closeTreeDetails').onclick=()=>show(false);
 $('treePanelBackdrop').onclick=()=>show(false);
 document.addEventListener('keydown',event=>{
  if(panel.hidden)return;
  if(event.key==='Escape'){event.preventDefault();show(false);}
  if(event.key==='Tab'){
   const buttons=[...panel.querySelectorAll('button')].filter(b=>!b.hidden&&!b.disabled);
   if(event.shiftKey&&document.activeElement===buttons[0]){event.preventDefault();buttons.at(-1)?.focus();}
   else if(!event.shiftKey&&document.activeElement===buttons.at(-1)){event.preventDefault();buttons[0]?.focus();}
  }
 });
 function observe(){
  if(!active)return;
  transact((s,n)=>{observeOrchard(s,n);return [{kind:'observe'}];},{silent:true});
 }
 function page(which){
  show(false);active=which==='orchard';
  document.body.classList.toggle('orchard-mode',active);$('orchardPage').hidden=!active;
  $('orchardTab').setAttribute('aria-pressed',String(active));$('fieldTab').setAttribute('aria-pressed',String(!active));
  scene.clear();window.scrollTo({top:0,behavior:'instant'});
  if(active)observe();update(now());
 }
 $('orchardTab').onclick=()=>page('orchard');
 $('fieldTab').onclick=()=>page('field');
 const treeButtons=Array.from({length:3},(_,i)=>{
  const button=document.createElement('button');
  button.dataset.slot=i;
  button.append(document.createElement('strong'),document.createElement('small'));
  button.onclick=()=>show(true,i);$('treeBrowse').append(button);return button;
 });
 const gesture=bindOrchardTaps($('orchardStage'),(button,event)=>{
  let i=Number(button.dataset.index),token=button.dataset.token;
  if(token&&event.detail&&Number.isFinite(event.clientX)){
   const bounds=$('orchardStage').getBoundingClientRect();
   const dx=p=>(p.x/720)*bounds.width+bounds.left-event.clientX;
   const dy=p=>(p.y/1280)*bounds.height+bounds.top-event.clientY;
   const nearest=scene.points(views()).reduce((best,p)=>
    !best||Math.hypot(dx(p),dy(p))<Math.hypot(dx(best),dy(best))?p:best,null);
   if(nearest){i=nearest.index;token=nearest.token;}
  }
  if(!token){show(true,i);return;}
  if(pending.has(token))return;
  pending.add(token);
  transact((s,n)=>{
   const previous=views(s,n),point=scene.points(previous).find(item=>item.index===i&&item.token===token);
   const event=harvestFruit(s,i,token,n);
   if(!event)return [];
   if(point&&!reduced)scene.pop(point,previous[i].tree.id);
   tone('harvest');return [event];
  }).finally(()=>pending.delete(token));
 });
 $('pickRipe').onclick=()=>transact((s,n)=>s.orchard.trees.map((_,i)=>harvestTree(s,i,n)).filter(Boolean));
 $('pickOrchardAll').onclick=()=>
  focus===null?$('pickRipe').click():transact((s,n)=>[harvestTree(s,focus,n)].filter(Boolean));
 $('sellBasket').onclick=$('sellQuick').onclick=()=>transact((s,n)=>[sellBasket(s,n)].filter(Boolean));

 function update(n){
  if(!active)return;
  const s=getState(),vs=views(s,n),v=focus===null?null:vs[focus],count=s.orchard.basketCount||0;
  const total=vs.reduce((sum,item)=>sum+(item?.stored||0),0),value=s.orchard.basketValue||0;
  scene.setBasket(s.orchard.basketRecent||[]);
  $('basketText').textContent='果篮 · '+count;
  $('pickRipe').hidden=!total;$('pickRipe').textContent='摘熟果 · '+total;
  $('sellQuick').hidden=!count;$('sellQuick').textContent='卖果 · '+value+' 金币';
  $('treeDetailName').textContent=v?v.kind.name:'果篮';
  $('treeDetailYield').textContent=v?v.label+' · '+(v.stored?v.stored+' 颗可摘':'没有熟果'):count?count+' 颗 · 可卖 '+value+' 金币':'果篮空着，点枝上的熟果就能摘。';
  $('treeDetailTime').textContent=v?'Lv.'+v.rank.level+(v.rank.need?' · '+v.rank.xp+' / '+v.rank.need+' 经验':' · 满级')+
   (v.stored===4?' · 已挂满':' · 下颗还剩 '+exactCountdown((v.next-n)/1000)):'';
  $('sellBasket').hidden=!!v||!count;
  $('sellBasket').textContent='全部卖出 · '+value+' 金币';
  $('pickOrchardAll').hidden=!(v?v.stored:total);
  $('pickOrchardAll').textContent=v?'摘这棵树的熟果':'摘全部熟果';
  for(const [i,b] of treeButtons.entries()){
   const tree=vs[i];
   b.firstElementChild.textContent=tree?.kind.name??['桃树','李子树','梨树'][i];
   b.lastElementChild.textContent=tree?.stored?tree.stored+' 颗可摘':'';
   b.dataset.ripe=String(!!tree?.stored);
  }
  const sig=JSON.stringify(vs.map(tree=>tree&&[tree.tree.id,tree.stage,tree.fruits.map(f=>f.token)]));
  if(sig===signature)return;
  signature=sig;
  const hits=$('orchardHits');
  hits.replaceChildren();
  for(const [i,tree] of vs.entries()){
   if(!tree)continue;
   const frame=orchardFrame(i,tree),button=document.createElement('button');
   button.className='tree-touch';button.dataset.orchardAction='tree';button.dataset.index=i;
   button.style.left=frame.x/720*100+'%';button.style.top=(frame.y-128*frame.scale)/1280*100+'%';
   button.setAttribute('aria-label','查看'+tree.kind.name+'的结果时间');hits.append(button);
  }
  for(const f of scene.points(vs)){
   const button=document.createElement('button');
   button.className='fruit-touch';button.dataset.orchardAction='fruit';
   button.dataset.index=f.index;button.dataset.token=f.token;
   button.style.left=f.x/720*100+'%';button.style.top=f.y/1280*100+'%';
   button.setAttribute('aria-label','摘一颗'+['桃子','李子','梨子'][f.index]);
   hits.append(button);
  }
 }
 function render(t){if(active){scene.settle(t,reduced);scene.render(views(),t,reduced);}}
 document.addEventListener('visibilitychange',()=>{if(document.hidden){scene.clear();gesture.cancel();}});
 return {update,render,observe,get active(){return active;},delay:()=>scene.delay(reduced)};
}
