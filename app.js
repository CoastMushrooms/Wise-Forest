const COOLDOWN_MS = 2500;
const CYCLE = 12;
const VOLUME = 0.75;
const SYSTEM = `You are the Tree of Wisdom, a warm, ancient tree guiding students through college and their careers. Act like a capable general assistant: answer broad questions from your knowledge, and when the student gets specific (a particular program, internship, club, deadline, requirement, salary, tool), use web search to find current, real details and link to them. Tailor advice to what the student has told you: year, major, interests, goals. If they don't know what they want, ask one or two gentle questions to discover it. Suggest things to study, explore and research. IMPORTANT: only discuss visas, CPT, OPT, or work authorization if the student says they are international or asks about it; if they do, keep those rules in mind and tell them to confirm with their school's international office. Never mention it otherwise. Keep replies under 200 words, use short bullets and **bold** sparingly, and speak with light forest warmth.`;

const $ = id => document.getElementById(id), NS = "http://www.w3.org/2000/svg", rnd = (a, b) => a + Math.random() * (b - a);
const el = (n, a = {}, p) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); p && p.appendChild(e); return e; };
const esc = s => s.replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
const md = s => esc(s).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/\[(.+?)\]\((https?:[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>').replace(/^\s*[*-] /gm, "• ").replace(/\n/g, "<br>");

const te = new TextEncoder(), td = new TextDecoder();
const b64 = u => { let s = ""; new Uint8Array(u).forEach(b => s += String.fromCharCode(b)); return btoa(s); };
const unb64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
const deriveKey = async (pw, salt) => crypto.subtle.deriveKey({ name: "PBKDF2", salt, iterations: 250000, hash: "SHA-256" },
  await crypto.subtle.importKey("raw", te.encode(pw), "PBKDF2", false, ["deriveKey"]), { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
let KEY = null, SALT = null, UK = null, state = { milestones: [], history: [], color: "#ffd54a", name: "" };
async function seal() {
  if (!KEY) return;
  const iv = crypto.getRandomValues(new Uint8Array(12)), snap = { ...state, history: state.history.slice(-40) };
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, KEY, te.encode(JSON.stringify(snap)));
  localStorage.setItem(UK, JSON.stringify({ salt: b64(SALT), iv: b64(iv), data: b64(ct) }));
}
const persist = () => seal().catch(console.error);
async function createAccount(user, pw, color) {
  UK = "tw_user_" + user.toLowerCase();
  if (localStorage.getItem(UK)) throw new Error("That name is already taken.");
  SALT = crypto.getRandomValues(new Uint8Array(16)); KEY = await deriveKey(pw, SALT);
  state = { milestones: [], history: [], color, name: user }; await seal();
}
async function login(user, pw) {
  UK = "tw_user_" + user.toLowerCase();
  const raw = localStorage.getItem(UK); if (!raw) throw new Error("No account with that name. Try Create account.");
  const o = JSON.parse(raw); SALT = unb64(o.salt); KEY = await deriveKey(pw, SALT);
  try { state = JSON.parse(td.decode(await crypto.subtle.decrypt({ name: "AES-GCM", iv: unb64(o.iv) }, KEY, unb64(o.data)))); }
  catch { KEY = null; throw new Error("Wrong password."); }
}

const svg=$("scene"),G=id=>el("g",{id},svg);
const sky=G("sky"),fair=G("fair"),hills=G("hills"),tree=G("tree"),roadG=G("roadG"),ground=G("ground"),limbs=G("limbs"),canopy=G("canopy"),signs=G("signs"),fx=G("fx");
[fair,ground,limbs,canopy].forEach(g=>g.style.pointerEvents="none");
const LEAF="M0 0 C6 -9 16 -9 22 0 C16 9 6 9 0 0Z",greens=["#1d5b4a","#2a7a5a","#164a3c","#3a9a6a","#0f3a30"];

el("rect",{width:600,height:800,fill:"url(#sky)"},sky);
for(let i=0;i<95;i++)el("circle",{cx:rnd(0,600),cy:rnd(0,380),r:rnd(.4,1.4),fill:"#fff8e0",class:"star",style:`animation-delay:${rnd(0,3)}s`},sky);
for(let i=0;i<7;i++)el("path",{d:"M0-6V6M-6 0H6",stroke:"#fff3c4","stroke-width":.8,transform:`translate(${rnd(20,580)},${rnd(10,260)})`,class:"star",style:`animation-delay:${rnd(0,3)}s`},sky);
el("circle",{cx:440,cy:115,r:130,fill:"url(#moon)"},sky);el("circle",{cx:440,cy:115,r:34,fill:"#fff9dc"},sky);
[[430,105,7],[452,126,5],[444,98,3.5]].forEach(([x,y,r])=>el("circle",{cx:x,cy:y,r,fill:"#e6dcae",opacity:.55},sky));

const fairies=Array.from({length:30},()=>{const g=el("g",{},fair);el("circle",{r:6,fill:"#cfe8ff",opacity:.15},g);el("circle",{r:1.6,fill:"#fff"},g);return{g,x:rnd(0,600),y:rnd(20,330),p:rnd(0,6.3),s:rnd(.6,1.4)}});
(function wind(t){t/=1000;fairies.forEach(f=>{f.x+=.18*f.s*(1+Math.sin(t*.4+f.y*.012));if(f.x>640)f.x=-40;f.g.setAttribute("transform",`translate(${f.x},${f.y+Math.sin(t*.7+f.x*.018+f.p)*16})`);f.g.style.opacity=.12+.3*Math.max(0,Math.sin(t*1.3*f.s+f.p))});requestAnimationFrame(wind)})(0);

const pine=(x,y,h,f)=>el("path",{d:`M${x} ${y-h}L${x+h*.28} ${y-h*.35}L${x+h*.14} ${y-h*.35}L${x+h*.36} ${y}L${x-h*.36} ${y}L${x-h*.14} ${y-h*.35}L${x-h*.28} ${y-h*.35}Z`,fill:f},hills);
[["M0 330 Q150 270 300 310 T600 290 V800H0Z","#1a2550","#121b40",305],["M0 430 Q200 370 400 420 T600 400 V800H0Z","#111a3c","#0b1232",408],["M0 560 Q220 500 420 550 T600 530 V800H0Z","#0b2a2e","",0]].forEach(([d,f,pf,b])=>{el("path",{d,fill:f},hills);if(b)for(let x=-10;x<620;x+=rnd(12,24))pine(x,b+rnd(-4,12),rnd(26,52),pf)});
[[420,360],[200,500]].forEach(([x,y],i)=>el("ellipse",{cx:x,cy:y,rx:240,ry:36,fill:"#b9c8ff",opacity:.1,filter:"url(#blur)",class:"mist",style:`animation-duration:${80+i*25}s`},hills));

const trunk=el("g",{filter:"url(#rough)"},tree);
el("path",{d:"M30 800 C80 730 60 650 80 560 C95 480 70 400 88 330 C98 280 92 240 108 196 L152 206 C150 262 160 300 150 360 C145 430 172 500 162 570 C152 650 200 730 230 800Z",fill:"url(#bark)"},trunk);
const LEFT=[[30,800,80,730,60,650,80,560],[80,560,95,480,70,400,88,330],[88,330,98,280,92,240,108,196]];
const RIGHT=[[230,800,200,730,152,650,162,570],[162,570,172,500,145,430,150,360],[150,360,160,300,150,262,152,206]];
const groove=f=>LEFT.map((a,i)=>{const b=RIGHT[i],q=a.map((v,k)=>(v+(b[k]-v)*f).toFixed(1));return(i?"":`M${q[0]} ${q[1]} `)+`C${q[2]} ${q[3]} ${q[4]} ${q[5]} ${q[6]} ${q[7]}`}).join(" ");
const grooves=el("g",{fill:"none","stroke-linecap":"round"},trunk);
for(let i=0;i<16;i++)el("path",{d:groove(.07+i*.057+rnd(-.012,.012)),stroke:"#1a0f06","stroke-width":rnd(1.2,2.4),opacity:rnd(.3,.5)},grooves);
for(let i=0;i<9;i++)el("path",{d:groove(.1+i*.1+rnd(-.02,.02)),stroke:"#9b6a36","stroke-width":1,opacity:.22},grooves);
el("path",{d:"M104 470 Q120 420 138 470 Q135 520 120 524 Q106 520 104 470Z",fill:"#120a04"},tree);
[[112,470],[130,470]].forEach(([x,y])=>el("path",{d:`M${x-5} ${y} Q${x} ${y-6} ${x+5} ${y} Q${x} ${y+5} ${x-5} ${y}Z`,fill:"#ffe9a8",filter:"url(#glow)",class:"eye"},tree));

const ROAD="M-80 870 C40 800 170 800 260 745 C360 690 470 690 500 610 C530 530 380 500 420 420 C455 350 540 350 525 260 C515 200 555 175 575 125";
const rp=el("path",{d:ROAD,fill:"none"},roadG),LEN=rp.getTotalLength(),N=70,rows=[];
el("path",{d:ROAD,stroke:"#ffd54a","stroke-width":70,opacity:.08,fill:"none",filter:"url(#blur)"},roadG);
const wd=t=>60*Math.pow(1-t,1.1)+5;
const P=(s,o)=>{const p=rp.getPointAtLength(s),q=rp.getPointAtLength(s+1),m=Math.hypot(q.x-p.x,q.y-p.y)||1,w=wd(s/LEN);return[p.x-(q.y-p.y)/m*o*w,p.y+(q.x-p.x)/m*o*w]};
const S=u=>LEN*.97*(1-Math.pow(1-u,2));
for(let i=0;i<N;i++){
  const s0=S(i/N),s1=S((i+.92)/N),offs=i%2?[-.5,0,.5]:[-.5,-.17,.17,.5],r={s:s1,els:[]};
  for(let k=0;k<offs.length-1;k++){
    const pts=[P(s0,offs[k]+.01),P(s0,offs[k+1]-.01),P(s1,offs[k+1]-.01),P(s1,offs[k]+.01)];
    r.els.push(el("polygon",{points:pts.map(p=>p.join(",")).join(" "),class:"brick",style:`opacity:${(1-i/N*.8)*rnd(.8,1)}`},roadG));
  }
  rows.push(r);
}
const hit=el("path",{d:ROAD,stroke:"transparent","stroke-width":80,fill:"none"},roadG);
const setLit=s=>rows.forEach(r=>r.els.forEach(e=>e.classList.toggle("lit",r.s<=s)));
const sAt=n=>LEN*(.1+.8*((n%CYCLE)/(CYCLE-1)));

const shroom=(x,y,s,c)=>{const g=el("g",{transform:`translate(${x},${y}) scale(${s})`},ground);
  el("ellipse",{cx:0,cy:2,rx:16,ry:5,fill:c,opacity:.2,filter:"url(#glow)",class:"pulse"},g);
  el("path",{d:"M-2.5 0C-3 -8 -2 -12 0 -14C2 -12 3 -8 2.5 0Z",fill:"#efe6d2"},g);
  el("path",{d:"M-13 -12C-13 -26 13 -26 13 -12C6 -15 -6 -15 -13 -12Z",fill:c},g);
  [[-6,-19,2],[3,-21,2.4],[8,-17,1.6]].forEach(([a,b,r])=>el("circle",{cx:a,cy:b,r,fill:"#fff7e0",opacity:.9},g));};
[[248,716,1.1,"#e0568f"],[272,724,.7,"#9b6bff"],[205,740,.8,"#4fd1c5"],[24,652,1,"#e0568f"],[44,664,.65,"#4fd1c5"],[410,775,1.2,"#9b6bff"],[438,786,.8,"#e0568f"],[470,768,.6,"#4fd1c5"],[560,540,1,"#e0568f"],[540,552,.6,"#9b6bff"]].forEach(a=>shroom(...a));

const leafAlong=(p,gap,sc=1)=>{const L=p.getTotalLength();for(let s=L*.1;s<L;s+=gap){const q=p.getPointAtLength(s),g=el("g",{transform:`translate(${q.x},${q.y}) rotate(${rnd(0,360)}) scale(${rnd(.8,1.5)*sc})`},canopy);
  el("path",{d:LEAF,fill:Math.random()<.07?"#d9a3ff":greens[(Math.random()*5)|0],opacity:rnd(.8,1),class:"lf",style:`animation-delay:${rnd(-8,0)}s`},g)}};
const vine=(x,y,n)=>{const g=el("g",{class:"vine",style:`animation-delay:${rnd(-6,0)}s`},canopy);let d=`M${x} ${y}`;const pts=[];
  for(let i=1;i<=n;i++){const px=x+Math.sin(i*.9+x)*5,py=y+i*9;d+=`L${px.toFixed(1)} ${py}`;pts.push([px,py])}
  el("path",{d,stroke:"#1f6a4a","stroke-width":1.8,fill:"none","stroke-linejoin":"round"},g);
  pts.forEach(([px,py],i)=>{if(i%2)el("path",{d:LEAF,fill:greens[i%5],transform:`translate(${px},${py}) rotate(${i%4<2?20:160}) scale(.6)`},g)})};
const limb=(d,w,gap,vs)=>{const g=el("g",{},limbs),o={fill:"none","stroke-linecap":"round"};
  const base=el("path",{...o,d,stroke:"#3d2412","stroke-width":w,filter:"url(#rough)"},g);
  el("path",{...o,d,stroke:"#6b4426","stroke-width":w*.55,"stroke-dasharray":"14 3 6 5",opacity:.7},g);
  el("path",{...o,d,stroke:"#1a0e05","stroke-width":1.6,"stroke-dasharray":"22 7 5 11",opacity:.6,transform:`translate(0 ${-w*.18})`},g);
  el("path",{...o,d,stroke:"#a57a45","stroke-width":1.2,"stroke-dasharray":"9 14",opacity:.35,transform:`translate(0 ${w*.2})`},g);
  leafAlong(base,gap);const L=base.getTotalLength();vs.forEach(f=>{const q=base.getPointAtLength(L*f);vine(q.x,q.y,5+((Math.random()*6)|0))});return base};

["M138 270 C90 240 40 225 -10 190","M150 235 C230 190 330 175 420 120","M95 430 C60 410 30 395 -10 370","M150 300 C240 290 320 330 370 318"].forEach(d=>limb(d,20,12,[.5,.8]));
["M92 690 C150 670 175 640 120 600 C70 565 150 540 150 500","M95 380 C140 360 160 330 112 300 C80 280 120 250 130 230"].forEach(d=>{const v=el("path",{d,stroke:"#1f6a4a","stroke-width":3,fill:"none","stroke-linecap":"round"},canopy);leafAlong(v,15,.8)});

const BR=[
  {t:"College",l:"🎓 College & Major",d:"M158 600 C230 610 270 585 305 548",x:305,y:548},
  {t:"Career",l:"💼 Career",d:"M152 470 C230 470 270 430 322 395",x:322,y:395},
  {t:"Opportunities",l:"🌟 Opportunities",d:"M148 350 C220 330 270 285 318 245",x:318,y:245},
  {t:"Explore",l:"🧭 Not sure yet",d:"M165 690 C235 695 270 672 300 632",x:300,y:632}];
const CHIPS={
  College:["Help me choose a major","Suggest minors for me","What can I do with a CS degree?"],
  Career:["Review my resume","Mock interview me","What career suits me?","Find internships"],
  Opportunities:["Clubs for my interests","Volunteer ideas","How do I join research?","On-campus jobs"],
  Explore:["I don't know what I like","Ask me questions to find my path"]};
BR.forEach(b=>{
  b.path=limb(b.d,26,13,[.5,.8]);b.path.classList.add("bp");
  const g=el("g",{class:"br",transform:`translate(${b.x},${b.y})`},signs),s=el("g",{class:"sign"},g);
  el("path",{d:"M-40 0L-40 12M40 0L40 12",stroke:"#b98b52","stroke-width":2},s);
  el("rect",{x:-78,y:10,width:156,height:38,rx:12},s);
  el("text",{"text-anchor":"middle",y:35},s).textContent=b.l;
  g.onclick=()=>pickBranch(b);
});
for(let i=0;i<380;i++){const a=rnd(0,6.28),r=Math.sqrt(Math.random()),x=120+Math.cos(a)*r*210,y=135+Math.sin(a)*r*125,g=el("g",{transform:`translate(${x},${y}) rotate(${rnd(0,360)}) scale(${rnd(.8,1.6)})`},canopy);
  el("path",{d:LEAF,fill:greens[i%5],opacity:rnd(.75,1),class:"lf",style:`animation-delay:${rnd(-8,0)}s`},g)}
for(let i=0;i<14;i++)el("circle",{cx:rnd(10,260),cy:rnd(40,230),r:rnd(2,3.5),fill:"#f0b3ff",filter:"url(#glow)",class:"pulse",style:`animation-delay:${rnd(0,2.6)}s`},canopy);

function makeAvatar(p) {
  const g = el("g", {}, p), f = el("g", { class: "bob" }, g);
  el("ellipse", { cx: -2, cy: 0, rx: 8, ry: 2.2, fill: "#000", opacity: .3 }, g);
  el("circle", { cx: -6, cy: -24, r: 13, style: "fill:var(--hood)", filter: "url(#glow)", class: "halo" }, f);
  [[-38, 0], [-16, -.11]].forEach(([r, d]) => { const w = el("g", { transform: `rotate(${r} 0 -26)` }, f);
    el("ellipse", { cx: 0, cy: -32, rx: 3.2, ry: 6.5, fill: "#eaf7ff", opacity: .5, stroke: "#fff", "stroke-width": .4, class: "wing", style: `animation-delay:${d}s` }, w); });
  el("path", { d: "M0 -21.5 l-1 4 M2.5 -21.5 l0 4 M5 -21.5 l1.5 3.5", stroke: "#2b1a0c", "stroke-width": .9, fill: "none", "stroke-linecap": "round" }, f);
  el("ellipse", { cx: -5.5, cy: -24, rx: 6.5, ry: 4.6, style: "fill:var(--hood)", filter: "url(#glow)", class: "pulse" }, f);
  el("ellipse", { cx: -6, cy: -24, rx: 3.5, ry: 2.4, fill: "#fffbe0", opacity: .85, class: "pulse" }, f);
  el("ellipse", { cx: 1.5, cy: -24.5, rx: 4.2, ry: 3.4, fill: "#4a2f1b" }, f);
  el("circle", { cx: 7.2, cy: -25, r: 2.6, fill: "#2b1a0c" }, f);
  el("path", { d: "M8.5 -27 Q11 -31 14 -31 M7.5 -27.5 Q8 -32 11 -34", stroke: "#ffe9a8", "stroke-width": .8, fill: "none", "stroke-linecap": "round" }, f);
  return g;
}
const walker = makeAvatar(roadG);
walker.style.transition = "opacity 1.2s ease";
let cur = 0, anim;
function place(s) { const p = rp.getPointAtLength(s), sc = 2 * (1 - s / LEN * .7); walker.setAttribute("transform", `translate(${p.x},${p.y}) scale(${sc})`); setLit(s); cur = s; }
function walkTo(target) {
  cancelAnimationFrame(anim); const from = cur, t0 = performance.now(), dur = 4200;
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  (function f(now) { const t = Math.min(1, (now - t0) / dur); place(from + (target - from) * ease(t)); if (t < 1) anim = requestAnimationFrame(f); })(t0);
}

const tip = $("tip"), lan = el("g", {}, roadG);
function showTip(ev, html) { const r = $("stage").getBoundingClientRect(); tip.innerHTML = html; tip.style.left = Math.min(ev.clientX - r.left + 14, r.width - 240) + "px"; tip.style.top = ev.clientY - r.top + 14 + "px"; tip.style.opacity = 1; }
const hide = () => tip.style.opacity = 0;
function drawLanterns() {
  lan.innerHTML = ""; const n = state.milestones.length, lap = Math.floor(n / CYCLE) * CYCLE;
  for (let i = lap; i < n - 1; i++) {
    const m = state.milestones[i], s = sAt(i - lap + 1), p = P(s, .75), sc = 1.4 * (1 - s / LEN * .7), g = el("g", { transform: `translate(${p[0]},${p[1]}) scale(${sc})`, style: "cursor:pointer" }, lan);
    el("path", { d: "M0 -26 V-12 M-5 -12 h10 l2 4 v9 l-2 4 h-10 l-2 -4 v-9z", fill: "#ffd54a", stroke: "#8a6a10", "stroke-width": 1, filter: "url(#glow)" }, g);
    g.onmousemove = ev => showTip(ev, `<b>Step ${i + 1}</b><br>${esc(m.label)}<br><small>${new Date(m.time).toLocaleDateString()}</small>`);
    g.onmouseleave = hide;
  }
}
const history3 = () => state.milestones.slice(-3).map(m => "• " + esc(m.label)).join("<br>") || "Your journey begins here.";
hit.onmousemove = ev => showTip(ev, `🛤️ You've walked <b>${state.milestones.length}</b> steps<br>${history3()}<br><small>It never ends, because growing never does.</small>`);
hit.onmouseleave = hide;
walker.onmousemove = hit.onmousemove; walker.onmouseleave = hide;
function addMilestone(label) {
  state.milestones.push({ label, time: Date.now() }); persist();
  if (state.milestones.length % CYCLE === 0) {
    cancelAnimationFrame(anim); walker.style.opacity = 0;
    setTimeout(() => { place(sAt(0)); drawLanterns(); walker.style.opacity = 1; }, 1300);
  } else { drawLanterns(); walkTo(sAt(state.milestones.length)); }
}
function petals(x, y) {
  for (let i = 0; i < 14; i++) { const g = el("g", { transform: `translate(${x + rnd(-40, 40)},${y + rnd(-10, 10)})` }, fx);
    el("path", { d: "M0 0 C4 -6 10 -6 14 0 C10 6 4 6 0 0Z", fill: greens[i % 5], class: "pt", style: `--dx:${rnd(-50, 50)}px;animation-delay:${rnd(0, 1)}s` }, g); setTimeout(() => g.remove(), 6500); }
}

let pending = null, busy = false;
function say(text, who, html) { const d = document.createElement("div"); d.className = "msg " + who; d.innerHTML = html || (who === "tree" ? md(text) : esc(text)); $("log").appendChild(d); $("log").scrollTop = 1e9; return d; }
function typeOut(node, reply, extra) {
  return new Promise(res => {
    const w = reply.split(/(\s+)/); let i = 0;
    const t = setInterval(() => { i += 2; node.innerHTML = md(w.slice(0, i).join("")); $("log").scrollTop = 1e9;
      if (i >= w.length) { clearInterval(t); node.innerHTML = md(reply) + extra; res(); } }, 55);
  });
}
async function ask(text) {
  if (busy) return; busy = true; $("sendBtn").disabled = true;
  state.history.push({ role: "user", content: text });
  const w = say("", "tree", '<span class="dots"><i></i><i></i><i></i></span>');
  try {
    const body = { messages: [{ role: "system", content: SYSTEM + `\nThe student's name is ${state.name}.` }, ...state.history.slice(-20)] };
    const r = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const j = await r.json(); if (!r.ok || j.error) throw new Error(j.error?.message || r.status);
    const m = j.choices[0].message, reply = m.content || "";
    if (!reply) throw new Error("Empty reply");
    const seen = new Set(), srcs = (m.annotations || []).filter(a => a.type === "url_citation").map(a => a.url_citation).filter(c => c && !seen.has(c.url) && seen.add(c.url)).slice(0, 5);
    const extra = srcs.length ? `<div class="src">${srcs.map(s => `<a href="${s.url}" target="_blank" rel="noopener">🔎 ${esc(s.title || new URL(s.url).hostname)}</a>`).join("")}</div>` : "";
    state.history.push({ role: "assistant", content: reply });
    await typeOut(w, reply, extra);
    addMilestone(pending || text.slice(0, 40)); pending = null;
  } catch (e) {
    state.history.pop();
    w.innerHTML = md(`🍂 The wind carried my words away (${e.message}). Check your .env keys and terminal output. That didn't count as a step.`);
  }
  setTimeout(() => { busy = false; $("sendBtn").disabled = false; }, COOLDOWN_MS);
}
$("form").onsubmit = e => { e.preventDefault(); const t = $("input").value.trim(); if (!t || busy) return; $("input").value = ""; say(t, "me"); ask(t); };
function pickBranch(b) {
  BR.forEach(x => x.path.classList.toggle("active", x === b)); document.querySelectorAll(".br").forEach((g, i) => g.classList.toggle("active", BR[i] === b));
  petals(b.x, b.y);
  pending = b.l.replace(/^\S+ /, "");
  say(`🌿 Let's follow the ${b.t} branch together. Tell me a bit about yourself, or tap a thought below.`, "tree");
  $("chips").innerHTML = ""; CHIPS[b.t].forEach(c => { const x = document.createElement("button"); x.textContent = c; x.onclick = () => { if (busy) return; say(c, "me"); ask(c + " (" + b.t + ")"); }; $("chips").appendChild(x); });
}

$("saveBtn").onclick = () => { persist(); say("💾 Your journey is saved to your account.", "tree"); };
$("outBtn").onclick = async () => { await seal(); location.reload(); };
$("bye").onclick = () => { say("🍃 Go gently, traveler. The road doesn't end here, it only bends out of sight. I'll let go of this branch now. Good luck, and come back whenever you're ready.", "tree"); addMilestone("Said goodbye (for now)"); BR.forEach(b => b.path.style.opacity = .4); };

const music = new Audio("SoothingSounds.mp3");
music.loop = true; music.volume = 0;
let on = false, fade;
function fadeTo(v, done) {
  clearInterval(fade);
  fade = setInterval(() => {
    const d = v - music.volume;
    if (Math.abs(d) < .02) { music.volume = v; clearInterval(fade); done && done(); }
    else music.volume = Math.max(0, Math.min(1, music.volume + Math.sign(d) * .02));
  }, 60);
}
$("soundBtn").onclick = async () => {
  if (!on) {
    try { await music.play(); fadeTo(VOLUME); on = true; }
    catch (e) { console.error(e); say("🍂 I couldn't play the forest sounds. Check that SoothingSounds.mp3 is next to server.js.", "tree"); return; }
  } else { on = false; fadeTo(0, () => music.pause()); }
  $("soundBtn").textContent = (on ? "🔊" : "🔇") + " Forest sounds";
};

function begin() {
  svg.style.setProperty("--hood", state.color || "#ffd54a");
  drawLanterns(); place(sAt(state.milestones.length));
  $("gate").classList.add("out");
  say(state.milestones.length
    ? `🌳 Welcome back, ${state.name}. You've walked ${state.milestones.length} steps. Tell me what has happened since we last spoke, and I'll offer a branch to continue.`
    : `🌳 Ahh, a traveler arrives. Welcome, ${state.name}. I am the Tree of Wisdom. This golden road is your journey, and it has no end, for learning never does.\n\nAsk me anything about college, majors, careers, internships, clubs or research, and I'll look things up as we go. Tap a branch, or just tell me about yourself.`, "tree");
}
const gate = async mode => {
  const u = $("u").value.trim(), p = $("p").value; $("gerr").textContent = "";
  try {
    if (!u || p.length < 6) throw new Error("Enter a username and a password of 6+ characters.");
    if (!crypto.subtle) throw new Error("Encryption needs https or localhost.");
    mode === "new" ? await createAccount(u, p, $("c").value) : await login(u, p);
    begin();
  } catch (e) { $("gerr").textContent = e.message; }
};
$("gateForm").onsubmit = e => { e.preventDefault(); gate("login"); };
$("signBtn").onclick = () => gate("new");
svg.style.setProperty("--hood", "#ffd54a"); place(sAt(0));