import assert from 'node:assert/strict';
import {CROPS} from '../farm/catalog.js';
import {growthProfile,frameDelay} from '../farm/growth.js';
import {createScene} from '../farm/art.js';
import {newGame,plant,threshold,water,harvest} from '../farm/model.js';
for(let crop of CROPS){let last=0;for(let g of [0,.16,.42,.64,.83,.99,1]){let p=growthProfile(crop.id,{progress:g,phase:g===1?4:g<.16?0:g<.42?1:g<.64?2:3,established:false});assert(p.scale>=last);assert(p.width<=180&&p.height<=143);assert(p.mix>=0&&p.mix<=1);last=p.scale;}let ripe=growthProfile(crop.id,{progress:1,phase:4,established:false});assert.equal(ripe.mix,1);if(crop.harvests>1){let after=growthProfile(crop.id,{progress:0,phase:1,established:true});assert.equal(after.scale,ripe.scale,'no plant shrink after harvesting '+crop.id);assert.equal(after.mix,0,'no harvested fruit retained');assert.equal(after.width,ripe.width);assert.equal(after.height,ripe.height);for(let g of [0,.2,.5,.9])assert.equal(growthProfile(crop.id,{progress:g,phase:2,established:true}).scale,1);}}
assert.equal(growthProfile('wheat',{progress:.5,phase:2}).family,'grain');assert.equal(growthProfile('carrot',{progress:.5,phase:2}).flowers,0);assert(growthProfile('carrot',{progress:.5,phase:2}).buried);assert.equal(growthProfile('mushroom',{progress:.5,phase:2}).flowers,0);
assert.equal(growthProfile('berry',{progress:.22,phase:1,established:true}).flowers,0,'regrowing leaves must precede blossom');
assert.equal(frameDelay(false),250);assert.equal(frameDelay(true),32);assert.equal(frameDelay(false,true),1000);assert.equal(frameDelay(true,true),100);assert.equal(frameDelay(true,false,true),1000);
const context=()=>new Proxy({createLinearGradient:()=>({addColorStop(){}})},{get(t,k){return k in t?t[k]:()=>{};},set(t,k,v){t[k]=v;return true;}});
const createCanvas=()=>({getContext:()=>context()});let renderer=createScene(createCanvas(),{createCanvas}),s=newGame(1800000000000);s.xp=threshold(40);s.coins=10000;
renderer.render(s,s.at,0);let first=renderer.stats;for(let i=0;i<20;i++)renderer.render(s,s.at,i/30);assert.equal(renderer.stats.groundBuilds,first.groundBuilds,'unchanged ground must be cached');assert.equal(renderer.stats.plantBuilds,first.plantBuilds,'unchanged plants must be cached');
plant(s,4,'apple',s.at);renderer.render(s,s.at,1);assert.equal(renderer.stats.groundBuilds,first.groundBuilds,'planting need not rebuild terrain');assert(renderer.stats.plantBuilds>first.plantBuilds);
let planted=renderer.stats;water(s,4,s.at);renderer.render(s,s.at,2);assert.equal(renderer.stats.groundBuilds,planted.groundBuilds+1,'wet soil must rebuild');renderer.render(s,s.at,3);assert.equal(renderer.stats.groundBuilds,planted.groundBuilds+1);
let end=s.plots[4].end;harvest(s,4,end);renderer.render(s,end,4);assert.equal(s.plots[4].cycle,2);assert(renderer.stats.cachedPlants<=12);s.soil[4]=1;renderer.render(s,end,5);assert.equal(renderer.stats.groundBuilds,planted.groundBuilds+3,'regrowth resets wetness and new soil invalidates terrain');
console.log('PASS all40 growth profiles, stable regrowth size, gradual fruit mix, rooted bounds, quiet/effect cadence and ground/plant cache invalidation');
