import {CONFIG as C,clamp} from './config.js?v=20261003-r3';
export const MODULES=[
 {id:'pebbles',name:'短跳碎石',theme:0,ops:[['rock',1150]],jump:'low'},
 {id:'timber',name:'越过倒木',theme:0,ops:[['log',1250]],jump:'high'},
 {id:'rhythm',name:'双跳雪丘',theme:0,ops:[['rock',1000],['rock',1980]],jump:'low'},
 {id:'launch',name:'单圈跳台',theme:0,ops:[],ramp:1050,route:true},
 {id:'shelf',name:'雪谷高台',theme:0,ops:[['rock',1400]],platform:true,route:true},
 {id:'forest',name:'林间接台',theme:1,ops:[['log',1100]],platform:true,route:true},
 {id:'ice',name:'冰河滑道',theme:1,ops:[],ice:true,route:true},
 {id:'floes',name:'缓沉浮冰',theme:1,ops:[['rock',1750]],platform:true,sink:true,route:true},
 {id:'bridge',name:'断桥飞跃',theme:1,ops:[],gap:[1300,1470],jump:'high'},
 {id:'fox',name:'狐狸支路',theme:1,ops:[['rock',1300]],platform:true,route:true,mount:'fox'},
 {id:'tunnel',name:'贴地穿洞',theme:2,ops:[['arch',1050],['rock',1900]],jump:'late'},
 {id:'snowball',name:'滚雪球',theme:2,ops:[['snowball',1300]],jump:'high'},
 {id:'cloud',name:'风翼云径',theme:2,ops:[],platform:true,cloud:true,route:true,wing:true},
 {id:'rabbit',name:'雪兔跳台',theme:2,ops:[],platform:true,route:true,mount:'rabbit'},
 {id:'cave',name:'洞口落跳',theme:2,ops:[['arch',950],['log',1850]],jump:'late'},
 {id:'double',name:'双圈大跳台',theme:3,ops:[],ramp:1080,large:true,route:true},
 {id:'ridge',name:'山脊连跳',theme:3,ops:[['log',1000],['rock',2150]],jump:'high'},
 {id:'bear',name:'雪团兽冰门',theme:3,ops:[['icewall',1400]],platform:true,route:true,mount:'bear'},
 {id:'corridor',name:'开阔冲刺',theme:3,ops:[],corridor:true,route:true},
 {id:'ledge',name:'窄桥回落',theme:3,ops:[],gap:[1550,1740],platform:true,jump:'high'},
 {id:'breath',name:'雪灯驿站',theme:-1,ops:[],rest:true}
];
export function rng(seed){let x=seed>>>0;return()=>{x=(Math.imul(x,1664525)+1013904223)>>>0;return x/4294967296;};}
export function createLevel(seed=1){const random=rng(seed),segments=[],obstacles=[],items=[],platforms=[],fallbacks=[];let y=0;
 for(let i=0;i<C.modules;i++){const theme=Math.min(3,Math.floor(i/9));let choices=MODULES.filter(m=>m.theme===theme);let def=i===0?MODULES[0]:i===1?MODULES[1]:i%3===2?MODULES.at(-1):choices[Math.floor(random()*choices.length)];if(i>2&&def.id===segments.at(-1)?.id)def=choices[(choices.indexOf(def)+1)%choices.length];const slope=.055+random()*.10,amp=def.large?95:def.ramp?50:15+random()*20;const s={...def,index:i,theme,start:i*C.moduleLength,end:(i+1)*C.moduleLength,y,slope,amp,items:[],obstacles:[],platforms:[],entrySpeed:[C.base*(1+.04*theme),C.base*(1+.04*theme)*1.9],optional:def.route?'高路奖励':'',validated:false};segments.push(s);y=groundOn(s,s.end);
 for(const [kind,offset] of def.ops){let o={id:`${i}-${kind}-${offset}`,kind,x:s.start+offset,w:kind==='log'?115:kind==='arch'?290:kind==='snowball'?90:65,h:kind==='log'?92:kind==='arch'?145:kind==='icewall'?90:kind==='snowball'?75:44,phase:random()*6.28};obstacles.push(o);s.obstacles.push(o);}
 if(def.platform){let a=s.start+930,b=s.start+2060,p={id:`platform-${i}`,start:a,end:b,offset:def.cloud?220:130,cloud:!!def.cloud,sink:!!def.sink,mount:def.mount||null};platforms.push(p);s.platforms.push(p);}
 // Ground pickups are deliberately optional. Arc strings are baked below by the shared controller.
 for(let j=0;j<5;j++){let x=s.start+2350+j*65,it={id:`fish-g-${i}-${j}`,kind:'fish',x,y:groundOn(s,x)-45};items.push(it);s.items.push(it);}
 if(def.wing){let it={id:`wing-${i}`,kind:'wind',x:s.start+710,y:groundOn(s,s.start+710)-55};items.push(it);s.items.push(it);}
 if(def.route&&!def.mount){let it={id:`resource-${i}`,kind:i%2?'magnet':'bolt',x:s.start+1640,y:groundOn(s,s.start+1640)-(def.platform?148:230)};items.push(it);s.items.push(it);}
 }
 const level={seed,segments,obstacles,items,platforms,fallbacks,finish:C.finish};return level;
}
export function segmentAt(level,x){return level.segments[clamp(Math.floor(x/C.moduleLength),0,level.segments.length-1)];}
export function groundOn(s,x){let u=clamp((x-s.start)/C.moduleLength,0,1);return s.y+s.slope*(x-s.start)+s.amp*Math.sin(u*Math.PI*2)**2;}
export function ground(level,x){return groundOn(segmentAt(level,x),x);}
export function tangent(level,x){return Math.atan((ground(level,x+1)-ground(level,x-1))/2);}
export function gapAt(level,x){let s=segmentAt(level,x);return s.gap&&x>s.start+s.gap[0]&&x<s.start+s.gap[1];}
export function platformY(level,p,x,time=0){return ground(level,x)-p.offset+(p.sink?Math.min(22,Math.max(0,time-(p.touchAt??time))*12):0);}
export function surface(level,x,oldY,newY,time=0){let candidates=[];if(!gapAt(level,x))candidates.push({y:ground(level,x),platform:null});for(let p of level.platforms){if(x>=p.start&&x<=p.end){let y=platformY(level,p,x,time);if(oldY<=y+5&&newY>=y-3)candidates.push({y,platform:p});}}return candidates.sort((a,b)=>a.y-b.y).find(q=>oldY<=q.y+5&&newY>=q.y-3)||null;}
export function obstacleX(o,time){return o.x+(o.kind==='snowball'?Math.sin(time*.8+o.phase)*45:0);}
