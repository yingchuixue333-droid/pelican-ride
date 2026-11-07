import {validate as oldValidate,levelOf as oldLevel,CROPS as OLD_CROPS} from './legacy.js?v=20261107d';
export {CROPS,crop,EXPANSIONS,SOILS,formatTime} from './catalog.js?v=20261107d';
import {CROPS,crop,EXPANSIONS,SOILS} from './catalog.js?v=20261107d';
export const KEY='windfarm-v2',OLD_KEY='windfarm-v1';
export const REQUIREMENTS=[12,36,72,120,180,240,320,400,480,560,640,720,800];
const LIMIT=1000;
const bounds=[0];for(let n of REQUIREMENTS)bounds.push(bounds.at(-1)+n);
export function levelOf(xp){if(xp>=bounds.at(-1))return bounds.length+Math.floor((xp-bounds.at(-1))/LIMIT);let n=1;while(xp>=bounds[n])n++;return n;}
export function threshold(level){return level<=bounds.length?bounds[level-1]:bounds.at(-1)+(level-bounds.length)*LIMIT;}
export function progress(s){let level=levelOf(s.xp),base=threshold(level),need=REQUIREMENTS[level-1]||LIMIT;return {level,have:s.xp-base,need};}
export const time=(s,now=Date.now())=>Math.max(s.at,now);
export const unlocked=(s,id)=>!!crop(id)&&(crop(id).level<=levelOf(s.xp)||s.legacyUnlocked.includes(id));
export const available=s=>CROPS.filter(c=>unlocked(s,c.id));
const stats=()=>Object.fromEntries(CROPS.map(c=>[c.id,{sown:0,harvest:0}]));
export function newGame(now=Date.now()){let s={version:2,rev:0,at:now,coins:80,xp:0,plotCount:6,plots:Array(12).fill(null),soil:Array(12).fill(0),lastSeeds:Array(12).fill('radish'),stats:stats(),legacyUnlocked:[],legacyNote:false};for(let i=0;i<4;i++){let start=now-(i<2?120000:60000);s.plots[i]=makePlant(s,i,'radish',start);s.stats.radish.sown++;}return s;}
function makePlant(s,i,id,start){let c=crop(id),ground=SOILS[s.soil[i]],duration=c.seconds*1000*ground.speed;return {id,start,end:start+duration,duration,watered:false,paid:c.cost,remaining:c.harvests,cycle:1,value:Math.round(c.coins*ground.bonus),xp:c.xp};}
export const ready=(s,p,now)=>!!p&&time(s,now)>=p.end;
export const growth=(s,p,now)=>p?Math.min(1,Math.max(0,1-(p.end-time(s,now))/p.duration)):0;
function award(s,xp){let before=levelOf(s.xp);s.xp+=xp;let levels=levelOf(s.xp)-before;s.coins+=levels*25;return levels;}
export function plant(s,i,id,now){let c=crop(id);if(!Number.isInteger(i)||i<0||i>=s.plotCount||s.plots[i]||!unlocked(s,id)||s.coins<c.cost)return false;now=time(s,now);s.coins-=c.cost;s.plots[i]=makePlant(s,i,id,now);s.lastSeeds[i]=id;s.stats[id].sown++;s.at=now;return {kind:'plant',cost:c.cost,message:'种下'+c.short+(c.cost?' · -'+c.cost+'币':' · 免费种子')};}
export function water(s,i,now){let p=s.plots[i];if(i>=s.plotCount||!p||p.watered||ready(s,p,now))return false;now=time(s,now);p.watered=true;p.end=Math.max(now,p.end-p.duration*.25);s.at=now;return {kind:'water',message:'浇水完成 · 本茬生长时间减少25%'};}
export function harvest(s,i,now){let p=s.plots[i];if(i>=s.plotCount||!ready(s,p,now))return false;now=time(s,now);let c=crop(p.id),coins=p.value,xp=p.xp;s.coins+=coins;let levels=award(s,xp);s.stats[p.id].harvest++;let repeated=p.remaining>1;if(repeated){p.remaining--;p.cycle++;p.start=now;p.duration=c.regrowSeconds*1000*SOILS[s.soil[i]].speed;p.end=now+p.duration;p.watered=false;p.value=Math.round(c.coins*SOILS[s.soil[i]].bonus);}else s.plots[i]=null;s.at=now;return {kind:'harvest',coins,xp,levels,repeated,message:c.short+' +'+coins+'币 · +'+xp+'经验'+(repeated?' · 还可收'+p.remaining+'次':'')+(levels?' · 升级！':'')};}
export function expand(s,now){let e=EXPANSIONS[(s.plotCount-6)/2];if(!e||s.coins<e.cost||levelOf(s.xp)<e.level)return false;s.coins-=e.cost;s.plotCount=e.count;s.at=time(s,now);return {kind:'build',message:'新增两块田 · 现在有'+s.plotCount+'块'};}
export function improve(s,i,now){if(i<0||i>=s.plotCount)return false;let soil=SOILS[s.soil[i]+1];if(!soil||levelOf(s.xp)<soil.level||s.coins<soil.cost)return false;s.coins-=soil.cost;s.soil[i]++;s.at=time(s,now);return {kind:'build',message:'第'+(i+1)+'块升级为'+soil.name+' · 下次播种或结果时生效'};}
export function refundFor(p){return p&&p.cycle===1?Math.floor(p.paid*.5):0;}
export function uproot(s,i,now){let p=s.plots[i];if(i<0||i>=s.plotCount||!p)return false;let refund=refundFor(p);s.coins+=refund;s.plots[i]=null;s.at=time(s,now);return {kind:'uproot',message:'已铲除'+crop(p.id).short+' · 退回'+refund+'币'};}
const int=(n,a=0,b=1e9)=>Number.isSafeInteger(n)&&n>=a&&n<=b;
function validateV2(raw){
 if(!raw||raw.version!==2||!int(raw.rev)||!int(raw.at,0,9e15)||!int(raw.coins)||!int(raw.xp)||![6,8,10,12].includes(raw.plotCount)||!Array.isArray(raw.soil)||raw.soil.length!==12||!raw.soil.every(n=>int(n,0,2))||!Array.isArray(raw.lastSeeds)||raw.lastSeeds.length!==12||!raw.lastSeeds.every(crop)||!Array.isArray(raw.legacyUnlocked)||raw.legacyUnlocked.length>6||!raw.legacyUnlocked.every(id=>OLD_CROPS.some(c=>c.id===id))||typeof raw.legacyNote!=='boolean')throw Error('农场数据格式或数值不正确');
 let s={version:2,rev:raw.rev,at:raw.at,coins:raw.coins,xp:raw.xp,plotCount:raw.plotCount,soil:raw.soil.slice(),lastSeeds:raw.lastSeeds.slice(),legacyUnlocked:[...new Set(raw.legacyUnlocked)],legacyNote:raw.legacyNote,plots:[],stats:{}};
 for(let c of CROPS){let st=raw.stats?.[c.id];if(!st||!int(st.sown)||!int(st.harvest))throw Error('种植记录不正确');s.stats[c.id]={sown:st.sown,harvest:st.harvest};}
 if(!Array.isArray(raw.plots)||raw.plots.length!==12)throw Error('田地数量不正确');
 for(let i=0;i<12;i++){let p=raw.plots[i];if(p===null){s.plots.push(null);continue;}let c=crop(p?.id);if(i>=s.plotCount||!c||!int(p.start,0,9e15)||!Number.isFinite(p.end)||p.end<p.start||p.end>p.start+28800000||!Number.isFinite(p.duration)||p.duration<1000||p.duration>28800000||typeof p.watered!=='boolean'||!int(p.paid)||!int(p.remaining,1,c.harvests)||!int(p.cycle,1,c.harvests)||p.cycle+p.remaining!==c.harvests+1||!int(p.value,0,1000000)||!int(p.xp,0,10000))throw Error('植株数据不正确');s.plots.push({id:p.id,start:p.start,end:p.end,duration:p.duration,watered:p.watered,paid:p.paid,remaining:p.remaining,cycle:p.cycle,value:p.value,xp:p.xp});}
 return s;
}
export function migrate(raw){let old=oldValidate(raw),oldRank=Math.min(40,oldLevel(old.xp)),oldNeed=oldRank>=10?60:[12,18,24,30,36,42,48,54,60][oldRank-1],oldBase=oldRank>=10?324+(oldRank-10)*60:[0,12,30,54,84,120,162,210,264][oldRank-1],s=newGame(old.at);s.rev=old.rev;s.coins=old.coins+(old.buildings.bath?110:0)+(old.buildings.mill?180:0);s.xp=threshold(oldRank)+Math.floor(Math.min(.99,Math.max(0,(old.xp-oldBase)/oldNeed))*(REQUIREMENTS[oldRank-1]||LIMIT));s.plotCount=old.plotCount;s.soil=Array(12).fill(old.buildings.house?1:0);s.legacyNote=true;s.legacyUnlocked=OLD_CROPS.filter(c=>c.level<=oldLevel(old.xp)).map(c=>c.id);s.plots=old.plots.map((p,i)=>{if(!p)return null;let c=crop(p.id),oldCrop=OLD_CROPS.find(x=>x.id===p.id);s.lastSeeds[i]=p.id;return {id:p.id,start:p.start,end:p.end,duration:p.duration,watered:p.watered,paid:0,remaining:c.harvests,cycle:1,value:Math.max(c.coins,Math.round(oldCrop.coins*[1,1.5,2,2.5][p.variant])),xp:c.xp};});s.stats=stats();for(let c of OLD_CROPS)s.stats[c.id]={sown:old.stats[c.id].sown,harvest:old.stats[c.id].harvest};return validateV2(s);}
export function validate(raw){return raw?.version===1?migrate(raw):validateV2(raw);}
export function parse(text){if(typeof text!=='string'||text.length>100000)throw Error('备份过大或格式不正确');return validate(JSON.parse(text));}
