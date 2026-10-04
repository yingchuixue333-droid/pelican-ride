import {input} from './physics.js?v=20261004-v62c';
import {segmentAt,ground,tangent,obstacleX,rampPower} from './levels.js?v=20261004-v62c';
import {CONFIG as C,viewMetrics} from './config.js?v=20261004-v62c';
// Only observed forward space is exposed. This controller sends inputs, never changes pose/rewards.
// It remains synthetic: reading collision surfaces is more precise than a human looking at pixels.
export function planInput(g,{routes=true,tricks=true,offset=0,latency=0}={}){
 let p=g.p,s=segmentAt(g.level,p.x),look=viewMetrics(p.speed).lookahead;
 if(g.state!=='playing')return;
 if(g.botWait>g.time)return;
 let canTurn=['launch','fork','relay','cloud'].includes(s.family)&&(p.flightStart?.launchPower>1.18||p.wing>0);
 if(g.input.jump){if(routes&&canTurn&&p.airFlap&&p.airTime>.35&&p.airTime<.65&&s.platforms.length){input(g,'jump',false);input(g,'jump',true);g.botWait=g.time+.02;return;}if(p.grounded||p.fall||!tricks||!canTurn){input(g,'jump',false);return;}let target=Math.PI*2+.01+Math.max(0,p.launchAngle-tangent(g.level,Math.min(p.x+look,p.x+p.speed*.7)));if(Math.abs(p.rotation)>=target){input(g,'jump',false);g.botWait=g.time+.04;}return;}
 if(p.grounded&&p.fall<.3){let o=g.level.obstacles.find(o=>o.kind!=='arch'&&!g.hit.has(o.id)&&obstacleX(o,g.time)>p.x&&o.x-p.x<look),goal=o?obstacleX(o,g.time)-p.speed*(o.kind==='rock'?.33:.44)+offset:Infinity;if(s.gap&&s.start+s.gap[0]-p.x<look)goal=Math.min(goal,s.start+s.gap[0]-p.speed*.42+offset);if(routes&&s.ramp&&s.start+s.ramp-p.x<look)goal=Math.min(goal,s.start+s.ramp-30);if(p.x>=goal&&p.x<goal+p.speed*.22){if(latency&&!g.botDelay){g.botDelay={at:g.time+latency,goal};return;}if(g.botDelay&&g.time<g.botDelay.at)return;g.botDelay=null;input(g,'jump',true);}}
 else if(routes&&p.airFlap&&p.airTime>.35&&p.vy<200&&!g.input.jump&&canTurn){let q=s.platforms.find(q=>q.start-p.x<look&&q.end>p.x);if(q&&ground(g.level,p.x)-p.y<q.offset+100&&p.x<q.start-100){input(g,'jump',true);input(g,'jump',false);}}
}
export function validateAndRepair(level){return level;}
