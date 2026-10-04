// Specific skills are compatible with V6 saves. Buttons never grant mastery.
export const SKILLS=['jump','flip','flap','route'];
export function needsHelp(progress,skill,skip=false){return !skip&&SKILLS.includes(skill)&&!progress.learned.includes(skill);}
export function skillEvent(e){if(e.type==='land'&&e.awarded&&e.turns>=1)return 'flip';if(e.type==='land'&&e.successful&&e.flapUsed&&e.error<=60&&!e.reason)return 'flap';if(e.type==='land'&&e.successful&&!e.trick&&e.launchX!==undefined&&e.error<=60&&!e.reason)return 'jump';if(e.type==='route')return 'route';return null;}
export const LESSONS=[{name:'借坡普通跳',goal:'在蓝色起跳区轻点，松手，接住浅蓝落区。',gesture:'先看坡，再点开始。普通跳不用按住。'},{name:'一圈后收手',goal:'在起跳区按住转一圈，松手，顺着落坡接正。',gesture:'松手停止主动转动，角色仍会回落。'},{name:'扑翼接远台',goal:'先普通借坡跳，下降前再轻点一次扑翼，接远台。',gesture:'每跳一次扑翼。留到需要延长回落时再用。'}];
export function lessonTask(stage){return LESSONS[Math.min(2,Math.max(0,stage))];}
