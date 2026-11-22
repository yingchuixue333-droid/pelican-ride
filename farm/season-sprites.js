// Atlas coordinates are x, y, width and height, measured after alpha trimming.
const trees={"peach":[[2,2,260,245],[2,362,404,282],[2,722,416,332]],"plum":[[422,2,273,214],[422,362,400,259],[422,722,416,311]],"pear":[[842,2,201,249],[842,362,288,281],[842,722,388,356]]};
const stages={"radish":[[2,2,191,150],[2,223,251,170],[2,444,251,209]],"rice":[[257,2,211,217],[257,223,237,217],[257,444,226,217]],"pumpkin":[[512,2,248,177],[512,223,251,100],[512,444,251,119]]};

const extra={"snowpea":[2,2,204,180],"okra":[2,186,214,180],"tomato":[2,370,217,179],"romanesco":[223,2,217,154],"ginger":[223,186,217,167],"blueberry":[223,370,217,158],"dragonfruit":[444,2,217,180],"glasscorn":[444,186,217,165],"lettuce":[444,370,217,158]};

const sprites={};
function load(key,file){
 if(typeof Image==='undefined')return Promise.resolve();
 return new Promise(resolve=>{
  const image=new Image();
  image.onload=()=>{sprites[key]=image;resolve();};
  image.onerror=()=>resolve();
  image.src=new URL('./rain-assets/'+file,import.meta.url);
 });
}
export const seasonArtReady=Promise.all([
 load('trees','season-trees.webp'),load('stages','season-stages.webp'),load('extra','season-extra.webp'),load('fruits','items.webp'),
]);
export const seasonTreesReady=()=>!!sprites.trees;
export const seasonCropsReady=()=>String(!!sprites.stages)+String(!!sprites.extra);

export function treePicture(id,stage){
 const source=trees[id]?.[stage===3?2:stage===0?0:1];
 return source&&sprites.trees?{image:sprites.trees,source}:null;
}

export function cropPicture(c,id,x,y,phase,scale=1){
 if(phase===4&&extra[id]&&sprites.extra){
  const source=extra[id],w=Math.min(145,125*source[2]/source[3])*scale,h=w*source[3]/source[2];
  c.drawImage(sprites.extra,...source,x-w/2,y-h,w,h);
  return true;
 }
 const list=stages[id];
 if(!list||!sprites.stages)return false;
 const source=list[phase===0?0:phase===4?2:1];
 const widths={radish:[57,105,113,123,145],rice:[57,94,109,119,144],pumpkin:[58,104,132,143,168]};
 const w=widths[id][phase]*scale,h=w*source[3]/source[2];
 c.drawImage(sprites.stages,...source,x-w/2,y-h,w,h);
 return true;
}

export function fruitPicture(c,id,x,y,r,look={}){
 const image=sprites.fruits;
 if(!image||!(id==='peach'||id==='pear'))return false;
 const col=id==='pear'?1:0,row=id==='peach'?1:0,w=image.width/2,h=image.height/2;
 c.save();c.translate(x,y);c.rotate(look.turn||0);c.scale(look.size||1,look.size||1);
 c.drawImage(image,col*w,row*h,w,h,-r*1.4,-r*1.48,r*2.8,r*2.8);c.restore();
 return true;
}
