import {rain7Release} from './rain7-balance.js?v=20261123a';
import {SEED_CATEGORIES,enableFieldProgress} from './preview-progression.js?v=20261123a';
import {enableOrchardMarket} from './orchard.js?v=20261123a';
import {preferredLongSeed,applyRainPreviewStipend,soilLevels,enableRain7,plantTerms,threshold} from './model.js?v=20261123a';
import {makeRainDemo} from './rain-demo.js?v=20261123a';
import {createOrchardUI} from './orchard-ui.js?v=20261123a';
import {TREE_KINDS,treeView,plantTree,harvestTree,careTree,graftTree} from './orchard.js?v=20261123a';
import {plantArt} from './art.js?v=20261123a';
import {KEY,OLD_KEY,CROPS,crop,SOILS,EXPANSIONS,formatTime,newGame,parse,levelOf,progress,unlocked,available,ready,growth,plant,water,harvest,expand,improve,uproot,refundFor,clearPlots,clearQuote,harvestAndResow,resowQuote,improveAll,improvementQuote,tendAll,tendingQuote,queueSeed} from './model.js?v=20261123a';
import {createScene,drawIcon,POSITIONS,SCENE_HEIGHT,assetsReady} from './art.js?v=20261123a';
import {bindPlotTaps} from './touch.js?v=20261123a';
import {createAudio} from './audio.js?v=20261123a';
import {PLANS,cropComparison,matchingCrops,fieldIntent,growthGoals,farmOverview,cropRole,sowingQuote,freshSeedIds,newSeedsFirst} from './planning.js?v=20261123a';
import {createHud} from './hud.js?v=20261123a';
import {readyMoment,exactCountdown,maturityTime} from './presentation.js?v=20261123a';
import {plotDetails} from './presentation.js?v=20261123a';
import {createHarvestFeedback} from './feedback.js?v=20261123a';
const preview=new URLSearchParams(location.search).has('orchardPreview')||location.pathname.includes('/orchard-preview/');
const preferenceKey=id=>preview?'rain-orchard-preview:'+id:id;
const $=id=>document.getElementById(id),scene=createScene($('scene')),reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let state,lastRaw=null,memoryOnly=false,selected='radish',offset=0,observed=Date.now(),sound=false,audio,toastTimer,raf=0,frameTimer=0,lastFrame=0,lastHud=0,pendingImport=null,visible=!document.hidden,mode='normal',pendingAction=null,filter='全部',seedLimit=12,seedSignature='',iconChoice='',selectedPlot=null,inspectorIcon='',returnPlan='any',previewId=null,simpleFilter='all';
const now=()=>observed=Math.max(observed,Date.now()+offset,state?.at||0);
function warn(message){$('storageWarning').hidden=false;$('storageWarning').textContent=message;}
try{let raw=localStorage.getItem(KEY);if(raw){state=parse(raw);lastRaw=raw;}else{let old=localStorage.getItem(OLD_KEY)||(rain7Release?localStorage.getItem('windfarm-rain-preview-v1'):null);state=old?parse(old):(preview?makeRainDemo():newGame());}let choice=localStorage.getItem(preferenceKey('windfarm-seed-v1'));if(unlocked(state,choice))selected=choice;}catch(e){state=newGame();memoryOnly=true;warn('无法读取本机存档，本次进度暂存在页面中，请导出备份。'+e.message);}
if(preview)offset=Math.max(0,state.at-Date.now());
const hud=createHud(state.coins,state.xp),feedback=createHarvestFeedback({document,reduced});let receiptTimer,seenSeeds;
try{let raw=localStorage.getItem(preferenceKey('windfarm-seen-seeds-v1')),ids=raw?JSON.parse(raw):available(state).map(c=>c.id);seenSeeds=new Set(Array.isArray(ids)?ids.filter(crop):available(state).map(c=>c.id));if(!raw)localStorage.setItem(preferenceKey('windfarm-seen-seeds-v1'),JSON.stringify([...seenSeeds]));}catch{seenSeeds=new Set(available(state).map(c=>c.id));}
function markSeedsSeen(){for(let c of shopMatches())if(unlocked(state,c.id))seenSeeds.add(c.id);try{localStorage.setItem(preferenceKey('windfarm-seen-seeds-v1'),JSON.stringify([...seenSeeds]));}catch{}seedSignature='';}
function fieldFeedback(i,e,n,id,delay=0){scene.pop(i,e.kind==='harvest'?(e.special?e.special+'！ ':'')+'+'+e.coins+'币 / +'+e.xp+'经验':e.kind==='water'?'浇水':e.kind==='build'?'田地升级':'播种',e.special==='变异丰收'?'mutation':e.kind==='build'?'soil':e.kind,n,id,delay);if(e.kind==='harvest')feedback.play(plotButtons[i],e,delay);}

