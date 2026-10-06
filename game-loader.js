(async function(){
'use strict';
const loading=document.getElementById('loading'),info=document.getElementById('loading-info');let ready=false,failed=false;
function status(t){if(!failed)info.textContent=t;}
function fail(error){if(ready||failed)return;failed=true;loading.style.display='flex';loading.style.opacity='1';info.style.cssText='max-width:620px;white-space:pre-wrap;line-height:1.8;text-align:left;padding:20px;font-size:15px';info.textContent='启动未完成，请确认 index.html 和所有 JS 文件都在同一个目录。\n'+String(error?.message||error);const b=document.createElement('button');b.textContent='重新加载';b.onclick=()=>location.reload();loading.append(b);}
window.addEventListener('error',e=>fail(e.error||e.message));window.addEventListener('unhandledrejection',e=>fail(e.reason));
const timeout=setTimeout(()=>status('仍在准备画面，首次读取模型资源可能稍慢。'),60000);
try{
const required=["game-code.js", "pet-models-1.js", "pet-models-2.js", "game-fonts.js", "game-images.js"];
const missing=required.filter(name=>!globalThis.__ELEMENTAL_CHUNKS__?.[name]);
if(missing.length)throw Error("缺少游戏文件："+missing.join("、")+"。请将所有JS文件和index.html一起上传到同一个目录。");
const files=globalThis.__ELEMENTAL_FILES__,cache=new Map(),moduleCache=new Map(),texts=new Map();
delete globalThis.__ELEMENTAL_FILES__;delete globalThis.__ELEMENTAL_CHUNKS__;
if(!files||Object.keys(files).length!==83)throw Error("游戏资源不完整，请重新上传完整的文件。");
const bytes=p=>{if(!files[p])throw Error('内嵌资源缺失：'+p);const s=atob(files[p]),a=new Uint8Array(s.length);for(let i=0;i<s.length;i++)a[i]=s.charCodeAt(i);return a;};
if(typeof DecompressionStream!=='function')throw Error('浏览器不支持模型解压，请更新浏览器。');
const text=p=>{if(!texts.has(p))texts.set(p,(async()=>{const raw=bytes(p),data=p.endsWith('.mjs')?await new Response(new Blob([raw]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer():raw;delete files[p];return new TextDecoder().decode(data);})());return texts.get(p);};
const blob=(value,type)=>URL.createObjectURL(new Blob([value],{type}));
const asset=p=>{if(!cache.has(p)){cache.set(p,blob(bytes(p),p.endsWith('.woff2')?'font/woff2':'image/webp'));delete files[p];}return cache.get(p);};
const moduleURL=p=>{if(!moduleCache.has(p))moduleCache.set(p,(async()=>{let code=await text(p);code=code.replace(/(["'])(\.{1,2}\/[^"'\s]+\.mjs)\1/g,(_,q,r)=>q+new URL(r,'https://embedded.invalid'+p).pathname+q);const deps=[...new Set(code.match(/\/assets\/[a-zA-Z0-9_-]+\.mjs/g)||[])].filter(d=>d!==p),urls=await Promise.all(deps.map(moduleURL));deps.forEach((d,i)=>code=code.replaceAll(d,urls[i]));if(p==='/assets/game-1.mjs'){const old="$('pet-studio-frame').src='/pet-studio.html'";if(!code.includes(old))throw Error('离线图库入口缺失');code=code.replace(old,"window.__openEmbeddedPetStudio($('pet-studio-frame'))");}const url=blob(code,'text/javascript');texts.delete(p);return url;})());return moduleCache.get(p);};
const fonts=document.createElement('style');fonts.textContent=`@font-face{font-family:WorldText;src:url("${asset('/assets/5eaeb20435e99e0b6613.woff2')}") format('woff2');font-weight:100 900;font-display:swap}@font-face{font-family:ChatText;src:url("${asset('/assets/becd3b744a81b7236771.woff2')}") format('woff2');font-weight:100 900;font-display:swap}`;document.head.append(fonts);
let galleryPage=null;
window.__openEmbeddedPetStudio=async function(frame){try{if(!galleryPage){let gallery=await text('/assets/gallery-1.mjs');const three=await moduleURL('/assets/958e2f549f06b0c37647.mjs');gallery=gallery.replaceAll('/assets/958e2f549f06b0c37647.mjs',three);for(const p of [...Object.keys(files),...cache.keys()])if(p.endsWith('.webp'))gallery=gallery.replaceAll(p,asset(p));let page=(await text('/pet-studio.html')).replaceAll('/assets/gallery-1.mjs',blob(gallery,'text/javascript'));for(const p of cache.keys())if(p.endsWith('.woff2'))page=page.replaceAll(p.slice(0,-1),cache.get(p));galleryPage=page.replaceAll("format('woff')","format('woff2')");}frame.srcdoc=galleryPage;}catch(e){frame.srcdoc='<p>图库暂时无法打开，请返回重试。</p>';console.error(e);}};
status('1/3 · 读取游戏代码与模型');const gameURL=await moduleURL('/assets/game-1.mjs');status('2/3 · 准备浮岛与角色');await import(gameURL);status('3/3 · 等待画面');
const check=setInterval(()=>{if(failed){clearInterval(check);return;}if(loading.style.display==='none'||loading.style.opacity==='0'){ready=true;clearTimeout(timeout);clearInterval(check);}},100);
if(files['/assets/page-tools.mjs'])moduleURL('/assets/page-tools.mjs').then(url=>import(url)).catch(()=>{});
}catch(error){clearTimeout(timeout);fail(error);}
})();
