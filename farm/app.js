import {WATER_GATE} from './irrigation-art.js';
import {rain7Release} from './rain7-balance.js?v=20261123b';
import {SEED_CATEGORIES,enableFieldProgress} from './preview-progression.js?v=20261123b';
import {NEXT_CROPS} from './next-crops.js';
import {enableOrchardMarket,enableOrchardExpansion,enableFreeTreeSites,enableQuickFruit,treeView} from './orchard.js?v=20261122h';
import {KEY,OLD_KEY,CROPS,crop,EXPANSIONS,formatTime,newGame,parse,levelOf,progress,
 unlocked,ready,plant,water,harvest,expand,improve,soilLevels,improvementQuote,improveAll,
 clearQuote,clearPlots,enableRain7,enableSeedTrial,mergeSeedTrial,hasTrial,plantPrice,
 plannedSeed,fieldSeed,seedChangeQuote,changeFieldSeed,followFarmSeed,collectField,collectFields,
 threshold,claimPlumGift,irrigateFields,canFertilize,feedAmounts,fieldActions,fertilizerQuote,fertilizeFields,fieldBug,catchFieldBug} from './model.js?v=20261122h';
import {createScene,drawIcon,POSITIONS,SCENE_HEIGHT,assetsReady} from './art.js?v=20261122h';
import {bindPlotTaps} from './touch.js?v=20261123b';
import {createAudio} from './audio.js?v=20261123b';
import {plotDetails,exactCountdown,visualPhase} from './presentation.js?v=20261122h';
import {createOrchardUI} from './orchard-ui.js?v=20261122h';

const $=id=>document.getElementById(id);
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const scene=createScene($('scene')),soundscape=createAudio();
const groups=[...SEED_CATEGORIES,{id:'new',label:'新作物',crops:NEXT_CROPS.map(c=>c.id)}];
const shopCatalog=groups.flatMap(group=>group.crops.map(crop).filter(Boolean)).sort((a,b)=>a.level-b.level);
let state,lastRaw=null,memoryOnly=false,pendingImport=null,selectedPlot=null,seedPlot=null;
let seedCategory='all',seedChoice=null,seedSignature='',catalogSignature='',inspectorIcon='';
let observed=Date.now(),offset=0,frameTimer=0,frameRequest=0,renderedAt=0,toastTimer,sound=false;
const now=()=>observed=Math.max(observed,Date.now()+offset,state?.at||0);

function warn(message){$('storageWarning').hidden=false;$('storageWarning').textContent=message;}
try{
 const raw=localStorage.getItem(KEY);
 const previous=raw||localStorage.getItem(OLD_KEY)||(rain7Release?localStorage.getItem('windfarm-rain-preview-v1'):null);
 state=previous?parse(previous):newGame();
 lastRaw=raw;
}catch(error){
 state=newGame();
 memoryOnly=true;
 warn('无法读取本机存档，未覆盖原数据。'+error.message);
}

