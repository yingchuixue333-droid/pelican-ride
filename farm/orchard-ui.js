import {basketLots,harvestFruit,harvestTree,observeOrchard,orchardKind,ORCHARD_SITES,plantTree,sellBasket,treeView} from './orchard.js?v=20261122f';
import {exactCountdown} from './presentation.js?v=20261122f';
import {BASKET_POINT,createSeasonOrchardScene} from './season-orchard-scene.js?v=20261122f';
import {orchardFrame} from './orchard-paint.js?v=20261122f';

export function bindOrchardTaps(root,action){let pending=null;const target=e=>e.target.closest?.('[data-orchard-action]');let down=e=>{pending=null;let b=target(e);if(b&&e.isPrimary!==false&&!(e.button>0))pending={b,id:e.pointerId,x:e.clientX,y:e.clientY,moved:false};},move=e=>{if(pending&&e.pointerId===pending.id&&Math.hypot(e.clientX-pending.x,e.clientY-pending.y)>10)pending.moved=true;},cancel=()=>pending=null,click=e=>{let b=target(e),p=pending;pending=null;if(b&&(e.detail===0||p&&p.b===b&&!p.moved))action(b,e);};let handlers={pointerdown:down,pointermove:move,pointercancel:cancel,click};for(let[k,v]of Object.entries(handlers))root.addEventListener(k,v,{passive:true});return {cancel,destroy(){for(let[k,v]of Object.entries(handlers))root.removeEventListener(k,v);}};}
const fruitName=id=>orchardKind(id).name.replace('树','');

