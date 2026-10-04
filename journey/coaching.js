import {CONFIG as C,wrap} from './config.js?v=20261004-v61a';
import {segmentAt,ground,surface,rampPower} from './levels.js?v=20261004-v61a';
const TAU=Math.PI*2;
// Diagnostics describe the real jump. No correction of rotation, input or landing tolerance.
export function diagnoseJump(d){
 if(d.reason){return d.reason.includes('拱')?'碰到低拱：过拱后再起跳':d.reason.includes('薄冰')?'碰到冰门：先选绕行出口':d.reason.includes('倒木')?'撞到倒木：在倒木前轻点起跳':d.reason.includes('雪球')?'碰到雪球：提前看它的移动方向':d.reason.includes('雪石')?'碰到雪石：在雪石前轻点起跳':'这次碰撞打断了动作';}
 if(!d.trick)return '普通跳落稳';
 if(d.error<=60){return d.turns>=1?`${d.turns===1?'一':d.turns}圈落稳`:d.completed>=.88?'接近一圈 · 落地接正':'普通跳落稳 · 这跳未满一圈';}
 if(d.power<=1.15&&d.airTime<1.15)return '这处先普通跳，下一大坡再翻';
 const n=Math.max(1,Math.round(d.completed)),target=n*TAU+d.launchAngle-d.slope,diff=(-d.rotation-target)*180/Math.PI;
 if(Math.abs(diff)>15&&Math.abs(diff)<170)return diff>0?'多转了：下次更早松手':d.flapUsed?'少转了：下次更早从坡面起跳':'少转了：下次留一次扑翼延长回落';
 return '落地姿态未接正 · 对照落坡方向收手';
}
// Forecast only a released trajectory, using the SAME surfaces, gravity and wind rules.
// Advice is suppressed when a nearby obstacle, missing support, or a changing surface is uncertain.
export function releaseAdvice(g){let p=g.p,s=segmentAt(g.level,p.x);if(p.grounded||p.fall||!p.trick||!g.input.jump||Math.abs(p.rotation)<TAU*.82||Math.abs(p.rotation)>TAU*1.2)return null;
 let x=p.x,y=p.y,vy=p.vy,dt=1/60;
 for(let t=dt;t<=1.5;t+=dt){let oldY=y,ss=segmentAt(g.level,x);x+=p.speed*dt;let gravity=p.wing>0||p.wingFlight?C.gravity*.64:C.gravity;if((p.wing>0||p.wingFlight)&&ss.updraft&&x>ss.start+1400&&x<ss.start+2300)vy-=850*dt;vy+=gravity*dt;y+=vy*dt;
 if(ss.obstacles.some(o=>Math.abs(o.x-x)<o.w/2+C.bodyRadius&&y<ground(g.level,o.x)+20&&y>ground(g.level,o.x)-o.h-130))return null;
 let hit=surface(g.level,x,oldY,y,g.time+t,g.platformTouches);if(hit&&vy>=0){let error=Math.abs(wrap(p.angle-hit.slope))*180/Math.PI;if(error<=20&&t>.10&&t<.9)return {text:'松手准备落地',landingX:x,relative:error,seconds:t};return null;}}
 return null;
}
export function practiceCue(g){let p=g.p,s=segmentAt(g.level,p.x),stage=g.lesson?.stage||0;if(g.mode!=='practice')return null;
 if(!p.grounded){if(stage>=1){let hint=releaseAdvice(g);if(hint)return hint.text;}return null;}
 if(s.ramp&&Math.abs(p.x-s.start-s.ramp)<220&&rampPower(s,p.x)>1.3)return stage===0?'标记处轻点：先普通起跳落地':stage===1?'这里可以试一圈 · 按住后收手':'想走远台，再点一次扑翼';
 return null;
}
export function pressureAction(g){let s=segmentAt(g.level,g.p.x),next=g.level.segments[s.index+1],target=g.pressureState==='warning'?next:s;if(!target)return '看清前方落坡，轻点避障';if(target.family==='ceiling')return '先走低路，过低拱后再起跳';if(target.ramp)return '前方大坡，借坡起跳接落坡';if(target.sink)return '离开裂开的冰台，接前方落坡';return '走低坡保速，在障碍前轻点';}
