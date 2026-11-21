import {newGame} from './model.js?v=20261123b';
// A disposable demonstration, never a migration of the player's production farm.
export function makeRainDemo(now=Date.now()){let s=newGame(now-48*3600000);s.at=now;s.coins=5000;s.xp=320;s.orchard.trees=[['apple',48],['pear',24],['peach',6]].map(([id,h])=>({id,born:now-h*3600000,collected:0,care:0}));s.orchard.basketCount=0;return s;}
