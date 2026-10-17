var K=Object.defineProperty;var U=(d,e,t)=>e in d?K(d,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):d[e]=t;var u=(d,e,t)=>U(d,typeof e!="symbol"?e+"":e,t);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))n(s);new MutationObserver(s=>{for(const i of s)if(i.type==="childList")for(const r of i.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&n(r)}).observe(document,{childList:!0,subtree:!0});function t(s){const i={};return s.integrity&&(i.integrity=s.integrity),s.referrerPolicy&&(i.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?i.credentials="include":s.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function n(s){if(s.ep)return;s.ep=!0;const i=t(s);fetch(s.href,i)}})();class B{async validateApiKey(e,t){try{return await(await fetch("/api/validate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({provider:this.id,apiKey:e,baseUrl:t})})).json()}catch(n){return{valid:!1,message:n.message||"Connection test failed"}}}async streamChat(e){var x;const{messages:t,model:n,apiKey:s,baseUrl:i,images:r,temperature:o,maxTokens:a,systemPrompt:c,onChunk:l,onDone:m,onError:p,signal:w}=e;try{const y=[...t];c&&!y.some(S=>S.role==="system")&&y.unshift({role:"system",content:c});const b=await fetch("/api/chat/stream",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({provider:this.id,apiKey:s,baseUrl:i,model:n,messages:y,images:r,temperature:o,maxTokens:a}),signal:w});if(!b.ok){const S=await b.text();p(`Server returned ${b.status}: ${S}`);return}const h=(x=b.body)==null?void 0:x.getReader();if(!h){p("Response body is not readable stream");return}const M=new TextDecoder;let g="";for(;;){const{done:S,value:f}=await h.read();if(S)break;g+=M.decode(f,{stream:!0});const P=g.split(`
`);g=P.pop()||"";for(const E of P){const N=E.trim();if(!N||!N.startsWith("data: "))continue;const H=N.slice(6);if(H==="[DONE]"){m();return}try{const L=JSON.parse(H);if(L.error){p(L.error);return}if(L.delta&&l(L.delta),L.done){m();return}}catch{}}}m()}catch(y){if(y.name==="AbortError"){m();return}p(y.message||"Stream connection error")}}async generateImage(e){const t=await fetch("/api/image/generate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({provider:this.id,apiKey:e.apiKey,prompt:e.prompt,model:e.model,size:e.size||"1024x1024"})});if(!t.ok){const n=await t.json().catch(()=>({error:`HTTP ${t.status}`}));throw new Error(n.error||"Failed to generate image")}return await t.json()}}class V extends B{constructor(){super(...arguments);u(this,"id","gemini");u(this,"name","Google Gemini")}getModels(){return[{id:"gemini-3.6-flash",name:"Gemini 3.6 Flash",description:"Google's newest ultra-fast multimodal model with blazing throughput and exceptional reasoning.",contextWindow:1e6,capabilities:{textGeneration:!0,imageInput:!0,imageGeneration:!1,streaming:!0,functionCalling:!0,structuredOutput:!0},pricing:{promptPer1M:.075,completionPer1M:.3}},{id:"gemini-3.5-flash",name:"Gemini 3.5 Flash",description:"High-speed, reliable multimodal workhorse for high-volume document workflows.",contextWindow:1e6,capabilities:{textGeneration:!0,imageInput:!0,imageGeneration:!1,streaming:!0,functionCalling:!0,structuredOutput:!0},pricing:{promptPer1M:.075,completionPer1M:.3}},{id:"gemini-3.1-pro-preview",name:"Gemini 3.1 Pro (Preview)",description:"Google's advanced deep-reasoning model for complex analytical tasks.",contextWindow:1e6,capabilities:{textGeneration:!0,imageInput:!0,imageGeneration:!1,streaming:!0,functionCalling:!0,structuredOutput:!0},pricing:{promptPer1M:1.25,completionPer1M:5}},{id:"gemini-flash-latest",name:"Gemini Flash (Latest)",description:"Always routes to the latest stable Gemini Flash version.",contextWindow:1e6,capabilities:{textGeneration:!0,imageInput:!0,imageGeneration:!1,streaming:!0,functionCalling:!0,structuredOutput:!0},pricing:{promptPer1M:.075,completionPer1M:.3}}]}}const j="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";class Z extends B{constructor(){super(...arguments);u(this,"id","nvidia");u(this,"name","NVIDIA NIM")}getModels(){return[{id:"nvidia/nemotron-3.5-lightning-30b-a3b",name:"Nemotron 3.5 Lightning 30B",description:"NVIDIA's ultra-fast 30B MoE model (3.5B active params) — blazing throughput for document drafting, summarization, and coding.",contextWindow:128e3,capabilities:{textGeneration:!0,imageInput:!1,imageGeneration:!1,streaming:!0,functionCalling:!1,structuredOutput:!0},pricing:{promptPer1M:.2,completionPer1M:.6}}]}async streamChat(t){return super.streamChat({...t,provider:"nvidia",apiKey:t.apiKey||j})}}class J extends B{constructor(){super(...arguments);u(this,"id","openrouter");u(this,"name","OpenRouter")}getModels(){return[{id:"deepseek/deepseek-r1",name:"DeepSeek R1",description:"Open-weights reasoning model with exceptional performance in logic, math, and code.",contextWindow:128e3,capabilities:{textGeneration:!0,imageInput:!1,imageGeneration:!1,streaming:!0,functionCalling:!1,structuredOutput:!0},pricing:{promptPer1M:.55,completionPer1M:2.19}},{id:"meta-llama/llama-3.3-70b-instruct",name:"Llama 3.3 70B Instruct",description:"Meta’s open-weights high performance workhorse for drafting, outlining, and analysis.",contextWindow:128e3,capabilities:{textGeneration:!0,imageInput:!1,imageGeneration:!1,streaming:!0,functionCalling:!0,structuredOutput:!0},pricing:{promptPer1M:.4,completionPer1M:.4}},{id:"nvidia/nemotron-3-ultra-550b-a55b",name:"Nemotron 3 Ultra 550B",description:"NVIDIA’s massive 550B flagship model for sophisticated enterprise drafting and reasoning.",contextWindow:128e3,capabilities:{textGeneration:!0,imageInput:!1,imageGeneration:!1,streaming:!0,functionCalling:!0,structuredOutput:!0},pricing:{promptPer1M:.8,completionPer1M:2.4}},{id:"google/gemini-2.5-flash",name:"Gemini 2.5 Flash",description:"Google’s ultra-fast 1M context model via OpenRouter.",contextWindow:1e6,capabilities:{textGeneration:!0,imageInput:!0,imageGeneration:!1,streaming:!0,functionCalling:!0,structuredOutput:!0},pricing:{promptPer1M:.1,completionPer1M:.4}}]}}class Y extends B{constructor(){super(...arguments);u(this,"id","custom");u(this,"name","Custom / Local (Ollama, vLLM)")}getModels(){return[{id:"llama3:latest",name:"Ollama Llama 3",description:"Local private Llama 3 model running on localhost (zero external data sharing).",capabilities:{textGeneration:!0,imageInput:!1,imageGeneration:!1,streaming:!0,functionCalling:!1,structuredOutput:!0}},{id:"deepseek-r1:latest",name:"Ollama DeepSeek R1",description:"Local reasoning model running on localhost:11434.",capabilities:{textGeneration:!0,imageInput:!1,imageGeneration:!1,streaming:!0,functionCalling:!1,structuredOutput:!0}},{id:"qwen2.5:latest",name:"Ollama Qwen 2.5",description:"Local high performance multilingual model.",capabilities:{textGeneration:!0,imageInput:!1,imageGeneration:!1,streaming:!0,functionCalling:!1,structuredOutput:!0}}]}}class X extends B{constructor(){super(...arguments);u(this,"id","pollinations");u(this,"name","Pollinations.ai (Images)")}getModels(){return[{id:"tongyi-mai/z-image-turbo",name:"Z-Image Turbo",description:"Ultra-fast, high-fidelity diffusion model by Tongyi MAI on Pollinations.ai.",capabilities:{textGeneration:!1,imageInput:!1,imageGeneration:!0,streaming:!1,functionCalling:!1,structuredOutput:!1}},{id:"microsoft/mai-image-2.5-flash",name:"MAI Image 2.5 Flash",description:"High-speed, photorealistic visual synthesis model by Microsoft MAI on Pollinations.ai.",capabilities:{textGeneration:!1,imageInput:!1,imageGeneration:!0,streaming:!1,functionCalling:!1,structuredOutput:!1}}]}async validateApiKey(t){try{return await(await fetch("/api/validate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({provider:this.id,apiKey:t})})).json()}catch(n){return{valid:!1,message:n.message||"Pollinations.ai validation failed"}}}async generateImage(t){const n=await fetch("/api/image/generate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({provider:"pollinations",model:t.model||"tongyi-mai/z-image-turbo",prompt:t.prompt,size:t.size||"1024x1024",apiKey:t.apiKey})});if(!n.ok){const s=await n.json().catch(()=>({error:`HTTP ${n.status}`}));throw new Error(s.error||"Failed to generate image via Pollinations.ai")}return await n.json()}async streamChat(t){var i,r;const n=((i=t.messages.filter(o=>o.role==="user").pop())==null?void 0:i.content)||"",s=(r=t.model)!=null&&r.includes("flash")?"MAI Image 2.5 Flash":"Z-Image Turbo";try{t.onChunk(`🎨 *Generating image with ${s}...*

`);const o=await this.generateImage({prompt:n,provider:this.id,model:t.model});t.onChunk(`![${n}](${o.imageUrl})`),t.onDone()}catch(o){t.onError(o.message||"Image generation failed")}}}const C={API_KEYS:"office_ai_api_keys",ACTIVE_PROVIDER:"office_ai_active_provider",ACTIVE_MODEL:"office_ai_active_model",CUSTOM_MODELS:"office_ai_custom_models",CHATS:"office_ai_chat_sessions",ACTIVE_CHAT_ID:"office_ai_active_chat_id",SETTINGS:"office_ai_settings"},R={temperature:.7,maxTokens:4096,systemPrompt:"You are an expert AI assistant integrated into Microsoft Office (Word, Excel, PowerPoint). Provide clean, accurate, and structured answers. When generating Excel formulas, start with = and explain parameters. When drafting documents, format neatly with clear headings and tables. Tailor your responses to the current Office application context.",theme:"dark",directBrowserMode:!1,contextInclusionMode:"selection",customBaseUrl:"http://localhost:11434/v1"};class v{static getApiKeys(){try{const e=localStorage.getItem(C.API_KEYS);return e?JSON.parse(e):{}}catch{return{}}}static setApiKey(e,t){const n=this.getApiKeys();n[e]=t,localStorage.setItem(C.API_KEYS,JSON.stringify(n))}static removeApiKey(e){const t=this.getApiKeys();delete t[e],localStorage.setItem(C.API_KEYS,JSON.stringify(t))}static getActiveProvider(e="openai"){return localStorage.getItem(C.ACTIVE_PROVIDER)||e}static setActiveProvider(e){localStorage.setItem(C.ACTIVE_PROVIDER,e)}static getActiveModel(e="gpt-4o"){return localStorage.getItem(C.ACTIVE_MODEL)||e}static setActiveModel(e){localStorage.setItem(C.ACTIVE_MODEL,e)}static getCustomModels(){try{const e=localStorage.getItem(C.CUSTOM_MODELS);return e?JSON.parse(e):[]}catch{return[]}}static saveCustomModel(e){const t=this.getCustomModels().filter(n=>n.id!==e.id);t.push({...e,isCustom:!0}),localStorage.setItem(C.CUSTOM_MODELS,JSON.stringify(t))}static removeCustomModel(e){const t=this.getCustomModels().filter(n=>n.id!==e);localStorage.setItem(C.CUSTOM_MODELS,JSON.stringify(t))}static getSettings(){try{const e=localStorage.getItem(C.SETTINGS);return e?{...R,...JSON.parse(e)}:R}catch{return R}}static saveSettings(e){const n={...this.getSettings(),...e};return localStorage.setItem(C.SETTINGS,JSON.stringify(n)),n}static getChatSessions(){try{const e=localStorage.getItem(C.CHATS);return e?JSON.parse(e):[]}catch{return[]}}static saveChatSession(e){const t=this.getChatSessions().filter(s=>s.id!==e.id);t.unshift(e);const n=t.slice(0,50);localStorage.setItem(C.CHATS,JSON.stringify(n))}static deleteChatSession(e){const t=this.getChatSessions().filter(n=>n.id!==e);localStorage.setItem(C.CHATS,JSON.stringify(t))}static clearAllChats(){localStorage.removeItem(C.CHATS),localStorage.removeItem(C.ACTIVE_CHAT_ID)}}class I{static initialize(){this.providers.size>0||(this.register(new V),this.register(new Z),this.register(new J),this.register(new X),this.register(new Y))}static register(e){this.providers.set(e.id,e)}static getProvider(e){return this.initialize(),this.providers.get(e)}static getAllProviders(){return this.initialize(),Array.from(this.providers.values())}static getModelsForProvider(e){const t=this.getProvider(e);if(!t)return[];const n=t.getModels(),s=v.getCustomModels().filter(i=>i.providerId===e);return[...n,...s]}static getModelInfo(e,t){return this.getModelsForProvider(e).find(s=>s.id===t)||{id:t,name:t,capabilities:{textGeneration:!0,imageInput:!0,imageGeneration:!1,streaming:!0,functionCalling:!0,structuredOutput:!0}}}static calculateCost(e,t,n,s){const i=this.getModelInfo(e,t);if(!(i!=null&&i.pricing))return null;const r=n/1e6*i.pricing.promptPer1M,o=s/1e6*i.pricing.completionPer1M;return Number((r+o).toFixed(5))}}u(I,"providers",new Map);class A{static getHost(){if(this.detectedHost)return this.detectedHost;if(typeof Office<"u"&&Office.context&&Office.context.host)switch(Office.context.host){case Office.HostType.Word:this.detectedHost="Word";break;case Office.HostType.Excel:this.detectedHost="Excel";break;case Office.HostType.PowerPoint:this.detectedHost="PowerPoint";break;default:this.detectedHost="Unknown"}else this.detectedHost="Word";return this.detectedHost}static isOfficeReady(){return typeof Office<"u"&&typeof Office.context<"u"}}u(A,"detectedHost",null);class Q{constructor(e,t){u(this,"container");u(this,"onNewChat");u(this,"onOpenHistory");u(this,"onOpenSettings");this.container=e,this.onNewChat=t.onNewChat,this.onOpenHistory=t.onOpenHistory,this.onOpenSettings=t.onOpenSettings,this.render()}render(){var n,s,i;const e=A.getHost(),t=e.toLowerCase();this.container.innerHTML=`
      <header class="app-header">
        <div class="header-left">
          <div class="brand-icon" title="Office AI Copilot">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
              <path d="M5 3v4"/>
              <path d="M19 17v4"/>
              <path d="M3 5h4"/>
              <path d="M17 19h4"/>
            </svg>
          </div>
          <span class="brand-title">Office AI</span>
          <span class="host-badge ${t}">${e}</span>
        </div>
        <div class="header-actions">
          <button class="icon-btn" id="headerNewChatBtn" title="New Chat">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          </button>
          <button class="icon-btn" id="headerHistoryBtn" title="Chat History">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
              <path d="M3 3v5h5"/>
              <path d="M12 7v5l4 2"/>
            </svg>
          </button>
          <button class="icon-btn" id="headerSettingsBtn" title="Settings & API Keys">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </button>
        </div>
      </header>
    `,(n=this.container.querySelector("#headerNewChatBtn"))==null||n.addEventListener("click",this.onNewChat),(s=this.container.querySelector("#headerHistoryBtn"))==null||s.addEventListener("click",this.onOpenHistory),(i=this.container.querySelector("#headerSettingsBtn"))==null||i.addEventListener("click",this.onOpenSettings)}}class ee{constructor(e,t){u(this,"container");u(this,"onChange");u(this,"currentProvider");u(this,"currentModel");this.container=e,this.onChange=t,this.currentProvider=v.getActiveProvider("gemini"),this.currentModel=v.getActiveModel("gemini-3.6-flash"),this.render()}getCurrent(){return{providerId:this.currentProvider,modelId:this.currentModel}}updateCostDisplay(e,t){const n=this.container.querySelector("#costDisplay");if(n)if(e!==null&&e>0)n.textContent=`$${e.toFixed(4)}`,n.setAttribute("title",`${t||0} tokens estimated`);else{const s=I.getModelInfo(this.currentProvider,this.currentModel);n.textContent=s!=null&&s.contextWindow?`${Math.round(s.contextWindow/1e3)}k ctx`:"Ready"}}render(){var c;const e=I.getAllProviders();!e.some(l=>l.id===this.currentProvider)&&e.length>0&&(this.currentProvider=e[0].id,v.setActiveProvider(this.currentProvider));const t=I.getModelsForProvider(this.currentProvider);!t.some(l=>l.id===this.currentModel)&&t.length>0&&(this.currentModel=t[0].id,v.setActiveModel(this.currentModel));const n=e.map(l=>`<option value="${l.id}" ${l.id===this.currentProvider?"selected":""}>${l.name}</option>`).join(""),s=t.map(l=>`<option value="${l.id}" ${l.id===this.currentModel?"selected":""}>${l.name}</option>`).join(""),i=I.getModelInfo(this.currentProvider,this.currentModel),r=(c=i==null?void 0:i.capabilities)!=null&&c.imageGeneration?"🎨 Image Gen":i!=null&&i.contextWindow?`${Math.round(i.contextWindow/1e3)}k ctx`:"Ready";this.container.innerHTML=`
      <div class="model-toolbar">
        <div class="model-pickers">
          <select class="picker-select" id="providerSelect" title="Select AI Provider">
            ${n}
          </select>
          <select class="picker-select" id="modelSelect" title="Select Model">
            ${s}
          </select>
        </div>
        <div class="cost-pill" id="costDisplay" title="Model context window and session cost">${r}</div>
      </div>
    `;const o=this.container.querySelector("#providerSelect"),a=this.container.querySelector("#modelSelect");o.addEventListener("change",()=>{this.currentProvider=o.value,v.setActiveProvider(this.currentProvider);const l=I.getModelsForProvider(this.currentProvider);l.length>0&&(this.currentModel=l[0].id,v.setActiveModel(this.currentModel)),this.render(),this.onChange(this.currentProvider,this.currentModel)}),a.addEventListener("change",()=>{this.currentModel=a.value,v.setActiveModel(this.currentModel),this.updateCostDisplay(null),this.onChange(this.currentProvider,this.currentModel)})}}class O{static async getSelectedText(){if(typeof Word>"u"||!Office.context)return"";try{return await Word.run(async e=>{const t=e.document.getSelection();return t.load("text"),await e.sync(),t.text?t.text.trim():""})}catch(e){return console.warn("[WordService] getSelectedText error:",e),""}}static async getDocumentContext(){if(typeof Word>"u"||!Office.context)return{bodySnippet:"Sample Word document preview context."};try{return await Word.run(async e=>{const t=e.document.body;t.load("text"),await e.sync();const n=t.text||"",s=n.split(`
`).filter(a=>a.trim().length>0),i=s[0]?s[0].slice(0,100):"Untitled Document",r=n.slice(0,3e3),o=n.trim()?n.trim().split(/\s+/).length:0;return{title:i,bodySnippet:r,wordCount:o}})}catch(e){return console.warn("[WordService] getDocumentContext error:",e),{}}}static async insertText(e,t=!1){if(typeof Word>"u"||!Office.context)return console.log(`[WordService Mock] Insert text (replace=${t}):`,e),!0;try{return await Word.run(async n=>{const s=n.document.getSelection(),i=t?Word.InsertLocation.replace:Word.InsertLocation.after;s.insertText(e,i),await n.sync()}),!0}catch(n){return console.error("[WordService] insertText failed:",n),!1}}static async replaceSelection(e){return this.insertText(e,!0)}static async insertTable(e){if(e.length===0||e[0].length===0)return!1;if(typeof Word>"u"||!Office.context)return console.log("[WordService Mock] Insert native table:",e),!0;try{return await Word.run(async t=>{const n=t.document.getSelection(),s=e.length,i=e[0].length,r=n.insertTable(s,i,Word.InsertLocation.after,e);r.styleBuiltIn=Word.Style.gridTable4_Accent1,r.headerRowCount=1,await t.sync()}),!0}catch(t){return console.error("[WordService] insertTable failed:",t),this.insertText(e.map(n=>n.join("	")).join(`
`))}}static async insertImage(e){const t=e.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/,"");if(typeof Word>"u"||!Office.context)return console.log("[WordService Mock] Insert image"),!0;try{return await Word.run(async n=>{n.document.getSelection().insertInlinePictureFromBase64(t,Word.InsertLocation.after),await n.sync()}),!0}catch(n){return console.error("[WordService] insertImage failed:",n),!1}}}class T{static async getSelectedRangeData(){if(typeof Excel>"u"||!Office.context)return null;try{return await Excel.run(async e=>{const t=e.workbook.getSelectedRange();t.load(["address","values","formulas","rowCount","columnCount","worksheet"]),await e.sync();const n=t.worksheet;n.load("name"),await e.sync();const s=Math.min(t.rowCount,50),i=Math.min(t.columnCount,20),r=t.values.slice(0,s).map(a=>a.slice(0,i)),o=t.formulas.slice(0,s).map(a=>a.slice(0,i));return{address:t.address,sheetName:n.name,rowCount:t.rowCount,colCount:t.columnCount,values:r,formulas:o}})}catch(e){return console.warn("[ExcelService] getSelectedRangeData error:",e),null}}static formatRangeForPrompt(e){const t=[];t.push(`Worksheet: "${e.sheetName}", Range: ${e.address} (${e.rowCount} rows × ${e.colCount} columns)`),t.push("Data Table:");for(let n=0;n<e.values.length;n++){const s=e.values[n].map((i,r)=>{var a;const o=(a=e.formulas[n])==null?void 0:a[r];return typeof o=="string"&&o.startsWith("=")?`${i} [Formula: ${o}]`:i==null?"":String(i)});t.push(`| ${s.join(" | ")} |`)}return e.rowCount>50&&t.push(`(...and ${e.rowCount-50} more rows truncated for context)`),t.join(`
`)}static async insertFormula(e){const t=e.trim().startsWith("=")?e.trim():`=${e.trim()}`;if(typeof Excel>"u"||!Office.context)return console.log("[ExcelService Mock] Insert formula:",t),!0;try{return await Excel.run(async n=>{const s=n.workbook.getSelectedRange();s.formulas=[[t]],await n.sync()}),!0}catch(n){return console.error("[ExcelService] insertFormula failed:",n),!1}}static async insertData(e){if(!e||e.length===0)return!1;if(typeof Excel>"u"||!Office.context)return console.log("[ExcelService Mock] Insert data matrix:",e),!0;try{return await Excel.run(async t=>{const n=t.workbook.getSelectedRange();n.load(["rowIndex","columnIndex","worksheet"]),await t.sync();const i=n.worksheet.getRangeByIndexes(n.rowIndex,n.columnIndex,e.length,e[0].length);i.values=e,i.format.autofitColumns(),await t.sync()}),!0}catch(t){return console.error("[ExcelService] insertData failed:",t),!1}}static async insertImage(e){const t=e.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/,"");if(typeof Excel>"u"||!Office.context)return console.log("[ExcelService Mock] Insert image into Excel"),!0;try{return await Excel.run(async n=>{n.workbook.worksheets.getActiveWorksheet().shapes.addImage(t),await n.sync()}),!0}catch(n){return console.error("[ExcelService] insertImage failed:",n),!1}}}class G{static async getSelectedText(){return typeof Office>"u"||!Office.context||!Office.context.document?"":new Promise(e=>{Office.context.document.getSelectedDataAsync(Office.CoercionType.Text,t=>{t.status===Office.AsyncResultStatus.Succeeded&&t.value?e(String(t.value).trim()):e("")})})}static async insertText(e){return typeof Office>"u"||!Office.context||!Office.context.document?(console.log("[PowerPointService Mock] Insert text:",e),!0):new Promise(t=>{Office.context.document.setSelectedDataAsync(e,{coercionType:Office.CoercionType.Text},n=>{n.status===Office.AsyncResultStatus.Succeeded?t(!0):(console.error("[PowerPointService] insertText error:",n.error),t(!1))})})}static async createSlide(e,t){if(typeof PowerPoint<"u"&&PowerPoint.run)try{return await PowerPoint.run(async s=>{const o=s.presentation.slides.add(),a=o.shapes.addTextBox(e,{left:50,top:50,width:600,height:80});a.textFrame.textRange.font.size=28,a.textFrame.textRange.font.bold=!0;const c=t.map(m=>`• ${m}`).join(`
`),l=o.shapes.addTextBox(c,{left:50,top:150,width:620,height:350});return l.textFrame.textRange.font.size=18,await s.sync(),!0})}catch(s){console.warn("[PowerPointService] PowerPoint.run createSlide fallback:",s)}const n=`${e}

`+t.map(s=>`• ${s}`).join(`
`);return this.insertText(n)}static async insertImage(e){const t=e.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/,"");return typeof Office>"u"||!Office.context||!Office.context.document?(console.log("[PowerPointService Mock] Insert image"),!0):new Promise(n=>{Office.context.document.setSelectedDataAsync(t,{coercionType:Office.CoercionType.Image},s=>{s.status===Office.AsyncResultStatus.Succeeded?n(!0):(console.error("[PowerPointService] insertImage error:",s.error),n(!1))})})}}class te{static async getCurrentContext(e="selection"){const t=A.getHost();if(e==="none")return{host:t,type:"none",label:"No doc context"};try{if(t==="Word"){if(e==="selection"){const s=await O.getSelectedText();if(s){const i=s.split(/\s+/).length;return{host:t,type:"selection",label:`${i} words selected`,snippet:s.slice(0,150)+(s.length>150?"...":""),data:s}}}const n=await O.getDocumentContext();if(n.bodySnippet)return{host:t,type:"document",label:`${n.wordCount||0} words in document`,snippet:n.bodySnippet.slice(0,150)+"...",data:n.bodySnippet}}if(t==="Excel"){const n=await T.getSelectedRangeData();if(n)return{host:t,type:"selection",label:`${n.sheetName}!${n.address} (${n.rowCount}×${n.colCount})`,snippet:`Range ${n.address} (${n.rowCount} rows, ${n.colCount} cols)`,data:T.formatRangeForPrompt(n)}}if(t==="PowerPoint"){const n=await G.getSelectedText();if(n)return{host:t,type:"selection",label:`Selected slide text (${n.length} chars)`,snippet:n.slice(0,150)+"...",data:n}}}catch(n){console.warn("[ContextManager] Error retrieving context:",n)}return{host:t,type:"none",label:`Ready (${t})`}}}class ne{constructor(e){u(this,"container");u(this,"currentContext",null);u(this,"mode","selection");this.container=e,this.refresh()}getAttachedContext(){return this.mode==="none"?null:this.currentContext}async refresh(){this.currentContext=await te.getCurrentContext(this.mode),this.render()}setMode(e){this.mode=e,this.refresh()}render(){var n,s,i,r;const e=this.currentContext&&this.currentContext.type!=="none"&&this.mode!=="none",t=this.mode==="none"?"Context: Off":((n=this.currentContext)==null?void 0:n.label)||"Ready";this.container.innerHTML=`
      <div class="context-bar">
        <div class="context-info" title="${((s=this.currentContext)==null?void 0:s.snippet)||"Office document context status"}">
          <span class="context-dot ${e?"":"none"}"></span>
          <span>${t}</span>
        </div>
        <div style="display: flex; gap: 4px;">
          <button class="context-toggle-btn" id="refreshContextBtn" title="Refresh document context">
            ↻
          </button>
          <button class="context-toggle-btn" id="toggleContextModeBtn" title="Toggle context inclusion">
            ${this.mode==="none"?"Enable":"Detach"}
          </button>
        </div>
      </div>
    `,(i=this.container.querySelector("#refreshContextBtn"))==null||i.addEventListener("click",()=>this.refresh()),(r=this.container.querySelector("#toggleContextModeBtn"))==null||r.addEventListener("click",()=>{this.mode=this.mode==="none"?"selection":"none",this.refresh()})}}class se{constructor(e,t){u(this,"container");u(this,"onSelectAction");this.container=e,this.onSelectAction=t,this.render()}render(){const e=A.getHost();let t=[];e==="Word"?t=[{label:"✨ Rewrite Professionally",prompt:"Rewrite the selected text to sound polished, authoritative, and professional while preserving all key facts.",autoSend:!0},{label:"📝 Fix Grammar",prompt:"Correct any grammatical, spelling, and punctuation errors in the selected text without altering the core tone.",autoSend:!0},{label:"🔍 Summarize",prompt:"Provide a concise, bulleted executive summary of the selected text.",autoSend:!0},{label:"📊 Generate Table",prompt:"Create a clean, well-formatted comparison table from this information.",autoSend:!0},{label:"✉️ Draft Email",prompt:"Draft a clear, professional email regarding this subject."},{label:"🌐 Translate to Urdu",prompt:"Translate the selected text into natural, professional Urdu.",autoSend:!0}]:e==="Excel"?t=[{label:"📈 Explain Data",prompt:"Explain the selected worksheet data, highlight key trends, and provide 3 actionable insights.",autoSend:!0},{label:"🧮 Generate Formula",prompt:"Write an Excel formula to solve this problem: "},{label:"🔍 Find Outliers",prompt:"Analyze this range and identify any data anomalies, duplicates, or unusual outliers.",autoSend:!0},{label:"🏆 Top 5 Breakdown",prompt:"Identify the top 5 records by value and summarize their contribution to the total.",autoSend:!0},{label:"📊 Analyze Sales",prompt:"Perform a comprehensive sales variance and trend analysis on these numbers.",autoSend:!0}]:e==="PowerPoint"?t=[{label:"🎯 5-Slide Outline",prompt:"Create a structured 5-slide presentation outline on: "},{label:"🎤 Speaker Notes",prompt:"Generate professional presenter speaker notes for this slide.",autoSend:!0},{label:"✨ Improve Slide Content",prompt:"Rewrite the slide text to be punchy, high-impact, and easy to read for an audience.",autoSend:!0},{label:"💡 Generate Bullet Points",prompt:"Convert this concept into 3 to 4 impactful presentation bullet points.",autoSend:!0}]:t=[{label:"✨ Professional Rewrite",prompt:"Rewrite this text professionally: "},{label:"🔍 Summarize",prompt:"Summarize the following: "}],this.container.innerHTML=`
      <div class="quick-actions-bar">
        ${t.map((n,s)=>`<button class="chip-btn" data-index="${s}">${n.label}</button>`).join("")}
      </div>
    `,this.container.querySelectorAll(".chip-btn").forEach(n=>{n.addEventListener("click",s=>{const i=parseInt(s.currentTarget.dataset.index||"0"),r=t[i];this.onSelectAction(r.prompt,r.autoSend)})})}}function W(d){return d.replace(/&nbsp;/gi," ").replace(/&amp;/gi,"&").replace(/&lt;/gi,"<").replace(/&gt;/gi,">").replace(/&quot;/gi,'"').replace(/&#039;/gi,"'").replace(/&#(\d+);/g,(e,t)=>String.fromCharCode(Number(t)))}function $(d){return d.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}function F(d){if(!d)return"";let e=W(d);e=e.replace(/```([a-zA-Z0-9_\-]*)\n([\s\S]*?)```/g,(n,s,i)=>{const r=$(i.trim());return`<div class="code-block-wrapper">
      <div class="code-block-header">
        ${s?`<span class="code-lang">${s}</span>`:""}
        <button class="copy-code-btn" data-code="${encodeURIComponent(i.trim())}">Copy</button>
      </div>
      <pre><code class="language-${s||"plaintext"}">${r}</code></pre>
    </div>`}),e=e.replace(/`([^`\n]+)`/g,(n,s)=>`<code class="inline-code">${$(s)}</code>`);const t=/((?:\|[^\n]+\|\r?\n)+)/g;return e=e.replace(t,n=>{const s=n.trim().split(`
`);if(s.length<2)return n;let i='<div class="table-responsive"><table class="markdown-table">',r=!0;for(const o of s){if(/^\|[\s\-:|]+\|$/.test(o.trim())){r=!1;continue}const a=o.trim().slice(1,-1).split("|").map(l=>l.trim()),c=r?"th":"td";i+="<tr>";for(const l of a)i+=`<${c}>${$(W(l))}</${c}>`;i+="</tr>"}return i+="</table></div>",i}),e=e.replace(/^### (.*$)/gim,"<h3>$1</h3>"),e=e.replace(/^## (.*$)/gim,"<h2>$1</h2>"),e=e.replace(/^# (.*$)/gim,"<h1>$1</h1>"),e=e.replace(/^\> (.*$)/gim,"<blockquote>$1</blockquote>"),e=e.replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>"),e=e.replace(/\*([^*]+)\*/g,"<em>$1</em>"),e=e.replace(/^\s*[-*•]\s+(.*$)/gim,"<li>$1</li>"),e=e.replace(/(<li>.*<\/li>)/s,"<ul>$1</ul>"),e=e.replace(/!\[([^\]]*)\]\((data:image\/[^)]+|https?:\/\/[^)]+)\)/g,(n,s,i)=>`<div class="generated-image-card">
      <div class="image-wrapper">
        <img class="generated-image" src="${i}" alt="${$(s)}" loading="lazy" />
      </div>
      <div class="generated-image-footer">
        ${s?`<div class="image-prompt-caption" title="${$(s)}"><span class="caption-icon">🎨</span> <span>${$(s)}</span></div>`:"<div></div>"}
        <div class="image-card-actions">
          <button class="img-btn copy-card-img-btn" title="Copy image to clipboard (pastes directly into Word/Office)">📋 Copy Image</button>
          <button class="img-btn download-card-img-btn" data-img-name="${$(s||"generated-image")}" title="Save image to computer">💾 Save</button>
        </div>
      </div>
    </div>`),e=e.replace(/\n\n/g,"<p></p>"),e}function D(d){if(!d)return null;const e=d.match(/!\[[^\]]*\]\(((?:data:image\/[a-zA-Z0-9+.-]+;base64,[A-Za-z0-9+/=]+)|https?:\/\/[^\s)]+)\)/i);if(e)return e[1];const t=d.match(/(data:image\/[a-zA-Z0-9+.-]+;base64,[A-Za-z0-9+/=]+)/i);if(t)return t[1];const n=d.match(/<img[^>]+src=["']((?:data:image\/[a-zA-Z0-9+.-]+;base64,[A-Za-z0-9+/=]+)|https?:\/\/[^\s"']+)["']/i);return n?n[1]:null}async function ie(d){return new Promise((e,t)=>{const n=new Image;n.crossOrigin="anonymous",n.onload=()=>{try{const s=document.createElement("canvas");s.width=n.naturalWidth||n.width||512,s.height=n.naturalHeight||n.height||512;const i=s.getContext("2d");if(!i)throw new Error("Canvas 2D context unavailable");i.drawImage(n,0,0),s.toBlob(r=>{r?e(r):t(new Error("Failed to generate PNG blob from canvas"))},"image/png")}catch(s){t(s)}},n.onerror=s=>t(new Error("Failed to load image for clipboard conversion: "+s)),n.src=d})}async function _(d){try{const e=await ie(d);if(navigator.clipboard&&typeof ClipboardItem<"u")return await navigator.clipboard.write([new ClipboardItem({"image/png":e})]),!0}catch(e){console.error("[Clipboard] Failed to copy image to clipboard:",e)}return!1}function re(d,e="generated-image.png"){try{const t=document.createElement("a");t.href=d,t.download=e,document.body.appendChild(t),t.click(),document.body.removeChild(t)}catch(t){console.error("[Clipboard] Failed to download image:",t)}}function oe(d){return d?d.replace(/!\[([^\]]*)\]\((?:data:image\/[^)]+|https?:\/\/[^)]+)\)/g,(e,t)=>t?`[Image: ${t}]`:"[Image]").replace(/&nbsp;/gi," ").replace(/&amp;/gi,"&").replace(/&lt;/gi,"<").replace(/&gt;/gi,">").replace(/&quot;/gi,'"').replace(/&#39;/gi,"'"):""}class q{static parseMarkdownTable(e){const t=e.split(`
`).map(s=>s.trim()).filter(s=>s.startsWith("|")&&s.endsWith("|"));if(t.length<2)return null;const n=[];for(const s of t){if(/^\|[\s\-:|]+\|$/.test(s))continue;const i=s.slice(1,-1).split("|").map(r=>r.replace(/&nbsp;/gi," ").trim());n.push(i)}return n.length>0?n:null}static extractFormula(e){const t=e.match(/```(?:excel|formula)?\s*(=[^\n`]+)```/i);if(t)return t[1].trim();const n=e.match(/`(=[A-Z0-9_]+(?:\([^`]+\))?)`/i);if(n)return n[1].trim();const s=e.match(/^\s*(=[A-Z_]+(?:\([^\n]+\))?)\s*$/m);return s?s[1].trim():null}static async insertContent(e,t=!1){const n=A.getHost(),s=D(e);try{if(s)return await this.insertImage(s);if(n==="Word"){const i=this.parseMarkdownTable(e);if(i&&i.length>1&&!t){const o=await O.insertTable(i);return{success:o,message:o?"Inserted table into Word":"Failed to insert table"}}const r=t?await O.replaceSelection(e):await O.insertText(e);return{success:r,message:r?t?"Replaced selection in Word":"Inserted text into Word":"Insertion failed"}}if(n==="Excel"){const i=this.extractFormula(e);if(i){const a=await T.insertFormula(i);return{success:a,message:a?`Inserted formula ${i} into cell`:"Failed to insert formula"}}const r=this.parseMarkdownTable(e);if(r){const a=await T.insertData(r);return{success:a,message:a?"Inserted data grid into worksheet":"Failed to insert data"}}const o=await T.insertData([[e]]);return{success:o,message:o?"Inserted text into cell":"Failed to insert"}}if(n==="PowerPoint"){const i=await G.insertText(e);return{success:i,message:i?"Inserted content into slide":"Failed to insert"}}return{success:!0,message:"Simulated insert (Standalone mode)"}}catch(i){return{success:!1,message:i.message||"Action failed"}}}static async insertFormula(e){const t=await T.insertFormula(e);return{success:t,message:t?`Formula ${e} inserted`:"Failed to insert formula"}}static async createSlideFromText(e){const t=e.split(`
`).map(r=>r.trim()).filter(r=>r.length>0);if(t.length===0)return{success:!1,message:"No content to create slide"};const n=t[0].replace(/^#+\s*/,""),s=t.slice(1).map(r=>r.replace(/^[-*•]\s*/,"")),i=await G.createSlide(n,s.length>0?s:["Key point"]);return{success:i,message:i?`Created new slide: "${n}"`:"Failed to create slide"}}static async insertImage(e){const t=A.getHost();let n=!1;return t==="Word"?n=await O.insertImage(e):t==="Excel"?n=await T.insertImage(e):t==="PowerPoint"?n=await G.insertImage(e):n=!0,{success:n,message:n?`Image inserted into ${t}`:"Failed to insert image"}}}class ae{constructor(e,t){u(this,"container");u(this,"onRegenerate");u(this,"onShowToast");this.container=e,this.onRegenerate=t.onRegenerate,this.onShowToast=t.onShowToast}render(e,t=!1){if(e.length===0){this.renderWelcome();return}const n=A.getHost();this.container.innerHTML=`
      <div class="chat-viewport" id="chatViewport">
        ${e.map(s=>this.renderMessage(s,n)).join("")}
      </div>
    `,this.attachEventListeners(e),this.scrollToBottom()}renderWelcome(){const e=A.getHost();this.container.innerHTML=`
      <div class="chat-viewport" id="chatViewport">
        <div class="welcome-hero">
          <div class="welcome-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
            </svg>
          </div>
          <h2 class="welcome-title">Unified Office AI Copilot</h2>
          <p class="welcome-desc">
            Interact with OpenAI, Gemini, Claude, and OpenRouter directly inside Microsoft ${e}.
          </p>
          <div class="welcome-cards">
            <div class="welcome-card" data-prompt="${this.getDefaultPrompt(e,1)}">
              <div class="welcome-card-title">${this.getPromptTitle(e,1)}</div>
              <div class="welcome-card-subtitle">${this.getPromptDesc(e,1)}</div>
            </div>
            <div class="welcome-card" data-prompt="${this.getDefaultPrompt(e,2)}">
              <div class="welcome-card-title">${this.getPromptTitle(e,2)}</div>
              <div class="welcome-card-subtitle">${this.getPromptDesc(e,2)}</div>
            </div>
          </div>
        </div>
      </div>
    `,this.container.querySelectorAll(".welcome-card").forEach(t=>{t.addEventListener("click",()=>{const n=t.getAttribute("data-prompt")||"",s=document.querySelector("#promptInput");s&&(s.value=n,s.focus())})})}getDefaultPrompt(e,t){return e==="Excel"?t===1?"Explain this data and identify top trends and outliers.":"Create an Excel formula using XLOOKUP to match IDs and calculate total revenue.":e==="PowerPoint"?t===1?"Create a 5-slide presentation outline on Artificial Intelligence in modern education.":"Generate speaker notes for this slide focusing on executive decision makers.":t===1?"Rewrite this paragraph to be persuasive, concise, and executive-ready.":"Create a comparative analysis table detailing the pros and cons of cloud migration."}getPromptTitle(e,t){return e==="Excel"?t===1?"Analyze Spreadsheet":"Write Smart Formula":e==="PowerPoint"?t===1?"Create Presentation":"Generate Speaker Notes":t===1?"Polished Document Rewrite":"Generate Comparison Table"}getPromptDesc(e,t){return e==="Excel"?t===1?"Summarizes statistics & key findings":"Calculates dynamic metrics":e==="PowerPoint"?t===1?"Outline with slide titles and bullets":"Tailored talking points":t===1?"Enhance tone, clarity, and impact":"Structured markdown table"}renderMessage(e,t){const n=e.role==="user",s=e.role==="assistant";let i=n?`<p>${e.content.replace(/\n/g,"<br>")}</p>`:F(e.content);e.isStreaming&&(i+='<span class="streaming-cursor"></span>');let r="";e.images&&e.images.length>0&&(r=`<div class="attachments-preview">
        ${e.images.map(c=>`<div class="attachment-chip"><img src="${c.data.startsWith("data:")?c.data:`data:${c.mimeType};base64,${c.data}`}" /> <span>${c.name}</span></div>`).join("")}
      </div>`);let o="";if(s&&!e.isStreaming&&!e.isError){const c=q.extractFormula(e.content),l=t==="PowerPoint",m=!!D(e.content);o=`
        <div class="message-actions-bar" data-msg-id="${e.id}">
          <button class="action-chip-btn primary insert-btn" title="Insert directly into document">
            📥 Insert
          </button>
          <button class="action-chip-btn replace-btn" title="Replace highlighted selection">
            ⇄ Replace
          </button>
          ${c?`<button class="action-chip-btn excel-action formula-btn" data-formula="${encodeURIComponent(c)}" title="Insert formula into selected cell">🧮 Insert Formula</button>`:""}
          ${l?'<button class="action-chip-btn ppt-action slide-btn" title="Create slide from this outline">🎯 Create Slide</button>':""}
          <button class="action-chip-btn copy-btn" title="${m?"Copy image to clipboard (pastes as picture directly into Word/Office)":"Copy response to clipboard"}">
            📋 ${m?"Copy Image":"Copy"}
          </button>
          <button class="action-chip-btn regen-btn" title="Regenerate response">
            ↻ Regenerate
          </button>
        </div>
      `}const a=n?"You":`${e.provider?e.provider.toUpperCase():"AI"}${e.model?` (${e.model})`:""}`;return`
      <div class="chat-message ${e.role}" id="msg-${e.id}">
        <div class="message-meta">${a}</div>
        ${r}
        <div class="message-bubble ${e.isError?"error-bubble":""}">
          ${i}
        </div>
        ${o}
      </div>
    `}attachEventListeners(e){this.container.querySelectorAll(".copy-code-btn").forEach(t=>{t.addEventListener("click",n=>{const s=n.currentTarget,i=decodeURIComponent(s.dataset.code||"");navigator.clipboard.writeText(i).then(()=>{s.textContent="Copied!",setTimeout(()=>{s.textContent="Copy"},1500)})})}),this.container.querySelectorAll(".copy-card-img-btn").forEach(t=>{t.addEventListener("click",async n=>{const s=n.currentTarget,i=s.closest(".generated-image-card"),r=i==null?void 0:i.querySelector("img.generated-image");if(!r||!r.src)return;s.textContent="Copying...",await _(r.src)?(s.textContent="✓ Copied!",s.classList.add("copied"),this.onShowToast("Image copied to clipboard! Paste directly into Word."),setTimeout(()=>{s.textContent="📋 Copy Image",s.classList.remove("copied")},2e3)):(s.textContent="📋 Copy Image",this.onShowToast("Could not copy image to clipboard"))})}),this.container.querySelectorAll(".download-card-img-btn").forEach(t=>{t.addEventListener("click",n=>{const s=n.currentTarget,i=s.closest(".generated-image-card"),r=i==null?void 0:i.querySelector("img.generated-image");if(!r||!r.src)return;const a=(s.dataset.imgName||"generated-image").replace(/[^a-zA-Z0-9_-]/g,"_").slice(0,40);re(r.src,`${a}.png`),this.onShowToast("Image downloaded")})}),this.container.querySelectorAll(".message-actions-bar").forEach(t=>{var i,r,o,a,c,l;const n=t.dataset.msgId,s=e.find(m=>m.id===n);s&&((i=t.querySelector(".insert-btn"))==null||i.addEventListener("click",async()=>{const m=await q.insertContent(s.content,!1);this.onShowToast(m.message)}),(r=t.querySelector(".replace-btn"))==null||r.addEventListener("click",async()=>{const m=await q.insertContent(s.content,!0);this.onShowToast(m.message)}),(o=t.querySelector(".formula-btn"))==null||o.addEventListener("click",async m=>{const p=decodeURIComponent(m.currentTarget.dataset.formula||""),w=await q.insertFormula(p);this.onShowToast(w.message)}),(a=t.querySelector(".slide-btn"))==null||a.addEventListener("click",async()=>{const m=await q.createSlideFromText(s.content);this.onShowToast(m.message)}),(c=t.querySelector(".copy-btn"))==null||c.addEventListener("click",async()=>{const m=D(s.content);if(m&&(this.onShowToast("Copying image to clipboard..."),await _(m))){this.onShowToast("Image copied to clipboard! Paste directly into Word.");return}const p=oe(s.content);await navigator.clipboard.writeText(p),this.onShowToast("Copied to clipboard")}),(l=t.querySelector(".regen-btn"))==null||l.addEventListener("click",()=>{n&&this.onRegenerate(n)}))})}scrollToBottom(){const e=this.container.querySelector("#chatViewport");e&&(e.scrollTop=e.scrollHeight)}updateStreamingBubble(e,t){const n=this.container.querySelector(`#msg-${e} .message-bubble`);n&&(n.innerHTML=F(t)+'<span class="streaming-cursor"></span>',this.scrollToBottom())}}class k{static ensureContainer(){return this.container||(this.container=document.createElement("div"),this.container.className="toast-container",document.body.appendChild(this.container)),this.container}static show(e,t="info",n=3500){const s=this.ensureContainer(),i=document.createElement("div");i.className=`toast toast-${t}`;let r=`
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
      </svg>
    `;t==="success"?r=`
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M20 6 9 17l-5-5"/>
        </svg>
      `:(t==="warning"||t==="error")&&(r=`
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      `),i.innerHTML=`${r}<span>${e}</span>`,t==="error"?(i.style.borderColor="var(--error)",i.style.color="#fca5a5"):t==="warning"&&(i.style.borderColor="var(--warning)",i.style.color="#fde68a"),s.appendChild(i),setTimeout(()=>{i.style.opacity="0",i.style.transform="translateY(10px)",i.style.transition="all 0.2s ease",setTimeout(()=>i.remove(),200)},n)}}u(k,"container",null);class ce{constructor(e,t){u(this,"container");u(this,"onSend");u(this,"onStop");u(this,"isGenerating",!1);u(this,"attachedImages",[]);u(this,"visionSupported",!0);this.container=e,this.onSend=t.onSend,this.onStop=t.onStop,this.render()}setGenerating(e){this.isGenerating=e,this.render()}setVisionSupported(e){this.visionSupported=e;const t=this.container.querySelector("#attachBtn");t&&(t.disabled=!e,t.setAttribute("title",e?"Attach image (Vision)":"Current model does not support vision"),t.style.opacity=e?"1":"0.4")}setInput(e){const t=this.container.querySelector("#promptInput");t&&(t.value=e,t.focus(),this.autoResize(t))}render(){this.container.innerHTML=`
      <div class="input-area">
        ${this.renderAttachmentPreviews()}
        <div class="input-box-wrapper">
          <input type="file" id="fileInput" accept="image/png,image/jpeg,image/webp" style="display: none;" multiple />
          <button class="input-action-btn" id="attachBtn" title="${this.visionSupported?"Attach image (Vision)":"Vision not supported on model"}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
              <circle cx="9" cy="9" r="2"/>
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
            </svg>
          </button>
          
          <textarea 
            class="prompt-textarea" 
            id="promptInput" 
            rows="1" 
            placeholder="Ask AI anything, write, summarize, or analyze data..."
          ></textarea>

          ${this.isGenerating?`
            <button class="input-action-btn stop-btn" id="stopBtn" title="Stop Generation">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <rect width="14" height="14" x="5" y="5" rx="2"/>
              </svg>
            </button>
          `:`
            <button class="input-action-btn send-btn" id="sendBtn" title="Send (Enter)">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="m5 12 7-7 7 7"/>
                <path d="M12 19V5"/>
              </svg>
            </button>
          `}
        </div>
        <div class="input-footer">
          <span>Shift+Enter for new line</span>
          <span>Unified Office AI</span>
        </div>
      </div>
    `,this.attachEventListeners()}renderAttachmentPreviews(){return this.attachedImages.length===0?"":`
      <div class="attachments-preview">
        ${this.attachedImages.map((e,t)=>`
          <div class="attachment-chip">
            <img src="${e.data.startsWith("data:")?e.data:`data:${e.mimeType};base64,${e.data}`}" />
            <span>${e.name}</span>
            <button class="remove-attach-btn" data-index="${t}" style="margin-left: 4px; color: var(--text-muted);">✕</button>
          </div>
        `).join("")}
      </div>
    `}attachEventListeners(){const e=this.container.querySelector("#promptInput"),t=this.container.querySelector("#sendBtn"),n=this.container.querySelector("#stopBtn"),s=this.container.querySelector("#attachBtn"),i=this.container.querySelector("#fileInput");e==null||e.addEventListener("input",()=>this.autoResize(e)),e==null||e.addEventListener("keydown",r=>{r.key==="Enter"&&!r.shiftKey&&(r.preventDefault(),this.submit())}),t==null||t.addEventListener("click",()=>this.submit()),n==null||n.addEventListener("click",()=>this.onStop()),s==null||s.addEventListener("click",()=>i==null?void 0:i.click()),i==null||i.addEventListener("change",async()=>{if(!i.files)return;for(let o=0;o<i.files.length;o++){const a=i.files[o];if(a.size>10*1024*1024){k.show("Image size exceeds 10MB limit","warning");continue}const c=await this.fileToBase64(a);this.attachedImages.push({name:a.name,mimeType:a.type,data:c,size:a.size})}i.value="",this.render();const r=this.container.querySelector("#promptInput");r==null||r.focus()}),this.container.querySelectorAll(".remove-attach-btn").forEach(r=>{r.addEventListener("click",o=>{const a=parseInt(o.currentTarget.dataset.index||"0");this.attachedImages.splice(a,1),this.render()})})}submit(){const e=this.container.querySelector("#promptInput");if(!e)return;const t=e.value.trim();if(!t&&this.attachedImages.length===0)return;const n=[...this.attachedImages];e.value="",this.attachedImages=[],this.autoResize(e),this.render(),this.onSend(t,n)}autoResize(e){e.style.height="auto",e.style.height=Math.min(e.scrollHeight,120)+"px"}fileToBase64(e){return new Promise((t,n)=>{const s=new FileReader;s.onload=()=>t(s.result),s.onerror=n,s.readAsDataURL(e)})}}class le{constructor(e,t){u(this,"container");u(this,"isOpen",!1);u(this,"onClose");u(this,"onSaved");this.container=e,this.onClose=t.onClose,this.onSaved=t.onSaved}open(){this.isOpen=!0,this.render()}close(){this.isOpen=!1,this.render(),this.onClose()}render(){const e=v.getApiKeys(),t=v.getSettings();this.container.innerHTML=`
      <div class="modal-overlay ${this.isOpen?"open":""}" id="settingsOverlay">
        <div class="modal-drawer">
          <div class="modal-header">
            <span class="modal-title">Settings & AI Providers</span>
            <button class="icon-btn" id="closeSettingsBtn" title="Close">✕</button>
          </div>
          <div class="modal-body">
            <!-- Provider API Keys Section -->
            <div class="modal-section">
              <span class="modal-section-title">AI Provider Credentials</span>
              

              <!-- Google Gemini -->
              <div class="provider-card">
                <div class="provider-card-header">
                  <span class="provider-name">Google Gemini</span>
                  <div class="test-status" id="status-gemini"></div>
                </div>
                <div class="form-group">
                  <input type="password" class="form-input" id="key-gemini" placeholder="AIzaSy..." value="${e.gemini||"AIzaSyCNxCH18ujqzuYU-clbV4qP7KP8G-1zqKc"}" />
                </div>
                <div class="btn-row">
                  <button class="btn-secondary test-btn" data-provider="gemini">Test Connection</button>
                </div>
              </div>

              <!-- NVIDIA NIM -->
              <div class="provider-card">
                <div class="provider-card-header">
                  <span class="provider-name">NVIDIA NIM</span>
                  <div class="test-status" id="status-nvidia"></div>
                </div>
                <div class="form-group">
                  <input type="password" class="form-input" id="key-nvidia"
                    placeholder="nvapi-..."
                    value="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"
                    title="Pre-configured NVIDIA NIM key — no changes needed" />
                </div>
                <div class="btn-row">
                  <button class="btn-secondary test-btn" data-provider="nvidia">Test Connection</button>
                </div>
              </div>

              <!-- OpenRouter -->
              <div class="provider-card">
                <div class="provider-card-header">
                  <span class="provider-name">OpenRouter</span>
                  <div class="test-status" id="status-openrouter"></div>
                </div>
                <div class="form-group">
                  <input type="password" class="form-input" id="key-openrouter" placeholder="sk-or-..." value="${e.openrouter||""}" />
                </div>
                <div class="btn-row">
                  <button class="btn-secondary test-btn" data-provider="openrouter">Test Connection</button>
                </div>
              </div>

              <!-- Pollinations.ai (Images) -->
              <div class="provider-card">
                <div class="provider-card-header">
                  <span class="provider-name">Pollinations.ai (Images)</span>
                  <div class="test-status" id="status-pollinations"></div>
                </div>
                <div class="form-group">
                  <input type="password" class="form-input" id="key-pollinations"
                    placeholder="sk_..."
                    value="${e.pollinations||"sk_BxKRwDPsUUbNK4UcQgUhBoGojw3fAyzw"}"
                    title="Stored securely on server via .env" />
                </div>
                <div class="btn-row">
                  <button class="btn-secondary test-btn" data-provider="pollinations">Test Connection</button>
                </div>
              </div>

              <!-- Custom / Local -->
              <div class="provider-card">
                <div class="provider-card-header">
                  <span class="provider-name">Custom / Local LLM</span>
                  <div class="test-status" id="status-custom"></div>
                </div>
                <div class="form-group">
                  <label class="form-label">Base URL (Ollama, vLLM, etc.)</label>
                  <input type="text" class="form-input" id="custom-base-url" placeholder="http://localhost:11434/v1" value="${t.customBaseUrl||"http://localhost:11434/v1"}" />
                </div>
                <div class="form-group">
                  <label class="form-label">API Key (Optional)</label>
                  <input type="password" class="form-input" id="key-custom" placeholder="Optional" value="${e.custom||""}" />
                </div>
                <div class="btn-row">
                  <button class="btn-secondary test-btn" data-provider="custom">Test Connection</button>
                </div>
              </div>
            </div>

            <!-- Custom Model Adder -->
            <div class="modal-section">
              <span class="modal-section-title">Add Custom Model</span>
              <div class="provider-card">
                <div class="form-group">
                  <label class="form-label">Model Identifier (e.g. meta-llama/llama-3.3-70b-instruct)</label>
                  <input type="text" class="form-input" id="customModelId" placeholder="provider/model-name" />
                </div>
                <div class="form-group">
                  <label class="form-label">Display Name</label>
                  <input type="text" class="form-input" id="customModelName" placeholder="My Custom Model" />
                </div>
                <div class="form-group">
                  <label class="form-label">Target Provider</label>
                  <select class="form-input" id="customModelProvider">
                    <option value="openrouter">OpenRouter</option>
                    <option value="custom">Custom / Local</option>
                    <option value="openai">OpenAI</option>
                  </select>
                </div>
                <button class="btn-secondary" id="addModelBtn">+ Add Model</button>
              </div>
            </div>

            <!-- Parameters & System Prompt -->
            <div class="modal-section">
              <span class="modal-section-title">Model Parameters</span>
              <div class="form-group">
                <label class="form-label">Temperature: <span id="tempVal">${t.temperature}</span></label>
                <input type="range" min="0" max="1" step="0.05" value="${t.temperature}" id="tempSlider" />
              </div>
              <div class="form-group">
                <label class="form-label">System Prompt</label>
                <textarea class="form-input form-textarea" id="systemPrompt">${t.systemPrompt}</textarea>
              </div>
            </div>

            <!-- Theme & Appearance -->
            <div class="modal-section">
              <span class="modal-section-title">Theme</span>
              <div class="form-group">
                <select class="form-input" id="themeSelect">
                  <option value="dark" ${t.theme==="dark"?"selected":""}>Dark Mode</option>
                  <option value="light" ${t.theme==="light"?"selected":""}>Light Mode</option>
                </select>
              </div>
            </div>

            <!-- Save Action -->
            <div style="margin-top: 10px;">
              <button class="btn-primary" id="saveSettingsBtn" style="width: 100%;">Save Settings</button>
            </div>
          </div>
        </div>
      </div>
    `,this.attachEventListeners()}attachEventListeners(){const e=this.container.querySelector("#settingsOverlay"),t=this.container.querySelector("#closeSettingsBtn"),n=this.container.querySelector("#saveSettingsBtn"),s=this.container.querySelector("#tempSlider"),i=this.container.querySelector("#tempVal"),r=this.container.querySelector("#addModelBtn");t==null||t.addEventListener("click",()=>this.close()),e==null||e.addEventListener("click",o=>{o.target===e&&this.close()}),s==null||s.addEventListener("input",()=>{i&&(i.textContent=s.value)}),this.container.querySelectorAll(".test-btn").forEach(o=>{o.addEventListener("click",async a=>{var h;const c=a.currentTarget.dataset.provider||"",l=this.container.querySelector(`#status-${c}`),m=this.container.querySelector(`#key-${c}`),p=this.container.querySelector("#custom-base-url"),w=((h=m==null?void 0:m.value)==null?void 0:h.trim())||"";if(["openai","gemini","openrouter"].includes(c)&&!w){l&&(l.textContent="✗ Please enter an API key first",l.className="test-status error");return}l&&(l.textContent="Testing...",l.className="test-status");const y=I.getProvider(c);if(!y)return;const b=await y.validateApiKey(w,p==null?void 0:p.value);l&&(b.valid?(l.textContent="✓ Connected",l.className="test-status success"):(l.textContent=`✗ ${b.message||"Failed"}`,l.className="test-status error"))})}),r==null||r.addEventListener("click",()=>{const o=this.container.querySelector("#customModelId"),a=this.container.querySelector("#customModelName"),c=this.container.querySelector("#customModelProvider");o.value.trim()&&(v.saveCustomModel({id:o.value.trim(),name:a.value.trim()||o.value.trim(),capabilities:{textGeneration:!0,imageInput:!1,imageGeneration:!1,streaming:!0,functionCalling:!1,structuredOutput:!0},providerId:c.value}),k.show(`Custom model "${o.value}" added!`,"success"),o.value="",a.value="",this.onSaved())}),n==null||n.addEventListener("click",()=>{var b,h,M,g,S,f,P,E;const o=(b=this.container.querySelector("#key-gemini"))==null?void 0:b.value.trim(),a=(h=this.container.querySelector("#key-nvidia"))==null?void 0:h.value.trim(),c=(M=this.container.querySelector("#key-openrouter"))==null?void 0:M.value.trim(),l=(g=this.container.querySelector("#key-pollinations"))==null?void 0:g.value.trim(),m=(S=this.container.querySelector("#key-custom"))==null?void 0:S.value.trim(),p=(f=this.container.querySelector("#custom-base-url"))==null?void 0:f.value.trim(),w=(P=this.container.querySelector("#systemPrompt"))==null?void 0:P.value,x=(E=this.container.querySelector("#themeSelect"))==null?void 0:E.value,y=parseFloat((s==null?void 0:s.value)||"0.7");o&&v.setApiKey("gemini",o),a&&v.setApiKey("nvidia",a),c&&v.setApiKey("openrouter",c),l&&v.setApiKey("pollinations",l),m&&v.setApiKey("custom",m),v.saveSettings({systemPrompt:w,temperature:y,theme:x,customBaseUrl:p}),document.documentElement.setAttribute("data-theme",x),this.close(),this.onSaved()})}}class de{constructor(e,t){u(this,"container");u(this,"isOpen",!1);u(this,"onClose");u(this,"onLoadSession");this.container=e,this.onClose=t.onClose,this.onLoadSession=t.onLoadSession}open(){this.isOpen=!0,this.render()}close(){this.isOpen=!1,this.render(),this.onClose()}render(){const e=v.getChatSessions();this.container.innerHTML=`
      <div class="modal-overlay ${this.isOpen?"open":""}" id="historyOverlay">
        <div class="modal-drawer">
          <div class="modal-header">
            <span class="modal-title">Conversation History</span>
            <button class="icon-btn" id="closeHistoryBtn" title="Close">✕</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <input type="text" class="form-input" id="searchHistoryInput" placeholder="Search conversations..." />
            </div>

            <div id="historyList" style="display: flex; flex-direction: column; gap: 8px;">
              ${this.renderSessionItems(e)}
            </div>

            ${e.length>0?`
              <div style="margin-top: auto; padding-top: 10px;">
                <button class="btn-secondary" id="clearAllChatsBtn" style="width: 100%; color: var(--error);">
                  Clear All History
                </button>
              </div>
            `:""}
          </div>
        </div>
      </div>
    `,this.attachEventListeners(e)}renderSessionItems(e){return e.length===0?'<div style="color: var(--text-muted); font-size: 12px; text-align: center; padding: 20px;">No saved conversations yet.</div>':e.map(t=>{const n=new Date(t.updatedAt).toLocaleDateString(void 0,{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"});return`
        <div class="history-item" data-id="${t.id}">
          <div class="history-item-header">
            <span class="history-item-title">${t.title||"Conversation"}</span>
            <button class="icon-btn delete-chat-btn" data-id="${t.id}" title="Delete conversation" style="width: 20px; height: 20px;">✕</button>
          </div>
          <div class="history-item-date">${n} • ${t.messages.length} messages</div>
        </div>
      `}).join("")}attachEventListeners(e){const t=this.container.querySelector("#historyOverlay"),n=this.container.querySelector("#closeHistoryBtn"),s=this.container.querySelector("#clearAllChatsBtn"),i=this.container.querySelector("#searchHistoryInput");n==null||n.addEventListener("click",()=>this.close()),t==null||t.addEventListener("click",r=>{r.target===t&&this.close()}),s==null||s.addEventListener("click",()=>{var a,c;const r=this.container.querySelector("#clearAllConfirm");if(r){r.remove();return}const o=document.createElement("div");o.id="clearAllConfirm",o.innerHTML=`
        <div style="background:var(--surface-2,#2a2a3a);border:1px solid var(--danger,#ef4444);border-radius:8px;padding:10px 14px;margin-top:8px;display:flex;gap:10px;align-items:center;font-size:13px;color:var(--text-primary,#fff);">
          <span style="flex:1">Clear all history? This cannot be undone.</span>
          <button id="clearConfirmYes" style="background:#ef4444;color:#fff;border:none;border-radius:6px;padding:4px 12px;cursor:pointer;font-size:12px;">Clear</button>
          <button id="clearConfirmNo" style="background:var(--surface-3,#3a3a4a);color:var(--text-primary,#fff);border:none;border-radius:6px;padding:4px 12px;cursor:pointer;font-size:12px;">Cancel</button>
        </div>`,s.insertAdjacentElement("afterend",o),(a=o.querySelector("#clearConfirmYes"))==null||a.addEventListener("click",()=>{v.clearAllChats(),o.remove(),k.show("All conversation history cleared.","warning"),this.render()}),(c=o.querySelector("#clearConfirmNo"))==null||c.addEventListener("click",()=>o.remove())}),i==null||i.addEventListener("input",()=>{const r=i.value.toLowerCase(),o=e.filter(c=>c.title.toLowerCase().includes(r)||c.messages.some(l=>l.content.toLowerCase().includes(r))),a=this.container.querySelector("#historyList");a&&(a.innerHTML=this.renderSessionItems(o),this.attachItemClicks(o))}),this.attachItemClicks(e)}attachItemClicks(e){this.container.querySelectorAll(".history-item").forEach(t=>{t.addEventListener("click",n=>{if(n.target.classList.contains("delete-chat-btn"))return;const s=t.dataset.id,i=e.find(r=>r.id===s);i&&(this.onLoadSession(i),this.close())})}),this.container.querySelectorAll(".delete-chat-btn").forEach(t=>{t.addEventListener("click",n=>{n.stopPropagation();const s=t.dataset.id;s&&(v.deleteChatSession(s),this.render())})})}}class ue{constructor(e){u(this,"currentSession");u(this,"abortController",null);u(this,"onStateChange");this.onStateChange=e,this.currentSession=this.createNewSession()}getCurrentSession(){return this.currentSession}loadSession(e){this.currentSession=e,this.onStateChange(this.currentSession,!1)}createNewSession(){const e={id:"chat_"+Date.now()+"_"+Math.random().toString(36).substring(2,7),title:"New Conversation",createdAt:Date.now(),updatedAt:Date.now(),messages:[]};return this.currentSession=e,this.onStateChange(this.currentSession,!1),e}stopGeneration(){this.abortController&&(this.abortController.abort(),this.abortController=null)}async sendMessage(e,t=[],n=null,s,i){const r=I.getProvider(s);if(!r){k.show(`Provider "${s}" not found`,"error");return}const a=v.getApiKeys()[s]||"",c=v.getSettings();if(!a&&s!=="custom"&&s!=="nvidia"&&s!=="pollinations"){k.show(`Please set an API key for ${r.name} in Settings (⚙️ icon) before sending messages.`,"warning",4500);return}const l={id:"msg_"+Date.now(),role:"user",content:e,timestamp:Date.now(),images:t.length>0?t:void 0,officeContext:n||void 0};this.currentSession.messages.length===0&&(this.currentSession.title=e.slice(0,35)+(e.length>35?"...":"")),this.currentSession.messages.push(l);const p={id:"msg_ai_"+Date.now(),role:"assistant",content:"",timestamp:Date.now(),provider:s,model:i,isStreaming:!0};this.currentSession.messages.push(p),this.onStateChange(this.currentSession,!0);const w=I.getModelInfo(s,i);if(w!=null&&w.capabilities.imageGeneration&&r.generateImage){try{p.content=`🎨 Generating image with ${w.name}...

*"${e}"*`,p.isStreaming=!0,this.onStateChange(this.currentSession,!0);const h=await r.generateImage({prompt:e,provider:s,model:i,apiKey:a});p.content=`Here is your generated image:

![${h.revisedPrompt||e}](${h.imageUrl})`,p.isStreaming=!1,this.currentSession.updatedAt=Date.now(),v.saveChatSession(this.currentSession),this.onStateChange(this.currentSession,!1)}catch(h){p.content=`❌ **Image generation error:** ${h.message}`,p.isError=!0,p.isStreaming=!1,this.onStateChange(this.currentSession,!1)}return}const x=[];c.systemPrompt&&x.push({role:"system",content:c.systemPrompt});const y=this.currentSession.messages.slice(0,-2).slice(-10);for(const h of y)x.push({role:h.role,content:h.content});let b=e;n&&n.data&&(b=`[Active Context from Microsoft ${n.host} (${n.label})]:
${n.data}

[User Request]:
${e}`),x.push({role:"user",content:b}),this.abortController=new AbortController;try{await r.streamChat({messages:x,model:i,provider:s,apiKey:a,baseUrl:c.customBaseUrl,images:t,temperature:c.temperature,maxTokens:c.maxTokens,signal:this.abortController.signal,onChunk:h=>{p.content+=h,this.onStateChange(this.currentSession,!0)},onDone:()=>{p.isStreaming=!1,this.currentSession.updatedAt=Date.now();const h=Math.round(b.split(/\s+/).length*1.3),M=Math.round(p.content.split(/\s+/).length*1.3);p.tokens={prompt:h,completion:M,total:h+M};const g=I.calculateCost(s,i,h,M);g!==null&&(p.cost=g),v.saveChatSession(this.currentSession),this.onStateChange(this.currentSession,!1),this.abortController=null},onError:h=>{p.content+=`

**Error:** ${h}`,p.isError=!0,p.isStreaming=!1,this.currentSession.updatedAt=Date.now(),v.saveChatSession(this.currentSession),this.onStateChange(this.currentSession,!1),this.abortController=null}})}catch(h){p.content+=`

**Request Error:** ${h.message}`,p.isError=!0,p.isStreaming=!1,this.onStateChange(this.currentSession,!1),this.abortController=null}}async regenerate(e,t,n){const s=this.currentSession.messages.findIndex(r=>r.id===e);if(s===-1)return;const i=this.currentSession.messages.slice(0,s).reverse().find(r=>r.role==="user");this.currentSession.messages=this.currentSession.messages.slice(0,s),i&&await this.sendMessage(i.content,i.images||[],i.officeContext||null,t,n)}}async function z(){console.log("[Office AI] Bootstrapping Add-in...");const d=v.getSettings();document.documentElement.setAttribute("data-theme",d.theme||"dark"),I.initialize();const e=document.getElementById("headerMount"),t=document.getElementById("modelSelectorMount"),n=document.getElementById("contextBarMount"),s=document.getElementById("quickActionsMount"),i=document.getElementById("chatViewMount"),r=document.getElementById("promptBoxMount"),o=document.getElementById("settingsMount"),a=document.getElementById("historyMount");let c,l,m,p,w,x,y,b=null;y=new ue((g,S)=>{var P;const f=g.messages[g.messages.length-1];S&&(f!=null&&f.isStreaming)?b!==f.id?(b=f.id,p==null||p.render(g.messages,!0)):p==null||p.updateStreamingBubble(f.id,f.content):(b=null,p==null||p.render(g.messages,S)),c==null||c.setGenerating(S),f&&f.cost!==void 0&&(l==null||l.updateCostDisplay(f.cost,(P=f.tokens)==null?void 0:P.total))}),w=new le(o,{onClose:()=>{},onSaved:()=>{l.render(),k.show("Settings saved")}}),x=new de(a,{onClose:()=>{},onLoadSession:g=>{y.loadSession(g),k.show(`Loaded: ${g.title}`)}}),new Q(e,{onNewChat:()=>{y.createNewSession(),k.show("New conversation started")},onOpenHistory:()=>x.open(),onOpenSettings:()=>w.open()}),l=new ee(t,(g,S)=>{const f=I.getModelInfo(g,S);c==null||c.setVisionSupported((f==null?void 0:f.capabilities.imageInput)??!0)}),m=new ne(n),new se(s,(g,S)=>{if(S){const{providerId:f,modelId:P}=l.getCurrent(),E=m.getAttachedContext();y.sendMessage(g,[],E,f,P)}else c.setInput(g)}),p=new ae(i,{onRegenerate:g=>{const{providerId:S,modelId:f}=l.getCurrent();y.regenerate(g,S,f)},onShowToast:g=>k.show(g)}),c=new ce(r,{onSend:(g,S)=>{const{providerId:f,modelId:P}=l.getCurrent(),E=m.getAttachedContext();y.sendMessage(g,S,E,f,P)},onStop:()=>{y.stopGeneration()}});const h=l.getCurrent(),M=I.getModelInfo(h.providerId,h.modelId);c.setVisionSupported((M==null?void 0:M.capabilities.imageInput)??!0),p.render(y.getCurrentSession().messages),window.addEventListener("focus",()=>{m.refresh()})}typeof Office<"u"?Office.onReady(()=>{z()}):document.addEventListener("DOMContentLoaded",()=>{z()});
