export const VERSION='snowbound-6.0.0';
export const CONFIG=Object.freeze({step:1/120,maxSteps:12,maxDelta:.12,base:760,gravity:1250,jump:500,buffer:.12,coyote:.10,holdDelay:.18,trickRate:6.8,flap:300,moduleLength:2600,restLength:1550,modules:40,rescueCapacity:2,rescueCost:30,bodyRadius:21,hitHeight:118,collectRadius:62,mountTime:14,mountCooldown:0,wingTime:6,pressureGrace:12,leadStart:2600,leadMax:3800,caughtWindow:2.6});
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));export const lerp=(a,b,t)=>a+(b-a)*t;export const wrap=a=>Math.atan2(Math.sin(a),Math.cos(a));
export const THEMES=[{name:'晨光雪谷',sky:['#9bceda','#f8efe0'],snow:'#fff8e8',ink:'#304554',far:'#abc7c8',near:'#779eaa',accent:'#d47760'},{name:'杉林冰河',sky:['#98bdc7','#e4f0df'],snow:'#f3f8eb',ink:'#304b4f',far:'#91b4ac',near:'#446e64',accent:'#418fa1'},{name:'蓝晶洞穴',sky:['#183c58','#6696aa'],snow:'#dcecf0',ink:'#283d52',far:'#43697e',near:'#284e65',accent:'#6bbdce'},{name:'落日海湾',sky:['#e8ac83','#f9dcc0'],snow:'#fff1df',ink:'#4a4c5b',far:'#aaa6b6',near:'#848eab',accent:'#d77561'}];

// Limited widening preserves actual speed contrast; complex routes are previewed by terrain.
export function viewMetrics(speed){const worldWidth=clamp(1000+Math.max(0,speed-760)*.25,1000,1150),anchor=worldWidth*.18;return {worldWidth,anchor,lookahead:worldWidth-anchor,previewSeconds:(worldWidth-anchor-70)/Math.max(1,speed)};}
