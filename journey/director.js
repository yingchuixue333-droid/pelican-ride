import {clamp} from './config.js?v=20261013-v8b';
// A public, seeded timeline. Never depends on the player's lead or score.
export function pressureSchedule(seed,time){
 const round=Math.floor(time/36),hash=(Math.imul((seed>>>0)^round,1664525)+1013904223)>>>0;
 const start=round*36;
 // Constant 36-second rounds preserve continuity; durations within them vary.
 const warning=4+(hash%3),push=10+((hash>>>4)%4),escape=5+((hash>>>8)%3),t=time-start;
 const age=clamp((time-35)/565,0,1);
 let phase=t<warning?'warning':t<warning+push?'pressure':t<warning+push+escape?'escape':'relax';
 if(time<22)phase='relax';
 const snowFactor={warning:1.07+age*.20,pressure:1.18+age*.28,escape:1.08+age*.18,relax:1.04+age*.15}[phase];
 return {phase,snowFactor,round,age,exit:start+36,warning,push,escape};
}
