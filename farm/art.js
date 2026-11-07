import {CROPS,crop,growth,ready} from './model.js?v=20261107a';
const INK='#40584b';
function ellipse(c,x,y,rx,ry,fill,stroke=null){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.lineWidth=2;c.strokeStyle=stroke;c.stroke();}}
function path(c,points,fill,stroke=null){c.beginPath();for(let i=0;i<points.length;i++)c[i?'lineTo':'moveTo'](...points[i]);c.closePath();if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.lineWidth=2;c.strokeStyle=stroke;c.stroke();}}
function line(c,x,y,x2,y2,color=INK,width=2){c.beginPath();c.moveTo(x,y);c.lineTo(x2,y2);c.strokeStyle=color;c.lineWidth=width;c.stroke();}
function leaf(c,x,y,a,scale=1){c.save();c.translate(x,y);c.rotate(a);ellipse(c,0,-11*scale,7*scale,15*scale,'#719564');line(c,0,0,0,-24*scale,'#527851',1.5);c.restore();}
function star(c,x,y,r,color){let pts=[];for(let i=0;i<8;i++){let a=i*Math.PI/4;pts.push([x+Math.cos(a)*(i%2?r*.3:r),y+Math.sin(a)*(i%2?r*.3:r)]);}path(c,pts,color);}
export function plantArt(c,id,x,y,size=1,stage=3,variant=0,t=0){c.save();c.translate(x,y);c.scale(size*(variant===2?1.25:1),size*(variant===2?1.25:1));c.rotate(Math.sin(t*1.5+x)*.025);c.lineWidth=1.6;
 if(stage===0){line(c,0,2,0,-17,'#58835a',2);leaf(c,-1,-8,-.85,.55);leaf(c,1,-10,.85,.55);c.restore();return;}
 const grow=stage===1?.65:stage===2?.85:1;c.scale(grow,grow);let color=variant===1?'#e4bc54':crop(id).color;
 if(id==='radish'){path(c,[[-15,-13],[-17,0],[-10,16],[0,26],[9,16],[17,0],[14,-13]],color,INK);ellipse(c,-1,-12,15,8,'#f3ded1',INK);leaf(c,0,-17,-.6);leaf(c,0,-17,.6);leaf(c,0,-20,0,.8);line(c,0,25,3,32,'#b99b79',1.5);}
 if(id==='wheat'){for(let k=-1;k<=1;k++){c.save();c.translate(k*12,0);c.rotate(k*.18);line(c,0,12,0,-45,'#8d9762',2);for(let j=0;j<4;j++){ellipse(c,-5,-16-j*8,6,4,color,INK);ellipse(c,5,-20-j*8,6,4,color,INK);}line(c,0,-42,0,-55,'#b59c56',1);c.restore();}}
 if(id==='berry'){leaf(c,0,-14,-.7);leaf(c,0,-14,.7);path(c,[[-18,-11],[-20,0],[-14,12],[0,27],[14,12],[20,0],[18,-11],[0,-18]],color,INK);for(let i=0;i<7;i++)ellipse(c,((i*13)%27)-13,-5+Math.floor(i/3)*9,1.5,2,'#ffebbc');path(c,[[-17,-10],[-7,-17],[0,-12],[8,-19],[17,-11],[7,-8],[0,-4],[-6,-9]],'#668952',INK);}
 if(id==='tomato'){line(c,0,12,0,-45,'#61885a',3);leaf(c,0,-32,.8,.8);leaf(c,0,-25,-.8,.9);for(let k=-1;k<=1;k++){ellipse(c,k*14,-4+(k===0?14:0),15,15,color,INK);path(c,[[k*14-8,-16+(k===0?14:0)],[k*14,-20+(k===0?14:0)],[k*14+8,-16+(k===0?14:0)],[k*14,-12+(k===0?14:0)]],'#5d8550');}}
 if(id==='pumpkin'){line(c,0,-17,4,-33,'#668257',6);leaf(c,2,-29,.8,.7);ellipse(c,0,1,29,23,color,INK);ellipse(c,0,1,17,23,null,'#a77741');ellipse(c,0,1,6,23,null,'#a77741');ellipse(c,-12,-8,7,4,'#f2c577');}
 if(id==='moon'){line(c,0,20,0,-23,'#68875c',3);leaf(c,0,8,-.9,.8);leaf(c,0,13,.9,.8);for(let i=0;i<5;i++){let a=i*Math.PI*2/5;c.save();c.translate(Math.sin(a)*14,-27+Math.cos(a)*14);c.rotate(-a);ellipse(c,0,0,9,16,variant===1?color:'#c1b5df',INK);c.restore();}ellipse(c,0,-27,8,8,'#f3d68a',INK);}
 if(variant===3){star(c,-28,-22,6,'#fff6ce');star(c,25,-39,7,'#fff6ce');star(c,19,13,4,'#eee8ff');}c.restore();}