export function createOrchardUI({getState,now,transact,tone,reduced}){
 const $=id=>document.getElementById(id),panel=$('treeDetails'),basket=$('basketText');
 const scene=createSeasonOrchardScene($('orchardCanvas'));
 let active=false,focus=null,signature='',lotSignature='',wasFocused;
 const pending=new Set();
 const views=(s=getState(),n=now())=>s.orchard.trees.map((_,i)=>treeView(s,i,n));
 scene.ready.then(()=>{signature='';update(now());});
 basket.style.left=BASKET_POINT.x/720*100+'%';
 basket.style.top=(BASKET_POINT.y-19)/1280*100+'%';

 function show(open,index=null){
  if(open){focus=index;wasFocused=document.activeElement;lotSignature='';}
  panel.hidden=!open;$('treePanelBackdrop').hidden=!open;
  basket.setAttribute('aria-expanded',String(open&&focus===null));
  if(open){update(now());$('closeTreeDetails').focus({preventScroll:true});}
  else if(active&&wasFocused?.isConnected)wasFocused.focus({preventScroll:true});
 }
 basket.onclick=()=>show(panel.hidden);
 $('closeTreeDetails').onclick=()=>show(false);
 $('treePanelBackdrop').onclick=()=>show(false);
 document.addEventListener('keydown',event=>{
  if(panel.hidden)return;
  if(event.key==='Escape'){event.preventDefault();show(false);}
  if(event.key==='Tab'){
   const controls=[...panel.querySelectorAll('button')].filter(b=>!b.disabled&&b.getClientRects().length);
   if(event.shiftKey&&document.activeElement===controls[0]){event.preventDefault();controls.at(-1)?.focus();}
   else if(!event.shiftKey&&document.activeElement===controls.at(-1)){event.preventDefault();controls[0]?.focus();}
  }
 });
 function observe(){
  if(active)transact((s,n)=>{observeOrchard(s,n);return [{kind:'observe'}];},{silent:true});
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
 const gesture=bindOrchardTaps($('orchardStage'),(button,event)=>{
  let i=Number(button.dataset.index),token=button.dataset.token;
  if(!token){show(true,i);return;}
  if(event.detail&&Number.isFinite(event.clientX)){
   const bounds=$('orchardStage').getBoundingClientRect();
   const distance=p=>Math.hypot(p.x/720*bounds.width+bounds.left-event.clientX,p.y/1280*bounds.height+bounds.top-event.clientY);
   const nearest=scene.points(views()).reduce((best,p)=>!best||distance(p)<distance(best)?p:best,null);
   if(nearest){i=nearest.index;token=nearest.token;}
  }
  if(pending.has(token))return;
  pending.add(token);
  transact((s,n)=>{
   const previous=views(s,n),point=scene.points(previous).find(item=>item.index===i&&item.token===token);
   const result=harvestFruit(s,i,token,n);
   if(!result)return [];
   if(point&&!reduced)scene.pop(point,previous[i].tree.id);
   tone('harvest');return [result];
  }).finally(()=>pending.delete(token));
 });
 $('pickOrchardAll').onclick=()=>transact((s,n)=>
  (focus===null?s.orchard.trees.map((_,i)=>harvestTree(s,i,n)):[harvestTree(s,focus,n)]).filter(Boolean));
 $('plantOrchardTree').onclick=()=>{
  const index=focus;
  transact((s,n)=>[plantTree(s,index,ORCHARD_SITES[index],n)].filter(Boolean));
 };
 function sell(id){
  return transact((s,n)=>[sellBasket(s,n,id)].filter(Boolean)).then(done=>{
   if(done&&!panel.hidden)$('closeTreeDetails').focus({preventScroll:true});
  });
 }
 $('sellBasket').onclick=()=>sell();

 function updatePanel(s,vs,n,lots){
  if(panel.hidden)return;
  const v=focus===null?null:vs[focus],kind=focus===null?null:orchardKind(ORCHARD_SITES[focus]);
  const total=vs.reduce((sum,item)=>sum+(item?.stored||0),0);
  const cost=kind?.cost??0,missing=Math.max(0,cost-s.coins);
  const {basketCount=0,basketValue=0}=s.orchard;
  $('treeDetailName').textContent=kind?.name??'果篮';
  $('treeDetailYield').textContent=v?v.label+' · '+(v.stored?v.stored+' 颗可摘':'尚无熟果'):kind?
   '种植费用 '+cost+' 金币 · 15 分钟后可摘第一颗':basketCount?basketCount+' 颗 · 可卖 '+basketValue.toLocaleString('zh-CN')+' 金币':'果篮空着，点枝上的熟果就能摘。';
  $('treeDetailTime').textContent=v?'Lv.'+v.rank.level+(v.rank.need?' · '+v.rank.xp+' / '+v.rank.need+' 经验':' · 满级')+
   (v.stored===4?' · 已挂满':' · 下颗还剩 '+exactCountdown((v.next-n)/1000))+
   (v.tree.care?' · 培育 '+v.tree.care+' 级':''):kind?'首次结果后每小时长一颗，最多同时挂四颗。':'';
  $('orchardBalance').textContent='当前余额 '+s.coins.toLocaleString('zh-CN')+' 金币';
  $('plantOrchardTree').hidden=!kind||!!v;
  $('plantOrchardTree').disabled=!!missing;
  $('plantOrchardTree').textContent=missing?'还差 '+missing+' 金币':'种下'+(kind?.name??'')+' · '+cost+' 金币';
  $('sellBasket').hidden=!!kind||!basketCount;
  $('sellBasket').disabled=s.coins+basketValue>1e9;
  $('sellBasket').textContent=$('sellBasket').disabled?'余额接近上限':'全部卖 · '+basketValue.toLocaleString('zh-CN')+' 金币';
  $('pickOrchardAll').hidden=!(kind?v?.stored:total);
  $('pickOrchardAll').textContent=kind?'摘这棵树的熟果':'摘全部熟果 · '+total;
  $('fruitLots').hidden=!!kind;
  if(kind)return;
  const key=JSON.stringify([lots,s.coins]);
  if(key===lotSignature)return;
  lotSignature=key;
  const rows=lots.map(lot=>{
   const row=document.createElement('div'),info=document.createElement('div'),name=document.createElement('strong');
   const meta=document.createElement('small'),button=document.createElement('button');
   const label=lot.id===null?'旧篮存量':fruitName(lot.id);
   name.textContent=label;
   meta.textContent=lot.count+' 颗 · '+lot.value.toLocaleString('zh-CN')+' 金币';
   info.append(name,meta);
   button.type='button';button.dataset.sellLot=lot.id??'legacy';
   button.disabled=s.coins+lot.value>1e9;
   button.textContent=button.disabled?'余额接近上限':lot.id===null?'卖旧篮存量':'卖这一种';
   button.setAttribute('aria-label',button.textContent+' · '+label);
   button.onclick=()=>sell(lot.id);
   row.append(info,button);return row;
  });
  $('fruitLots').replaceChildren(...rows);
 }

 function update(n){
  if(!active)return;
  const s=getState(),vs=views(s,n),lots=basketLots(s.orchard),count=s.orchard.basketCount||0;
  const remaining=new Map(lots.filter(lot=>lot.id!==null).map(lot=>[lot.id,lot.count]));
  const recent=(s.orchard.basketRecent||[]).filter(id=>{
   const count=remaining.get(id)||0;
   if(!count)return false;
   remaining.set(id,count-1);
   return true;
  });
  const fruits=[...Array.from(remaining,([id,count])=>Array(Math.min(2,count)).fill(id)).flat(),...recent].slice(-4);
  scene.setBasket(fruits,lots.some(lot=>lot.id===null));
  $('basketBadge').hidden=!count;
  $('basketBadge').textContent=count>99?'99+':String(count);
  basket.setAttribute('aria-label',count?'打开果篮，'+count+' 颗果实':'打开果篮，空篮');
  updatePanel(s,vs,n,lots);
  const sig=JSON.stringify(vs.map(tree=>tree&&[tree.tree.id,tree.stage,tree.fruits.map(f=>f.token)]));
  if(sig===signature)return;
  signature=sig;
  const hits=$('orchardHits');hits.replaceChildren();
  for(const [i,tree] of vs.entries()){
   const frame=orchardFrame(i,tree),button=document.createElement('button');
   button.type='button';button.className=tree?'tree-touch':'tree-slot';
   button.dataset.orchardAction='tree';button.dataset.index=i;
   button.style.left=frame.x/720*100+'%';
   button.style.top=(frame.y-(tree?72*frame.z:12))/1280*100+'%';
   if(!tree)button.textContent='+';
   button.setAttribute('aria-label',tree?'查看'+tree.kind.name:'在空位种'+orchardKind(ORCHARD_SITES[i]).name);
   hits.append(button);
  }
  for(const f of scene.points(vs)){
   const button=document.createElement('button');
   button.type='button';button.className='fruit-touch';button.dataset.orchardAction='fruit';
   button.dataset.index=f.index;button.dataset.token=f.token;
   button.style.left=f.x/720*100+'%';button.style.top=f.y/1280*100+'%';
   button.setAttribute('aria-label','摘一颗'+fruitName(vs[f.index].tree.id));
   hits.append(button);
  }
 }
 function render(t){if(active){scene.settle(t,reduced);scene.render(views(),t,reduced);}}
 document.addEventListener('visibilitychange',()=>{if(document.hidden){scene.clear();gesture.cancel();}});
 return {update,render,observe,get active(){return active;},delay:()=>scene.delay(reduced)};
}
