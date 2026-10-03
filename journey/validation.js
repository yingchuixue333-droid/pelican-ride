import {input} from './physics.js?v=20261003-v4e';
import {segmentAt,tangent,ground} from './levels.js?v=20261003-v4e';
import {wrap,CONFIG as C} from './config.js?v=20261003-v4e';
// Test controller sees the authored terrain; it never changes player physics or pose.
export function planInput(g,{routes=true,tricks=true,offset=0}={}){let p=g.p,s=segmentAt(g.level,p.x);if(g.state!=='playing')return;if(g.input.jump){if(p.grounded||p.fall||!tricks){input(g,'jump',false);return;}let turns=s.large&&p.vy<-280?2:1;if(g.botTarget===undefined)g.botTarget=turns*Math.PI*2+.035;let slope=tangent(g.level,p.x+p.speed*Math.max(0,p.vy/1000)),target=g.botTarget+Math.max(0,p.launchAngle-slope);if(Math.abs(p.rotation)>=target)input(g,'jump',false);return;}
if(p.grounded&&p.fall<.3){let o=s.obstacles.find(o=>o.kind!=='arch'&&!g.hit.has(o.id)&&o.x>p.x),goal=o?o.x-p.speed*(o.kind==='rock'?.37:.48)+offset:Infinity;if(s.gap)goal=Math.min(goal,s.start+s.gap[0]-p.speed*.36+offset);if(routes&&s.ramp)goal=Math.min(goal,s.start+s.ramp-65);if(p.x>=goal&&p.x<goal+p.speed*.12){g.botTarget=undefined;input(g,'jump',true);}}
else if(routes&&s.platforms.length&&p.airFlap&&p.airTime>.5&&p.vy>-100&&p.x<s.platforms[0].start-100&&!g.input.jump){let q=s.platforms[0],height=ground(g.level,p.x)-p.y;if(height<q.offset+60){input(g,'jump',true);input(g,'jump',false);}}
}
export function validateAndRepair(level){return level;}
