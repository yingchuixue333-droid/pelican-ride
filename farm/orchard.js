import {RAIN7_FRUIT} from './rain7-balance.js?v=20261123b';
// Permanent trees: natural age never depends on visits, harvests or paid upgrades.
const H=3600000;
const FIRST_FRUIT=15*60000;
const FRUIT_INTERVAL=H;
function fruitCount(at,first,interval,base=0){
 return base+Math.max(0,1+Math.floor((at-first)/interval));
}
export const TREE_KINDS=[{id:'apple',name:'苹果树',cost:0,fruit:140,color:'#d77359'},{id:'pear',name:'雪梨树',cost:600,fruit:200,color:'#d8c56b'},{id:'peach',name:'水蜜桃树',cost:1200,fruit:280,color:'#e69ca4'},{id:'plum',name:'李子树',cost:0,fruit:240,color:'#756294'}];
export const CARE_COSTS=[600,1800,4200];
export const newOrchard=now=>({trees:[{id:'apple',born:now,collected:0,care:0},null,null]});
export const ORCHARD_SLOTS=['peach','plum','pear'];
export const TREE_MILESTONES=[10,25,50,75,100];
const treeXpStep=level=>level<10?10:level<25?20:level<50?30:40;
const treeXpThreshold=[0];
for(let level=1;level<100;level++)treeXpThreshold.push(treeXpThreshold.at(-1)+treeXpStep(level));
export function treeRank(tree){
 const xp=tree.xp||0;
 const level=treeXpThreshold.findLastIndex(min=>min<=xp)+1;
 return {level,xp:xp-treeXpThreshold[level-1],need:level===100?0:treeXpStep(level),milestone:TREE_MILESTONES.filter(step=>step<=level).length};
}

// Legacy baskets were already paid out on picking. Keep the wallet and fruit
// history, and start the new, unsold basket empty.
export function enableOrchardMarket(s){
 const orchard=s.orchard;
 if(orchard.market)return false;
 orchard.market=true;
 orchard.basketCount=0;
 orchard.basketRecent=[];
 orchard.basketValue=0;
 orchard.trees=ORCHARD_SLOTS.map((id,i)=>{
  const previous=orchard.trees[i];
  if(!previous)return {id,born:s.at,collected:0,care:0,xp:0};
  const tree={...previous,id,xp:treeXpThreshold[[0,9,24,49][previous.care]]};
  if(previous.id!==id){delete tree.sample;delete tree.seen;}
  return tree;
 });
 return true;
}
function creditPicked(s,v,count,coins){
 if(s.orchard.market){
  v.tree.xp=Math.min(treeXpThreshold.at(-1),(v.tree.xp||0)+count*10);
  s.orchard.basketValue+=coins;
 }else s.coins+=coins;
 s.orchard.basketCount=(s.orchard.basketCount||0)+count;
 s.orchard.basketRecent=[...(s.orchard.basketRecent||[]),...Array(count).fill(v.tree.id)].slice(-3);
}
export function sellBasket(s,now){
 const orchard=s.orchard;
 if(!orchard.market||!orchard.basketCount||!orchard.basketValue)return false;
 const count=orchard.basketCount,coins=orchard.basketValue;
 if(s.coins+coins>1e9)return false;
 s.coins+=coins;
 s.at=Math.max(s.at,now);
 orchard.basketCount=0;
 orchard.basketValue=0;
 orchard.basketRecent=[];
 return {kind:'basket-sale',coins,message:'卖出 '+count+' 颗果实 · +'+coins+' 金币'};
}

