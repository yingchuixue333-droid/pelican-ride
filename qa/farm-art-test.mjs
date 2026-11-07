import assert from 'node:assert/strict';
import {CROPS,newGame,threshold,plant} from '../farm/model.js';
import {drawIcon,plantArt,createScene} from '../farm/art.js';
globalThis.devicePixelRatio=2;let calls=0;const ctx=new Proxy({ellipse(...args){assert(args.slice(0,4).every(Number.isFinite));assert(args[2]>=0&&args[3]>=0);calls++;}},{get(t,k){return k in t?t[k]:()=>{};},set(t,k,v){t[k]=v;return true;}}),canvas={getContext:()=>ctx};
for(let c of CROPS){drawIcon(canvas,c.id);for(let stage=0;stage<4;stage++)plantArt(ctx,c.id,0,0,1,stage,0,0);}
const renderer=createScene(canvas);let s=newGame();s.xp=threshold(40);s.coins=100000;for(let c of CROPS){s.plots[4]=null;plant(s,4,c.id,s.at);for(let g of [0,.2,.7,1])renderer.render(s,s.at+c.seconds*1000*g,0,true);}assert(calls>1000);console.log('PASS all40 icons, four growth stages, whole-scene drawing and soil fields render without exceptions');
