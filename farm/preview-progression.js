export const SEED_CATEGORIES=[
 {id:'gold',label:'高金币',crops:['rice','watermelon','nightwheat','starwumpkin']},
 {id:'xp',label:'高经验',crops:['radish','wheat','lettuce','bean']},
 {id:'variant',label:'可变异',crops:['berry','tomato','pumpkin','blueberry']}
];
const variantSeeds=new Set(SEED_CATEGORIES[2].crops);
export function harvestMutation(state,id){
 if(!state.fieldProgress||!variantSeeds.has(id))return false;
 const misses=state.fieldProgress.misses;
 const serial=state.stats[id].harvest;
 const mutated=misses>=3||(serial*13+id.charCodeAt(0))%7===0;
 state.fieldProgress.misses=mutated?0:misses+1;
 return mutated;
}

const speed=[1,.97,.94,.9,.87,.84,.8,.77,.74,.70];
const bonus=[1,1,1,1.1,1.1,1.1,1.25,1.25,1.25,1.4];
const cost=[0,140,280,600,900,1200,1800,2500,3400,4800];
const unlock=[1,1,2,3,4,5,6,7,8,9];
export const FIELD_LEVELS=speed.map((value,i)=>({
 name:'Lv.'+(i+1)+' / 10',level:unlock[i],cost:cost[i],speed:value,bonus:bonus[i]
}));
export function enableFieldProgress(state){
 if(state.fieldProgress)return false;
 state.fieldProgress={misses:0};
 state.soil=state.soil.map(tier=>[0,3,6][tier]);
 return true;
}
