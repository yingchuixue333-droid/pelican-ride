import fs from 'node:fs';
import {createGame,tick,input} from '../journey/physics.js';
import {createLevel,ground,tangent} from '../journey/levels.js';
import {prepareContinuous,maintainWorld} from '../journey/endless.js';
import {planInput} from '../journey/validation.js';
import {prepareLesson} from '../journey/practice.js';
import {VERSION} from '../journey/config.js';
const tag=process.argv[2]||'after',seconds=+(process.argv[3]||45);
function collect(g,events,lines){for(const e of g.events){if(e.type==='lineComplete')lines.push(structuredClone(e));if(['land','route','hit','action','boost','skillChain'].includes(e.type))events.push(structuredClone(e));}g.events.length=0;}
function summary(g,events,lines){const staged=lines.reduce((v,e)=>v+(e.staged||0),0);return {time:g.time,x:g.p.x,score:g.p.score,parts:{...g.p.parts},sources:g.stats.scoreSources||null,lineAward:lines.reduce((v,e)=>v+e.awarded,0),stagedFlipAndChain:staged,lineBase:lines.reduce((v,e)=>v+(e.base??e.awarded-(e.staged||0)),0),standalone:g.p.parts.technique-lines.reduce((v,e)=>v+e.awarded,0),lines:lines.length,routes:g.stats.routeCount,jumps:g.stats.jumps,flaps:g.stats.flaps,flips:g.p.flips,collisions:g.p.collisions,bestCombo:g.p.bestCombo,boostSeconds:g.stats.boostSeconds,validFullFlips:events.filter(e=>e.type==='land'&&e.awarded&&e.turns>=1).length,repeatRampActions:events.filter(e=>e.type==='action'&&e.key.startsWith('ramp-')).length,reason:g.reason};}
const runs=[];
// Same seed/course/45 seconds, then independently same seed/course/5000 metres.
for(const exposure of seconds===45?['seconds','distance']:['seconds'])for(let seed=1;seed<=4;seed++)for(const strategy of ['tap-1.15','ordinary-route','technique']){
 const g=createGame(createLevel(seed,0,{skipTutorial:false}),'challenge');prepareContinuous(g);const events=[],lines=[];
 for(let i=0;i<120*180&&g.state==='playing';i++){
  if(strategy==='tap-1.15')input(g,'jump',g.time%1.15<.04);
  else planInput(g,{routes:true,tricks:strategy==='technique'});
  tick(g);maintainWorld(g);collect(g,events,lines);
  if(exposure==='seconds'?g.time>=seconds:g.p.x>=50000)break;
 }
 runs.push({seed,strategy,exposure,...summary(g,events,lines),lineDetails:lines});
}
// Same authored approach for each local choice. Setup positions the entry only;
// no trajectory, orientation, score or resource correction once the attempt starts.
const local=[];
for(const module of ['launch-valley','launch-bowl','fork-ice','relay-bridge','cave-turn','cloud-return'])for(const strategy of ['tap-1.15','ordinary','one-circle','flap']){
 const level=createLevel(1),s=level.segments.find(s=>s.id===module);const g=createGame(level,'practice');
 const entry=s.start+(s.ramp?s.ramp-988:200);
 g.p.x=entry;g.p.y=ground(level,entry);g.p.angle=tangent(level,entry);g.p.speed=760;g.level.finish=s.end+60;g.level.lastEnd=g.level.finish+10000;
 const events=[],lines=[];g.time=0;
 for(let i=0;i<120*20&&g.state==='playing';i++){
  if(strategy==='tap-1.15')input(g,'jump',g.time%1.15<.04);
  else if(!s.ramp)planInput(g,{routes:strategy==='flap',tricks:false});
  else {
   if(!g.stats.jumps&&g.p.x>=s.start+s.ramp-30){input(g,'jump',true);if(strategy!=='one-circle')input(g,'jump',false);}
   if(strategy==='one-circle'&&g.input.jump&&Math.abs(g.p.rotation)>=2*Math.PI+.03)input(g,'jump',false);
   if(strategy==='flap'&&!g.p.grounded&&g.p.airTime>=.45&&!g.stats.flaps){input(g,'jump',true);input(g,'jump',false);}
  }
  tick(g);collect(g,events,lines);
 }
 local.push({module,strategy,entry,...summary(g,events,lines),lands:events.filter(e=>e.type==='land'),lineDetails:lines});
}
fs.writeFileSync(`qa/v621-${tag}-comparison.json`,JSON.stringify({version:VERSION,method:'Directed formal-engine input; 4 identical seeds; both equal-time and equal-distance. Local samples use same authored entry. No human data. Controllers are not optimal.',runs,local},null,2));
console.log(JSON.stringify({tag,version:VERSION,runs:runs.map(({lineDetails,...r})=>r),local:local.map(({lands,lineDetails,...r})=>r)},null,2));
