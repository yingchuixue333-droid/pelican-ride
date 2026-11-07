import {newGame,CROPS,crop,available,progress,plant,water,harvest,expand,improve,SOILS,time} from '../farm/model.js';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const T=1800000000000;
const policies=[{name:'每天4次，每次4分钟',hours:[8,12,18,22],minutes:4},{name:'每天8次，每次4分钟',hours:[8,10,12,14,16,18,20,22],minutes:4},{name:'每天12次，每次5分钟',hours:[8,9,10,11,12,13,14,16,18,20,21,22],minutes:5}];
let reports=[];
for(let policy of policies){let s=newGame(T),marks={},allAt=null,samples=[];
 const visits=[];for(let day=0;day<60;day++)for(let hour of policy.hours)visits.push({day,second:(day*24+hour)*3600});
 for(let vi=0;vi<visits.length;vi++){
  let {day,second}=visits[vi],start=T+second*1000,end=start+policy.minutes*60000,next=T+(visits[vi+1]?.second??second+36000)*1000;
  for(let n=start;n<=end;n+=10000){
   for(let i=0;i<s.plotCount;i++)harvest(s,i,n);
   while(expand(s,n)){};
   for(let i=0;i<s.plotCount;i++)improve(s,i,n);
   for(let i=0;i<s.plotCount;i++){
    if(s.plots[i]){water(s,i,n);continue;}
    let activeLeft=end-n,offLeft=next-n,choices=available(s).filter(c=>c.cost<=s.coins),speed=SOILS[s.soil[i]].speed;
    let quick=choices.filter(c=>c.seconds*750*speed<=activeLeft);
    let c=quick.length?quick.sort((a,b)=>b.xp/b.seconds-a.xp/a.seconds||a.cost-b.cost)[0]:choices.filter(c=>c.seconds*750*speed<=offLeft).sort((a,b)=>b.xp-a.xp||b.coins-b.cost-(a.coins-a.cost))[0]||crop('radish');
    plant(s,i,c.id,n);water(s,i,n);
   }
   let level=progress(s).level;for(let l=1;l<=Math.min(40,level);l++)marks[l]??=+((n-T)/86400000).toFixed(2);
   if(level>=40&&s.plotCount===12&&s.soil.every(x=>x===2)){allAt=+(day+(n-T-day*86400000)/86400000).toFixed(2);break;}
  }
  if(vi===0||vi===policy.hours.length*7-1||vi===policy.hours.length*30-1)samples.push({day:day+1,level:progress(s).level,coins:s.coins,plots:s.plotCount});
  if(allAt!==null)break;
 }
 reports.push({policy:policy.name,allContentDay:allAt,levelDays:Object.fromEntries([2,5,10,20,30,40].map(n=>[n,marks[n]??null])),samples});
}
assert(reports[1].allContentDay>=25&&reports[1].allContentDay<=35,'baseline should remain around one month');assert(reports[2].allContentDay<reports[1].allContentDay&&reports[0].allContentDay>reports[1].allContentDay);for(let r of reports){let marks=Object.values(r.levelDays);for(let i=1;i<marks.length;i++)assert(marks[i]>=marks[i-1]);}
let result={assumptions:'独立新档；每次访问逐10秒检查成熟并立即收获、浇水；有短周期可在本次访问成熟则选经验/时间最优，否则按下一次访问时间选高经验作物；重复作物保留到最后一茬；有钱且等级满足就扩地/升级土地；无作弊、日上限或强制登录。仅数值模拟，不等于真人实际时长。',reports};console.log(JSON.stringify(result,null,2));if(process.argv.includes('--save'))fs.writeFileSync('farm-balance-report.json',JSON.stringify(result,null,2)+'\n');
