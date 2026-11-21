import {rain7Release,RAIN7_CROPS,RAIN7_XP} from './rain7-balance.js?v=20261123b';
import {FIELD_LEVELS,harvestMutation} from './preview-progression.js?v=20261123b';
import {validate as oldValidate,levelOf as oldLevel,CROPS as OLD_CROPS} from './legacy.js?v=20261107d';
export {CROPS,crop,EXPANSIONS,SOILS,formatTime} from './catalog.js?v=20261123b';
import {newOrchard,validateOrchard} from './orchard.js?v=20261123b';
import {CROPS,crop,EXPANSIONS,SOILS,LEGACY_CROPS} from './catalog.js?v=20261123b';
const preview=typeof location!=='undefined'&&(new URLSearchParams(location.search).has('orchardPreview')||location.pathname.includes('/orchard-preview/'));
export const soilLevels=s=>s.fieldProgress?FIELD_LEVELS:SOILS;
export const KEY=preview?'windfarm-rain-preview-v1':'windfarm-v2',OLD_KEY=preview?'windfarm-rain-preview-legacy-v1':'windfarm-v1';
const OLD_REQUIREMENTS=[8,16,24,32,40,48,60,72,84,96,108,120];
export const REQUIREMENTS=rain7Release?RAIN7_XP:OLD_REQUIREMENTS;
const LIMIT=160;
const cumulative=steps=>steps.reduce((s,n)=>(s.push(s.at(-1)+n),s),[0]);
const oldBounds=cumulative(OLD_REQUIREMENTS),bounds=cumulative(REQUIREMENTS);
function levelAt(table,xp,capped=false){
 if(xp>=table.at(-1))return capped?table.length:table.length+Math.floor((xp-table.at(-1))/LIMIT);
 let n=1;while(xp>=table[n])n++;return n;
}
export function levelOf(xp){return levelAt(bounds,xp,rain7Release);}
export function threshold(level){return level<=bounds.length?bounds[level-1]:rain7Release?bounds.at(-1):bounds.at(-1)+(level-bounds.length)*LIMIT;}
export function progress(s){
 const level=levelOf(s.xp),base=threshold(level),max=rain7Release&&level===60;
 return {level,have:max?0:s.xp-base,need:max?0:REQUIREMENTS[level-1]||LIMIT,max};
}
export function enableRain7(s){
 if(!rain7Release||s.economy===7)return false;
 const formerLevel=levelAt(oldBounds,s.xp);
 const formerFloor=formerLevel<=oldBounds.length?oldBounds[formerLevel-1]:oldBounds.at(-1)+(formerLevel-oldBounds.length)*LIMIT;
 const priorFraction=(s.xp-formerFloor)/(OLD_REQUIREMENTS[formerLevel-1]||LIMIT);
 const mappedLevel=Math.min(60,formerLevel);
 s.xp=Math.max(s.xp,threshold(mappedLevel)+Math.floor(priorFraction*(REQUIREMENTS[mappedLevel-1]||0)));
 s.seasonUnlocked=LEGACY_CROPS.filter(c=>c.id in RAIN7_CROPS&&c.level<=formerLevel).map(c=>c.id);
 s.economy=7;
 return true;
}
export const time=(s,now=Date.now())=>Math.max(s.at,now);
export const unlocked=(s,id)=>!!crop(id)&&(crop(id).level<=levelOf(s.xp)||s.legacyUnlocked.includes(id)||s.seasonUnlocked?.includes(id));
export const available=s=>CROPS.filter(c=>unlocked(s,c.id));
// Rank by time to first harvest, then by seed price.
export function preferredLongSeed(state){
 const offered=available(state).filter(c=>!rain7Release||c.id in RAIN7_CROPS);
 return offered.reduce((best,c)=>!best||c.seconds>best.seconds||c.seconds===best.seconds&&c.cost>best.cost?c:best,null)?.id??'radish';
}
export const RAIN_PREVIEW_STIPEND=30000;
export function applyRainPreviewStipend(state){
 if(state.rainPreviewStipend)return false;
 state.coins=Math.min(1e9,state.coins+RAIN_PREVIEW_STIPEND);
 state.rainPreviewStipend=true;
 return true;
}
export function claimPlumGift(state){
 if(state.plumGiftClaimed||state.coins>1e9-10000)return false;
 state.coins+=10000;
 state.plumGiftClaimed=true;
 return {kind:'gift',message:'已领取 10,000 金币'};
}
const stats=()=>Object.fromEntries(CROPS.map(c=>[c.id,{sown:0,harvest:0}]));
export function newGame(now=Date.now()){let s={version:3,rev:0,at:now,coins:rain7Release?240:80,xp:0,plotCount:6,plots:Array(12).fill(null),soil:Array(12).fill(0),lastSeeds:Array(12).fill('radish'),stats:stats(),legacyUnlocked:[],legacyNote:false,orchard:newOrchard(now),nextSeed:null,surprise:{count:0,found:0}};for(let i=0;i<4;i++){let start=now-(i<2?crop('radish').seconds*1000:60000);s.plots[i]=makePlant(s,i,'radish',start);s.stats.radish.sown++;}return s;}
const cropTerms=c=>({harvests:c.harvests,regrowSeconds:c.regrowSeconds,coins:c.coins,units:c.units||1,xp:c.xp});
export const plantTerms=p=>p?.terms||cropTerms(crop(p.id));
function makePlant(s,i,id,start){let c=crop(id),ground=soilLevels(s)[s.soil[i]],duration=c.seconds*1000*ground.speed;return {id,start,end:start+duration,duration,watered:false,paid:c.cost,remaining:c.harvests,cycle:1,value:Math.round(c.coins*ground.bonus),xp:c.xp,...(rain7Release?{terms:cropTerms(c)}:{})};}
export const ready=(s,p,now)=>!!p&&time(s,now)>=p.end;
export const growth=(s,p,now)=>p?Math.min(1,Math.max(0,1-(p.end-time(s,now))/p.duration)):0;
function award(s,xp){let before=levelOf(s.xp);s.xp+=xp;let levels=levelOf(s.xp)-before;s.coins+=levels*25;return levels;}
export function plant(s,i,id,now){let c=crop(id);if(!Number.isInteger(i)||i<0||i>=s.plotCount||s.plots[i]||!unlocked(s,id)||s.coins<c.cost)return false;now=time(s,now);s.coins-=c.cost;s.plots[i]=makePlant(s,i,id,now);s.lastSeeds[i]=id;s.stats[id].sown++;s.at=now;return {kind:'plant',cost:c.cost,message:'种下'+c.short+(c.cost?' · -'+c.cost+'币':' · 免费种子')};}
export function water(s,i,now){let p=s.plots[i];if(i>=s.plotCount||!p||p.watered||ready(s,p,now))return false;now=time(s,now);p.watered=true;p.end=Math.max(now,p.end-p.duration*.25);s.at=now;return {kind:'water',message:'浇水完成 · 本茬生长时间减少25%'};}
export function harvest(s,i,now){let p=s.plots[i];if(i>=s.plotCount||!ready(s,p,now))return false;now=time(s,now);let c=crop(p.id),bonus=0,special='';if(s.fieldProgress){if(harvestMutation(s,p.id)){bonus=Math.ceil(p.value*.5);special='变异丰收';}}else if(s.surprise){s.surprise.count++;let roll=s.surprise.count%4;if(roll===2||roll===0){bonus=Math.max(1,Math.round(p.value*(roll===0?.5:.2)));special=roll===0?'金穗丰收':'饱满好果';s.surprise.found++;}}let coins=p.value+bonus,xp=p.xp;s.coins+=coins;let levels=award(s,xp);s.stats[p.id].harvest++;let repeated=p.remaining>1;if(repeated){p.remaining--;p.cycle++;p.start=now;const terms=plantTerms(p);p.duration=terms.regrowSeconds*1000*soilLevels(s)[s.soil[i]].speed;p.end=now+p.duration;p.watered=false;p.value=Math.round(terms.coins*soilLevels(s)[s.soil[i]].bonus);p.xp=terms.xp;}else s.plots[i]=null;s.at=now;return {kind:'harvest',units:plantTerms(p).units,coins,xp,levels,repeated,bonus,special,message:(special?special+'！':'')+c.short+' +'+coins+'币 · +'+xp+'经验'+(repeated?' · 还可收'+p.remaining+'次':'')+(levels?' · 升级！':'')};}
export function expand(s,now){let e=EXPANSIONS[(s.plotCount-6)/2];if(!e||s.coins<e.cost||levelOf(s.xp)<e.level)return false;s.coins-=e.cost;s.plotCount=e.count;s.at=time(s,now);return {kind:'build',message:'新增两块田 · 现在有'+s.plotCount+'块'};}
export function improve(s,i,now){if(i<0||i>=s.plotCount)return false;let soil=soilLevels(s)[s.soil[i]+1];if(!soil||levelOf(s.xp)<soil.level||s.coins<soil.cost)return false;s.coins-=soil.cost;s.soil[i]++;s.at=time(s,now);return {kind:'build',cost:soil.cost,message:'第'+(i+1)+'块升级为'+soil.name+' · 下次播种或结果时生效'};}
export function refundFor(p){return p?Math.floor(p.paid*p.remaining/plantTerms(p).harvests):0;}
export function uproot(s,i,now){let p=s.plots[i];if(i<0||i>=s.plotCount||!p)return false;let refund=refundFor(p);s.coins+=refund;s.plots[i]=null;s.at=time(s,now);return {kind:'uproot',refund,message:'已铲除'+crop(p.id).short+' · 退回'+refund+'币'};}
// Clear only the requested open plots. Mature produce is collected before removal.
export function clearPlots(s,indices,now){let count=0,refund=0,harvestCoins=0,xp=0,levels=0;now=time(s,now);for(let i of new Set(indices)){if(!Number.isInteger(i)||i<0||i>=s.plotCount||!s.plots[i])continue;count++;if(ready(s,s.plots[i],now)){let e=harvest(s,i,now);harvestCoins+=e.coins;xp+=e.xp;levels+=e.levels;}if(s.plots[i]){let e=uproot(s,i,now);refund+=e.refund;}}return count?{kind:'clear',count,refund,harvestCoins,xp,levels,message:'已清空'+count+'块田 · 退种子费'+refund+'币'+(harvestCoins?' · 收菜'+harvestCoins+'币':'')+(levels?' · 升级奖励'+levels*25+'币':'')}:false;}
export function clearQuote(s,indices,now){return clearPlots(structuredClone(s),indices,now);}
// One explicit visit action: collect all mature plots first, then re-sow their own last seeds.
export function harvestAndResow(s,now){let events=[],skipped=0,shortfall=0;const next=s.nextSeed||(preview||rain7Release?preferredLongSeed(s):null);now=time(s,now);for(let i=0;i<s.plotCount;i++){let id=s.plots[i]?.id,e=harvest(s,i,now);if(e)events.push({...e,index:i,id});}for(let i=0;i<s.plotCount;i++){if(s.plots[i])continue;let id=next||s.lastSeeds[i],e=plant(s,i,id,now);if(e)events.push({...e,index:i,id});else{skipped++;shortfall+=crop(id)?.cost||0;}}return {events,skipped,shortfall:skipped?Math.max(0,shortfall-s.coins):0,seed:next};}
export function resowQuote(s,now){let {events,skipped}=harvestAndResow(structuredClone(s),now);return {harvests:events.filter(e=>e.kind==='harvest').length,planted:events.filter(e=>e.kind==='plant').length,cost:events.reduce((n,e)=>n+(e.cost||0),0),coins:events.reduce((n,e)=>n+(e.coins||0),0),xp:events.reduce((n,e)=>n+(e.xp||0),0),levels:events.reduce((n,e)=>n+(e.levels||0),0),skipped};}
export function improveAll(s,now){let eligible=[];for(let i=0;i<s.plotCount;i++){let soil=soilLevels(s)[s.soil[i]+1];if(soil&&levelOf(s.xp)>=soil.level)eligible.push({index:i,cost:soil.cost});}eligible.sort((a,b)=>a.cost-b.cost||a.index-b.index);let events=[];for(let item of eligible){let e=improve(s,item.index,now);if(e)events.push({...e,index:item.index});}return {events,eligible:eligible.length,skipped:eligible.length-events.length};}
export function improvementQuote(s,now){let {events,eligible,skipped}=improveAll(structuredClone(s),now);return {count:events.length,cost:events.reduce((n,e)=>n+e.cost,0),eligible,skipped};}
const int=(n,a=0,b=1e9)=>Number.isSafeInteger(n)&&n>=a&&n<=b;
function validateV2(raw){
 if(!raw||![2,3].includes(raw.version)||!int(raw.rev)||!int(raw.at,0,9e15)||!int(raw.coins)||!int(raw.xp)||![6,8,10,12].includes(raw.plotCount)||!Array.isArray(raw.soil)||raw.soil.length!==12||!raw.soil.every(n=>int(n,0,raw.fieldProgress?9:2))||!Array.isArray(raw.lastSeeds)||raw.lastSeeds.length!==12||!raw.lastSeeds.every(crop)||!Array.isArray(raw.legacyUnlocked)||raw.legacyUnlocked.length>6||!raw.legacyUnlocked.every(id=>OLD_CROPS.some(c=>c.id===id))||typeof raw.legacyNote!=='boolean')throw Error('农场数据格式或数值不正确');
 let s={version:3,rev:raw.rev,at:raw.at,coins:raw.coins,xp:raw.xp,plotCount:raw.plotCount,soil:raw.soil.slice(),lastSeeds:raw.lastSeeds.slice(),legacyUnlocked:[...new Set(raw.legacyUnlocked)],legacyNote:raw.legacyNote,plots:[],stats:{}};
 if(raw.economy===7){s.economy=7;s.seasonUnlocked=Array.isArray(raw.seasonUnlocked)?[...new Set(raw.seasonUnlocked.filter(id=>Object.hasOwn(RAIN7_CROPS,id)))]:[];}
 if(raw.fieldProgress!==undefined){if(!int(raw.fieldProgress?.misses,0,3))throw Error('变异记录不正确');s.fieldProgress={misses:raw.fieldProgress.misses};if(int(raw.fieldProgress.roll,0,0xffffffff))s.fieldProgress.roll=raw.fieldProgress.roll;}
 if(raw.rainPreviewStipend===true)s.rainPreviewStipend=true;
 if(raw.plumGiftClaimed===true)s.plumGiftClaimed=true;
 for(let c of CROPS){let st=raw.stats?.[c.id]??(raw.version===2&&['nightwheat','starwumpkin'].includes(c.id)?{sown:0,harvest:0}:undefined);if(!st||!int(st.sown)||!int(st.harvest))throw Error('种植记录不正确');s.stats[c.id]={sown:st.sown,harvest:st.harvest};}
 if(!Array.isArray(raw.plots)||raw.plots.length!==12)throw Error('田地数量不正确');
 for(let i=0;i<12;i++){
  const p=raw.plots[i];
  if(p===null){s.plots.push(null);continue;}
  const c=crop(p?.id);
  const old=LEGACY_CROPS.find(item=>item.id===p?.id);
  const terms=p?.terms||(raw.economy===7?c:old);
  const validTerms=terms&&int(terms.harvests,1,12)&&int(terms.regrowSeconds,0,57600)&&(terms.harvests===1||terms.regrowSeconds>0)&&int(terms.coins,0,1000000)&&int(terms.xp,0,10000)&&int(terms.units??1,1,100);
  if(i>=s.plotCount||!c||!validTerms||!int(p.start,0,9e15)||!Number.isFinite(p.end)||p.end<p.start||p.end>p.start+57600000||!Number.isFinite(p.duration)||p.duration<1000||p.duration>57600000||typeof p.watered!=='boolean'||!int(p.paid)||!int(p.remaining,1,terms.harvests)||!int(p.cycle,1,terms.harvests)||p.cycle+p.remaining!==terms.harvests+1||!int(p.value,0,1000000)||!int(p.xp,0,10000))throw Error('植株数据不正确');
  s.plots.push({id:p.id,start:p.start,end:p.end,duration:p.duration,watered:p.watered,paid:p.paid,remaining:p.remaining,cycle:p.cycle,value:p.value,xp:p.xp,...(rain7Release||p.terms?{terms:cropTerms(terms)}:{})});
 }
 if(raw.version===3&&(raw.orchard===undefined||raw.surprise===undefined||raw.nextSeed===undefined))throw Error('新版存档缺少成长记录');
 if(raw.nextSeed!==undefined&&raw.nextSeed!==null&&(!crop(raw.nextSeed)||!(raw.economy!==7&&rain7Release?LEGACY_CROPS.find(c=>c.id===raw.nextSeed).level<=levelAt(oldBounds,s.xp)||s.legacyUnlocked.includes(raw.nextSeed):unlocked(s,raw.nextSeed))))throw Error('续种设置不正确');s.nextSeed=raw.nextSeed??null;
 s.orchard=raw.orchard===undefined?newOrchard(s.at):validateOrchard(raw.orchard,s.at);
 if(raw.surprise!==undefined&&(!int(raw.surprise?.count)||!int(raw.surprise?.found)||raw.surprise.found>raw.surprise.count))throw Error('丰收记录不正确');s.surprise=raw.surprise?{count:raw.surprise.count,found:raw.surprise.found}:{count:0,found:0};
 return s;
}
export function migrate(raw){let old=oldValidate(raw),oldRank=Math.min(40,oldLevel(old.xp)),oldNeed=oldRank>=10?60:[12,18,24,30,36,42,48,54,60][oldRank-1],oldBase=oldRank>=10?324+(oldRank-10)*60:[0,12,30,54,84,120,162,210,264][oldRank-1],s=newGame(old.at);s.rev=old.rev;s.coins=old.coins+(old.buildings.bath?110:0)+(old.buildings.mill?180:0);s.xp=(oldRank<=oldBounds.length?oldBounds[oldRank-1]:oldBounds.at(-1)+(oldRank-oldBounds.length)*LIMIT)+Math.floor(Math.min(.99,Math.max(0,(old.xp-oldBase)/oldNeed))*(OLD_REQUIREMENTS[oldRank-1]||LIMIT));s.plotCount=old.plotCount;s.soil=Array(12).fill(old.buildings.house?1:0);s.legacyNote=true;s.legacyUnlocked=OLD_CROPS.filter(c=>c.level<=oldLevel(old.xp)).map(c=>c.id);s.plots=old.plots.map((p,i)=>{if(!p)return null;let c=LEGACY_CROPS.find(c=>c.id===p.id),oldCrop=OLD_CROPS.find(x=>x.id===p.id);s.lastSeeds[i]=p.id;return {id:p.id,start:p.start,end:p.end,duration:p.duration,watered:p.watered,paid:0,remaining:c.harvests,cycle:1,value:Math.max(c.coins,Math.round(oldCrop.coins*[1,1.5,2,2.5][p.variant])),xp:c.xp};});s.stats=stats();for(let c of OLD_CROPS)s.stats[c.id]={sown:old.stats[c.id].sown,harvest:old.stats[c.id].harvest};return validateV2(s);}
export function validate(raw){return raw?.version===1?migrate(raw):validateV2(raw);}
export function parse(text){if(typeof text!=='string'||text.length>100000)throw Error('备份过大或格式不正确');return validate(JSON.parse(text));}

// Only future empty plots use this choice; existing crops and paid snapshots stay intact.
export function queueSeed(s,id,now){if(id!==null&&!unlocked(s,id))return false;s.nextSeed=id;s.at=time(s,now);return {kind:'queue',message:id?'下一轮种'+crop(id).short+' · 当前作物继续生长':'恢复按每块田原品种续种'};}
export function tendAll(s,now){let result=harvestAndResow(s,now);for(let i=0;i<s.plotCount;i++){let e=water(s,i,now);if(e)result.events.push({...e,index:i,id:s.plots[i].id});}return result;}
export function tendingQuote(s,now){let {events,skipped,shortfall,seed}=tendAll(structuredClone(s),now);return {harvests:events.filter(e=>e.kind==='harvest').length,planted:events.filter(e=>e.kind==='plant').length,shortfall,seed,watered:events.filter(e=>e.kind==='water').length,cost:events.reduce((n,e)=>n+(e.cost||0),0),skipped};}
