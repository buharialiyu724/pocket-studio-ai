(() => {
'use strict';
const $ = (id) => document.getElementById(id);
const photo = $('photo'), fileInput = $('fileInput'), canvas = $('canvas');
let originalUrl = null, fileName = 'pocket-studio-edit', currentFilter = 'original', compare = false, mode = 'iphone';
const defaults = {brightness:100,contrast:100,saturation:100,warmth:0,highlights:0,shadows:0,sharpness:0,fade:0};
let values = {...defaults};
const filterDefs = {
 original:{brightness:100,contrast:100,saturation:100,warmth:0,highlights:0,shadows:0,sharpness:0,fade:0,tip:'Original keeps every pixel treatment neutral.'},
 natural:{brightness:103,contrast:103,saturation:96,warmth:2,highlights:-5,shadows:5,sharpness:8,fade:0,tip:'Natural keeps skin tones balanced with gentle contrast.'},
 vivid:{brightness:103,contrast:115,saturation:128,warmth:0,highlights:-3,shadows:2,sharpness:14,fade:0,tip:'Vivid adds punchy color and stronger contrast.'},
 warm:{brightness:104,contrast:105,saturation:108,warmth:18,highlights:-5,shadows:5,sharpness:5,fade:0,tip:'Warm brings a golden, sunlit color temperature.'},
 cool:{brightness:101,contrast:108,saturation:98,warmth:-17,highlights:-4,shadows:3,sharpness:8,fade:0,tip:'Cool adds a crisp blue-neutral finish.'},
 dramatic:{brightness:97,contrast:128,saturation:91,warmth:3,highlights:-15,shadows:-12,sharpness:22,fade:0,tip:'Dramatic deepens contrast for a cinematic finish.'},
 soft:{brightness:106,contrast:91,saturation:94,warmth:5,highlights:-7,shadows:9,sharpness:0,fade:5,tip:'Soft gently lifts brightness and lowers contrast.'},
 portrait:{brightness:105,contrast:105,saturation:101,warmth:6,highlights:-9,shadows:8,sharpness:6,fade:0,tip:'Portrait aims for warm, flattering everyday skin tones.'},
 mono:{brightness:102,contrast:112,saturation:0,warmth:0,highlights:-5,shadows:2,sharpness:10,fade:0,tip:'Mono removes color for a classic black-and-white look.'},
 fade:{brightness:105,contrast:86,saturation:86,warmth:4,highlights:-5,shadows:10,sharpness:0,fade:18,tip:'Fade softens contrast for a subtle film-inspired look.'},
 golden:{brightness:106,contrast:107,saturation:110,warmth:25,highlights:-8,shadows:6,sharpness:5,fade:0,tip:'Golden gives the image a warm late-afternoon glow.'},
 night:{brightness:94,contrast:116,saturation:94,warmth:-5,highlights:-18,shadows:-4,sharpness:16,fade:0,tip:'Night emphasizes deep tones and controlled highlights.'}
};
const sliderConfig = [
 ['brightness','Brightness',50,160,1,'%'],['contrast','Contrast',50,160,1,'%'],['saturation','Saturation',0,180,1,'%'],
 ['warmth','Warmth',-50,50,1,''],['highlights','Highlights',-50,50,1,''],['shadows','Shadows',-50,50,1,''],['sharpness','Clarity',0,40,1,''],['fade','Fade',0,40,1,'']
];
function buildSliders(){
 $('sliders').innerHTML = sliderConfig.map(([key,label,min,max,step,unit])=>`<div class="slider-row"><label for="s-${key}">${label}</label><output id="o-${key}">${values[key]}${unit}</output><input id="s-${key}" type="range" min="${min}" max="${max}" step="${step}" value="${values[key]}" data-key="${key}" aria-label="${label}"></div>`).join('');
 $('sliders').querySelectorAll('input').forEach(input=>input.addEventListener('input',()=>{values[input.dataset.key]=Number(input.value);renderValues();applyPreview();}));
}
function renderValues(){sliderConfig.forEach(([key,,,,,unit])=>{const o=$('o-'+key),i=$('s-'+key);if(o)o.textContent=values[key]+unit;if(i)i.value=values[key];});}
function cssFilter(v){
 const brightness = Math.max(0.25, v.brightness/100 + v.shadows/350 + v.highlights/500);
 const contrast = Math.max(.2, v.contrast/100 + v.highlights/500);
 const saturation = Math.max(0, v.saturation/100);
 const sepia = Math.max(0,Math.min(.45,v.warmth/1000));
 const hue = v.warmth < 0 ? `hue-rotate(${v.warmth*.42}deg)` : '';
 return `brightness(${brightness}) contrast(${contrast}) saturate(${saturation}) sepia(${sepia}) ${hue}`;
}
function applyPreview(){if(photo.hidden)return;photo.style.filter=compare?'none':cssFilter(values);photo.style.opacity='1';}
function setFilter(name){currentFilter=name;values={...defaults,...filterDefs[name]};document.querySelectorAll('.preset').forEach(b=>b.classList.toggle('active',b.dataset.filter===name));$('lookTip').textContent=filterDefs[name].tip;renderValues();applyPreview();$('statusText').textContent=labelFilter(name)+' look selected';}
function labelFilter(s){return s.charAt(0).toUpperCase()+s.slice(1);}
function reset(){setFilter('original');toast('Edits reset');}
function toast(msg){const el=$('toast');el.textContent=msg;el.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('show'),2400);}
function openFile(file){if(!file)return;if(!file.type.startsWith('image/')){toast('Please choose an image file');return;}if(originalUrl)URL.revokeObjectURL(originalUrl);originalUrl=URL.createObjectURL(file);fileName=(file.name||'pocket-studio-edit').replace(/\.[^.]+$/,'').replace(/[^a-z0-9_-]/gi,'-');photo.onload=()=>{photo.hidden=false;$('emptyState').hidden=true;$('photoMeta').textContent=`${photo.naturalWidth} × ${photo.naturalHeight} px`;$('statusText').textContent='Photo loaded locally';applyPreview();};photo.onerror=()=>toast('This image could not be opened.');photo.src=originalUrl;setFilter('original');}
$('openBtn').addEventListener('click',()=>fileInput.click());$('chooseBtn').addEventListener('click',()=>fileInput.click());fileInput.addEventListener('change',e=>openFile(e.target.files[0]));
document.querySelectorAll('.preset').forEach(b=>b.addEventListener('click',()=>setFilter(b.dataset.filter)));
document.querySelectorAll('.tab').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('active',x===b));['looks','adjust','ai'].forEach(p=>$('panel-'+p).hidden=p!==b.dataset.tab);}));
document.querySelectorAll('.mode').forEach(b=>b.addEventListener('click',()=>{mode=b.dataset.mode;document.querySelectorAll('.mode').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-selected',String(x===b));});document.body.dataset.mode=mode;$('modeTitle').textContent=mode==='iphone'?'iPhone-inspired editor':'Galaxy-inspired editor';$('statusText').textContent=mode==='iphone'?'iPhone-style mode selected':'Galaxy-style mode selected';toast(mode==='iphone'?'iPhone-inspired controls selected':'Galaxy-inspired controls selected');}));
$('resetBtn').addEventListener('click',reset);$('resetSliders').addEventListener('click',reset);
$('compareBtn').addEventListener('pointerdown',e=>{if(photo.hidden)return;compare=true;photo.style.filter='none';$('canvasBadge').hidden=false;});function endCompare(){if(!compare)return;compare=false;$('canvasBadge').hidden=true;applyPreview();}$('compareBtn').addEventListener('pointerup',endCompare);$('compareBtn').addEventListener('pointerleave',endCompare);$('compareBtn').addEventListener('pointercancel',endCompare);
$('saveBtn').addEventListener('click',()=>{
 if(photo.hidden){toast('Choose a photo first');return;}
 const w=photo.naturalWidth,h=photo.naturalHeight;const c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d',{willReadFrequently:false});
 ctx.filter=cssFilter(values);ctx.drawImage(photo,0,0,w,h);ctx.filter='none';
 if(values.fade>0){ctx.globalAlpha=values.fade/100;ctx.fillStyle='#b9b0a0';ctx.fillRect(0,0,w,h);ctx.globalAlpha=1;}
 c.toBlob(blob=>{if(!blob){toast('Export failed; try another image');return;}const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=fileName+'-pocket-studio.jpg';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);toast('Edited photo exported as JPG');},'image/jpeg',.94);
});
document.querySelectorAll('.chip').forEach(b=>b.addEventListener('click',()=>{$('promptInput').value=b.textContent;}));
function localInterpret(prompt){
 const p=prompt.toLowerCase();let filter='natural';let note='Applied a natural starting look.';
 if(/black.?and.?white|monochrome|mono\b/.test(p)){filter='mono';note='Applied a monochrome look.';}
 else if(/cinematic|moody|dramatic|film noir/.test(p)){filter='dramatic';note='Applied a cinematic, higher-contrast look.';}
 else if(/golden|sunset|gold hour|warm|sunlit/.test(p)){filter='golden';note='Applied a warm golden look.';}
 else if(/cool|blue|icy/.test(p)){filter='cool';note='Applied a cool-toned look.';}
 else if(/vivid|vibrant|colourful|colorful|saturat/.test(p)){filter='vivid';note='Applied vivid color.';}
 else if(/soft|gentle|matte|fade|film/.test(p)){filter='soft';note='Applied a soft film-like look.';}
 else if(/night|dark/.test(p)){filter='night';note='Applied a deeper night look.';}
 else if(/portrait|iphone|samsung|natural|realistic|skin/.test(p)){filter='portrait';note='Applied a portrait-friendly look.';}
 setFilter(filter);
 if(/bright|lighten|brighter|exposure/.test(p))values.brightness=Math.min(160,values.brightness+12);
 if(/darken|darker/.test(p))values.brightness=Math.max(50,values.brightness-12);
 if(/contrast/.test(p))values.contrast=Math.min(160,values.contrast+12);
 if(/less contrast|soft contrast/.test(p))values.contrast=Math.max(50,values.contrast-12);
 if(/more color|more colour|vibrant|saturat/.test(p))values.saturation=Math.min(180,values.saturation+15);
 if(/less color|less colour|desaturat/.test(p))values.saturation=Math.max(0,values.saturation-25);
 if(/warm|golden|sunset/.test(p))values.warmth=Math.min(50,values.warmth+12);
 if(/cooler|cool tone|blue/.test(p))values.warmth=Math.max(-50,values.warmth-12);
 if(/sharp|crisp|detail/.test(p))values.sharpness=Math.min(40,values.sharpness+10);
 if(/soften|softer/.test(p))values.sharpness=Math.max(0,values.sharpness-5);
 renderValues();applyPreview();return note+' This quick assistant maps common editing words to local presets and sliders.';
}
async function runAI(){
 const prompt=$('promptInput').value.trim();if(!prompt){$('aiStatus').textContent='Write an instruction first.';return;}
 if(photo.hidden){$('aiStatus').textContent='Choose a photo before applying an instruction.';return;}
 const endpoint=$('aiEndpoint').value.trim();const btn=$('applyPrompt');btn.disabled=true;btn.textContent='Working…';$('aiStatus').textContent='';
 try{
   if(endpoint){
    const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt})});
    if(!response.ok)throw new Error('AI worker returned HTTP '+response.status);
    const data=await response.json();const allowed=['original','natural','vivid','warm','cool','dramatic','soft','portrait','mono','fade','golden','night'];
    if(data.filter&&allowed.includes(data.filter))setFilter(data.filter);
    if(data.adjustments&&typeof data.adjustments==='object'){for(const [k,v] of Object.entries(data.adjustments)){if(k in defaults&&Number.isFinite(Number(v)))values[k]=Math.max(({brightness:50,contrast:50,saturation:0,warmth:-50,highlights:-50,shadows:-50,sharpness:0,fade:0})[k],Math.min(({brightness:160,contrast:160,saturation:180,warmth:50,highlights:50,shadows:50,sharpness:40,fade:40})[k],Number(v)));}}
    renderValues();applyPreview();$('aiStatus').textContent=data.message||'AI instruction applied.'; $('statusText').textContent='AI assistant applied changes';
   }else{$('aiStatus').textContent=localInterpret(prompt);$('statusText').textContent='Local AI-style instruction applied';}
 }catch(err){$('aiStatus').textContent='Could not reach the AI worker ('+err.message+'). Applying a local interpretation instead.';localInterpret(prompt);}
 finally{btn.disabled=false;btn.textContent='✦ Apply instruction';}
}
$('applyPrompt').addEventListener('click',runAI);
buildSliders();
})();