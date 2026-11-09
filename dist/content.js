import{a as e,n as t}from"./assets/ocr-engine-BqyriNQV.js";import{t as n}from"./assets/engine-DGxM6F8E.js";function r(e,t){if(document.getElementById(`matiks-capture-overlay`))return;let n=document.createElement(`div`);n.id=`matiks-capture-overlay`,Object.assign(n.style,{position:`fixed`,top:`0`,left:`0`,width:`100vw`,height:`100vh`,backgroundColor:`rgba(10, 15, 26, 0.45)`,zIndex:`2147483647`,cursor:`crosshair`,userSelect:`none`});let r=document.createElement(`div`);r.textContent=`Matiks Companion: Drag to select arithmetic question · Press ESC to cancel`,Object.assign(r.style,{position:`absolute`,top:`20px`,left:`50%`,transform:`translateX(-50%)`,padding:`8px 18px`,background:`#0f172a`,color:`#93c5fd`,border:`1px solid #3b82f6`,borderRadius:`20px`,fontFamily:`Inter, sans-serif`,fontSize:`13px`,fontWeight:`600`,boxShadow:`0 4px 14px rgba(0,0,0,0.4)`,pointerEvents:`none`}),n.appendChild(r);let i=document.createElement(`div`);Object.assign(i.style,{position:`absolute`,border:`2px solid #3b82f6`,backgroundColor:`rgba(59, 130, 246, 0.15)`,display:`none`,pointerEvents:`none`}),n.appendChild(i);let a=0,o=0,s=!1;function c(e){s=!0,a=e.clientX,o=e.clientY,i.style.left=`${a}px`,i.style.top=`${o}px`,i.style.width=`0px`,i.style.height=`0px`,i.style.display=`block`}function l(e){if(!s)return;let t=e.clientX,n=e.clientY,r=Math.min(a,t),c=Math.min(o,n),l=Math.abs(t-a),u=Math.abs(n-o);i.style.left=`${r}px`,i.style.top=`${c}px`,i.style.width=`${l}px`,i.style.height=`${u}px`}function u(){window.removeEventListener(`keydown`,f),n.parentNode&&n.parentNode.removeChild(n)}function d(n){if(!s)return;s=!1;let r=parseInt(i.style.left,10),a=parseInt(i.style.top,10),o=parseInt(i.style.width,10),c=parseInt(i.style.height,10);if(u(),o>20&&c>15){let t=window.devicePixelRatio||1;e({x:Math.round(r*t),y:Math.round(a*t),width:Math.round(o*t),height:Math.round(c*t)})}else t&&t()}function f(e){e.key===`Escape`&&(u(),t&&t())}n.addEventListener(`mousedown`,c),window.addEventListener(`mousemove`,l),window.addEventListener(`mouseup`,d),window.addEventListener(`keydown`,f),document.body.appendChild(n)}async function i(e,t){return new Promise((n,r)=>{let i=new Image;i.onload=()=>{let e=document.createElement(`canvas`);e.width=t.width,e.height=t.height,e.getContext(`2d`).drawImage(i,t.x,t.y,t.width,t.height,0,0,t.width,t.height),e.toBlob(t=>{t?n({blob:t,dataUrl:e.toDataURL(`image/png`)}):r(Error(`Crop conversion failed`))},`image/png`)},i.onerror=()=>r(Error(`Failed to load full screenshot for cropping`)),i.src=e})}function a({expression:e,answer:t,ambiguous:n,conflicts:r,onDismiss:i}){let a=`matiks-companion-root`,o=document.getElementById(a);o||(o=document.createElement(`div`),o.id=a,document.body.appendChild(o));let s=o.attachShadow?o.shadowRoot||o.attachShadow({mode:`open`}):o;s.innerHTML=``;let c=document.createElement(`style`);c.textContent=`
    .badge-card {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 320px;
      background: #0f172a;
      border: 1px solid #1e293b;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.6), 0 8px 10px -6px rgba(0, 0, 0, 0.6);
      border-radius: 14px;
      color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      padding: 18px;
      z-index: 2147483647;
      animation: slideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes slideIn {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      border-bottom: 1px solid #1e293b;
      padding-bottom: 8px;
    }
    .title {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1.2px;
      color: #60a5fa;
      font-weight: 700;
    }
    .close {
      cursor: pointer;
      color: #94a3b8;
      background: none;
      border: none;
      font-size: 18px;
      line-height: 1;
      padding: 0 4px;
    }
    .close:hover { color: #f8fafc; }
    .expr {
      font-size: 14px;
      color: #94a3b8;
      margin-bottom: 6px;
      font-family: "SFMono-Regular", Consolas, monospace;
    }
    .answer-val {
      font-size: 28px;
      font-weight: 800;
      color: #4ade80;
      margin-bottom: 10px;
    }
    .ambiguous-alert {
      background: rgba(234, 179, 8, 0.15);
      border: 1px solid #eab308;
      color: #fef08a;
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 12px;
      margin-top: 8px;
    }
  `,s.appendChild(c);let l=document.createElement(`div`);l.className=`badge-card`,l.innerHTML=`
    <div class="header">
      <span class="title">Matiks Companion</span>
      <button class="close">&times;</button>
    </div>
    <div class="expr">${e||`Unknown Expression`}</div>
    ${n?`<div class="ambiguous-alert">
             ⚠️ Ambiguity detected (${r?.[0]?.description||`Conflicting digits`}). Please verify manually.
           </div>`:`<div class="answer-val">${t??`--`}</div>`}
  `,l.querySelector(`.close`).onclick=()=>{o.parentNode&&o.parentNode.removeChild(o),i&&i()},s.appendChild(l)}chrome.runtime.onMessage.addListener((o,s,c)=>{if(o.action===`TRIGGER_CAPTURE`)return r(async r=>{chrome.runtime.sendMessage({type:`CAPTURE_VISIBLE_TAB`},async o=>{if(!o||!o.success)console.error(`Tab capture failed:`,o?.error);else try{let s=await i(o.dataUrl,r),c=await e(s.blob),l=await t(c),u=null;if(l.expression)try{u=n(l.expression).answer}catch(e){console.warn(`Solve failed:`,e.message)}a({expression:l.expression||l.candidateExpression,answer:u,ambiguous:l.ambiguous,conflicts:l.conflictReport?.conflicts})}catch(e){console.error(`OCR Pipeline failed on capture:`,e)}})},()=>{console.log(`Capture canceled`)}),c({status:`Selection initiated`}),!0});