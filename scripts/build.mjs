import { readFileSync, writeFileSync } from 'node:fs';
const id=(process.env.ADSENSE_CLIENT_ID||'').trim();
const enabled=process.env.ADSENSE_ENABLED==='true';
const valid=/^ca-pub-\d{16}$/.test(id);
if(enabled&&!valid)throw new Error('ADSENSE_ENABLED=true requires a valid ADSENSE_CLIENT_ID in Vercel settings.');
const snippet=enabled
  ?'<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client='+id+'" crossorigin="anonymous"></script>'
  :'';
for(const path of ['public/index.html','public/privacy.html','public/guides.html']){
  let html=readFileSync(path,'utf8');
  if(!html.includes('<!-- ADSENSE_SNIPPET -->'))throw new Error('Missing ad code marker: '+path);
  html=html.replace('<!-- ADSENSE_SNIPPET -->',snippet);
  writeFileSync(path,html,'utf8');
}
if(enabled){
  const pub=id.replace('ca-','');
  writeFileSync('public/ads.txt','google.com, '+pub+', DIRECT, f08c47fec0942fa0\n','utf8');
}
console.log(enabled?'AdSense script and ads.txt set up. Ad serving still needs Google site approval.':'AdSense not enabled; site remains ad-free.');
