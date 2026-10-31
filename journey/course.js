import {CONFIG as C} from './config.js?v=20261031-v9a';
import {groundOn,rng} from './levels.js?v=20261031-v9a';
// Six readable verbs. Main course is authored and identical on every attempt.
// Daily remixes only these tested sections; geometry never changes after entry.
const PATTERNS={
 short:{name:'轻跳 · 再落稳',family:'short',amp:20,ops:[['rock',2100],['rock',4200]],hint:'两块雪石，分两次轻点通过'},
 launch:{name:'大坡 · 一圈或两圈',family:'launch',ramp:2100,power:1.82,shoulder:75,amp:40,ops:[],hint:'蓝色坡顶起跳，松手停转'},
 fork:{name:'岔路 · 上台或贴地',family:'fork',ramp:2100,power:1.42,shoulder:55,amp:30,ops:[['rock',4300]],platform:[2900,5100,110],hint:'上台收鱼，低路轻跳也能通过'},
 ceiling:{name:'低拱 · 先滑后跳',family:'ceiling',amp:12,ops:[['arch',2100],['log',4300]],hint:'先贴地过低拱，再跳过倒木'},
 cloud:{name:'断桥 · 留翼救险',family:'cloud',amp:18,gap:[3000,3650],ramp:2770,power:1.14,shoulder:25,ops:[],hint:'断桥前轻点，空中再点可扑翼'},
 relay:{name:'伙伴 · 主动跳接',family:'relay',ramp:2100,power:1.45,shoulder:50,amp:25,ops:[['rock',4500]],platform:[2850,5100,100],hint:'借坡跳上台接同伴，也可走低路'}
};
const ORDER=[['short','launch','short','fork','launch','cloud'],['short','relay','fork','ceiling','launch','cloud'],['ceiling','short','launch','fork','relay','cloud'],['short','launch','fork','ceiling','relay','cloud']];
export const COURSE_TYPES=Object.keys(PATTERNS);
export function createCourse(seed=9,{daily=false}={}){
 let level={seed,cycle:0,options:{authored:true,daily},segments:[],obstacles:[],items:[],platforms:[],fallbacks:[],templateIds:[],laps:0},x=0,y=0;
 const random=rng(seed);
 function append(type,theme,index,rest=false){
  const d=rest?{name:'顺坡 · 休息一下',family:'rest',amp:8,ops:[],hint:''}:PATTERNS[type];
  const length=rest?1800:6000,s={...d,id:`v9-${theme}-${type}-${index}`,index:level.segments.length,theme,start:x,end:x+length,y,slope:rest?.08:.09,amp:d.amp,waves:1,items:[],obstacles:[],platforms:[],entrySpeed:[C.base,C.base*1.78],jumpWindows:[],landingZones:[],variant:0,signature:type,restoreSpace:700,reactionFloor:1.1,stage:theme,route:!!d.platform,opportunityId:`v9-line-${index}`,requiredActions:1,landmark:index%6===4?['雪谷冰瀑','杉林渡口','晶洞回声','海湾灯塔'][theme]:null};
  if(d.gap){s.gap=[3000,3000+[400,650,1000,1100][theme]];s.power=[1,1.14,1.45,1.55][theme];}
  if(d.platform){let [a,b,offset]=d.platform,q={id:`v9-platform-${index}`,start:x+a,end:x+b,offset,cloud:false,sink:theme===1&&type==='fork',edge:70,theme};s.platforms.push(q);level.platforms.push(q);s.landingZones.push({start:q.start,end:q.end,yOffset:offset});}
  const add=item=>{s.items.push(item);level.items.push(item);};
  for(let [kind,off] of d.ops){const o={id:`v9-${index}-${kind}-${off}`,kind,x:x+off,w:kind==='arch'?290:kind==='log'?110:70,h:kind==='arch'?345:kind==='log'?75:33,clearance:kind==='arch'?210:0,phase:0};s.obstacles.push(o);level.obstacles.push(o);s.jumpWindows.push({earliest:o.x-400,latest:o.x-130,kind});}
  // Ground and supported fish have exact, static support coordinates. No unreachable decorative arcs.
  for(let off of rest?[500,700,900,1100,1300]:[700,860,1020,1180,1340,5200,5360,5520,5680]){let xx=x+off;add({id:`v9-fish-${index}-${off}`,kind:'fish',x:xx,y:groundOn(s,xx)-45});}
  for(let q of s.platforms)for(let j=0;j<8;j++){let xx=q.start+180+j*230;add({id:`v9-high-${index}-${j}`,kind:'fish',platformId:q.id,x:xx,y:groundOn(s,xx)-q.offset-45});}
  if(type==='relay'&&!rest){let q=s.platforms[0],mount=['fox','fox','bear','rabbit'][theme];add({id:`v9-partner-${index}`,kind:'partner',mount,requireAction:true,platformId:q.id,x:q.start+600,y:groundOn(s,q.start+600)-q.offset-45});}
  if(type==='cloud'&&theme===3){s.platforms.push({id:`v9-cloud-${index}`,start:x+4000,end:x+5000,offset:85,cloud:true,sink:false,edge:70,theme});level.platforms.push(s.platforms.at(-1));}
  if(type==='relay'&&theme===2){let q=s.platforms[0],xx=q.end-250;add({id:`v9-feather-${index}`,kind:'feather',platformId:q.id,x:xx,y:groundOn(s,xx)-q.offset-45});}
  level.segments.push(s);level.templateIds.push(s.id);x+=length;y=groundOn(s,x);
 }
 let index=0;
 for(let theme=0;theme<4;theme++){
  let row=[...ORDER[theme]];
  if(daily){const shift=Math.floor(random()*6);row=row.slice(shift).concat(row.slice(0,shift));}
  row.forEach((type,i)=>{append(type,theme,index++);if(i===2||i===5)append('rest',theme,index++,true);});
 }
 // Final clear approach gives the result a real destination, with no hidden end trigger in a gap.
 append('rest',3,index++,true);level.finish=x;level.lastEnd=x;return level;
}

export function courseModule(id){const m=/^v9-(\d)-(\w+)-\d+$/.exec(id);return m&&PATTERNS[m[2]]?{...PATTERNS[m[2]],theme:Number(m[1])}:null;}
