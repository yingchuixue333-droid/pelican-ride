// Original generated artwork. One image load per atlas; all game state stays in model.js.
const slots={
 a:['radish','wheat','lettuce','cabbage','carrot','berry','potato','spinach','tomato','corn','bean','apple','eggplant','pumpkin','blueberry','cucumber','sweetpotato',null,null,'watermelon'],
 b:['broccoli','peach',null,'pineapple','lemon','grape','mushroom','lotus','orange','sunflower','garlic','pear',null,null,'cherry','lychee',null,'pepper',null,'melon'],
 c:['onion','rice','moon','banana','strawflower','asparagus','kiwi','seedling']
};
export const SPRITES=Object.fromEntries(Object.entries(slots).flatMap(([sheet,ids])=>ids.flatMap((id,index)=>id?[[id,{sheet,index,columns:4,rows:sheet==='c'?2:5}]]:[])));
export const images={};
const load=(key,file)=>new Promise(resolve=>{if(typeof Image==='undefined')return resolve(false);let img=new Image();img.onload=()=>{images[key]=img;resolve(true);};img.onerror=()=>resolve(false);img.src=new URL('./assets/'+file,import.meta.url).href;});
export const assetsReady=Promise.all([load('garden','garden.webp'),load('a','crops-a.webp'),load('b','crops-b.webp'),load('c','crops-c.webp')]);
export function sprite(ctx,id,x,baseline,width,height=width){const cell=SPRITES[id],img=cell&&images[cell.sheet];if(!img)return false;let sw=img.width/cell.columns,sh=img.height/cell.rows;let px=sw*.035,py=sh*.035;ctx.drawImage(img,(cell.index%cell.columns)*sw+px,Math.floor(cell.index/cell.columns)*sh+py,sw-px*2,sh-py*2,x-width/2,baseline-height,width,height);return true;}
