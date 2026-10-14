import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';

// One signed cookie = one browser, not a verified person.
// Upstash Redis keeps counts across serverless invocations; never use in-memory
// counters for a public AI endpoint.
const COOKIE = 'ss_visitor';
export const FREE_DAILY = 5;
const SCRIPT = `
local used = tonumber(redis.call('GET', KEYS[1]) or '0')
local global = tonumber(redis.call('GET', KEYS[2]) or '0')
if used >= tonumber(ARGV[1]) or global >= tonumber(ARGV[2]) then
  return {0, used, global}
end
used = redis.call('INCR', KEYS[1])
global = redis.call('INCR', KEYS[2])
if used == 1 then redis.call('EXPIRE', KEYS[1], tonumber(ARGV[3])) end
if global == 1 then redis.call('EXPIRE', KEYS[2], tonumber(ARGV[3])) end
return {1, used, global}
`;
const REFUND = `
for i=1,2 do
  local current = tonumber(redis.call('GET', KEYS[i]) or '0')
  if current > 0 then redis.call('DECR', KEYS[i]) end
end
return 1
`;

export function limitsReady(){
  return !!(process.env.LIMIT_COOKIE_SECRET?.length >= 32 &&
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN);
}
function signature(id){return createHmac('sha256', process.env.LIMIT_COOKIE_SECRET).update(id).digest('hex')}
function cookieId(request){
  const raw=request.headers.get('cookie')||'';
  const match=raw.split(';').map(x=>x.trim()).find(x=>x.startsWith(COOKIE+'='));
  const value=match?.slice(COOKIE.length+1)||'';
  const [id,sig]=value.split('.');
  if(/^[a-f0-9-]{36}$/.test(id||'') && /^[a-f0-9]{64}$/.test(sig||'')){
    const expected=Buffer.from(signature(id),'hex');
    const supplied=Buffer.from(sig,'hex');
    if(expected.length===supplied.length && timingSafeEqual(expected,supplied))return {id, cookie:null};
  }
  const fresh=randomUUID();
  return {id:fresh, cookie:`${COOKIE}=${fresh}.${signature(fresh)}; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=31536000`};
}
async function command(...args){
  const res=await fetch(process.env.UPSTASH_REDIS_REST_URL,{
    method:'POST',headers:{Authorization:'Bearer '+process.env.UPSTASH_REDIS_REST_TOKEN,'Content-Type':'application/json'},
    body:JSON.stringify(args),signal:AbortSignal.timeout(6000)
  });
  if(!res.ok)throw new Error('AI daily limit database unavailable');
  const body=await res.json();
  if(body.error)throw new Error('AI daily limit database error');
  return body.result;
}
function clock(){
  const now=new Date();
  const day=now.toISOString().slice(0,10);
  const midnight=Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate()+1);
  return {day,seconds:Math.max(60,Math.ceil((midnight-now.getTime())/1000)+90),resetAt:new Date(midnight).toISOString()};
}
function maxDaily(){
  const raw=Number.parseInt(process.env.MAX_DAILY_AI_CALLS||'200',10);
  return Number.isFinite(raw)?Math.max(10,Math.min(10000,raw)):200;
}
export async function quotaStatus(request){
  if(!limitsReady())return {configured:false,limit:FREE_DAILY,remaining:0,reason:'AI limit storage is not connected yet.'};
  const {id,cookie}=cookieId(request);
  const {day,resetAt}=clock();
  const [usedRaw,globalRaw]=await Promise.all([
    command('GET',`ss:ai:v1:${day}:${id}`),command('GET',`ss:ai:all:${day}`)
  ]);
  const used=Number(usedRaw||0),globalUsed=Number(globalRaw||0);
  return {configured:true,cookie,limit:FREE_DAILY,remaining:globalUsed>=maxDaily()?0:Math.max(0,FREE_DAILY-used),used,resetAt,globalPaused:globalUsed>=maxDaily()};
}
export async function reserveQuestion(request){
  if(!limitsReady())return {configured:false,error:'AI questions are paused until daily limit storage is connected.'};
  const {id,cookie}=cookieId(request);
  const {day,seconds,resetAt}=clock();
  const keys=[`ss:ai:v1:${day}:${id}`,`ss:ai:all:${day}`];
  const result=await command('EVAL',SCRIPT,2,...keys,FREE_DAILY,maxDaily(),seconds);
  if(!Array.isArray(result)||result.length<3)throw new Error('AI limit response invalid');
  const allowed=Number(result[0])===1, used=Number(result[1]||0);
  return {
    configured:true,allowed,cookie,limit:FREE_DAILY,
    remaining:Math.max(0,FREE_DAILY-used),resetAt,
    globalPaused:Number(result[2])>=maxDaily(),
    async refund(){if(allowed)try{await command('EVAL',REFUND,2,...keys)}catch(e){console.error('AI quota refund failed',e.message)}}
  };
}
export function includeCookie(response,quota){
  if(quota?.cookie)response.headers.set('Set-Cookie',quota.cookie);
  return response;
}