function toast(message){
 $('toast').textContent=message;
 $('toast').classList.add('show');
 clearTimeout(toastTimer);
 toastTimer=setTimeout(()=>$('toast').classList.remove('show'),3200);
}
function tone(kind){if(sound&&!document.hidden)soundscape.play(kind);}
function upgradeFarm(target,n){
 const economy=enableRain7(target),fields=enableFieldProgress(target),market=enableOrchardMarket(target);
 const expansion=rain7Release&&enableOrchardExpansion(target);
 const freeSites=rain7Release&&enableFreeTreeSites(target);
 const fruit=rain7Release&&enableQuickFruit(target,n),trial=enableSeedTrial(target);
 return economy||fields||market||expansion||freeSites||fruit||trial;
}
function pullLatest(){
 if(memoryOnly)return;
 try{
  const raw=localStorage.getItem(KEY);
  if(raw&&raw!==lastRaw){state=parse(raw);lastRaw=raw;}
 }catch{memoryOnly=true;warn('本机同步失败，请导出备份保留本次进度。');}
}
function persist(){
 if(memoryOnly)return;
 try{
  const raw=JSON.stringify(state);
  localStorage.setItem(KEY,raw);lastRaw=raw;
 }catch{memoryOnly=true;warn('浏览器未能保存进度，请导出备份。');}
}
async function transact(change,{silent=false}={}){
 const run=()=>{
  pullLatest();
  const n=now(),oldLevel=levelOf(state.xp),events=change(state,n);
  if(!events?.length){renderUI();return false;}
  const trial=enableSeedTrial(state)||oldLevel<16&&state.seedTrial==='available';
  state.rev++;state.at=now();persist();
  renderUI();wake();
  if(silent)return true;
  const collected=events.filter(event=>event.kind==='harvest');
  const planted=events.filter(event=>event.kind==='plant');
  const level=levelOf(state.xp),missing=collected.filter(event=>event.unplanted);
  let message=events.length===1?events[0].message:events[0].kind==='queue'?
   events[0].message+' · 已种 '+planted.length+' 块 · 花 '+planted.reduce((sum,e)=>sum+e.cost,0)+' 币':
   events.length+' 块田已处理';
  if(collected.length)message='收获 '+collected.length+' 块 · +'+collected.reduce((sum,e)=>sum+e.coins,0)+' 币 · +'+collected.reduce((sum,e)=>sum+e.xp,0)+' 经验'+
   (planted.length?' · 续种 '+planted.length+' 块，花 '+planted.reduce((sum,e)=>sum+e.cost,0)+' 币':'')+
   (missing.length?' · '+missing.length+' 块金币不足，计划已保留':'');
  if(events.every(e=>e.kind==='orchard'))message=events.map(e=>e.message).join('；');
  if(level>oldLevel)message+=' · 园艺 '+level+' 级，奖励 '+(level-oldLevel)*25+' 币';
  if(trial)message+=' · 荷兰豆试种包已到账';
  toast(message);tone(collected.length?'harvest':events[0].kind==='irrigation'?'water':events[0].kind);
  return true;
 };
 try{return navigator.locks?await navigator.locks.request(KEY+'-write',run):run();}
 catch(error){console.error(error);toast('这次操作未完成，请重试。');return false;}
}
function openSheet(id){
 taps.cancel();
 $(id).showModal();
 $(id).querySelector('.sheet-content')?.scrollTo(0,0);
 document.body.classList.add('sheet-open');
}
for(const button of document.querySelectorAll('[data-close]'))button.onclick=()=>$(button.dataset.close).close();
for(const dialog of document.querySelectorAll('dialog'))dialog.addEventListener('close',()=>{
 document.body.classList.toggle('sheet-open',!!document.querySelector('dialog[open]'));
 wake();
});

const plotButtons=POSITIONS.map(({x,y},i)=>{
 const button=document.createElement('button');
 button.className='plot';button.dataset.plot=i;
 button.style.left=x/720*100+'%';button.style.top=(y+4)/SCENE_HEIGHT*100+'%';
 button.innerHTML='<span class="label" aria-hidden="true"></span>';
 $('plots').append(button);
 return button;
});
const taps=bindPlotTaps($('plots'),index=>{
 if(index>=state.plotCount)return;
 selectedPlot=index;
 renderUI();wake();
},{onHold:null});
$('plots').addEventListener('contextmenu',event=>event.preventDefault());
$('closeInspector').onclick=()=>{selectedPlot=null;renderUI();wake();};
$('plotPrimary').onclick=()=>{
 const index=selectedPlot;
 if(index===null)return;
 const action=plotDetails(state,index,now(),fieldSeed(state,index)).action;
 if(action==='harvest')transact((s,n)=>collectField(s,index,n));
 if(action==='plant')transact((s,n)=>{
  const id=fieldSeed(s,index),event=plant(s,index,id,n);
  if(!event&&s.coins<plantPrice(s,id))toast('金币不足，还差 '+(plantPrice(s,id)-s.coins)+' 金币。');
  return event?[event]:[];
 });
 if(action==='water')transact((s,n)=>[water(s,index,n)].filter(Boolean));
 if(action==='wait'&&canFertilize(state,state.plots[index],now())){
  openFertilizer(index);
 }
};
$('quickRadish').onclick=()=>{
 const i=selectedPlot;
 if(i!==null)transact((s,n)=>[plant(s,i,'radish',n)].filter(Boolean));
};
$('harvestAll').onclick=()=>transact((s,n)=>collectFields(s,Array.from({length:s.plotCount},(_,i)=>i),n));
const gate=$('waterGate');
let lastGatePress=-Infinity;
gate.style.left=WATER_GATE.x/720*100+'%';
gate.style.top=WATER_GATE.y/SCENE_HEIGHT*100+'%';
function openWaterGate(){
 const pressed=performance.now();
 if(pressed-lastGatePress<430)return;
 lastGatePress=pressed;
 transact((s,n)=>{
  const event=irrigateFields(s,n);
  if(!event){toast('现在没有可浇的田');return [];}
  scene.irrigate(event.indices,performance.now()/1000);
  return [event];
 });
}
gate.onclick=openWaterGate;
$('irrigateAll').onclick=openWaterGate;
$('careAll').onclick=()=>openFertilizer(null);

