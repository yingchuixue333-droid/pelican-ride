import {STATION_VERSION,STATE_KEY,PHASES,OBJECTS,shanghaiDay,currentPhase,dailyScene,readState,writeState,foundToday,collectObject,addCard,mergeBackup,backupData} from './state.js?v=20261031-s1';
import {createWorld,paintPostcard} from './scene.js?v=20261031-s1';
const $=id=>document.getElementById(id),body=$('sheetBody'),sheet=$('sheet'),frame=$('journeyFrame');
let storage;try{storage=localStorage;}catch{storage={getItem:()=>null,setItem:()=>{throw Error('storage disabled');}};}
let saveAvailable=true;
let state=readState(storage),day=shanghaiDay(),daily=dailyScene(day),phase=state.phase||currentPhase(),world,mapping,noticeTimer,context,sound=false,lastRunNotice='',opening=null,cardDraft='',editorPhase=phase;
const names={dawn:'晨光',dusk:'暮色',night:'星夜'},icons={dawn:'☀',dusk:'◒',night:'☾'};
const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
function button(text,action,cls='secondary'){let b=el('button',text,cls);b.type='button';b.onclick=action;return b;}
function note(text,seconds=3){$('notice').textContent=text;$('notice').classList.add('visible');clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>$('notice').classList.remove('visible'),seconds*1000);}
function fresh(){return saveAvailable?readState(storage):state;}
function persist(next){state=next;const saved=writeState(storage,state);saveAvailable=saved;if(!saved)note('这次还没能保存。可以从旅行箱导出备份。',5);refresh();return saved;}
function chime(){if(!sound||document.hidden)return;try{context??=new AudioContext();context.resume();let t=context.currentTime;for(let i=0;i<3;i++){let osc=context.createOscillator(),gain=context.createGain();osc.type='sine';osc.frequency.value=[523.25,659.25,783.99][i];gain.gain.setValueAtTime(0,t+i*.12);gain.gain.linearRampToValueAtTime(.045,t+i*.12+.015);gain.gain.exponentialRampToValueAtTime(.0001,t+i*.12+1.3);osc.connect(gain);gain.connect(context.destination);osc.start(t+i*.12);osc.stop(t+i*.12+1.4);}}catch{sound=false;updateSound();}}
function updateSound(){$('sound').setAttribute('aria-pressed',String(sound));$('sound').replaceChildren(document.createTextNode('♪'),el('span',sound?'风铃开':'风铃关'));}
function position(){if(!mapping)return;for(const node of document.querySelectorAll('[data-x][data-y]')){node.style.left=mapping.x+Number(node.dataset.x)*mapping.scale+'px';node.style.top=mapping.y+Number(node.dataset.y)*mapping.scale+'px';}}
function refresh(){
 document.body.dataset.phase=phase;
 $('phase').replaceChildren(document.createTextNode(icons[phase]),el('span',names[phase]));$('phase').setAttribute('aria-label','切换小站时光，当前'+names[phase]);
 $('dateLabel').textContent=day.replaceAll('-',' / ')+'  ·  雪谷第一站';
 $('weather').textContent='此刻雪境 · '+daily.weather+'  /  '+names[phase];
 const found=foundToday(state,day);$('walkCount').textContent=found.length+' / 3';$('walkProgress').textContent=found.length===3?'今天的纪念卡，已经夹进旅行箱。':'轻点雪里的小物，收集今天的三件发现。';
 $('objects').replaceChildren();for(const object of daily.objects){const got=found.includes(object.id),b=button('',()=>find(object),'found-object'+(got?' collected':''));b.dataset.kind=object.id;b.dataset.x=object.x;b.dataset.y=object.y;b.setAttribute('aria-label',(got?'已找到':'拾起')+object.name);b.disabled=got;b.append(el('span',got?'✓':object.symbol));$('objects').append(b);}
 position();world?.set({phase,daily});
}
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
 open(card.source==='walk'?'一张散步纪念卡':'给自己的明信片','POSTCARD  /  '+card.day);
 const canvas=el('canvas',undefined,'post-preview');canvas.setAttribute('aria-label','明信片预览：'+card.text);paintPostcard(canvas,card);body.append(canvas,el('p',card.text,'letter-paper'),el('p',card.day+' · '+names[card.phase]+' · '+(card.source==='walk'?dailyScene(card.day).stamp:'寄存在雪境的片刻'),'quiet-copy'));
 let row=el('div',undefined,'button-row');row.append(button('保存明信片图片',()=>exportCard(card),'primary'),button('回到旅行箱',gallery));body.append(row);
}
function editor(){
 open('写给此刻的自己','THE MOUNTAIN POST OFFICE');
 const preview=el('canvas',undefined,'post-preview'),label=el('label','想把什么留在这里？','field-label'),input=el('textarea');label.htmlFor='postText';input.id='postText';input.maxLength=280;input.placeholder='比如：今天也没做什么了不起的事，但这阵雪很好看。';input.value=cardDraft;
 const count=el('p','','quiet-copy'),picker=el('div',undefined,'palette-picker');picker.setAttribute('aria-label','选择明信片时光');
 let paletteButtons=[];const draft=()=>({id:'draft',day,text:input.value.trim()||'今天，也在这里停留了一会儿。',phase:editorPhase,source:'note'});
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
 else{let grid=el('div',undefined,'card-grid');for(const card of [...state.cards].reverse()){let b=button('',()=>viewCard(card),'memory-card');b.dataset.phase=card.phase;b.append(el('span',card.day,'memory-day'),el('p',card.text),el('small',card.source==='walk'?'散步纪念 · '+dailyScene(card.day).stamp:'给自己的一句话'));grid.append(b);}body.append(grid);}
 body.append(button('再写一张',editor));
 body.append(el('h3','雪路纪行','section-title'));
 if(!state.runs.length)body.append(el('p','出发去灯塔，或只滑一小段。\n一段超过 15 秒的正式旅程，会在这里留下一张路签。','empty-state'));
 for(const run of [...state.runs].reverse().slice(0,15)){
 const row=el('div',undefined,'run-entry'),words=el('div');words.append(el('b',run.percent>=100?'抵达海湾灯塔':'走到了雪路的 '+run.percent+'%'),el('small',run.day+' · '+Math.floor(run.seconds/60)+':'+String(Math.floor(run.seconds%60)).padStart(2,'0')+' · '+run.flips+' 圈落稳'));row.append(el('span',run.percent>=100?'⚑':'↗','run-stamp'),words,el('span',String(run.score),'run-score'));body.append(row);
 }
 const tools=el('div',undefined,'file-tools');tools.append(el('p','明信片和路签留在当前浏览器。换设备前，先收一份旅行箱备份。最多保留 48 张明信片和 60 段纪行。','quiet-copy'));
 const row=el('div',undefined,'button-row');row.append(button('导出旅行箱',()=>download(new Blob([JSON.stringify(backupData(state),null,2)],{type:'application/json'}),'snowbound-travel-box.json')),button('导入备份',()=>$('restoreFile').click()));tools.append(row);body.append(tools);
}
function about(){
 open('一座慢慢长出来的小站','SNOWBOUND STATION  /  01');
 body.append(el('p','这里叫鹈鹕雪境。\n\n可以花三分钟滑到海湾，也可以什么都不赶，只看看雪、找一点小东西，写张明信片。\n\n雪谷是第一站。以后，这个小世界会慢慢有更多能走进去的地方。','sheet-copy'),el('p','天气与来信属于虚构世界。你的明信片和旅途记录保存在当前浏览器，可在旅行箱导出。','quiet-copy'),el('p',STATION_VERSION+' · 灯塔雪路 snowbound-9.0.0','quiet-copy'));
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
 $('journeyShell').hidden=true;$('station').inert=false;document.body.classList.remove('in-journey');world.setVisible(true);world.arrive();state=fresh();refresh();$('trail').focus();
}
$('phase').onclick=()=>{phase=PHASES[(PHASES.indexOf(phase)+1)%PHASES.length];state=fresh();persist({...state,phase});chime();};
$('sound').onclick=()=>{sound=!sound;updateSound();if(sound)chime();};
$('cabin').onclick=gallery;$('post').onclick=editor;$('trail').onclick=enterJourney;$('walk').onclick=walk;$('letter').onclick=letter;$('about').onclick=about;$('backStation').onclick=leaveJourney;
$('restoreFile').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>1024*1024)throw Error('这份备份太大了，请选择小站导出的文件。');const raw=JSON.parse(await file.text());state=fresh();if(persist(mergeBackup(state,raw))){gallery();note('旅行箱已合并，原来的卡片也还在。');}}catch(err){note(err.message==='Unexpected end of JSON input'?'备份文件没有读完整，请重新选择。':err.message||'这份备份没有读出来。',5);}e.target.value='';};
window.addEventListener('storage',e=>{if(e.key===STATE_KEY){state=fresh();refresh();if(sheet.open&&$('sheetTitle').textContent==='旅人的旅行箱')gallery();}});
window.addEventListener('message',e=>{if(e.origin!==location.origin||e.source!==frame.contentWindow||e.data?.type!=='snowbound:run')return;state=fresh();refresh();if(e.data.id!==lastRunNotice){lastRunNotice=e.data.id;note(e.data.saved?'这段旅程，已夹进旅行箱。':'这段旅程暂未保存，请检查浏览器储存空间。',4);}});
document.addEventListener('visibilitychange',()=>{if(!document.hidden){const now=shanghaiDay();if(now!==day){day=now;daily=dailyScene(day);state=fresh();refresh();}}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('journeyShell').hidden){e.preventDefault();leaveJourney();}});
world=createWorld($('scene'),m=>{mapping=m;position();});refresh();updateSound();
