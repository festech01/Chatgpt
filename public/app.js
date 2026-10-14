const $=x=>document.getElementById(x);
const store=(key,otherwise)=>{try{return JSON.parse(localStorage.getItem(key))??otherwise}catch{return otherwise}};
const state={plan:null,step:0,source:'youtube',items:[],saved:store('saved',[]),done:store('done',{}),controller:null};
function write(){localStorage.setItem('saved',JSON.stringify(state.saved));localStorage.setItem('done',JSON.stringify(state.done))}
function safe(h){try{const u=new URL(h);return ['https:','http:'].includes(u.protocol)?u.href:'#'}catch{return '#'}}
function item(tag,text,cls){const e=document.createElement(tag);if(text!==null)e.textContent=text;if(cls)e.className=cls;return e}
const plans=[
[/canva|design|photoshop|illustrator|logo/i,['Get comfy with the tools','Make your first design','Create a real project'],['basics tools beginner tutorial','step by step practice design tutorial','complete real design project tutorial']],
[/excel|sheets|spreadsheet|data analysis/i,['Learn the basics','Practise useful skills','Build a mini project'],['basics beginner tutorial','formulas practical exercises tutorial','beginner dashboard complete project tutorial']],
[/marketing|advertising|seo|ads/i,['Understand how it works','Try a small campaign','Make your own plan'],['fundamentals for beginners tutorial','hands on campaign tutorial','complete campaign plan example tutorial']],
[/python|coding|html|css|javascript|web development/i,['Get the basics right','Code along with someone','Build something real'],['basics first program beginner tutorial','hands on practice exercises tutorial','full beginner project tutorial']],
[/video|capcut|editing/i,['Learn the editing tools','Edit your first clip','Make a full video'],['editing basics beginner tutorial','step by step practice tutorial','full project beginner tutorial']]
];
function generate(topic,level){let hit=plans.find(p=>p[0].test(topic));const names=level==='advanced'?['Brush up the basics','Go deeper','Build a harder project']:hit?.[1]||['Start with the basics','Try it yourself','Make your first project'];const keywords=level==='advanced'?['key concepts refresher tutorial','intermediate techniques walkthrough','advanced practical project tutorial']:hit?.[2]||['basics for beginners tutorial','step by step practice tutorial','complete beginner project tutorial'];return{topic,level,id:topic.toLowerCase()+'-'+level,steps:names.map((title,i)=>({title,query:topic+' '+keywords[i]}))}}
function switchTo(view){for(const id of ['home','path','saved'])$(id).hidden=id!==view;document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===view));if(view==='saved')renderSaved();if(view==='path')renderPlan();window.scrollTo({top:0,behavior:'smooth'})}
function done(i){return (state.done[state.plan?.id]||[]).includes(i)}
function renderPlan(){if(!state.plan)return;const p=state.plan;const percent=Math.round(p.steps.filter((_,i)=>done(i)).length/3*100);$('path-name').textContent=p.topic;$('progress').textContent=percent+'% done';$('bar').style.width=percent+'%';$('steps').replaceChildren(...p.steps.map((s,i)=>{const b=item('button',null,'step'+(i===state.step?' active':'')+(done(i)?' done':''));const num=item('span',done(i)?'✓':String(i+1),'number');const label=item('span',null);label.append(item('strong',s.title),item('small',i===0?'START HERE':i===1?'KEEP GOING':'YOUR NEXT WIN'));b.append(num,label);b.onclick=()=>selectStep(i);return b}));const step=p.steps[state.step];$('step-number').textContent='STEP '+(state.step+1)+' OF 3';$('step-title').textContent=step.title;$('step-info').textContent=['Find a short video and learn the essentials.','Follow along and give it a try.','Bring your new skills together.'][state.step];$('done').textContent=done(state.step)?'✓ Done — undo':'Mark as done ✓'}
function createResult(r){if(!r.url||safe(r.url)==='#')return null;const c=item('article',null,'resource');const img=item('img');img.src=safe(r.thumbnail||'')==='#'?'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="125" height="75"%3E%3Crect width="125" height="75" fill="%23dce7cb"/%3E%3Ctext x="40" y="48" font-size="35"%3E%E2%96%B6%3C/text%3E%3C/svg%3E':safe(r.thumbnail);img.alt='';c.append(img);const body=item('div',null,'resource-body');const title=item('a',r.title);title.href=safe(r.url);title.target='_blank';title.rel='noopener noreferrer';body.append(title,item('small',[r.channel||r.domain,r.duration].filter(Boolean).join(' · ')));const a=item('a',r.source==='web'?'Read guide ↗':'Watch lesson ↗','link');a.href=safe(r.url);a.target='_blank';a.rel='noopener noreferrer';body.append(a);const saved=state.saved.some(s=>s.url===r.url);const b=item('button',saved?'✓ Saved':'+ Save');b.onclick=()=>{state.saved=saved?state.saved.filter(s=>s.url!==r.url):[r,...state.saved].slice(0,100);write();renderResults();renderSaved()};body.append(b);c.append(body);return c}
function renderResults(){$('results').replaceChildren(...state.items.map(createResult).filter(Boolean))}
function renderSaved(){$('saved-list').replaceChildren(...state.saved.map(createResult).filter(Boolean));if(!state.saved.length)$('saved-list').textContent='Nothing saved yet. Go find something good!'}
function selectStep(n){state.step=n;renderPlan();search()}
function fallBack(query){const el=$('fallback');el.replaceChildren(item('p','Try these real searches instead:'));for(const [name,url] of [['Open YouTube','https://www.youtube.com/results?search_query='+encodeURIComponent(query)],['Open Google','https://www.google.com/search?q='+encodeURIComponent(query)]]){const a=item('a',name+' ↗');a.href=url;a.target='_blank';a.rel='noopener noreferrer';el.append(a)}}
async function search(){if(!state.plan)return;state.controller?.abort();const ac=new AbortController();state.controller=ac;state.items=[];renderResults();$('fallback').replaceChildren();$('status').textContent='Finding lessons for you…';const q=state.plan.steps[state.step].query;const params=new URLSearchParams({q,source:state.source,level:'any',duration:$('length').value});try{const r=await fetch('/api/search?'+params,{signal:ac.signal});const data=await r.json();if(!r.ok)throw Error(data.error||'Search is not ready');if(ac!==state.controller)return;state.items=data.results||[];renderResults();$('status').textContent=state.items.length?'Pick a lesson that feels right for you.':'No matches this time.';if(!state.items.length)fallBack(q)}catch(e){if(e.name==='AbortError')return;$('status').textContent=e.message+' You can still search directly below.';$('status').classList.add('error');fallBack(q)}}
function begin(topic){topic=topic.trim().replace(/\s+/g,' ').slice(0,120);if(topic.length<2)return;state.plan=generate(topic,$('level').value);state.step=(state.plan.steps.findIndex((_,i)=>!done(i))+3)%3;localStorage.setItem('last',JSON.stringify({topic,level:state.plan.level}));switchTo('path');search()}
$('start').onsubmit=e=>{e.preventDefault();begin($('topic').value)};document.querySelectorAll('[data-topic]').forEach(b=>b.onclick=()=>begin(b.dataset.topic));document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>switchTo(b.dataset.view));document.querySelectorAll('[data-source]').forEach(b=>b.onclick=()=>{state.source=b.dataset.source;document.querySelectorAll('[data-source]').forEach(s=>s.classList.toggle('active',s===b));$('length').parentElement.hidden=state.source==='web';search()});$('length').onchange=search;$('new').onclick=()=>switchTo('home');$('done').onclick=()=>{const list=new Set(state.done[state.plan.id]||[]);if(list.has(state.step))list.delete(state.step);else list.add(state.step);state.done[state.plan.id]=[...list];write();renderPlan()};const last=store('last',null);if(last?.topic){state.plan=generate(last.topic,last.level||'beginner');state.step=Math.max(0,state.plan.steps.findIndex((_,i)=>!done(i)))}if('serviceWorker'in navigator)navigator.serviceWorker.register('/sw.js').catch(()=>{});

