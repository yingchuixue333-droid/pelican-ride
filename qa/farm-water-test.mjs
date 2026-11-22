import assert from 'node:assert/strict';

globalThis.location=new URL('https://farm.test/');
const m=await import('../farm/model.js');
const o=await import('../farm/orchard.js');
const {enableFieldProgress}=await import('../farm/preview-progression.js');
const T=1800000000000,H=3600000;
const fresh=()=>{
 const f=m.newGame(T-72*H);
 m.enableRain7(f);o.enableOrchardMarket(f);o.enableOrchardExpansion(f);o.enableQuickFruit(f,T);
 enableFieldProgress(f);f.at=T;f.xp=m.threshold(20);f.coins=20000;f.plotCount=12;f.plots.fill(null);
 return f;
};

const field=fresh();
for(const [i,id] of ['orange','orange','rice','radish','orange'].entries())assert(m.plant(field,i,id,T));
assert(m.water(field,0,T));
const n=T+6*60000;
const ends=field.plots.map(p=>p?.end);
const gate=m.irrigateFields(field,n);
assert.deepEqual(gate.indices,[1,2,4]);
assert.deepEqual(field.plots.map(p=>p?.watered).slice(0,5),[true,true,true,false,true]);
assert.equal(field.plots[0].end,ends[0]);
assert.equal(field.plots[1].end,ends[1]-field.plots[1].duration*.25);
assert.equal(field.plots[3].end,ends[3]);
assert.equal(m.irrigateFields(field,n),false);
assert.equal(m.irrigateFields(m.parse(JSON.stringify(field)),n),false);

const before=structuredClone(field.plots[0]),beforeCoins=field.coins,beforeXp=field.xp;
const first=before.end;
const quote=m.fertilizerQuote(field,[0,0,3],'coins',first-5000);
assert.deepEqual(quote.indices,[0]);
assert.equal(quote.gain,Math.round(before.value*.05));
assert.equal(m.fertilizeFields(field,[0],'coins',first-4000).gain,quote.gain);
assert.equal(field.plots[0].end,first);
assert.equal(field.xp,beforeXp);assert.equal(field.coins,beforeCoins);
const restored=m.parse(JSON.stringify(field));
assert.equal(restored.plots[0].fertilizer,'coins');
assert.equal(m.fertilizeFields(restored,[0],'xp',first-3000),false);
assert.equal(m.fertilizeFields(restored,[3],'xp',n),false);
assert.equal(m.harvest(restored,0,first-1),false);
const earned=m.harvest(restored,0,first);
assert.equal(earned.coins,before.value+quote.gain);
assert.equal(earned.xp,before.xp);
assert.equal(restored.plots[0].remaining,before.remaining-1);
assert.equal(restored.plots[0].fertilizer,undefined);
assert.equal(m.harvest(restored,0,first),false);
const xpQuote=m.fertilizerQuote(restored,[0],'xp',first);
assert.equal(xpQuote.gain,Math.round(restored.plots[0].xp*.1));
assert.equal(m.fertilizeFields(restored,[0],'xp',first).gain,xpQuote.gain);
const next=structuredClone(restored.plots[0]);
assert.equal(m.harvest(restored,0,next.end).xp,next.xp+xpQuote.gain);

const bug=fresh();
for(let i=0;i<100&&!bug.plots[0];i++){
 const tested=fresh();m.plant(tested,0,'orange',T+i*1000);
 if(m.fieldBugWindow(tested.plots[0],0)){bug.plots[0]=tested.plots[0];bug.at=tested.at;}
}
assert(bug.plots[0]);
const window=m.fieldBugWindow(bug.plots[0],0);
assert.equal(m.catchFieldBug(bug,0,window.start-1),false);
const bugXp=bug.xp,bugEnd=bug.plots[0].end;
assert.equal(m.catchFieldBug(bug,0,window.start).xp,3);
assert.equal(bug.xp,bugXp+3);assert.equal(bug.plots[0].end,bugEnd);
assert.equal(m.catchFieldBug(m.parse(JSON.stringify(bug)),0,window.start+1),false);

const orchard=fresh();
assert(o.plantTree(orchard,3,'persimmon',T));assert(o.plantTree(orchard,4,'loquat',T));
Object.assign(orchard.orchard,{basketCount:3,basketValue:395,basketRecent:['pear','plum','peach']});
const prior=m.parse(JSON.stringify(orchard));
assert(o.enableFreeTreeSites(orchard));assert(!o.enableFreeTreeSites(orchard));
assert.deepEqual(orchard.orchard.trees.slice(0,5),prior.orchard.trees);
assert.equal(orchard.orchard.basketValue,395);
assert(!o.plantTree(orchard,5,'apple',T));
assert(o.plantTree(orchard,5,'pear',T));assert(o.plantTree(orchard,6,'pear',T));
assert(!o.plantTree(orchard,5,'plum',T+1));
const replanted=m.parse(JSON.stringify(orchard)),firstFruit=T+900000;
const both=[5,6].map(i=>o.treeView(replanted,i,firstFruit).fruits[0].token);
assert.equal(both[0],both[1]);
for(const [j,id] of both.entries())assert(o.harvestFruit(replanted,j+5,id,firstFruit));
assert.equal(o.sellBasket(replanted,firstFruit,'pear').coins,144);
assert.equal(o.sellBasket(replanted,firstFruit).coins,395);
assert.equal(replanted.orchard.basketCount,0);
assert.deepEqual(m.parse(JSON.stringify(replanted)),replanted);
console.log('PASS gate skips, 60-minute fertilizer and exact yields, cycle resets, bug replay protection, two selectable slots and old basket');
