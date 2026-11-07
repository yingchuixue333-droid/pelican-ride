import assert from 'node:assert/strict';
import {bindPlotTaps} from '../farm/touch.js';
class Surface{listeners={};addEventListener(n,f,o){assert(o.passive,'gesture observers must not block native scrolling');this.listeners[n]=f;}removeEventListener(n){delete this.listeners[n];}contains(b){return !!b?.plot;}send(name,fields={}){this.listeners[name]?.({target:button(0),pointerId:1,button:0,isPrimary:true,clientX:50,clientY:50,detail:1,...fields});}}
const button=i=>({plot:true,dataset:{plot:String(i)},closest(){return this;}}),root=new Surface(),hits=[],taps=bindPlotTaps(root,i=>hits.push(i));
root.send('pointerdown');assert.deepEqual(hits,[],'touching down must never harvest');root.send('click');assert.deepEqual(hits,[0]);
for(let delta of [[0,-100],[0,100],[100,0],[20,20]]){root.send('pointerdown');root.send('pointermove',{clientX:50+delta[0],clientY:50+delta[1]});root.send('click');}assert.deepEqual(hits,[0],'swipes must not act, even if browser emits a click');
root.send('pointerdown');root.send('pointercancel');root.send('click');assert.deepEqual(hits,[0]);
root.send('pointerdown');root.send('click',{target:button(1)});assert.deepEqual(hits,[0],'moving to another plot is not a tap');
root.send('click',{detail:0,target:button(2)});assert.deepEqual(hits,[0,2],'keyboard activation works');
root.send('pointerdown');root.send('pointerdown',{pointerId:2,isPrimary:false});root.send('click');assert.deepEqual(hits,[0,2],'pinch second finger cancels pending tap');
root.send('pointerdown');root.send('pointermove',{clientY:55});root.send('click');assert.deepEqual(hits,[0,2,0],'small natural finger movement still taps');
root.send('pointerdown');taps.cancel();root.send('click');assert.equal(hits.length,3);taps.destroy();assert.equal(Object.keys(root.listeners).length,0);
console.log('PASS native-scroll-safe taps: deferred action, vertical/horizontal swipe, cancel, cross-plot, keyboard, multitouch, small movement and cleanup');
