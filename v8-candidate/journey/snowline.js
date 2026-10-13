// Completion is authored by terrain milestones, never by arbitrary action count.
const has=(a,prefix)=>a.some(k=>k.startsWith(prefix));
export function snowlinePlan(s,a=[]){
 const platform=a.find(k=>k.startsWith('platform-'));
 if(platform){let id=platform.slice(9);return {key:'high',name:has(a,'flap-route-')?'扑翼接远台':has(a,'ramp-')?'借坡接高台':'普通跳接高台',steps:[{label:has(a,'ramp-')?'借坡':'主动起跳',done:has(a,'ramp-')||has(a,'approach-')},...(has(a,'flap-route-')?[{label:'扑翼延伸',done:true}]:[]),{label:'接台',done:true},{label:'指定出口',done:a.includes('exit-'+id)}]};}
 const obstacles=s.obstacles.filter(o=>o.kind!=='arch');
 let steps=[];
 if(s.family==='ceiling'&&s.obstacles.some(o=>o.kind==='arch'))steps.push({label:'过低拱',done:has(a,'arch-pass-')});
 if(s.ramp)steps.push({label:'借坡落稳',done:has(a,'ramp-')});
 if(!s.ramp&&s.family==='relay')steps.push({label:'伙伴接上',done:has(a,'partner-ground-')});
 for(let o of obstacles)steps.push({label:o.kind==='log'?'越倒木':o.kind==='snowball'?'避雪球':o.kind==='icewall'?'越冰门':'越雪石',done:a.includes('clear-'+o.id)});
 steps.push({label:'接落坡出口',done:a.includes('low-slope-exit')});
 return {key:'low',name:s.family==='ceiling'?'过拱接落坡':s.family==='short'?'越障接落坡':'低路接落坡',steps};
}
export function snowlineReady(s,a){let p=snowlinePlan(s,a);return s.family!=='rest'&&p.steps.length>=2&&p.steps.every(x=>x.done);}
export function snowlineHint(s){return s.family==='ceiling'&&s.obstacles.some(o=>o.kind==='arch')?'留低路，过拱再跳':s.platforms.length?'借蓝色坡接高台，留低路也能接出口':s.ramp?'借坡起跳，顺着前方落坡收手':s.family==='rest'?'顺鱼群准备下一段':'越过雪石，再接住落坡';}