/* SkillScope Plus: local learning library, personal goals and tutor */
const libKey='skillscope-plans-v3';
const library=store(libKey,[]);
function saveLibrary(){localStorage.setItem(libKey,JSON.stringify(library.slice(0,80)))}
function getGoal(){return state.plan?.goal||''}
function planSaved(){return !!state.plan&&library.some(x=>x.id===state.plan.id)}
function updatePlanButton(){const b=$('save-plan');if(!b)return;const saved=planSaved();b.textContent=saved?'✓ Saved to my library':'☆ Save this learning plan';b.setAttribute('aria-pressed',String(saved))}
function rememberPlan(){if(!state.plan)return;const existing=library.findIndex(x=>x.id===state.plan.id);if(existing>=0)library.splice(existing,1);else library.unshift({...state.plan,savedAt:new Date().toISOString()});saveLibrary();updatePlanButton();renderLibrary()}
$('save-plan').onclick=rememberPlan;
function renderLibrary(){const el=$('plans-list');if(!el)return;el.replaceChildren();if(!library.length){el.append(item('p','No saved plans yet. Start one, then tap Save.'));return}for(const p of library){const c=item('div',null,'library-row');const title=item('button',p.topic,'library-title');title.onclick=()=>{state.plan=p;state.step=0;switchTo('path');search()};const sub=item('small',p.goal||p.level||'Learning plan');const del=item('button','Remove','outline small');del.onclick=()=>{const i=library.findIndex(x=>x.id===p.id);if(i>=0)library.splice(i,1);saveLibrary();renderLibrary();updatePlanButton()};const textBox=item('div');textBox.append(title,sub);c.append(textBox,del);el.append(c)}}
const originalSwitch=switchTo;
switchTo=function(view){originalSwitch(view);if(view==='saved')renderLibrary();if(view==='path'){updatePlanButton();drawChat();checkTutorConnection()}};
const originalRender=renderPlan;
renderPlan=function(){originalRender();if(!state.plan)return;const step=state.plan.steps[state.step],topic=state.plan.topic;
$('step-why').textContent=step.why||'This gives you a strong base before moving to harder things in '+topic+'.';
$('step-task').textContent=step.task||(['Write down three things you learned about '+topic+'.','Follow a tutorial and try it without copying every click.','Make one small project you can show someone.'][state.step]);
$('step-win').textContent=step.win||['You can explain the basic idea in your own words.','You can complete a small task without watching every second again.','You have something finished that shows what you learned.'][state.step];updatePlanButton()};
const originalBegin=begin;
begin=function(topic){originalBegin(topic);if(!state.plan)return;state.plan.goal=$('goal').value.trim();state.plan.minutes=Number($('minutes').value);state.plan.id=state.plan.id+'-'+state.plan.goal.toLowerCase().slice(0,45);state.step=0;renderPlan();search()};
$('export-data').onclick=()=>{const contents=JSON.stringify({version:1,plans:library,saved:state.saved,done:state.done},null,2);const url=URL.createObjectURL(new Blob([contents],{type:'application/json'}));const a=item('a');a.href=url;a.download='skillscope-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
$('import-data').onchange=async e=>{const file=e.target.files?.[0];if(!file||file.size>1000000)return;try{const data=JSON.parse(await file.text());if(!Array.isArray(data.plans)||!Array.isArray(data.saved))throw Error('Wrong backup format');const valid=data.plans.filter(x=>x&&typeof x.topic==='string'&&typeof x.id==='string'&&Array.isArray(x.steps)&&x.steps.length>0&&x.steps.length<=12).slice(0,80);library.splice(0,library.length,...valid);state.saved=data.saved.filter(x=>x&&typeof x.title==='string'&&typeof x.url==='string'&&safe(x.url)!=='#').slice(0,100);if(data.done&&typeof data.done==='object'&&!Array.isArray(data.done))state.done=data.done;saveLibrary();write();renderLibrary();renderSaved();alert('Your learning plans are back!')}catch{alert('This backup could not be opened.')}}; 
const chatKey=()=> 'skillscope-chat-'+(state.plan?.id||'general');
function chatHistory(){return store(chatKey(),[]).filter(x=>['user','assistant'].includes(x.role)&&typeof x.content==='string').slice(-24)}
function drawChat(){const log=$('chat-log');if(!log)return;log.replaceChildren();const h=chatHistory();if(!h.length)log.append(item('div',"Hey there 👋 Tell me what feels confusing. I'll help you work through it.",'chat-msg bot'));for(const m of h)log.append(item('div',m.content,'chat-msg '+(m.role==='user'?'human':'bot')));log.scrollTop=log.scrollHeight}
function writeChat(h){localStorage.setItem(chatKey(),JSON.stringify(h.slice(-24)))}
$('clear-chat').onclick=()=>{localStorage.removeItem(chatKey());drawChat();$('chat-status').textContent='Chat cleared from this browser.'};
for(const b of document.querySelectorAll('[data-question]'))b.onclick=()=>{$('chat-input').value=b.dataset.question;$('chat-input').focus()};
let chatting=false;
$('chat-form').onsubmit=async e=>{e.preventDefault();if(chatting||!state.plan)return;const msg=$('chat-input').value.trim();if(!msg)return;let history=chatHistory();history.push({role:'user',content:msg.slice(0,1000)});writeChat(history);drawChat();$('chat-input').value='';$('chat-status').textContent='Thinking…';chatting=true;$('chat-send').disabled=true;try{const r=await fetch('/api/tutor',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({topic:state.plan.topic,goal:getGoal(),level:state.plan.level,step:state.plan.steps[state.step]?.title,history:history.slice(-12)})});const data=await r.json().catch(()=>{throw Error('The AI server did not return a valid reply. Check that the Vercel function is deployed.')});updateQuotaDisplay(data);if(!r.ok)throw Error(data.error||'The tutor is unavailable');history.push({role:'assistant',content:String(data.answer||'Could you try asking that in another way?').slice(0,3500)});writeChat(history);drawChat();$('chat-status').textContent='AI is working. Ask me another question.';$('chat-status').classList.remove('error')}catch(err){const message=String(err.message||'Could not connect to the AI.');$('chat-status').textContent=message+' Your question is saved.';$('chat-status').classList.add('error');drawChat();const warning=item('div','⚠️ '+message+'\\n\\nWhile AI is unavailable, try this study tip (not an AI answer): '+(state.plan.steps[state.step]?.task||'Take one small step, practise, and write down what you learned.'),'chat-msg chat-error');$('chat-log').append(warning);const retry=item('button','Retry my last question','outline small');retry.type='button';retry.onclick=()=>{$('chat-input').value=msg;$('chat-input').focus()};$('chat-log').append(retry);$('chat-log').scrollTop=$('chat-log').scrollHeight}finally{chatting=false;$('chat-send').disabled=dailyAiRemaining===0}};
$('ai-plan').onclick=async()=>{if(!state.plan)return;const b=$('ai-plan');b.disabled=true;b.textContent='✦ Building your plan…';try{const r=await fetch('/api/tutor',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({mode:'plan',topic:state.plan.topic,goal:getGoal(),level:state.plan.level,minutes:state.plan.minutes||30})});const d=await r.json();updateQuotaDisplay(d);if(!r.ok)throw Error(d.error||'Plan could not be created');if(!Array.isArray(d.steps)||d.steps.length<3||d.steps.length>8)throw Error('Try again');state.plan.steps=d.steps.map(s=>({title:String(s.title||'Learn').slice(0,90),query:String(s.query||state.plan.topic+' tutorial').slice(0,150),why:String(s.why||'').slice(0,300),task:String(s.task||'').slice(0,300),win:String(s.win||'').slice(0,300)}));state.step=0;renderPlan();search();if(planSaved()){const ix=library.findIndex(x=>x.id===state.plan.id);library[ix]={...state.plan};saveLibrary()}b.textContent='✓ Better plan ready'}catch(err){b.textContent='✦ Make my plan smarter';alert(err.message+' You can still use the starter plan.')}finally{b.disabled=dailyAiRemaining===0;setTimeout(()=>{b.textContent='✦ Make my plan smarter'},2500)}};
const originalSearch=search;
search=async function(){if(!state.plan)return;const current=state.plan.steps[state.step];const originalQuery=current.query;current.query=[originalQuery,state.plan.goal||''].join(' ').trim().slice(0,120);try{await originalSearch()}finally{current.query=originalQuery}};
renderLibrary();if(state.plan){renderPlan();drawChat()}

