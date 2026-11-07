import assert from 'node:assert/strict';
import {newGame,CROPS,levelOf,plant,water,harvest,expand,build,claimOrder} from '../farm/model.js';
const START=1800000000000;let reports=[];
for(let policy of ['radish-care','mixed-care','mixed-no-care']){
 let s=newGame(START,459271),marks={},previous=1;
 for(let sec=0;sec<=1800;sec++){
 let n=START+sec*1000;
 for(let i=0;i<s.plotCount;i++)harvest(s,i,n);
 if(s.order.count===3)claimOrder(s,n);
 expand(s,n);for(let id of ['bath','mill','house'])build(s,id,n);
 for(let i=0;i<s.plotCount;i++){let choices=CROPS.filter(c=>c.level<=levelOf(s.xp)),id=policy==='radish-care'?'radish':choices[(i+Math.floor(sec/60))%choices.length].id;plant(s,i,id,n);if(policy!=='mixed-no-care')water(s,i,n);}
 let level=levelOf(s.xp);for(let l=previous+1;l<=level;l++)marks[l]=sec;previous=level;
 if(sec===600||sec===1200||sec===1800)reports.push({policy,minutes:sec/60,level,coins:s.coins,plots:s.plotCount,allFacilities:Object.values(s.buildings).every(Boolean),unlocked:CROPS.filter(c=>c.level<=level).length,first9:marks[9]??null});
 }
 assert.equal(s.plotCount,12);assert(Object.values(s.buildings).every(Boolean));assert(marks[9]<1200,policy+' should reach all crops within20min under stated active strategy');
}
console.log(JSON.stringify({assumptions:'每秒检查并立即采收补种；care策略每株浇一次；及时领取可完成委托、优先扩地并购买能负担的设施；无蝴蝶加速、无真人操作延迟。',reports},null,2));
