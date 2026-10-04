export class AudioBus{constructor(){this.music=true;this.effects=true;this.context=null;this.nodes=new Set();this.suspended=true;this.lastBeat=-1;this.lastFish=-9;this.slide=null;}
 unlock(){try{if(!this.context){this.context=new(window.AudioContext||window.webkitAudioContext)();this.master=this.context.createGain();this.master.connect(this.context.destination);this.capture=this.context.createMediaStreamDestination();this.master.connect(this.capture);}if(this.context.state==='suspended')this.context.resume().catch(()=>{});}catch{}}
 tone(f,d=.1,type='sine',vol=.035,slide=null){let c=this.context;if(!c||c.state!=='running'||this.suspended)return;try{let o=c.createOscillator(),a=c.createGain();o.type=type;o.frequency.setValueAtTime(f,c.currentTime);if(slide)o.frequency.exponentialRampToValueAtTime(slide,c.currentTime+d);a.gain.setValueAtTime(Math.max(.0001,vol),c.currentTime);a.gain.exponentialRampToValueAtTime(.0001,c.currentTime+d);o.connect(a);a.connect(this.master);this.nodes.add(o);o.onended=()=>{o.disconnect();a.disconnect();this.nodes.delete(o)};o.start();o.stop(c.currentTime+d);}catch{}}
 noise(duration=.12,frequency=900,volume=.035){let c=this.context;if(!c||c.state!=='running'||this.suspended)return;try{let buffer=c.createBuffer(1,Math.ceil(c.sampleRate*duration),c.sampleRate),d=buffer.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*(1-i/d.length);let n=c.createBufferSource(),f=c.createBiquadFilter(),a=c.createGain();n.buffer=buffer;f.type='bandpass';f.frequency.value=frequency;f.Q.value=.7;a.gain.setValueAtTime(volume,c.currentTime);a.gain.exponentialRampToValueAtTime(.0001,c.currentTime+duration);n.connect(f);f.connect(a);a.connect(this.master);this.nodes.add(n);n.onended=()=>{n.disconnect();f.disconnect();a.disconnect();this.nodes.delete(n);};n.start();}catch{}}
 event(e){if(!this.effects)return;let now=this.context?.currentTime||0;
 if(e.type==='pickup'){if(e.kind==='fish'&&now-this.lastFish<.12)return;this.lastFish=now;this.tone(e.kind==='fish'?880:1100,.07,'sine',.018);}
 if(e.type==='jump'){this.noise(.11,650,.035);this.tone(160,.09,'triangle',.025);}
 if(e.type==='flap'){this.noise(.22,420,.075);this.tone(95,.16,'sine',.025);}
 if(e.type==='land'&&e.error<=60){this.noise(.11,e.material==='ice'?1600:e.material==='bridge'?360:800,.055);this.tone(e.material==='bridge'?95:e.grade==='干净落地'?190:130,.08,'triangle',.035);}
 if(e.type==='land'&&e.awarded){this.tone(520,.13,'triangle',.022,780);this.tone(1040,.16,'sine',.012);}
 if(e.type==='hit'){this.noise(e.severe?.28:.12,220,.065);this.tone(80,.16,'sine',.055);}
 if(e.type==='flowBank'&&e.awarded){this.noise(.32,1100,.035);this.tone(140,.3,'sine',.035,320);this.tone(660,.24,'triangle',.022);}
 if(e.type==='boost'&&e.factor>1.4){this.noise(.16,1000,.018);}
 if(e.type==='lineComplete'){this.tone(110,.18,'sine',.09);for(let f of [440,660,880])this.tone(f,.30,'triangle',.018);this.noise(.24,1500,.04);}
 if(e.type==='pressure'&&e.phase==='warning'){this.tone(55,.7,'sine',.045);this.noise(.4,180,.025);}
 if(e.type==='escape'){this.tone(660,.22,'triangle',.025);this.tone(990,.25,'sine',.02);}
 if(e.type==='mount'){this.tone(440,.15,'triangle',.022);this.tone(660,.17,'sine',.018);}
 if(['rescue','refill','shield'].includes(e.type))this.tone(820,.22,'sine',.04);
 }
 update(g){if(this.suspended)return;let c=this.context;if(this.effects&&c?.state==='running'){if(!this.slide){try{let noise=c.createBuffer(1,c.sampleRate*2,c.sampleRate),data=noise.getChannelData(0);let r=143;for(let i=0;i<data.length;i++){r=(Math.imul(r,1664525)+1013904223)>>>0;data[i]=((r/4294967296)*2-1)*.3;}let src=c.createBufferSource(),filter=c.createBiquadFilter(),gain=c.createGain();src.buffer=noise;src.loop=true;filter.type='lowpass';filter.frequency.value=600;gain.gain.value=.009;src.connect(filter);filter.connect(gain);gain.connect(this.master);src.start();this.slide={src,filter,gain};}catch{}}
 if(this.slide){let segment=g.level.segments.find(s=>g.p.x>=s.start&&g.p.x<s.end),bridge=g.p.platformId&&segment?.bridge;this.slide.filter.frequency.setTargetAtTime((350+g.p.speed*.75)*(bridge?.65:segment?.ice?1.7:1),c.currentTime,.10);this.slide.gain.gain.setTargetAtTime(g.p.grounded?.006+g.p.speed*.000008:.002,c.currentTime,.1);}}
 else if(this.slide){try{this.slide.src.stop();this.slide.src.disconnect();this.slide.filter.disconnect();this.slide.gain.disconnect();}catch{}this.slide=null;}
 if(!this.music)return;let interval=.25,key=Math.floor(g.time/interval);if(key===this.lastBeat)return;this.lastBeat=key;
 // Original 64-bar arrangement; each region owns a scale, phrase, palette and pulse.
 let theme=g.level.segments.find(s=>g.p.x>=s.start&&g.p.x<s.end)?.theme||0;
 let palettes=[{root:146.83,scale:[0,2,4,7,9],wave:'triangle',phrase:[0,2,4,null,3,2,1,null]},{root:130.81,scale:[0,2,3,7,10],wave:'sine',phrase:[0,null,3,2,4,null,1,2]},{root:164.81,scale:[0,2,3,5,8],wave:'sine',phrase:[0,null,2,null,4,3,null,1]},{root:174.61,scale:[0,2,4,7,11],wave:'triangle',phrase:[0,3,null,4,2,1,3,null]}];
 let a=palettes[theme],bar=Math.floor(key/8),section=Math.floor(bar/8)%8,beat=key%8,roots=[0,-5,-3,-7,0,-3,-5,2],root=a.root*Math.pow(2,roots[Math.floor(bar/2)%8]/12),degree=a.phrase[(beat+(section%3)*2)%8];let danger=g.mode!=='practice'&&(g.pressureState==='pressure'||g.p.lead<600),flow=g.flow?.count||0;
 if(degree!==null&&(section!==6||beat%2===0))this.tone(root*Math.pow(2,(a.scale[degree]+(section>=4?12:0))/12),theme===2?.9:.38,a.wave,.012);
 if(beat===0){this.tone(root/2,1.6,'sine',.016);this.tone(root*1.5,1.3,'sine',.005);}
 if(beat%2===0&&theme!==2)this.tone(theme===1?75:60,.08,'sine',.014);
 if(theme===2&&beat===4)this.tone(root*2,.8,'sine',.008);
 if(flow>=2&&beat%2===1)this.tone(root*Math.pow(2,a.scale[(beat+bar)%5]/12)*2,.14,'triangle',.009);
 if(danger&&beat%2===0){this.tone(51+beat*3,.13,'triangle',.014);this.noise(.045,theme===2?240:450,.008);}
 if(g.p.boostTime>0&&g.p.speed>1000&&beat===6)this.tone(root*3,.18,'sine',.008);
 }

 pause(v){this.suspended=v;for(let o of this.nodes){try{o.stop();o.disconnect()}catch{}}this.nodes.clear();if(this.slide){try{this.slide.src.stop();this.slide.src.disconnect();this.slide.filter.disconnect();this.slide.gain.disconnect()}catch{}this.slide=null;}this.lastBeat=-1;}
}
