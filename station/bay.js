import {createArt} from '../journey/art.js?v=20261031-s2';
import {layout} from './layout.js?v=20261031-s2';
export function paintBay(ctx,width,height,options={},art=createArt(ctx)){
 const m=layout(width,height),phase=options.phase||'dusk',night=phase==='night',t=options.time||0,lit=!!options.bay?.lit;
 const p=night?{sea:'#365d72',foam:'#83b3bb',rock:'#426370',land:'#8caaa9',snow:'#bdced0',far:'#456270',ink:'#263f50',sky:'#283f4a'}:phase==='dusk'?{sea:'#8baab9',foam:'#d9dfcb',rock:'#7f929e',land:'#d4c8af',snow:'#fff0db',far:'#c7bdbe',ink:'#465663',sky:'#f1e8d8'}:{sea:'#90bfc6',foam:'#edf0db',rock:'#89a6aa',land:'#d9ddc4',snow:'#fff8e9',far:'#b8d3ce',ink:'#345663',sky:'#edf3eb'};
 if(options.clear!==false)ctx.clearRect(0,0,width,height);ctx.save();ctx.translate(m.x,m.y);ctx.scale(m.scale,m.scale);ctx.lineJoin='round';ctx.lineCap='round';
 const shape=(fn,fill,stroke=null,w=3)=>{ctx.beginPath();fn(ctx);if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=w;ctx.stroke();}};
 const line=(fn,color=p.ink,w=3)=>shape(fn,null,color,w);
 const ellipse=(x,y,rx,ry,color,stroke=null,w=3)=>shape(c=>c.ellipse(x,y,rx,ry,0,0,Math.PI*2),color,stroke,w);
 const rect=(x,y,w,h,color,r=0,stroke=null)=>shape(c=>c.roundRect(x,y,w,h,r),color,stroke);
 // A broad sea horizon and low islands give the bay a different silhouette.
 shape(c=>{c.moveTo(35,405);c.quadraticCurveTo(140,355,245,390);c.lineTo(310,368);c.quadraticCurveTo(440,350,560,408);c.lineTo(950,408);c.lineTo(950,460);c.lineTo(35,460);},p.far);
 ellipse(235,235,38,38,night?'#efdfb2':phase==='dusk'?'#eec08c':'#f3df9e');if(night)ellipse(249,223,34,34,p.sky);
 if(night)for(let i=0;i<25;i++)ellipse(70+i*37,(i*61)%260+95,i%4===0?2:1.4,i%4===0?2:1.4,'#dce1c4');
 for(let i=0;i<3;i++){ctx.globalAlpha=night?.1:.55;ellipse(150+i*290+Math.sin(t*.04)*15,295+i%2*30,80,12,p.snow);}ctx.globalAlpha=1;
 shape(c=>{c.moveTo(35,445);c.quadraticCurveTo(450,420,950,450);c.lineTo(980,810);c.quadraticCurveTo(760,970,380,945);c.quadraticCurveTo(80,940,25,800);c.closePath();},p.sea);
 for(let row=0;row<11;row++)for(let col=0;col<4;col++){const x=45+col*210+Math.sin(t*.3+row)*10,y=478+row*34;line(c=>{c.moveTo(x,y);c.quadraticCurveTo(x+38,y-5,x+83,y);},row%3===0?p.foam:night?'#547f91':'#b1cfd0',row%3===0?2.2:1.5);}
 // Tide rocks, shore and snowy headland.
 for(let i=0;i<5;i++)ellipse(340+i*52,821-i*34,27,11,p.rock,p.ink,2);
 const coast=(c,dy=0)=>{c.moveTo(715,411+dy);c.bezierCurveTo(914,440+dy,996,614+dy,960,838+dy);c.quadraticCurveTo(942,968+dy,639,963+dy);c.quadraticCurveTo(475,947+dy,420,846+dy);c.bezierCurveTo(432,757+dy,547,696+dy,568,584+dy);c.quadraticCurveTo(605,454+dy,715,411+dy);c.closePath();};
 shape(c=>coast(c,21),p.rock,p.ink,3);shape(c=>coast(c),p.land,p.ink,3);
 shape(c=>{c.moveTo(718,420);c.bezierCurveTo(858,437,962,555,961,723);c.quadraticCurveTo(912,690,873,704);c.bezierCurveTo(819,659,760,674,705,636);c.quadraticCurveTo(615,643,584,608);c.quadraticCurveTo(598,463,718,420);},p.snow);
 for(let i=0;i<6;i++)line(c=>{let x=590+i*48,y=830+Math.sin(i)*35;c.moveTo(x,y);c.quadraticCurveTo(x+15,y-7,x+33,y);},night?'#b1c2b7':'#b2c1a6',2);
 // Curving stone stairway from the quay to the lantern room.
 line(c=>{c.moveTo(590,821);c.bezierCurveTo(645,758,679,726,725,636);},night?'#b6c9c4':'#eee8d2',33);
 for(let i=0;i<8;i++){const x=604+i*16,y=798-i*21;line(c=>{c.moveTo(x-12,y-4);c.lineTo(x+14,y+8);},p.rock,2);}
 // Timber pier and moored rowing boat, with actual material details.
 shape(c=>{c.moveTo(248,713);c.lineTo(523,745);c.lineTo(517,789);c.lineTo(240,758);c.closePath();},'#ab8765',p.ink,3);
 for(let i=0;i<19;i++)line(c=>{let x=250+i*14;c.moveTo(x,714+(x-250)*.116);c.lineTo(x-5,758+(x-250)*.116);},'#6e6a5c',1.8);
 for(const x of [265,380,499]){line(c=>{c.moveTo(x,744+(x-250)*.116);c.lineTo(x,799+(x-250)*.116);},p.ink,7);rect(x-8,698+(x-250)*.116,16,36,'#8e826d',3,p.ink);}
 ctx.save();ctx.translate(287,823+Math.sin(t*.7)*3);ctx.rotate(-.14);shape(c=>{c.moveTo(-76,-10);c.quadraticCurveTo(0,15,78,-10);c.quadraticCurveTo(59,33,-13,34);c.quadraticCurveTo(-60,28,-76,-10);},'#bc795e',p.ink,3);ellipse(0,-6,73,17,'#6d8a8c',p.ink,3);for(const x of [-32,19])rect(x,-17,17,31,'#c8a47b',2,p.ink);line(c=>{c.moveTo(-64,-11);c.lineTo(54,20);},'#e7c995',4);ctx.restore();
 line(c=>{c.moveTo(304,817);c.quadraticCurveTo(331,781,380,755);},'#d5bc92',2);
 // Keeper's shed, weather vane and a red lifesaver.
 rect(469,668,109,91,'#b48c70',4,p.ink);for(let y=681;y<756;y+=15)line(c=>{c.moveTo(472,y);c.lineTo(575,y);},'#95785f',2);
 shape(c=>{c.moveTo(454,674);c.lineTo(520,612);c.lineTo(592,676);c.closePath();},'#6f8889',p.ink,4);shape(c=>{c.moveTo(454,674);c.lineTo(520,612);c.lineTo(592,676);c.lineTo(575,674);c.lineTo(519,628);c.lineTo(471,674);},p.snow,p.ink,2);
 rect(507,705,29,54,'#486c70',3,p.ink);rect(548,691,21,27,night?'#efcb87':'#eed8ab',3,p.ink);ellipse(485,717,13,13,'#bd725f',p.ink,2);ellipse(485,717,7,7,p.snow,p.ink,1.5);
 line(c=>{c.moveTo(520,611);c.lineTo(520,585);c.moveTo(504,590);c.lineTo(541,590);},p.ink,2);shape(c=>{c.moveTo(541,585);c.lineTo(550,590);c.lineTo(541,595);},'#c68e62');
 // Lighthouse masonry, copper balcony and lantern optics.
 ellipse(748,639,84,21,p.rock,p.ink,3);
 shape(c=>{c.moveTo(686,624);c.lineTo(714,386);c.lineTo(782,386);c.lineTo(810,624);c.quadraticCurveTo(748,651,686,624);},p.snow,p.ink,4);
 for(let i=0;i<3;i++){let y=433+i*65,w=77+i*14;shape(c=>{c.moveTo(748-w/2,y);c.lineTo(748+w/2,y);c.lineTo(748+w/2+3,y+21);c.quadraticCurveTo(748,y+32,748-w/2-3,y+21);c.closePath();},night?'#8f7473':'#c78672');}
 rect(735,571,27,59,'#43606b',12,p.ink);for(const y of [415,486,550]){rect(740,y,15,23,'#5a8190',7,p.ink);line(c=>{c.moveTo(747,y+3);c.lineTo(747,y+19);},p.ink,2);}
 rect(705,375,86,20,'#ac8a67',4,p.ink);rect(713,329,70,47,lit?'#f4d493':'#7c9ba6',4,p.ink);
 for(const x of [718,735,758,778])line(c=>{c.moveTo(x,331);c.lineTo(x,373);},p.ink,3);
 shape(c=>{c.moveTo(700,331);c.lineTo(747,292);c.lineTo(793,331);c.closePath();},'#9a7d6a',p.ink,4);
 line(c=>{c.moveTo(747,293);c.lineTo(747,275);},p.ink,3);ellipse(747,273,4,4,'#d2b47b',p.ink,2);
 line(c=>{c.moveTo(695,373);c.lineTo(695,396);c.lineTo(800,396);c.lineTo(800,373);c.moveTo(695,379);c.lineTo(800,379);},p.ink,3);
 for(let x=710;x<800;x+=15)line(c=>{c.moveTo(x,379);c.lineTo(x,394);},p.ink,2);
 if(lit){ctx.save();ctx.translate(748,351);ctx.rotate(Math.sin(t*.12)*.18);shape(c=>{c.moveTo(-14,0);c.lineTo(-662,-94);c.lineTo(-662,71);c.closePath();},night?'#f8dc8c2c':'#f7d8903b');line(c=>{c.moveTo(-24,0);c.lineTo(-617,-13);},'#e8cf883e',3);ellipse(0,0,12,12,'#fff3bc');ctx.restore();}
 else{ctx.fillStyle=p.ink;ctx.font='17px serif';ctx.textAlign='center';ctx.fillText('灯还没有亮',749,682);ctx.textAlign='start';}
 // Strand line, shells, bottle and a small coastal visitor.
 for(let i=0;i<8;i++){let x=574+i*42,y=896+Math.sin(i*2)*14;ellipse(x,y,5,3,i%2?'#d7b59c':'#eee2c5',p.ink,1);}
 ctx.save();ctx.translate(226,841);ctx.rotate(.28);rect(-8,-20,16,36,'#a7cbc5',5,p.ink);rect(-4,-31,8,14,'#9caa88',2,p.ink);rect(-6,-34,12,5,'#b28a62',2,p.ink);line(c=>{c.moveTo(-3,-13);c.lineTo(-3,9);},'#f7edd1',2);ctx.restore();
 for(let i=0;i<3;i++){const x=118+i*80+Math.sin(t*.2+i)*9,y=340+i%2*24;line(c=>{c.moveTo(x-10,y);c.quadraticCurveTo(x-3,y-7,x,y);c.quadraticCurveTo(x+5,y-7,x+12,y);},night?'#a8c0c4':'#7d9e9e',2);}
 const bird=options.bird||{x:600,y:811};ctx.save();ctx.translate(bird.x,bird.y);ctx.scale(.55,.55);if(options.facing<0)ctx.scale(-1,1);art.set({grounded:true,speed:bird.walking?90:0,scarf:'#c57560',boardColor:'#4e898b'},t);art.bird(0,bird.walking?Math.sin(t*11)*2:0,0);ctx.restore();

 ctx.restore();return m;
}
