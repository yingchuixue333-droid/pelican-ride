import {clamp} from './config.js?v=20261031-v9a';
// Visible, independent snow pulses. A clean conservative run gains ground over each round.
// Pressure comes from the time actually lost to mistakes, never a mandatory trick tax.
export function pressureSchedule(seed,time){
 const round=Math.floor(time/36),t=time-round*36,age=clamp(time/200,0,1);
 const phase=time<22?'relax':t<5?'warning':t<17?'pressure':t<24?'escape':'relax';
 const snowFactor={warning:1.02,pressure:1.08,escape:.96,relax:.98}[phase];
 return {phase,snowFactor,round,age,exit:(round+1)*36,warning:5,push:12,escape:7};
}
