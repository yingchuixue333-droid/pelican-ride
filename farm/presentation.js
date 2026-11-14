import {crop,growth,ready,time,SOILS} from './model.js?v=20261114f';
const nonFlowering=new Set(['radish','carrot','root','leaf','lotus','mushroom','wheat','corn']);
export function visualPhase(s,p,now){
 if(!p)return {phase:-1,label:'空地',progress:0,established:false};
 let c=crop(p.id),g=growth(s,p,now),established=p.cycle>1;
 if(ready(s,p,now))return {phase:4,label:'已成熟',progress:1,established};
 let phase=established?(g<.28?1:g<.5?2:3):(g<.16?0:g<.42?1:g<.64?2:3),label;
 if(phase===0)label=c.shape==='tree'?'幼树扎根':'萌芽';
 if(phase===1)label=established?'采后展叶':c.shape==='tree'?'树冠生长':'长叶';
 if(phase===2)label=nonFlowering.has(c.shape)?(c.shape==='leaf'?'叶丛舒展':c.shape==='wheat'||c.shape==='corn'?'抽穗':'逐渐长大'):'开花';
 if(phase===3)label=g<.84?(nonFlowering.has(c.shape)?'充实生长':'幼果生长'):'渐渐成熟';
 if(c.shape==='mushroom')label=['菌菇冒头','菌柄生长','菌盖展开','菌盖饱满','已成熟'][phase];
 if(c.shape==='wheat'||c.shape==='corn'){if(phase===1)label='拔节长高';if(phase===3)label=g<.84?'灌浆饱满':'渐渐成熟';}
 if(['radish','carrot','root'].includes(c.shape)&&phase===2)label='根部膨大';
 if(['flower','moon'].includes(c.shape)&&phase===3)label='花朵舒展';
 if(c.id==='asparagus'&&phase===2)label='新笋伸长';
 if(c.id==='asparagus'&&phase===3)label='笋茎充实';
 return {phase,label,progress:g,established};
}
export function exactCountdown(seconds){let n=Math.max(0,Math.ceil(seconds));let h=Math.floor(n/3600),m=Math.floor(n%3600/60),s=n%60;return [h,m,s].map(v=>String(v).padStart(2,'0')).join(':');}
// Always derive the countdown from the saved maturity deadline, never planted/elapsed time.
export function maturityTime(s,p,now){if(!p)return {seconds:null,countdown:'等待播种',label:'等待播种',ripe:false};let seconds=Math.max(0,Math.ceil((p.end-time(s,now))/1000));return {seconds,countdown:exactCountdown(seconds),label:seconds?'还剩 '+exactCountdown(seconds):'成熟可收',ripe:seconds===0};}
const dayFormat=new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'});
const clockFormat=new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Shanghai',hour:'2-digit',minute:'2-digit',hour12:false});
export function readyMoment(end,now){let day=dayFormat.format(end),today=dayFormat.format(now),tomorrow=dayFormat.format(now+86400000);return (day===today?'今天':day===tomorrow?'明天':day)+' '+clockFormat.format(end)+'（北京时间）';}
export function plotDetails(s,i,now,selected='radish'){
 now=time(s,now);let p=s.plots[i],c=crop(p?.id||selected),soil=SOILS[s.soil[i]],v=visualPhase(s,p,now),ripe=ready(s,p,now),clock=maturityTime(s,p,now);
 return {index:i,id:c.id,name:c.name,empty:!p,ripe,phase:v.label,progress:v.progress,countdown:ripe?'成熟可收':clock.countdown,countdownLabel:!p?'当前空田':ripe?'现在就能收':'距离成熟还剩',readyAt:p?(ripe?'已成熟，随时可收':'预计成熟：'+readyMoment(p.end,now)):'选好种子即可开始',cycles:p?'第'+p.cycle+'/'+c.harvests+'茬 · 还可收'+p.remaining+'次':'本品种共可收'+c.harvests+'次',value:p?p.value:Math.round(c.coins*soil.bonus),xp:p?p.xp:c.xp,soil:soil.name,soilEffect:soil.speed===1?'普通田 · 标准生长和售价':'下轮：生长时间减'+Math.round((1-soil.speed)*100)+'% · 售价加'+Math.round((soil.bonus-1)*100)+'%',action:!p?'plant':ripe?'harvest':p.watered?'wait':'water'};
}