function toast(message){$('toast').textContent=message;$('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('show'),2800);}
const soundscape=createAudio();
function tone(kind){if(sound&&!document.hidden)try{soundscape.play(kind);}catch{sound=false;}}
function upgradeFarm(s){const economy=enableRain7(s);const fields=enableFieldProgress(s);const market=enableOrchardMarket(s);return economy||fields||market;}
function pullLatest(){if(memoryOnly)return;try{let raw=localStorage.getItem(KEY);if(raw&&raw!==lastRaw){state=parse(raw);lastRaw=raw;hud.snap(state.coins,state.xp);}}catch{memoryOnly=true;warn('本机同步失败，请导出备份保留本次进度。');}}
function persist(){if(memoryOnly)return;try{let raw=JSON.stringify(state);localStorage.setItem(KEY,raw);lastRaw=raw;}catch{memoryOnly=true;warn('浏览器未能保存进度，仍可继续玩，请导出备份并保留此页面。');}}
async function transact(fn,{silent=false}={}){const run=()=>{pullLatest();let before=available(state).map(c=>c.id),oldCoins=state.coins,oldXp=state.xp,oldLevel=levelOf(state.xp),events=fn(state,now());if(!events?.length){renderUI();return false;}state.rev++;state.at=now();persist();let fresh=available(state).filter(c=>!before.includes(c.id));if(fresh.length&&!events.some(e=>e.kind==='fixture'))queueUnlock(fresh);let harvests=events.filter(e=>e.kind==='harvest'),at=performance.now();if(!silent&&(harvests.length||hud.active(at)))hud.animate(state.coins,state.xp,at,reduced);else hud.snap(state.coins,state.xp);renderUI();scene.render(state,now(),at/1000,reduced,{selected:selectedPlot});wake();if(!silent){let cost=events.reduce((n,e)=>n+(e.cost||0),0);if(harvests.length){let levels=levelOf(state.xp)-oldLevel,message=harvests.length+'块收菜 · '+harvests.reduce((count,e)=>count+(e.units||1),0)+'份 · +'+harvests.reduce((n,e)=>n+e.coins,0)+'币 / +'+(state.xp-oldXp)+'经验'+(cost?' · 续种花'+cost+'币':'')+(harvests.some(e=>e.special)?' · 丰收惊喜 '+harvests.filter(e=>e.special).length+'份':'')+(levels?' · 升到'+levelOf(state.xp)+'级（奖励'+levels*25+'币）':'');showReceipt(message);toast(message);}else {if(events.every(e=>e.kind==='orchard')){if(events.every(e=>e.fruit)){if(events[0].treeXp>0)toast('果实入篮 · 果树经验 +'+events[0].treeXp);return true;}let message=events.map(e=>e.message).join('；');showReceipt(message);toast(message);tone('harvest');return true;}if(events[0].kind==='clear')showReceipt(events[0].message);toast(events.length===1?events[0].message:events.length+'块田已处理'+(cost?' · 花费'+cost+'币':''));}tone(harvests.length?'harvest':events[0].kind);}return true;};try{return navigator.locks?await navigator.locks.request(KEY+'-write',run):run();}catch{toast('这次操作未完成，请重试。');return false;}}
function showReceipt(message){clearTimeout(receiptTimer);$('harvestReceipt').textContent=message;$('harvestReceipt').hidden=false;receiptTimer=setTimeout(()=>$('harvestReceipt').hidden=true,2400);}
function renderStatus(){const view=hud.value(performance.now()),pr=progress({xp:view.xp}),put=(id,value)=>{if($(id).textContent!==String(value))$(id).textContent=value;};put('coins',view.coins.toLocaleString('zh-CN'));put('level','园艺 '+pr.level+' 级');put('xpText',pr.max?'已满级':pr.have+' / '+pr.need);$('xp').max=pr.max?1:pr.need;$('xp').value=pr.max?1:pr.have;$('coins').setAttribute('aria-label','实际余额'+state.coins+'金币');}
function resetMode(){mode='normal';renderUI();}
function choose(id){if(!unlocked(state,id))return;selected=id;previewId=id;try{localStorage.setItem(preferenceKey('windfarm-seed-v1'),id);}catch{}seedSignature='';renderUI();}
function inspect(i){if(i>=state.plotCount){toast('点「农场」开垦新田');return;}if(mode==='soil'||mode==='shovel'){openFieldDialog(i);return;}selectedPlot=i;renderUI();scene.render(state,now(),performance.now()/1000,reduced,{selected:selectedPlot});}
function fieldAction(i){if(i>=state.plotCount){toast('点「农场」开垦新田');return;}let intent=fieldIntent(mode,state.plots[i],ready(state,state.plots[i],now()));if(intent==='dialog')openFieldDialog(i);else if(intent==='occupied')toast('这块田已有作物。点「完成」退出播种后可收菜。');else if(intent==='inspect'){if(!state.plots[i].watered)plotOperation(i,'water');else inspect(i);}else{selectedPlot=null;plotOperation(i,intent);}}
function plotOperation(i,action){transact((s,n)=>{let p=s.plots[i],id=p?.id||selected,e=action==='plant'?plant(s,i,selected,n):action==='harvest'?harvest(s,i,n):water(s,i,n);if(!e){if(action==='plant')toast('种'+crop(selected).short+'还差 '+Math.max(0,crop(selected).cost-s.coins)+' 金币');else toast('这块田的状态已变化，请重新查看。');return [];}fieldFeedback(i,e,n,id);return [e];});}
$('closeInspector').onclick=()=>{selectedPlot=null;renderUI();};$('plotPrimary').onclick=()=>{if(selectedPlot===null)return;let d=plotDetails(state,selectedPlot,now(),selected);if(d.action!=='wait')plotOperation(selectedPlot,d.action);};
const plotButtons=POSITIONS.map(({x,y},i)=>{let b=document.createElement('button');b.className='plot';b.dataset.plot=i;b.style.left=x/720*100+'%';b.style.top=(y+4)/SCENE_HEIGHT*100+'%';b.innerHTML='<span class="soil-tag" aria-hidden="true"></span><span class="regrow-tag" aria-hidden="true"></span><span class="care-tag" aria-hidden="true"></span><span class="label"><span class="plot-name"></span><strong class="plot-timer"></strong></span><span class="mini-progress"><i></i></span>';$('plots').append(b);return b;});
const taps=bindPlotTaps($('plots'),fieldAction,{onHold:inspect});$('plots').addEventListener('contextmenu',e=>e.preventDefault());$('plots').addEventListener('keydown',e=>{if((e.key==='d'||e.key==='D')&&e.target.dataset.plot!==undefined){e.preventDefault();inspect(Number(e.target.dataset.plot));}});
function batch(action){mode='normal';let skipped=0;transact((s,n)=>{let out=[];for(let i=0;i<s.plotCount;i++){let id=s.plots[i]?.id||selected,e=action==='plant'?plant(s,i,selected,n):action==='repeat'?plant(s,i,s.lastSeeds[i]||selected,n):action==='water'?water(s,i,n):harvest(s,i,n);if(e){out.push(e);fieldFeedback(i,e,n,id,out.length*.01);}else if((action==='plant'||action==='repeat')&&!s.plots[i])skipped++;}if(!out.length&&skipped)toast('金币不足，免费萝卜始终可种。');return out;}).then(ok=>{if(ok&&skipped)toast('已种下能负担的作物，另有'+skipped+'块空地因金币不足未种。');});}
$('plantAll').onclick=()=>batch('plant');$('repeatAll').onclick=()=>batch('repeat');$('waterAll').onclick=()=>batch('water');$('harvestAll').onclick=()=>batch('harvest');
$('cycleAll').onclick=()=>{mode='normal';selectedPlot=null;let skipped=0;transact((s,n)=>{let result=tendAll(s,n);skipped=result.skipped;for(let [j,e]of result.events.entries())fieldFeedback(e.index,e,n,e.id,j*.008);return result.events;}).then(ok=>{if(ok&&skipped)toast('已完成可负担的操作，剩 '+skipped+' 块空田');});};
$('improveAll').onclick=()=>{
 pullLatest();
 const quote=improvementQuote(state,now());
 if(!quote.count)return;
 pendingAction={mode:'soil-batch',rev:state.rev,quote:JSON.stringify(quote)};
 $('dialogTitle').textContent='改良 '+quote.count+' 块田？';
 $('dialogText').textContent='每块升一级，共 '+quote.cost+' 金币。'+(quote.skipped?'另有 '+quote.skipped+' 块预算不足。':'')+'下次播种或续果时生效。';
 $('dialogConfirm').disabled=false;
 $('dialogConfirm').textContent='确认改良 · '+quote.cost+' 金币';
 $('fieldDialog').showModal();
 syncSheetLock();
};
function switchMode(next){selectedPlot=null;mode=mode===next?'normal':next;renderUI();if(mode!=='normal')$('plots').scrollIntoView({block:'center',behavior:reduced?'instant':'smooth'});}
$('sowMode').onclick=openSeeds;
$('shovelMode').onclick=()=>switchMode('shovel');$('clearAll').onclick=()=>openClearDialog(Array.from({length:state.plotCount},(_,i)=>i));$('plotClear').onclick=()=>{if(selectedPlot!==null)openClearDialog([selectedPlot]);};$('soilMode').onclick=()=>switchMode('soil');$('soilShortcut').onclick=()=>switchMode('soil');
function openClearDialog(indices){pullLatest();let q=clearQuote(state,indices,now());if(!q){toast('已经没有作物了，选个种子就能重新种。');return;}pendingAction={mode:'clear',indices,rev:state.rev,quote:JSON.stringify(q)};$('dialogTitle').textContent=q.count===1?'清空这块田？':'清空全部'+q.count+'块田？';$('dialogText').textContent='退种子费 '+q.refund+'币'+(q.harvestCoins?'，先收成熟作物 '+q.harvestCoins+'币 / '+q.xp+'经验':'')+(q.levels?'，升级奖励 '+q.levels*25+'币':'')+'。'+(q.refund?'未收过退全额，收过按剩余茬数退。':q.harvestCoins?'成熟作物计入收菜收入，不重复退种子费。':'免费种子没有种子费可退。')+'清空后可以换种。';$('dialogConfirm').disabled=false;$('dialogConfirm').textContent='确认清空 · 入账'+(q.refund+q.harvestCoins+q.levels*25)+'币';$('fieldDialog').showModal();syncSheetLock();}
function openFieldDialog(i){pullLatest();if(mode==='shovel'){openClearDialog([i]);return;}let p=state.plots[i],next=soilLevels(state)[state.soil[i]+1];if(!next){toast('这块田已经是最高等级。');return;}pendingAction={mode:'soil',i,soil:state.soil[i]};$('dialogTitle').textContent='升级为'+next.name+'？';$('dialogText').textContent=next.level+'级可改良 · '+next.cost+' 金币。下轮生长耗时 −'+Math.round((1-next.speed)*100)+'%，售价 +'+Math.round((next.bonus-1)*100)+'%。当前这一茬保留。';let allowed=levelOf(state.xp)>=next.level&&state.coins>=next.cost;$('dialogConfirm').disabled=!allowed;$('dialogConfirm').textContent=allowed?'花费'+next.cost+'币改良':levelOf(state.xp)<next.level?next.level+'级解锁':'金币不足';$('fieldDialog').showModal();syncSheetLock();}
$('dialogCancel').onclick=()=>{$('fieldDialog').close();pendingAction=null;};$('fieldDialog').addEventListener('cancel',()=>pendingAction=null);$('dialogConfirm').onclick=async()=>{let a=pendingAction;if(!a)return;pendingAction=null;$('fieldDialog').close();await transact((s,n)=>{if(a.mode==='clear'){if(s.rev!==a.rev||JSON.stringify(clearQuote(s,a.indices,n))!==a.quote){toast('田地刚刚有变化，请重新点铲除，核对退款。');return [];}let q=clearPlots(s,a.indices,n);selectedPlot=null;return q?[q]:[];}if(a.mode==='soil-batch'){if(s.rev!==a.rev||JSON.stringify(improvementQuote(s,n))!==a.quote){toast('田地或余额已变化，请重新确认费用。');return [];}let result=improveAll(s,n);for(let e of result.events)fieldFeedback(e.index,e,n,null);return result.events;}if(s.soil[a.i]!==a.soil){toast('这块田已变化，请重新选择。');return [];}let e=improve(s,a.i,n);return e?[e]:[];});resetMode();};
const expandRow=document.createElement('div');expandRow.className='build-row';expandRow.innerHTML='<span class="build-symbol">▦</span><div class="build-info"><strong>开垦两块新田</strong><small></small></div><button></button>';expandRow.querySelector('button').onclick=()=>transact((s,n)=>[expand(s,n)].filter(Boolean));$('expansion').append(expandRow);
const forecastTime=seconds=>{let n=Math.ceil(seconds),h=Math.floor(n/3600),m=Math.floor(n%3600/60),s=n%60;return(h?h+'小时':'')+(m?m+'分':'')+(s?s+'秒':'')||'0秒';};
const compareOptions=()=>({soil:Number($('compareSoil').value),watered:$('compareWater').checked});
function shopMatches(){let list=matchingCrops(state,{group:filter,query:$('seedSearch').value.trim(),only:$('unlockedOnly').checked,sort:$('seedSort').value,...compareOptions()});list=list.filter(c=>simpleFilter==='all'||simpleFilter==='quick'&&c.seconds<=600||simpleFilter==='long'&&c.seconds>=14400||simpleFilter==='repeat'&&c.harvests>1);return $('seedSort').value==='level'?newSeedsFirst(list,freshSeedIds(state,[...seenSeeds])):list;}
function refreshPreview(){let list=shopMatches();if(!list.some(c=>c.id===(previewId||selected)))previewId=list.find(c=>unlocked(state,c.id))?.id||list[0]?.id||selected;}
function previewCrop(id){$('seedAdvanced').open=true;$('manageSheet').close();previewId=id;filter='全部';returnPlan='any';$('seedSearch').value='';$('unlockedOnly').checked=false;seedLimit=40;seedSignature='';openSeeds(true);}
for(let plan of PLANS){let b=document.createElement('button');b.textContent=plan.label;b.dataset.plan=plan.id;b.onclick=()=>{returnPlan=plan.id;seedLimit=12;seedSignature='';refreshPreview();renderUI();};$('returnPlans').append(b);}
for(let id of ['compareSoil','compareWater'])$(id).onchange=()=>{seedSignature='';refreshPreview();renderUI();};
$('seedSort').onchange=()=>{seedLimit=12;seedSignature='';renderUI();};
$('resetSeedFilters').onclick=()=>{returnPlan='any';simpleFilter='all';filter='全部';$('seedSearch').value='';$('unlockedOnly').checked=true;$('seedSort').value='level';seedLimit=12;seedSignature='';renderUI();};
for(let name of ['全部','短作','中作','长作','再生','果树']){let b=document.createElement('button');b.textContent=name;b.onclick=()=>{filter=name;seedLimit=12;seedSignature='';refreshPreview();renderUI();};b.dataset.filter=name;$('seedFilters').append(b);}
$('seedSearch').oninput=()=>{seedLimit=12;seedSignature='';refreshPreview();renderUI();};$('unlockedOnly').onchange=()=>{seedLimit=12;seedSignature='';refreshPreview();renderUI();};$('moreSeeds').onclick=()=>{seedLimit=40;seedSignature='';renderUI();};
function renderSeedPreview(n){let matches=shopMatches();$('selectedIcon').parentElement.hidden=!matches.length;if(!matches.length){$('useSeed').disabled=true;$('useSeed').textContent='没有符合筛选的种子';return;}let c=crop(previewId||selected),m=cropComparison(c,compareOptions()),allowed=unlocked(state,c.id);if(iconChoice!==c.id){drawIcon($('selectedIcon'),c.id);iconChoice=c.id;}$('selectedName').textContent=c.name+' · '+c.group+(allowed?'':' · '+c.level+'级解锁');$('selectedStats').textContent='种子 '+(c.cost?c.cost+'币':'免费')+' · 每茬售 '+m.value+'币 / '+c.xp+'经验';$('seedDetail').textContent='初熟 '+forecastTime(m.first)+(c.harvests>1?' · 共'+c.harvests+'茬，续果'+forecastTime(m.regrow):' · 单次采收')+' · 完整周期 '+forecastTime(m.total)+' · 全茬净利 '+m.net+'币 · '+cropRole(c);$('seedEta').textContent=(allowed?'现在种，初熟：':'假设现在播种，初熟：')+readyMoment(n+m.first*1000,n)+(c.harvests>1?'。全程需多次及时采收。':'');$('useSeed').disabled=!allowed;$('useSeed').textContent=allowed?'用'+c.short+'，开始播种':c.level+'级解锁 · 可先预览';}
for(let [id,label] of [['all','都能种'],['quick','几分钟'],['long','放几小时'],['repeat','多次结果']]){let b=document.createElement('button');b.textContent=label;b.dataset.simple=id;b.onclick=()=>{simpleFilter=id;seedSignature='';renderUI();};$('simpleFilters').append(b);}
function selectSeed(id,fill=false){if(!unlocked(state,id))return;choose(id);mode='normal';selectedPlot=null;closeSeeds();transact((s,n)=>[queueSeed(s,id,n)].filter(Boolean),{silent:true}).then(()=>{if(fill)batch('plant');else renderUI();});}
let seedCategory='gold';
const shopCatalog=SEED_CATEGORIES.flatMap(group=>group.crops.map(id=>crop(id)));
function nextLockedSeed(){return shopCatalog.filter(c=>!unlocked(state,c.id)).sort((a,b)=>a.level-b.level)[0];}
function renderSeeds(){
 if(!$('seedSheet').open)return;
 const next=nextLockedSeed();
 const group=SEED_CATEGORIES.find(group=>group.id===seedCategory);
 const signature=[seedCategory,selected,levelOf(state.xp),state.legacyUnlocked.join(','),iconChoice].join('|');
 if(signature===seedSignature)return;
 seedSignature=signature;
 $('mutationHint').hidden=seedCategory!=='variant';
 $('nextShopUnlock').textContent=next?'下一个解锁：'+next.short+' · 园艺 '+next.level+' 级':'本季种子已全部解锁';
 for(const button of $('seedCategoryTabs').children)button.setAttribute('aria-pressed',String(button.dataset.category===seedCategory));
 $('seeds').replaceChildren();
 const visible=group.crops.map(crop).filter(c=>unlocked(state,c.id));
 const compactTime=seconds=>formatTime(seconds).replace('小时','时').replace('分钟','分');
 for(const c of visible){
  const button=document.createElement('button');
  button.className='seed-tile';
  button.setAttribute('aria-pressed',String(selected===c.id));
  button.setAttribute('aria-label','选择'+c.name+'，种价 '+c.cost+'，收获 '+c.coins+' 金币 '+c.xp+' 经验，成熟 '+formatTime(c.seconds));
  const icon=document.createElement('canvas');
  icon.setAttribute('aria-hidden','true');
  drawIcon(icon,c.id);
  const title=document.createElement('strong');
  title.textContent=c.short;
  const values=document.createElement('span');
  values.className='seed-tile-values';
  for(const [label,value] of [['种价',c.cost?c.cost:'免费'],['每茬 '+(c.units||1)+' 份',c.harvests>1?'× '+c.harvests+' 茬':''],['金币',c.coins],['经验',c.xp],['成熟',compactTime(c.seconds)]]){
   const item=document.createElement('span');
   item.textContent=label+' '+value;
   values.append(item);
  }
  button.append(icon,title,values);
  button.onclick=()=>selectSeed(c.id);
  $('seeds').append(button);
 }
 $('noSeeds').hidden=visible.length>0;
 $('noSeeds').textContent='这类种子还没解锁';
}
for(const group of SEED_CATEGORIES){
 const button=document.createElement('button');
 button.dataset.category=group.id;
 button.textContent=group.label;
 button.onclick=()=>{seedCategory=group.id;seedSignature='';renderSeeds();};
 $('seedCategoryTabs').append(button);
}
function renderGoals(){const g=growthGoals(state),next=nextLockedSeed();$('nextLevelGoal').textContent=progress(state).max?'园艺已满级。':'再得 '+g.remaining+' 经验升到 '+(g.level+1)+' 级。'+(next?'下一个：'+next.short+'（园艺 '+next.level+' 级）':'本季种子已全部解锁');$('nextCropPreview').disabled=!next;$('nextCropPreview').textContent=next?'查看种子铺':'本季已解锁';let e=g.expansion;$('nextExpansionGoal').textContent=e?'下次开田 '+e.level+'级 · '+e.count+'块田。'+(e.xpMissing?'还差 '+e.xpMissing+' 经验。':'等级已够。')+(e.coinsMissing?'还差 '+e.coinsMissing+' 币。':'金币已够。'):'12块田已全部开垦。';}
function renderFarmJourney(n){
 if(!$('manageSheet').open)return;
 const overview=farmOverview(state,n),quote=tendingQuote(state,n),rank=progress(state);
 const close=fn=>()=>{$('manageSheet').close();fn();};
 const pick=close(openSeeds);
 const orchard=close(()=>$('orchardTab').click());
 const harvest=close(()=>$('cycleAll').click());
 const selling=state.orchard.basketValue||0;
 const fruit=Number($('orchardPage').dataset.stored||0);
 const cash=state.coins;
 const currencies=value=>value.toLocaleString('zh-CN');
 function action(id,label,handler){
  const button=$(id);
  button.hidden=!handler;
  if(!handler)return;
  if(button.textContent!==label)button.textContent=label;
  button.onclick=handler;
 }
 let title,detail,label,handler;
 if(quote.harvests||quote.planted||quote.watered){
  title=quote.harvests?quote.harvests+' 块田可以收获':quote.planted?quote.planted+' 块空田可以播种':'有 '+quote.watered+' 块田可以浇水';
  detail=[quote.harvests?'收 '+quote.harvests+' 块':null,quote.planted?'种 '+quote.planted+' 块 · '+currencies(quote.cost)+' 金币':null,quote.watered?'浇水 '+quote.watered+' 块':null].filter(Boolean).join(' · ');
  label='一键打理';handler=harvest;
 }else if(selling||fruit){
  title=selling?'果篮可卖 '+currencies(selling)+' 金币':'果园有 '+fruit+' 颗熟果';
  detail=selling?'出售后金币立即到账，可用来播种或改良。':'摘果会增加果树经验，再去果篮出售。';
  label=selling?'去卖果':'去摘果';
  handler=selling?close(()=>{$('orchardTab').click();$('basketText').click();}):orchard;
 }else if(overview.empty.length){
  title='还有 '+overview.empty.length+' 块空田';
  detail=quote.shortfall?'当前种子预算不足，免费萝卜可以直接种。':'选好种子，就能开始下一轮。';
  label=quote.shortfall?'种免费萝卜':'去选种';
  handler=quote.shortfall?close(()=>transact((s,t)=>{queueSeed(s,'radish',t);return tendAll(s,t).events;})):pick;
 }else{
  title='这一轮已经照料好了';
  detail='离线会继续生长。可以先选下一轮种子。';
  label='安排下一轮';handler=pick;
 }
 $('farmNowTitle').textContent=title;$('farmNowDetail').textContent=detail;
 action('farmNowAction',label,handler);
 const basketAction=close(()=>{$('orchardTab').click();$('basketText').click();});
 const offerFruit=(selling||fruit)&&label!=='去卖果'&&label!=='去摘果';
 action('farmAltAction',offerFruit?(selling?'果篮 · '+currencies(selling)+' 金币':'果园 · '+fruit+' 颗可摘'):'换种子',offerFruit?(selling?basketAction:orchard):(handler===pick?null:pick));
 const next=overview.next;
 if(next){
  const p=state.plots[next.index],t=plantTerms(p);
  $('farmSoonTitle').textContent=crop(p.id).short+' · 还剩 '+exactCountdown(next.seconds);
  $('farmSoonDetail').textContent='第 '+(next.index+1)+' 块田 · '+t.units+' 份 · '+currencies(p.value)+' 金币 + '+p.xp+' 经验';
  action('farmSoonAction','看这块田',close(()=>locatePlot(next.index)));
 }else{
  $('farmSoonTitle').textContent=overview.mature.length?'成熟作物会等你回来':'种下第一轮，就能看到预计收成';
  $('farmSoonDetail').textContent=overview.mature.length?'现在有 '+overview.mature.length+' 块可收。':'种子铺会写明首次成熟时间。';
  action('farmSoonAction','',null);
 }
 const seed=nextLockedSeed(),expansion=EXPANSIONS[(state.plotCount-6)/2];
 const soil=soilLevels(state);
 const availableSoils=state.soil.slice(0,state.plotCount).map((tier,i)=>({i,tier,next:soil[tier+1]})).filter(x=>x.next);
 const field=availableSoils.sort((a,b)=>Number(b.next.level<=rank.level)-Number(a.next.level<=rank.level)||a.next.cost-b.next.cost)[0];
 const goal=expansion&&(!seed||expansion.level<=seed.level||expansion.level<=rank.level)?'expand':seed?'seed':field?'field':'rank';
 let target,note,ratio,buttonText,callback;
 if(goal==='expand'){
  target='开到 '+expansion.count+' 块田';
  const needed=Math.max(0,threshold(expansion.level)-state.xp),gap=Math.max(0,expansion.cost-cash);
  note=(needed?'还差 '+currencies(needed)+' 经验 · ':'等级已达标 · ')+(gap?'还差 '+currencies(gap)+' 金币':'费用 '+currencies(expansion.cost)+' 金币');
  ratio=needed?state.xp/threshold(expansion.level):cash/expansion.cost;
  buttonText=needed?'去选高经验作物':gap?'去安排赚钱':('开垦 · '+currencies(expansion.cost)+' 金币');
  callback=needed?close(()=>openSeeds(false,'xp')):gap?close(()=>openSeeds(false,'gold')):close(()=>expandRow.querySelector('button').click());
 }else if(goal==='seed'){
  const needed=Math.max(0,threshold(seed.level)-state.xp);
  target='解锁'+seed.short;note='园艺 Lv.'+seed.level+' · 再赚 '+currencies(needed)+' 经验';
  ratio=state.xp/threshold(seed.level);buttonText='去选高经验作物';callback=close(()=>openSeeds(false,'xp'));
 }else if(goal==='field'){
  const gap=Math.max(0,field.next.cost-cash),needed=Math.max(0,threshold(field.next.level)-state.xp);
  target='第 '+(field.i+1)+' 块田升到 Lv.'+(field.tier+2);
  note='下轮耗时 −'+Math.round((1-field.next.speed)*100)+'% · 售价 +'+Math.round((field.next.bonus-1)*100)+'%';
  if(gap)note+=' · 还差 '+currencies(gap)+' 金币';
  if(needed)note+=' · 还差 '+currencies(needed)+' 经验';
  ratio=needed?state.xp/threshold(field.next.level):cash/field.next.cost;
  buttonText=needed?'去选高经验作物':gap?'去安排赚钱':'查看改良 · '+currencies(field.next.cost)+' 金币';
  callback=needed?close(()=>openSeeds(false,'xp')):gap?close(()=>openSeeds(false,'gold')):close(()=>{mode='soil';openFieldDialog(field.i);});
 }else{
  target=rank.max?'园艺 Lv.60 · 全田 Lv.10':'园艺升到 Lv.'+(rank.level+1);
  note=rank.max?'可以继续养果树，桃、李、梨的上限都是 Lv.100。':'再得 '+currencies(rank.need-rank.have)+' 经验';
  ratio=rank.max?1:rank.have/rank.need;buttonText=rank.max?'去果园':'去选高经验作物';callback=rank.max?orchard:close(()=>openSeeds(false,'xp'));
 }
 $('farmTargetTitle').textContent=target;$('farmTargetDetail').textContent=note;
 $('farmTargetProgress').hidden=false;$('farmTargetProgress').value=Math.floor(Math.min(1,ratio)*100);
 action('farmTargetAction',buttonText,callback);
}
let nextSignature='';
function locatePlot(i){if(i==null)return;mode='normal';inspect(i);let plot=plotButtons[i],r=plot.getBoundingClientRect(),dock=$('controlDock').getBoundingClientRect();if(r.top<0||r.bottom>dock.top)plot.scrollIntoView({block:'center',behavior:reduced?'instant':'smooth'});}
function renderOverview(n){let o=farmOverview(state,n);for(let [id,label,i] of [['overviewReady','成熟 '+o.mature.length+'块',o.mature[0]],['overviewEmpty','空田 '+o.empty.length+'块',o.empty[0]],['overviewNext',o.next?'最近成熟 '+exactCountdown(o.next.seconds):o.mature.length?'成熟等你收':'等你播种',o.next?.index]]){let b=$(id);b.textContent=label;b.disabled=i==null;b.onclick=()=>locatePlot(i);b.setAttribute('aria-label',label+(i==null?'':'，定位第'+(i+1)+'块田'));}}
$('comparePlot').onclick=()=>{if(selectedPlot===null)return;let i=selectedPlot;$('compareSoil').value=state.soil[i];$('compareWater').checked=false;returnPlan='any';filter='全部';$('seedSearch').value='';$('unlockedOnly').checked=false;previewId=state.plots[i]?.id||selected;seedLimit=40;seedSignature='';openSeeds();};
let fieldIconSeed='';
function renderFieldPlantBar(c,quote,empty){
 if(fieldIconSeed!==c.id){drawIcon($('fieldSeedIcon'),c.id);fieldIconSeed=c.id;}
 $('fieldSeedMode').textContent=empty?'点空田播种':'下一轮种';
 $('fieldSeedPrice').textContent=c.short+' · '+(c.cost?c.cost+' 金币':'免费');
 const singleGap=empty?Math.max(0,c.cost-state.coins):0;
 $('seedShortfall').hidden=!singleGap&&!quote.shortfall;
 $('seedShortfallText').textContent=singleGap?'种一块还差 '+singleGap+' 金币':'打理全部还差 '+quote.shortfall+' 金币';
}
function renderUI(){let n=now(),pr=progress(state);if(preview||rain7Release)selected=state.nextSeed||preferredLongSeed(state);else if(!unlocked(state,selected))selected='radish';let c=crop(selected),r=0,empty=0,dry=0;renderStatus();
 for(let i=0;i<12;i++){let b=plotButtons[i],p=state.plots[i],locked=i>=state.plotCount,isReady=!locked&&ready(state,p,n),clock=maturityTime(state,p,n),seconds=clock.seconds||0,label=locked?'待开垦':mode==='soil'?soilLevels(state)[state.soil[i]].name:mode==='shovel'?(p?'铲除'+crop(p.id).short:'空地'):!p?(mode==='plant'?'种'+c.short:'＋'):isReady?'成熟可收':clock.label;b.className='plot '+(locked?'is-locked':!p?'is-empty':isReady?'is-ready':'is-growing')+(mode!=='normal'?' tool-'+mode:'')+(selectedPlot===i?' is-selected':'');let soilTag=b.querySelector('.soil-tag');soilTag.textContent=locked||!state.soil[i]?'':soilLevels(state)[state.soil[i]].name;soilTag.dataset.tier=state.soil[i];let regrow=b.querySelector('.regrow-tag');regrow.textContent=!locked&&p?.cycle>1?(isReady?'第'+p.cycle+'茬可收':'第'+p.cycle+'茬结果中'):'';let showCrop=!locked&&p&&mode==='normal',name=b.querySelector('.plot-name'),timer=b.querySelector('.plot-timer'),care=b.querySelector('.care-tag');let nameText=showCrop?crop(p.id).short:label,timerText=showCrop?label:'';if(name.textContent!==nameText)name.textContent=nameText;if(timer.textContent!==timerText)timer.textContent=timerText;care.textContent=!locked&&p&&!isReady?(p.watered?'已浇水':'可浇水'):'';care.dataset.watered=String(!!p?.watered);b.querySelector('.mini-progress').hidden=locked||!p||isReady||mode!=='normal';b.querySelector('i').style.width=growth(state,p,n)*100+'%';b.setAttribute('aria-label','第'+(i+1)+'块田，'+soilLevels(state)[state.soil[i]].name+'，'+(locked?'尚未开垦':!p?'空地，种下'+c.name+'，'+(c.cost?c.cost+'金币':'免费'):crop(p.id).name+'，'+(mode==='plant'?'已有作物，完成播种后可操作':isReady?'已成熟，轻点直接采收，长按查看详情':'距离成熟还剩 '+clock.countdown+'，'+(p.watered?'已浇水':'轻点直接浇水，长按看详情'))+(plantTerms(p).harvests>1?'，还可采'+p.remaining+'次':'')));if(!locked){if(isReady)r++;if(!p)empty++;if(p&&!isReady&&!p.watered)dry++;}}
 let nearest=farmOverview(state,n).next;let rq=tendingQuote(state,n);renderFieldPlantBar(c,rq,empty);$('cycleAll').hidden=false;$('plantAll').hidden=true;$('cycleAll').hidden=!rq.harvests&&!rq.planted&&!rq.watered;$('cycleAll').disabled=false;$('cycleLabel').textContent='一键打理';$('cycleCost').textContent='收 '+rq.harvests+' · 种 '+rq.planted+' · 花 '+rq.cost+' 金币';$('cycleAll').setAttribute('aria-label','一键打理，收'+rq.harvests+'块，补种'+rq.planted+'块，花费'+rq.cost+'金币'+(rq.skipped?'，另有'+rq.skipped+'块钱不够':''));$('readyCount').textContent=r;let sq=sowingQuote(state,selected);$('plantLabel').textContent=sq.count?(sq.count<sq.empty?'种'+sq.count+'块空田':'种满空田')+' · '+sq.cost+'币':sq.empty?'金币不足 · 换种子':'田已种满';$('plantAll').disabled=!sq.count;$('plantAll').setAttribute('aria-label','用'+c.name+'补种所有空地');$('harvestAll').disabled=!r;$('plantAll').disabled=!sq.count;$('repeatAll').disabled=!empty;$('waterAll').disabled=!dry;$('waterAll').textContent='一键浇水'+(dry?' '+dry:'');$('clearAll').disabled=!state.plots.slice(0,state.plotCount).some(Boolean);$('quickHint').textContent=r?r+'块成熟了，点「一键打理」一起安排好':empty?empty+'块空田，点「一键打理」':dry?'点「一键打理」，把浇水也一起完成':nearest?'最近一块还剩 '+exactCountdown(nearest.seconds)+'成熟':'选个种子，就能开始种';$('plotCount').textContent=state.plotCount+' / 12 块田';$('shovelMode').setAttribute('aria-pressed',String(mode==='shovel'));$('soilMode').setAttribute('aria-pressed',String(mode==='soil'));
 $('sowMode').setAttribute('aria-pressed',String(mode==='plant'));$('sowMode').textContent=mode==='plant'?'完成':'播种';$('sowMode').setAttribute('aria-label',mode==='plant'?'结束连续播种':'开启连续播种');$('tip').textContent=mode==='plant'?'播种中：'+c.short+' · 逐块点空田，滑动不会播种':mode==='shovel'?'铲除模式 · 点作物查看退款，再次点「铲除」退出':mode==='soil'?'改良模式 · 点一块田查看费用，再次点「改良田地」退出':r?r+'块田成熟 · 轻点收菜 / 长按详情':empty?'已选'+c.short+' · 轻点空地播种，上下滑动翻页':'作物正在长大 · 长按查看详情';
 renderOrchard(n);$('nextSeedNote').hidden=!state.nextSeed;$('nextSeedNote').textContent=state.nextSeed?'下一轮：'+crop(state.nextSeed).short+(preview||rain7Release?' · 恢复自动选种':' · 点此恢复原品种'):'';renderOverview(n);renderSeedPreview(n);renderGoals();renderFarmJourney(n);let count=available(state).length;$('cropCount').textContent=shopCatalog.filter(c=>unlocked(state,c.id)).length+'/'+shopCatalog.length;$('unlockedCount').textContent='已解锁 '+count+' / '+CROPS.length;$('stageText').textContent='本季 12 种';
 let next=[nextLockedSeed()].filter(Boolean),sig=next.map(x=>x.id).join();if(nextSignature!==sig){nextSignature=sig;$('nextUnlocks').replaceChildren();for(let x of next){let row=document.createElement('div');row.className='unlock-row';let icon=document.createElement('canvas');drawIcon(icon,x.id);let text=document.createElement('div');let strong=document.createElement('strong');strong.textContent=x.name;let small=document.createElement('small');small.textContent=x.level+'级 · '+x.group+' · '+formatTime(x.seconds);text.append(strong,small);let preview=document.createElement('button');preview.textContent='预览';preview.setAttribute('aria-label','预览'+x.name);preview.onclick=()=>{$('manageSheet').close();openSeeds();};row.append(icon,text,preview);$('nextUnlocks').append(row);}if(!next.length)$('nextUnlocks').textContent='本季种子已全部解锁。';}
 let e=EXPANSIONS[(state.plotCount-6)/2],button=expandRow.querySelector('button');button.disabled=!e||pr.level<e.level||state.coins<e.cost;button.textContent=!e?'已开满':pr.level<e.level?e.level+'级解锁':e.cost+'币';expandRow.querySelector('small').textContent=!e?'十二块田已全部开垦':e.level+'级 · '+e.cost+'币 · '+state.plotCount+' → '+e.count+'块';$('soilSummary').textContent=state.soil.slice(0,state.plotCount).map((tier,i)=>'第'+(i+1)+'块 '+soilLevels(state)[tier].name).join(' · ');let iq=improvementQuote(state,n);$('improveAll').disabled=!iq.count;$('improveAll').textContent=iq.count?'一键改良'+iq.count+'块 · '+iq.cost+'币':iq.eligible?'金币不足，暂不能改良':'暂无可改良田地';$('improveAllHint').textContent='符合等级的有'+iq.eligible+'块，本次预算够改良'+iq.count+'块。每块升一级，当前作物的时间和收益保留，下轮生效。';$('migrationNotice').hidden=!state.legacyNote;renderInspector();$('seedBalance').textContent=state.coins.toLocaleString('zh-CN')+'币';$('dockSeedName').textContent='种什么：'+c.short;$('dockSeedInfo').textContent=(c.cost?c.cost+'币/种子':'免费种子');$('saveState').textContent=memoryOnly?'未能保存 · 请导出':'本机已保存';renderSeeds();
}
function renderInspector(){let panel=$('plotInspector');panel.hidden=selectedPlot===null;if(selectedPlot===null)return;if(selectedPlot>=state.plotCount){selectedPlot=null;panel.hidden=true;return;}let d=plotDetails(state,selectedPlot,now(),selected);$('plotTitle').textContent='第'+(selectedPlot+1)+'块 · '+(d.empty?'空地':d.name);$('plotPhase').textContent=d.phase+' · '+d.soil;$('plotCountdownLabel').textContent=d.countdownLabel;$('plotCountdown').textContent=d.countdown;$('plotReadyAt').textContent=d.readyAt;$('plotCycles').textContent=d.cycles;$('plotValue').textContent=(d.empty?'预计':'本茬')+' '+d.units+'份 · '+d.value+'币 / '+d.xp+'经验';$('plotGround').textContent=d.soilEffect;$('plotProgress').value=d.progress;$('plotPrimary').disabled=d.action==='wait'||d.action==='plant'&&state.coins<crop(selected).cost;$('plotPrimary').textContent={plant:'种'+crop(selected).short,harvest:'收获这一块',water:'浇水 · 减时25%',wait:'本茬已浇水'}[d.action];let sig=d.id+'|'+d.empty;if(sig!==inspectorIcon){drawIcon($('plotIcon'),d.id);inspectorIcon=sig;}}
function openSeeds(advanced=false,category){seedCategory=category||SEED_CATEGORIES.find(group=>group.crops.includes(selected))?.id||'gold';if($('fieldDialog').open)return;mode='normal';simpleFilter='all';filter='全部';seedLimit=40;$('seedSearch').value='';$('unlockedOnly').checked=true;seedSignature='';previewId=previewId||selected;selectedPlot=null;taps.cancel();$('seedAdvanced').open=advanced===true;$('seedSheet').showModal();$('seedSheet').querySelector('.seed-sheet-body').scrollTop=0;document.body.classList.add('sheet-open');$('shop').setAttribute('aria-expanded','true');renderUI();}
function closeSeeds(){$('seedSheet').close();}
$('closeSeedSheet').onclick=closeSeeds;$('useSeed').onclick=()=>{let id=previewId||selected;if(!unlocked(state,id))return;selectSeed(id);};$('seedSheet').addEventListener('close',()=>{markSeedsSeen();document.body.classList.remove('sheet-open');$('shop').setAttribute('aria-expanded','false');$('fieldChangeSeed').focus({preventScroll:true});});
const dockObserver=new ResizeObserver(()=>{document.documentElement.style.setProperty('--dock-height',Math.ceil($('controlDock').getBoundingClientRect().height)+'px');});dockObserver.observe($('controlDock'));
$('dismissMigration').onclick=()=>transact(s=>{s.legacyNote=false;return [{kind:'notice',message:'继续经营你的小农场'}];},{silent:true});$('shop').onclick=()=>openSeeds();$('dockSeed').onclick=()=>openSeeds();$('fieldChangeSeed').onclick=()=>openSeeds();$('useFreeRadish').onclick=()=>{previewId='radish';transact((s,n)=>[queueSeed(s,'radish',n)],{silent:true});};
function closeSheet(d){d.close();}
function syncSheetLock(){document.body.classList.toggle('sheet-open',!!document.querySelector('dialog[open]'));}
function openManage(){taps.cancel();const sheet=$('manageSheet');sheet.showModal();sheet.scrollTop=0;sheet.querySelector('.sheet-content').scrollTop=0;syncSheetLock();renderGoals();renderFarmJourney(now());}
$('manage').onclick=openManage;$('goalShortcut').onclick=openManage;
$('nextCropPreview').onclick=()=>{$('manageSheet').close();openSeeds();};$('closeManage').onclick=()=>closeSheet($('manageSheet'));
$('soilShortcut').onclick=()=>{$('manageSheet').close();switchMode('soil');};
$('settings').onclick=()=>{$('preferences').hidden=false;$('settingsSheet').showModal();$('settings').setAttribute('aria-expanded','true');syncSheetLock();};
$('closeSettings').onclick=()=>{$('settingsSheet').close();$('settings').setAttribute('aria-expanded','false');};
for(let d of document.querySelectorAll('dialog'))d.addEventListener('close',()=>{syncSheetLock();if(d.id==='settingsSheet')$('settings').setAttribute('aria-expanded','false');wake();setTimeout(showUnlock,100);});
$('sound').onclick=async()=>{sound=!sound;try{await soundscape.set(sound);$('sound').setAttribute('aria-pressed',String(sound));$('sound').setAttribute('aria-label',sound?'关闭声音':'开启声音');if(sound)tone('plant');}catch{sound=false;toast('声音暂未能开启，请重试。');}};
let unlockQueue=[],unlockTimer;
function queueUnlock(list){unlockQueue.push(...list.filter(c=>!unlockQueue.some(x=>x.id===c.id)));clearTimeout(unlockTimer);unlockTimer=setTimeout(showUnlock,1200);}
function showUnlock(){if(!unlockQueue.length)return;let names=unlockQueue.map(c=>c.short).join('、');unlockQueue=[];toast('新种子可种：'+names+'，点「换种子」看看。');tone('unlock');}
function dismissUnlock(){unlockQueue=[];$('unlockDialog').close();}
$('closeUnlock').onclick=dismissUnlock;$('unlockDialog').addEventListener('cancel',()=>{unlockQueue=[];});$('plantUnlocked').onclick=()=>{let c=unlockQueue[0];if(c)choose(c.id);mode='normal';selectedPlot=null;dismissUnlock();renderUI();toast('已选'+crop(selected).short+'，轻点空田播种');};
$('export').onclick=()=>{pullLatest();state.at=now();let blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=(preview?'wind-farm-orchard-preview-':'wind-farm-v3-')+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),15000);$('backupMessage').textContent='已发起下载，请确认浏览器保存了JSON备份。';};
$('import').onchange=async e=>{let f=e.target.files?.[0];e.target.value='';if(!f)return;try{if(f.size>100000)throw Error('文件过大');pendingImport=parse(await f.text());$('importSummary').textContent='备份：园艺'+levelOf(pendingImport.xp)+'级，'+pendingImport.coins+'币，'+pendingImport.plotCount+'块田。确认后替换当前农场。';$('importPreview').hidden=false;$('backupMessage').textContent='请核对后确认。';}catch(e){pendingImport=null;$('importPreview').hidden=true;$('backupMessage').textContent='导入未完成：'+e.message+'。当前农场保留。';}};
if(rain7Release){
 try{
  $('adoptPreviewSave').hidden=!localStorage.getItem('windfarm-rain-preview-v1');
 }catch{}
 $('adoptPreviewSave').onclick=()=>{
  try{
   const raw=localStorage.getItem('windfarm-rain-preview-v1');
   if(!raw)return;
   pendingImport=parse(raw);
   $('importSummary').textContent='试玩存档：'+pendingImport.coins.toLocaleString('zh-CN')+' 金币 · '+pendingImport.plotCount+' 块田。确认后以这份存档继续。';
   $('importPreview').hidden=false;
  }catch{$('backupMessage').textContent='这份试玩存档无法读取。';}
 };
}
$('cancelImport').onclick=()=>{pendingImport=null;$('importPreview').hidden=true;};$('confirmImport').onclick=async()=>{if(!pendingImport)return;let incoming=pendingImport;pendingImport=null;await transact((s,n)=>{if(!memoryOnly&&lastRaw)try{localStorage.setItem(KEY+'-before-import',lastRaw);}catch{}state=incoming;state.at=Math.max(n,state.at);upgradeFarm(state);if(preview)applyRainPreviewStipend(state);memoryOnly=false;return [{kind:'import',message:'已恢复备份中的农场'}];});$('importPreview').hidden=true;$('backupMessage').textContent=memoryOnly?'已读取，但本机保存失败，请保留原备份。':'备份已恢复。';if(!memoryOnly)$('storageWarning').hidden=true;};
window.addEventListener('storage',e=>{if(e.key===KEY){pullLatest();renderUI();}});
function frame(t){raf=0;if(!visible||document.hidden)return;if(orchard.active)orchard.render(t/1000);else scene.render(state,now(),t/1000,reduced,{selected:selectedPlot});renderStatus();lastFrame=t;if(t-lastHud>=1000){renderUI();lastHud=t;}let delay=orchard.active?orchard.delay():scene.delay(t/1000,reduced,!!document.querySelector('dialog[open]'));frameTimer=setTimeout(()=>{frameTimer=0;if(visible&&!document.hidden)raf=requestAnimationFrame(frame);},delay);}
function wake(){if(!visible||document.hidden)return;clearTimeout(frameTimer);frameTimer=0;if(!raf)raf=requestAnimationFrame(frame);}
document.addEventListener('visibilitychange',()=>{visible=!document.hidden;$('orchardCanvas').dataset.paused=String(!visible);if(visible){soundscape.resume();pullLatest();renderUI();lastHud=0;wake();}else{feedback.clear();hud.snap(state.coins,state.xp);soundscape.pause();taps.cancel();cancelAnimationFrame(raf);clearTimeout(frameTimer);raf=0;frameTimer=0;}});window.addEventListener('blur',()=>taps.cancel());
assetsReady.then(()=>{fieldIconSeed='';seedSignature='';iconChoice='';inspectorIcon='';nextSignature='__reload';renderUI();wake();});