$('showPlotDetails').onclick=()=>{openSheet('plotInspector');renderInspector(now());};
function renderInspector(n){
 const index=selectedPlot,strip=$('plotStrip');
 strip.hidden=index===null||index>=state.plotCount;
 $('fieldIdle').hidden=!strip.hidden;
 if(strip.hidden)return;
 const soil=state.plots[index],seed=fieldSeed(state,index),d=plotDetails(state,index,n,seed),entry=crop(seed);
 const usingFertilizer=canFertilize(state,soil,n);
 const primary=d.action==='wait'&&usingFertilizer?'feed':d.action;
 const tag=soil?.fertilizer?(soil.fertilizer==='coins'?'金币 +'+feedAmounts(soil).coins:'经验 +'+feedAmounts(soil).xp):'';
 $('plotSummary').textContent='第 '+(index+1)+' 块 · '+(d.empty?'空田':d.name)+(d.action==='wait'?' · 本茬已浇':'')+(tag?' · '+tag:'');
 $('plotPrimary').disabled=primary==='wait'||d.empty&&state.coins<plantPrice(state,seed);
 $('plotPrimary').textContent={plant:'播种',harvest:'收获',water:'浇水',feed:'施肥',wait:tag?'已施肥':'生长中'}[primary];
 if(!$('plotInspector').open)return;
 $('plotTitle').textContent='第 '+(index+1)+' 块 · '+(d.empty?'空田':d.name);
 $('plotPhase').textContent=d.phase+' · '+d.soil;
 $('plotCountdownLabel').textContent=d.empty?'可以播种':d.countdownLabel;
 $('plotCountdown').textContent=d.empty?entry.short:d.countdown;
 $('plotReadyAt').textContent=d.empty?'种价 '+plantPrice(state,seed)+' 金币'+(hasTrial(state,seed)?' · 试种包':''):d.readyAt;
 $('plotCycles').textContent=d.cycles;
 $('plotValue').textContent='预计 '+d.units+' 份 · '+d.value+' 金币 / '+d.xp+' 经验'+(tag?'，含施肥':'');
 $('plotGround').textContent=d.empty&&state.coins<plantPrice(state,seed)?'还差 '+(plantPrice(state,seed)-state.coins)+' 金币。':'';
 const planned=plannedSeed(state,index);
 $('plotPlan').textContent=planned?(state.fieldSeeds?.[index]?'单田计划':'跟随全田')+' · '+crop(planned).short+
  (d.empty?'':' · 全部收完后换种'):'尚未设置换种计划';
 $('plotProgress').value=d.progress;
 $('quickRadish').hidden=!d.empty||seed==='radish'||state.plots.filter(p=>p?.id==='radish').length>=2;
 if(inspectorIcon!==d.id){drawIcon($('plotIcon'),d.id);inspectorIcon=d.id;}
}

let fertilizerPlot=null;
function openFertilizer(index){
 fertilizerPlot=index;
 $('fertilizeBatch').checked=false;
 openSheet('fertilizerSheet');renderFertilizer(now());
}
function fertilizerIndices(){
 return fertilizerPlot===null||$('fertilizeBatch').checked?Array.from({length:state.plotCount},(_,i)=>i):[fertilizerPlot];
}
const fertilizerButtons=[['feedCoins','coins','多金币','金币'],['feedXp','xp','多经验','经验']];
function renderFertilizer(n){
 const all=fertilizerPlot===null,plot=all?null:state.plots[fertilizerPlot];
 const eligible=all||canFertilize(state,plot,n);
 const indices=fertilizerIndices(),quotes=fertilizerButtons.map(([,choice])=>fertilizerQuote(state,indices,choice,n));
 $('fertilizerTitle').textContent=all?'照料长作':'第 '+(fertilizerPlot+1)+' 块 · 本茬施肥';
 $('fertilizeScope').hidden=all;
 const count=new Set(quotes.flatMap(q=>q.indices)).size;
 $('fertilizerInfo').textContent=all?(count?'现在能照料 '+count+' 块。每块本茬只施一次，成熟时间不变。':'现在没有可照料的田。'):
  eligible?'本茬只施一次。预计原收成 '+plot.value+' 金币 / '+plot.xp+' 经验，成熟时间不变。':'这块田当前不能施肥。';
 for(const [i,[button,,label,unit]] of fertilizerButtons.entries()){
  const q=quotes[i];
  $(button).textContent=label+' · +'+q.gain+' '+unit+(all||$('fertilizeBatch').checked?' / '+q.indices.length+' 块':'');
  $(button).disabled=!eligible||!q.gain;
 }
}
$('fertilizeBatch').onchange=()=>renderFertilizer(now());
for(const [button,choice] of fertilizerButtons)$(button).onclick=async()=>{
 const index=fertilizerPlot,indices=fertilizerIndices(),quote=fertilizerQuote(state,indices,choice,now());
 if(!quote.indices.length)return;
 const done=await transact((s,n)=>{
  const actual=fertilizerQuote(s,indices,choice,n);
  if((index!==null&&!canFertilize(s,s.plots[index],n))||JSON.stringify(actual)!==JSON.stringify(quote)){
   toast('田地状态已更新，请核对新的预计奖励。');return [];
  }
  return [fertilizeFields(s,indices,choice,n)].filter(Boolean);
 });
 if(done&&$('fertilizerSheet').open)$('fertilizerSheet').close();
};

