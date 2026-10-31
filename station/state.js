export const STATION_VERSION='station-1.0.0';
export const STATE_KEY='pelican-station-v1';
export const OBJECTS=[{id:'lantern',name:'一盏小灯',symbol:'✦',x:490,y:490},{id:'feather',name:'一片蓝羽',symbol:'❧',x:175,y:790},{id:'cone',name:'一枚松果',symbol:'❋',x:870,y:825}];
export const PHASES=['dawn','dusk','night'];
export function shanghaiDay(date=new Date()){return new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(date);}
export function currentPhase(date=new Date()){const h=Number(new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Shanghai',hour:'2-digit',hourCycle:'h23'}).format(date));return h>=19||h<6?'night':h>=16?'dusk':'dawn';}
export function hash(text){let h=2166136261;for(const c of String(text))h=Math.imul(h^c.charCodeAt(0),16777619)>>>0;return h;}
export function dailyScene(day=shanghaiDay()){
 const seed=hash(day),weather=['细雪','晴雪','浮云'][seed%3],names=['松枝印记','星灯印记','蓝羽印记','海风印记'];
 const letters=['雪停的时候，屋檐会先听见春天。今天找到的小东西，先替你收好。','雪狐在桥头留下一行脚印，没有写去哪里。走一小段，也算一次出发。','灯塔亮着的时候，海并没有变小，只是远方多了一个可以望见的地方。','邮差今天没有催任何人回信。风经过窗边，也只是把窗帘轻轻掀起。','炉子上的水慢慢热了。赶路之前，可以先把手放暖。','山里落下的雪，没有哪一片需要证明自己走了多远。','那片蓝羽原本夹在一本旧地图里。地图的尽头，画着一张空椅子。'];
 return {day,seed,weather,stamp:names[seed%names.length],letter:letters[seed%letters.length],objects:OBJECTS.map((o,i)=>({...o,x:o.x+((seed>>>i*3)%31)-15,y:o.y+((seed>>>i*4)%21)-10}))};
}
const dayOK=x=>typeof x==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(x)&&!Number.isNaN(Date.parse(x+'T00:00:00Z'));
const cleanText=(v,n)=>typeof v==='string'?Array.from(v).slice(0,n).join(''):'';
const num=(v,max=1e9)=>typeof v==='number'&&Number.isFinite(v)?Math.max(0,Math.min(max,v)):0;
const unique=(list,key)=>[...new Map(list.map(x=>[key(x),x])).values()];
export function normalize(raw={}){
 const r=raw&&typeof raw==='object'?raw:{};
 const cards=Array.isArray(r.cards)?r.cards.filter(c=>c&&typeof c==='object'&&dayOK(c.day)).map(c=>({id:cleanText(c.id,100),day:c.day,text:cleanText(c.text,140),phase:PHASES.includes(c.phase)?c.phase:'dawn',source:['note','walk'].includes(c.source)?c.source:'note'})).filter(c=>c.id):[];
 const runs=Array.isArray(r.runs)?r.runs.filter(x=>x&&typeof x==='object'&&typeof x.id==='string'&&dayOK(x.day)).map(x=>({id:cleanText(x.id,100),day:x.day,score:Math.floor(num(x.score)),seconds:num(x.seconds,86400),percent:Math.floor(num(x.percent,100)),flips:Math.floor(num(x.flips,10000)),partners:Array.isArray(x.partners)?[...new Set(x.partners.filter(k=>['fox','rabbit','bear'].includes(k)))]:[]})):[];
 const walks=[];for(const w of Array.isArray(r.walks)?r.walks:[]){if(!w||!dayOK(w.day))continue;const old=walks.find(x=>x.day===w.day),items=Array.isArray(w.items)?w.items.filter(x=>OBJECTS.some(o=>o.id===x)):[];if(old)old.items=[...new Set([...old.items,...items])];else walks.push({day:w.day,items:[...new Set(items)]});}
 return {version:1,phase:PHASES.includes(r.phase)?r.phase:null,cards:unique(cards,c=>c.id).slice(-48),runs:unique(runs,x=>x.id).slice(-60),walks:walks.sort((a,b)=>a.day.localeCompare(b.day)).slice(-30)};
}
export function readState(storage){try{return normalize(JSON.parse(storage.getItem(STATE_KEY)||'{}'));}catch{return normalize();}}
export function writeState(storage,state){const clean=normalize(state);try{storage.setItem(STATE_KEY,JSON.stringify(clean));return true;}catch{return false;}}
export function foundToday(state,day=shanghaiDay()){return state.walks.find(w=>w.day===day)?.items||[];}
export function collectObject(state,day,id){let next=normalize(state);if(!OBJECTS.some(o=>o.id===id))return next;let w=next.walks.find(w=>w.day===day);if(!w){w={day,items:[]};next.walks.push(w);}if(!w.items.includes(id))w.items.push(id);if(w.items.length===3&&!next.cards.some(c=>c.id==='walk-'+day))next.cards.push({id:'walk-'+day,day,text:dailyScene(day).letter,phase:next.phase||'dawn',source:'walk'});return normalize(next);}
export function addCard(state,card){const text=cleanText(card?.text,140).trim();if(!text)return normalize(state);return normalize({...state,cards:[...state.cards,{...card,text,source:'note'}]});}
export function addRun(state,run){return normalize({...state,runs:[...state.runs,run]});}
export function mergeBackup(state,raw){if(!raw||raw.format!=='pelican-station-backup'||raw.version!==1)throw new Error('这不是雪境小站的旅行箱备份。');const other=normalize(raw.state);return normalize({...state,cards:[...other.cards,...state.cards],runs:[...other.runs,...state.runs],walks:[...other.walks,...state.walks]});}
export function backupData(state){return {format:'pelican-station-backup',version:1,state:normalize(state)};}
export function rememberRun(storage,run){const state=addRun(readState(storage),run);return {state,saved:writeState(storage,state)};}
