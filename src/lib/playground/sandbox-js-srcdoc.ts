import { SANDBOX_MAX_CODE_CHARS, SANDBOX_MAX_LOG_ARG_CHARS } from "@/lib/playground/constants";

/** Opaque-origin frame owns a disposable Worker. A loop cannot block the page,
 * and code has neither the site's origin nor the parent DOM/storage. */
export function getSandboxJsSrcdoc(): string {
  const workerSource = `
const MAX_ARG=${SANDBOX_MAX_LOG_ARG_CHARS};
let count=0;
function serialize(value){let text;try{text=typeof value==='string'?value:JSON.stringify(value);}catch(_){}if(typeof text!=='string'){try{text=String(value);}catch(_){text='[unprintable]';}}return text.slice(0,MAX_ARG);}
onmessage=async({data:d})=>{
 for(const level of ['log','info','warn','error','debug'])console[level]=(...args)=>{if(++count<=500)postMessage({type:'LOG',id:d.id,level,args:args.slice(0,50).map(serialize)});};
 try {
  const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;
  await new AsyncFunction('"use strict";\\n'+d.code)();
  postMessage({type:'DONE',id:d.id});
 }catch(e){postMessage({type:'ERROR',id:d.id,message:String(e?.message||e).slice(0,32768),stack:String(e?.stack||'').slice(0,65536)});}
};`;
  return `<!doctype html><meta charset="utf-8"><meta name="referrer" content="no-referrer"><script>
let worker,timer;
function post(m){parent.postMessage({source:'devbench-sandbox',...m},'*');}
onmessage=e=>{
 if(e.source!==parent)return;
 const d=e.data;
 if(!d||d.type!=='RUN'||!Number.isSafeInteger(d.id))return;
 if(typeof d.code!=='string'||d.code.length>${SANDBOX_MAX_CODE_CHARS}){post({type:'ERROR',id:d.id,message:'Code exceeds sandbox size limit.',stack:''});return;}
 if(worker)worker.terminate();clearTimeout(timer);
 const url=URL.createObjectURL(new Blob([${JSON.stringify(workerSource)}],{type:'text/javascript'}));
 worker=new Worker(url);URL.revokeObjectURL(url);
 worker.onmessage=({data:m})=>{post(m);if(m.type==='DONE'||m.type==='ERROR'){clearTimeout(timer);worker.terminate();}};
 worker.onerror=()=>{clearTimeout(timer);worker.terminate();post({type:'ERROR',id:d.id,message:'Sandbox worker failed.',stack:''});};
 timer=setTimeout(()=>{worker.terminate();post({type:'ERROR',id:d.id,message:'Execution stopped after 15 seconds.',stack:''});},15000);
 worker.postMessage(d);
};
post({type:'READY'});
<` + `/script>`;
}
