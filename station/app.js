import {STATION_VERSION,STATE_KEY,PHASES,OBJECTS,shanghaiDay,currentPhase,dailyScene,readState,writeState,foundToday,collectObject,addCard,mergeBackup,backupData,LENS_MARKS,LENS_TARGET,turnLens,alignedLenses,lightBeacon,beaconCard,keepBayLetter} from './state.js?v=20261031-s2';
import {createWorld,paintPostcard} from './scene.js?v=20261031-s2';
const $=id=>document.getElementById(id),body=$('sheetBody'),sheet=$('sheet'),frame=$('journeyFrame');
let storage;try{storage=localStorage;}catch{storage={getItem:()=>null,setItem:()=>{throw Error('storage disabled');}};}
let saveAvailable=true;
let state=readState(storage),day=shanghaiDay(),daily=dailyScene(day),phase=state.phase||currentPhase(),place=state.place||'valley',pendingBay=false,world,mapping,noticeTimer,context,sound=false,lastRunNotice='',arrivedRuns=new Set(),opening=null,cardDraft='',editorPhase=phase;
const names={dawn:'晨光',dusk:'暮色',night:'星夜'},icons={dawn:'☀',dusk:'◒',night:'☾'};
const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
function button(text,action,cls='secondary'){let b=el('button',text,cls);b.type='button';b.onclick=action;return b;}
function note(text,seconds=3){$('notice').textContent=text;$('notice').classList.add('visible');clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>$('notice').classList.remove('visible'),seconds*1000);}
function fresh(){return saveAvailable?readState(storage):state;}
function persist(next){state={...next,place};const saved=writeState(storage,state);saveAvailable=saved;if(!saved)note('这次还没能保存。可以从旅行箱导出备份。',5);refresh();return saved;}
function chime(){if(!sound||document.hidden)return;try{context??=new AudioContext();context.resume();let t=context.currentTime;for(let i=0;i<3;i++){let osc=context.createOscillator(),gain=context.createGain();osc.type='sine';osc.frequency.value=(place==='bay'?[392,523.25,659.25]:[523.25,659.25,783.99])[i];gain.gain.setValueAtTime(0,t+i*.12);gain.gain.linearRampToValueAtTime(.045,t+i*.12+.015);gain.gain.exponentialRampToValueAtTime(.0001,t+i*.12+1.3);osc.connect(gain);gain.connect(context.destination);osc.start(t+i*.12);osc.stop(t+i*.12+1.4);}}catch{sound=false;updateSound();}}
function updateSound(){$('sound').setAttribute('aria-pressed',String(sound));$('sound').replaceChildren(document.createTextNode('♪'),el('span',sound?'风铃开':'风铃关'));}
function position(){if(!mapping)return;for(const node of document.querySelectorAll('[data-x][data-y]')){node.style.left=mapping.x+Number(node.dataset.x)*mapping.scale+'px';node.style.top=mapping.y+Number(node.dataset.y)*mapping.scale+'px';}}
function refresh(){
 document.body.dataset.phase=phase;
 $('phase').replaceChildren(document.createTextNode(icons[phase]),el('span',names[phase]));$('phase').setAttribute('aria-label','切换小站时光，当前'+names[phase]);
 const bay=place==='bay';
 $('dateLabel').textContent=day.replaceAll('-',' / ')+'  ·  '+(bay?'海湾第二站':'雪谷第一站');
 $('welcomeTitle').textContent=bay?'远方，也有一盏灯。':'来，坐一会儿。';$('welcomeCopy').textContent=bay?(state.bay.lit?'你留下的光，正在照着海面。':'潮水正在退去，灯塔等着下一位守望者。'):'没有急事。可以散步，也可以去一趟远方。';
 $('valleyTab').setAttribute('aria-pressed',String(!bay));$('bayTab').setAttribute('aria-pressed',String(bay));
 for(const id of ['cabin','post','trail'])$(id).hidden=bay;for(const id of ['bayDock','beacon','bottle'])$(id).hidden=!bay;$('objects').hidden=bay;
 $('world').setAttribute('aria-label',bay?'可探索的海湾灯塔':'可探索的雪境小站');$('scene').setAttribute('aria-label',bay?'海浪、木码头、漂流瓶与可以点亮的灯塔。轻点空地让旅人走过去。':'雪山、木屋、邮局和一条通往远方的路。轻点空地让旅人走过去。');
 $('beaconStatus').textContent=state.bay.lit?'光已经送往海面':'有一盏灯，等你点亮';$('footerPlace').textContent='樱吹雪的雪境 · '+(bay?'海湾第二站':'雪谷第一站');
 $('activityTitle').textContent=bay?(state.bay.lit?'留一盏光，给晚归的人':'灯室里的三面镜片'):'今天的小小发现';$('letterTitle').textContent=bay?'读一封海边的来信':'读一封山里的短笺';$('letterSubtitle').textContent=bay?'一封留给后来者的瓶中信':'来自这个小世界的一段故事';
 $('weather').textContent='此刻雪境 · '+(bay?'海风':daily.weather)+'  /  '+names[phase];
 const found=foundToday(state,day);$('walkCount').textContent=found.length+' / 3';$('walkProgress').textContent=found.length===3?'今天的纪念卡，已经夹进旅行箱。':'轻点雪里的小物，收集今天的三件发现。';
 $('objects').replaceChildren();for(const object of daily.objects){const got=found.includes(object.id),b=button('',()=>find(object),'found-object'+(got?' collected':''));b.dataset.kind=object.id;b.dataset.x=object.x;b.dataset.y=object.y;b.setAttribute('aria-label',(got?'已找到':'拾起')+object.name);b.disabled=got;b.append(el('span',got?'✓':object.symbol));$('objects').append(b);}
 if(bay){$('walkCount').textContent=state.bay.lit?'已点亮':alignedLenses(state)+' / 3';$('walkProgress').textContent=state.bay.lit?'点灯纪念卡，已留在旅行箱。':'转动镜片，让星、浪、月各归其位。';}
 position();world?.set({phase,daily,place,bay:state.bay});
}
function changePlace(next){if(!['valley','bay'].includes(next))return;place=next;state=fresh();persist({...state,place});world.arrive();if(next==='bay'&&!state.bay.lit)note('码头边有一只漂流瓶，灯塔的故事从那里开始。',4);}
function find(object){
 state=fresh();if(foundToday(state,day).includes(object.id))return;
 const before=foundToday(state,day).length,next=collectObject({...state,phase},day,object.id),saved=persist(next);world.move(object.x,object.y);chime();
 if(saved)note(before===2?'三件小物找齐了。今天的纪念卡，替你夹进旅行箱。':'找到了'+object.name+'。');
}
function open(title,eyebrow='SNOWBOUND STATION'){opening=document.activeElement;$('sheetTitle').textContent=title;$('sheetEyebrow').textContent=eyebrow;body.replaceChildren();if(!sheet.open)sheet.showModal();world?.setVisible(false);sheet.scrollTop=0;chime();}
function close(){sheet.close();opening?.focus?.();}
sheet.addEventListener('close',()=>{if($('journeyShell').hidden)world?.setVisible(true);});
$('closeSheet').onclick=close;sheet.addEventListener('click',e=>{if(e.target===sheet){const r=sheet.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close();}});
function letter(){
 open('山里来的一封短笺','A NOTE FROM THE MOUNTAINS');
 body.append(el('p',day+' · '+daily.weather,'quiet-copy'),el('p',daily.letter,'letter-paper'),el('p','这是雪境里的虚构小故事，每天翻到一页。','quiet-copy'));
 body.append(button('给自己也留一句话',()=>editor()));
}
function walk(){
 open('今天的小小发现','THREE LITTLE THINGS');
 body.append(el('p','灯、蓝羽和松果，散落在小站的雪地里。\n找齐后，会留下今天独有的一枚印记。明天来不来都没关系。','sheet-copy'));
 const list=el('ul',undefined,'walk-list'),found=foundToday(state,day);
 for(const o of OBJECTS){let li=el('li',undefined,found.includes(o.id)?'done':'');li.append(el('span',found.includes(o.id)?'✓':o.symbol),document.createTextNode(o.name));list.append(li);}body.append(list);
 body.append(el('p',found.length===3?'今日印记：'+daily.stamp:'轻点地图里的三件小物；也可以只在这里坐一会儿。','quiet-copy'));
 body.append(button(found.length===3?'去看看纪念卡':'回雪地找找',found.length===3?gallery:close,'primary'));
}
function download(blob,name){const url=URL.createObjectURL(blob),a=el('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),15000);}
function exportCard(card){let canvas=document.createElement('canvas');paintPostcard(canvas,card);canvas.toBlob(blob=>{if(blob){download(blob,'snowbound-'+card.day+'.png');note('明信片图片已生成。');}else note('这次没有生成图片，请再试一次。');},'image/png');}
function viewCard(card){
 open(card.source==='beacon'?'点灯人的纪念卡':card.source==='bottle'?'海湾来信':card.source==='walk'?'一张散步纪念卡':'给自己的明信片','POSTCARD  /  '+card.day);
 const canvas=el('canvas',undefined,'post-preview');canvas.setAttribute('aria-label','明信片预览：'+card.text);paintPostcard(canvas,card);body.append(canvas,el('p',card.text,'letter-paper'),el('p',card.day+' · '+names[card.phase]+' · '+(card.source==='beacon'?'海湾灯塔 · 点灯纪念':card.source==='bottle'?'给后来的人':card.source==='walk'?dailyScene(card.day).stamp:'寄存在雪境的片刻'),'quiet-copy'));
 let row=el('div',undefined,'button-row');row.append(button('保存明信片图片',()=>exportCard(card),'primary'),button('回到旅行箱',gallery));body.append(row);
}
function editor(){
 open('写给此刻的自己','THE MOUNTAIN POST OFFICE');
 const preview=el('canvas',undefined,'post-preview'),label=el('label','想把什么留在这里？','field-label'),input=el('textarea');label.htmlFor='postText';input.id='postText';input.maxLength=280;input.placeholder='比如：今天也没做什么了不起的事，但这阵雪很好看。';input.value=cardDraft;
 const count=el('p','','quiet-copy'),picker=el('div',undefined,'palette-picker');picker.setAttribute('aria-label','选择明信片时光');
 let paletteButtons=[];const draft=()=>({id:'draft',day,text:input.value.trim()||'今天，也在这里停留了一会儿。',phase:editorPhase,source:'note',place});
 const render=()=>{cardDraft=Array.from(input.value).slice(0,140).join('');if(input.value!==cardDraft)input.value=cardDraft;count.textContent=Array.from(cardDraft).length+' / 140 字';paintPostcard(preview,draft());for(let b of paletteButtons)b.setAttribute('aria-pressed',String(b.dataset.phase===editorPhase));};
 for(const p of PHASES){let b=button(names[p],()=>{editorPhase=p;render();},'');b.dataset.phase=p;paletteButtons.push(b);picker.append(b);}
 input.oninput=render;preview.setAttribute('aria-label','正在编写的明信片预览');body.append(preview,el('p','选一个时刻，把今天的一小段心情留在这里。','quiet-copy'),picker,label,input,count);
 const row=el('div',undefined,'button-row');row.append(button('放进旅行箱',()=>{if(!input.value.trim()){input.focus();note('先写一句想留下的话吧。');return;}state=fresh();const card={...draft(),id:'note-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,6)};if(persist(addCard(state,card))){cardDraft='';chime();viewCard(card);note('收好了。以后可以再翻出来。');}},'primary'),button('存成图片',()=>exportCard(draft())));body.append(row,el('p','内容保存在当前浏览器，不会寄给任何人。旅行箱可导出备份。','quiet-copy'));render();
}
function gallery(){
 state=fresh();open('旅人的旅行箱','POSTCARDS & LITTLE JOURNEYS');
 if(!saveAvailable)body.append(el('p','当前内容暂留在这次打开的页面里，请先导出旅行箱备份。','quiet-copy'));
 body.append(el('p',state.cards.length+' 张明信片 · '+state.runs.length+' 段雪路纪行','quiet-copy'));
 if(!state.cards.length)body.append(el('p','旅行箱里还留着空位。\n去邮局写一句话，或找齐雪地里的三件小物。','empty-state'));
 else{let grid=el('div',undefined,'card-grid');for(const card of [...state.cards].reverse()){let b=button('',()=>viewCard(card),'memory-card');b.dataset.phase=card.phase;b.append(el('span',card.day,'memory-day'),el('p',card.text),el('small',card.source==='beacon'?'海湾灯塔 · 点灯纪念':card.source==='bottle'?'海湾来信 · 瓶中信':card.source==='walk'?'散步纪念 · '+dailyScene(card.day).stamp:'给自己的一句话'));grid.append(b);}body.append(grid);}
 body.append(button('再写一张',editor));
 if(state.bay.lit)body.append(button('重看点灯纪念',()=>viewCard(beaconCard(state))));
 body.append(el('h3','雪路纪行','section-title'));
 if(!state.runs.length)body.append(el('p','出发去灯塔，或只滑一小段。\n一段超过 15 秒的正式旅程，会在这里留下一张路签。','empty-state'));
 for(const run of [...state.runs].reverse().slice(0,15)){
 const row=el('div',undefined,'run-entry'),words=el('div');words.append(el('b',run.percent>=100?'抵达海湾灯塔':'走到了雪路的 '+run.percent+'%'),el('small',run.day+' · '+Math.floor(run.seconds/60)+':'+String(Math.floor(run.seconds%60)).padStart(2,'0')+' · '+run.flips+' 圈落稳'));row.append(el('span',run.percent>=100?'⚑':'↗','run-stamp'),words,el('span',String(run.score),'run-score'));body.append(row);
 }
 const tools=el('div',undefined,'file-tools');tools.append(el('p','明信片和路签留在当前浏览器。换设备前，先收一份旅行箱备份。最多保留 48 张明信片和 60 段纪行。','quiet-copy'));
 const row=el('div',undefined,'button-row');row.append(button('导出旅行箱',()=>download(new Blob([JSON.stringify(backupData(state),null,2)],{type:'application/json'}),'snowbound-travel-box.json')),button('导入备份',()=>$('restoreFile').click()));tools.append(row);body.append(tools);
}

function dock(){
 open('风把你送到了码头','BAY 02 / THE KEEPER’S PIER');
 body.append(el('p','木桥下的小船轻轻碰着桥桩。\n\n守塔人去接一位晚归的朋友，留下了熄灭的灯室。岸边的漂流瓶里，藏着重新聚拢光的方法。','sheet-copy'));
 const row=el('div',undefined,'button-row');row.append(button('去读漂流瓶',bayLetter),button('走进灯室',lightRoom,'primary'));body.append(row,button('在海湾写张明信片',editor));
 body.append(el('p','这一站可以直接来，也可以沿雪路滑到这里。','quiet-copy'));
}
function bayLetter(){
 open('给后来的人','A BOTTLE ON THE SHORE');
 body.append(el('p','如果你读到这封信，应该已经听见海浪了。\n\n灯室里的三面镜片，曾被风转乱。第一面认得星，第二面认得浪，第三面认得月。\n\n请替海湾留一盏光。等人回来，就能从很远的海面上看见家。','letter-paper'));
 const row=el('div',undefined,'button-row');row.append(button(state.bay.letterKept?'短笺已收好':'把短笺夹进旅行箱',()=>{state=fresh();if(persist(keepBayLetter(state,day))){note('瓶中的短笺，收进旅行箱了。');bayLetter();}}),button('去灯室试试',lightRoom,'primary'));body.append(row,el('p','这是海湾里的虚构来信。你收起它，不会向任何人发送消息。','quiet-copy'));
}
function lightRoom(){
 state=fresh();open(state.bay.lit?'这束光，已经有了方向':'让三束光，各归其位','THE LANTERN ROOM');
 if(state.bay.lit){body.append(el('p','星光交给海浪，海浪交给月牙。\n\n那束重新亮起的光，会留在海湾里。以后回来，灯还在。','letter-paper'));const row=el('div',undefined,'button-row');row.append(button('翻开点灯纪念卡',()=>viewCard(beaconCard(state)),'primary'),button('在星夜看灯',()=>{phase='night';state=fresh();persist({...state,phase});close();}));body.append(row);return;}
 body.append(el('p','镜片边的刻痕，记着它们原来的方向。\n轻点镜片转动，三面都对齐后，就能点灯。','sheet-copy'));
 const status=el('p','','lens-status'),rack=el('div',undefined,'lens-rack'),buttons=[];
 for(let i=0;i<3;i++){const cell=el('div',undefined,'lens-cell'),target=LENS_MARKS[LENS_TARGET[i]];cell.append(el('small','刻痕 '+target.symbol+' '+target.name));const b=button('',()=>{state=fresh();persist(turnLens(state,i));update();chime();},'lens-dial');cell.append(b,el('small',['第一面','第二面','第三面'][i]));rack.append(cell);buttons.push(b);}
 const ignite=button('点亮海湾灯塔',()=>{state=fresh();const next=lightBeacon(state,day);if(!next.bay.lit)return;if(persist(next)){close();world.arrive();chime();note('灯塔亮了。点灯纪念卡，已放进旅行箱。',5);}},'primary ignite');
 function update(){const count=alignedLenses(state);status.textContent=count===3?'三束光已对齐。把光送向海面吧。':count+' / 3 束光已对齐';status.dataset.ready=String(count===3);buttons.forEach((b,i)=>{const mark=LENS_MARKS[state.bay.lenses[i]],aligned=state.bay.lenses[i]===LENS_TARGET[i];b.textContent=mark.symbol;b.dataset.aligned=String(aligned);b.style.setProperty('--turn',state.bay.lenses[i]*90+'deg');b.setAttribute('aria-label','转动'+['第一','第二','第三'][i]+'面镜片，当前'+mark.name+(aligned?'，已对齐':''));});ignite.disabled=count!==3;}
 body.append(rack,status,ignite,button('再看一眼瓶中信',bayLetter));update();
}

function about(){
 open('一座慢慢长出来的小站','SNOWBOUND STATION  /  02');
 body.append(el('p','这里叫鹈鹕雪境。\n\n可以花三分钟滑到海湾，也可以什么都不赶，只看看雪、找一点小东西，写张明信片。\n\n雪谷是第一站。海湾是第二站。那里有一封漂流瓶来信、一间等你点亮的灯室。','sheet-copy'),el('p','天气与来信属于虚构世界。你的明信片和旅途记录保存在当前浏览器，可在旅行箱导出。','quiet-copy'),el('p',STATION_VERSION+' · 灯塔雪路 snowbound-9.0.0','quiet-copy'));
 body.append(button('继续散步',close,'primary'));
}
function enterJourney(){
 if(sheet.open)sheet.close();$('journeyShell').hidden=false;$('station').inert=true;document.body.classList.add('in-journey');world.setVisible(false);
 if(frame.src.endsWith('about:blank')||!frame.dataset.loaded){frame.src='./play.html?station=1'+(new URLSearchParams(location.search).has('audit')?'&audit':'');frame.dataset.loaded='1';}
 try{frame.contentWindow.postMessage({type:'station:show'},location.origin);}catch{}
 $('backStation').focus();
}
function leaveJourney(){
 // Tell the embedded game to pause before hiding it; no reset or score fabrication.
 try{frame.contentWindow.postMessage({type:'station:pause'},location.origin);}catch{}
 $('journeyShell').hidden=true;$('station').inert=false;document.body.classList.remove('in-journey');world.setVisible(true);world.arrive();state=fresh();refresh();if(pendingBay){pendingBay=false;changePlace('bay');note('海湾到了。灯塔就在前方。',4);}
 (place==='bay'?$('beacon'):$('trail')).focus();
}
$('phase').onclick=()=>{phase=PHASES[(PHASES.indexOf(phase)+1)%PHASES.length];state=fresh();persist({...state,phase});chime();};
$('sound').onclick=()=>{sound=!sound;updateSound();if(sound)chime();};
$('travelBox').onclick=gallery;
$('valleyTab').onclick=()=>changePlace('valley');$('bayTab').onclick=()=>changePlace('bay');$('bayDock').onclick=dock;$('beacon').onclick=lightRoom;$('bottle').onclick=bayLetter;
$('cabin').onclick=gallery;$('post').onclick=editor;$('trail').onclick=enterJourney;$('walk').onclick=()=>place==='bay'?lightRoom():walk();$('letter').onclick=()=>place==='bay'?bayLetter():letter();$('about').onclick=about;$('backStation').onclick=leaveJourney;
$('restoreFile').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>1024*1024)throw Error('这份备份太大了，请选择小站导出的文件。');const raw=JSON.parse(await file.text());state=fresh();if(persist(mergeBackup(state,raw))){gallery();note('旅行箱已合并，原来的卡片也还在。');}}catch(err){note(err.message==='Unexpected end of JSON input'?'备份文件没有读完整，请重新选择。':err.message||'这份备份没有读出来。',5);}e.target.value='';};
window.addEventListener('storage',e=>{if(e.key===STATE_KEY){state=fresh();refresh();if(sheet.open&&$('sheetTitle').textContent==='旅人的旅行箱')gallery();}});
window.addEventListener('message',e=>{if(e.origin!==location.origin||e.source!==frame.contentWindow||e.data?.type!=='snowbound:run')return;state=fresh();const run=state.runs.find(r=>r.id===e.data.id);if(run?.percent===100&&!arrivedRuns.has(e.data.id)){arrivedRuns.add(e.data.id);if($('journeyShell').hidden){changePlace('bay');note('海湾到了。灯塔就在前方。',4);}else pendingBay=true;}refresh();if(e.data.id!==lastRunNotice){lastRunNotice=e.data.id;note(run?.percent===100&&$('journeyShell').hidden?'海湾到了。这段旅程已夹进旅行箱。':e.data.saved?'这段旅程，已夹进旅行箱。':'这段旅程暂未保存，请检查浏览器储存空间。',4);}});
document.addEventListener('visibilitychange',()=>{if(!document.hidden){const now=shanghaiDay();if(now!==day){day=now;daily=dailyScene(day);state=fresh();refresh();}}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('journeyShell').hidden){e.preventDefault();leaveJourney();}});
world=createWorld($('scene'),m=>{mapping=m;position();});refresh();updateSound();
