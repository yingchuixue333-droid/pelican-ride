// Planner used only for generation checks and reproducible QA; never controls formal play.
import {CONFIG as C} from './config.js?v=20261003-r8';
import {createGame,tick,input} from './physics.js?v=20261003-r8';
import {ground,segmentAt,obstacleX} from './levels.js?v=20261003-r8';
export function planInput(g,options={}){const p=g.p,s=segmentAt(g.level,p.x);if(p.fall){if(g.input.jump)input(g,'jump',false);return;}
 if(!p.grounded){const hold=p.planHold??.25;if(p.airTime>=hold&&g.input.jump)input(g,'jump',false);if(options.tricks&&s.ramp&&!p.rescued){let target=(s.large?2:1)*Math.PI*2;if(Math.abs(p.rotation)<target&&p.airTime>.08)input(g,'trick',true);else input(g,'trick',false);}return;}
 if(g.input.trick)input(g,'trick',false);const o=s.obstacles.find(o=>!g.hit.has(o.id)&&o.kind!=='arch'&&obstacleX(o,g.time)>p.x-15);let target=o?obstacleX(o,g.time):Infinity,hold=o?.kind==='rock'?.09:.25,distance=p.speed*(o?.kind==='rock'?.35:.46);
 if(s.gap&&p.x<s.start+s.gap[0]){let gx=s.start+s.gap[0];if(gx<target){target=gx;hold=.25;distance=p.speed*.35;}}
 if(options.routes&&s.platforms.length&&!g.rewards.has(s.platforms[0].id)&&s.platforms[0].start>p.x){let x=s.platforms[0].start;if(x<target){target=x;hold=.25;distance=p.speed*.32;}}
 if(target-p.x<=distance&&target>p.x-15){p.planHold=hold;input(g,'jump',true);}else if(g.input.jump)input(g,'jump',false);
}
export function validateSegment(level,s,{factor=1,mount=null,routes=false,tricks=false}={}){const g=createGame(level);g.time=0;g.p.x=s.start;g.p.y=ground(level,s.start);g.p.speed=C.base*(1+s.theme*.04)*factor;g.p.boostTime=factor>1?30:0;g.p.boostFactor=factor;g.p.lead=1400;if(mount)g.p.mount={kind:mount,time:20,shield:false};let lastLanded=g.time,minWindow=Infinity,landed=[],air=0;
 for(let i=0;i<C.step**-1*18&&g.p.x<s.end&&g.state==='playing';i++){let was=g.p.grounded;planInput(g,{routes,tricks});tick(g);if(!was&&g.p.grounded){landed.push({time:g.time,x:g.p.x});lastLanded=g.time;}if(was&&!g.p.grounded){minWindow=Math.min(minWindow,g.time-lastLanded);}air=Math.max(air,g.p.airTime);}
 let result={seed:level.seed,module:s.id,index:s.index,factor,mount,routes,tricks,passed:g.p.x>=s.end&&g.p.collisions===0&&g.state!=='dead',collisions:g.p.collisions,reason:g.reason,exitSpeed:g.p.speed,airTime:air,minWindow:Number.isFinite(minWindow)?minWindow:null,rewards:[...g.rewards],flips:g.p.flips,trace:g.trace.slice(),hits:g.stats.hits||[],landed};if(routes&&s.platforms.length&&!g.rewards.has(s.platforms[0].id))result.passed=false;return result;
}
export function validateAndRepair(level){for(let s of level.segments){let r=validateSegment(level,s);if(!r.passed){level.fallbacks.push({seed:level.seed,index:s.index,module:s.id,hits:r.hits,reason:r.reason||'合法基准输入未通过'});for(let o of s.obstacles)level.obstacles.splice(level.obstacles.indexOf(o),1);s.obstacles=[];s.gap=null;s.ramp=null;s.id='safe-connector';s.name='安全雪道';s.rest=true;}s.validated=true;}for(let p of level.platforms)delete p.touchAt;return level;}
