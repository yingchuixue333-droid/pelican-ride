import assert from 'node:assert/strict';
import fs from 'node:fs';
import {newGame,parse} from '../farm/model.js';
import {makeRainDemo} from '../farm/rain-demo.js';
import {treeView,harvestFruit,harvestTree} from '../farm/orchard.js';
const T=1800000000000;
let s=makeRainDemo(T);assert.equal(s.at,T);assert.equal(treeView(s,0,T).stage,3);assert.equal(treeView(s,0,T).stored,4);assert.equal(s.orchard.basketCount,0);assert.deepEqual(parse(JSON.stringify(s)),s);let first=treeView(s,0,T).fruits[0],coins=s.coins;assert(harvestFruit(s,0,first.token,T));assert.equal(s.orchard.basketCount,1);assert.deepEqual(s.orchard.basketRecent,['apple']);assert.equal(treeView(s,0,T).stored,3);assert.equal(s.coins,coins+175);assert(!harvestFruit(s,0,first.token,T));s=parse(JSON.stringify(s));assert.equal(s.orchard.basketCount,1);assert(!harvestFruit(s,0,first.token,T));let e=harvestTree(s,1,T);assert(e);assert.equal(s.orchard.basketCount,5);assert.deepEqual(s.orchard.basketRecent,['pear','pear','pear']);assert.deepEqual(parse(JSON.stringify(s)),s);
let old=newGame(T);delete old.orchard.basketCount;delete old.orchard.basketRecent;assert.deepEqual(parse(JSON.stringify(old)),old);for(let mutate of [v=>v.orchard.basketCount=-1,v=>v.orchard.basketRecent=['evil'],v=>v.orchard.basketRecent=['apple','pear','peach','apple']]){let bad=structuredClone(s);mutate(bad);assert.throws(()=>parse(JSON.stringify(bad)));}
let app=fs.readFileSync('farm/app.js','utf8'),ui=fs.readFileSync('farm/orchard-ui.js','utf8');assert(app.includes('preview?makeRainDemo():newGame()'));assert(ui.includes("invite.dataset.token=first.token"));assert(ui.includes('pending.has(token)'));assert(ui.includes('scene.flying'));assert(!app.includes("$('previewShowcase').hidden=false"));console.log('PASS ready-to-pick fresh demo, identical invitation/fruit identity, one-only settlement and basket, recent true species, reload/old V3 compatibility and secondary test controls');
// Every non-hero silhouette must fit the portrait scene without stretching or clipping.
const {treeLayout,fruitPositions}=await import('../farm/orchard-scene.js');
for(let id of ['apple','pear','peach'])for(let stage=0;stage<4;stage++){
 let v={tree:{id},stage,fruits:[1,2,3,4].map(serial=>({serial}))},b=treeLayout(v);
 assert(b.x>=0&&b.y>=0&&b.x+b.w<=720&&b.y+b.h<=1200,`${id}/${stage} stays inside scene`);
 if(!b.hero)assert(Math.abs(b.w/b.h-b.crop[2]/b.crop[3])<1e-9,`${id}/${stage} preserves aspect`);
 for(let f of fruitPositions(v))assert(f.x-f.r>0&&f.x+f.r<720&&f.y-f.r>0&&f.y+f.r<1200,`${id}/${stage} fruit stays visible`);
}
console.log('PASS complete portrait tree silhouettes, preserved sprite aspect and visible real fruit positions across all species/stages');