const bugButtons=POSITIONS.map(({x,y},index)=>{
 const button=document.createElement('button');
 button.type='button';button.className='field-bug';button.hidden=true;
 button.style.left=(x+64)/720*100+'%';button.style.top=(y-50)/SCENE_HEIGHT*100+'%';
 button.setAttribute('aria-label','捉第 '+(index+1)+' 块田的小虫');
 button.onclick=()=>transact((s,n)=>[catchFieldBug(s,index,n)].filter(Boolean));
 $('fieldBugs').append(button);
 return button;
});

let improveIndex=null;
$('plotImprove').onclick=()=>{
 improveIndex=selectedPlot;
 $('clearSection').open=false;
 renderImprovement(now());
 openSheet('fieldDialog');
};
function renderImprovement(n){
 const i=improveIndex,levels=soilLevels(state),current=levels[state.soil[i]],next=levels[state.soil[i]+1],level=levelOf(state.xp);
 const stats=soil=>'用时 '+Math.round(soil.speed*100)+'% · 售价 '+Math.round(soil.bonus*100)+'%';
 const need=next?[level<next.level?'还差 '+(next.level-level)+' 级 / '+(threshold(next.level)-state.xp)+' 经验':'',state.coins<next.cost?'还差 '+(next.cost-state.coins)+' 金币':''].filter(Boolean):[];
 $('dialogTitle').textContent='改良第 '+(i+1)+' 块田';
 $('dialogText').textContent='当前 '+current.name+'（'+stats(current)+'）'+(next?
  '\n下一级 '+next.name+'（'+stats(next)+'）\n园艺 '+next.level+' 级 · '+next.cost+' 金币'+(need.length?' · '+need.join('，'):'')+'\n本茬保持原样，下次播种或续果生效。':'\n这块田已达最高级。');
 $('dialogConfirm').hidden=!next;
 $('dialogConfirm').disabled=need.length>0;
 $('dialogConfirm').textContent=next?'改良 · '+next.cost+' 金币':'';
 const batch=improvementQuote(state,n);
 $('improveAllHint').textContent=batch.count?'每块升一级 · '+batch.count+' 块 · 共 '+batch.cost+' 金币'+(batch.skipped?' · '+batch.skipped+' 块预算不足':''):'目前没有等级和金币均足够的田。';
 $('improveAll').disabled=!batch.count;
 $('clearSection').hidden=!state.plots[i];
 const clear=clearQuote(state,[i],n);
 if(clear)$('refundText').textContent='退款 '+clear.refund+' 金币'+(clear.harvestCoins?' · 先收成熟作物，入账 '+clear.harvestCoins+' 金币':'')+'。清理会移除还在生长的作物。';
}
$('dialogConfirm').onclick=()=>{
 const i=improveIndex,level=state.soil[i];
 transact((s,n)=>s.soil[i]===level?[improve(s,i,n)].filter(Boolean):[]);
};
$('improveAll').onclick=()=>{
 const quoted=JSON.stringify(improvementQuote(state,now()));
 transact((s,n)=>JSON.stringify(improvementQuote(s,n))===quoted?improveAll(s,n).events:[]);
};
$('plotClear').onclick=()=>{
 const i=improveIndex,quote=clearQuote(state,[i],now());
 if(!quote||!window.confirm('清理这块田？退款 '+quote.refund+' 金币。'))return;
 transact((s,n)=>JSON.stringify(clearQuote(s,[i],n))===JSON.stringify(quote)?[clearPlots(s,[i],n)].filter(Boolean):[]);
};

