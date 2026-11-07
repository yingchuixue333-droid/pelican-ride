export const KEY='windfarm-v1';
export const CROPS=[
 {id:'radish',name:'樱桃萝卜',short:'萝卜',level:1,seconds:45,coins:9,xp:3,color:'#d66b6b'},
 {id:'wheat',name:'麦穗',short:'麦穗',level:2,seconds:60,coins:12,xp:4,color:'#d6ab57'},
 {id:'berry',name:'草莓',short:'草莓',level:3,seconds:90,coins:19,xp:6,color:'#da6c78'},
 {id:'tomato',name:'番茄',short:'番茄',level:5,seconds:120,coins:26,xp:8,color:'#d7744f'},
 {id:'pumpkin',name:'蜜糖南瓜',short:'南瓜',level:7,seconds:180,coins:40,xp:12,color:'#dc9b46'},
 {id:'moon',name:'月光花',short:'月光花',level:9,seconds:240,coins:54,xp:16,color:'#a49bce'}
];
export const VARIANTS=['原生','金灿','巨型','星辉'];
export const BUILDINGS=[{id:'bath',name:'鸟浴池',level:4,cost:110,detail:'蝴蝶每15秒来一次'},{id:'mill',name:'小风车',level:6,cost:180,detail:'会转动的田园装饰'},{id:'house',name:'玻璃温室',level:8,cost:280,detail:'新播种作物快10%'}];
const THRESHOLDS=[0,12,30,54,84,120,162,210,264,324];
export const crop=id=>CROPS.find(c=>c.id===id);
export function levelOf(xp){if(xp>=324)return 10+Math.floor((xp-324)/60);let n=1;while(n<10&&xp>=THRESHOLDS[n])n++;return n;}
export function progress(s){let level=levelOf(s.xp),base=level>=10?324+(level-10)*60:THRESHOLDS[level-1],next=level>=10?base+60:THRESHOLDS[level];return {level,have:s.xp-base,need:next-base};}
export const time=(s,now=Date.now())=>Math.max(s.at,now);
export const available=s=>CROPS.filter(c=>c.level<=levelOf(s.xp));
export function random(s){let x=s.rng>>>0;x^=x<<13;x^=x>>>17;x^=x<<5;s.rng=x>>>0||1;return s.rng/4294967296;}
function makePlant(s,id,start){let c=crop(id),st=s.stats[id],rare=random(s)<.12||st.miss>=5;st.sown++;st.miss=rare?0:st.miss+1;let variant=rare?1+(st.rare++%3):0,duration=c.seconds*1000*(s.buildings.house?.9:1);return {id,start,end:start+duration,duration,watered:false,variant};}
export function newGame(now=Date.now(),seed=314159265){let s={version:1,rev:0,at:now,coins:35,xp:0,plots:Array(12).fill(null),plotCount:6,buildings:{bath:false,mill:false,house:false},stats:Object.fromEntries(CROPS.map(c=>[c.id,{sown:0,harvest:0,miss:0,rare:0,variants:[0,0,0]}])),rng:seed>>>0||1,order:{id:'radish',count:0,seq:0},butterflyAt:now};for(let i=0;i<4;i++)s.plots[i]=makePlant(s,'radish',now-(i<2?45000:26000));return s;}
export function ready(s,p,now){return !!p&&time(s,now)>=p.end;}
export function growth(s,p,now){return p?Math.min(1,Math.max(0,1-(p.end-time(s,now))/p.duration)):0;}
function award(s,xp){let before=levelOf(s.xp);s.xp+=xp;let gained=levelOf(s.xp)-before;s.coins+=gained*15;return gained;}
export function plant(s,i,id,now){let c=crop(id);if(!c||i<0||i>=s.plotCount||s.plots[i]||c.level>levelOf(s.xp))return false;now=time(s,now);s.plots[i]=makePlant(s,id,now);s.at=now;return {kind:'plant',message:'种下'+c.short};}
export function water(s,i,now){let p=s.plots[i];if(i>=s.plotCount||!p||p.watered||ready(s,p,now))return false;now=time(s,now);p.watered=true;p.end=Math.max(now,p.end-p.duration*.25);s.at=now;return {kind:'water',message:'浇过水了 · 快25%'};}
export function harvest(s,i,now){let p=s.plots[i];if(i>=s.plotCount||!ready(s,p,now))return false;let c=crop(p.id),coins=Math.round(c.coins*[1,1.5,2,2.5][p.variant]);s.coins+=coins;let levels=award(s,c.xp);let st=s.stats[p.id];st.harvest++;if(p.variant)st.variants[p.variant-1]++;if(s.order.id===p.id)s.order.count=Math.min(3,s.order.count+1);s.plots[i]=null;s.at=time(s,now);return {kind:'harvest',coins,xp:c.xp,levels,variant:p.variant,message:(p.variant?VARIANTS[p.variant]+' ':'')+c.short+' +'+coins+'币 · +'+c.xp+'经验'+(levels?' · 升级！':'')};}
export function expand(s,now){let tier=(s.plotCount-6)/2,cost=[80,140,220][tier],level=[3,5,7][tier];if(!cost||s.coins<cost||levelOf(s.xp)<level)return false;s.coins-=cost;s.plotCount+=2;s.at=time(s,now);return {kind:'build',message:'开好了两块新田'};}
export function build(s,id,now){let b=BUILDINGS.find(x=>x.id===id);if(!b||s.buildings[id]||s.coins<b.cost||levelOf(s.xp)<b.level)return false;s.coins-=b.cost;s.buildings[id]=true;s.at=time(s,now);return {kind:'build',message:b.name+'建好了'};}
export function changeOrder(s,now){s.order.seq++;s.order.id=available(s)[s.order.seq%available(s).length].id;s.order.count=0;s.at=time(s,now);return {kind:'order',message:'新的采收委托：'+crop(s.order.id).short+' × 3'};}
export function claimOrder(s,now){if(s.order.count<3)return false;s.coins+=25;let levels=award(s,6);changeOrder(s,now);return {kind:'reward',coins:25,xp:6,levels,message:'委托完成 +25币 · +6经验'};}
export function butterfly(s,now){now=time(s,now);if(now<s.butterflyAt)return false;let plants=s.plots.filter((p,i)=>i<s.plotCount&&p&&!ready(s,p,now));if(!plants.length)return false;let p=plants.reduce((a,b)=>a.end>b.end?a:b);p.end=Math.max(now,p.end-10000);s.butterflyAt=now+(s.buildings.bath?15000:20000);s.at=now;return {kind:'butterfly',message:'蝴蝶帮'+crop(p.id).short+'快了10秒'};}
const int=(v,a,b)=>Number.isSafeInteger(v)&&v>=a&&v<=b;
export function validate(raw){
 if(!raw||typeof raw!=='object'||raw.version!==1)throw Error('不是风里农场的有效备份');
 if(!int(raw.rev,0,1e9)||!int(raw.at,0,9e15)||!int(raw.coins,0,1e9)||!int(raw.xp,0,1e9)||![6,8,10,12].includes(raw.plotCount)||!int(raw.rng,1,4294967295)||!int(raw.butterflyAt,0,9e15))throw Error('存档数值不正确');
 let s={version:1,rev:raw.rev,at:raw.at,coins:raw.coins,xp:raw.xp,plotCount:raw.plotCount,rng:raw.rng,butterflyAt:raw.butterflyAt,buildings:{},stats:{},plots:[],order:null};
 for(let b of BUILDINGS){if(typeof raw.buildings?.[b.id]!=='boolean')throw Error('设施数据不正确');s.buildings[b.id]=raw.buildings[b.id];}
 for(let c of CROPS){let st=raw.stats?.[c.id];if(!st||!int(st.sown,0,1e9)||!int(st.harvest,0,1e9)||st.harvest>st.sown||!int(st.miss,0,5)||!int(st.rare,0,st.sown)||!Array.isArray(st.variants)||st.variants.length!==3||!st.variants.every(n=>int(n,0,st.harvest)))throw Error('作物记录不正确');s.stats[c.id]={sown:st.sown,harvest:st.harvest,miss:st.miss,rare:st.rare,variants:st.variants.slice()};}
 if(!Array.isArray(raw.plots)||raw.plots.length!==12)throw Error('田地数据不正确');
 for(let i=0;i<12;i++){let p=raw.plots[i];if(p===null){s.plots.push(null);continue;}if(i>=s.plotCount||!p||!crop(p.id)||!int(p.start,0,9e15)||!Number.isFinite(p.end)||p.end<p.start||p.end>p.start+240000||!Number.isFinite(p.duration)||p.duration<1000||p.duration>240000||typeof p.watered!=='boolean'||!int(p.variant,0,3))throw Error('植株数据不正确');s.plots.push({id:p.id,start:p.start,end:p.end,duration:p.duration,watered:p.watered,variant:p.variant});}
 let o=raw.order;if(!o||!crop(o.id)||!int(o.count,0,3)||!int(o.seq,0,1e9))throw Error('委托数据不正确');s.order={id:o.id,count:o.count,seq:o.seq};return s;
}
export function parse(text){if(typeof text!=='string'||text.length>100000)throw Error('备份过大或内容不正确');return validate(JSON.parse(text));}
