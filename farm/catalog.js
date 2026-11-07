// All times are this game's design, not copied commercial game balance.
const rows=[
 ['radish','樱桃萝卜',1,2,0,10,'短作','radish','#d66b6b'],
 ['wheat','小麦',1,4,3,16,'短作','wheat','#d6ab57'],
 ['lettuce','生菜',2,6,4,22,'短作','leaf','#86ab60'],
 ['cabbage','小白菜',3,10,6,30,'短作','leaf','#a0bc72'],
 ['carrot','胡萝卜',4,30,10,48,'中作','carrot','#e7a04e'],
 ['berry','草莓',5,45,28,42,'再生','berry','#d96b7e',4,30],
 ['potato','土豆',6,60,16,75,'中作','root','#bda36c'],
 ['spinach','菠菜',7,8,7,30,'短作','leaf','#548963'],
 ['tomato','番茄',8,60,40,55,'再生','tomato','#d97353',4,45],
 ['corn','甜玉米',9,90,24,108,'中作','corn','#e3c15d'],
 ['bean','豌豆',10,10,10,40,'短作','pod','#86ab5c'],
 ['apple','苹果树',11,240,180,130,'果树','tree','#dc775d',6,120],
 ['cucumber','黄瓜',12,90,48,68,'再生','vine','#759b51',5,60],
 ['pumpkin','蜜糖南瓜',13,120,34,150,'中作','pumpkin','#dc9b46'],
 ['onion','紫洋葱',14,45,18,78,'中作','root','#b58ca8'],
 ['rice','水稻',15,240,48,220,'长作','wheat','#c3b96d'],
 ['pepper','彩椒',16,120,70,95,'再生','pepper','#dc9a4e',4,90],
 ['pear','雪梨树',17,300,230,170,'果树','tree','#c9bf64',6,180],
 ['moon','月光花',18,120,40,170,'中作','moon','#a49bce'],
 ['garlic','大蒜',19,60,24,102,'中作','root','#d9d0bd'],
 ['eggplant','茄子',20,120,80,110,'再生','vine','#9980b3',5,90],
 ['watermelon','西瓜',21,360,80,340,'长作','melon','#79a366'],
 ['peach','水蜜桃树',22,300,260,190,'果树','tree','#e0a092',6,180],
 ['broccoli','西兰花',23,90,32,138,'中作','leaf','#658b5f'],
 ['sunflower','向日葵',24,240,58,260,'长作','flower','#deb65e'],
 ['blueberry','蓝莓',25,120,90,120,'再生','berry','#8397b9',5,90],
 ['orange','甜橙树',26,360,300,220,'果树','tree','#e1a354',6,240],
 ['sweetpotato','红薯',27,240,64,280,'长作','root','#b88b8b'],
 ['mushroom','香菇',28,60,28,116,'中作','mushroom','#a68b77'],
 ['grape','葡萄',29,120,120,165,'再生','grape','#a18bb9',5,120],
 ['banana','香蕉树',30,360,330,245,'果树','tree','#dec262',6,240],
 ['strawflower','百日菊',31,90,36,150,'中作','flower','#d79388'],
 ['pineapple','菠萝',32,420,100,420,'长作','pineapple','#c7b263'],
 ['cherry','樱桃树',33,360,360,265,'果树','tree','#cb7582',6,240],
 ['melon','哈密瓜',34,300,80,335,'长作','melon','#d4b976'],
 ['asparagus','芦笋',35,120,100,135,'再生','pod','#89a777',5,90],
 ['lemon','柠檬树',36,420,400,300,'果树','tree','#e1cf69',6,240],
 ['lotus','莲藕',37,480,120,500,'长作','lotus','#c5aa91'],
 ['kiwi','猕猴桃树',38,420,430,320,'果树','tree','#a7ab6b',6,240],
 ['lychee','荔枝树',40,480,480,360,'果树','tree','#d28b8d',6,240]
];
export const CROPS=rows.map(([id,name,level,minutes,cost,coins,group,shape,color,harvests=1,regrow=0])=>({id,name,short:name.replace('樱桃萝卜','萝卜').replace('蜜糖南瓜','南瓜').replace('树',''),level,seconds:minutes*60,minutes,cost,coins,xp:Math.max(1,Math.round(Math.sqrt(minutes)*.9)),group,shape,color,harvests,regrowSeconds:regrow*60}));
export const crop=id=>CROPS.find(c=>c.id===id);
export const EXPANSIONS=[{level:5,cost:240,count:8},{level:12,cost:1800,count:10},{level:22,cost:6000,count:12}];
export const SOILS=[{name:'普通田',level:1,cost:0,speed:1,bonus:1},{name:'肥沃田',level:10,cost:600,speed:.9,bonus:1.1},{name:'丰饶田',level:25,cost:1800,speed:.8,bonus:1.25}];
export const formatTime=seconds=>{let n=Math.max(0,Math.ceil(seconds));if(n<60)return n+'秒';if(n<3600)return Math.ceil(n/60)+'分钟';let h=Math.floor(n/3600),m=Math.ceil((n%3600)/60);if(m===60){h++;m=0;}return h+'小时'+(m?m+'分':'');};