function shopOffers(){
 const old=CROPS.filter(c=>!shopCatalog.includes(c)&&(state.legacyUnlocked.includes(c.id)||state.stats[c.id]?.sown>0)&&unlocked(state,c.id));
 return [...shopCatalog,...old];
}
function upcoming(){
 return shopCatalog.filter(c=>!unlocked(state,c.id)).slice(0,3);
}
function seedSummary(c){return formatTime(c.seconds)+' · '+c.cost+' 金币 · '+c.xp+' 经验'+(c.harvests>1?' · '+c.harvests+' 茬':'');}
function showSeeds(index=null){
 seedPlot=index;seedChoice=index===null?null:fieldSeed(state,index);
 seedCategory='all';seedSignature='';
 $('seedFeedback').textContent='';
 openSheet('seedSheet');renderSeeds();
}
$('shop').onclick=()=>showSeeds();
$('comparePlot').onclick=()=>showSeeds(selectedPlot);
function createSeedTile(c,active=false){
 const b=document.createElement('button'),icon=document.createElement('canvas'),label=document.createElement('strong'),meta=document.createElement('small');
 b.className='seed-tile';b.dataset.seed=c.id;icon.setAttribute('aria-hidden','true');drawIcon(icon,c.id);
 label.textContent=c.short;meta.textContent=seedSummary(c)+' · 每茬 '+c.coins+' 金币'+(hasTrial(state,c.id)?' · 有试种包':'');
 b.setAttribute('aria-pressed',String(active));
 b.append(icon,label,meta);return b;
}
function renderSeeds(){
 if(!$('seedSheet').open)return;
 const available=shopOffers().filter(c=>unlocked(state,c.id));
 $('seedSheetTitle').textContent=seedPlot===null?'种子铺 · 已解锁 '+available.length+' 种':'第 '+(seedPlot+1)+' 块田 · 换种子';
 $('seedBalance').textContent=state.coins+' 金币';
 const signature=[seedCategory,seedPlot,seedChoice,state.seedTrial,...available.map(c=>c.id)].join('|');
 if(seedSignature!==signature){
  seedSignature=signature;
  $('seedTabs').replaceChildren();
  for(const group of [{id:'all',label:'已解锁'},...groups]){
   const button=document.createElement('button');
   button.textContent=group.label;button.setAttribute('aria-pressed',String(seedCategory===group.id));
   button.onclick=()=>{seedCategory=group.id;renderSeeds();};
   $('seedTabs').append(button);
  }
  const candidates=seedCategory==='all'?available:available.filter(c=>groups.find(g=>g.id===seedCategory).crops.includes(c.id));
  $('seedList').replaceChildren();
  for(const c of candidates){
   const tile=createSeedTile(c,c.id===seedChoice);
   tile.onclick=()=>{seedChoice=c.id;$('seedFeedback').textContent='';renderSeeds();};
   $('seedList').append(tile);
  }
  if(!candidates.length)$('seedList').textContent='此类种子暂未解锁。';
  $('seedTargets').replaceChildren(...upcoming().map(c=>{
   const row=document.createElement('p');row.textContent='Lv.'+c.level+' · '+c.short+' · '+c.group+' · '+formatTime(c.seconds);return row;
  }));
  $('lockedSeeds').hidden=!upcoming().length;
 }
 $('seedDecision').hidden=!seedChoice;
 if(!seedChoice)return;
 const c=crop(seedChoice);
 $('chosenSeed').textContent=c.short+' · '+c.group+' · '+seedSummary(c);
 $('followSeed').hidden=seedPlot===null||!state.fieldSeeds?.[seedPlot];
 for(const [button,text,all] of [['changeOne','changeOneQuote',false],['changeAll','changeAllQuote',true]]){
  const index=seedPlot??0,q=seedChangeQuote(state,index,c.id,all);
  $(button).parentElement.hidden=seedPlot===null;
  if(!q)continue;
  $(button).disabled=q.missing>0;
  $(text).textContent=q.empty.length+' 块现在播种 · '+q.waiting+' 块收完换'+(q.excluded?' · '+q.excluded+' 块保留单田设置':'')+'\n'+q.cost+' 金币'+(q.missing?' · 还差 '+q.missing:'');
 }
 if(seedPlot===null)$('seedFeedback').textContent='从田地操作卡进入换种，可以选单田或全田。';
}
for(const [id,all] of [['changeOne',false],['changeAll',true]])$(id).onclick=async()=>{
 const i=seedPlot,seed=seedChoice,q=seedChangeQuote(state,i,seed,all);
 if(!q||q.missing)return;
 const done=await transact((s,n)=>JSON.stringify(seedChangeQuote(s,i,seed,all))===JSON.stringify(q)?changeFieldSeed(s,i,seed,all,n):[]);
 if(done)$('seedSheet').close();
 else $('seedFeedback').textContent='田地或余额刚变化，请重新核对费用。';
};
$('followSeed').onclick=async()=>{
 const i=seedPlot;
 if(await transact((s,n)=>[followFarmSeed(s,i,n)].filter(Boolean)))$('seedSheet').close();
};

