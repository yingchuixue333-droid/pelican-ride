export function layout(width,height){const scale=Math.min(width/1000,height/1000);return {scale,x:(width-scale*1000)/2,y:(height-scale*1000)/2};}
