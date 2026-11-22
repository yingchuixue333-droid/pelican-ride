// Each plant is anchored on the same soil plane. Leaves, stalks and fruit
// develop independently so a young plant isn't a tiny copy of its harvest.
const leafColors=['#254d2b','#5f8f42','#b6cb6b'];
const tender=['#396238','#81a84b','#d1d77e'];
export function oval(c,x,y,rx,ry,fill,angle=0){
 c.beginPath();c.ellipse(x,y,rx,ry,angle,0,Math.PI*2);c.fillStyle=fill;c.fill();
}
export function stroke(c,from,control,to,color,width){
 c.beginPath();c.moveTo(...from);c.quadraticCurveTo(...control,...to);
 c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.stroke();
}
export function glaze(c,x,y,w,h,colors){
 const paint=c.createLinearGradient(x-w*.36,y-h*.6,x+w*.52,y+h*.48);
 paint.addColorStop(0,colors[2]);paint.addColorStop(.38,colors[1]);paint.addColorStop(1,colors[0]);
 return paint;
}
export function blade(c,x,y,length,width,angle,colors=leafColors,lobed=false){
 c.save();c.translate(x,y);c.rotate(angle);
 c.beginPath();c.moveTo(0,2);
 if(lobed){
  c.bezierCurveTo(-width,-length*.16,-width*.84,-length*.23,-width*.52,-length*.31);
  c.bezierCurveTo(-width*1.14,-length*.5,-width*.82,-length*.65,-width*.42,-length*.68);
  c.quadraticCurveTo(-width*.62,-length*.82,0,-length);
  c.bezierCurveTo(width*.68,-length*.89,width*.75,-length*.71,width*.44,-length*.64);
  c.bezierCurveTo(width*1.05,-length*.54,width*.89,-length*.4,width*.53,-length*.31);
  c.quadraticCurveTo(width*.86,-length*.18,0,2);
 }else{
  c.bezierCurveTo(-width,-length*.2,-width*.95,-length*.69,0,-length);
  c.bezierCurveTo(width*.88,-length*.67,width,-length*.23,0,2);
 }
 c.fillStyle=glaze(c,0,-length*.46,width*2,length,colors);c.fill();
 const vein=length<25?'#d2df9461':'#d9e4a181';
 stroke(c,[0,1],[-width*.14,-length*.42],[0,-length*.88],vein,Math.max(.7,width*.09));
 if(length>32){
  for(const f of [.28,.48,.66])for(const sign of [-1,1])
   stroke(c,[0,-length*f],[sign*width*.34,-length*(f+.05)],[sign*width*.48,-length*(f+.17)],'#deeaa74d',.85);
 }
 c.restore();
}
export function fruitRound(c,x,y,rx,ry,colors,tilt=0){
 c.save();c.translate(x,y);c.rotate(tilt);
 oval(c,1,1,rx,ry,glaze(c,0,0,rx*2,ry*2,colors));
 stroke(c,[-rx*.59,-ry*.42],[-rx*.47,-ry*.68],[-rx*.17,-ry*.71],'#fff1cf78',Math.max(1,rx*.073));
 c.restore();
}
function bloom(c,x,y,r,petal='#ffefbc'){
 for(let i=0;i<5;i++){
  const a=i*2*Math.PI/5;
  oval(c,x+Math.cos(a)*r*.72,y+Math.sin(a)*r*.72,r*.61,r*.41,petal,a);
 }
 oval(c,x,y,r*.34,r*.29,'#d39445');
}
const shadow=(c,x,y,w)=>oval(c,x+4,y+4,w,w*.16,'#3b2b2342');
function seedlings(c,id){
 const positions=id==='rice'||id==='wheat'||id==='nightwheat'||id==='glasscorn'?
  [[-27,1],[0,-3],[27,0]]:id==='pumpkin'||id==='watermelon'?[[-22,1],[20,0]]:
  id==='okra'||id==='ginger'?[[-16,1],[15,0]]:[[0,0]];
 for(const [x,y] of positions){
  shadow(c,x,y,13);
  const upright=['rice','wheat','nightwheat','glasscorn','ginger'].includes(id),wide=['pumpkin','watermelon','radish','romanesco'].includes(id);
  const angle=upright?.32:wide?1.02:.64,length=upright?32:wide?20:25,w=upright?4:wide?9:7;
  blade(c,x,y,length,w,-angle,tender,wide);
  blade(c,x,y,length+4,w,angle,tender,wide);
  blade(c,x,y,17,5,.08);
  if(id==='dragonfruit')stroke(c,[x,y],[x+4,y-16],[x-1,y-28],'#789f55',8);
  if(id==='snowpea')stroke(c,[x,y-17],[x+22,y-34],[x+8,y-38],'#96b464',2.3);
 }
}
function root(c,stage){
 const length=stage===1?39:stage===2?53:62;
 shadow(c,0,2,35);
 for(let i=-2;i<=2;i++)blade(c,-i*3,-6,length-(Math.abs(i)*7),15,i*.49,i%2?tender:leafColors,true);
 if(stage>1){
  const k=[0,0,.36,.67,1][stage];
  c.save();c.beginPath();c.rect(-58,-55,116,64);c.clip();
  for(const [x,y,r] of [[-19,9,22],[12,4,25]]){
   fruitRound(c,x,y+13*(1-k),r*k,r*k,['#9a3447','#d96c72','#f6afa1']);
   stroke(c,[x,y-r*k*.6],[x+1,y-r*k*.86],[x+1,y-r*k-5],'#608248',4);
   blade(c,x,y-r*k,22,8,.4,tender,true);
  }
  c.restore();
 }
}
function grain(c,stage,id){
 const rice=id==='rice',colored=id==='nightwheat';
 shadow(c,0,0,51);
 for(let i=0;i<(colored?8:11);i++){
  const x=(i%6-2.5)*20,back=i<6?-7:5,length=(stage===1?51+(i*7)%25:77+(i*13)%39)+(colored?9:0);
  const dx=x+(i%3-1)*13,base=[x*.76,back],top=[dx,-length],tip=rice?[dx+(i%2?19:-17),-length+20]:[dx+5,-length-8];
  stroke(c,base,[x,-length*.55],top,'#3d6932',3.2);
  blade(c,x,-15,38,6,(i%2?.78:-.78),i%2?tender:leafColors);
  if(stage<2)continue;
  stroke(c,top,[dx+(rice?(i%2?14:-12):2),-length-2],tip,'#788c3e',2.5);
  const palette=stage===4?(colored?['#695380','#ad8fb5','#ead2df']:['#975f33','#d8ab4e','#f4d978']):['#48613a','#8d9c4a','#bac973'];
  for(let j=0;j<7;j++){
   const f=j/7,xx=top[0]+(tip[0]-top[0])*f,yy=top[1]+(tip[1]-top[1])*f;
   const shift=(j%2?-1:1)*(rice?3:4);
   oval(c,xx+shift,yy+(rice?3:4),rice?2.7:4,rice?5:6,glaze(c,xx,yy,9,12,palette),rice?.8:(j%2?-.55:.55));
   if(colored&&stage>=3)stroke(c,[xx+shift,yy+3],[xx+shift*1.2,yy-6],[xx+shift*2.7,yy-15],'#ddd0dfab',1.2);
  }
 }
}
function squash(c,stage,id){
 shadow(c,0,3,76);
 stroke(c,[-70,4],[-42,-31],[0,-4],'#587043',4.5);
 stroke(c,[0,-7],[41,-32],[73,-9],'#617a43',5);
 const lengths=stage===1?[26,45,39,39,25]:[37,53,56,47,39];
 for(const [i,x] of [-57,-33,0,36,57].entries())
  blade(c,x,3,lengths[i],17,(i-2)*.46,i%2?tender:leafColors,true);
 if(stage===2){bloom(c,-24,-20,8);bloom(c,32,-19,7);return;}
 if(stage<3)return;
 const k=stage===4?1:.52;
 for(const [x,y,r] of [[25,0,34],[-29,3,26]]){
  const size=r*k,melon=id==='watermelon';
  const colors=stage===4?(melon?['#2a503c','#579050','#b3c56d']:['#9d502c','#dc873b','#ffd978']):tender;
  fruitRound(c,x,y-size*.45,size,size*.65,colors,-.15);
  for(let j=-2;j<=2;j++){
   const spread=j*size*.245;
   stroke(c,[x+spread*.38,y-size*1.05],[x+spread*1.36,y-size*.6],[x+spread*.75,y+size*.09],melon?'#335837':stage===4?'#8f4b324f':'#4f693d55',melon?3.8:2);
  }
  stroke(c,[x,y-size*.96],[x-5,y-size*1.17],[x+1,y-size*1.32],'#646831',4);
  blade(c,x+4,y-size*1.01,size*.7,size*.32,.93,tender,true);
 }
}
function leafy(c,stage,id){
 const tower=id==='romanesco',extent=stage===1?32:55;
 shadow(c,0,0,48);
 for(let j=0;j<13;j++){
  const angle=(j%7-3)*.38,x=(j%5-2)*9;
  blade(c,x,4-(j>6?10:0),extent+(j*11)%17,14+(j%3)*3,angle,j%2?tender:leafColors,!tower);
 }
 if(tower&&stage>=2){
  const k=stage===4?1:stage===3?.72:.4;
  for(const [x,y,size] of [[-24,-23,12],[22,-23,14],[-14,-35,16],[16,-40,15],[1,-50,19],[0,-24,17]]){
   for(let j=0;j<7;j++){
    const r=size*k*(1-j/9),dy=j*3.1*k;
    oval(c,x*k,y-dy,r,r*.77,glaze(c,x*k,y-dy,r*2,r*2,j%2?tender:['#4a7339','#93aa4f','#dbe481']));
   }
  }
 }
}
function vine(c,stage,id){
 const snow=id==='snowpea',bean=id==='bean',tomato=id==='tomato';
 const height=stage===1?52:heightByCrop(id);
 shadow(c,0,1,51);
 if(snow||bean||tomato){
  stroke(c,[-27,1],[-24,-height*.52],[-19,-height-8],'#9d7953',4);
  stroke(c,[27,2],[25,-height*.5],[19,-height-5],'#9d7953',4);
  stroke(c,[-21,-height*.82],[0,-height*.83],[22,-height*.82],'#bb9962',3);
 }
 for(let j=0;j<7;j++){
  const x=(j%2?1:-1)*(17+(j*7)%20),y=-13-j*height/8;
  stroke(c,[j%2?3:-4,3],[2,y+12],[x,y],'#466f38',3.3);
  blade(c,x,y,j%2?27:35,12,x<0?-.77:.77,j%2?tender:leafColors,id!=='blueberry');
  if(stage===2&&j%2===0)bloom(c,x,y+5,4.5,id==='berry'?'#fff0e4':'#f2ecc9');
  if(stage<3||j%2!==0)continue;
  const k=stage===4?1:.52;
  if(snow||bean){
   stroke(c,[x,y],[x+3,y+7],[x+4,y+10],'#779c59',2);
   c.save();c.translate(x+5,y+12);c.rotate(j%3?.43:-.31);
   stroke(c,[0,0],[12*k,16*k],[0,32*k],'#4d7939',9*k);
   stroke(c,[0,1],[10*k,15*k],[1,30*k],'#a7c763',5.8*k);c.restore();
  }else if(id==='blueberry'){
   const color=stage===4?['#344167','#697eae','#bac3db']:tender;
   for(const [dx,dy] of [[0,4],[-7,13],[7,14]])fruitRound(c,x+dx,y+dy,7*k,6.5*k,color);
  }else{
   const color=stage===4?['#9a3532','#dc6950','#ffb179']:tender;
   fruitRound(c,x,y+11,(tomato?15:10)*k,(tomato?12:12)*k,color,.2);
   blade(c,x,y+1,11*k,4,.9,tender);
   if(tomato&&j>2)fruitRound(c,x+13,y+24,10*k,9*k,color);
  }
 }
}
function heightByCrop(id){return id==='snowpea'?96:id==='bean'?90:id==='tomato'?76:id==='blueberry'?55:38;}
function specialty(c,stage,id){
 shadow(c,0,0,53);
 const k=stage===4?1:stage===3?.62:0;
 if(id==='dragonfruit'){
  stroke(c,[0,1],[-3,-48],[0,-84],'#9d7854',7);
  for(let j=0;j<5;j++){
   const x=(j-2)*17,y=stage===1?-35:-68-j%2*13;
   stroke(c,[0,-19],[x*.5,y+5],[x,y],'#356442',12);
   stroke(c,[0,-20],[x*.5,y+6],[x,y],'#87ac60',7);
   if(stage===2)bloom(c,x,y,7,'#fff0cb');
   if(k&&j%2===0){
    fruitRound(c,x,y+10,13*k,18*k,['#9e365c','#d35d82','#f9a7ad']);
    for(const sign of [-1,1])for(let m=0;m<3;m++)blade(c,x+sign*7*k,y+(m-1)*6*k,11*k,4,sign*.6,tender);
   }
  }
 }else if(id==='ginger'){
  for(let j=-2;j<=2;j++){
   stroke(c,[j*7,0],[j*8,-29],[j*11,-62],'#538848',3.5);
   blade(c,j*11,-45,stage===1?22:41,9,j*.46,tender);
   if(k)fruitRound(c,j*15,5-j%2*6,16*k,8*k,['#9c6c45','#c89562','#f7d99a'],j*.48);
  }
 }else{
  const okra=id==='okra',stalk=stage===1?53:96;
  for(let j=-1;j<=1;j++){
   const x=j*32;
   stroke(c,[x,5],[x-5,-stalk*.58],[x+4,-stalk],'#4b743f',4.5);
   blade(c,x,-stalk*.7,okra?33:52,okra?16:11,-.9,tender,okra);
   blade(c,x,-stalk*.41,okra?30:54,okra?16:10,.91,leafColors,okra);
   if(stage===2)bloom(c,x+8,-stalk*.73,okra?9:5);
   if(!k)continue;
   const color=okra?['#4a6a37','#83a658','#c8d985']:['#78496e','#a47aa4','#e0b4ca'];
   fruitRound(c,x+9,-stalk*.62,8*k,21*k,color,-.43);
   for(let row=0;row<4;row++)for(let col=-1;col<=1;col++){
    if(okra){if(row===0)stroke(c,[x+8+col*3,-stalk*.62-16*k],[x+11+col*3,-stalk*.62],[x+12+col*3,-stalk*.62+15*k],'#acc17a',1);}
    else oval(c,x+9+col*4*k,-stalk*.62+(row-1.5)*7*k,2.2*k,3.3*k,row%2?'#e7bb84':'#e1aeba');
   }
  }
 }
}
const painters={
 radish:root,rice:grain,wheat:grain,nightwheat:grain,pumpkin:squash,watermelon:squash,
 lettuce:leafy,romanesco:leafy,bean:vine,snowpea:vine,berry:vine,tomato:vine,blueberry:vine,
 okra:specialty,dragonfruit:specialty,ginger:specialty,glasscorn:specialty,
};
export function paintCrop(c,id,x,y,phase,scale=1){
 const draw=painters[id];
 if(!draw)return false;
 c.save();c.translate(x,y);c.scale(scale,scale);
 if(phase===0)seedlings(c,id);
 else draw(c,phase,id);
 c.restore();return true;
}

