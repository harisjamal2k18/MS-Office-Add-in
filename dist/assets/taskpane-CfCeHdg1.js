(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))n(i);new MutationObserver(i=>{for(const r of i)if(r.type==="childList")for(const s of r.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&n(s)}).observe(document,{childList:!0,subtree:!0});function t(i){const r={};return i.integrity&&(r.integrity=i.integrity),i.referrerPolicy&&(r.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?r.credentials="include":i.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function n(i){if(i.ep)return;i.ep=!0;const r=t(i);fetch(i.href,r)}})();var U=Object.defineProperty,K=(c,e,t)=>e in c?U(c,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):c[e]=t,u=(c,e,t)=>K(c,typeof e!="symbol"?e+"":e,t);(function(){const c=document.createElement("link").relList;if(c&&c.supports&&c.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))t(n);new MutationObserver(n=>{for(const i of n)if(i.type==="childList")for(const r of i.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&t(r)}).observe(document,{childList:!0,subtree:!0});function e(n){const i={};return n.integrity&&(i.integrity=n.integrity),n.referrerPolicy&&(i.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?i.credentials="include":n.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function t(n){if(n.ep)return;n.ep=!0;const i=e(n);fetch(n.href,i)}})();class B{async validateApiKey(e,t){try{return await(await fetch("/api/validate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({provider:this.id,apiKey:e,baseUrl:t})})).json()}catch(n){return{valid:!1,message:n.message||"Connection test failed"}}}async streamChat(e){var t;const{messages:n,model:i,apiKey:r,baseUrl:s,images:a,temperature:l,maxTokens:d,systemPrompt:o,onChunk:p,onDone:h,onError:S,signal:C}=e;try{const m=[...n];o&&!m.some(y=>y.role==="system")&&m.unshift({role:"system",content:o});const b=await fetch("/api/chat/stream",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({provider:this.id,apiKey:r,baseUrl:s,model:i,messages:m,images:a,temperature:l,maxTokens:d}),signal:C});if(!b.ok){const y=await b.text();S(`Server returned ${b.status}: ${y}`);return}const P=(t=b.body)==null?void 0:t.getReader();if(!P){S("Response body is not readable stream");return}const $=new TextDecoder;let v="";for(;;){const{done:y,value:x}=await P.read();if(y)break;v+=$.decode(x,{stream:!0});const f=v.split(`
`);v=f.pop()||"";for(const E of f){const G=E.trim();if(!G||!G.startsWith("data: "))continue;const W=G.slice(6);if(W==="[DONE]"){h();return}try{const L=JSON.parse(W);if(L.error){S(L.error);return}if(L.delta&&p(L.delta),L.done){h();return}}catch{}}}h()}catch(m){if(m.name==="AbortError"){h();return}S(m.message||"Stream connection error")}}async generateImage(e){const t=await fetch("/api/image/generate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({provider:this.id,apiKey:e.apiKey,prompt:e.prompt,model:e.model,size:e.size||"1024x1024"})});if(!t.ok){const n=await t.json().catch(()=>({error:`HTTP ${t.status}`}));throw new Error(n.error||"Failed to generate image")}return await t.json()}}class V extends B{constructor(){super(...arguments),u(this,"id","gemini"),u(this,"name","Google Gemini")}getModels(){return[{id:"gemini-3.6-flash",name:"Gemini 3.6 Flash",description:"Google's newest ultra-fast multimodal model with blazing throughput and exceptional reasoning.",contextWindow:1e6,capabilities:{textGeneration:!0,imageInput:!0,imageGeneration:!1,streaming:!0,functionCalling:!0,structuredOutput:!0},pricing:{promptPer1M:.075,completionPer1M:.3}},{id:"gemini-3.5-flash",name:"Gemini 3.5 Flash",description:"High-speed, reliable multimodal workhorse for high-volume document workflows.",contextWindow:1e6,capabilities:{textGeneration:!0,imageInput:!0,imageGeneration:!1,streaming:!0,functionCalling:!0,structuredOutput:!0},pricing:{promptPer1M:.075,completionPer1M:.3}},{id:"gemini-3.1-pro-preview",name:"Gemini 3.1 Pro (Preview)",description:"Google's advanced deep-reasoning model for complex analytical tasks.",contextWindow:1e6,capabilities:{textGeneration:!0,imageInput:!0,imageGeneration:!1,streaming:!0,functionCalling:!0,structuredOutput:!0},pricing:{promptPer1M:1.25,completionPer1M:5}},{id:"gemini-flash-latest",name:"Gemini Flash (Latest)",description:"Always routes to the latest stable Gemini Flash version.",contextWindow:1e6,capabilities:{textGeneration:!0,imageInput:!0,imageGeneration:!1,streaming:!0,functionCalling:!0,structuredOutput:!0},pricing:{promptPer1M:.075,completionPer1M:.3}}]}}const j="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";class Z extends B{constructor(){super(...arguments),u(this,"id","nvidia"),u(this,"name","NVIDIA NIM")}getModels(){return[{id:"nvidia/nemotron-3.5-lightning-30b-a3b",name:"Nemotron 3.5 Lightning 30B",description:"NVIDIA's ultra-fast 30B MoE model (3.5B active params) — blazing throughput for document drafting, summarization, and coding.",contextWindow:128e3,capabilities:{textGeneration:!0,imageInput:!1,imageGeneration:!1,streaming:!0,functionCalling:!1,structuredOutput:!0},pricing:{promptPer1M:.2,completionPer1M:.6}}]}async streamChat(e){return super.streamChat({...e,provider:"nvidia",apiKey:e.apiKey||j})}}class J extends B{constructor(){super(...arguments),u(this,"id","openrouter"),u(this,"name","OpenRouter")}getModels(){return[{id:"deepseek/deepseek-r1",name:"DeepSeek R1",description:"Open-weights reasoning model with exceptional performance in logic, math, and code.",contextWindow:128e3,capabilities:{textGeneration:!0,imageInput:!1,imageGeneration:!1,streaming:!0,functionCalling:!1,structuredOutput:!0},pricing:{promptPer1M:.55,completionPer1M:2.19}},{id:"meta-llama/llama-3.3-70b-instruct",name:"Llama 3.3 70B Instruct",description:"Meta’s open-weights high performance workhorse for drafting, outlining, and analysis.",contextWindow:128e3,capabilities:{textGeneration:!0,imageInput:!1,imageGeneration:!1,streaming:!0,functionCalling:!0,structuredOutput:!0},pricing:{promptPer1M:.4,completionPer1M:.4}},{id:"nvidia/nemotron-3-ultra-550b-a55b",name:"Nemotron 3 Ultra 550B",description:"NVIDIA’s massive 550B flagship model for sophisticated enterprise drafting and reasoning.",contextWindow:128e3,capabilities:{textGeneration:!0,imageInput:!1,imageGeneration:!1,streaming:!0,functionCalling:!0,structuredOutput:!0},pricing:{promptPer1M:.8,completionPer1M:2.4}},{id:"google/gemini-2.5-flash",name:"Gemini 2.5 Flash",description:"Google’s ultra-fast 1M context model via OpenRouter.",contextWindow:1e6,capabilities:{textGeneration:!0,imageInput:!0,imageGeneration:!1,streaming:!0,functionCalling:!0,structuredOutput:!0},pricing:{promptPer1M:.1,completionPer1M:.4}}]}}class Y extends B{constructor(){super(...arguments),u(this,"id","custom"),u(this,"name","Custom / Local (Ollama, vLLM)")}getModels(){return[{id:"llama3:latest",name:"Ollama Llama 3",description:"Local private Llama 3 model running on localhost (zero external data sharing).",capabilities:{textGeneration:!0,imageInput:!1,imageGeneration:!1,streaming:!0,functionCalling:!1,structuredOutput:!0}},{id:"deepseek-r1:latest",name:"Ollama DeepSeek R1",description:"Local reasoning model running on localhost:11434.",capabilities:{textGeneration:!0,imageInput:!1,imageGeneration:!1,streaming:!0,functionCalling:!1,structuredOutput:!0}},{id:"qwen2.5:latest",name:"Ollama Qwen 2.5",description:"Local high performance multilingual model.",capabilities:{textGeneration:!0,imageInput:!1,imageGeneration:!1,streaming:!0,functionCalling:!1,structuredOutput:!0}}]}}class X extends B{constructor(){super(...arguments),u(this,"id","pollinations"),u(this,"name","Pollinations.ai (Images)")}getModels(){return[{id:"tongyi-mai/z-image-turbo",name:"Z-Image Turbo",description:"Ultra-fast, high-fidelity diffusion model by Tongyi MAI on Pollinations.ai.",capabilities:{textGeneration:!1,imageInput:!1,imageGeneration:!0,streaming:!1,functionCalling:!1,structuredOutput:!1}},{id:"microsoft/mai-image-2.5-flash",name:"MAI Image 2.5 Flash",description:"High-speed, photorealistic visual synthesis model by Microsoft MAI on Pollinations.ai.",capabilities:{textGeneration:!1,imageInput:!1,imageGeneration:!0,streaming:!1,functionCalling:!1,structuredOutput:!1}}]}async validateApiKey(e){try{return await(await fetch("/api/validate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({provider:this.id,apiKey:e})})).json()}catch(t){return{valid:!1,message:t.message||"Pollinations.ai validation failed"}}}async generateImage(e){const t=await fetch("/api/image/generate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({provider:"pollinations",model:e.model||"tongyi-mai/z-image-turbo",prompt:e.prompt,size:e.size||"1024x1024",apiKey:e.apiKey})});if(!t.ok){const n=await t.json().catch(()=>({error:`HTTP ${t.status}`}));throw new Error(n.error||"Failed to generate image via Pollinations.ai")}return await t.json()}async streamChat(e){var t,n;const i=((t=e.messages.filter(s=>s.role==="user").pop())==null?void 0:t.content)||"",r=(n=e.model)!=null&&n.includes("flash")?"MAI Image 2.5 Flash":"Z-Image Turbo";try{e.onChunk(`🎨 *Generating image with ${r}...*

`);const s=await this.generateImage({prompt:i,provider:this.id,model:e.model});e.onChunk(`![${i}](${s.imageUrl})`),e.onDone()}catch(s){e.onError(s.message||"Image generation failed")}}}const w={API_KEYS:"office_ai_api_keys",ACTIVE_PROVIDER:"office_ai_active_provider",ACTIVE_MODEL:"office_ai_active_model",CUSTOM_MODELS:"office_ai_custom_models",CHATS:"office_ai_chat_sessions",ACTIVE_CHAT_ID:"office_ai_active_chat_id",SETTINGS:"office_ai_settings"},N={temperature:.7,maxTokens:4096,systemPrompt:"You are an expert AI assistant integrated into Microsoft Office (Word, Excel, PowerPoint). Provide clean, accurate, and structured answers. When generating Excel formulas, start with = and explain parameters. When drafting documents, format neatly with clear headings and tables. Tailor your responses to the current Office application context.",theme:"dark",directBrowserMode:!1,contextInclusionMode:"selection",customBaseUrl:"http://localhost:11434/v1"};class g{static getApiKeys(){try{const e=localStorage.getItem(w.API_KEYS);return e?JSON.parse(e):{}}catch{return{}}}static setApiKey(e,t){const n=this.getApiKeys();n[e]=t,localStorage.setItem(w.API_KEYS,JSON.stringify(n))}static removeApiKey(e){const t=this.getApiKeys();delete t[e],localStorage.setItem(w.API_KEYS,JSON.stringify(t))}static getActiveProvider(e="openai"){return localStorage.getItem(w.ACTIVE_PROVIDER)||e}static setActiveProvider(e){localStorage.setItem(w.ACTIVE_PROVIDER,e)}static getActiveModel(e="gpt-4o"){return localStorage.getItem(w.ACTIVE_MODEL)||e}static setActiveModel(e){localStorage.setItem(w.ACTIVE_MODEL,e)}static getCustomModels(){try{const e=localStorage.getItem(w.CUSTOM_MODELS);return e?JSON.parse(e):[]}catch{return[]}}static saveCustomModel(e){const t=this.getCustomModels().filter(n=>n.id!==e.id);t.push({...e,isCustom:!0}),localStorage.setItem(w.CUSTOM_MODELS,JSON.stringify(t))}static removeCustomModel(e){const t=this.getCustomModels().filter(n=>n.id!==e);localStorage.setItem(w.CUSTOM_MODELS,JSON.stringify(t))}static getSettings(){try{const e=localStorage.getItem(w.SETTINGS);return e?{...N,...JSON.parse(e)}:N}catch{return N}}static saveSettings(e){const t={...this.getSettings(),...e};return localStorage.setItem(w.SETTINGS,JSON.stringify(t)),t}static getChatSessions(){try{const e=localStorage.getItem(w.CHATS);return e?JSON.parse(e):[]}catch{return[]}}static saveChatSession(e){const t=this.getChatSessions().filter(i=>i.id!==e.id);t.unshift(e);const n=t.slice(0,50);localStorage.setItem(w.CHATS,JSON.stringify(n))}static deleteChatSession(e){const t=this.getChatSessions().filter(n=>n.id!==e);localStorage.setItem(w.CHATS,JSON.stringify(t))}static clearAllChats(){localStorage.removeItem(w.CHATS),localStorage.removeItem(w.ACTIVE_CHAT_ID)}}class I{static initialize(){this.providers.size>0||(this.register(new V),this.register(new Z),this.register(new J),this.register(new X),this.register(new Y))}static register(e){this.providers.set(e.id,e)}static getProvider(e){return this.initialize(),this.providers.get(e)}static getAllProviders(){return this.initialize(),Array.from(this.providers.values())}static getModelsForProvider(e){const t=this.getProvider(e);if(!t)return[];const n=t.getModels(),i=g.getCustomModels().filter(r=>r.providerId===e);return[...n,...i]}static getModelInfo(e,t){return this.getModelsForProvider(e).find(n=>n.id===t)||{id:t,name:t,capabilities:{textGeneration:!0,imageInput:!0,imageGeneration:!1,streaming:!0,functionCalling:!0,structuredOutput:!0}}}static calculateCost(e,t,n,i){const r=this.getModelInfo(e,t);if(!(r!=null&&r.pricing))return null;const s=n/1e6*r.pricing.promptPer1M,a=i/1e6*r.pricing.completionPer1M;return Number((s+a).toFixed(5))}}u(I,"providers",new Map);class k{static getHost(){if(this.detectedHost)return this.detectedHost;if(typeof Office<"u"&&Office.context&&Office.context.host)switch(Office.context.host){case Office.HostType.Word:this.detectedHost="Word";break;case Office.HostType.Excel:this.detectedHost="Excel";break;case Office.HostType.PowerPoint:this.detectedHost="PowerPoint";break;default:this.detectedHost="Unknown"}else this.detectedHost="Word";return this.detectedHost}static isOfficeReady(){return typeof Office<"u"&&typeof Office.context<"u"}}u(k,"detectedHost",null);class Q{constructor(e,t){u(this,"container"),u(this,"onNewChat"),u(this,"onOpenHistory"),u(this,"onOpenSettings"),this.container=e,this.onNewChat=t.onNewChat,this.onOpenHistory=t.onOpenHistory,this.onOpenSettings=t.onOpenSettings,this.render()}render(){var e,t,n;const i=k.getHost(),r=i.toLowerCase();this.container.innerHTML=`
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
          <span class="host-badge ${r}">${i}</span>
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
    `,(e=this.container.querySelector("#headerNewChatBtn"))==null||e.addEventListener("click",this.onNewChat),(t=this.container.querySelector("#headerHistoryBtn"))==null||t.addEventListener("click",this.onOpenHistory),(n=this.container.querySelector("#headerSettingsBtn"))==null||n.addEventListener("click",this.onOpenSettings)}}class ee{constructor(e,t){u(this,"container"),u(this,"onChange"),u(this,"currentProvider"),u(this,"currentModel"),this.container=e,this.onChange=t,this.currentProvider=g.getActiveProvider("gemini"),this.currentModel=g.getActiveModel("gemini-3.6-flash"),this.render()}getCurrent(){return{providerId:this.currentProvider,modelId:this.currentModel}}updateCostDisplay(e,t){const n=this.container.querySelector("#costDisplay");if(n)if(e!==null&&e>0)n.textContent=`$${e.toFixed(4)}`,n.setAttribute("title",`${t||0} tokens estimated`);else{const i=I.getModelInfo(this.currentProvider,this.currentModel);n.textContent=i!=null&&i.contextWindow?`${Math.round(i.contextWindow/1e3)}k ctx`:"Ready"}}render(){var e;const t=I.getAllProviders();!t.some(o=>o.id===this.currentProvider)&&t.length>0&&(this.currentProvider=t[0].id,g.setActiveProvider(this.currentProvider));const n=I.getModelsForProvider(this.currentProvider);!n.some(o=>o.id===this.currentModel)&&n.length>0&&(this.currentModel=n[0].id,g.setActiveModel(this.currentModel));const i=t.map(o=>`<option value="${o.id}" ${o.id===this.currentProvider?"selected":""}>${o.name}</option>`).join(""),r=n.map(o=>`<option value="${o.id}" ${o.id===this.currentModel?"selected":""}>${o.name}</option>`).join(""),s=I.getModelInfo(this.currentProvider,this.currentModel),a=(e=s==null?void 0:s.capabilities)!=null&&e.imageGeneration?"🎨 Image Gen":s!=null&&s.contextWindow?`${Math.round(s.contextWindow/1e3)}k ctx`:"Ready";this.container.innerHTML=`
      <div class="model-toolbar">
        <div class="model-pickers">
          <select class="picker-select" id="providerSelect" title="Select AI Provider">
            ${i}
          </select>
          <select class="picker-select" id="modelSelect" title="Select Model">
            ${r}
          </select>
        </div>
        <div class="cost-pill" id="costDisplay" title="Model context window and session cost">${a}</div>
      </div>
    `;const l=this.container.querySelector("#providerSelect"),d=this.container.querySelector("#modelSelect");l.addEventListener("change",()=>{this.currentProvider=l.value,g.setActiveProvider(this.currentProvider);const o=I.getModelsForProvider(this.currentProvider);o.length>0&&(this.currentModel=o[0].id,g.setActiveModel(this.currentModel)),this.render(),this.onChange(this.currentProvider,this.currentModel)}),d.addEventListener("change",()=>{this.currentModel=d.value,g.setActiveModel(this.currentModel),this.updateCostDisplay(null),this.onChange(this.currentProvider,this.currentModel)})}}class O{static async getSelectedText(){if(typeof Word>"u"||!Office.context)return"";try{return await Word.run(async e=>{const t=e.document.getSelection();return t.load("text"),await e.sync(),t.text?t.text.trim():""})}catch(e){return console.warn("[WordService] getSelectedText error:",e),""}}static async getDocumentContext(){if(typeof Word>"u"||!Office.context)return{bodySnippet:"Sample Word document preview context."};try{return await Word.run(async e=>{const t=e.document.body;t.load("text"),await e.sync();const n=t.text||"",i=n.split(`
`).filter(l=>l.trim().length>0),r=i[0]?i[0].slice(0,100):"Untitled Document",s=n.slice(0,3e3),a=n.trim()?n.trim().split(/\s+/).length:0;return{title:r,bodySnippet:s,wordCount:a}})}catch(e){return console.warn("[WordService] getDocumentContext error:",e),{}}}static async insertText(e,t=!1){if(typeof Word>"u"||!Office.context)return console.log(`[WordService Mock] Insert text (replace=${t}):`,e),!0;try{return await Word.run(async n=>{const i=n.document.getSelection(),r=t?Word.InsertLocation.replace:Word.InsertLocation.after;i.insertText(e,r),await n.sync()}),!0}catch(n){return console.error("[WordService] insertText failed:",n),!1}}static async replaceSelection(e){return this.insertText(e,!0)}static async insertTable(e){if(e.length===0||e[0].length===0)return!1;if(typeof Word>"u"||!Office.context)return console.log("[WordService Mock] Insert native table:",e),!0;try{return await Word.run(async t=>{const n=t.document.getSelection(),i=e.length,r=e[0].length,s=n.insertTable(i,r,Word.InsertLocation.after,e);s.styleBuiltIn=Word.Style.gridTable4_Accent1,s.headerRowCount=1,await t.sync()}),!0}catch(t){return console.error("[WordService] insertTable failed:",t),this.insertText(e.map(n=>n.join("	")).join(`
`))}}static async insertImage(e){const t=e.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/,"");if(typeof Word>"u"||!Office.context)return console.log("[WordService Mock] Insert image"),!0;try{return await Word.run(async n=>{n.document.getSelection().insertInlinePictureFromBase64(t,Word.InsertLocation.after),await n.sync()}),!0}catch(n){return console.error("[WordService] insertImage failed:",n),!1}}}class T{static async getSelectedRangeData(){if(typeof Excel>"u"||!Office.context)return null;try{return await Excel.run(async e=>{const t=e.workbook.getSelectedRange();t.load(["address","values","formulas","rowCount","columnCount","worksheet"]),await e.sync();const n=t.worksheet;n.load("name"),await e.sync();const i=Math.min(t.rowCount,50),r=Math.min(t.columnCount,20),s=t.values.slice(0,i).map(l=>l.slice(0,r)),a=t.formulas.slice(0,i).map(l=>l.slice(0,r));return{address:t.address,sheetName:n.name,rowCount:t.rowCount,colCount:t.columnCount,values:s,formulas:a}})}catch(e){return console.warn("[ExcelService] getSelectedRangeData error:",e),null}}static formatRangeForPrompt(e){const t=[];t.push(`Worksheet: "${e.sheetName}", Range: ${e.address} (${e.rowCount} rows × ${e.colCount} columns)`),t.push("Data Table:");for(let n=0;n<e.values.length;n++){const i=e.values[n].map((r,s)=>{var a;const l=(a=e.formulas[n])==null?void 0:a[s];return typeof l=="string"&&l.startsWith("=")?`${r} [Formula: ${l}]`:r==null?"":String(r)});t.push(`| ${i.join(" | ")} |`)}return e.rowCount>50&&t.push(`(...and ${e.rowCount-50} more rows truncated for context)`),t.join(`
`)}static async insertFormula(e){const t=e.trim().startsWith("=")?e.trim():`=${e.trim()}`;if(typeof Excel>"u"||!Office.context)return console.log("[ExcelService Mock] Insert formula:",t),!0;try{return await Excel.run(async n=>{const i=n.workbook.getSelectedRange();i.formulas=[[t]],await n.sync()}),!0}catch(n){return console.error("[ExcelService] insertFormula failed:",n),!1}}static async insertData(e){if(!e||e.length===0)return!1;if(typeof Excel>"u"||!Office.context)return console.log("[ExcelService Mock] Insert data matrix:",e),!0;try{return await Excel.run(async t=>{const n=t.workbook.getSelectedRange();n.load(["rowIndex","columnIndex","worksheet"]),await t.sync();const i=n.worksheet.getRangeByIndexes(n.rowIndex,n.columnIndex,e.length,e[0].length);i.values=e,i.format.autofitColumns(),await t.sync()}),!0}catch(t){return console.error("[ExcelService] insertData failed:",t),!1}}static async insertImage(e){const t=e.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/,"");if(typeof Excel>"u"||!Office.context)return console.log("[ExcelService Mock] Insert image into Excel"),!0;try{return await Excel.run(async n=>{n.workbook.worksheets.getActiveWorksheet().shapes.addImage(t),await n.sync()}),!0}catch(n){return console.error("[ExcelService] insertImage failed:",n),!1}}}class D{static async getSelectedText(){return typeof Office>"u"||!Office.context||!Office.context.document?"":new Promise(e=>{Office.context.document.getSelectedDataAsync(Office.CoercionType.Text,t=>{t.status===Office.AsyncResultStatus.Succeeded&&t.value?e(String(t.value).trim()):e("")})})}static async insertText(e){return typeof Office>"u"||!Office.context||!Office.context.document?(console.log("[PowerPointService Mock] Insert text:",e),!0):new Promise(t=>{Office.context.document.setSelectedDataAsync(e,{coercionType:Office.CoercionType.Text},n=>{n.status===Office.AsyncResultStatus.Succeeded?t(!0):(console.error("[PowerPointService] insertText error:",n.error),t(!1))})})}static async createSlide(e,t){if(typeof PowerPoint<"u"&&PowerPoint.run)try{return await PowerPoint.run(async i=>{const r=i.presentation.slides.add(),s=r.shapes.addTextBox(e,{left:50,top:50,width:600,height:80});s.textFrame.textRange.font.size=28,s.textFrame.textRange.font.bold=!0;const a=t.map(d=>`• ${d}`).join(`
`),l=r.shapes.addTextBox(a,{left:50,top:150,width:620,height:350});return l.textFrame.textRange.font.size=18,await i.sync(),!0})}catch(i){console.warn("[PowerPointService] PowerPoint.run createSlide fallback:",i)}const n=`${e}

`+t.map(i=>`• ${i}`).join(`
`);return this.insertText(n)}static async insertImage(e){const t=e.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/,"");return typeof Office>"u"||!Office.context||!Office.context.document?(console.log("[PowerPointService Mock] Insert image"),!0):new Promise(n=>{Office.context.document.setSelectedDataAsync(t,{coercionType:Office.CoercionType.Image},i=>{i.status===Office.AsyncResultStatus.Succeeded?n(!0):(console.error("[PowerPointService] insertImage error:",i.error),n(!1))})})}}class te{static async getCurrentContext(e="selection"){const t=k.getHost();if(e==="none")return{host:t,type:"none",label:"No doc context"};try{if(t==="Word"){if(e==="selection"){const i=await O.getSelectedText();if(i){const r=i.split(/\s+/).length;return{host:t,type:"selection",label:`${r} words selected`,snippet:i.slice(0,150)+(i.length>150?"...":""),data:i}}}const n=await O.getDocumentContext();if(n.bodySnippet)return{host:t,type:"document",label:`${n.wordCount||0} words in document`,snippet:n.bodySnippet.slice(0,150)+"...",data:n.bodySnippet}}if(t==="Excel"){const n=await T.getSelectedRangeData();if(n)return{host:t,type:"selection",label:`${n.sheetName}!${n.address} (${n.rowCount}×${n.colCount})`,snippet:`Range ${n.address} (${n.rowCount} rows, ${n.colCount} cols)`,data:T.formatRangeForPrompt(n)}}if(t==="PowerPoint"){const n=await D.getSelectedText();if(n)return{host:t,type:"selection",label:`Selected slide text (${n.length} chars)`,snippet:n.slice(0,150)+"...",data:n}}}catch(n){console.warn("[ContextManager] Error retrieving context:",n)}return{host:t,type:"none",label:`Ready (${t})`}}}class ne{constructor(e){u(this,"container"),u(this,"currentContext",null),u(this,"mode","selection"),this.container=e,this.refresh()}getAttachedContext(){return this.mode==="none"?null:this.currentContext}async refresh(){this.currentContext=await te.getCurrentContext(this.mode),this.render()}setMode(e){this.mode=e,this.refresh()}render(){var e,t,n,i;const r=this.currentContext&&this.currentContext.type!=="none"&&this.mode!=="none",s=this.mode==="none"?"Context: Off":((e=this.currentContext)==null?void 0:e.label)||"Ready";this.container.innerHTML=`
      <div class="context-bar">
        <div class="context-info" title="${((t=this.currentContext)==null?void 0:t.snippet)||"Office document context status"}">
          <span class="context-dot ${r?"":"none"}"></span>
          <span>${s}</span>
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
    `,(n=this.container.querySelector("#refreshContextBtn"))==null||n.addEventListener("click",()=>this.refresh()),(i=this.container.querySelector("#toggleContextModeBtn"))==null||i.addEventListener("click",()=>{this.mode=this.mode==="none"?"selection":"none",this.refresh()})}}class ie{constructor(e,t){u(this,"container"),u(this,"onSelectAction"),this.container=e,this.onSelectAction=t,this.render()}render(){const e=k.getHost();let t=[];e==="Word"?t=[{label:"✨ Rewrite Professionally",prompt:"Rewrite the selected text to sound polished, authoritative, and professional while preserving all key facts.",autoSend:!0},{label:"📝 Fix Grammar",prompt:"Correct any grammatical, spelling, and punctuation errors in the selected text without altering the core tone.",autoSend:!0},{label:"🔍 Summarize",prompt:"Provide a concise, bulleted executive summary of the selected text.",autoSend:!0},{label:"📊 Generate Table",prompt:"Create a clean, well-formatted comparison table from this information.",autoSend:!0},{label:"✉️ Draft Email",prompt:"Draft a clear, professional email regarding this subject."},{label:"🌐 Translate to Urdu",prompt:"Translate the selected text into natural, professional Urdu.",autoSend:!0}]:e==="Excel"?t=[{label:"📈 Explain Data",prompt:"Explain the selected worksheet data, highlight key trends, and provide 3 actionable insights.",autoSend:!0},{label:"🧮 Generate Formula",prompt:"Write an Excel formula to solve this problem: "},{label:"🔍 Find Outliers",prompt:"Analyze this range and identify any data anomalies, duplicates, or unusual outliers.",autoSend:!0},{label:"🏆 Top 5 Breakdown",prompt:"Identify the top 5 records by value and summarize their contribution to the total.",autoSend:!0},{label:"📊 Analyze Sales",prompt:"Perform a comprehensive sales variance and trend analysis on these numbers.",autoSend:!0}]:e==="PowerPoint"?t=[{label:"🎯 5-Slide Outline",prompt:"Create a structured 5-slide presentation outline on: "},{label:"🎤 Speaker Notes",prompt:"Generate professional presenter speaker notes for this slide.",autoSend:!0},{label:"✨ Improve Slide Content",prompt:"Rewrite the slide text to be punchy, high-impact, and easy to read for an audience.",autoSend:!0},{label:"💡 Generate Bullet Points",prompt:"Convert this concept into 3 to 4 impactful presentation bullet points.",autoSend:!0}]:t=[{label:"✨ Professional Rewrite",prompt:"Rewrite this text professionally: "},{label:"🔍 Summarize",prompt:"Summarize the following: "}],this.container.innerHTML=`
      <div class="quick-actions-bar">
        ${t.map((n,i)=>`<button class="chip-btn" data-index="${i}">${n.label}</button>`).join("")}
      </div>
    `,this.container.querySelectorAll(".chip-btn").forEach(n=>{n.addEventListener("click",i=>{const r=parseInt(i.currentTarget.dataset.index||"0"),s=t[r];this.onSelectAction(s.prompt,s.autoSend)})})}}function H(c){return c.replace(/&nbsp;/gi," ").replace(/&amp;/gi,"&").replace(/&lt;/gi,"<").replace(/&gt;/gi,">").replace(/&quot;/gi,'"').replace(/&#039;/gi,"'").replace(/&#(\d+);/g,(e,t)=>String.fromCharCode(Number(t)))}function A(c){return c.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}function F(c){if(!c)return"";let e=H(c);e=e.replace(/```([a-zA-Z0-9_\-]*)\n([\s\S]*?)```/g,(n,i,r)=>{const s=A(r.trim());return`<div class="code-block-wrapper">
      <div class="code-block-header">
        ${i?`<span class="code-lang">${i}</span>`:""}
        <button class="copy-code-btn" data-code="${encodeURIComponent(r.trim())}">Copy</button>
      </div>
      <pre><code class="language-${i||"plaintext"}">${s}</code></pre>
    </div>`}),e=e.replace(/`([^`\n]+)`/g,(n,i)=>`<code class="inline-code">${A(i)}</code>`);const t=/((?:\|[^\n]+\|\r?\n)+)/g;return e=e.replace(t,n=>{const i=n.trim().split(`
`);if(i.length<2)return n;let r='<div class="table-responsive"><table class="markdown-table">',s=!0;for(const a of i){if(/^\|[\s\-:|]+\|$/.test(a.trim())){s=!1;continue}const l=a.trim().slice(1,-1).split("|").map(o=>o.trim()),d=s?"th":"td";r+="<tr>";for(const o of l)r+=`<${d}>${A(H(o))}</${d}>`;r+="</tr>"}return r+="</table></div>",r}),e=e.replace(/^### (.*$)/gim,"<h3>$1</h3>"),e=e.replace(/^## (.*$)/gim,"<h2>$1</h2>"),e=e.replace(/^# (.*$)/gim,"<h1>$1</h1>"),e=e.replace(/^\> (.*$)/gim,"<blockquote>$1</blockquote>"),e=e.replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>"),e=e.replace(/\*([^*]+)\*/g,"<em>$1</em>"),e=e.replace(/^\s*[-*•]\s+(.*$)/gim,"<li>$1</li>"),e=e.replace(/(<li>.*<\/li>)/s,"<ul>$1</ul>"),e=e.replace(/!\[([^\]]*)\]\((data:image\/[^)]+|https?:\/\/[^)]+)\)/g,(n,i,r)=>`<div class="generated-image-card">
      <div class="image-wrapper">
        <img class="generated-image" src="${r}" alt="${A(i)}" loading="lazy" />
      </div>
      <div class="generated-image-footer">
        ${i?`<div class="image-prompt-caption" title="${A(i)}"><span class="caption-icon">🎨</span> <span>${A(i)}</span></div>`:"<div></div>"}
        <div class="image-card-actions">
          <button class="img-btn copy-card-img-btn" title="Copy image to clipboard (pastes directly into Word/Office)">📋 Copy Image</button>
          <button class="img-btn download-card-img-btn" data-img-name="${A(i||"generated-image")}" title="Save image to computer">💾 Save</button>
        </div>
      </div>
    </div>`),e=e.replace(/\n\n/g,"<p></p>"),e}function R(c){if(!c)return null;const e=c.match(/!\[[^\]]*\]\(((?:data:image\/[a-zA-Z0-9+.-]+;base64,[A-Za-z0-9+/=]+)|https?:\/\/[^\s)]+)\)/i);if(e)return e[1];const t=c.match(/(data:image\/[a-zA-Z0-9+.-]+;base64,[A-Za-z0-9+/=]+)/i);if(t)return t[1];const n=c.match(/<img[^>]+src=["']((?:data:image\/[a-zA-Z0-9+.-]+;base64,[A-Za-z0-9+/=]+)|https?:\/\/[^\s"']+)["']/i);return n?n[1]:null}async function re(c){return new Promise((e,t)=>{const n=new Image;n.crossOrigin="anonymous",n.onload=()=>{try{const i=document.createElement("canvas");i.width=n.naturalWidth||n.width||512,i.height=n.naturalHeight||n.height||512;const r=i.getContext("2d");if(!r)throw new Error("Canvas 2D context unavailable");r.drawImage(n,0,0),i.toBlob(s=>{s?e(s):t(new Error("Failed to generate PNG blob from canvas"))},"image/png")}catch(i){t(i)}},n.onerror=i=>t(new Error("Failed to load image for clipboard conversion: "+i)),n.src=c})}async function z(c){try{const e=await re(c);if(navigator.clipboard&&typeof ClipboardItem<"u")return await navigator.clipboard.write([new ClipboardItem({"image/png":e})]),!0}catch(e){console.error("[Clipboard] Failed to copy image to clipboard:",e)}return!1}function se(c,e="generated-image.png"){try{const t=document.createElement("a");t.href=c,t.download=e,document.body.appendChild(t),t.click(),document.body.removeChild(t)}catch(t){console.error("[Clipboard] Failed to download image:",t)}}function oe(c){return c?c.replace(/!\[([^\]]*)\]\((?:data:image\/[^)]+|https?:\/\/[^)]+)\)/g,(e,t)=>t?`[Image: ${t}]`:"[Image]").replace(/&nbsp;/gi," ").replace(/&amp;/gi,"&").replace(/&lt;/gi,"<").replace(/&gt;/gi,">").replace(/&quot;/gi,'"').replace(/&#39;/gi,"'"):""}class q{static parseMarkdownTable(e){const t=e.split(`
`).map(i=>i.trim()).filter(i=>i.startsWith("|")&&i.endsWith("|"));if(t.length<2)return null;const n=[];for(const i of t){if(/^\|[\s\-:|]+\|$/.test(i))continue;const r=i.slice(1,-1).split("|").map(s=>s.replace(/&nbsp;/gi," ").trim());n.push(r)}return n.length>0?n:null}static extractFormula(e){const t=e.match(/```(?:excel|formula)?\s*(=[^\n`]+)```/i);if(t)return t[1].trim();const n=e.match(/`(=[A-Z0-9_]+(?:\([^`]+\))?)`/i);if(n)return n[1].trim();const i=e.match(/^\s*(=[A-Z_]+(?:\([^\n]+\))?)\s*$/m);return i?i[1].trim():null}static async insertContent(e,t=!1){const n=k.getHost(),i=R(e);try{if(i)return await this.insertImage(i);if(n==="Word"){const r=this.parseMarkdownTable(e);if(r&&r.length>1&&!t){const a=await O.insertTable(r);return{success:a,message:a?"Inserted table into Word":"Failed to insert table"}}const s=t?await O.replaceSelection(e):await O.insertText(e);return{success:s,message:s?t?"Replaced selection in Word":"Inserted text into Word":"Insertion failed"}}if(n==="Excel"){const r=this.extractFormula(e);if(r){const l=await T.insertFormula(r);return{success:l,message:l?`Inserted formula ${r} into cell`:"Failed to insert formula"}}const s=this.parseMarkdownTable(e);if(s){const l=await T.insertData(s);return{success:l,message:l?"Inserted data grid into worksheet":"Failed to insert data"}}const a=await T.insertData([[e]]);return{success:a,message:a?"Inserted text into cell":"Failed to insert"}}if(n==="PowerPoint"){const r=await D.insertText(e);return{success:r,message:r?"Inserted content into slide":"Failed to insert"}}return{success:!0,message:"Simulated insert (Standalone mode)"}}catch(r){return{success:!1,message:r.message||"Action failed"}}}static async insertFormula(e){const t=await T.insertFormula(e);return{success:t,message:t?`Formula ${e} inserted`:"Failed to insert formula"}}static async createSlideFromText(e){const t=e.split(`
`).map(s=>s.trim()).filter(s=>s.length>0);if(t.length===0)return{success:!1,message:"No content to create slide"};const n=t[0].replace(/^#+\s*/,""),i=t.slice(1).map(s=>s.replace(/^[-*•]\s*/,"")),r=await D.createSlide(n,i.length>0?i:["Key point"]);return{success:r,message:r?`Created new slide: "${n}"`:"Failed to create slide"}}static async insertImage(e){const t=k.getHost();let n=!1;return t==="Word"?n=await O.insertImage(e):t==="Excel"?n=await T.insertImage(e):t==="PowerPoint"?n=await D.insertImage(e):n=!0,{success:n,message:n?`Image inserted into ${t}`:"Failed to insert image"}}}class ae{constructor(e,t){u(this,"container"),u(this,"onRegenerate"),u(this,"onShowToast"),this.container=e,this.onRegenerate=t.onRegenerate,this.onShowToast=t.onShowToast}render(e,t=!1){if(e.length===0){this.renderWelcome();return}const n=k.getHost();this.container.innerHTML=`
      <div class="chat-viewport" id="chatViewport">
        ${e.map(i=>this.renderMessage(i,n)).join("")}
      </div>
    `,this.attachEventListeners(e),this.scrollToBottom()}renderWelcome(){const e=k.getHost();this.container.innerHTML=`
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
    `,this.container.querySelectorAll(".welcome-card").forEach(t=>{t.addEventListener("click",()=>{const n=t.getAttribute("data-prompt")||"",i=document.querySelector("#promptInput");i&&(i.value=n,i.focus())})})}getDefaultPrompt(e,t){return e==="Excel"?t===1?"Explain this data and identify top trends and outliers.":"Create an Excel formula using XLOOKUP to match IDs and calculate total revenue.":e==="PowerPoint"?t===1?"Create a 5-slide presentation outline on Artificial Intelligence in modern education.":"Generate speaker notes for this slide focusing on executive decision makers.":t===1?"Rewrite this paragraph to be persuasive, concise, and executive-ready.":"Create a comparative analysis table detailing the pros and cons of cloud migration."}getPromptTitle(e,t){return e==="Excel"?t===1?"Analyze Spreadsheet":"Write Smart Formula":e==="PowerPoint"?t===1?"Create Presentation":"Generate Speaker Notes":t===1?"Polished Document Rewrite":"Generate Comparison Table"}getPromptDesc(e,t){return e==="Excel"?t===1?"Summarizes statistics & key findings":"Calculates dynamic metrics":e==="PowerPoint"?t===1?"Outline with slide titles and bullets":"Tailored talking points":t===1?"Enhance tone, clarity, and impact":"Structured markdown table"}renderMessage(e,t){const n=e.role==="user",i=e.role==="assistant";let r=n?`<p>${e.content.replace(/\n/g,"<br>")}</p>`:F(e.content);e.isStreaming&&(r+='<span class="streaming-cursor"></span>');let s="";e.images&&e.images.length>0&&(s=`<div class="attachments-preview">
        ${e.images.map(d=>`<div class="attachment-chip"><img src="${d.data.startsWith("data:")?d.data:`data:${d.mimeType};base64,${d.data}`}" /> <span>${d.name}</span></div>`).join("")}
      </div>`);let a="";if(i&&!e.isStreaming&&!e.isError){const d=q.extractFormula(e.content),o=t==="PowerPoint",p=!!R(e.content);a=`
        <div class="message-actions-bar" data-msg-id="${e.id}">
          <button class="action-chip-btn primary insert-btn" title="Insert directly into document">
            📥 Insert
          </button>
          <button class="action-chip-btn replace-btn" title="Replace highlighted selection">
            ⇄ Replace
          </button>
          ${d?`<button class="action-chip-btn excel-action formula-btn" data-formula="${encodeURIComponent(d)}" title="Insert formula into selected cell">🧮 Insert Formula</button>`:""}
          ${o?'<button class="action-chip-btn ppt-action slide-btn" title="Create slide from this outline">🎯 Create Slide</button>':""}
          <button class="action-chip-btn copy-btn" title="${p?"Copy image to clipboard (pastes as picture directly into Word/Office)":"Copy response to clipboard"}">
            📋 ${p?"Copy Image":"Copy"}
          </button>
          <button class="action-chip-btn regen-btn" title="Regenerate response">
            ↻ Regenerate
          </button>
        </div>
      `}const l=n?"You":`${e.provider?e.provider.toUpperCase():"AI"}${e.model?` (${e.model})`:""}`;return`
      <div class="chat-message ${e.role}" id="msg-${e.id}">
        <div class="message-meta">${l}</div>
        ${s}
        <div class="message-bubble ${e.isError?"error-bubble":""}">
          ${r}
        </div>
        ${a}
      </div>
    `}attachEventListeners(e){this.container.querySelectorAll(".copy-code-btn").forEach(t=>{t.addEventListener("click",n=>{const i=n.currentTarget,r=decodeURIComponent(i.dataset.code||"");navigator.clipboard.writeText(r).then(()=>{i.textContent="Copied!",setTimeout(()=>{i.textContent="Copy"},1500)})})}),this.container.querySelectorAll(".copy-card-img-btn").forEach(t=>{t.addEventListener("click",async n=>{const i=n.currentTarget,r=i.closest(".generated-image-card"),s=r==null?void 0:r.querySelector("img.generated-image");!s||!s.src||(i.textContent="Copying...",await z(s.src)?(i.textContent="✓ Copied!",i.classList.add("copied"),this.onShowToast("Image copied to clipboard! Paste directly into Word."),setTimeout(()=>{i.textContent="📋 Copy Image",i.classList.remove("copied")},2e3)):(i.textContent="📋 Copy Image",this.onShowToast("Could not copy image to clipboard")))})}),this.container.querySelectorAll(".download-card-img-btn").forEach(t=>{t.addEventListener("click",n=>{const i=n.currentTarget,r=i.closest(".generated-image-card"),s=r==null?void 0:r.querySelector("img.generated-image");if(!s||!s.src)return;const a=(i.dataset.imgName||"generated-image").replace(/[^a-zA-Z0-9_-]/g,"_").slice(0,40);se(s.src,`${a}.png`),this.onShowToast("Image downloaded")})}),this.container.querySelectorAll(".message-actions-bar").forEach(t=>{var n,i,r,s,a,l;const d=t.dataset.msgId,o=e.find(p=>p.id===d);o&&((n=t.querySelector(".insert-btn"))==null||n.addEventListener("click",async()=>{const p=await q.insertContent(o.content,!1);this.onShowToast(p.message)}),(i=t.querySelector(".replace-btn"))==null||i.addEventListener("click",async()=>{const p=await q.insertContent(o.content,!0);this.onShowToast(p.message)}),(r=t.querySelector(".formula-btn"))==null||r.addEventListener("click",async p=>{const h=decodeURIComponent(p.currentTarget.dataset.formula||""),S=await q.insertFormula(h);this.onShowToast(S.message)}),(s=t.querySelector(".slide-btn"))==null||s.addEventListener("click",async()=>{const p=await q.createSlideFromText(o.content);this.onShowToast(p.message)}),(a=t.querySelector(".copy-btn"))==null||a.addEventListener("click",async()=>{const p=R(o.content);if(p&&(this.onShowToast("Copying image to clipboard..."),await z(p))){this.onShowToast("Image copied to clipboard! Paste directly into Word.");return}const h=oe(o.content);await navigator.clipboard.writeText(h),this.onShowToast("Copied to clipboard")}),(l=t.querySelector(".regen-btn"))==null||l.addEventListener("click",()=>{d&&this.onRegenerate(d)}))})}scrollToBottom(){const e=this.container.querySelector("#chatViewport");e&&(e.scrollTop=e.scrollHeight)}updateStreamingBubble(e,t){const n=this.container.querySelector(`#msg-${e} .message-bubble`);n&&(n.innerHTML=F(t)+'<span class="streaming-cursor"></span>',this.scrollToBottom())}}class M{static ensureContainer(){return this.container||(this.container=document.createElement("div"),this.container.className="toast-container",document.body.appendChild(this.container)),this.container}static show(e,t="info",n=3500){const i=this.ensureContainer(),r=document.createElement("div");r.className=`toast toast-${t}`;let s=`
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
      </svg>
    `;t==="success"?s=`
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M20 6 9 17l-5-5"/>
        </svg>
      `:(t==="warning"||t==="error")&&(s=`
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      `),r.innerHTML=`${s}<span>${e}</span>`,t==="error"?(r.style.borderColor="var(--error)",r.style.color="#fca5a5"):t==="warning"&&(r.style.borderColor="var(--warning)",r.style.color="#fde68a"),i.appendChild(r),setTimeout(()=>{r.style.opacity="0",r.style.transform="translateY(10px)",r.style.transition="all 0.2s ease",setTimeout(()=>r.remove(),200)},n)}}u(M,"container",null);class le{constructor(e,t){u(this,"container"),u(this,"onSend"),u(this,"onStop"),u(this,"isGenerating",!1),u(this,"attachedImages",[]),u(this,"visionSupported",!0),this.container=e,this.onSend=t.onSend,this.onStop=t.onStop,this.render()}setGenerating(e){this.isGenerating=e,this.render()}setVisionSupported(e){this.visionSupported=e;const t=this.container.querySelector("#attachBtn");t&&(t.disabled=!e,t.setAttribute("title",e?"Attach image (Vision)":"Current model does not support vision"),t.style.opacity=e?"1":"0.4")}setInput(e){const t=this.container.querySelector("#promptInput");t&&(t.value=e,t.focus(),this.autoResize(t))}render(){this.container.innerHTML=`
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
    `}attachEventListeners(){const e=this.container.querySelector("#promptInput"),t=this.container.querySelector("#sendBtn"),n=this.container.querySelector("#stopBtn"),i=this.container.querySelector("#attachBtn"),r=this.container.querySelector("#fileInput");e==null||e.addEventListener("input",()=>this.autoResize(e)),e==null||e.addEventListener("keydown",s=>{s.key==="Enter"&&!s.shiftKey&&(s.preventDefault(),this.submit())}),t==null||t.addEventListener("click",()=>this.submit()),n==null||n.addEventListener("click",()=>this.onStop()),i==null||i.addEventListener("click",()=>r==null?void 0:r.click()),r==null||r.addEventListener("change",async()=>{if(!r.files)return;for(let a=0;a<r.files.length;a++){const l=r.files[a];if(l.size>10*1024*1024){M.show("Image size exceeds 10MB limit","warning");continue}const d=await this.fileToBase64(l);this.attachedImages.push({name:l.name,mimeType:l.type,data:d,size:l.size})}r.value="",this.render();const s=this.container.querySelector("#promptInput");s==null||s.focus()}),this.container.querySelectorAll(".remove-attach-btn").forEach(s=>{s.addEventListener("click",a=>{const l=parseInt(a.currentTarget.dataset.index||"0");this.attachedImages.splice(l,1),this.render()})})}submit(){const e=this.container.querySelector("#promptInput");if(!e)return;const t=e.value.trim();if(!t&&this.attachedImages.length===0)return;const n=[...this.attachedImages];e.value="",this.attachedImages=[],this.autoResize(e),this.render(),this.onSend(t,n)}autoResize(e){e.style.height="auto",e.style.height=Math.min(e.scrollHeight,120)+"px"}fileToBase64(e){return new Promise((t,n)=>{const i=new FileReader;i.onload=()=>t(i.result),i.onerror=n,i.readAsDataURL(e)})}}class ce{constructor(e,t){u(this,"container"),u(this,"isOpen",!1),u(this,"onClose"),u(this,"onSaved"),this.container=e,this.onClose=t.onClose,this.onSaved=t.onSaved}open(){this.isOpen=!0,this.render()}close(){this.isOpen=!1,this.render(),this.onClose()}render(){const e=g.getApiKeys(),t=g.getSettings();this.container.innerHTML=`
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
    `,this.attachEventListeners()}attachEventListeners(){const e=this.container.querySelector("#settingsOverlay"),t=this.container.querySelector("#closeSettingsBtn"),n=this.container.querySelector("#saveSettingsBtn"),i=this.container.querySelector("#tempSlider"),r=this.container.querySelector("#tempVal"),s=this.container.querySelector("#addModelBtn");t==null||t.addEventListener("click",()=>this.close()),e==null||e.addEventListener("click",a=>{a.target===e&&this.close()}),i==null||i.addEventListener("input",()=>{r&&(r.textContent=i.value)}),this.container.querySelectorAll(".test-btn").forEach(a=>{a.addEventListener("click",async l=>{var d;const o=l.currentTarget.dataset.provider||"",p=this.container.querySelector(`#status-${o}`),h=this.container.querySelector(`#key-${o}`),S=this.container.querySelector("#custom-base-url"),C=((d=h==null?void 0:h.value)==null?void 0:d.trim())||"";if(["openai","gemini","openrouter"].includes(o)&&!C){p&&(p.textContent="✗ Please enter an API key first",p.className="test-status error");return}p&&(p.textContent="Testing...",p.className="test-status");const m=I.getProvider(o);if(!m)return;const b=await m.validateApiKey(C,S==null?void 0:S.value);p&&(b.valid?(p.textContent="✓ Connected",p.className="test-status success"):(p.textContent=`✗ ${b.message||"Failed"}`,p.className="test-status error"))})}),s==null||s.addEventListener("click",()=>{const a=this.container.querySelector("#customModelId"),l=this.container.querySelector("#customModelName"),d=this.container.querySelector("#customModelProvider");a.value.trim()&&(g.saveCustomModel({id:a.value.trim(),name:l.value.trim()||a.value.trim(),capabilities:{textGeneration:!0,imageInput:!1,imageGeneration:!1,streaming:!0,functionCalling:!1,structuredOutput:!0},providerId:d.value}),M.show(`Custom model "${a.value}" added!`,"success"),a.value="",l.value="",this.onSaved())}),n==null||n.addEventListener("click",()=>{var a,l,d,o,p,h,S,C;const m=(a=this.container.querySelector("#key-gemini"))==null?void 0:a.value.trim(),b=(l=this.container.querySelector("#key-nvidia"))==null?void 0:l.value.trim(),P=(d=this.container.querySelector("#key-openrouter"))==null?void 0:d.value.trim(),$=(o=this.container.querySelector("#key-pollinations"))==null?void 0:o.value.trim(),v=(p=this.container.querySelector("#key-custom"))==null?void 0:p.value.trim(),y=(h=this.container.querySelector("#custom-base-url"))==null?void 0:h.value.trim(),x=(S=this.container.querySelector("#systemPrompt"))==null?void 0:S.value,f=(C=this.container.querySelector("#themeSelect"))==null?void 0:C.value,E=parseFloat((i==null?void 0:i.value)||"0.7");m&&g.setApiKey("gemini",m),b&&g.setApiKey("nvidia",b),P&&g.setApiKey("openrouter",P),$&&g.setApiKey("pollinations",$),v&&g.setApiKey("custom",v),g.saveSettings({systemPrompt:x,temperature:E,theme:f,customBaseUrl:y}),document.documentElement.setAttribute("data-theme",f),this.close(),this.onSaved()})}}class de{constructor(e,t){u(this,"container"),u(this,"isOpen",!1),u(this,"onClose"),u(this,"onLoadSession"),this.container=e,this.onClose=t.onClose,this.onLoadSession=t.onLoadSession}open(){this.isOpen=!0,this.render()}close(){this.isOpen=!1,this.render(),this.onClose()}render(){const e=g.getChatSessions();this.container.innerHTML=`
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
      `}).join("")}attachEventListeners(e){const t=this.container.querySelector("#historyOverlay"),n=this.container.querySelector("#closeHistoryBtn"),i=this.container.querySelector("#clearAllChatsBtn"),r=this.container.querySelector("#searchHistoryInput");n==null||n.addEventListener("click",()=>this.close()),t==null||t.addEventListener("click",s=>{s.target===t&&this.close()}),i==null||i.addEventListener("click",()=>{var s,a;const l=this.container.querySelector("#clearAllConfirm");if(l){l.remove();return}const d=document.createElement("div");d.id="clearAllConfirm",d.innerHTML=`
        <div style="background:var(--surface-2,#2a2a3a);border:1px solid var(--danger,#ef4444);border-radius:8px;padding:10px 14px;margin-top:8px;display:flex;gap:10px;align-items:center;font-size:13px;color:var(--text-primary,#fff);">
          <span style="flex:1">Clear all history? This cannot be undone.</span>
          <button id="clearConfirmYes" style="background:#ef4444;color:#fff;border:none;border-radius:6px;padding:4px 12px;cursor:pointer;font-size:12px;">Clear</button>
          <button id="clearConfirmNo" style="background:var(--surface-3,#3a3a4a);color:var(--text-primary,#fff);border:none;border-radius:6px;padding:4px 12px;cursor:pointer;font-size:12px;">Cancel</button>
        </div>`,i.insertAdjacentElement("afterend",d),(s=d.querySelector("#clearConfirmYes"))==null||s.addEventListener("click",()=>{g.clearAllChats(),d.remove(),M.show("All conversation history cleared.","warning"),this.render()}),(a=d.querySelector("#clearConfirmNo"))==null||a.addEventListener("click",()=>d.remove())}),r==null||r.addEventListener("input",()=>{const s=r.value.toLowerCase(),a=e.filter(d=>d.title.toLowerCase().includes(s)||d.messages.some(o=>o.content.toLowerCase().includes(s))),l=this.container.querySelector("#historyList");l&&(l.innerHTML=this.renderSessionItems(a),this.attachItemClicks(a))}),this.attachItemClicks(e)}attachItemClicks(e){this.container.querySelectorAll(".history-item").forEach(t=>{t.addEventListener("click",n=>{if(n.target.classList.contains("delete-chat-btn"))return;const i=t.dataset.id,r=e.find(s=>s.id===i);r&&(this.onLoadSession(r),this.close())})}),this.container.querySelectorAll(".delete-chat-btn").forEach(t=>{t.addEventListener("click",n=>{n.stopPropagation();const i=t.dataset.id;i&&(g.deleteChatSession(i),this.render())})})}}class ue{constructor(e){u(this,"currentSession"),u(this,"abortController",null),u(this,"onStateChange"),this.onStateChange=e,this.currentSession=this.createNewSession()}getCurrentSession(){return this.currentSession}loadSession(e){this.currentSession=e,this.onStateChange(this.currentSession,!1)}createNewSession(){const e={id:"chat_"+Date.now()+"_"+Math.random().toString(36).substring(2,7),title:"New Conversation",createdAt:Date.now(),updatedAt:Date.now(),messages:[]};return this.currentSession=e,this.onStateChange(this.currentSession,!1),e}stopGeneration(){this.abortController&&(this.abortController.abort(),this.abortController=null)}async sendMessage(e,t=[],n=null,i,r){const s=I.getProvider(i);if(!s){M.show(`Provider "${i}" not found`,"error");return}const a=g.getApiKeys()[i]||"",l=g.getSettings();if(!a&&i!=="custom"&&i!=="nvidia"&&i!=="pollinations"){M.show(`Please set an API key for ${s.name} in Settings (⚙️ icon) before sending messages.`,"warning",4500);return}const d={id:"msg_"+Date.now(),role:"user",content:e,timestamp:Date.now(),images:t.length>0?t:void 0,officeContext:n||void 0};this.currentSession.messages.length===0&&(this.currentSession.title=e.slice(0,35)+(e.length>35?"...":"")),this.currentSession.messages.push(d);const o={id:"msg_ai_"+Date.now(),role:"assistant",content:"",timestamp:Date.now(),provider:i,model:r,isStreaming:!0};this.currentSession.messages.push(o),this.onStateChange(this.currentSession,!0);const p=I.getModelInfo(i,r);if(p!=null&&p.capabilities.imageGeneration&&s.generateImage){try{o.content=`🎨 Generating image with ${p.name}...

*"${e}"*`,o.isStreaming=!0,this.onStateChange(this.currentSession,!0);const m=await s.generateImage({prompt:e,provider:i,model:r,apiKey:a});o.content=`Here is your generated image:

![${m.revisedPrompt||e}](${m.imageUrl})`,o.isStreaming=!1,this.currentSession.updatedAt=Date.now(),g.saveChatSession(this.currentSession),this.onStateChange(this.currentSession,!1)}catch(m){o.content=`❌ **Image generation error:** ${m.message}`,o.isError=!0,o.isStreaming=!1,this.onStateChange(this.currentSession,!1)}return}const h=[];l.systemPrompt&&h.push({role:"system",content:l.systemPrompt});const S=this.currentSession.messages.slice(0,-2).slice(-10);for(const m of S)h.push({role:m.role,content:m.content});let C=e;n&&n.data&&(C=`[Active Context from Microsoft ${n.host} (${n.label})]:
${n.data}

[User Request]:
${e}`),h.push({role:"user",content:C}),this.abortController=new AbortController;try{await s.streamChat({messages:h,model:r,provider:i,apiKey:a,baseUrl:l.customBaseUrl,images:t,temperature:l.temperature,maxTokens:l.maxTokens,signal:this.abortController.signal,onChunk:m=>{o.content+=m,this.onStateChange(this.currentSession,!0)},onDone:()=>{o.isStreaming=!1,this.currentSession.updatedAt=Date.now();const m=Math.round(C.split(/\s+/).length*1.3),b=Math.round(o.content.split(/\s+/).length*1.3);o.tokens={prompt:m,completion:b,total:m+b};const P=I.calculateCost(i,r,m,b);P!==null&&(o.cost=P),g.saveChatSession(this.currentSession),this.onStateChange(this.currentSession,!1),this.abortController=null},onError:m=>{o.content+=`

**Error:** ${m}`,o.isError=!0,o.isStreaming=!1,this.currentSession.updatedAt=Date.now(),g.saveChatSession(this.currentSession),this.onStateChange(this.currentSession,!1),this.abortController=null}})}catch(m){o.content+=`

**Request Error:** ${m.message}`,o.isError=!0,o.isStreaming=!1,this.onStateChange(this.currentSession,!1),this.abortController=null}}async regenerate(e,t,n){const i=this.currentSession.messages.findIndex(s=>s.id===e);if(i===-1)return;const r=this.currentSession.messages.slice(0,i).reverse().find(s=>s.role==="user");this.currentSession.messages=this.currentSession.messages.slice(0,i),r&&await this.sendMessage(r.content,r.images||[],r.officeContext||null,t,n)}}async function _(){console.log("[Office AI] Bootstrapping Add-in...");const c=g.getSettings();document.documentElement.setAttribute("data-theme",c.theme||"dark"),I.initialize();const e=document.getElementById("headerMount"),t=document.getElementById("modelSelectorMount"),n=document.getElementById("contextBarMount"),i=document.getElementById("quickActionsMount"),r=document.getElementById("chatViewMount"),s=document.getElementById("promptBoxMount"),a=document.getElementById("settingsMount"),l=document.getElementById("historyMount");let d,o,p,h,S,C,m,b=null;m=new ue((v,y)=>{var x;const f=v.messages[v.messages.length-1];y&&f!=null&&f.isStreaming?b!==f.id?(b=f.id,h==null||h.render(v.messages,!0)):h==null||h.updateStreamingBubble(f.id,f.content):(b=null,h==null||h.render(v.messages,y)),d==null||d.setGenerating(y),f&&f.cost!==void 0&&(o==null||o.updateCostDisplay(f.cost,(x=f.tokens)==null?void 0:x.total))}),S=new ce(a,{onClose:()=>{},onSaved:()=>{o.render(),M.show("Settings saved")}}),C=new de(l,{onClose:()=>{},onLoadSession:v=>{m.loadSession(v),M.show(`Loaded: ${v.title}`)}}),new Q(e,{onNewChat:()=>{m.createNewSession(),M.show("New conversation started")},onOpenHistory:()=>C.open(),onOpenSettings:()=>S.open()}),o=new ee(t,(v,y)=>{const x=I.getModelInfo(v,y);d==null||d.setVisionSupported((x==null?void 0:x.capabilities.imageInput)??!0)}),p=new ne(n),new ie(i,(v,y)=>{if(y){const{providerId:x,modelId:f}=o.getCurrent(),E=p.getAttachedContext();m.sendMessage(v,[],E,x,f)}else d.setInput(v)}),h=new ae(r,{onRegenerate:v=>{const{providerId:y,modelId:x}=o.getCurrent();m.regenerate(v,y,x)},onShowToast:v=>M.show(v)}),d=new le(s,{onSend:(v,y)=>{const{providerId:x,modelId:f}=o.getCurrent(),E=p.getAttachedContext();m.sendMessage(v,y,E,x,f)},onStop:()=>{m.stopGeneration()}});const P=o.getCurrent(),$=I.getModelInfo(P.providerId,P.modelId);d.setVisionSupported(($==null?void 0:$.capabilities.imageInput)??!0),h.render(m.getCurrentSession().messages),window.addEventListener("focus",()=>{p.refresh()})}typeof Office<"u"?Office.onReady(()=>{_()}):document.addEventListener("DOMContentLoaded",()=>{_()});
