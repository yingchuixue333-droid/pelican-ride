export const WIDTH=800,HEIGHT=1100,STEP=1/120,GRAVITY=650;
export const LEVELS=[
 {name:'先听三声响',sky:'#dae9e6',snow:'#fff5dd',bells:[[350,630],[585,420],[650,760]],bumpers:[[630,900,49],[275,400,39]],bricks:[[460,705],[504,705],[482,666]],hint:'向后拉，松手弹出。撞响三口风铃。'},
 {name:'借一次反弹',sky:'#c8dde3',snow:'#f7f4df',bells:[[255,310],[660,420],[500,790]],bumpers:[[580,650,62],[170,550,42],[710,900,40]],bricks:[[400,495],[444,495],[488,495],[444,456],[488,456]],hint:'橙色圆鼓会把雪团弹开，冰砖可以撞碎。'},
 {name:'一弹能几响',sky:'#d9d0de',snow:'#fff0d9',bells:[[225,235],[645,285],[540,730]],bumpers:[[420,530,61],[690,650,44],[200,670,37]],bricks:[[320,390],[364,390],[408,390],[452,390],[496,390],[364,351],[408,351],[452,351]],hint:'试试高一点的弧线。连着撞铃，分数更高。'}
];
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function createRound(index=0){const level=LEVELS[index%LEVELS.length];return {index:index%LEVELS.length,phase:'ready',time:0,shotTime:0,shots:0,score:0,hits:0,bounces:0,chain:0,lastBell:-99,ball:{x:130,y:930,vx:0,vy:0,r:23},bells:level.bells.map(([x,y],i)=>({id:i,x,y,r:30,hit:false,pulse:0})),bumpers:level.bumpers.map(([x,y,r],i)=>({id:i,x,y,r,pulse:0,last:-99})),bricks:level.bricks.map(([x,y],i)=>({id:i,x,y,w:42,h:36,dead:false})),events:[],trail:[],particles:[],wonAt:null};}
export function velocity(dx,dy){let length=Math.hypot(dx,dy);if(length<12)return null;const scale=Math.min(1,155/length);return {vx:-dx*scale*7.2,vy:-dy*scale*7.2};}
export function launch(g,dx,dy){if(g.phase!=='ready'||g.shots>=3)return false;let v=velocity(dx,dy);if(!v)return false;g.ball={x:130,y:930,r:23,...v};g.shots++;g.shotTime=0;g.chain=0;g.lastBell=-99;g.phase='flying';g.trail=[];g.events.push({type:'launch'});return true;}
function emit(g,type,x,y,value=0){g.events.push({type,x,y,value});if(g.events.length>30)g.events.shift();}
function sparkle(g,x,y,kind='snow',count=12){for(let i=0;i<count;i++){const a=(i*2.399963+g.shots),speed=70+(i%5)*45;g.particles.push({x,y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed-80,life:.65+(i%4)*.12,max:1,kind,size:kind==='ice'?4+i%4:2+i%3});}if(g.particles.length>180)g.particles.splice(0,g.particles.length-180);}
export function recall(g){if(g.phase!=='flying'&&g.phase!=='clear')return false;if(g.phase==='clear')return false;g.ball={x:130,y:930,vx:0,vy:0,r:23};g.trail=[];g.phase=g.shots>=3?'failed':'ready';emit(g,'recall');return true;}
export function tick(g,dt=STEP,{effects=true}={}){
 g.time+=dt;for(let b of g.bells)b.pulse=Math.max(0,b.pulse-dt);for(let b of g.bumpers)b.pulse=Math.max(0,b.pulse-dt);
 for(let p of g.particles){p.life-=dt;p.vy+=400*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;}g.particles=g.particles.filter(p=>p.life>0);
 if(g.phase!=='flying'&&g.phase!=='clear')return;
 if(g.phase==='clear'&&g.time-g.wonAt>2){g.ball.vx=0;g.ball.vy=0;return;}
 const b=g.ball;g.shotTime+=dt;b.vy+=GRAVITY*dt;b.x+=b.vx*dt;b.y+=b.vy*dt;
 let wall=false;
 if(b.x<b.r+20){b.x=b.r+20;b.vx=Math.abs(b.vx)*.84;wall=true;}
 if(b.x>WIDTH-b.r-20){b.x=WIDTH-b.r-20;b.vx=-Math.abs(b.vx)*.84;wall=true;}
 if(b.y<b.r+45){b.y=b.r+45;b.vy=Math.abs(b.vy)*.85;wall=true;}
 if(b.y>1035-b.r){b.y=1035-b.r;b.vy=-Math.abs(b.vy)*.7;b.vx*=.94;wall=true;}
 if(wall&&effects){sparkle(g,b.x,b.y,'snow',5);emit(g,'wall',b.x,b.y);}
 for(let p of g.bumpers){const dx=b.x-p.x,dy=b.y-p.y,d=Math.hypot(dx,dy),r=b.r+p.r;if(d>=r)continue;const nx=d>.001?dx/d:0,ny=d>.001?dy/d:-1;b.x=p.x+nx*(r+.1);b.y=p.y+ny*(r+.1);const dot=b.vx*nx+b.vy*ny;if(dot<0){b.vx-=2*dot*nx;b.vy-=2*dot*ny;const speed=Math.hypot(b.vx,b.vy),boost=Math.min(1.13,1300/Math.max(1,speed));b.vx*=boost;b.vy*=boost;if(g.time-p.last>.10){p.last=g.time;p.pulse=.25;g.bounces++;if(effects){sparkle(g,b.x,b.y,'spark',9);emit(g,'bumper',p.x,p.y);}}}}
 for(let p of g.bricks){if(p.dead||g.phase==='clear')continue;const nearX=clamp(b.x,p.x-p.w/2,p.x+p.w/2),nearY=clamp(b.y,p.y-p.h/2,p.y+p.h/2);if(Math.hypot(b.x-nearX,b.y-nearY)>b.r)continue;p.dead=true;g.score+=30;b.vx*=.94;b.vy*=.94;if(effects){sparkle(g,p.x,p.y,'ice',11);emit(g,'brick',p.x,p.y,30);}}
 for(let p of g.bells){if(p.hit||Math.hypot(b.x-p.x,b.y-p.y)>b.r+p.r)continue;p.hit=true;p.pulse=.8;g.hits++;g.chain=g.time-g.lastBell<1.5?g.chain+1:1;g.lastBell=g.time;const value=200+100*(g.chain-1);g.score+=value;if(effects){sparkle(g,p.x,p.y,'gold',22);emit(g,'bell',p.x,p.y,value);}}
 const speed=Math.hypot(b.vx,b.vy);if(speed>1450){b.vx*=1450/speed;b.vy*=1450/speed;}
 if(effects&&Math.floor(g.time*45)!==Math.floor((g.time-dt)*45)){g.trail.push({x:b.x,y:b.y});if(g.trail.length>28)g.trail.shift();}
 if(g.hits===g.bells.length&&g.phase!=='clear'){g.phase='clear';g.wonAt=g.time;g.score+=Math.max(0,3-g.shots)*200;if(effects){sparkle(g,b.x,b.y,'gold',30);emit(g,'clear',b.x,b.y,g.score);}}
 if(g.phase==='flying'&&(g.shotTime>5.8||g.shotTime>1.3&&speed<85&&b.y>980))recall(g);
 if(g.phase==='clear'&&g.shotTime>8){b.vx=0;b.vy=0;b.y=1035-b.r;}
}
export function predict(g,dx,dy){const copy=structuredClone(g);copy.phase='ready';copy.shots=Math.min(copy.shots,2);copy.events=[];copy.particles=[];if(!launch(copy,dx,dy))return [];const out=[];for(let i=0;i<84;i++){tick(copy,STEP,{effects:false});if(i%6===0)out.push({x:copy.ball.x,y:copy.ball.y});}return out;}
export function simulate(index,dx,dy,seconds=6){const g=createRound(index);launch(g,dx,dy);for(let i=0;i<seconds/STEP;i++)tick(g,STEP,{effects:false});return g;}
