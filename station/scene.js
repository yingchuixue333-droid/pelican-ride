import {createArt} from '../journey/art.js?v=20261031-s1';
import {dailyScene} from './state.js?v=20261031-s1';
export function layout(width,height){const scale=Math.min(width/1000,height/1000);return {scale,x:(width-scale*1000)/2,y:(height-scale*1000)/2};}
const PALETTES={
 dawn:{far:'#c2d8d6',mountain:'#9ebfbe',ridge:'#7fa4aa',snow:'#fff9eb',edge:'#b5d5d4',ink:'#345663',tree:'#608681',window:'#ebc589',pond:'#a8cbd0',roof:'#758e8a'},
 dusk:{far:'#d7c7c1',mountain:'#b4adbb',ridge:'#8d929f',snow:'#fff0db',edge:'#c9cbd0',ink:'#4b5665',tree:'#687d78',window:'#f4bf71',pond:'#a0b7c5',roof:'#897f80'},
 night:{far:'#405f70',mountain:'#395b6a',ridge:'#305361',snow:'#b6cdd0',edge:'#6c99a6',ink:'#263e50',tree:'#355960',window:'#f6ca7c',pond:'#517e96',roof:'#456774'}
};
export function paintScene(ctx,width,height,options={},art=createArt(ctx)){
 const {scale,x:ox,y:oy}=layout(width,height),phase=options.phase||'dawn',p=PALETTES[phase],time=options.time||0,daily=options.daily||dailyScene(),bird=options.bird||{x:435,y:680,walking:false},night=phase==='night';
 if(options.clear!==false)ctx.clearRect(0,0,width,height);ctx.save();ctx.translate(ox,oy);ctx.scale(scale,scale);ctx.lineCap='round';ctx.lineJoin='round';
 const shape=(fn,fill,stroke=null,line=3)=>{ctx.beginPath();fn(ctx);if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=line;ctx.stroke();}};
 const ellipse=(x,y,a,b,fill,stroke=null,line=3)=>shape(c=>c.ellipse(x,y,a,b,0,0,Math.PI*2),fill,stroke,line);
 const line=(fn,color=p.ink,w=3)=>shape(fn,null,color,w);
 const rect=(x,y,w,h,fill,r=0,stroke=null)=>shape(c=>c.roundRect(x,y,w,h,r),fill,stroke);
 function tree(x,y,s=1){ctx.save();ctx.translate(x,y);ctx.scale(s,s);line(c=>{c.moveTo(0,-90);c.lineTo(0,6);},'#8a8071',7);shape(c=>{c.moveTo(0,-142);c.lineTo(-35,-88);c.lineTo(-19,-93);c.lineTo(-49,-45);c.lineTo(-27,-49);c.lineTo(-61,-3);c.quadraticCurveTo(0,17,61,-3);c.lineTo(27,-49);c.lineTo(49,-45);c.lineTo(19,-93);c.lineTo(35,-88);c.closePath();},p.tree);for(let z of [-125,-83,-39])shape(c=>{c.moveTo(0,z-17);c.lineTo(-22,z+15);c.quadraticCurveTo(-3,z+9,12,z+15);c.lineTo(23,z+12);c.closePath();},p.snow);ctx.restore();}
 function mountain(points,fill){shape(c=>{c.moveTo(points[0][0],500);for(const [x,y] of points)c.lineTo(x,y);c.lineTo(points.at(-1)[0],500);c.closePath();},fill);}
 if(night){for(let i=0;i<30;i++){const x=(i*137+daily.seed%90)%1000,y=80+(i*53)%270;ctx.globalAlpha=.35+.4*Math.sin(i+time*.3)**2;ellipse(x,y,i%4===0?2.5:1.5,i%4===0?2.5:1.5,'#fff1cb');}ctx.globalAlpha=1;ellipse(215,160,34,34,'#f2e1ad');ellipse(228,150,31,31,'#283f4a');}else{ellipse(210,170,39,39,phase==='dusk'?'#f1c18b':'#f7e4ae');}
 for(let i=0;i<4;i++){const cx=(i*260+time*2)%1200-100;ctx.globalAlpha=night?.12:.55;ellipse(cx,230+i%2*60,72,14,'#fff9e8');ellipse(cx+30,225+i%2*60,45,20,'#fff9e8');}ctx.globalAlpha=1;
 mountain([[-60,420],[145,245],[225,310],[380,140],[510,275],[635,190],[850,340],[1030,245]],p.far);
 mountain([[-30,490],[210,340],[345,410],[505,275],[640,385],[790,255],[1040,470]],p.mountain);
 shape(c=>{c.moveTo(283,250);c.lineTo(380,140);c.lineTo(477,240);c.lineTo(416,216);c.lineTo(383,231);c.lineTo(351,209);c.closePath();},night?'#a4bdc3':'#fbf5e9');
 shape(c=>{c.moveTo(716,335);c.lineTo(790,255);c.lineTo(865,332);c.lineTo(819,315);c.lineTo(788,325);c.lineTo(767,307);c.closePath();},night?'#a4bdc3':'#fbf5e9');
 for(let i=0;i<13;i++)tree(30+i*80,490+Math.sin(i*1.7)*30,.5+i%3*.08);
 // The distant trail is painted into the mountains, above the island.
 line(c=>{c.moveTo(515,580);c.bezierCurveTo(675,540,610,440,755,350);},p.snow,43);
 line(c=>{c.moveTo(515,580);c.bezierCurveTo(675,540,610,440,755,350);},p.edge,2);
 ellipse(500,799,466,171,night?'#233b4933':'#527c8520');
 const contour=(c,dy=0)=>{c.moveTo(63,584+dy);c.bezierCurveTo(182,452+dy,426,420+dy,636,455+dy);c.bezierCurveTo(826,467+dy,1030,622+dy,966,786+dy);c.bezierCurveTo(963,940+dy,637,985+dy,357,955+dy);c.bezierCurveTo(114,948+dy,-35,837+dy,32,700+dy);c.closePath();};
 shape(c=>contour(c,23),p.edge,p.ink,3);shape(c=>contour(c),p.snow,p.ink,3);
 for(let i=0;i<20;i++){const x=80+i*43,y=815+Math.sin(i*1.8)*92;if(x>230&&x<440)continue;line(c=>{c.moveTo(x,y);c.quadraticCurveTo(x+15,y-6,x+33,y);},night?'#90b5bc':'#dbe5d8',2);}
 // Frozen inlet and a small timber footbridge.
 ellipse(295,815,137,62,p.pond,p.edge,4);shape(c=>{c.moveTo(164,812);c.quadraticCurveTo(282,746,420,812);c.quadraticCurveTo(307,773,164,812);},p.snow);
 for(let i=0;i<4;i++)line(c=>{c.moveTo(230+i*35,792+i%2*16);c.lineTo(249+i*35,805+i%2*16);},night?'#a2bdc9':'#e5efe5',2);
 line(c=>{c.moveTo(372,769);c.lineTo(452,805);},'#9c8062',35);for(let i=0;i<7;i++)line(c=>{c.moveTo(374+i*12,753+i*5);c.lineTo(363+i*12,780+i*5);},p.ink,2);
 for(const dy of [-17,17]){line(c=>{c.moveTo(365,770+dy);c.lineTo(448,807+dy);},p.ink,4);for(let i=0;i<3;i++)line(c=>{c.moveTo(374+i*32,771+i*14+dy);c.lineTo(374+i*32,744+i*14+dy);},p.ink,4);}
 // A continuous path connects the doors, plaza and mountain departure.
 line(c=>{c.moveTo(260,589);c.bezierCurveTo(355,610,354,695,478,690);c.bezierCurveTo(579,680,629,704,740,674);},night?'#97b6bd':'#e6e7d5',35);
 line(c=>{c.moveTo(478,690);c.bezierCurveTo(525,632,570,589,590,550);},night?'#97b6bd':'#e6e7d5',26);
 for(let i=0;i<12;i++){const x=300+i*30,y=633+Math.sin(i*.34)*39;ellipse(x,y,2.5,5,night?'#789ba9':'#b8c9bf');ellipse(x+7,y-8,2.5,5,night?'#789ba9':'#b8c9bf');}
 tree(95,620,.84);tree(400,505,.7);tree(905,705,1.05);tree(865,510,.8);tree(83,785,.67);tree(930,851,.65);
 function house(x,y,s,post=false){ctx.save();ctx.translate(x,y);ctx.scale(s,s);
 ellipse(0,8,128,24,night?'#1c374755':'#76959422');
 rect(-90,-123,180,122,post?'#b97c63':'#b39272',6,p.ink);
 for(let yy=-106;yy<-6;yy+=19)line(c=>{c.moveTo(-85,yy);c.lineTo(85,yy);},post?'#9d6858':'#967958',2);
 shape(c=>{c.moveTo(-117,-114);c.lineTo(-5,-207);c.lineTo(116,-116);c.lineTo(96,-100);c.lineTo(-3,-178);c.lineTo(-98,-100);c.closePath();},p.roof,p.ink,4);
 shape(c=>{c.moveTo(-117,-118);c.lineTo(-5,-207);c.lineTo(116,-119);c.quadraticCurveTo(106,-110,91,-123);c.lineTo(-5,-186);c.lineTo(-94,-116);c.quadraticCurveTo(-108,-107,-117,-118);},p.snow,p.ink,3);
 rect(51,-219,24,62,'#987c71',3,p.ink);rect(47,-222,32,10,p.snow,3,p.ink);
 for(let i=0;i<3;i++){ctx.globalAlpha=(1-i*.25)*.3;ellipse(60+Math.sin(time*.6+i)*13,-241-i*25-((time*8)%25),10+i*4,14+i*7,night?'#b3c9cd':'#fff9ed');}ctx.globalAlpha=1;
 rect(-19,-80,44,80,'#536e6c',5,p.ink);rect(-12,-70,30,36,p.window,4,p.ink);ellipse(16,-25,2.5,2.5,'#efd5a2');
 for(const wx of [-60,61]){rect(wx-19,-94,38,42,p.window,4,p.ink);line(c=>{c.moveTo(wx,-93);c.lineTo(wx,-53);c.moveTo(wx-17,-73);c.lineTo(wx+17,-73);},p.ink,3);rect(wx-25,-51,50,9,p.snow,4,p.ink);}
 rect(-31,-12,66,13,p.snow,4,p.ink);
 if(post){rect(-70,-153,140,27,'#fff0cc',4,p.ink);ctx.fillStyle=p.ink;ctx.font='15px serif';ctx.textAlign='center';ctx.fillText('山 间 邮 局',0,-134);ctx.textAlign='start';
 rect(121,-63,34,53,'#b56552',7,p.ink);line(c=>{c.moveTo(138,-9);c.lineTo(138,10);},p.ink,5);line(c=>{c.moveTo(127,-44);c.lineTo(148,-44);},'#fff4dc',3);rect(118,-66,40,9,p.snow,4,p.ink);
 }else{line(c=>{c.moveTo(-62,-17);c.lineTo(-62,5);c.moveTo(-99,-17);c.lineTo(-99,5);c.moveTo(-110,-20);c.lineTo(-48,-20);},p.ink,5);rect(-113,-28,70,9,'#8d785e',3,p.ink);}
 ctx.restore();}
 house(235,565,1.03);house(735,650,.83,true);
 // Departure gate and little flags.
 for(const xx of [715,798]){line(c=>{c.moveTo(xx,365);c.lineTo(xx,283);},'#8f856f',7);ellipse(xx,365,12,5,p.snow);}
 rect(701,276,111,37,'#557c7f',7,p.ink);rect(698,271,117,9,p.snow,4,p.ink);
 ctx.fillStyle='#fff5dd';ctx.font='17px serif';ctx.textAlign='center';ctx.fillText('灯 塔  →',757,301);ctx.textAlign='start';
 for(let i=0;i<4;i++){const x=620+i*27,y=410-i*25;line(c=>{c.moveTo(x,y);c.lineTo(x,y-33);},p.ink,2);shape(c=>{c.moveTo(x,y-33);c.lineTo(x+16,y-26);c.lineTo(x,y-17);c.closePath();},i%2?'#c97a64':'#d4b57c',p.ink,1.5);}
 // Fire bowl, logs and a lantern, all grounded in the plaza.
 ellipse(490,667,26,12,'#a49e8b',p.ink,2);line(c=>{c.moveTo(470,664);c.lineTo(510,672);c.moveTo(475,677);c.lineTo(506,662);},'#8b6b51',6);
 shape(c=>{c.moveTo(476,661);c.quadraticCurveTo(473,645,488,629+Math.sin(time*3)*3);c.quadraticCurveTo(488,644,497,644);c.quadraticCurveTo(509,631,506,655);c.quadraticCurveTo(502,674,476,661);},'#d99159');
 shape(c=>{c.moveTo(486,661);c.quadraticCurveTo(480,650,491,643);c.quadraticCurveTo(501,654,496,663);},'#f4cf7d');
 line(c=>{c.moveTo(557,665);c.lineTo(557,578);c.quadraticCurveTo(552,566,542,576);},p.ink,4);rect(529,578,26,34,p.window,5,p.ink);rect(524,574,35,8,p.roof,2,p.ink);
 for(const track of options.tracks||[]){ctx.globalAlpha=track.life*.4;ellipse(track.x,track.y,3,5,p.ink);}ctx.globalAlpha=1;
 ctx.save();ctx.translate(bird.x,bird.y);ctx.scale(.53,.53);if(options.facing<0)ctx.scale(-1,1);art.set({grounded:true,speed:bird.walking?90:0,scarf:'#c57560',boardColor:'#4e898b',airTime:0},time);art.bird(0,bird.walking?Math.sin(time*11)*2:0,0);ctx.restore();
 // A snow fox rests near the lake; it is a visitor, not a forced pickup.
 ctx.save();ctx.translate(575,833);ctx.scale(.37,.37);art.set({grounded:false},time);art.mount('fox',0,0);ctx.restore();
 if(options.arrival>0){ctx.globalAlpha=Math.min(1,options.arrival);ctx.fillStyle=p.ink;ctx.font='18px serif';ctx.textAlign='center';ctx.fillText('回来了，炉火还暖着。',450,727);ctx.textAlign='start';ctx.globalAlpha=1;}
 if(daily.weather==='细雪')for(let i=0;i<38;i++){let sx=(i*73+Math.sin(time*.3+i)*15)%1000,sy=(i*119+time*13)%850+80;ctx.globalAlpha=.35+(i%3)*.12;ellipse(sx,sy,2+i%2,2+i%2,night?'#d7e7e8':'#fffdf0');}ctx.globalAlpha=1;
 ctx.restore();return layout(width,height);
}
export function createWorld(canvas,onLayout){
 const ctx=canvas.getContext('2d'),art=createArt(ctx),reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 let width=390,height=450,ratio=1,scene={phase:'dawn',daily:dailyScene()},bird={x:435,y:680,walking:false},target={x:435,y:680},tracks=[],last=0,clock=0,raf=0,visible=true,arrival=0,facing=1;
 function resize(){const rect=canvas.getBoundingClientRect();width=rect.width;height=rect.height;ratio=Math.min(devicePixelRatio||1,1.7);canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);onLayout?.(layout(width,height));draw();}
 function draw(){ctx.setTransform(ratio,0,0,ratio,0,0);paintScene(ctx,width,height,{...scene,time:clock,bird,tracks,arrival,facing},art);}
 function frame(now){raf=0;if(!visible||document.hidden)return;let dt=last?Math.min(.05,(now-last)/1000):0;last=now;clock+=dt;
 const dx=target.x-bird.x,dy=target.y-bird.y,d=Math.hypot(dx,dy);bird.walking=d>3;if(bird.walking){const step=Math.min(d,dt*130);bird.x+=dx/d*step;bird.y+=dy/d*step;facing=dx<0?-1:1;if(!reduced&&Math.floor(clock*5)!==Math.floor((clock-dt)*5))tracks.push({x:bird.x,y:bird.y,life:1});}
 tracks=tracks.map(t=>({...t,life:t.life-dt*.025})).filter(t=>t.life>0).slice(-65);arrival=Math.max(0,arrival-dt*.08);draw();if(!reduced||bird.walking||arrival>0)raf=requestAnimationFrame(frame);
 }
 function wake(){if(visible&&!document.hidden&&!raf){last=0;raf=requestAnimationFrame(frame);}}
 canvas.addEventListener('click',e=>{const r=canvas.getBoundingClientRect(),m=layout(width,height);target={x:Math.max(110,Math.min(890,(e.clientX-r.left-m.x)/m.scale)),y:Math.max(570,Math.min(880,(e.clientY-r.top-m.y)/m.scale))};wake();});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){if(raf)cancelAnimationFrame(raf);raf=0;}else wake();});
 const observer=new ResizeObserver(resize);observer.observe(canvas);wake();
 return {set(next){scene={...scene,...next};draw();wake();},move(x,y){target={x,y};wake();},arrive(){arrival=1;target={x:435,y:680};wake();},setVisible(value){visible=value;if(!value){cancelAnimationFrame(raf);raf=0;}else wake();},resize};
}
export function paintPostcard(canvas,card){
 const ctx=canvas.getContext('2d');canvas.width=1200;canvas.height=800;ctx.fillStyle='#fff8e6';ctx.fillRect(0,0,1200,800);
 ctx.save();ctx.beginPath();ctx.roundRect(30,30,1140,465,20);ctx.clip();ctx.fillStyle={dawn:'#edf3eb',dusk:'#f1e8d8',night:'#283f4a'}[card.phase]||'#edf3eb';ctx.fillRect(30,30,1140,465);ctx.translate(100,-65);paintScene(ctx,1000,650,{phase:card.phase,daily:dailyScene(card.day),bird:{x:435,y:680},time:0,clear:false});ctx.restore();
 ctx.strokeStyle='#b8c7bb';ctx.lineWidth=2;ctx.strokeRect(30,30,1140,465);
 ctx.fillStyle='#607b7b';ctx.font='16px sans-serif';ctx.fillText('PELICAN  /  SNOWBOUND STATION',55,536);ctx.textAlign='right';ctx.fillText(card.day,1144,536);ctx.textAlign='start';
 ctx.fillStyle='#35545e';ctx.font='26px serif';const chars=Array.from((card.text||'今天，也在这里停留了一会儿。').replace(/\s+/g,' '));let line='',lines=[],limit=1080;for(let c of chars){if(c==='\n'||ctx.measureText(line+c).width>limit){lines.push(line);line=c==='\n'?'':c;}else line+=c;}if(line)lines.push(line);lines.slice(0,5).forEach((text,i)=>ctx.fillText(text,56,590+i*36));
 ctx.fillStyle='#ac8063';ctx.font='17px serif';ctx.fillText('一张留给自己的明信片',55,765);ctx.textAlign='right';ctx.fillText(card.source==='walk'?dailyScene(card.day).stamp:'寄存在雪境的片刻',1140,765);ctx.textAlign='start';return canvas;
}
