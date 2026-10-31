import assert from 'node:assert/strict';
import {createRound,launch,tick,recall,predict,velocity,STEP} from '../fling/physics.js';
const routes=[[[89.917,86.832]],[[44.807,137.903]],[[47.898,147.414],[-103.715,115.187]]];
for(let level=0;level<3;level++){
 const g=createRound(level);
 for(const [dx,dy] of routes[level]){assert(launch(g,dx,dy));for(let i=0;i<720;i++){tick(g,STEP,{effects:false});assert(Number.isFinite(g.ball.x)&&Number.isFinite(g.ball.y));assert(g.ball.x>=43&&g.ball.x<=757);}}
 assert.equal(g.hits,3);assert.equal(g.phase,'clear');assert(g.shots<=3);let final=g.score;for(let i=0;i<400;i++)tick(g);assert.equal(g.score,final);console.log(`场 ${level+1}: ${g.shots} 弹通关，${g.score} 分`);
}
let g=createRound();assert.equal(launch(g,1,1),false);assert.equal(g.shots,0);
for(let i=0;i<3;i++){assert(launch(g,0,-50));assert.equal(launch(g,0,100),false);recall(g);}assert.equal(g.phase,'failed');assert.equal(launch(g,0,150),false);
g=createRound();let before=structuredClone(g),path=predict(g,-90,120);assert.deepEqual(g,before);launch(g,-90,120);let actual=[];for(let i=0;i<84;i++){tick(g,STEP,{effects:false});if(i%6===0)actual.push({x:g.ball.x,y:g.ball.y});}assert.deepEqual(path,actual);
assert(Math.hypot(...Object.values(velocity(1e6,1e6)))<=1116.000001);
g=createRound();launch(g,-80,130);for(let i=0;i<2400;i++)tick(g);assert(g.particles.length<=180&&g.events.length<=30&&g.trail.length<=28);assert.equal(g.phase,'ready');
g=createRound();launch(g,-50,100);g.ball.x=630;g.ball.y=830;g.ball.vx=0;g.ball.vy=300;tick(g);assert(g.ball.vy<0);assert(g.bounces>0);
g=createRound();launch(g,-50,100);g.ball.x=g.bricks[0].x;g.ball.y=g.bricks[0].y;tick(g);assert(g.bricks[0].dead);assert(g.score>=30);
g=createRound();launch(g,-50,100);g.ball.x=g.bells[0].x;g.ball.y=g.bells[0].y;tick(g);let score=g.score;g.ball.x=g.bells[0].x;g.ball.y=g.bells[0].y;tick(g);assert.equal(g.hits,1);assert.equal(g.score,score);
console.log('弹射检查通过：三场可解、三弹限制、轨迹一致、有限效果、反弹、破冰、铃不重复计分。');
