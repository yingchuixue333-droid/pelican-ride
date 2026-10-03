import {CONFIG as C,clamp} from './config.js?v=20261003-v4a';
// Authored decision templates. All low routes are legal without tricks.
export const MODULES=[
{id:'short-snow',name:'短雪丘 · 一跳收手',family:'short',theme:0,gravity:1.30,ops:[['rock',1700]],amp:35,waves:3},
{id:'short-trees',name:'林间短跳',family:'short',theme:1,gravity:1.25,ops:[['rock',1400],['rock',2350]],amp:24,waves:2},
{id:'short-ice',name:'冰坡小跨步',family:'short',theme:1,gravity:1.25,ops:[['rock',1800]],ice:true,amp:18,waves:2},
{id:'short-bay',name:'海风轻跃',family:'short',theme:3,gravity:1.28,ops:[['rock',1600]],amp:28,waves:3},
{id:'launch-valley',name:'雪谷长跳台',family:'launch',theme:0,ramp:1550,power:1.34,amp:65,slope:.15,ops:[]},
{id:'launch-bowl',name:'谷底蓄速 · 双圈可选',family:'launch',theme:3,ramp:1750,power:2.25,large:true,amp:95,slope:.15,ops:[['rock',3100]]},
{id:'launch-ice',name:'冰河起跳线',family:'launch',theme:1,ramp:1450,power:1.30,ice:true,amp:60,ops:[]},
{id:'launch-cave',name:'洞口宽跳台',family:'launch',theme:2,ramp:1550,power:1.42,amp:70,ops:[]},
{id:'fork-valley',name:'阳光高低路',family:'fork',theme:0,ramp:1300,power:1.26,platform:true,offset:120,ops:[['rock',2400]],amp:46},
{id:'fork-ridge',name:'海湾连续岩台',family:'fork',theme:3,ramp:1500,power:1.33,platform:true,offset:165,ops:[['log',2600]],amp:60},
{id:'fork-ice',name:'浮冰与低路',family:'fork',theme:1,ramp:1450,power:1.28,platform:true,sink:true,offset:100,ops:[['rock',2700]],amp:38},
{id:'fork-crystal',name:'晶洞分岔',family:'fork',theme:2,ramp:1600,power:1.33,platform:true,offset:140,ops:[['rock',2800]],amp:48},
{id:'relay-bridge',name:'林桥接力 · 保狐或换兔',family:'relay',theme:1,ramp:1250,power:1.30,platform:true,bridge:true,offset:100,groundMount:'fox',relayMount:'rabbit',ops:[],amp:48},
{id:'relay-floe',name:'浮冰接上雪狐',family:'relay',theme:1,ramp:1350,power:1.32,platform:true,sink:true,offset:120,groundMount:'bear',relayMount:'fox',ops:[['icewall',3000]],amp:34},
{id:'relay-cave',name:'晶台接力 · 雪兔与雪团兽',family:'relay',theme:2,ramp:1400,power:1.25,platform:true,offset:130,groundMount:'rabbit',relayMount:'bear',ops:[],amp:50},
{id:'relay-bay',name:'海湾跃上下一位伙伴',family:'relay',theme:3,ramp:1500,power:1.38,platform:true,offset:150,groundMount:'fox',relayMount:'rabbit',ops:[['rock',3100]],amp:64},
{id:'cave-low',name:'洞顶很低 · 收起翻转',family:'ceiling',theme:2,ops:[['arch',1500]],clearance:200,amp:20},
{id:'cave-turn',name:'洞顶之后再跳',family:'ceiling',theme:2,ops:[['arch',1100],['log',2500]],clearance:210,amp:36},
{id:'cave-step',name:'低拱与岩台',family:'ceiling',theme:2,ops:[['arch',1150]],clearance:220,platform:true,offset:110,platformStart:2000,amp:32},
{id:'cave-snowball',name:'可见滚雪球轨迹',family:'ceiling',theme:2,ops:[['snowball',1850]],platform:true,offset:115,amp:42},
{id:'cloud-rise',name:'气流托起 · 主动落回',family:'cloud',theme:2,ramp:1450,power:1.35,platform:true,cloud:true,offset:220,wing:true,updraft:true,amp:55},
{id:'cloud-return',name:'云台回落 · 一圈还是两圈',family:'cloud',theme:3,ramp:1500,power:1.35,platform:true,cloud:true,offset:180,wing:true,amp:60},
{id:'cloud-gap',name:'云间雪桥 · 扑翼修正',family:'cloud',theme:3,ramp:1150,power:1.22,gap:[1800,1970],platform:true,cloud:true,offset:165,amp:40},
{id:'cloud-long',name:'长坡接上云台',family:'cloud',theme:0,ramp:1500,power:1.40,platform:true,cloud:true,offset:200,wing:true,amp:64},
{id:'breath',name:'顺着鱼群 · 歇一口气',family:'rest',theme:-1,rest:true,ops:[],amp:12}
];
export function rng(seed){let x=seed>>>0;return()=>{x=(Math.imul(x,1664525)+1013904223)>>>0;return x/4294967296;};}
export function createLevel(seed=1,cycle=0,options={}){
 let rand=rng(seed+cycle*1999),segments=[],obstacles=[],items=[],platforms=[],cursor=0,y=0,last='',ids=[];
 const intro=['short-snow','launch-valley','fork-valley','short-snow','breath','relay-bridge','launch-ice','short-trees','fork-ice','breath','cave-low','launch-cave'];
 const families=['short','launch','fork','relay','ceiling','cloud'];let order=[...families];for(let i=order.length-1;i;i--){let j=Math.floor(rand()*(i+1));[order[i],order[j]]=[order[j],order[i]];}
 for(let i=0;i<24;i++){
  let id;if(cycle===0&&!options.skipTutorial&&i<intro.length)id=intro[i];else if(i%5===4)id='breath';else{let fam=order[(i-Math.floor(i/5))%6],pool=MODULES.filter(m=>m.family===fam);if(options.daily==='relay'&&i%4===2)pool=MODULES.filter(m=>m.family==='relay');if(options.daily==='cloud'&&i%4===2)pool=MODULES.filter(m=>m.family==='cloud');if(options.daily==='trick'&&i%4===2)pool=MODULES.filter(m=>m.family==='launch');id=pool[Math.floor(rand()*pool.length)].id;}
  const def=MODULES.find(m=>m.id===id);let theme=def.rest?(segments.at(-1)?.theme||0):def.theme,stage=Math.min(4,cycle),length=def.rest?2100:3600+Math.floor(rand()*700);
  let s={...def,index:i,theme,start:cursor,end:cursor+length,y,slope:def.slope||.075+rand()*.09,amp:def.amp+(cycle?rand()*15:0),waves:def.waves||1,items:[],obstacles:[],platforms:[],entrySpeed:[C.base,C.base*1.7],jumpWindows:[],landingZones:[],restoreSpace:700,risk:def.family==='cloud'?2:1,stage};cursor+=length;segments.push(s);y=groundOn(s,s.end);ids.push(id);
  let ops=(def.ops||[]).map(o=>[...o]);if(stage>=1&&!def.rest&&['short','launch','fork'].includes(def.family)&&i%3===0)ops.push(['rock',length-500]);
  for(let[kind,baseOff]of ops){let off=baseOff+(cycle||i>11?(rand()-.5)*240:0),o={id:`${cycle}:${i}-${kind}-${off}`,kind,x:s.start+off,w:kind==='log'?110:kind==='arch'?290:70,h:kind==='log'?75:kind==='arch'?345:kind==='icewall'?75:kind==='snowball'?60:33,clearance:kind==='arch'?(def.clearance||230):0,phase:rand()*6.28};s.obstacles.push(o);obstacles.push(o);s.jumpWindows.push({earliest:o.x-420,latest:o.x-125,kind});}
  if(def.platform){let q={id:`platform-${cycle}-${i}`,start:s.start+(def.platformStart||1700),end:s.start+3000,offset:def.offset||120,cloud:!!def.cloud,sink:!!def.sink,mount:null,theme};s.platforms.push(q);platforms.push(q);s.landingZones.push({start:q.start,end:q.end,yOffset:q.offset});}
  let add=it=>{items.push(it);s.items.push(it);};for(let j=0;j<7;j++){let x=s.end-1050+j*130;add({id:`fish-g-${cycle}-${i}-${j}`,kind:'fish',x,y:groundOn(s,x)-45});}
  if(def.groundMount)add({id:`partner-${cycle}-${i}`,kind:'partner',mount:def.groundMount,x:s.start+500,y:groundOn(s,s.start+500)-45});
  if(def.relayMount){let x=s.start+2350;add({id:`relay-${cycle}-${i}`,kind:'partner',mount:def.relayMount,relay:true,routeId:s.platforms[0].id,x,y:groundOn(s,x)-(def.offset||120)-45});}
  if(def.wing){let x=s.start+480;add({id:`wind-${cycle}-${i}`,kind:'wind',x,y:groundOn(s,x)-45});}
  if(i%8===7){let x=s.start+700;add({id:`magnet-${cycle}-${i}`,kind:'magnet',x,y:groundOn(s,x)-45});}
  if(i===13||(cycle>0&&i===2)){let x=s.start+700;add({id:`feather-${cycle}-${i}`,kind:'feather',x,y:groundOn(s,x)-50});}
  let target=s.obstacles.find(o=>!['arch'].includes(o.kind)),takeoff=s.start+(s.ramp||0);if(target)takeoff=target.x-300;
  if(s.ramp||target){let base=C.base*(1+.025*stage),v=C.jump*(s.ramp?s.power||1.3:1),y0=groundOn(s,takeoff);for(let j=0;j<7;j++){let t=.1+j*.135,x=takeoff+base*t;add({id:`fish-a-${cycle}-${i}-${j}`,kind:'fish',x,y:y0-v*t+C.gravity*(s.gravity||1)*t*t/2-45});}}
  if(s.platforms.length)for(let j=0;j<7;j++){let q=s.platforms[0],x=q.start+100+j*165;add({id:`fish-high-${cycle}-${i}-${j}`,kind:'fish',x,y:groundOn(s,x)-q.offset-45});}
 }
 return {seed,cycle,options,segments,obstacles,items,platforms,fallbacks:[],finish:cursor,lastEnd:cursor,templateIds:ids};
}
export function segmentAt(l,x){let lo=0,hi=l.segments.length-1;while(lo<hi){let m=(lo+hi)>>1;if(x>=l.segments[m].end)lo=m+1;else hi=m;}return l.segments[lo];}
export function groundOn(s,x){let u=clamp((x-s.start)/(s.end-s.start),0,1);return s.y+s.slope*(x-s.start)+s.amp*Math.sin(u*Math.PI*(s.waves||1))**2;}
export function ground(l,x){return groundOn(segmentAt(l,x),x);}export function tangent(l,x){return Math.atan((ground(l,x+1)-ground(l,x-1))/2);}
export function gapAt(l,x){let s=segmentAt(l,x);return s.gap&&x>s.start+s.gap[0]&&x<s.start+s.gap[1];}
export function platformY(l,p,x,time=0,touch){return ground(l,x)-p.offset+(p.sink?Math.min(18,Math.max(0,time-(touch??time))*10):0);}
export function surface(l,x,oldY,newY,time=0,touches=null){let choices=[];if(!gapAt(l,x))choices.push({y:ground(l,x),platform:null});for(let p of l.platforms){if(x>=p.start&&x<=p.end){let y=platformY(l,p,x,time,touches?.get(p.id));if(oldY<=y+6&&newY>=y-3)choices.push({y,platform:p});}}return choices.sort((a,b)=>a.y-b.y).find(q=>oldY<=q.y+6&&newY>=q.y-3)||null;}
export function obstacleX(o,time){return o.x+(o.kind==='snowball'?Math.sin(time*.8+o.phase)*30:0);}
