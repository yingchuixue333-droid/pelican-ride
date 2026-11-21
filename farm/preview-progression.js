import {rain7Release,RAIN7_FIELD_COST,RAIN7_FIELD_UNLOCK} from './rain7-balance.js?v=20261123a';
export const SEED_CATEGORIES=[
 {id:'gold',label:'高金币',crops:['rice','watermelon','nightwheat','starwumpkin']},
 {id:'xp',label:'高经验',crops:['radish','wheat','lettuce','bean']},
 {id:'variant',label:'可变异',crops:['berry','tomato','pumpkin','blueberry']}
];
const variantSeeds=new Set(SEED_CATEGORIES[2].crops);
export function harvestMutation(state,id,roll=null){
 if(!state.fieldProgress||!variantSeeds.has(id))return false;
 const misses=state.fieldProgress.misses;
 const serial=state.stats[id].harvest;
 let randomHit=(serial*13+id.charCodeAt(0))%7===0;
 if(state.economy===7){
  // The next roll lives in the save, so a quote on a clone agrees with collection.
  const seed=state.fieldProgress.roll??((state.at^state.xp^0x6a09e667)>>>0);
  state.fieldProgress.roll=(Math.imul(seed,1664525)+1013904223)>>>0;
  randomHit=(roll?roll():state.fieldProgress.roll/4294967296)<.12;
 }
 const mutated=misses>=3||randomHit;
 state.fieldProgress.misses=mutated?0:misses+1;
 return mutated;
}

const speed=[1,.97,.94,.9,.87,.84,.8,.77,.74,.70];
const bonus=[1,1,1,1.1,1.1,1.1,1.25,1.25,1.25,1.4];
const cost=[0,140,280,600,900,1200,1800,2500,3400,4800];
const unlock=[1,1,2,3,4,5,6,7,8,9];
export const FIELD_LEVELS=speed.map((value,i)=>({
 name:'Lv.'+(i+1)+' / 10',level:rain7Release?RAIN7_FIELD_UNLOCK[i]:unlock[i],cost:rain7Release?RAIN7_FIELD_COST[i]:cost[i],speed:value,bonus:bonus[i]
}));
export function enableFieldProgress(state){
 if(state.fieldProgress)return false;
 state.fieldProgress={misses:0};
 state.soil=state.soil.map(tier=>[0,3,6][tier]);
 return true;
}
