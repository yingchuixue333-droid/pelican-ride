import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createLevel,ground} from '../../game/levels.js';
import {createGame,tick,input,bakeArcs,boost} from '../../game/physics.js';
import {CONFIG as C} from '../../game/config.js';
import {planInput} from '../../game/validation.js';
let checked=0,failures=[],examples=[];
for(let seed=1;seed<=100;seed++){
 let l=createLevel(seed);bakeArcs(l);
 for(let s of l.segments){
  for(let it of s.items.filter(i=>i.kind!=='fish')){
   let good=null;
   for(let attempt=0;attempt<13&&!good;attempt++){
    let g=createGame(l);g.p.x=s.start+600;g.p.y=ground(l,g.p.x);g.p.speed=C.base*(1+s.theme*.04);g.time=10;
    let began=false,released=false,launchTime=0;
    for(let step=0;step<1600&&g.state==='playing'&&g.p.x<s.end;step++){
     if(attempt===0)planInput(g,{routes:true});
     else {
      let start=s.ramp?s.arcs.ski.start:it.x-C.base*(1+s.theme*.04)*(.22+(attempt-1)*.07);
      if(!began&&g.p.x>=start){input(g,'jump',true);began=true;launchTime=g.time;}
      if(began&&!released&&g.time-launchTime>.25){input(g,'jump',false);released=true;}
     }
     tick(g);
    }
    if(g.taken.has(it.id)&&g.p.collisions===0&&g.state!=='dead')good={seed,module:s.id,item:it.id,kind:it.kind,attempt,inputs:g.trace.slice()};
   }
   checked++;if(!good)failures.push({seed,module:s.id,item:it.id,kind:it.kind});else if(seed===1)examples.push(good);
  }
 }
 // Near maximum ordinary speed: all five fixed ground fish, including the final fish.
 let s=l.segments.find(s=>s.rest),g=createGame(l);g.p.x=s.start;g.p.y=ground(l,g.p.x);g.p.speed=C.base*1.9;boost(g,1.9,20);
 while(g.state==='playing'&&g.p.x<s.end)tick(g);
 checked++;let missing=s.items.filter(it=>it.kind==='fish'&&!g.taken.has(it.id));if(missing.length)failures.push({seed,case:'high-speed-ground-string',missing:missing.map(i=>i.id)});
}
fs.writeFileSync('qa/redesign/specials.json',JSON.stringify({checked,failures,examples},null,2));console.log({checked,failures:failures.length,samples:failures.slice(0,8)});assert.equal(failures.length,0,'every special pickup has a legal input example');
