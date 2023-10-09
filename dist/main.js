(()=>{var $=(e,t)=>()=>(e&&(t=e(e=0)),t);async function K(e,t,r){let n=await fetch(e,t),o=0,s=Number(n.headers.get("Content-Length"))||0;return(!Number.isInteger(s)||!Number.isFinite(s)||s<=0)&&(s=null),new Response(new ReadableStream({async start(i){let a=n.body.getReader();for(;;){let{done:l,value:u}=await a.read();if(l){r(o,s,!0);break}o+=u.byteLength,r(o,s,!1),i.enqueue(u)}i.close()}}),{status:n.status,statusText:n.statusText,headers:n.headers})}function v(e,t){let r=new URL(e,location.href);r.search="";for(let[n,o]of Object.entries(t))n==="open"&&o.startsWith("/")&&(o=o.substr(1)),r.searchParams.set(n,o);return r.toString().replace(/%2F/g,"/")}function W(e){let t=[];if(!FS.analyzePath(e).exists)return t;function r(n){for(let o of FS.readdir(n)){if(o==="."||o==="..")continue;let s=`${n}/${o}`,{mode:i,timestamp:a}=FS.lookupPath(s).node;FS.isFile(i)?t.push({path:s,timestamp:a}):FS.isDir(i)&&r(s)}}return r(e),t}function S(e,t,r){let n=document.createElement(e);return t&&(n.className=t),n.textContent=r,n}function L(e,t,r){let n=e||t,o=1,s=0;return r===void 0&&(n>1024**2?r="MB":n>1024?r="KB":r="B"),r==="B"?(o=1,s=0):r==="KB"?(o=1024,s=0):r==="MB"&&(o=1024**2,s=1),t===void 0?`${(e/o).toFixed(s)} ${r}`:`${(e/o).toFixed(s)}/${(t/o).toFixed(s)} ${r}`}var G,P=$(()=>{G=async e=>{let t=[];async function r(o){for await(let s of o.values())t.push(s),s.kind==="directory"&&await r(s)}await r(e);let n=new Map;n.set(".",e);for(let o of t){let s=(await e.resolve(o)).join("/");n.set(s,o)}return n}});var Fe={};function ve(e,t){return Object.assign(e,t)}var Q,Y=$(()=>{P();Q={library:{}};ve(Q.library,{$FSFS__deps:["$FS","$MEMFS","$PATH"],$FSFS__postset:function(){return""},$FSFS:{DIR_MODE:16895,FILE_MODE:33279,mount:function(e){if(!e.opts.dirHandle)throw new Error("opts.dirHandle is required");return MEMFS.mount.apply(null,arguments)},syncfs:async(e,t,r)=>{try{let n=await FSFS.getLocalSet(e),o=await FSFS.getRemoteSet(e),s=t?o:n,i=t?n:o;await FSFS.reconcile(e,s,i),r(null)}catch(n){r(n)}},getLocalSet:e=>{var t=Object.create(null);function r(a){return a!=="."&&a!==".."}function n(a){return l=>PATH.join2(a,l)}for(var o=FS.readdir(e.mountpoint).filter(r).map(n(e.mountpoint));o.length;){var s=o.pop(),i=FS.stat(s);FS.isDir(i.mode)&&o.push.apply(o,FS.readdir(s).filter(r).map(n(s))),t[s]={timestamp:i.mtime,mode:i.mode}}return{type:"local",entries:t}},getRemoteSet:async e=>{let t=Object.create(null),r=await G(e.opts.dirHandle,!0);for(let[n,o]of r)n!=="."&&(t[PATH.join2(e.mountpoint,n)]={timestamp:o.kind==="file"?(await o.getFile()).lastModifiedDate:new Date,mode:o.kind==="file"?FSFS.FILE_MODE:FSFS.DIR_MODE});return{type:"remote",entries:t,handles:r}},loadLocalEntry:e=>{let r=FS.lookupPath(e).node,n=FS.stat(e);if(FS.isDir(n.mode))return{timestamp:n.mtime,mode:n.mode};if(FS.isFile(n.mode))return r.contents=MEMFS.getFileDataAsTypedArray(r),{timestamp:n.mtime,mode:n.mode,contents:r.contents};throw new Error("node type not supported")},storeLocalEntry:(e,t)=>{if(FS.isDir(t.mode))FS.mkdirTree(e,t.mode);else if(FS.isFile(t.mode))FS.writeFile(e,t.contents,{canOwn:!0});else throw new Error("node type not supported");FS.chmod(e,t.mode),FS.utime(e,t.timestamp,t.timestamp)},removeLocalEntry:e=>{var t=FS.stat(e);FS.isDir(t.mode)?FS.rmdir(e):FS.isFile(t.mode)&&FS.unlink(e)},loadRemoteEntry:async e=>{if(e.kind==="file"){let t=await e.getFile();return{contents:new Uint8Array(await t.arrayBuffer()),mode:FSFS.FILE_MODE,timestamp:t.lastModifiedDate}}else{if(e.kind==="directory")return{mode:FSFS.DIR_MODE,timestamp:new Date};throw new Error("unknown kind: "+e.kind)}},storeRemoteEntry:async(e,t,r)=>{let n=e.get(PATH.dirname(t)),o=FS.isFile(r.mode)?await n.getFileHandle(PATH.basename(t),{create:!0}):await n.getDirectoryHandle(PATH.basename(t),{create:!0});if(o.kind==="file"){let s=await o.createWritable();await s.write(r.contents),await s.close()}e.set(t,o)},removeRemoteEntry:async(e,t)=>{await e.get(PATH.dirname(t)).removeEntry(PATH.basename(t)),e.delete(t)},reconcile:async(e,t,r)=>{let n=0,o=[];Object.keys(t.entries).forEach(function(a){let l=t.entries[a],u=r.entries[a];(!u||FS.isFile(l.mode)&&l.timestamp.getTime()>u.timestamp.getTime())&&(o.push(a),n++)}),o.sort();let s=[];if(Object.keys(r.entries).forEach(function(a){t.entries[a]||(s.push(a),n++)}),s.sort().reverse(),!n)return;let i=t.type==="remote"?t.handles:r.handles;for(let a of o){let l=PATH.normalize(a.replace(e.mountpoint,"/")).substring(1);if(r.type==="local"){let u=i.get(l),c=await FSFS.loadRemoteEntry(u);FSFS.storeLocalEntry(a,c)}else{let u=FSFS.loadLocalEntry(a);await FSFS.storeRemoteEntry(i,l,u)}}for(let a of s)if(r.type==="local")FSFS.removeLocalEntry(a);else{let l=PATH.normalize(a.replace(e.mountpoint,"/")).substring(1);await FSFS.removeRemoteEntry(i,l)}}}});globalThis.FSFS=Q.library.$FSFS;FS.filesystems.FSFS=FSFS});var C=(()=>{if(typeof self>"u")return!1;if("top"in self&&self!==top)try{top.window.document._=0}catch{return!1}return"showOpenFilePicker"in self})(),ne=C?Promise.resolve().then(function(){return ae}):Promise.resolve().then(function(){return me});async function U(...e){return(await ne).default(...e)}var re=C?Promise.resolve().then(function(){return le}):Promise.resolve().then(function(){return ye});async function j(...e){return(await re).default(...e)}var ie=C?Promise.resolve().then(function(){return de}):Promise.resolve().then(function(){return ge});async function B(...e){return(await ie).default(...e)}var oe=async e=>{let t=await e.getFile();return t.handle=e,t},se=async(e=[{}])=>{Array.isArray(e)||(e=[e]);let t=[];e.forEach((o,s)=>{t[s]={description:o.description||"Files",accept:{}},o.mimeTypes?o.mimeTypes.map(i=>{t[s].accept[i]=o.extensions||[]}):t[s].accept["*/*"]=o.extensions||[]});let r=await window.showOpenFilePicker({id:e[0].id,startIn:e[0].startIn,types:t,multiple:e[0].multiple||!1,excludeAcceptAllOption:e[0].excludeAcceptAllOption||!1}),n=await Promise.all(r.map(oe));return e[0].multiple?n:n[0]},ae={__proto__:null,default:se};function F(e){function t(r){if(Object(r)!==r)return Promise.reject(new TypeError(r+" is not an object."));var n=r.done;return Promise.resolve(r.value).then(function(o){return{value:o,done:n}})}return F=function(r){this.s=r,this.n=r.next},F.prototype={s:null,n:null,next:function(){return t(this.n.apply(this.s,arguments))},return:function(r){var n=this.s.return;return n===void 0?Promise.resolve({value:r,done:!0}):t(n.apply(this.s,arguments))},throw:function(r){var n=this.s.return;return n===void 0?Promise.reject(r):t(n.apply(this.s,arguments))}},new F(e)}var Z=async(e,t,r=e.name,n)=>{let o=[],s=[];var i,a=!1,l=!1;try{for(var u,c=function(d){var f,m,y,w=2;for(typeof Symbol<"u"&&(m=Symbol.asyncIterator,y=Symbol.iterator);w--;){if(m&&(f=d[m])!=null)return f.call(d);if(y&&(f=d[y])!=null)return new F(f.call(d));m="@@asyncIterator",y="@@iterator"}throw new TypeError("Object is not async iterable")}(e.values());a=!(u=await c.next()).done;a=!1){let d=u.value,f=`${r}/${d.name}`;d.kind==="file"?s.push(d.getFile().then(m=>(m.directoryHandle=e,m.handle=d,Object.defineProperty(m,"webkitRelativePath",{configurable:!0,enumerable:!0,get:()=>f})))):d.kind!=="directory"||!t||n&&n(d)||o.push(Z(d,t,f,n))}}catch(d){l=!0,i=d}finally{try{a&&c.return!=null&&await c.return()}finally{if(l)throw i}}return[...(await Promise.all(o)).flat(),...await Promise.all(s)]},ce=async(e={})=>{e.recursive=e.recursive||!1,e.mode=e.mode||"read";let t=await window.showDirectoryPicker({id:e.id,startIn:e.startIn,mode:e.mode});return(await(await t.values()).next()).done?[t]:Z(t,e.recursive,void 0,e.skipDirectory)},le={__proto__:null,default:ce},ue=async(e,t=[{}],r=null,n=!1,o=null)=>{Array.isArray(t)||(t=[t]),t[0].fileName=t[0].fileName||"Untitled";let s=[],i=null;if(e instanceof Blob&&e.type?i=e.type:e.headers&&e.headers.get("content-type")&&(i=e.headers.get("content-type")),t.forEach((u,c)=>{s[c]={description:u.description||"Files",accept:{}},u.mimeTypes?(c===0&&i&&u.mimeTypes.push(i),u.mimeTypes.map(d=>{s[c].accept[d]=u.extensions||[]})):i?s[c].accept[i]=u.extensions||[]:s[c].accept["*/*"]=u.extensions||[]}),r)try{await r.getFile()}catch(u){if(r=null,n)throw u}let a=r||await window.showSaveFilePicker({suggestedName:t[0].fileName,id:t[0].id,startIn:t[0].startIn,types:s,excludeAcceptAllOption:t[0].excludeAcceptAllOption||!1});!r&&o&&o(a);let l=await a.createWritable();return"stream"in e?(await e.stream().pipeTo(l),a):"body"in e?(await e.body.pipeTo(l),a):(await l.write(await e),await l.close(),a)},de={__proto__:null,default:ue},fe=async(e=[{}])=>(Array.isArray(e)||(e=[e]),new Promise((t,r)=>{let n=document.createElement("input");n.type="file";let o=[...e.map(l=>l.mimeTypes||[]),...e.map(l=>l.extensions||[])].join();n.multiple=e[0].multiple||!1,n.accept=o||"",n.style.display="none",document.body.append(n);let s=l=>{typeof i=="function"&&i(),t(l)},i=e[0].legacySetup&&e[0].legacySetup(s,()=>i(r),n),a=()=>{window.removeEventListener("focus",a),n.remove()};n.addEventListener("click",()=>{window.addEventListener("focus",a)}),n.addEventListener("change",()=>{window.removeEventListener("focus",a),n.remove(),s(n.multiple?Array.from(n.files):n.files[0])}),"showPicker"in HTMLInputElement.prototype?n.showPicker():n.click()})),me={__proto__:null,default:fe},pe=async(e=[{}])=>(Array.isArray(e)||(e=[e]),e[0].recursive=e[0].recursive||!1,new Promise((t,r)=>{let n=document.createElement("input");n.type="file",n.webkitdirectory=!0;let o=i=>{typeof s=="function"&&s(),t(i)},s=e[0].legacySetup&&e[0].legacySetup(o,()=>s(r),n);n.addEventListener("change",()=>{let i=Array.from(n.files);e[0].recursive?e[0].recursive&&e[0].skipDirectory&&(i=i.filter(a=>a.webkitRelativePath.split("/").every(l=>!e[0].skipDirectory({name:l,kind:"directory"})))):i=i.filter(a=>a.webkitRelativePath.split("/").length===2),o(i)}),"showPicker"in HTMLInputElement.prototype?n.showPicker():n.click()})),ye={__proto__:null,default:pe},he=async(e,t={})=>{Array.isArray(t)&&(t=t[0]);let r=document.createElement("a"),n=e;"body"in e&&(n=await async function(i,a){let l=i.getReader(),u=new ReadableStream({start:f=>async function m(){return l.read().then(({done:y,value:w})=>{if(!y)return f.enqueue(w),m();f.close()})}()}),c=new Response(u),d=await c.blob();return l.releaseLock(),new Blob([d],{type:a})}(e.body,e.headers.get("content-type"))),r.download=t.fileName||"Untitled",r.href=URL.createObjectURL(await n);let o=()=>{typeof s=="function"&&s()},s=t.legacySetup&&t.legacySetup(o,()=>s(),r);return r.addEventListener("click",()=>{setTimeout(()=>URL.revokeObjectURL(r.href),3e4),o()}),r.click(),null},ge={__proto__:null,default:he};function E(e){return new Promise((t,r)=>{e.oncomplete=e.onsuccess=()=>t(e.result),e.onabort=e.onerror=()=>r(e.error)})}function we(e,t){let r=indexedDB.open(e);r.onupgradeneeded=()=>r.result.createObjectStore(t);let n=E(r);return(o,s)=>n.then(i=>s(i.transaction(t,o).objectStore(t)))}var T;function D(){return T||(T=we("keyval-store","keyval")),T}function R(e,t=D()){return t("readonly",r=>E(r.get(e)))}function b(e,t,r=D()){return r("readwrite",n=>(n.put(t,e),E(n.transaction)))}function N(e,t=D()){return t("readwrite",r=>(r.delete(e),E(r.transaction)))}P();var p=null;function V(){return p}var X,Ee=new Promise(e=>{X=e});async function k(){let e=new URLSearchParams(location.search).get("storage");e!=="fs"&&e!=="idb"&&(e=void 0),e===void 0&&(p=await R("attached-dir"),!self.showDirectoryPicker||p===!1||!await be()?(e="idb",p=null):e="fs"),FS.mkdirTree("/local"),e==="fs"?await H(p):FS.mount(IDBFS,{},"/local"),await ZC.fsSync(!0),FS.analyzePath("/local/zc.cfg").exists||FS.writeFile("/local/zc.cfg",FS.readFile("/zc_web.cfg")),FS.analyzePath("/local/zquest.cfg").exists||FS.writeFile("/local/zquest.cfg",FS.readFile("/zquest_web.cfg")),await q(),X()}async function be(){let e={mode:"readwrite"};if(p){if(await p.queryPermission(e)==="granted")return!0;try{return await p.requestPermission(e)==="granted"}catch{}}document.querySelector(".content").classList.add("hidden"),document.querySelector(".permission").classList.remove("hidden"),document.querySelector(".permission .folder-name").textContent=p?.name,document.querySelector(".permission .already-attached").classList.toggle("hidden",!p),document.querySelector(".permission .not-attached").classList.toggle("hidden",!!p);let t=await new Promise(r=>{document.querySelector(".permission .ok").addEventListener("click",()=>{r(!0)}),document.querySelector(".permission .cancel").addEventListener("click",()=>{b("attached-dir",!1),r(!1)})});if(t&&!p)try{p=await self.showDirectoryPicker({id:"zc"})}catch{}return t&&p&&(t=await p.requestPermission(e)==="granted"),document.querySelector(".content").classList.remove("hidden"),document.querySelector(".permission").classList.add("hidden"),t}async function H(e){try{FS.unmount("/local")}catch{}p=e,e?await b("attached-dir",e):await N("attached-dir"),e&&(await Promise.resolve().then(()=>(Y(),Fe)),FS.mount(FSFS,{dirHandle:p},"/local"),await new Promise((t,r)=>FS.syncfs(!0,n=>{if(n)return r(n);t()})))}function J(){let e=document.querySelector(".settings");e.querySelector(".settings__browser-files").addEventListener("click",async o=>{let s=o.target.closest("[data-path]");if(!s)return;let i=s.getAttribute("data-path"),a=new Blob([FS.readFile(i)]);await B(a,{fileName:i.replace("/local/","")})});let r=["zc.cfg","zquest.cfg","zc.sav"];async function n(o){await Ee;for(let s of o){let i;s.webkitRelativePath?i=[...PATH.dirname(s.webkitRelativePath).split("/").slice(1),PATH.basename(s.webkitRelativePath)].join("/"):i=s.name;let a="/local/"+i;if(FS.analyzePath(a).exists){let l="/local/.backup/"+i;FS.mkdirTree(PATH.dirname(l)),FS.writeFile(l,FS.readFile(a))}FS.mkdirTree(PATH.dirname(a)),FS.writeFile(a,new Uint8Array(await s.arrayBuffer()))}await ZC.fsSync(!1),o.some(s=>r.includes(s.name))&&window.location.reload(),await q()}e.querySelector(".settings__copy button.copy-folder").addEventListener("click",async()=>{let o=await j({recursive:!0});await n(o)}),e.querySelector(".settings__copy button.copy-file").addEventListener("click",async()=>{let o=await U();await n([o])}),e.querySelector(".settings__attach button.attach").addEventListener("click",async()=>{let o=await self.showDirectoryPicker({id:"zc"});await H(o),window.location.reload()}),e.querySelector(".settings__attach button.unattach").addEventListener("click",async()=>{await H(null),window.location.reload()})}async function q(){let e=document.querySelector(".settings"),t=!!self.showDirectoryPicker&&p;{e.querySelector(".settings__attach").classList.toggle("hidden",!t),e.querySelector(".settings__attach button.attach").classList.toggle("hidden",p);let n=e.querySelector(".settings__attach button.unattach");n.classList.toggle("hidden",!p),n.textContent=`Folder attached: ${p?.name}\u2013Click to unattach`}if(e.querySelector(".settings__copy").classList.toggle("hidden",t),!t){let r=e.querySelector(".settings__browser-files");r.innerHTML="";for(let{path:n,timestamp:o}of W("/local")){let s=S("div","file");s.append(S("div","",n.replace("/local/",""))),s.append(S("div","",new Date(o).toLocaleString())),s.setAttribute("data-path",n),r.append(s)}}e.querySelector(".settings__download").classList.toggle("hidden",!!p);{let r=["zc.cfg","oot.cfg","2MGM.cfg","ultra.cfg","ppl160.cfg","freepats.cfg"],n=await R("timidity-cfg");(!n||!FS.analyzePath(`/etc/${n}`).exists)&&(n=r[0]);let o=e.querySelector(".settings__timidity-cfgs select");o.textContent="";for(let s of r){let i=S("option","",s);o.append(i)}o.addEventListener("change",async()=>{await b("timidity-cfg",o.value)}),o.value=n,FS.writeFile("/etc/timidity.cfg",FS.readFile(`/etc/${n}`))}}P();function ee(e){alert(e),window.location.reload()}async function te(){if(!(window.launchQueue&&"files"in LaunchParams.prototype)){document.body.textContent="This page is only for opening files from an installed PWA";return}await k();let e=V();if(!e){ee("Sorry, you can only open files this way if you've attached a folder. See Settings");return}document.querySelector(".content").classList.add("hidden"),document.querySelector(".file-handler").classList.remove("hidden");let t=await new Promise((i,a)=>{launchQueue.setConsumer(async l=>{if(console.log("...",l.files),!l.files.length){a(new Error("No files found"));return}i(l.files[0])})}),r=await e.resolve(t);if(!r){ee("Sorry, but that file is not inside the attached folder and cannot be opened directly");return}let o=`local/${r.join("/")}`,s=await new Promise(i=>{document.querySelectorAll(".file-handler button")[0].addEventListener("click",()=>{i(!1)}),document.querySelectorAll(".file-handler button")[1].addEventListener("click",()=>{i(!0)})});return document.querySelector(".content").classList.remove("hidden"),document.querySelector(".file-handler").classList.add("hidden"),{openInEditor:s,quest:o}}window.ZC={dataOrigin:"https://data.zquestclassic.com",pathToUrl:{},async fetch(e,t){let r=await K(e,t,(o,s,i)=>{i?Module.setStatus("Ready"):o&&s?Module.setStatus(`Fetching file (${L(o,s)})`,o/s):o?Module.setStatus(`Fetching file (${L(o)})`):Module.setStatus("Fetching file")});if(await r.headers.get("Content-Type")==="application/json"||e.endsWith(".json")){let o=new TextDecoder("utf-8").decode(await r.arrayBuffer());return JSON.parse(o)}return r},async getQuestManifest(){return ZC.questManifestPromise||(ZC.questManifestPromise=ZC.fetch(ZC.dataOrigin+"/manifest.json").catch(e=>(console.error(e.toString()),[]))),ZC.questManifestPromise},async fetchAsByteArray(e,t){let r=await ZC.fetch(e,t);return new Uint8Array(await r.arrayBuffer())},url:"",setShareableUrl(e){ZC.url=v("",e)},openTestMode(e,t,r,n){if(128<r)return;let o={test:e,dmap:t,screen:r};n!==-1&&(o.retsquare=n);let s=v(ZC_Constants.zeldaUrl,o);window.open(s,"_blank")},async runZscriptCompiler(e,t,r){e=PATH.join("/root-fs",e),t=PATH.join("/root-fs",t);let{default:n}=await import("./zscript.mjs"+(Math.random(),"")),o,s=new Promise(a=>o=a);await n({preRun(a){FS.analyzePath("/local/zscript.cfg").exists||FS.writeFile("/local/zscript.cfg",""),a.FS.mkdir("/root-fs"),a.FS.mount(PROXYFS,{root:"/",fs:FS},"/root-fs"),a.FS.chdir("/root-fs")},onExit:o,arguments:["-linked","-input",e,"-console",t,"-qr",r]});let i=await s;return await new Promise(a=>setTimeout(a,100)),{code:i}},async fsSync(e){await new Promise((t,r)=>FS.syncfs(e,n=>{if(n)return r(n);t()}))},configureMount:k};async function Le(){let e=new URLSearchParams(location.search),t=[];try{let r=document.getElementById("status"),n=document.getElementById("progress"),o=e.get("open");if(TARGET==="zeditor"&&o&&t.push(o.startsWith("/")?o:`/${o}`),TARGET==="zplayer"){let i=e.get("test"),a=e.get("screen"),l=e.get("dmap"),u=e.get("retsquare");i&&a&&l&&(t.push("-test",i,l,a),u&&t.push(u),document.querySelector(".button--testmode").classList.remove("hidden"))}for(let[i,a]of e.entries()){if(["test","screen","dmap","retsquare","open"].includes(i))continue;let l="-"+i.replace(/[A-Z]/g,(u,c)=>(c>0?"-":"")+u.toLowerCase());t.push(l),a!==""&&t.push(a)}window.Module={arguments:t,canvas:document.querySelector("canvas"),instantiateWasm:Pe,onRuntimeInitialized:()=>{if(TARGET==="zplayer")qe();else for(let i of[...document.querySelectorAll(".touch-inputs")])i.classList.toggle("hidden",!0);_e(),J(),TARGET==="zeditor"&&Ae()},setStatus:function(i,a=null){if(i.startsWith("Downloading data... (")){let[,u,c]=i.match(/(\d+)\/(\d+)/);i=`Downloading data... (${L(u,c,"MB")})`,a=u/c}if(!i||i==="Running...")return;if(Module.setStatus.last||(Module.setStatus.last={time:Date.now(),text:""}),i==="Ready"){n.value=null,n.max=null,n.hidden=!0,r.hidden=!0;return}if(r.hidden=!1,i===Module.setStatus.last.text)return;let l=Date.now();a&&l-Module.setStatus.last.time<30||(Module.setStatus.last.time=l,Module.setStatus.last.text=i,a!==null&&a>0?(n.value=a,n.max=1,n.hidden=!1):(n.value=null,n.max=null,n.hidden=!0),r.innerHTML=i)},expectedDataFileDownloads:0,totalDependencies:0,monitorRunDependencies:function(i){if(Module.totalDependencies=Math.max(Module.totalDependencies,i),Module.totalDependencies===1)return;let a=(Module.totalDependencies-i)/Module.totalDependencies;Module.setStatus(i?`Preparing... (${Module.totalDependencies-i}/${Module.totalDependencies})`:"",a)},onExit:function(i){let a=`exit with code: ${i}`;i===0?console.log(a):console.error(a)},preRun:[()=>{IS_CI&&(ENV.CI="1")}]},window.addEventListener("resize",O),O();let s=()=>{navigator.storage.persist(),canvas.removeEventListener("click",s)};canvas.addEventListener("click",s);for(let i of[...document.querySelectorAll(".panel-button[data-panel]")])i.addEventListener("click",async()=>{for(let l of document.querySelectorAll(".panel-button")){let u=document.querySelector(l.getAttribute("data-panel"));i===l?(l.classList.toggle("active"),u&&u.classList.toggle("hidden"),u&&l.getAttribute("data-panel")===".settings"&&await q()):(l.classList.remove("active"),u&&u.classList.add("hidden"))}let a=!document.querySelector(".panel-button.active");document.body.classList.toggle("canvas-focus",a),document.querySelector(".content").classList.toggle("hidden",!a),a&&(O(),document.body.scrollIntoView())});if(document.body.classList.toggle("canvas-focus",!0),await ke(),e.has("launch")){let i=await te();i.openInEditor?window.location.href=v(ZC_Constants.zquestUrl,{open:i.quest}):window.location.href=v(ZC_Constants.zeldaUrl,{open:i.quest})}}catch(r){console.error(r),document.querySelector(".content").textContent=r.toString()}}function Pe(e,t){function r(o){return getBinaryPromise().then(function(s){return WebAssembly.instantiate(s,e)}).then(function(s){return s}).then(o,function(s){err("failed to asynchronously prepare wasm: "+s),isFileURI(wasmBinaryFile)&&err("warning: Loading from a file URI ("+wasmBinaryFile+") is not supported in most browsers. See https://emscripten.org/docs/getting_started/FAQ.html#how-do-i-run-a-local-webserver-for-testing-why-does-my-program-stall-in-downloading-or-preparing"),abort(s)})}function n(o){t(o.instance,o.module)}return!wasmBinary&&typeof WebAssembly.instantiateStreaming=="function"&&!isDataURI(wasmBinaryFile)&&!isFileURI(wasmBinaryFile)&&typeof fetch=="function"?fetch(wasmBinaryFile,{credentials:"same-origin"}).then(function(o){var s=WebAssembly.instantiateStreaming(o,e);return s.then(n,function(i){return err("wasm streaming compile failed: "+i),err("falling back to ArrayBuffer instantiation"),r(n)})}):r(n)}function O(){let e=640,t=480,r=innerHeight-document.querySelector("header").clientHeight,n=Math.min(innerWidth/e,r/t);canvas.style.width=Math.floor(e*n)+"px",canvas.style.height=Math.floor(t*n)+"px"}async function ke(){let e=document.querySelector(".quest-list"),t=e.querySelector(".quest-list__entries-list"),r=e.querySelector(".quest-list__current"),n=document.querySelector(".tmpl-selected-quest"),o=await ZC.getQuestManifest(),s=Object.values(o);for(let c of s){if(!["auto",!0].includes(c.approval))continue;let d=document.createElement("div");d.classList.add("quest-list__entry"),d.setAttribute("data-quest-index",s.indexOf(c)),d.quest=c,d.append(c.name),t.append(d),d.tabIndex=-1}t.addEventListener("keyup",c=>{if(c.keyCode===38){let d=Number(c.target.previousElementSibling.getAttribute("data-quest-index")),f=s[d];i(f),c.target.previousElementSibling.focus()}else if(c.keyCode===40&&c.target.nextElementSibling){let d=Number(c.target.nextElementSibling.getAttribute("data-quest-index")),f=s[d];i(f),c.target.nextElementSibling.focus()}});function i(c){let d=`${ZC.dataOrigin}/${c.id}`;document.querySelector(".quest-list__entry.selected")?.classList.remove("selected"),document.querySelector(`.quest-list__entry[data-quest-index="${s.indexOf(c)}"]`).classList.add("selected");let f=n.content.cloneNode(!0).children[0];function m(g,h){h?f.querySelector(g).textContent=h:f.querySelector(g).parentElement.remove()}m(".name",c.name),m(".author",c.authors.map(g=>g.name).join(", ")),m(".genre",c.genre),m(".version",c.version),c.projectUrl?f.querySelector(".purezc-link").href=c.projectUrl:f.querySelector(".purezc-link").remove(),c.rating?(f.querySelector(".rating").textContent=c.rating.score,f.querySelector(".rating-votes").textContent=c.rating.distribution.reduce((g,h)=>g+h,0)):f.querySelector("._rating").remove(),c.informationHtml&&(f.querySelector(".information").innerHTML=c.informationHtml),c.descriptionHtml&&(f.querySelector(".description").innerHTML=c.descriptionHtml),c.storyHtml&&(f.querySelector(".story").innerHTML=c.storyHtml),c.tipsAndCheatsHtml&&(f.querySelector(".tips").innerHTML=c.tipsAndCheatsHtml),c.creditsHtml&&(f.querySelector(".credits").innerHTML=c.creditsHtml);function y(g){let h=document.createElement("img");h.crossOrigin="anonymous",h.src=`${d}/${g}`,f.querySelector(".current-image").innerHTML="",f.querySelector(".current-image").append(h)}let w=f.querySelector(".images");if(c.images.length>1)for(let g of c.images){let h=document.createElement("img");h.crossOrigin="anonymous",h.src=`${d}/${g}`,w.append(h),h.addEventListener("click",()=>{y(g)}),h.addEventListener("mouseover",()=>{y(g)})}c.images.length>0&&y(c.images[0]);let A=c.releases[0];for(let g of A.resources.filter(h=>h.endsWith(".qst"))){let h=`${c.id}/${A.name}/${g}`,x=S("a","play-link");x.href=v(ZC_Constants.zeldaUrl,{open:h}),x.textContent="Play!";let M=S("a");M.href=v(ZC_Constants.zquestUrl,{open:h}),M.textContent="Open in Editor";let z=S("div","link-group");f.querySelector(".links").append(z),z.append(g,x,M)}r.textContent="",r.append(f)}t.addEventListener("click",c=>{let d=c.target.closest(".quest-list__entry");if(!d)return;let f=Number(d.getAttribute("data-quest-index")),m=s[f];i(m)});for(let c of document.querySelectorAll(".quest-list__sort-option"))c.addEventListener("click",()=>{let d=c.textContent,f;d==="Name"?f=(m,y)=>m.textContent.localeCompare(y.textContent):d==="Rating"&&(f=(m,y)=>{let w=m.quest.rating?.score||0;return(y.quest.rating?.score||0)-w}),[...t.children].sort(f).forEach(m=>t.appendChild(m))});let a=new URLSearchParams(location.search).get("quest"),l=a?a.match(/(quests\/purezc\/\d+)/)?.[0]:"",u=l&&s.find(c=>c.id==l)||s.find(c=>["auto",!0].includes(c.approval));u&&i(u)}function qe(){let e=Module.cwrap("create_synthetic_key_event",null,["int","int"]),t={KEY_DOWN:10,KEY_CHAR:11,KEY_UP:12},r={B:26,A:24,Start:67,Map:75,L:1,R:19,Left:82,Right:83,Down:84,Up:85},n=(i,a)=>{if(i===-1)return r.Left;if(i===1)return r.Right;if(a===-1)return r.Down;if(a===1)return r.Up},o=(i,a)=>{i==="touchstart"&&e(t.KEY_DOWN,a),(i==="touchmove"||i==="touchstart")&&e(t.KEY_CHAR,a),i==="touchend"&&e(t.KEY_UP,a)},s=i=>{let a=i.getAttribute("data-action");if(a)return[r[a]];let l=[],u=Number(i.getAttribute("data-x")),c=Number(i.getAttribute("data-y"));return u&&l.push(n(u,0)),c&&l.push(n(0,c)),l};for(let i of document.querySelectorAll(".touch-inputs")){let a=null,l=c=>{a&&a.classList.remove("pressed"),a=c,a&&a.classList.add("pressed")},u=(c,d)=>{let f;if(c==="touchend"){if(d.targetTouches.length!==0)return;f=d.changedTouches[0]}else{if(d.targetTouches.length!==1)return;f=d.targetTouches[0]}let m=document.elementFromPoint(f.clientX,f.clientY),y=m.classList.contains("touch-input")?m:null;if(!(!y&&m.closest(".touch-inputs")===i&&c!=="touchend")){if(a&&(y!==a||!y))for(let w of s(a))o("touchend",w);if(!y){l(null);return}for(let w of s(y))o(c,w);l(c==="touchend"?null:y)}};i.addEventListener("touchstart",c=>u("touchstart",c)),i.addEventListener("touchmove",c=>u("touchmove",c)),i.addEventListener("touchend",c=>u("touchend",c)),i.addEventListener("touchcancel",c=>u("touchend",c)),i.addEventListener("contextmenu",c=>c.preventDefault())}}function _e(){let e=document.querySelector(".button--copyurl");e.classList.remove("hidden");let t=Module.cwrap("get_shareable_url","undefined",[]);e.addEventListener("click",()=>{t(),ZC.url&&navigator.clipboard.writeText(ZC.url)})}function Ae(){let e=document.querySelector(".button--open-testmode");e.classList.remove("hidden");let t=Module.cwrap("open_test_mode",null,[]);e.addEventListener("click",()=>{t()})}function I(){let e=navigator.getGamepads().some(Boolean);for(let t of[...document.querySelectorAll(".touch-inputs")])t.classList.toggle("hidden",e)}function xe(){document.querySelector("main").requestFullscreen()}Le();I();window.addEventListener("gamepadconnected",I);window.addEventListener("gamepaddisconnected",I);var _=document.createElement("button");_.textContent="Fullscreen";_.classList.add("panel-button");_.addEventListener("click",xe);document.addEventListener("DOMContentLoaded",()=>{document.querySelector(".panel-buttons").append(_)});})();
//# sourceMappingURL=main.js.map