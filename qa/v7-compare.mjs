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
  else planInput(g,{routes:true,tricks:strategy==='technique',continueLine:strategy==='technique'});
  tick(g);maintainWorld(g);collect(g,events,lines);
  if(exposure==='seconds'?g.time>=seconds:g.p.x>=50000)break;
 }
 runs.push({seed,strategy,exposure,...summary(g,events,lines),lineDetails:lines});
}
const local=[];
fs.writeFileSync(`qa/v7-${tag}-comparison.json`,JSON.stringify({version:VERSION,method:'Directed formal-engine input; 4 identical seeds; both equal-time and equal-distance. Local samples use same authored entry. No human data. Controllers are not optimal.',runs,local},null,2));
console.log(JSON.stringify({tag,version:VERSION,runs:runs.map(({lineDetails,...r})=>r),local:local.map(({lands,lineDetails,...r})=>r)},null,2));
