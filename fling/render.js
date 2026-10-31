import {WIDTH,HEIGHT,LEVELS,clamp,predict} from './physics.js?v=20261031-f1';
export function metrics(width,height){const scale=Math.min(width/WIDTH,height/HEIGHT);return {scale,x:(width-WIDTH*scale)/2,y:(height-HEIGHT*scale)/2};}
export function createRenderer(canvas){
 const ctx=canvas.getContext('2d'),ink='#355763';let w=360,h=600,ratio=1;
 const shape=(fn,fill,stroke=null,line=3)=>{ctx.beginPath();fn(ctx);if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=line;ctx.stroke();}};
 const circle=(x,y,r,fill,stroke=null,line=3)=>shape(c=>c.arc(x,y,r,0,Math.PI*2),fill,stroke,line);
 const path=(fn,color=ink,line=3)=>shape(fn,null,color,line);
 const rect=(x,y,w,h,fill,r=0,stroke=null,line=3)=>shape(c=>c.roundRect(x,y,w,h,r),fill,stroke,line);
 function resize(){const r=canvas.getBoundingClientRect();w=r.width;h=r.height;ratio=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(w*ratio);canvas.height=Math.round(h*ratio);}
 function snowball(x,y,r,face=true,angle=0){ctx.save();ctx.translate(x,y);ctx.rotate(angle);circle(0,0,r,'#fffced',ink,3);shape(c=>{c.moveTo(-r*.86,4);c.quadraticCurveTo(-r*.38,r*.9,r*.72,r*.5);c.quadraticCurveTo(0,r*1.2,-r*.8,r*.4);},'#cbdfd9');path(c=>{c.moveTo(-r*.55,-r*.45);c.quadraticCurveTo(-r*.2,-r*.7,r*.14,-r*.61);},'#fff',4);if(face){circle(-7,-2,2.2,ink);circle(7,-2,2.2,ink);path(c=>{c.moveTo(-4,7);c.quadraticCurveTo(0,10,4,7);},ink,1.7);}ctx.restore();}
 function render(g,aim=null,{reduced=false}={}){
 const m=metrics(w,h),l=LEVELS[g.index];ctx.setTransform(ratio,0,0,ratio,0,0);ctx.fillStyle=l.sky;ctx.fillRect(0,0,w,h);ctx.save();ctx.translate(m.x,m.y);ctx.scale(m.scale,m.scale);ctx.lineJoin='round';ctx.lineCap='round';
 ctx.fillStyle=l.sky;ctx.fillRect(0,0,WIDTH,HEIGHT);
 circle(650,145,42,g.index===2?'#efcfaa':'#f6e6b7');
 shape(c=>{c.moveTo(0,450);c.lineTo(110,290);c.lineTo(210,415);c.lineTo(360,230);c.lineTo(530,440);c.lineTo(650,300);c.lineTo(800,470);c.lineTo(800,1100);c.lineTo(0,1100);},'#b4cdcb');
 shape(c=>{c.moveTo(285,323);c.lineTo(360,230);c.lineTo(439,328);c.lineTo(389,308);c.lineTo(361,323);c.lineTo(339,301);},l.snow);
 shape(c=>{c.moveTo(0,580);c.quadraticCurveTo(230,480,425,615);c.quadraticCurveTo(625,520,800,610);c.lineTo(800,1100);c.lineTo(0,1100);},'#ccdbd1');
 shape(c=>{c.moveTo(0,1035);c.quadraticCurveTo(200,1010,400,1035);c.quadraticCurveTo(600,1050,800,1035);c.lineTo(800,1100);c.lineTo(0,1100);},l.snow);
 path(c=>{c.moveTo(22,65);c.lineTo(22,1025);c.moveTo(778,65);c.lineTo(778,1025);},'#94b2ae',4);
 for(let i=0;i<6;i++){let x=70+i*130;path(c=>{c.moveTo(x,1070+(i%2)*10);c.quadraticCurveTo(x+20,1066+(i%2)*10,x+42,1070+(i%2)*10);},'#c8d4c4',2);}
 for(let b of g.bricks){if(b.dead)continue;rect(b.x-b.w/2,b.y-b.h/2,b.w,b.h,'#acd6de',5,ink,2.4);path(c=>{c.moveTo(b.x-15,b.y-10);c.lineTo(b.x+8,b.y-10);c.moveTo(b.x-12,b.y-7);c.lineTo(b.x+8,b.y+11);},'#edf8ee',2);path(c=>{c.moveTo(b.x+5,b.y-16);c.lineTo(b.x-3,b.y-1);c.lineTo(b.x+5,b.y+3);},'#75acbe',1.4);}
 for(let p of g.bumpers){const scale=1+(reduced?0:Math.sin(p.pulse/.25*Math.PI)*.09);ctx.save();ctx.translate(p.x,p.y);ctx.scale(scale,scale);circle(0,0,p.r,'#d58e69',ink,4);circle(0,0,p.r-9,'#edbd80',ink,2);for(let i=0;i<8;i++){const a=i*Math.PI/4;path(c=>{c.moveTo(Math.cos(a)*(p.r-6),Math.sin(a)*(p.r-6));c.lineTo(Math.cos(a)*(p.r+1),Math.sin(a)*(p.r+1));},'#fff0c5',4);}ctx.strokeStyle='#9f694f';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,p.r*.52,-.6,1.5);ctx.stroke();path(c=>{c.moveTo(-13,4);c.lineTo(2,-10);c.lineTo(15,4);},ink,3);ctx.restore();}
 for(let p of g.bells){ctx.save();ctx.translate(p.x,p.y);let a=!reduced&&p.pulse>0?Math.sin(p.pulse*36)*p.pulse*.5:0;ctx.rotate(a);path(c=>{c.moveTo(0,-44);c.lineTo(0,-31);},ink,3);circle(0,-45,5,'#d4c49d',ink,2);shape(c=>{c.moveTo(-22,16);c.lineTo(-18,-10);c.quadraticCurveTo(-16,-30,0,-29);c.quadraticCurveTo(16,-30,18,-10);c.lineTo(22,16);c.quadraticCurveTo(0,25,-22,16);},p.hit?'#f7d17b':'#dfb671',ink,3);path(c=>{c.moveTo(-26,16);c.quadraticCurveTo(0,28,26,16);},ink,4);circle(0,23,5,'#9d7755',ink,2);path(c=>{c.moveTo(-9,-16);c.lineTo(-11,6);},'#fff2bd',3);if(p.hit){ctx.fillStyle=ink;ctx.font='bold 20px sans-serif';ctx.textAlign='center';ctx.fillText('✓',0,7);}if(p.pulse>0&&!reduced){ctx.globalAlpha=p.pulse;ctx.strokeStyle='#f5d481';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,45+(1-p.pulse)*35,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;}ctx.restore();}
 // The same physics engine supplies the short preview; no decorative fake arc.
 if(aim){let points=aim.path||predict(g,aim.dx,aim.dy);points.forEach((p,i)=>{ctx.globalAlpha=(1-i/points.length)*.65;circle(p.x,p.y,3.7,'#527e83');});ctx.globalAlpha=1;}
 // Elastic fork. The projectile remains a physical snowball, with no menu step.
 path(c=>{c.moveTo(127,1029);c.lineTo(127,971);c.lineTo(92,925);c.moveTo(127,971);c.lineTo(170,928);},ink,13);
 path(c=>{c.moveTo(127,1027);c.lineTo(127,972);},'#b48e69',7);
 let bx=g.ball.x,by=g.ball.y;if(g.phase==='ready'){bx=130+(aim?.dx||0);by=930+(aim?.dy||0);bx=clamp(bx,26,744);by=clamp(by,70,1065);}
 if(g.phase==='ready'){path(c=>{c.moveTo(92,925);c.lineTo(bx,by);c.lineTo(170,928);},'#9d6d56',7);circle(130,930,67,'#fff9e51a');if(!aim){ctx.setLineDash([6,8]);circle(130,930,49,null,'#739b9988',2);ctx.setLineDash([]);ctx.fillStyle='#6f8b85';ctx.font='19px sans-serif';ctx.textAlign='center';ctx.fillText('往后拉',160,854);}}
 for(let i=0;i<g.trail.length;i++){let p=g.trail[i];ctx.globalAlpha=(i/g.trail.length)*.35;circle(p.x,p.y,3+i/g.trail.length*7,'#fff9e8');}ctx.globalAlpha=1;
 snowball(bx,by,g.ball.r,true,g.phase==='ready'?0:g.ball.vx*g.shotTime*.002);
 for(let p of g.particles){ctx.globalAlpha=Math.max(0,p.life/1.2);const color=p.kind==='gold'?'#efbd68':p.kind==='ice'?'#bce0e5':p.kind==='spark'?'#eeb978':'#f9f9e9';if(p.kind==='ice'){ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.life*4);rect(-p.size/2,-p.size/2,p.size,p.size,color,1);ctx.restore();}else circle(p.x,p.y,p.size,color);}ctx.globalAlpha=1;
 if(g.phase==='ready'){for(let i=0;i<3;i++)circle(300+i*27,1022,7,i<3-g.shots?'#e6b977':'#c3d1c6',ink,1.5);}
 ctx.restore();return m;
 }
 return {resize,render,point(clientX,clientY){const r=canvas.getBoundingClientRect(),m=metrics(w,h);return {x:(clientX-r.left-m.x)/m.scale,y:(clientY-r.top-m.y)/m.scale};}};
}
