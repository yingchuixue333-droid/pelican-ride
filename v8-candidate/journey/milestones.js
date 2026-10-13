export const MILESTONES=[
 {id:'ice-fox',name:'杉林同伴',goal:'保留雪狐，完成冰河低路',outfit:1},
 {id:'cave-link',name:'晶洞穿行',goal:'穿过低拱，再完成晶台高路',outfit:2},
 {id:'cloud-return',name:'海风领航',goal:'用扑翼接远云台，完成出口',outfit:3},
 {id:'clean-three',name:'三次干净',goal:'不中断地完成三次干净翻转落地'},
 {id:'flow-three',name:'顺接大师',goal:'接上三个不同机会并收线'},
 {id:'bear-save',name:'雪团守护',goal:'让雪团兽挡住一次重撞'}
];
export function nextGoal(g,progress){
 if(g.stats.hits.length)return {text:g.stats.hits.at(-1).reason+'：练刚才这一段',practice:true};
 if(!progress.achievements.includes('clean-three'))return {text:'借坡转一圈，松手接正，试一次干净落地',task:1};
 if(!progress.achievements.includes('cloud-return'))return {text:'保留一次扑翼，接住远台再回雪道',task:2};
 if(!progress.achievements.includes('flow-three'))return {text:'高台出口再起跳，试三个机会顺接收线',practice:true};
 return {text:'试另一条路线，保住伙伴完成出口',practice:true};
}
export function usableGhost(record,seed){return record?.seed===seed&&Array.isArray(record.points)&&record.points.length>2&&record.points.length<=900&&record.points.every(p=>Array.isArray(p)&&p.length>=4&&p.slice(0,4).every(Number.isFinite));}
export function ghostPose(points,time){if(!points?.length||time>points.at(-1)[0])return null;let lo=0,hi=points.length-1;while(lo<hi){let m=Math.ceil((lo+hi)/2);if(points[m][0]<=time)lo=m;else hi=m-1;}let a=points[lo],b=points[Math.min(lo+1,points.length-1)],u=Math.max(0,Math.min(1,(time-a[0])/(b[0]-a[0]||1)));return {x:a[1]+(b[1]-a[1])*u,y:a[2]+(b[2]-a[2])*u,angle:a[3]+Math.atan2(Math.sin(b[3]-a[3]),Math.cos(b[3]-a[3]))*u,mount:a[4]?{kind:a[4],time:1}:null,grounded:!!a[5],rotation:a[6]||0,wing:a[7]||0,speed:a[8]||760};}
