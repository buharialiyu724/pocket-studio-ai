/**
 * Pocket Studio AI — Cloudflare Worker
 * Optional text-prompt interpreter. Stores OPENAI_API_KEY as a Worker secret.
 * This returns edit instructions only; the browser applies the adjustments to the photo.
 */
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json; charset=utf-8"
};
const FILTERS = ["original","natural","vivid","warm","cool","dramatic","soft","portrait","mono","fade","golden","night"];
const RANGES = {brightness:[50,160],contrast:[50,160],saturation:[0,180],warmth:[-50,50],highlights:[-50,50],shadows:[-50,50],sharpness:[0,40],fade:[0,40]};
function reply(data,status=200){return new Response(JSON.stringify(data),{status,headers:CORS});}
export default {
 async fetch(request, env) {
  if(request.method==="OPTIONS") return new Response(null,{status:204,headers:CORS});
  if(request.method!=="POST") return reply({error:"Use POST with JSON {prompt}."},405);
  if(!env.OPENAI_API_KEY) return reply({error:"Server secret OPENAI_API_KEY is not configured."},500);
  let body;try{body=await request.json();}catch{return reply({error:"Expected JSON request body."},400);}
  const prompt=String(body.prompt||"").trim().slice(0,1200);
  if(!prompt)return reply({error:"Prompt is required."},400);
  const schema={type:"object",additionalProperties:false,properties:{
    filter:{type:"string",enum:FILTERS},
    adjustments:{type:"object",additionalProperties:false,properties:{
      brightness:{type:"number"},contrast:{type:"number"},saturation:{type:"number"},warmth:{type:"number"},highlights:{type:"number"},shadows:{type:"number"},sharpness:{type:"number"},fade:{type:"number"}
    },required:[]},
    message:{type:"string"}
  },required:["filter","adjustments","message"]};
  const upstream=await fetch("https://api.openai.com/v1/responses",{
    method:"POST",headers:{"Authorization":"Bearer "+env.OPENAI_API_KEY,"Content-Type":"application/json"},
    body:JSON.stringify({model:env.OPENAI_MODEL||"gpt-4.1-mini",input:[
      {role:"system",content:"You are Pocket Studio, a photo-editing instruction assistant. Convert the user's natural-language photo editing request into one suitable filter and optional numeric adjustment values. This is a color/tonal browser editor, not a generative image editor. Do not claim to alter facial features or remove objects. Choose conservative natural edits unless requested otherwise. Use ranges: brightness 50-160, contrast 50-160, saturation 0-180, warmth -50 to 50, highlights -50 to 50, shadows -50 to 50, sharpness 0-40, fade 0-40. Return only values matching the provided JSON schema."},
      {role:"user",content:prompt}
    ],text:{format:{type:"json_schema",name:"photo_edit_instructions",strict:true,schema}}})
  });
  if(!upstream.ok){const details=(await upstream.text()).slice(0,400);return reply({error:"AI provider error",details},502);}
  const data=await upstream.json();
  let output=data.output_text;
  if(!output && data.output){for(const item of data.output){for(const c of (item.content||[])){if(c.type==="output_text")output=c.text;}}}
  try{
    const result=JSON.parse(output);
    if(!FILTERS.includes(result.filter))result.filter="natural";
    for(const [key,val] of Object.entries(result.adjustments||{})){if(RANGES[key])result.adjustments[key]=Math.max(RANGES[key][0],Math.min(RANGES[key][1],Number(val)||0));else delete result.adjustments[key];}
    return reply(result);
  }catch{return reply({error:"Could not parse model response."},502);}
 }
};
