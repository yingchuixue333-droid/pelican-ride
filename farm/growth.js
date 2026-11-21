import {crop} from './catalog.js?v=20261121c';
const clamp=n=>Math.max(0,Math.min(1,n));
export const smooth=(a,b,n)=>{let t=clamp((n-a)/(b-a));return t*t*(3-2*t);};
export function growthProfile(id,v){
 const c=crop(id),g=clamp(v.progress),shape=c.shape;
 const family=shape==='tree'?'tree':['wheat','corn'].includes(shape)?'grain':['radish','carrot','root'].includes(shape)?'root':shape==='leaf'?'leaf':['flower','moon'].includes(shape)?'flower':shape==='mushroom'?'mushroom':shape==='lotus'?'lotus':['vine','tomato','pod','grape'].includes(shape)?'vine':'bush';
 const established=!!v.established,scale=established?1:(family==='tree'?.25+.75*smooth(0,.72,g):family==='mushroom'?.5+.5*smooth(0,.7,g):.22+.78*smooth(0,.64,g));
 const start=family==='leaf'?.18:family==='root'?.58:family==='grain'?.55:family==='flower'?.5:established?.48:.58;
 const mix=v.phase===4?1:smooth(start,1,g);
 const canFlower=['tree','vine','bush','flower'].includes(family)&&!['asparagus','pineapple','banana'].includes(id);
 const bloomStart=established?.28:.42,bloomEnd=established?.67:.8;
 const flowers=canFlower?smooth(bloomStart,bloomStart+.13,g)*(1-smooth(bloomEnd-.13,bloomEnd,g)):0;
 const width=family==='grain'?151:family==='tree'?160:family==='vine'?170:160;
 const height=family==='tree'?142:family==='grain'?142:family==='vine'?142:family==='bush'?136:family==='leaf'?130:family==='mushroom'?112:142;
 return {family,scale,mix,flowers,width,height,buried:family==='root',established,grain:family==='grain'?smooth(.35,.58,g)*(1-smooth(.72,1,g)):0};
}
// Active effects animate smoothly; the quiet farm only refreshes gently.
export function frameDelay(active,reduced=false,covered=false){return covered?1000:active?(reduced?100:32):reduced?1000:250;}
