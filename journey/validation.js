import {input} from './physics.js?v=20261003-one1';
import {segmentAt} from './levels.js?v=20261003-one1';
export function planInput(g,{routes=false,tricks=false,offset=0}={}){let p=g.p,s=segmentAt(g.level,p.x);if(g.state!=='playing')return;if(g.input.jump){if(!tricks||p.grounded||p.fall||p.rotation<=-Math.PI*2+.14||p.airTime>.9&&!s.ramp)input(g,'jump',false);return;}
 if(p.grounded&&p.fall<.3){let o=s.obstacles.find(o=>o.kind!=='arch'&&!g.hit.has(o.id)&&o.x>p.x),goal=o?o.x-p.speed*(o.kind==='rock'?.43:.47)+offset:Infinity;if(s.gap)goal=Math.min(goal,s.start+s.gap[0]-p.speed*.40+offset);if(routes&&s.platforms.length&&!s.ramp)goal=Math.min(goal,s.start+1130-p.speed*.25+offset);if(p.x>=goal&&p.x<goal+p.speed*.10)input(g,'jump',true);}
 else if(tricks&&s.ramp&&!p.trick&&p.airTime<.25)input(g,'jump',true);
}
export function validateAndRepair(level){return level;}
