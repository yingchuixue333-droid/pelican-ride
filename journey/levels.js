import {CONFIG as C,clamp} from './config.js?v=20261003-v6c';
// Authored decision templates. All low routes are legal without tricks.
export const MODULES=[
{id:'short-snow',name:'短雪丘 · 一跳收手',family:'short',theme:0,gravity:1,ops:[['rock',1700]],amp:35,waves:3},
{id:'short-trees',name:'林间短跳',family:'short',theme:1,gravity:1,ops:[['rock',1400],['rock',2350]],amp:24,waves:2},
{id:'short-ice',name:'冰坡小跨步',family:'short',theme:1,gravity:1,ops:[['rock',1800]],ice:true,amp:18,waves:2},
{id:'short-bay',name:'海风轻跃',family:'short',theme:3,gravity:1,ops:[['rock',1600]],amp:28,waves:3},
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
 const intro=['short-snow','launch-valley','cave-turn','relay-bridge','fork-ice','breath','launch-bowl','cave-step','cloud-return','relay-floe','breath','fork-valley'];
 const families=['short','launch','fork','relay','ceiling','cloud'];let recent=[],previousTheme=cycle%4,themeAge=0;
 for(let i=0;i<24;i++){
  let id;if(cycle===0&&!options.skipTutorial&&i<intro.length)id=intro[i];else if(i%5===4)id='breath';else{let familyPool=({0:['short','launch','fork'],1:['relay','fork','launch'],2:['ceiling','fork','cloud'],3:['cloud','launch','fork']}[previousTheme]).filter(f=>!recent.slice(-2).includes(f)),fam=familyPool[Math.floor(rand()*familyPool.length)],pool=MODULES.filter(m=>m.family===fam);if(cycle>0&&segments.at(-1)?.family==='cloud'&&i%3===0)pool=MODULES.filter(m=>m.id==='cave-turn'||m.id==='cave-step');if(options.condition==='relay'&&i%4===2)pool=MODULES.filter(m=>m.family==='relay');if(options.condition==='cloud'&&i%4===2)pool=MODULES.filter(m=>m.family==='cloud');if(options.condition==='trick'&&i%4===2)pool=MODULES.filter(m=>m.family==='launch');id=pool[Math.floor(rand()*pool.length)].id;}
  if(i===0&&cycle>0&&options.entryContext?.mount==='rabbit')id='launch-bowl';if(i===0&&cycle>0&&options.entryContext?.mount==='fox')id='fork-valley';const def=MODULES.find(m=>m.id===id);recent.push(def.family);if(themeAge>=4&&!def.rest){previousTheme=(previousTheme+1)%4;themeAge=0;}let theme=cycle===0&&i<4?0:previousTheme;themeAge++;let stage=Math.min(4,cycle),length=def.rest?1250:2800+Math.floor(rand()*350);
  let s={...def,index:i,theme,start:cursor,end:cursor+length,y,slope:def.slope||.075+rand()*.09,amp:def.amp+(cycle?rand()*15:0),waves:def.waves||1,items:[],obstacles:[],platforms:[],entrySpeed:[C.base,C.base*1.75],entryContext:options.entryContext||null,jumpWindows:[],landingZones:[],route:!!def.platform,pressure:((cycle*24+i)%6===2||(cycle*24+i)%6===3||(cycle*24+i)%6===4),restoreSpace:600,risk:def.family==='cloud'?2:1,stage};cursor+=length;segments.push(s);y=groundOn(s,s.end);ids.push(id);
  let ops=(def.ops||[]).map(o=>[...o]);if(stage>0&&def.family==='launch'&&i%2===0){s.echo=length-560;s.echoAmp=45;ops.push(['rock',length-180]);}if(stage>0&&def.family==='relay'&&i%2){ops.push(['arch',length-300]);}if(stage>1&&def.family==='fork'&&i%2===0){s.gravity=1;s.echo=length-650;s.echoAmp=38;}if(false&&stage>=1&&!def.rest&&['short','launch','fork'].includes(def.family)&&i%3===0)ops.push(['rock',length-500]);if(false&&stage>=2&&!def.rest&&['relay','cloud'].includes(def.family)&&i%3===1)ops.push(['rock',length-430]);if(false&&stage>=3&&!def.rest&&['fork','ceiling'].includes(def.family)&&ops.length<2&&i%4===0)ops.push(['snowball',length-460]);
  if(def.family==='short'&&ops.length<2)ops.push(['rock',650]);if(def.family==='fork'&&!ops.some(o=>o[1]<1200))ops.push(['rock',650]);if(def.family==='ceiling'){s.ramp=1950;s.power=1.55;s.shoulder=65;if(ops.some(o=>o[0]==='log'))ops=ops.map(o=>o[0]==='log'?['log',2560]:o);}
  for(let[kind,baseOff]of ops){let off=Math.min(length-230,baseOff)+(cycle||i>11?(rand()-.5)*120:0),o={id:`${cycle}:${i}-${kind}-${off}`,kind,x:s.start+off,w:kind==='log'?110:kind==='arch'?290:70,h:kind==='log'?75:kind==='arch'?345:kind==='icewall'?75:kind==='snowball'?60:33,clearance:kind==='arch'?(def.clearance||230):0,phase:rand()*6.28};s.obstacles.push(o);obstacles.push(o);s.jumpWindows.push({earliest:o.x-420,latest:o.x-125,kind});}
  if(def.family==='launch'){s.power=def.large?2.3:def.id==='launch-valley'?1.7:1.6;s.ramp=1000;s.shoulder=def.large||def.id==='launch-valley'?100:65;if(def.id==='launch-valley')s.large=true;s.platform=true;s.offset=def.large?170:125;}if(s.platform){let q={id:`platform-${cycle}-${i}`,start:s.start+(def.family==='launch'?(def.large?2130:1840):def.platformStart||1780),end:s.start+(length-100),offset:s.offset||120,cloud:!!def.cloud,sink:!!def.sink,mount:null,theme,edge:70};s.platforms.push(q);platforms.push(q);s.landingZones.push({start:q.start,end:q.end,yOffset:q.offset});}
  if(def.id==='launch-valley'){let near=s.platforms[0];near.end=s.start+2230;near.offset=105;let far={...near,id:near.id+'-far',start:s.start+2320,end:s.end-50,offset:155};s.platforms.push(far);platforms.push(far);}
  let add=it=>{items.push(it);s.items.push(it);};for(let j=0;j<7;j++){let x=s.end-1050+j*130;add({id:`fish-g-${cycle}-${i}-${j}`,kind:'fish',x,y:groundOn(s,x)-45});}
  if(def.id==='launch-valley'){let q=s.platforms[1];for(let j=0;j<4;j++)add({id:`fish-far-${cycle}-${i}-${j}`,kind:'fish',x:q.start+70+j*110,platformId:q.id,y:groundOn(s,q.start+70+j*110)-q.offset-45});}
  if(def.groundMount)add({id:`partner-${cycle}-${i}`,kind:'partner',mount:def.groundMount,x:s.start+500,y:groundOn(s,s.start+500)-45});
  if(def.relayMount){let x=s.start+2350;add({id:`relay-${cycle}-${i}`,kind:'partner',mount:def.relayMount,relay:true,routeId:s.platforms[0].id,platformId:s.platforms[0].id,x,y:groundOn(s,x)-(s.offset||120)-45});}
  if(def.wing){let x=s.start+480;add({id:`wind-${cycle}-${i}`,kind:'wind',x,y:groundOn(s,x)-45});}
  if(i%8===7){let x=s.start+700;add({id:`magnet-${cycle}-${i}`,kind:'magnet',x,y:groundOn(s,x)-45});}
  if(i===13||(cycle>0&&i===2)){let x=s.start+700;add({id:`feather-${cycle}-${i}`,kind:'feather',x,y:groundOn(s,x)-50});}
  // Authored variants change entrance order, platform support, exit ramp and partner choice.
  if(def.family==='fork'&&stage>0&&i%2){s.platforms[0].start-=180;s.platforms[0].end-=320;s.echo=length-420;s.echoAmp=65;}
  if(def.family==='cloud'){s.echo=length-260;s.echoAmp=70;}
  if(def.family==='relay'){s.echo=length-380;s.echoAmp=45;}
  s.opportunityId=`line-${cycle}-${i}`;s.requiredActions=def.family==='short'||def.rest?1:2;
  let target=s.obstacles.find(o=>!['arch'].includes(o.kind)),takeoff=s.start+(s.ramp||0);if(target)takeoff=target.x-300;
  if(s.ramp||target){let base=C.base*(1+.025*stage),v=C.jump*(s.ramp?s.power||1.3:1),y0=groundOn(s,takeoff);for(let j=0;j<7;j++){let t=.1+j*.135,x=takeoff+base*t;add({id:`fish-a-${cycle}-${i}-${j}`,kind:'fish',x,y:y0-v*t+C.gravity*(s.gravity||1)*t*t/2-45});}}
  if(s.platforms.length)for(let j=0;j<7;j++){let q=s.platforms[0],x=q.start+60+j*(q.end-q.start-120)/6;add({id:`fish-high-${cycle}-${i}-${j}`,kind:'fish',x,platformId:q.id,y:groundOn(s,x)-q.offset-45});}
 }
 return {seed,cycle,options,segments,obstacles,items,platforms,fallbacks:[],finish:cursor,lastEnd:cursor,templateIds:ids};
}
export function segmentAt(l,x){let lo=0,hi=l.segments.length-1;while(lo<hi){let m=(lo+hi)>>1;if(x>=l.segments[m].end)lo=m+1;else hi=m;}return l.segments[lo];}
export function groundOn(s,x){let u=clamp((x-s.start)/(s.end-s.start),0,1);let y=s.y+s.slope*(x-s.start)+s.amp*Math.sin(u*Math.PI*(s.waves||1))**2;for(let [center,height] of [[s.ramp,s.shoulder||(s.ramp?50:0)],[s.echo,s.echoAmp||0]])if(center){let d=(x-s.start-center)/230;if(Math.abs(d)<1)y-=height*Math.cos(d*Math.PI/2)**2;}return y;}
export function ground(l,x){return groundOn(segmentAt(l,x),x);}export function tangent(l,x){return Math.atan((ground(l,x+1)-ground(l,x-1))/2);}
export function gapAt(l,x){let s=segmentAt(l,x);return s.gap&&x>s.start+s.gap[0]&&x<s.start+s.gap[1];}
export function platformY(l,p,x,time=0,touch){let sink=p.sink?Math.min(95,Math.max(0,time-(touch??time))**1.3*32):0;return ground(l,x)-p.offset+sink;}
export function platformSlope(l,p,x,time=0,touch){return Math.atan((platformY(l,p,x+1,time,touch)-platformY(l,p,x-1,time,touch))/2);}
export function itemY(l,it,time=0,touches=new Map()){let q=it.platformId&&l.platforms.find(p=>p.id===it.platformId);return q?platformY(l,q,it.x,time,touches.get(q.id))-45:it.y;}
export function rampPower(s,x){let power=1;for(let [center,peak] of [[s.ramp,s.power||1.3],[s.echo,1.45]])if(center){let d=Math.abs(x-s.start-center)/220;power=Math.max(power,1+(peak-1)*Math.max(0,1-d*d));}return power;}
export function surface(l,x,oldY,newY,time=0,touches=null){let choices=[];if(!gapAt(l,x))choices.push({y:ground(l,x),slope:tangent(l,x),platform:null});for(let p of l.platforms){if(x>=p.start&&x<=p.end){let y=platformY(l,p,x,time,touches?.get(p.id));if(oldY<=y+6&&newY>=y-3)choices.push({y,slope:platformSlope(l,p,x,time,touches?.get(p.id)),platform:p});}}return choices.sort((a,b)=>a.y-b.y).find(q=>oldY<=q.y+6&&newY>=q.y-3)||null;}
export function obstacleX(o,time){return o.x+(o.kind==='snowball'?Math.sin(time*1.4+o.phase)*125:0);}