function renderGoals(n){
 if(!$('manageSheet').open)return;
 const p=progress(state),e=EXPANSIONS[(state.plotCount-6)/2];
 $('levelSummary').textContent=p.max?'园艺 60 级 · 已满级':'园艺 '+p.level+' 级 · 距下一级 '+(p.need-p.have)+' 经验 · 升级自动送 25 金币';
 const nextTimes=state.plots.slice(0,state.plotCount).filter(Boolean).map(plant=>({at:plant.end,name:crop(plant.id).short}));
 for(let i=0;i<state.orchard.trees.length;i++){
  const v=treeView(state,i,n);
  if(v)nextTimes.push({at:v.stored?n:v.next,name:v.kind.name.replace('树','')});
 }
 const soon=nextTimes.sort((a,b)=>a.at-b.at)[0];
 $('returnSummary').textContent=soon?soon.at<=n?'现在可收 · '+soon.name:'下次回来 · '+soon.name+' 还剩 '+formatTime((soon.at-n)/1000):'目前没有作物在等待成熟。';
 $('trialSummary').textContent=state.seedTrial==='available'?'16 级试种包已到 · 第一包荷兰豆免费播种':state.seedTrial==='used'?'16 级荷兰豆试种包已用':'16 级解锁荷兰豆，并送一包试种';
 $('levelTargets').replaceChildren(...upcoming().map(c=>{const row=document.createElement('p');row.textContent='Lv.'+c.level+' · '+c.short+' · '+c.group+' · 还差 '+Math.max(0,threshold(c.level)-state.xp)+' 经验';return row;}));
 if(!upcoming().length)$('levelTargets').textContent='本季作物已全部解锁。';
 $('expansionInfo').textContent=e?state.plotCount+' → '+e.count+' 块 · 园艺 '+e.level+' 级 · '+e.cost+' 金币'+(state.coins<e.cost?' · 还差 '+(e.cost-state.coins)+' 金币':''):'12 块田已全部开垦。';
 $('expandFields').hidden=!e;
 $('expandFields').disabled=!e||p.level<e.level||state.coins<e.cost;
 if(e)$('expandFields').textContent='开垦两块田 · '+e.cost+' 金币';
 const discovered=CROPS.filter(c=>state.stats[c.id]?.harvest>0).sort((a,b)=>a.level-b.level);
 $('catalogSummary').textContent='收获图鉴 · 已点亮 '+discovered.length+' 种';
 const signature=discovered.map(c=>c.id).join(',');
 if(signature!==catalogSignature){
  catalogSignature=signature;
  $('catalogItems').replaceChildren(...discovered.map(c=>{
   const tile=createSeedTile(c);tile.disabled=true;tile.removeAttribute('aria-pressed');return tile;
  }));
 }
 if(!discovered.length)$('catalogItems').textContent='第一次收获一种作物，就会点亮它。';
}
$('goalShortcut').onclick=()=>{openSheet('manageSheet');renderGoals(now());};
$('expandFields').onclick=()=>transact((s,n)=>[expand(s,n)].filter(Boolean));

