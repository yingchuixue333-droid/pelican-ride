import assert from 'node:assert/strict';
import {SAVE_KEY,loadProgress,saveProgress} from '../journey/progress.js';
const data=new Map([['pelican-snowbound-v8',JSON.stringify({v:6,v8Best:98765,skin:2,legacyOutfits:[2],rulesVersion:8})]]);
const storage={getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)};
let p=loadProgress(storage);assert.equal(p.v8Best,98765);assert.equal(p.skin,2);assert.equal(p.v9Best,0);p.v9Best=1234;p.v9Daily.today=500;saveProgress(storage,p);assert.equal(SAVE_KEY,'pelican-snowbound-v9');
// Simulate a cached V8 tab saving after V9 has already saved a score.
data.set('pelican-snowbound-v8',JSON.stringify({v:6,v8Best:99999,skin:0,rulesVersion:8}));
let q=loadProgress(storage);assert.equal(q.v9Best,1234);assert.equal(q.v9Daily.today,500);assert.equal(q.skin,2);assert.ok(q.legacyOutfits.includes(2));console.log('PASS V8 migration and cached old-tab isolation');
