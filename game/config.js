export const VERSION='snowbound-2.0.0';
export const CONFIG=Object.freeze({step:1/120,maxSteps:12,maxDelta:.12,base:350,gravity:1050,jump:425,holdLift:1100,holdTime:.25,buffer:.12,coyote:.10,trickRate:4.7,finish:108000,moduleLength:3000,modules:36,rescueCapacity:1,rescueCost:5,bodyRadius:23,hitHeight:76,collectRadius:42,mountTime:10,mountCooldown:25,wingTime:6,pressureGrace:12,leadStart:1000,leadMax:1400,caughtWindow:1.8});
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export const lerp=(a,b,t)=>a+(b-a)*t;
export const wrap=a=>Math.atan2(Math.sin(a),Math.cos(a));
export const THEMES=[{name:'启程雪谷',sky:['#94c9df','#eef7f5'],snow:'#f4f8f4',ink:'#294454',far:'#9bbbc9',near:'#729ba7',accent:'#318b8d'},{name:'林海冰河',sky:['#8cadc3','#d2e9e7'],snow:'#ebf5f4',ink:'#274854',far:'#7795a6',near:'#496f79',accent:'#3b919f'},{name:'山洞云路',sky:['#8794bd','#edc9bb'],snow:'#f2e3dc',ink:'#363f5d',far:'#81849f',near:'#686d86',accent:'#ad7772'},{name:'终局山脊',sky:['#243d62','#7590aa'],snow:'#deedf1',ink:'#213a50',far:'#506e90',near:'#6e8ca5',accent:'#8ed0d5'}];