export function drawIcon(canvas,id,variant=0){canvas.width=100;canvas.height=100;let c=canvas.getContext('2d');c.clearRect(0,0,100,100);plantArt(c,id,50,61,.93,3,variant);}
export const POSITIONS=Array.from({length:12},(_,i)=>({x:144+(i%3)*216,y:309+Math.floor(i/3)*103}));
export function createScene(canvas){const c=canvas.getContext('2d');let w=720,h=760,effects=[];
 function resize(){let d=Math.min(2,devicePixelRatio||1);canvas.width=w*d;canvas.height=h*d;c.setTransform(d,0,0,d,0,0);}
 function house(x,y){c.save();c.translate(x,y);ellipse(c,0,49,103,20,'#6c88674a');path(c,[[-72,-22],[67,-22],[67,47],[-72,47]],'#f6e6bc',INK);path(c,[[-91,-20],[-5,-81],[86,-20]],'#bd7859',INK);path(c,[[-5,-81],[86,-20],[68,-14],[-5,-66],[-70,-14],[-91,-20]],'#d39370',INK);c.fillStyle='#76917b';c.fillRect(-10,2,27,45);c.strokeStyle=INK;c.strokeRect(-10,2,27,45);c.fillStyle='#abc5b1';c.fillRect(-52,-4,28,25);c.strokeRect(-52,-4,28,25);line(c,-38,-4,-38,21);line(c,-52,8,-24,8);c.fillStyle='#8d6e55';c.fillRect(-58,25,40,8);for(let i=0;i<4;i++)ellipse(c,-53+i*10,22,5,7,'#7f9c66');c.fillStyle='#ebbc6c';c.fillRect(21,-45,18,6);line(c,30,-45,30,-75,'#6c7e62',3);path(c,[[31,-75],[55,-70],[31,-61]],'#e8c167');c.restore();}
 function mill(x,y,t,built){c.save();c.translate(x,y);path(c,[[-21,60],[21,60],[13,-22],[-10,-22]],built?'#e9d8b7':'#93a88a',INK);path(c,[[-25,-20],[1,-43],[26,-20]],built?'#ad775b':'#7f977a',INK);c.save();c.translate(0,-12);c.rotate(built?t*.6:.5);for(let i=0;i<4;i++){c.rotate(Math.PI/2);path(c,[[5,-4],[63,-13],[67,1],[5,4]],built?'#f4e5bd':'#b7c4a2',INK);for(let j=16;j<58;j+=12)line(c,j,-7,j,1,'#9a9e7b',1);}ellipse(c,0,0,6,6,'#b87d58',INK);c.restore();c.restore();}
 function render(s,now,t,reduced=false){
 c.clearRect(0,0,w,h);c.fillStyle='#e8eedb';c.fillRect(0,0,w,h);ellipse(c,570,50,45,45,'#f2d694');path(c,[[0,160],[80,82],[147,122],[225,64],[310,150],[430,83],[560,141],[650,83],[720,140],[720,240],[0,240]],'#c5d5bc');path(c,[[0,174],[120,147],[220,185],[370,120],[470,165],[600,136],[720,174],[720,300],[0,300]],'#a9c1a2');
 ellipse(c,365,498,440,333,'#9fb88b');ellipse(c,377,480,417,311,'#b6c99a');ellipse(c,360,505,365,261,'#bdce9f');
 // Winding garden path and small foreground details.
 c.beginPath();c.moveTo(493,205);c.bezierCurveTo(410,237,407,250,395,285);c.strokeStyle='#e3d4aa';c.lineWidth=39;c.stroke();
 c.beginPath();c.moveTo(53,708);c.quadraticCurveTo(345,756,675,700);c.strokeStyle='#d9cea6';c.lineWidth=24;c.stroke();
 house(520,185);mill(132,162,reduced?0:t,s.buildings.mill);
 for(let i=0;i<13;i++){let x=27+i*55,y=256+Math.sin(i)*9;line(c,x,y,x,y-22,'#f2e4be',5);if(i)line(c,x-55,247+Math.sin(i-1)*9,x,247+Math.sin(i)*9,'#f2e4be',4);}
 if(s.buildings.bath){ellipse(c,654,209,34,12,'#617b79',INK);line(c,654,211,654,243,'#7a9482',13);ellipse(c,654,201,36,12,'#bac8b3',INK);ellipse(c,654,199,27,7,'#9ac5bd');ellipse(c,674,186,8,6,'#dba66d');path(c,[[680,183],[689,185],[681,189]],'#bb8052');}
 if(s.buildings.house){c.save();c.translate(31,75);path(c,[[0,70],[0,4],[54,-21],[106,4],[106,70]],'#d6e6ce',INK);for(let i=18;i<105;i+=22)line(c,i,4,i,70,'#8fa789',2);line(c,0,31,106,31,'#8fa789',2);path(c,[[0,4],[54,-21],[106,4],[106,12],[54,-12],[0,12]],'#adc6ad',INK);c.restore();}
 for(let i=0;i<12;i++){let {x,y}=POSITIONS[i],p=s.plots[i],locked=i>=s.plotCount;ellipse(c,x,y+20,96,30,'#718a6b33');
 if(locked){ellipse(c,x,y,83,28,'#9eb68d');for(let j=-1;j<=1;j++){leaf(c,x+j*27,y,-.25+j*.4,.7);}continue;}
 path(c,[[x-94,y-31],[x+78,y-31],[x+94,y+9],[x+80,y+30],[x-80,y+30],[x-94,y+9]],'#a9895e',INK);path(c,[[x-86,y-29],[x+74,y-29],[x+86,y+6],[x+73,y+19],[x-74,y+19],[x-86,y+5]],'#8b6950');
 for(let k=-1;k<=1;k++)line(c,x-65,y+k*10,x+65,y+k*10,'#a27d59',2);
 if(p){let g=growth(s,p,now),st=g<.18?0:g<.5?1:g<.83?2:3,v=g>=.65?p.variant:0;for(let j=-1;j<=1;j++)plantArt(c,p.id,x+j*46,y-15+(Math.abs(j)?2:0),.9,st,v,reduced?0:t+j);if(p.watered){for(let j=0;j<3;j++)ellipse(c,x-70+j*60,y+4,3,2,'#92bbb5');}if(ready(s,p,now)){star(c,x+75,y-60,5+Math.sin(t*3)*1.5,'#fff7c9');}}
 else{for(let j=-1;j<=1;j++)ellipse(c,x+j*48,y-7,4,2,'#705840');}
 }
 for(let i=0;i<22;i++){let x=18+(i*109)%690,y=282+(i*79)%410;if(x>55&&x<665)continue;line(c,x,y,x+3,y-9,'#7a986c',2);ellipse(c,x,y-9,3,3,i%3?'#e9dca5':'#e5b99d');}
 for(let i=0;i<5;i++){let x=82+i*139;line(c,x,724,x+10,720,'#a6ae83',2);ellipse(c,x+4,717,4,3,'#f0e6ba');}
 effects=effects.filter(e=>now-e.start<1000);for(let e of effects){let a=(now-e.start)/1000;c.globalAlpha=1-a;c.font='bold 23px system-ui';c.textAlign='center';c.fillStyle=e.kind==='water'?'#d7f6ef':'#fff6c6';c.fillText(e.text,e.x,e.y-40-a*50);c.globalAlpha=1;}
 }
 resize();return {resize,render,pop(i,text,kind,now){let p=POSITIONS[i];if(p)effects.push({x:p.x,y:p.y,text,kind,start:now});}};
}