/* Check whether the AI server is connected; no secret keys go to the browser. */
let dailyAiRemaining=null;
function updateQuotaDisplay(data){
  const badge=$('ai-allowance');
  if(!badge)return;
  if(Number.isInteger(data?.remaining) && data?.status!=='limits_missing' && data?.status!=='limits_unavailable'){
    dailyAiRemaining=data.remaining;
    badge.textContent='🎁 '+data.remaining+' of 5 free AI uses left today · resets at midnight UTC · Smarter plans use 1 too.';
    badge.classList.toggle('empty',data.remaining===0);
  }else if(data?.status==='limits_missing'||data?.status==='limits_unavailable'||data?.status==='missing'){
    dailyAiRemaining=null;
    badge.textContent='AI is not ready yet. The owner needs to connect the AI key and daily limit storage.';
    badge.classList.add('empty');
  }
  $('chat-send').disabled=dailyAiRemaining===0;
  $('ai-plan').disabled=dailyAiRemaining===0;
}
async function checkTutorConnection(){
  const el=$('chat-status');if(!el)return;
  el.textContent='Checking the AI connection…';
  try{
    const response=await fetch('/api/tutor',{method:'GET',cache:'no-store'});
    const data=await response.json();
    updateQuotaDisplay(data);
    if(data.status==='configured'){
      el.textContent=data.remaining===0?'Daily AI allowance reached. Come back tomorrow.':'AI is ready. Send a question to test the connection.';
      el.classList.toggle('error',data.remaining===0);
    }else{
      el.textContent=data.hint||'AI is not connected yet. Please check Vercel settings.';
      el.classList.add('error');
    }
  }catch{
    el.textContent='AI server could not be reached. Check Vercel deployments and function logs.';
    el.classList.add('error');
  }
}
$('check-ai').onclick=checkTutorConnection;
if(state.plan)checkTutorConnection();
