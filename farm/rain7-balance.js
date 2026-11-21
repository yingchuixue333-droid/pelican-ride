// Formal release only. The archived rain6 playtest keeps its original rules.
export const rain7Release=typeof location!=='undefined'&&
 !location.pathname.includes('/orchard-preview/')&&
 !new URLSearchParams(location.search).has('orchardPreview');

// Minutes, seed price, units per harvest, gross value, XP, unlock, harvests, regrowth minutes.
export const RAIN7_CROPS={
 rice:[240,95,6,360,42,1,1,0],
 watermelon:[360,160,3,630,52,3,1,0],
 nightwheat:[720,270,8,1080,68,7,1,0],
 starwumpkin:[960,380,4,1600,80,10,1,0],
 radish:[5,0,4,8,8,1,1,0],
 wheat:[30,8,5,20,35,1,1,0],
 lettuce:[180,18,4,48,85,4,1,0],
 bean:[480,35,5,95,140,8,1,0],
 berry:[45,45,6,60,17,2,3,45],
 tomato:[60,75,5,110,23,5,3,60],
 pumpkin:[180,90,2,290,36,9,1,0],
 blueberry:[120,150,13,195,34,15,3,120]
};

export const RAIN7_EXPANSIONS=[
 {level:5,cost:900,count:8},{level:12,cost:3200,count:10},{level:20,cost:7600,count:12}
];
export const RAIN7_FIELD_COST=[0,180,300,500,750,1050,1400,1800,2300,3000];
export const RAIN7_FIELD_UNLOCK=[1,1,2,3,5,7,9,12,15,20];
export const RAIN7_XP=Array.from({length:59},(_,i)=>i<9?100:i<19?250:i<39?550:900);
export const RAIN7_FRUIT={peach:104,plum:88,pear:72};
