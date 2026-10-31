import {LEVELS,STEP,createRound,launch,recall,tick,predict,clamp} from './physics.js?v=20261031-f1';
import {createRenderer} from './render.js?v=20261031-f1';
const $=id=>document.getElementById(id),canvas=$('field'),renderer=createRenderer(canvas),reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let g=createRound(),aim=null,pointer=null,startPoint=null,acc=0,last=0,raf=0,visible=!document.hidden,sound=false,audio,lastSound=-10,feedbackUntil=0,wonSaved=false;
let records={};try{let raw=JSON.parse(localStorage.getItem('snowbound-fling-v1')||'{}');for(let i=0;i<3;i++)if(raw[i]&&Number.isFinite(raw[i].score)&&Number.isInteger(raw[i].shots)&&raw[i].shots>=1&&raw[i].shots<=3)records[i]={score:Math.max(0,raw[i].score),shots:raw[i].shots};}catch{}
function feedback(text,seconds=2){$('feedback').textContent=text;feedbackUntil=g.time+seconds;}
function tone(type,value=0){if(!sound||document.hidden)return;try{audio??=new AudioContext();audio.resume();let now=audio.currentTime;if(now-lastSound<.07&&type!=='bell'&&type!=='clear')return;lastSound=now;const notes=type==='clear'?[523,659,784]:type==='bell'?[523*Math.pow(2,Math.min(3,g.chain-1)/4)]:type==='bumper'?[220]:type==='brick'?[125]:type==='launch'?[180]:[90];for(let i=0;i<notes.length;i++){const o=audio.createOscillator(),a=audio.createGain(),t=now+i*.1,d=type==='bell'||type==='clear'?.9:.14;o.type=type==='brick'?'triangle':'sine';o.frequency.setValueAtTime(notes[i],t);if(type==='bumper')o.frequency.exponentialRampToValueAtTime(440,t+.15);a.gain.setValueAtTime(.0001,t);a.gain.linearRampToValueAtTime(type==='wall'?.018:.055,t+.008);a.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(a);a.connect(audio.destination);o.start(t);o.stop(t+d+.03);}}catch{sound=false;setSound();}}
function setSound(){$('sound').setAttribute('aria-pressed',String(sound));$('sound').replaceChildren(document.createTextNode('♪'));let span=document.createElement('span');span.textContent=sound?'声音开':'声音关';$('sound').append(span);}
function hud(){
 $('level').textContent=String(g.index+1).padStart(2,'0')+' / 03 · '+LEVELS[g.index].name;
 $('rings').textContent='● '.repeat(g.hits)+'○ '.repeat(3-g.hits);$('rings').setAttribute('aria-label','已撞响 '+g.hits+' / 3 口风铃');
 $('score').textContent=g.score+' 分';$('shots').textContent='剩余 '+Math.max(0,3-g.shots)+' 弹'+(records[g.index]?' · 纪录 '+records[g.index].score:'');
 $('next').disabled=g.phase!=='clear';$('next').textContent=g.index===2?'再来一轮 ↗':'下一场 →';$('recall').disabled=g.phase!=='flying';
 $('hint').textContent=g.phase==='failed'?'还差 '+(3-g.hits)+' 口铃，按重来就能再试。':g.phase==='clear'?'用了 '+g.shots+' 弹。'+(g.shots===1?'三响一弹，漂亮！':'换个角度，也许能少用一弹。'):LEVELS[g.index].hint;
}
function saveWin(){if(wonSaved)return;wonSaved=true;const old=records[g.index];if(!old||g.shots<old.shots||g.shots===old.shots&&g.score>old.score){records[g.index]={score:g.score,shots:g.shots};try{localStorage.setItem('snowbound-fling-v1',JSON.stringify(records));}catch{}}}
function events(){for(const e of g.events){tone(e.type,e.value);if(e.type==='bell')feedback((g.chain>1?g.chain+' 连响！':'叮！')+' +'+e.value,1.5);if(e.type==='clear'){saveWin();feedback(g.shots===1?'一弹 · 三响！':'三口铃，都响了。',8);}}g.events.length=0;}
function cancel(){pointer=null;aim=null;startPoint=null;}
function reset(index=g.index){cancel();g=createRound(index);wonSaved=false;acc=0;last=0;$('feedback').textContent='';hud();renderer.render(g,null,{reduced});wake();}
$('reset').onclick=()=>reset();$('recall').onclick=()=>{cancel();recall(g);events();hud();};$('next').onclick=()=>{if(g.phase==='clear')reset((g.index+1)%3);};$('sound').onclick=()=>{sound=!sound;setSound();if(sound)tone('bell');};
canvas.addEventListener('pointerdown',e=>{if(g.phase!=='ready'||pointer!==null||!visible||e.button>0)return;e.preventDefault();pointer=e.pointerId;startPoint=renderer.point(e.clientX,e.clientY);aim={dx:0,dy:0,path:[]};try{canvas.setPointerCapture(e.pointerId);}catch{};});
canvas.addEventListener('pointermove',e=>{if(e.pointerId!==pointer||!startPoint)return;e.preventDefault();let p=renderer.point(e.clientX,e.clientY),dx=p.x-startPoint.x,dy=p.y-startPoint.y,d=Math.hypot(dx,dy),factor=Math.min(1,155/(d||1));aim={dx:dx*factor,dy:dy*factor};aim.path=predict(g,aim.dx,aim.dy);});
function release(e){if(e.pointerId!==pointer)return;e.preventDefault();const pull=aim;cancel();if(e.type==='pointerup'&&pull){if(launch(g,pull.dx,pull.dy)){events();hud();}else feedback('往后拉开一点，再松手。',1.5);}}
for(let name of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(name,release);
canvas.addEventListener('contextmenu',e=>e.preventDefault());canvas.addEventListener('selectstart',e=>e.preventDefault());
window.addEventListener('keydown',e=>{if(e.code==='KeyR'&&!e.repeat)reset();if(e.code==='Space'&&!e.repeat&&g.phase==='ready'){e.preventDefault();launch(g,-74,122);events();hud();}});
function frame(now){raf=0;if(!visible||document.hidden)return;let dt=last?Math.min(.1,(now-last)/1000):0;last=now;acc+=dt;let steps=0;while(acc>=STEP&&steps<12){tick(g);acc-=STEP;steps++;}if(steps===12)acc=0;events();if(g.time>feedbackUntil)$('feedback').textContent='';hud();renderer.render(g,aim,{reduced});raf=requestAnimationFrame(frame);}
function wake(){if(visible&&!document.hidden&&!raf){last=0;raf=requestAnimationFrame(frame);}}
function pause(){cancel();visible=false;cancelAnimationFrame(raf);raf=0;last=0;acc=0;}
window.addEventListener('blur',pause);window.addEventListener('focus',()=>{visible=true;wake();});
document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();else{visible=true;wake();}});
const observer=new ResizeObserver(()=>{cancel();renderer.resize();renderer.render(g,null,{reduced});});observer.observe(canvas);
setSound();hud();renderer.resize();wake();
if(new URLSearchParams(location.search).has('audit'))window.flingAudit={get game(){return g},reset,launch:(dx,dy)=>{launch(g,dx,dy);events();hud();},advance(seconds){for(let i=0;i<Math.min(20,seconds)/STEP;i++)tick(g);events();hud();renderer.render(g,null,{reduced});}};
