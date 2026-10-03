import {CONFIG as C,clamp} from './config.js?v=20261003-one2';
export const MODULES=[
 {id:'pebbles',name:'轻点越过雪石',theme:0,ops:[['rock',1600]]},
 {id:'timber',name:'雪松横卧的长坡',theme:0,ops:[['log',1700]]},
 {id:'fox',name:'雪狐同行',theme:0,ops:[['rock',1100]],groundMount:'fox'},
 {id:'launch',name:'雪谷弧形跳台',theme:0,ops:[],ramp:1300,route:true},
 {id:'shelf',name:'阳光鱼弧高路',theme:0,ops:[['rock',1750]],platform:true,route:true},
 {id:'forest',name:'杉树桥高路',theme:1,ops:[['log',1300]],platform:true,route:true},
 {id:'bridge',name:'木桥飞落冰河',theme:1,ops:[],ramp:1150,platform:true,bridge:true,route:true},
 {id:'ice',name:'冰河宽阔滑行',theme:1,ops:[['rock',2100]],ice:true},
 {id:'floes',name:'轻摇浮冰',theme:1,ops:[['rock',1550]],platform:true,sink:true,route:true},
 {id:'bear',name:'雪团兽的薄冰门',theme:1,ops:[['icewall',2350]],groundMount:'bear'},
 {id:'tunnel',name:'蓝晶拱廊',theme:2,ops:[['arch',1200],['rock',2300]]},
 {id:'snowball',name:'洞穴滚雪球',theme:2,ops:[['snowball',1600]],platform:true,route:true},
 {id:'cloud',name:'气流冲出洞口',theme:2,ops:[],ramp:1050,platform:true,cloud:true,wing:true,updraft:true,route:true},
 {id:'rabbit',name:'雪兔岩台',theme:2,ops:[['rock',2200]],platform:true,groundMount:'rabbit',route:true},
 {id:'cave',name:'晶柱之间的回落',theme:2,ops:[['arch',1100],['log',2400]],platform:false},
 {id:'double',name:'海湾双圈大跳台',theme:3,ops:[],ramp:1500,large:true,route:true},
 {id:'ridge',name:'海风长坡',theme:3,ops:[['log',1400]],route:true},
 {id:'corridor',name:'海湾风帆冲刺',theme:3,ops:[],corridor:true},
 {id:'ledge',name:'云雾岩桥',theme:3,ops:[],gap:[1500,1710],ramp:1200,platform:true,route:true},
 {id:'lighthouse',name:'灯塔就在前方',theme:3,ops:[],ramp:1350,large:true,landmark:true},
 {id:'breath',name:'顺着鱼群喘口气',theme:-1,ops:[],rest:true}
];
export function rng(seed){let x=seed>>>0;return()=>{x=(Math.imul(x,1664525)+1013904223)>>>0;return x/4294967296;};}
export function createLevel(seed=1,cycle=0){let rand=rng(seed),segments=[],obstacles=[],items=[],platforms=[],cursor=0,y=0;const story=[['pebbles','timber','fox','launch','breath','shelf','pebbles','launch','shelf','breath'],['forest','bridge','bear','floes','breath','ice','forest','bridge','floes','breath'],['tunnel','rabbit','snowball','cloud','breath','cave','cloud','rabbit','tunnel','breath'],['ridge','ledge','double','corridor','breath','ridge','double','corridor','breath','lighthouse']];
 for(let i=0;i<40;i++){let theme=Math.floor(i/10),slot=i%10,id=story[theme][slot];if(slot===5||slot===6){const choices=story[theme].filter(x=>!['breath','fox','bear','rabbit','lighthouse','tunnel','cave'].includes(x));id=choices[Math.floor(rand()*choices.length)];}const def=MODULES.find(m=>m.id===id),length=def.rest?2100:def.landmark?5200:3000;let s={...def,index:i,theme,start:cursor,end:cursor+length,y,slope:.085+rand()*.05,amp:def.large?90:def.ramp?45:12+rand()*22,items:[],obstacles:[],platforms:[],entrySpeed:[C.base,C.base*1.7],jumpWindows:[],landingZones:[],restoreSpace:650};cursor+=length;segments.push(s);y=groundOn(s,s.end);
 for(let[kind,off]of def.ops){let o={id:`${i}-${kind}`,kind,x:s.start+off,w:kind==='log'?110:kind==='arch'?300:70,h:kind==='log'?80:kind==='arch'?360:kind==='icewall'?78:kind==='snowball'?66:34,clearance:kind==='arch'?300:0,phase:rand()*6.28};s.obstacles.push(o);obstacles.push(o);s.jumpWindows.push({earliest:o.x-400,latest:o.x-105,kind});}
 if(def.platform){let p={id:`platform-${i}`,start:s.start+1130,end:s.start+2400,offset:def.cloud?220:def.bridge?80:105,cloud:!!def.cloud,sink:!!def.sink,mount:null,theme};s.platforms.push(p);platforms.push(p);s.landingZones.push({start:p.start,end:p.end,yOffset:p.offset});}
 const add=it=>{items.push(it);s.items.push(it)};
 for(let j=0;j<9;j++){let x=s.end-1060+j*92;add({id:`fish-g-${i}-${j}`,kind:'fish',x,y:groundOn(s,x)-45});}
 if(def.groundMount&&(![23,27].includes(i)||i===21))add({id:`partner-${i}`,kind:'partner',mount:def.groundMount,x:s.start+1950,y:groundOn(s,s.start+1950)-45});
 if(def.wing)add({id:`wind-${i}`,kind:'wind',x:s.start+650,y:groundOn(s,s.start+650)-45});
 if(i%7===3)add({id:`magnet-${i}`,kind:'magnet',x:s.start+600,y:groundOn(s,s.start+600)-45});
 if(i%9===6)add({id:`feather-${i}`,kind:'feather',x:s.start+720,y:groundOn(s,s.start+720)-50});
 const target=s.obstacles.find(o=>o.kind!=='arch');let takeoff=s.start+(s.ramp||0);if(target)takeoff=target.x-290;if(s.ramp||target){let base=C.base*(1+theme*.025),v=C.jump*(s.ramp?(s.large?1.9:1.32):1),y0=groundOn(s,takeoff);for(let j=0;j<7;j++){let t=.10+j*.135,x=takeoff+base*t;add({id:`fish-a-${i}-${j}`,kind:'fish',x,y:y0-v*t+C.gravity*t*t/2-45});}}
 if(def.route&&def.platform){for(let j=0;j<6;j++){let x=s.start+1350+j*135;add({id:`fish-high-${i}-${j}`,kind:'fish',x,y:groundOn(s,x)-(def.cloud?220:105)-45});}if([6,16,26].includes(i))add({id:`high-partner-${i}`,kind:'partner',mount:['fox','bear','rabbit'][theme%3],x:s.start+2110,y:groundOn(s,s.start+2110)-150});}
 }
 return {seed,cycle,segments,obstacles,items,platforms,fallbacks:[],finish:cursor};}
