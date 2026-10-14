const json=(value,status=200)=>Response.json(value,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const trim=(value,max=1000)=>String(value||'').trim().slice(0,max);
export async function POST(request){
  const origin=request.headers.get('origin');
  if(origin&&new URL(origin).host!==new URL(request.url).host)return json({error:'Request not allowed.'},403);
  const maxLength=10000;
  if(Number(request.headers.get('content-length')||0)>maxLength)return json({error:'Question is too long.'},413);
  let data;try{data=await request.json()}catch{return json({error:'Please send a valid question.'},400)}
  const topic=trim(data.topic,120),goal=trim(data.goal,400),level=trim(data.level,30),step=trim(data.step,90);
  const mode=data.mode==='plan'?'plan':'chat';
  if(!topic)return json({error:'Choose a topic first.'},400);
  const key=process.env.OPENAI_API_KEY;
  if(!key)return json({error:'AI is not connected yet. The site owner needs to add OPENAI_API_KEY in Vercel settings.'},503);
  const history=Array.isArray(data.history)?data.history.slice(-12).filter(m=>m&&['user','assistant'].includes(m.role)&&typeof m.content==='string').map(m=>({role:m.role,content:trim(m.content,1000)})):[];
  if(mode==='chat'&&!history.some(m=>m.role==='user'))return json({error:'Ask a question first.'},400);
  const instructions=mode==='plan'
    ?'Create exactly 3 detailed, practical stages for the learner in plain, friendly English. Respond ONLY with valid JSON object of the form {"steps":[{"title":"...","query":"...","why":"...","task":"...","win":"..."}]}. No markdown. Each stage must build on the last. query is a YouTube tutorial search phrase. Avoid claiming you watched any video. Keep each field concise and practical.'
    :'You are a warm, clear, encouraging learning coach for beginners. Answer the current question directly in plain language without inflated promises or sales pitches. Tailor advice to the skill and current step, show a short example and a practical next action when useful. You have not watched, checked, or verified any search results. If a video is not in the conversation, do not claim its contents. Avoid unsafe how-to material. For sensitive personal issues advise appropriate real-world help.';
  const learner='Topic: '+topic+'\nLevel: '+level+'\nGoal: '+goal+'\nCurrent step: '+step+'\nDaily time: '+trim(data.minutes,3)+' minutes';
  const input=mode==='plan'?[{role:'user',content:learner}]:[{role:'developer',content:learner},...history];
  try{
    const response=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{'Authorization':'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify({model:process.env.OPENAI_MODEL||'gpt-4.1-mini',instructions,input,max_output_tokens:mode==='plan'?1250:550,store:false}),signal:AbortSignal.timeout(25000)});
    if(!response.ok){return json({error:response.status===429?'The tutor is busy. Try again shortly.':'The AI service is unavailable right now.'},502)}
    const raw=await response.json();
    const answer=(raw.output||[]).flatMap(x=>x.content||[]).filter(x=>x.type==='output_text').map(x=>x.text).join('\n').trim();
    if(!answer)return json({error:'The tutor had trouble answering. Please try again.'},502);
    if(mode==='plan'){let parsed;try{parsed=JSON.parse(answer.replace(/^\x60\x60\x60(?:json)?/,'').replace(/\x60\x60\x60$/,'').trim())}catch{return json({error:'Could not build a plan. Please try again.'},502)}
      if(!Array.isArray(parsed.steps)||parsed.steps.length!==3)return json({error:'Could not build a plan. Please try again.'},502);
      return json({steps:parsed.steps.map(s=>({title:trim(s.title,90),query:trim(s.query,150),why:trim(s.why,300),task:trim(s.task,300),win:trim(s.win,300)}))});
    }
    return json({answer:answer.slice(0,3500)});
  }catch{return json({error:'The AI service could not be reached. Please try again.'},502)}
}
