const $=id=>document.getElementById(id);
const state={page:"home",capacity:100,minutes:30,field:"",pattern:"",region:"Bottom Left",camera:"Default",meter:"capacity",activity:{gathering:0,converting:0,travelling:0}};
function bridge(name,...args){try{const api=window.chrome?.webview?.hostObjects?.sync;if(!api||!api[name]){console.warn("AHK bridge unavailable:",name);return null;}return api[name](...args);}catch(e){console.error("NIGHTFALL bridge error",name,e);return null;}}
function call(name,...args){return bridge(name,...args);}
function setPage(page){state.page=page;document.querySelectorAll(".page").forEach(p=>p.classList.toggle("active",p.id==="page-"+page));document.querySelectorAll(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.page===page));$("field-menu").classList.remove("open");}
document.querySelectorAll(".nav-item").forEach(b=>b.addEventListener("click",()=>setPage(b.dataset.page)));
$("field-picker").addEventListener("click",()=>{$("field-menu").classList.toggle("open");});
document.addEventListener("click",e=>{if(!e.target.closest(".field-picker-wrap"))$("field-menu").classList.remove("open");});
function syncSpeed(v,commit=true){v=Math.max(0,Math.min(50,Number(v)||0));const fixed=v.toFixed(2);$("speed-slider").value=fixed;$("speed-number").value=fixed;$("speed-value").textContent=fixed;$("speed-display").textContent=fixed;if(commit)call("NightfallSetMoveSpeed",fixed);}
$("speed-slider").addEventListener("input",e=>syncSpeed(e.target.value,false));
$("speed-slider").addEventListener("change",e=>syncSpeed(e.target.value,true));
$("speed-number").addEventListener("change",e=>syncSpeed(e.target.value,true));
function bounded(id,min,max){const el=$(id);let v=Math.round(Number(el.value)||min);v=Math.max(min,Math.min(max,v));el.value=v;return v;}
function saveSettings(){const data={bees:bounded("bee-count",1,50),hive:Number($("hive-slot").value),speed:Number($("speed-number").value),capture:bounded("capture-interval",1,60)};call("NightfallSaveSettings",data.bees,data.hive,data.speed.toFixed(2),data.capture);toast("Settings saved to NIGHTFALL.ini");}
$("save-settings").addEventListener("click",saveSettings);
function loadSettings(){const raw=call("NightfallGetSettings");if(typeof raw==="string"){const p=raw.split("|");if(p.length>=4){$("bee-count").value=p[0];$("hive-slot").value=p[1];syncSpeed(p[2],false);$("capture-interval").value=p[3];if(p[4])state.capacity=Number(p[4]);if(p[5])state.minutes=Number(p[5]);setMeterVisual("capacity",state.capacity);setMeterVisual("minutes",state.minutes);}}}
function toast(msg){const feed=$("event-feed");if(feed){const row=document.createElement("div");row.className="feed-row";row.innerHTML='<i class="dot purple"></i><span></span><time>NOW</time>';row.querySelector("span").textContent=msg;feed.prepend(row);while(feed.children.length>8)feed.lastChild.remove();}}
function setEngine(status,detail){const on=status==="running";$("engine-status").classList.toggle("on",on);$("bottom-dot").classList.toggle("on",on);$("engine-label").textContent=status.toUpperCase();$("bottom-status-text").textContent=detail||status;$("session-state").textContent=status==="running"?"Running":status==="stopped"?"Stopped":"Not running";}
$("calibrate-camera").addEventListener("click",()=>{const r=call("NightfallCalibrateCamera");$("calibration-status").textContent=typeof r==="string"?r:"Calibration check requested from AHK engine.";});
$("toggle-pattern").addEventListener("click",()=>{$("pattern-editor").classList.toggle("hidden");});
function setMeterVisual(type,value){const ring=$(type+"-ring");const pct=type==="capacity"?value:value/120*100;ring.style.strokeDashoffset=452.4*(1-pct/100);if(type==="capacity"){$("capacity-value").textContent=value+"%";$("capacity-foot").textContent=value+"%";}else{$("minutes-value").textContent=value+"m";$("minutes-foot").textContent=value+" / 120 min";}}
function openMeter(type){state.meter=type;const isCap=type==="capacity";const v=isCap?state.capacity:state.minutes;$("meter-modal-title").textContent=isCap?"Capacity limit":"Gather duration";$("meter-modal-help").textContent=isCap?"Set the backpack percentage at which gathering should stop.":"Set the maximum time in the field."; $("meter-unit").textContent=isCap?"%":"MIN";$("meter-input").min=isCap?1:1;$("meter-input").max=isCap?100:120;$("meter-input").value=v;$("meter-slider").min=isCap?1:1;$("meter-slider").max=isCap?100:120;$("meter-slider").value=v;$("meter-modal").classList.remove("hidden");}
document.querySelectorAll("[data-edit-meter]").forEach(b=>b.addEventListener("click",()=>openMeter(b.dataset.editMeter)));
$("meter-slider").addEventListener("input",e=>$("meter-input").value=e.target.value);
$("meter-input").addEventListener("input",e=>$("meter-slider").value=e.target.value);
function closeMeter(){$("meter-modal").classList.add("hidden");}
$("close-meter").addEventListener("click",closeMeter);
$("meter-modal").addEventListener("click",e=>{if(e.target===$("meter-modal"))closeMeter();});
$("apply-meter").addEventListener("click",()=>{const isCap=state.meter==="capacity";const max=isCap?100:120;const v=Math.max(1,Math.min(max,Number($("meter-input").value)||1));if(isCap)state.capacity=v;else state.minutes=v;setMeterVisual(state.meter,v);closeMeter();});
function loadLines(name,render){const raw=call(name);if(typeof raw==="string"){const items=raw.split(/\r?\n/).map(s=>s.trim()).filter(Boolean);render(items);}else render([]);}
function renderFields(items){const host=$("field-options");host.replaceChildren();if(!items.length){const p=document.createElement("p");p.className="muted";p.textContent="No matching gtf- and fth- field pairs found in Paths.";host.append(p);return;}items.forEach(item=>{const b=document.createElement("button");b.className="field-option";b.textContent=item;b.addEventListener("click",()=>selectField(item));host.append(b);});}
function selectField(name){state.field=name;$("selected-field").textContent=name;$("selected-route").textContent="Route pair found in Paths folder";$("field-picker").textContent="＋";$("field-picker").title="Change field";$("field-menu").classList.remove("open");}
function renderPatterns(items){const select=$("pattern-file");select.replaceChildren();if(!items.length){const o=document.createElement("option");o.value="";o.textContent="No .ahk patterns found";select.append(o);return;}items.forEach(name=>{const o=document.createElement("option");o.value=name;o.textContent=name;select.append(o);});}
$("save-pattern").addEventListener("click",()=>{state.pattern=$("pattern-file").value;state.region=$("field-region").value;state.camera=$("camera-direction").value;$("pattern-summary").textContent=[state.pattern||"No pattern selected",state.region,state.camera+" camera"].join(" • ");$("pattern-editor").classList.add("hidden");});
$("save-gather").addEventListener("click",()=>{if(!state.field){toast("Choose a field first.");return;}call("NightfallSaveGather",state.field,state.pattern,state.region,state.camera,state.capacity,state.minutes);toast("Gather profile saved.");});
document.querySelectorAll(".legend-row").forEach(row=>row.addEventListener("mouseenter",()=>{$("activity-detail").textContent=row.dataset.activity==="gathering"?"Gathering: time spent collecting pollen in the selected field.":row.dataset.activity==="converting"?"Converting: time spent returning to and converting at the hive.":"Travelling: time spent moving between locations.";}));
$("activity-detail").textContent="Hover over a ring segment for activity details.";
document.querySelector(".outer-donut")?.addEventListener("mousemove",e=>{
 const r=e.currentTarget.getBoundingClientRect(),x=e.clientX-(r.left+r.width/2),y=e.clientY-(r.top+r.height/2);
 const deg=(Math.atan2(x,-y)*180/Math.PI+360)%360,a=state.activity,g=a.gathering,c=a.converting,t=a.travelling,total=g+c+t;
 if(!total){$("activity-detail").textContent="Activity breakdown will appear when live session metrics are available.";return;}
 const point=deg/360*total;
 $("activity-detail").textContent=point<g?"Gathering: collecting pollen in your selected field.":point<g+c?"Converting: returning to your hive and converting pollen.":"Travelling: moving between the hive, field and other locations.";
});
document.querySelector(".outer-donut")?.addEventListener("mouseleave",()=>{$("activity-detail").textContent="Hover over a ring segment for activity details.";});
function drawBuffChart(){const c=$("buff-chart"),ctx=c.getContext("2d"),dpr=window.devicePixelRatio||1,w=c.clientWidth,h=170;c.width=w*dpr;c.height=h*dpr;ctx.scale(dpr,dpr);ctx.clearRect(0,0,w,h);ctx.strokeStyle="#392a49";ctx.lineWidth=1;ctx.font="9px Segoe UI";ctx.fillStyle="#8e7d9f";for(let i=0;i<=10;i+=2){const y=12+(h-32)*(1-i/10);ctx.beginPath();ctx.moveTo(34,y);ctx.lineTo(w-8,y);ctx.stroke();ctx.fillText(String(i),9,y+3);}for(let i=0;i<=6;i++){const x=34+(w-48)*i/6;ctx.fillText(String(i*10)+"m",x-8,h-5);} }
window.addEventListener("resize",drawBuffChart);
function applyHostMessage(data){
 if(!data)return;
 if(data.type==="status"){setEngine(data.status||"idle",data.detail||"");if(data.detail)toast(data.detail);}
 if(data.type==="calibration")$("calibration-status").textContent=data.detail;
 if(data.type==="metrics"){
  if(data.honey!=null){$("honey-total").textContent=data.honey;$("metric-honey").textContent=data.honey;}
  if(data.hph!=null)$("metric-hph").textContent=data.hph;
  if(data.pollen!=null)$("metric-pollen").textContent=data.pollen+"%";
  if(data.honeyEstimate!=null)$("honey-est").textContent="Target estimate: "+data.honeyEstimate;
  if(data.activity){
   let total=0;
   for(const k of ["gathering","converting","travelling"]){const v=Number(data.activity[k]||0);state.activity[k]=v;total+=v;$(k+"-pct").textContent=v+"%";}
   if(total>0){const g=state.activity.gathering/total*100,c=(state.activity.gathering+state.activity.converting)/total*100;document.querySelector(".donut-segments").style.background="conic-gradient(#a45bff 0 "+g+"%,#ec67bf "+g+"% "+c+"%,#548aff "+c+"% 100%)";}
  }
 }
}
window.nightfallReceive=applyHostMessage;
if(window.chrome?.webview)window.chrome.webview.addEventListener("message",e=>applyHostMessage(e.data));
document.querySelectorAll("[data-action]").forEach(b=>b.addEventListener("click",()=>call(({start:"NightfallStart",stop:"NightfallStop",minimize:"NightfallMinimize",maximize:"NightfallMaximize",close:"NightfallClose"})[b.dataset.action])));
$("meter-modal").classList.add("hidden");setMeterVisual("capacity",state.capacity);setMeterVisual("minutes",state.minutes);loadSettings();loadLines("NightfallGetFields",renderFields);loadLines("NightfallGetPatterns",renderPatterns);drawBuffChart();
