import {CONFIG as C,clamp} from './config.js?v=20261003-r10';
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
 const bags=new Map();bags.set(0,[MODULES[2]]);let cursor=0;
 function draw(theme,previous){let bag=bags.get(theme);if(!bag?.length){bag=MODULES.filter(m=>m.theme===theme).slice();for(let j=bag.length-1;j>0;j--){let k=Math.floor(random()*(j+1));[bag[j],bag[k]]=[bag[k],bag[j]];}if(bag.at(-1)?.id===previous&&bag.length>1)[bag[0],bag[bag.length-1]]=[bag.at(-1),bag[0]];bags.set(theme,bag);}return bag.pop();}
 for(let i=0;i<C.modules;i++){const theme=Math.min(3,Math.floor(i/(C.modules/4)));let def=i<4?[MODULES[0],MODULES[1],MODULES[3],MODULES[4]][i]:i%3===2?MODULES.at(-1):draw(theme,segments.at(-1)?.id);const length=def.rest?C.restLength:def.corridor?5000:C.moduleLength,slope=.055+random()*.10,amp=def.rest?0:def.large?95:def.ramp?50:15+random()*20;const s={...def,index:i,theme,start:cursor,end:cursor+length,y,slope,amp,items:[],obstacles:[],platforms:[],entrySpeed:[C.base*(1+.04*theme),C.base*(1+.04*theme)*1.9],optional:def.route?'高路奖励':'',validated:false};cursor+=length;segments.push(s);y=groundOn(s,s.end);
 for(const [kind,offset] of def.ops){let o={id:`${i}-${kind}-${offset}`,kind,x:s.start+offset,w:kind==='log'?115:kind==='arch'?290:kind==='snowball'?90:65,h:kind==='log'?92:kind==='arch'?265:kind==='icewall'?90:kind==='snowball'?75:44,clearance:kind==='arch'?225:0,phase:random()*6.28};obstacles.push(o);s.obstacles.push(o);}
 if(def.platform){let a=s.start+930,b=s.start+2060,p={id:`platform-${i}`,start:a,end:b,offset:def.cloud?220:130,cloud:!!def.cloud,sink:!!def.sink,mount:def.mount||null};platforms.push(p);s.platforms.push(p);}
 // Ground pickups are deliberately optional. Arc strings are baked below by the shared controller.
 for(let j=0;j<5;j++){let x=s.end-620+j*85,it={id:`fish-g-${i}-${j}`,kind:'fish',x,y:groundOn(s,x)-45};items.push(it);s.items.push(it);}
 if(def.wing){let it={id:`wing-${i}`,kind:'wind',x:s.start+710,y:groundOn(s,s.start+710)-55};items.push(it);s.items.push(it);}
 if(def.route&&!def.mount){let it={id:`resource-${i}`,kind:i%2?'magnet':'bolt',x:s.start+1640,y:groundOn(s,s.start+1640)-(def.platform?148:230)};items.push(it);s.items.push(it);}
 }
 const level={seed,segments,obstacles,items,platforms,fallbacks,finish:cursor};return level;
}
export function segmentAt(level,x){let lo=0,hi=level.segments.length-1;while(lo<hi){let mid=(lo+hi)>>1;if(x>=level.segments[mid].end)lo=mid+1;else hi=mid;}return level.segments[lo];}
export function groundOn(s,x){let u=clamp((x-s.start)/(s.end-s.start),0,1);return s.y+s.slope*(x-s.start)+s.amp*Math.sin(u*Math.PI*2)**2;}
export function ground(level,x){return groundOn(segmentAt(level,x),x);}
export function tangent(level,x){return Math.atan((ground(level,x+1)-ground(level,x-1))/2);}
export function gapAt(level,x){let s=segmentAt(level,x);return s.gap&&x>s.start+s.gap[0]&&x<s.start+s.gap[1];}
export function platformY(level,p,x,time=0,touch=undefined){return ground(level,x)-p.offset+(p.sink?Math.min(22,Math.max(0,time-(touch??time))*12):0);}
export function surface(level,x,oldY,newY,time=0,touches=null){let candidates=[];if(!gapAt(level,x))candidates.push({y:ground(level,x),platform:null});for(let p of level.platforms){if(x>=p.start&&x<=p.end){let y=platformY(level,p,x,time,touches?.get(p.id));if(oldY<=y+5&&newY>=y-3)candidates.push({y,platform:p});}}return candidates.sort((a,b)=>a.y-b.y).find(q=>oldY<=q.y+5&&newY>=q.y-3)||null;}
export function obstacleX(o,time){return o.x+(o.kind==='snowball'?Math.sin(time*.8+o.phase)*45:0);}