const orchard=createOrchardUI({getState:()=>state,now,transact,tone,reduced});
function renderOrchard(n){orchard.update(n);}
$('nextSeedNote').onclick=()=>transact((s,n)=>[queueSeed(s,null,n)]);
$('openOrchard').onclick=()=>$('orchardTab').click();
renderUI();transact(s=>{let funded=preview&&applyRainPreviewStipend(s);if(rain7Release&&s.economy!==7&&lastRaw&&!memoryOnly)try{localStorage.setItem(KEY+'-before-rain7',lastRaw);}catch{}let updated=upgradeFarm(s);return funded||updated||!lastRaw?[{kind:'initial'}]:[];},{silent:true});orchard.observe();wake();
if(new URLSearchParams(location.search).has('audit')){let badge=document.createElement('p');badge.id='auditBadge';badge.style='background:#f4dfb2;padding:10px;font-size:12px';badge.textContent='开发时钟：快进用于验收，不代表真人等待。';document.querySelector('header').after(badge);window.farmAudit={get state(){return structuredClone(state)},get renderStats(){return {...scene.stats,feedback:feedback.stats}},async advance(seconds){offset=Math.max(offset,state.at-Date.now())+Math.max(0,Math.min(86400,seconds))*1000;await transact((s,n)=>{s.at=n;return [{kind:'clock'}];},{silent:true});},async grow(cycles=1){for(let j=0;j<Math.min(cycles,40);j++){await transact((s,n)=>{let out=[];for(let i=0;i<s.plotCount;i++){let e=harvest(s,i,n);if(e)out.push(e);e=plant(s,i,selected,n);if(e)out.push(e);e=water(s,i,n);if(e)out.push(e);}return out;},{silent:true});await this.advance(28801);}},async expand(){return transact((s,n)=>[expand(s,n)].filter(Boolean));}};}

if(preview){$('previewControls').hidden=false;for(let b of document.querySelectorAll('[data-fixture]'))b.onclick=async()=>{let hours=Number(b.dataset.fixture),base=Date.now(),fresh=newGame(base);fresh.coins=5000;fresh.xp=320;if(hours){fresh.orchard.trees=['apple','pear','peach'].map(id=>({id,born:base,collected:0,care:0}));fresh.at=base+hours*3600000;}offset=hours*3600000;observed=fresh.at;await transact(()=>{state=fresh;selected='radish';previewId='radish';try{localStorage.setItem(preferenceKey('windfarm-seed-v1'),'radish');}catch{}offset=hours*3600000;observed=fresh.at;return [{kind:'fixture'}];},{silent:true});orchard.reset();};$('previewAdvance').onclick=async()=>{offset=Math.max(offset,state.at-Date.now())+4*3600000;await transact((s,n)=>{s.at=n;return [{kind:'clock'}];},{silent:true});orchard.observe();};}