export function bedOutline(c,x,y,depth=1){
 const w=93+depth*6,skew=(x-360)*.092;
 c.beginPath();c.moveTo(x-w*.79-skew,y-36);
 c.quadraticCurveTo(x-29-skew,y-43,x-4-skew,y-38);
 c.quadraticCurveTo(x+48-skew,y-42,x+w*.83-skew,y-36);
 c.quadraticCurveTo(x+w*.89,y-18,x+w,y+26);
 c.quadraticCurveTo(x+w*.93,y+41,x+w*.64,y+43);
 c.quadraticCurveTo(x-11,y+47,x-w*.83,y+44);
 c.quadraticCurveTo(x-w*1.02,y+41,x-w,y+30);
 c.quadraticCurveTo(x-w*.9,y+6,x-w*.79-skew,y-36);
 c.closePath();
}
export function paintBed(c,x,y,row,index,soil,wet){
 const depth=row/3,spread=91+depth*9;
 oval(c,x+8,y+38,spread*1.04,20,'#693e292d');
 oval(c,x+7,y+38,spread*.92,13,'#432e293d');
 bedOutline(c,x,y+10,depth);
 c.fillStyle=glaze(c,x,y+12,182,86,wet?['#493529','#674534','#8a5e43']:['#584032','#80563a','#b68153']);
 c.fill();
 c.save();bedOutline(c,x,y,depth);c.clip();
 const colors=wet?['#634734','#926a4b','#b2865c']:soil===2?
  ['#5f4635','#99704c','#c39c69']:['#855738','#b57950','#d9a36b'];
 c.fillStyle=glaze(c,x,y,182,103,colors);c.fillRect(x-124,y-52,248,106);
 for(let ridge=0;ridge<3;ridge++){
  const yy=y-24+ridge*25;
  stroke(c,[x-105,yy+3],[x-10,yy-13],[x+105,yy+1],'#5c392f58',9);
  stroke(c,[x-103,yy-3],[x-9,yy-18],[x+105,yy-5],wet?'#ba8d5d48':'#edbb7f7a',4);
 }
 for(let j=0;j<37;j++){
  const px=x-94+(j*47+index*13)%189,py=y-34+(j*29+index*12)%72;
  oval(c,px,py,1.7+j%4,1+j%3*.45,j%4?'#efc18b56':'#49382d64',-.3);
 }
 c.restore();
 stroke(c,[x-spread*.78,y+45],[x-7,y+51],[x+spread*.72,y+43],'#dca97285',3.5);
 for(let j=0;j<7;j++){
  const px=x-spread*.76+(j*31+index*7)%Math.floor(spread*1.52),py=y+48+j%3;
  oval(c,px,py,4+j%4,2.5+j%2,j%2?'#7d5740':'#a17654',-.3);
  oval(c,px-1,py-1,2.1+j%3,1,'#d1ac77a0',-.3);
 }
}