function renderUI(){
 const n=now(),p=progress(state),target=upcoming()[0];
 $('coins').textContent=state.coins.toLocaleString('zh-CN');
 $('level').textContent='园艺 '+p.level+' 级';
 $('xpText').textContent=p.max?'满级':p.have+' / '+p.need;
 $('xp').max=p.max?1:p.need;$('xp').value=p.max?1:p.have;
 $('goalPeek').textContent=target?target.short+' · Lv.'+target.level+' · 差 '+Math.max(0,threshold(target.level)-state.xp)+' 经验':'本季种子均已解锁';
 $('cropCount').textContent='已解锁 '+shopOffers().filter(c=>unlocked(state,c.id)).length;
 let earliest=null,firstEmpty=null;
 for(const [i,b] of plotButtons.entries()){
  const plot=state.plots[i],open=i<state.plotCount,mature=ready(state,plot,n);
  const phase=visualPhase(state,plot,n);
  b.className='plot '+(!open?'is-locked':!plot?'is-empty':mature?'is-ready':'is-growing')+(selectedPlot===i?' is-selected':'');
  b.disabled=!open;
  b.setAttribute('aria-label','第 '+(i+1)+' 块田 · '+(!open?'待开垦':plot?crop(plot.id).short+' · '+phase.label:'空田'));
  b.firstElementChild.textContent=!open?'待开垦':mature?'可收':!plot?'+':'';
  if(open&&plot&&!mature&&(!earliest||plot.end<earliest.end))earliest={index:i,end:plot.end};
  if(open&&!plot&&firstEmpty===null)firstEmpty=i;
  bugButtons[i].hidden=!open||!fieldBug(state,i,n);
 }
 const actions=fieldActions(state,n),primary=actions.find(action=>action.count)?.id;
 $('fieldOptions').hidden=!primary;
 $('fieldNext').hidden=!!primary;
 for(const {id,label,count} of actions){
  const button=$(id);
  button.hidden=!count;
  button.dataset.primary=String(id===primary);
  if(count)button.textContent=label+' '+count+' 块';
 }
 const dry=actions[1].count;
 gate.classList.toggle('can-water',dry>0);
 gate.firstElementChild.textContent=dry?'开闸':'水闸';
 gate.setAttribute('aria-label',dry?'打开水闸，灌溉 '+dry+' 块田':'水闸，当前没有可浇的田');
 const text=earliest?'最早第 '+(earliest.index+1)+' 块 · '+formatTime((earliest.end-n)/1000)+'后可收':firstEmpty!==null?'第 '+(firstEmpty+1)+' 块空田 · 可以播种':'看看田里的作物';
 if($('fieldNext').textContent!==text)$('fieldNext').textContent=text;
 $('migrationNotice').hidden=!state.legacyNote;
 $('saveState').textContent=memoryOnly?'未能保存 · 请导出':'本机已保存';
 renderInspector(n);renderGoals(n);renderSeeds();orchard.update(n);
 if($('fieldDialog').open)renderImprovement(n);
 if($('fertilizerSheet').open)renderFertilizer(n);
}

$('settings').onclick=()=>{$('preferences').hidden=false;openSheet('settingsSheet');};
$('closeSettings').onclick=()=>$('settingsSheet').close();
$('dismissMigration').onclick=()=>transact(s=>{s.legacyNote=false;return [{kind:'notice'}];},{silent:true});
$('sound').onclick=async()=>{
 try{sound=!sound;await soundscape.set(sound);$('sound').setAttribute('aria-pressed',String(sound));if(sound)tone('plant');}
 catch{sound=false;toast('声音暂未能开启。');}
};
$('export').onclick=()=>{
 pullLatest();
 const url=URL.createObjectURL(new Blob([JSON.stringify({...state,at:now()},null,2)],{type:'application/json'})),a=document.createElement('a');
 a.href=url;a.download='wind-farm-v3-'+new Date().toISOString().slice(0,10)+'.json';a.click();
 setTimeout(()=>URL.revokeObjectURL(url),15000);$('backupMessage').textContent='已发起下载。';
};
function prepareImport(raw){
 pendingImport=parse(raw);
 $('importSummary').textContent='园艺 '+levelOf(pendingImport.xp)+' 级 · '+pendingImport.coins+' 金币 · '+pendingImport.plotCount+' 块田。确认后替换当前农场。';
 $('importPreview').hidden=false;
}
function importError(error){pendingImport=null;$('importPreview').hidden=true;$('backupMessage').textContent='导入未完成：'+error.message+'。';}
$('import').onchange=async event=>{
 const file=event.target.files?.[0];event.target.value='';
 if(!file)return;
 try{if(file.size>100000)throw Error('文件过大');prepareImport(await file.text());}catch(error){importError(error);}
};
$('cancelImport').onclick=()=>{pendingImport=null;$('importPreview').hidden=true;};
$('confirmImport').onclick=async()=>{
 if(!pendingImport)return;
 const incoming=pendingImport;pendingImport=null;
 await transact((s,n)=>{
  if(lastRaw)try{localStorage.setItem(KEY+'-before-import',lastRaw);}catch{}
  mergeSeedTrial(incoming,s);
  if(s.plumGiftClaimed)incoming.plumGiftClaimed=true;
  state=incoming;state.at=Math.max(n,state.at);
  upgradeFarm(state,state.at);memoryOnly=false;selectedPlot=null;
  return [{kind:'import',message:'已恢复备份'}];
 });
 $('importPreview').hidden=true;$('backupMessage').textContent=memoryOnly?'写入失败，请保留原备份。':'备份已恢复。';
};
try{
 const preview=localStorage.getItem('windfarm-rain-preview-v1');
 if(rain7Release&&preview){$('adoptPreviewSave').hidden=false;$('adoptPreviewSave').onclick=()=>{try{prepareImport(preview);}catch(error){importError(error);}};}
}catch{}