// Every branch token is one real stored portion, never decoration. Old trees need no timer reset.
export function fruitLook(id,born,serial){let n=((Math.floor(born/1000)%104729)*31+serial*7919+id.length*101)>>>0;return {variant:n%7===0?'sunny':n%3===0?'blush':'natural',size:.92+(n%5)*.035,turn:(n%13-6)*.035};}
export function treeView(s,i,now){
 const tree=s.orchard.trees[i];
 if(!tree)return null;
 const n=Math.max(s.at,now),age=Math.max(0,n-tree.born);
 const quick=tree.fruitStart!==undefined, first=quick?tree.fruitStart:tree.born+6*H;
 const interval=quick?FRUIT_INTERVAL:4*H, base=tree.fruitBase??0;
 const stage=age>=48*H?3:age>=24*H?2:age>=(quick?FIRST_FRUIT:6*H)?1:0;
 const total=fruitCount(n,first,interval,base),pending=Math.max(0,total-tree.collected);
 const serials=[...(tree.fruits||[])];
 for(let j=1,add=Math.min(4-serials.length,pending);j<=add;j++)serials.push(tree.collected+j);
 const stored=serials.length,kind=TREE_KINDS.find(k=>k.id===tree.id),rank=treeRank(tree);
 const value=Math.round((s.economy===7?RAIN7_FRUIT[tree.id]??kind.fruit:kind.fruit)*(1+tree.care*.25+(s.orchard.market?(rank.level-1)*.005:0)));
 const next=first+(total-base)*interval;
 const fruits=serials.map(serial=>({serial,token:tree.id+':'+tree.born+':'+serial,...fruitLook(tree.id,tree.born,serial)}));
 return {tree,kind,age,stage,rank,label:['幼苗','幼树','成树','盛果期'][stage],total,stored,value,coins:stored*value,next,untilMax:Math.max(0,48*H-age),careCost:CARE_COSTS[tree.care]??null,overflow:Math.max(0,pending-(4-(tree.fruits?.length||0))),fruits};
}
export function enableQuickFruit(s,now){
 const at=Math.max(s.at,now);
 let changed=false;
 for(let i=0;i<s.orchard.trees.length;i++){
  const tree=s.orchard.trees[i];
  if(!tree||tree.fruitStart!==undefined)continue;
  const before=treeView(s,i,at);
  tree.fruitStart=before.stored?at+FRUIT_INTERVAL:Math.max(at,tree.born+FIRST_FRUIT);
  tree.fruitBase=before.total;
  tree.collected=before.total;
  tree.fruits=before.fruits.map(f=>f.serial);
  if(tree.id==='peach'&&tree.care===3&&before.rank.level===50)tree.xp=0;
  changed=true;
 }
 return changed;
}
function sample(tree,fruit,coins,at){tree.sample={id:tree.id,serial:fruit.serial,...fruitLook(tree.id,tree.born,fruit.serial),coins,at};}
export function harvestFruit(s,i,token,now){let v=treeView(s,i,now),f=v?.fruits.find(f=>f.token===token);if(!f)return false;let bonus=v.stage===3?Math.round(v.value*v.stored*.25)-Math.round(v.value*(v.stored-1)*.25):0,coins=v.value+bonus;v.tree.fruits=v.fruits.filter(p=>p.token!==token).map(p=>p.serial);v.tree.collected=v.total;const beforeXp=v.tree.xp||0;creditPicked(s,v,1,coins);s.at=Math.max(s.at,now);sample(v.tree,f,coins,s.at);return {kind:'orchard',index:i,fruit:f,coins:s.orchard.market?0:coins,basketValue:coins,treeXp:(v.tree.xp||0)-beforeXp,message:'亲手摘下一份'+v.kind.name.replace('树','')+' · 已入篮'};}
// Recording an observation never creates rewards. Refreshing cannot repeat a return message.
export function observeOrchard(s,now){let changes=[];s.orchard.trees.forEach((tree,i)=>{if(!tree)return;let v=treeView(s,i,now),seen=tree.seen,serials=v.fruits.map(f=>f.serial);if(seen&&seen.id===tree.id){if(v.stage>seen.stage)changes.push({index:i,text:v.kind.name+'长成了'+v.label});let fresh=serials.filter(n=>!seen.serials.includes(n));if(fresh.length)changes.push({index:i,text:v.kind.name+'新挂上了'+fresh.length+'份果实'});}tree.seen={id:tree.id,stage:v.stage,serials};});s.at=Math.max(s.at,now);return changes;}
export function plantTree(s,i,id,now){let kind=TREE_KINDS.find(k=>k.id===id);if(!Number.isInteger(i)||i<0||i>2||s.orchard.trees[i]||!kind||s.coins<kind.cost)return false;let n=Math.max(s.at,now);s.coins-=kind.cost;s.orchard.trees[i]={id,born:n,collected:0,care:0};s.at=n;return {kind:'orchard',cost:kind.cost,message:'种下'+kind.name+' · 48小时自然进入盛果期'};}
export function harvestTree(s,i,now){let v=treeView(s,i,now);if(!v?.stored)return false;let bonus=v.stage===3?Math.round(v.coins*.25):0;creditPicked(s,v,v.stored,v.coins+bonus);v.tree.collected=v.total;v.tree.fruits=[];s.at=Math.max(s.at,now);sample(v.tree,v.fruits.at(-1),v.value+(v.stage===3?Math.round(v.value*.25):0),s.at);if(s.orchard.market)return {kind:'orchard',coins:0,message:v.kind.name+'收了 '+v.stored+' 颗 · 已入篮'};return {kind:'orchard',coins:v.coins+bonus,message:v.kind.name+'收了'+v.stored+'份 · +'+(v.coins+bonus)+'币'+(bonus?' · 盛果奖励+'+bonus:'')};}
export function careTree(s,i,now){if(s.orchard.market)return false;let v=treeView(s,i,now);if(!v||v.careCost===null||s.coins<v.careCost)return false;s.coins-=v.careCost;v.tree.care++;s.at=Math.max(s.at,now);return {kind:'orchard',cost:v.careCost,message:'果树培育升级 · 每份基础产量再增25%'};}
export function validateOrchard(raw,at){if(!raw||!Array.isArray(raw.trees)||raw.trees.length!==3)throw Error('果园数据不正确');if(raw.market===true&&(!Number.isSafeInteger(raw.basketValue)||raw.basketValue<0||raw.basketValue>Number.MAX_SAFE_INTEGER||((raw.basketCount||0)>0)!==(raw.basketValue>0)||raw.trees.some((tree,i)=>tree?.id!==ORCHARD_SLOTS[i])))throw Error('果篮交易记录不正确');if(raw.basketCount!==undefined&&(!Number.isSafeInteger(raw.basketCount)||raw.basketCount<0||raw.basketCount>1e9))throw Error('果篮记录不正确');if(raw.basketRecent!==undefined&&(!Array.isArray(raw.basketRecent)||raw.basketRecent.length>3||!raw.basketRecent.every(id=>TREE_KINDS.some(k=>k.id===id))))throw Error('果篮样本不正确');return {...(raw.market===true?{market:true,basketValue:raw.basketValue}:{}),...(raw.basketRecent===undefined?{}:{basketRecent:raw.basketRecent.slice()}),...(raw.basketCount===undefined?{}:{basketCount:raw.basketCount}),trees:raw.trees.map(t=>{if(t===null)return null;if(!t||!TREE_KINDS.some(k=>k.id===t.id)||!Number.isSafeInteger(t.born)||t.born<0||t.born>at||!Number.isSafeInteger(t.collected)||t.collected<0||!Number.isSafeInteger(t.care)||t.care<0||t.care>3)throw Error('果树记录不正确');let out={id:t.id,born:t.born,collected:t.collected,care:t.care};
const quick=t.fruitStart!==undefined||t.fruitBase!==undefined;
if(quick){
 if(!Number.isSafeInteger(t.fruitStart)||t.fruitStart<t.born||t.fruitStart>at+FRUIT_INTERVAL||!Number.isSafeInteger(t.fruitBase)||t.fruitBase<0||t.fruitBase>t.collected)throw Error('果实成熟时间不正确');
 out.fruitStart=t.fruitStart;out.fruitBase=t.fruitBase;
}
if(t.collected>fruitCount(at,quick?t.fruitStart:t.born+6*H,quick?FRUIT_INTERVAL:4*H,t.fruitBase??0))throw Error('采摘进度不正确');if(t.xp!==undefined){if(!Number.isSafeInteger(t.xp)||t.xp<0||t.xp>treeXpThreshold.at(-1))throw Error("果树经验不正确");out.xp=t.xp;}
if(t.fruits!==undefined){if(!Array.isArray(t.fruits)||t.fruits.length>4||new Set(t.fruits).size!==t.fruits.length||!t.fruits.every(n=>Number.isSafeInteger(n)&&n>0&&n<=t.collected))throw Error('枝上果实记录不正确');out.fruits=t.fruits.slice();}
if(t.sample!==undefined){let p=t.sample;if(!p||!TREE_KINDS.some(k=>k.id===p.id)||!Number.isSafeInteger(p.serial)||p.serial<1||!['sunny','blush','natural'].includes(p.variant)||!Number.isFinite(p.size)||p.size<.9||p.size>1.1||!Number.isFinite(p.turn)||Math.abs(p.turn)>.3||!Number.isSafeInteger(p.coins)||p.coins<0||p.coins>10000||!Number.isSafeInteger(p.at)||p.at<0||p.at>at)throw Error('收成果实记录不正确');out.sample={id:p.id,serial:p.serial,variant:p.variant,size:p.size,turn:p.turn,coins:p.coins,at:p.at};}
if(t.seen!==undefined){let p=t.seen;if(!p||!TREE_KINDS.some(k=>k.id===p.id)||!Number.isInteger(p.stage)||p.stage<0||p.stage>3||!Array.isArray(p.serials)||p.serials.length>4||!p.serials.every(n=>Number.isSafeInteger(n)&&n>0)||new Set(p.serials).size!==p.serials.length)throw Error('回访记录不正确');out.seen={id:p.id,stage:p.stage,serials:p.serials.slice()};}return out;})};}
export function graftTree(s,i,id,now){if(s.orchard.market)return false;let kind=TREE_KINDS.find(k=>k.id===id),v=treeView(s,i,now);if(!kind||!v||kind.id===v.tree.id||s.coins<kind.cost)return false;let collected=harvestTree(s,i,now);s.coins-=kind.cost;v.tree.id=id;s.at=Math.max(s.at,now);return {kind:'orchard',cost:kind.cost,coins:collected?.coins||0,message:'换成'+kind.name+' · 花'+kind.cost+'币'+(collected?' · 先收原果+'+collected.coins+'币':'')+' · 树龄和培育保留'};}
