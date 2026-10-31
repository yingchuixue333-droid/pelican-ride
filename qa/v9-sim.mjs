import {createCourse} from '../journey/course.js';
import {createGame,tick,input} from '../journey/physics.js';
import {segmentAt,ground,obstacleX} from '../journey/levels.js';
export function drive(g,strategy='safe'){
 const p=g.p,s=segmentAt(g.level,p.x);
 if(strategy==='none')return;
 if(strategy==='hold'){input(g,'jump',true);return;}
 if(strategy==='spam'){input(g,'jump',Math.floor(g.time/.22)%2===0);return;}
 if(g.input.jump){if(strategy==='skill'&&p.trick&&Math.abs(p.rotation)>=Math.PI*2+.02||strategy!=='skill'||p.grounded)input(g,'jump',false);}
 if(!p.grounded){if(s.gap&&p.airFlap&&p.airTime>.32&&p.vy>0&&p.x<s.start+s.gap[1]){input(g,'jump',true);input(g,'jump',false);}return;}if(p.fall>0)return;
 let o=s.obstacles.concat(g.level.segments[s.index+1]?.obstacles||[]).find(o=>o.kind!=='arch'&&!g.hit.has(o.id)&&o.x>p.x&&o.x-p.x<p.speed*.37);
 let gap=s.gap&&s.start+s.gap[0]-p.x;
 let ramp=s.ramp&&s.start+s.ramp-p.x;
 if(o||gap>0&&gap<p.speed*.30||strategy==='skill'&&ramp>0&&ramp<35&&!g.history.some(e=>e.type==='jump'&&e.module===s.id)){
  input(g,'jump',true);
  if(strategy!=='skill'||o||gap>0&&gap<p.speed*.30)input(g,'jump',false);
 }
}
export function simulate(seed=9,strategy='safe',daily=false){const g=createGame(createCourse(seed,{daily}),daily?'daily':'challenge');for(let i=0;i<120*300&&g.state==='playing';i++){drive(g,strategy);tick(g);g.events.length=0;}return g;}
if(typeof process!=='undefined'&&process.argv[1]?.endsWith('v9-sim.mjs'))for(let k of ['none','hold','spam','safe','skill']){let g=simulate(9,k);console.log(k,{state:g.state,time:g.time,x:g.p.x,score:g.p.score,hit:g.p.collisions,flips:g.p.flips,rescue:g.stats.rescues,lead:g.p.lead,reason:g.reason});}
