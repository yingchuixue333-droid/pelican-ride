import assert from 'node:assert/strict';

globalThis.location = new URL('https://farm.test/');
const model = await import('../farm/model.js');
const orchard = await import('../farm/orchard.js');
const {enableFieldProgress} = await import('../farm/preview-progression.js');
const {NEXT_CROPS} = await import('../farm/next-crops.js');

const T = 1800000000000;
const H = 3600000;
function farm(level,coins=4000){
 const s=model.newGame(T);
 model.enableRain7(s);
 enableFieldProgress(s);
 orchard.enableOrchardMarket(s);
 orchard.enableQuickFruit(s,T);
 s.xp=model.threshold(level);
 s.coins=coins;
 s.plots.fill(null);
 return s;
}

const current=farm(20);
current.plotCount=10;
model.plant(current,0,'tomato',T);
model.plant(current,1,'blueberry',T);
model.plant(current,2,'rice',T);
current.soil[0]=8;
orchard.harvestTree(current,0,T+20*60000);
const snapshot=structuredClone(current);
for(const item of NEXT_CROPS)delete snapshot.stats[item.id];
const migrated=model.parse(JSON.stringify(snapshot));
for(const key of ['xp','coins','plots','soil','plotCount','orchard','lastSeeds'])assert.deepEqual(migrated[key],current[key]);
assert.equal(model.enableSeedTrial(migrated),true);
assert.equal(model.enableSeedTrial(migrated),false);
assert.equal(migrated.seedTrial,'available');

assert.equal(model.changeFieldSeed(migrated,1,'pumpkin',false,T)[0].kind,'queue');
const existing=structuredClone(migrated.plots.slice(0,3));
const all=model.seedChangeQuote(migrated,0,'wheat',true);
assert.equal(all.empty.length,7);
assert.equal(all.waiting,2);
assert.equal(all.excluded,1);
const total=model.changeFieldSeed(migrated,0,'wheat',true,T);
assert.equal(total.filter(event=>event.kind==='plant').length,7);
assert.deepEqual(migrated.plots.slice(0,3),existing);
assert.equal(model.plannedSeed(migrated,0),'wheat');
assert.equal(model.plannedSeed(migrated,1),'pumpkin');
assert.deepEqual(model.parse(JSON.stringify(migrated)),migrated);
assert(model.followFarmSeed(migrated,1,T));
assert.equal(model.plannedSeed(migrated,1),'wheat');

const first=model.collectField(migrated,0,migrated.plots[0].end);
assert.equal(first.length,1);
assert.equal(migrated.plots[0].id,'tomato');
assert.equal(migrated.plots[0].remaining,2);
assert.equal(model.collectField(migrated,0,migrated.plots[0].end).length,1);
const last=model.collectField(migrated,0,migrated.plots[0].end);
assert.equal(last.length,2);
assert.equal(migrated.plots[0].id,'wheat');

const poor=farm(20,0),before=structuredClone(poor);
assert.deepEqual(model.changeFieldSeed(poor,0,'wheat',true,T),[]);
assert.deepEqual(poor,before);
assert.equal(model.seedChangeQuote(poor,0,'wheat',true).missing,48);
model.expand(poor,T);
assert.equal(poor.plotCount,6);

const fifteenth=farm(15,0);
fifteenth.xp=model.threshold(16)-1;
assert(!model.unlocked(fifteenth,'snowpea'));
assert(!model.enableSeedTrial(fifteenth));
model.plant(fifteenth,0,'radish',T);
const level=model.harvest(fifteenth,0,fifteenth.plots[0].end);
assert.equal(level.levels,1);
assert.equal(fifteenth.coins,33);
assert(model.unlocked(fifteenth,'snowpea'));
assert.equal(fifteenth.seedTrial,'available');
const withGrant=structuredClone(fifteenth);
assert.equal(model.plant(fifteenth,0,'snowpea',fifteenth.at).cost,0);
assert.equal(fifteenth.plots[0].paid,0);
assert.equal(fifteenth.seedTrial,'used');
assert.equal(model.plant(fifteenth,1,'snowpea',fifteenth.at).cost,20);
assert(!model.enableSeedTrial(model.parse(JSON.stringify(fifteenth))));
for(const reverted of [snapshot,withGrant]){
 const imported=model.parse(JSON.stringify(reverted));
 model.mergeSeedTrial(imported,fifteenth);
 assert.equal(imported.seedTrial,'used');
 assert(!model.enableSeedTrial(imported));
}
const batch=farm(16,240);
batch.nextSeed='rice';
model.plant(batch,0,'radish',T);
model.plant(batch,1,'pumpkin',T);
batch.coins=0;
const prepared=model.collectFields(batch,[0,1],batch.plots[1].end);
assert.equal(prepared.filter(e=>e.kind==='plant').length,2);
assert.equal(batch.plots[0].id,'rice');

const wait=farm(19,7600);
wait.plotCount=10;wait.soil[0]=8;
assert.equal(model.expand(wait,T),false);
assert.equal(model.improve(wait,0,T),false);
wait.xp=model.threshold(20);
assert(model.expand(wait,T));assert.equal(wait.coins,0);
wait.coins=3000;
assert(model.improve(wait,0,T));
assert.equal(wait.soil[0],9);
assert.equal(wait.coins,0);
console.log('PASS season save migration, trial grant and re-import, seed priority and multi-harvest, quoted budgets, and level-20 costs');
