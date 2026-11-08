import {writeFileSync} from 'node:fs';
import {CROPS} from '../farm/catalog.js';
import {cropComparison} from '../farm/planning.js';
const rows=CROPS.map(c=>({id:c.id,name:c.name,level:c.level,group:c.group,cost:c.cost,harvests:c.harvests,...cropComparison(c)}));
const rank=key=>rows.toSorted((a,b)=>b[key]-a[key]).slice(0,6).map(r=>({id:r.id,name:r.name,value:Number(r[key].toFixed(2))}));
const report={assumptions:'普通田、不浇水、成熟即采收、完成全部茬数后立即再种；未计升级奖励与离线耽搁。操作按单块播种/采收计，未把一键批量折算成一次。不代表真人每天收益。',topCoinsPerHour:rank('coinsPerHour'),topXpPerHour:rank('xpPerHour'),topCoinsPerAction:rank('coinsPerAction'),rows};
writeFileSync(new URL('../farm-economy-review.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
let md='# V2.4 作物收益比较（分析，不改数值）\n\n'+report.assumptions+'\n\n';for(let [title,key]of [['单位时长金币','topCoinsPerHour'],['单位时长经验','topXpPerHour'],['每次地块操作净收益','topCoinsPerAction']]){md+='## '+title+'\n\n| 作物 | 基准值 |\n| --- | ---: |\n';for(let r of report[key])md+='| '+r.name+' | '+r.value+' |\n';md+='\n';}
md+='## 结论与待讨论项\n\n免费萝卜的理论金币效率为300币/小时，理论经验为30/小时；小麦经验效率也为30/小时。连续及时种收时，萝卜在金币效率上领先全部其他品种，确有后期短作品种吸引力不足的问题。\n\n这不等于萝卜适合所有访问方式：萝卜需要每2分钟回来种收；长作及果树的单次采收收益和每次操作收益显著更高，适合较长离线。比较面板应把初熟和完整周期分开，不能用一茬时间配全部茬数收益。\n\n建议下一轮讨论提高部分中后期短作的收益或经验，使解锁新品种对连续游玩也有价值；免费萝卜继续兜底。调整前需要按原定每天多次短时访问重新模拟约一个月解锁节奏，不通过延长等待或增加每日限制来平衡。本轮未调整任何品种、时间、成本、收益、等级或土壤参数。\n';writeFileSync(new URL('../FARM-ECONOMY-REVIEW.md',import.meta.url),md);console.log(JSON.stringify({coins:report.topCoinsPerHour,xp:report.topXpPerHour,perAction:report.topCoinsPerAction},null,2));