export function segmentAt(l,x){let lo=0,hi=l.segments.length-1;while(lo<hi){let m=(lo+hi)>>1;if(x>=l.segments[m].end)lo=m+1;else hi=m;}return l.segments[lo];}
export function groundOn(s,x){let u=clamp((x-s.start)/(s.end-s.start),0,1);return s.y+s.slope*(x-s.start)+s.amp*Math.sin(u*Math.PI*2)**2;}
export function ground(l,x){return groundOn(segmentAt(l,x),x);}export function tangent(l,x){return Math.atan((ground(l,x+1)-ground(l,x-1))/2);}
export function gapAt(l,x){let s=segmentAt(l,x);return s.gap&&x>s.start+s.gap[0]&&x<s.start+s.gap[1];}
export function platformY(l,p,x,time=0,touch){return ground(l,x)-p.offset+(p.sink?Math.min(18,Math.max(0,time-(touch??time))*10):0);}
export function surface(l,x,oldY,newY,time=0,touches=null){let choices=[];if(!gapAt(l,x))choices.push({y:ground(l,x),platform:null});for(let p of l.platforms){if(x>=p.start&&x<=p.end){let y=platformY(l,p,x,time,touches?.get(p.id));if(oldY<=y+6&&newY>=y-3)choices.push({y,platform:p});}}return choices.sort((a,b)=>a.y-b.y).find(q=>oldY<=q.y+6&&newY>=q.y-3)||null;}
export function obstacleX(o,time){return o.x+(o.kind==='snowball'?Math.sin(time*.8+o.phase)*30:0);}
