import {treeView,harvestFruit,harvestTree,observeOrchard,sellBasket,enableOrchardMarket} from './orchard.js?v=20261123b';
import {exactCountdown} from './presentation.js?v=20261123b';
import {createOrchardScene} from './orchard-scene.js?v=20261123c';
export function bindOrchardTaps(root,action){let pending=null;const target=e=>e.target.closest?.('[data-orchard-action]');let down=e=>{pending=null;let b=target(e);if(b&&e.isPrimary!==false&&!(e.button>0))pending={b,id:e.pointerId,x:e.clientX,y:e.clientY,moved:false};},move=e=>{if(pending&&e.pointerId===pending.id&&Math.hypot(e.clientX-pending.x,e.clientY-pending.y)>10)pending.moved=true;},cancel=()=>pending=null,click=e=>{let b=target(e),p=pending;pending=null;if(b&&(e.detail===0||p&&p.b===b&&!p.moved))action(b);};let handlers={pointerdown:down,pointermove:move,pointercancel:cancel,click};for(let[k,v]of Object.entries(handlers))root.addEventListener(k,v,{passive:true});return {cancel,destroy(){for(let[k,v]of Object.entries(handlers))root.removeEventListener(k,v);}};}
export function createOrchardUI({getState,now,transact,tone,reduced}){
 const $=id=>document.getElementById(id),panel=$('treeDetails'),scene=createOrchardScene($('orchardCanvas'));
 let active=true,focus=0,lastSig='',pending=new Set();
 const views=()=>getState().orchard.trees.map((_,i)=>treeView(getState(),i,now()));
 function panelOpen(open){let wasOpen=!panel.hidden;panel.hidden=!open;$('treePanelBackdrop').hidden=!open;$('basketText').setAttribute('aria-expanded',String(open));if(open){panel.querySelector('.tree-panel-body').scrollTop=0;$('closeTreeDetails').focus({preventScroll:true});}else if(wasOpen&&active)$('basketText').focus({preventScroll:true});}
 $('basketText').onclick=()=>panelOpen(panel.hidden);
 $('closeTreeDetails').onclick=()=>panelOpen(false);$('treePanelBackdrop').onclick=()=>panelOpen(false);
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden){e.preventDefault();panelOpen(false);}if(e.key==='Tab'&&!panel.hidden){let buttons=[...panel.querySelectorAll('button,summary')].filter(e=>!e.disabled&&e.getClientRects().length);if(e.shiftKey&&document.activeElement===buttons[0]){e.preventDefault();buttons.at(-1)?.focus();}else if(!e.shiftKey&&document.activeElement===buttons.at(-1)){e.preventDefault();buttons[0]?.focus();}}});
 function observe(){if(!active)return;transact((s,n)=>{enableOrchardMarket(s);let changes=observeOrchard(s,n);$('orchardNote').hidden=!changes.length;$('orchardNote').textContent=changes.map(c=>c.text).join('，');return [{kind:'observe'}];},{silent:true});}
 function page(which){panelOpen(false);active=which==='orchard';document.body.classList.toggle('orchard-mode',active);$('orchardPage').hidden=!active;$('orchardTab').setAttribute('aria-pressed',String(active));$('fieldTab').setAttribute('aria-pressed',String(!active));scene.clear();if(active)observe();window.scrollTo({top:0,behavior:'instant'});update(now());}
 $('orchardTab').onclick=()=>page('orchard');$('fieldTab').onclick=()=>page('field');
 for(let i=0;i<3;i++){let b=document.createElement('button');b.dataset.slot=i;b.append(document.createElement('strong'),document.createElement('small'));b.onclick=()=>{focus=i;lastSig='';scene.clear();panelOpen(false);update(now());};$('treeBrowse').append(b);}
 const gesture=bindOrchardTaps($('orchardStage'),b=>{let i=Number(b.dataset.index),token=b.dataset.token;if(pending.has(token))return;pending.add(token);transact((s,n)=>{let before=s.orchard.trees.map((_,j)=>treeView(s,j,n)),event=harvestFruit(s,i,token,n);if(!event)return [];scene.pop(i,before[i].tree.id,event.fruit,focus,before,performance.now()/1000);tone('harvest');return [event];}).finally(()=>pending.delete(token));});
 $('pickOrchardAll').onclick=()=>transact((s,n)=>s.orchard.trees.map((_,i)=>harvestTree(s,i,n)).filter(Boolean));
 $('sellBasket').onclick=()=>transact((s,n)=>scene.flying?[]:[sellBasket(s,n)].filter(Boolean));
 $('pickRipe').onclick=$('pickOrchardAll').onclick;
 $('sellQuick').onclick=$('sellBasket').onclick;
 function safeBasket(){return getState().orchard.basketCount||0;}
 function showBasket(){
  const orchard=getState().orchard,airborne=scene.flying,count=Math.max(0,safeBasket()-airborne);
  const recent=orchard.basketRecent||[];
  scene.setBasket(count,recent.slice(0,Math.max(0,recent.length-airborne)));
  $('basketText').textContent='果篮 · '+count;
  $('basketText').setAttribute('aria-label','打开果篮，'+count+'颗');
  $('treeDetailYield').textContent=airborne?'果实正在落入篮中…':count?count+' 颗 · 可卖 '+orchard.basketValue+' 金币':'果篮空着，点枝上的熟果就能摘。';
  $('sellQuick').hidden=$('sellBasket').hidden=!count||!!airborne;
  const sale='卖果 · '+(orchard.basketValue||0)+' 金币';
  if($('sellQuick').textContent!==sale)$('sellQuick').textContent=sale;
  $('sellBasket').textContent='全部卖出 · '+(orchard.basketValue||0)+' 金币';
 }
 function update(n){
  const vs=views(),v=vs[focus],total=vs.reduce((sum,view)=>sum+(view?.stored||0),0);
  $('orchardPage').dataset.stored=total;
  $('orchardPage').dataset.focus=String(focus);
  $('orchardSubtitle').textContent=v?v.kind.name+' · Lv.'+v.rank.level:'';
  $('pickRipe').hidden=$('pickOrchardAll').hidden=!total;
  $('pickRipe').textContent='摘全部 · '+total+' 颗';
  $('orchardRipening').hidden=!v;
  $('orchardRipening').textContent=v?v.label+' · '+(v.stored===4?'已挂满 4 颗':'下一颗 '+exactCountdown((v.next-n)/1000)):'';
  if(v&&v.stored<4)$('orchardRipening').setAttribute('aria-label',v.kind.name+'，'+v.label+'，下一颗果实还剩 '+exactCountdown((v.next-n)/1000));
  else $('orchardRipening').removeAttribute('aria-label');
  $('pickOrchardAll').textContent='摘下所有熟果 · '+total+' 颗';
  $('treeDetailTime').textContent=v?v.kind.name+' Lv.'+v.rank.level+(v.rank.need?' · 经验 '+v.rank.xp+' / '+v.rank.need:' · 满级'):'';
  showBasket();
  for(let [i,b] of [...$('treeBrowse').children].entries()){
   const tree=vs[i];
   const name=['桃子','李子','梨子'][i];
   const label=name+' Lv.'+(tree?.rank.level||1);
   const status=tree?.stored?tree.stored+' 颗可摘':tree?exactCountdown((tree.next-n)/1000):'';
   if(b.firstElementChild.textContent!==label)b.firstElementChild.textContent=label;
   if(b.lastElementChild.textContent!==status)b.lastElementChild.textContent=status;
   b.dataset.ripe=String(!!tree?.stored);
   b.setAttribute('aria-label',label+(status?'，'+(tree.stored?'':'还剩 ')+status:''));
   b.setAttribute('aria-pressed',String(i===focus));
  }
 let sig=JSON.stringify([focus,vs.map(v=>v&&[v.tree.id,v.stage,v.fruits.map(f=>f.token)])]);if(sig!==lastSig){lastSig=sig;$('orchardHits').replaceChildren();for(let f of scene.points(vs,focus)){let b=document.createElement('button');b.className='fruit-touch'+(f.variant==='sunny'?' sun-kissed':'');b.dataset.orchardAction='fruit';b.dataset.index=f.index;b.dataset.token=f.token;b.style.left=f.x/720*100+'%';b.style.top=f.y/1280*100+'%';b.style.setProperty('--fruit-size',Math.max(52,f.r*2.4/720*$('orchardStage').clientWidth)+'px');b.setAttribute('aria-label','摘一份'+vs[f.index].kind.name.replace('树',''));b.innerHTML='<span aria-hidden="true"></span>';$('orchardHits').append(b);}
 if(!safeBasket()){let first=scene.points(vs,focus)[0];if(first){let invite=document.createElement('button');invite.className='pick-invite';invite.dataset.orchardAction='fruit';invite.dataset.index=first.index;invite.dataset.token=first.token;invite.textContent='摘果';invite.style.left='max(130px,'+first.x/720*100+'%)';invite.style.top=first.y/1280*100+'%';$('orchardHits').append(invite);}}}
 }
 function render(t){if(active){scene.settle(t,reduced);showBasket();scene.render(views(),focus,t,reduced);}}
 document.addEventListener('visibilitychange',()=>{if(document.hidden){scene.clear();gesture.cancel();}else if(active)observe();});
 return {update,render,observe,get active(){return active;},get stats(){return scene.stats;},delay:()=>scene.delay(reduced),reset(){focus=0;lastSig='';scene.clear();page('orchard');}};
}
