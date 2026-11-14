import assert from 'node:assert/strict';
import {CROPS,newGame,threshold,plant} from '../farm/model.js';
import {drawIcon,plantArt,createScene,growingPlant,blendColor,SOIL_ART} from '../farm/art.js';
import {SPRITES} from '../farm/assets.js';
import {visualPhase} from '../farm/presentation.js';
globalThis.devicePixelRatio=2;let calls=0;const ctx=new Proxy({createLinearGradient(){return{addColorStop(){}};},ellipse(...args){assert(args.slice(0,4).every(Number.isFinite));assert(args[2]>=0&&args[3]>=0);calls++;}},{get(t,k){return k in t?t[k]:()=>{};},set(t,k,v){t[k]=v;return true;}}),canvas={getContext:()=>ctx};
assert.equal(new Set(CROPS.filter(c=>SPRITES[c.id]).map(c=>SPRITES[c.id].sheet+':'+SPRITES[c.id].index)).size,40);
for(let c of CROPS){drawIcon(canvas,c.id);for(let stage=0;stage<4;stage++)plantArt(ctx,c.id,0,0,1,stage,0,0);}
const renderer=createScene(canvas);let s=newGame();s.xp=threshold(40);s.coins=100000;for(let c of CROPS){s.plots[4]=null;plant(s,4,c.id,s.at);for(let g of [0,.2,.5,.7,.9,1]){let n=s.at+c.seconds*1000*g;growingPlant(ctx,c.id,0,0,1,visualPhase(s,s.plots[4],n),0);renderer.render(s,n,0,true,{selected:4});}s.plots[4].cycle=2;for(let g of [0,.3,.6,1])growingPlant(ctx,c.id,0,0,1,visualPhase(s,s.plots[4],s.at+c.seconds*1000*g),0);}for(let kind of ['plant','water','harvest','soil']){renderer.pop(4,'反馈',kind,s.at,'apple');renderer.render(s,s.at,performance.now()/1000,false,{selected:4});renderer.render(s,s.at,performance.now()/1000,true);}assert.equal(blendColor('#000000','#ffffff',.5),'#808080');assert.equal(new Set(SOIL_ART.map(v=>v.soil)).size,3);assert(calls>1000);console.log('PASS all40 icons, six growth points and established regrowth, whole-scene drawing and soil fields render without exceptions');