function frame(time){
 frameRequest=0;
 if(document.hidden)return;
 if(orchard.active)orchard.render(time/1000);
 else scene.render(state,now(),time/1000,reduced,{selected:selectedPlot});
 if(time-renderedAt>950){renderUI();renderedAt=time;}
 frameTimer=setTimeout(()=>{frameTimer=0;wake();},orchard.active?orchard.delay():scene.delay(time/1000,reduced));
}
function wake(){
 if(document.hidden||frameRequest)return;
 clearTimeout(frameTimer);frameTimer=0;frameRequest=requestAnimationFrame(frame);
}
const orchard=createOrchardUI({getState:()=>state,now,transact,tone,reduced});
$('fieldTab').addEventListener('click',()=>{selectedPlot=null;renderUI();wake();});
$('orchardTab').addEventListener('click',()=>{selectedPlot=null;renderUI();wake();});
window.addEventListener('storage',event=>{if(event.key===KEY){pullLatest();renderUI();wake();}});
document.addEventListener('visibilitychange',()=>{
 if(document.hidden){taps.cancel();soundscape.pause();clearTimeout(frameTimer);cancelAnimationFrame(frameRequest);frameRequest=0;}
 else{soundscape.resume();pullLatest();renderUI();wake();}
});
assetsReady.then(()=>{seedSignature='';inspectorIcon='';renderUI();wake();});
$('fieldTab').click();
renderUI();
transact((s,n)=>upgradeFarm(s,n)||!lastRaw?[{kind:'initial'}]:[],{silent:true});
orchard.observe();wake();
async function redeemPlumGift(){
 if(!rain7Release||!location.hash.startsWith('#gift='))return;
 const token=location.hash.slice(6);
 if(!/^[A-Za-z0-9_-]{32}$/.test(token))return;
 const hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token));
 const hex=Array.from(new Uint8Array(hash),b=>b.toString(16).padStart(2,'0')).join('');
 const acceptedGiftHashes=[
  '8e794dbd22a241c7825c2458638fd9344af55afc9a12f980213d99b9aeea0855',
  '927c30b61fd392a37323ec3c3837977a57a0adb5c3d4993f84e6124af7cd32be',
 ];
 if(!acceptedGiftHashes.includes(hex))return;
 if(memoryOnly){toast('存档未能写入，领取链接仍可重试。');return;}
 const claimed=await transact(s=>memoryOnly?[]:[claimPlumGift(s)].filter(Boolean));
 if(memoryOnly){toast('存档未能写入，领取链接仍可重试。');return;}
 if(!claimed)toast(state.plumGiftClaimed?'这份存档已领取 10,000 金币。':'余额接近上限，暂时无法领取。');
 if(state.plumGiftClaimed&&lastRaw&&JSON.parse(lastRaw).plumGiftClaimed)history.replaceState(history.state,'',location.pathname+location.search);
}
redeemPlumGift().catch(()=>toast('领取未完成，请重新打开领取链接。'));

if(new URLSearchParams(location.search).has('audit')){
 window.farmAudit={
  get state(){return structuredClone(state);},
  get renderStats(){return scene.stats;},
  async advance(seconds){
   offset=Math.max(offset,state.at-Date.now())+Math.max(0,Math.min(86400,seconds))*1000;
   await transact((s,n)=>{s.at=n;return [{kind:'clock'}];},{silent:true});
  },
  async grow(cycles=1){
   for(let step=0;step<Math.min(cycles,40);step++){
    await transact((s,n)=>s.plots.slice(0,s.plotCount).flatMap((_,i)=>[harvest(s,i,n),plant(s,i,fieldSeed(s,i),n),water(s,i,n)].filter(Boolean)),{silent:true});
    await this.advance(28801);
   }
  },
  async expand(){return transact((s,n)=>[expand(s,n)].filter(Boolean));},
 };
}
