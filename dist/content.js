(function(){var e=Object.defineProperty,t=Object.getOwnPropertyDescriptor,n=Object.getOwnPropertyNames,r=Object.prototype.hasOwnProperty,i=(e,t,n)=>()=>{if(n)throw n[0];try{return e&&(t=e(e=0)),t}catch(e){throw n=[e],e}},a=(e,t)=>()=>(t||(e((t={exports:{}}).exports,t,t.exports),e=null),t.exports),o=(t,n)=>{let r={};for(var i in t)e(r,i,{get:t[i],enumerable:!0});return n||e(r,Symbol.toStringTag,{value:`Module`}),r},s=(i,a,o,s)=>{if(a&&typeof a==`object`||typeof a==`function`)for(var c=n(a),l=0,u=c.length,d;l<u;l++)d=c[l],!r.call(i,d)&&d!==o&&e(i,d,{get:(e=>a[e]).bind(null,d),enumerable:!(s=t(a,d))||s.enumerable});return i},c=t=>r.call(t,`module.exports`)?t[`module.exports`]:s(e({},`__esModule`,{value:!0}),t);function l(e,t){if(document.getElementById(`matiks-capture-overlay`))return;let n=document.createElement(`div`);n.id=`matiks-capture-overlay`,Object.assign(n.style,{position:`fixed`,top:`0`,left:`0`,width:`100vw`,height:`100vh`,backgroundColor:`rgba(10, 15, 26, 0.45)`,zIndex:`2147483647`,cursor:`crosshair`,userSelect:`none`});let r=document.createElement(`div`);r.textContent=`Matiks Companion: Drag to select arithmetic question · Press ESC to cancel`,Object.assign(r.style,{position:`absolute`,top:`20px`,left:`50%`,transform:`translateX(-50%)`,padding:`8px 18px`,background:`#0f172a`,color:`#93c5fd`,border:`1px solid #3b82f6`,borderRadius:`20px`,fontFamily:`Inter, sans-serif`,fontSize:`13px`,fontWeight:`600`,boxShadow:`0 4px 14px rgba(0,0,0,0.4)`,pointerEvents:`none`}),n.appendChild(r);let i=document.createElement(`div`);Object.assign(i.style,{position:`absolute`,border:`2px solid #3b82f6`,backgroundColor:`rgba(59, 130, 246, 0.15)`,display:`none`,pointerEvents:`none`}),n.appendChild(i);let a=0,o=0,s=!1;function c(e){s=!0,a=e.clientX,o=e.clientY,i.style.left=`${a}px`,i.style.top=`${o}px`,i.style.width=`0px`,i.style.height=`0px`,i.style.display=`block`}function l(e){if(!s)return;let t=e.clientX,n=e.clientY,r=Math.min(a,t),c=Math.min(o,n),l=Math.abs(t-a),u=Math.abs(n-o);i.style.left=`${r}px`,i.style.top=`${c}px`,i.style.width=`${l}px`,i.style.height=`${u}px`}function u(){window.removeEventListener(`keydown`,f),n.parentNode&&n.parentNode.removeChild(n)}function d(n){if(!s)return;s=!1;let r=parseInt(i.style.left,10),a=parseInt(i.style.top,10),o=parseInt(i.style.width,10),c=parseInt(i.style.height,10);if(u(),o>20&&c>15){let t=window.devicePixelRatio||1;e({x:Math.round(r*t),y:Math.round(a*t),width:Math.round(o*t),height:Math.round(c*t)})}else t&&t()}function f(e){e.key===`Escape`&&(u(),t&&t())}n.addEventListener(`mousedown`,c),window.addEventListener(`mousemove`,l),window.addEventListener(`mouseup`,d),window.addEventListener(`keydown`,f),document.body.appendChild(n)}async function u(e,t){return new Promise((n,r)=>{let i=new Image;i.onload=()=>{let e=document.createElement(`canvas`);e.width=t.width,e.height=t.height,e.getContext(`2d`).drawImage(i,t.x,t.y,t.width,t.height,0,0,t.width,t.height),e.toBlob(t=>{t?n({blob:t,dataUrl:e.toDataURL(`image/png`)}):r(Error(`Crop conversion failed`))},`image/png`)},i.onerror=()=>r(Error(`Failed to load full screenshot for cropping`)),i.src=e})}var d={minimized:!1,posX:null,posY:null,liveTracking:!0};function f(){let e=`matiks-companion-root`,t=document.getElementById(e);return t||(t=document.createElement(`div`),t.id=e,document.body.appendChild(t)),t}function p({expression:e,answer:t,ambiguous:n=!1,conflicts:r=null,isLiveTracking:i=!0,onToggleTracking:a=null,onManualScan:o=null}){d.liveTracking=i;let s=f(),c=s.attachShadow?s.shadowRoot||s.attachShadow({mode:`open`}):s,l=c.querySelector(`#matiks-hud-card`);if(l){let r=l.querySelector(`.expr`),a=l.querySelector(`.answer-val`),o=l.querySelector(`.status-dot`),s=l.querySelector(`.status-text`);r&&(r.textContent=e||`Scanning board...`),a&&(n?a.innerHTML=`<span style="font-size: 16px; color: #facc15;">⚠️ Verify: ${t}</span>`:a.textContent=t??`—`),o&&(o.className=`status-dot ${i?`active`:`paused`}`),s&&(s.textContent=i?`LIVE`:`PAUSED`);let c=l.querySelector(`.min-pill-val`);c&&(c.textContent=t??`—`);return}c.innerHTML=``;let u=document.createElement(`style`);u.textContent=`
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    .hud-card {
      position: fixed;
      top: 120px;
      right: 36px;
      width: 290px;
      background: rgba(15, 23, 42, 0.94);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(59, 130, 246, 0.4);
      box-shadow: 0 16px 36px rgba(0, 0, 0, 0.65), 0 0 16px rgba(59, 130, 246, 0.15);
      border-radius: 14px;
      color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", sans-serif;
      padding: 14px;
      z-index: 2147483647;
      user-select: none;
      transition: box-shadow 0.2s ease, opacity 0.2s ease;
    }
    .hud-card.minimized {
      width: auto;
      padding: 8px 14px;
      border-radius: 24px;
      background: rgba(15, 23, 42, 0.96);
      cursor: pointer;
    }
    .hud-card.minimized .full-view {
      display: none;
    }
    .hud-card.minimized .min-view {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .min-view {
      display: none;
      font-size: 14px;
      font-weight: 700;
      color: #4ade80;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      border-bottom: 1px solid rgba(51, 65, 85, 0.7);
      padding-bottom: 8px;
      cursor: move;
    }
    .title-row {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .title {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1.2px;
      color: #60a5fa;
      font-weight: 800;
    }
    .status-badge {
      display: flex;
      align-items: center;
      gap: 4px;
      background: rgba(30, 41, 59, 0.8);
      padding: 2px 6px;
      border-radius: 10px;
      font-size: 10px;
      font-weight: 700;
      color: #94a3b8;
    }
    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #64748b;
    }
    .status-dot.active {
      background: #22c55e;
      box-shadow: 0 0 8px #22c55e;
      animation: pulse 1.5s infinite;
    }
    .status-dot.paused {
      background: #eab308;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(0.85); }
    }
    .controls {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .btn-icon {
      background: none;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      font-size: 14px;
      padding: 2px;
      line-height: 1;
      border-radius: 4px;
    }
    .btn-icon:hover {
      color: #f8fafc;
      background: rgba(255, 255, 255, 0.1);
    }
    .expr-container {
      background: rgba(15, 23, 42, 0.7);
      border: 1px solid rgba(30, 41, 59, 0.9);
      border-radius: 8px;
      padding: 6px 10px;
      margin-bottom: 8px;
    }
    .expr-label {
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #64748b;
      margin-bottom: 2px;
    }
    .expr {
      font-size: 13px;
      color: #cbd5e1;
      font-family: "SFMono-Regular", Consolas, "Courier New", monospace;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .answer-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: linear-gradient(180deg, rgba(30, 41, 59, 0.5) 0%, rgba(15, 23, 42, 0.8) 100%);
      border: 1px solid rgba(59, 130, 246, 0.25);
      border-radius: 10px;
      padding: 10px;
      margin-bottom: 8px;
    }
    .answer-label {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 1px;
      color: #94a3b8;
      text-transform: uppercase;
      margin-bottom: 2px;
    }
    .answer-val {
      font-size: 32px;
      font-weight: 900;
      color: #4ade80;
      text-shadow: 0 0 16px rgba(74, 222, 128, 0.35);
      line-height: 1.1;
    }
    .actions-row {
      display: flex;
      gap: 6px;
    }
    .btn-action {
      flex: 1;
      background: #1e293b;
      border: 1px solid #334155;
      color: #cbd5e1;
      padding: 6px 8px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      transition: all 0.15s ease;
    }
    .btn-action:hover {
      background: #334155;
      color: #f8fafc;
    }
    .btn-action.active {
      border-color: #22c55e;
      color: #4ade80;
    }
  `,c.appendChild(u);let p=document.createElement(`div`);p.id=`matiks-hud-card`,p.className=`hud-card`,p.innerHTML=`
    <!-- Minimized View -->
    <div class="min-view">
      <span class="status-dot ${i?`active`:`paused`}"></span>
      <span style="font-size: 11px; color: #94a3b8;">ANS:</span>
      <span class="min-pill-val">${t??`—`}</span>
    </div>

    <!-- Full View -->
    <div class="full-view">
      <div class="header">
        <div class="title-row">
          <span class="title">Matiks Companion</span>
          <div class="status-badge">
            <span class="status-dot ${i?`active`:`paused`}"></span>
            <span class="status-text">${i?`LIVE`:`PAUSED`}</span>
          </div>
        </div>
        <div class="controls">
          <button class="btn-icon btn-min" title="Minimize to pill">_</button>
          <button class="btn-icon btn-close" title="Hide HUD">&times;</button>
        </div>
      </div>

      <div class="expr-container">
        <div class="expr-label">Current Equation</div>
        <div class="expr">${e||`Scanning board...`}</div>
      </div>

      <div class="answer-box">
        <div class="answer-label">Calculated Answer</div>
        <div class="answer-val">${t??`—`}</div>
      </div>

      <div class="actions-row">
        <button class="btn-action btn-toggle ${i?`active`:``}">
          ${i?`● Live Tracking On`:`○ Live Tracking Off`}
        </button>
        <button class="btn-action btn-scan">⚡ Scan</button>
      </div>
    </div>
  `;let m=!1,h=0,g=0,_=0,v=0,y=p.querySelector(`.header`);y.onmousedown=e=>{m=!0,h=e.clientX,g=e.clientY;let t=p.getBoundingClientRect();_=t.left,v=t.top;function n(e){if(!m)return;let t=e.clientX-h,n=e.clientY-g,r=Math.max(10,Math.min(window.innerWidth-p.offsetWidth-10,_+t)),i=Math.max(10,Math.min(window.innerHeight-p.offsetHeight-10,v+n));p.style.right=`auto`,p.style.left=`${r}px`,p.style.top=`${i}px`,d.posX=r,d.posY=i}function r(){m=!1,window.removeEventListener(`mousemove`,n),window.removeEventListener(`mouseup`,r)}window.addEventListener(`mousemove`,n),window.addEventListener(`mouseup`,r)};let b=p.querySelector(`.btn-min`),x=p.querySelector(`.min-view`);function S(){d.minimized=!d.minimized,p.classList.toggle(`minimized`,d.minimized)}b.onclick=e=>{e.stopPropagation(),S()},x.onclick=()=>{S()};let C=p.querySelector(`.btn-close`);C.onclick=e=>{e.stopPropagation(),s.parentNode&&s.parentNode.removeChild(s)};let w=p.querySelector(`.btn-toggle`);w.onclick=e=>{e.stopPropagation(),a&&a()};let T=p.querySelector(`.btn-scan`);T.onclick=e=>{e.stopPropagation(),o&&o()},c.appendChild(p)}function m(e){if(!e)return``;let t=e;for(;;){let e=t.replace(/(\d)\s+(\d)/g,(e,t,n)=>t+n);if(e===t)break;t=e}return t}function h(e){let t=[];for(let n of e){let e=m(n);if(e=e.replace(/[–—−_]/g,`-`).replace(/[:∕]/g,`/`).replace(/[=?#~]/g,` `).replace(/\s+/g,` `).trim(),!e)continue;let r=e.match(/(?:[+\-*/%×÷−xX^()]+|\d+(?:\.\d+)?|\.\d+)/g);r&&t.push(...r)}if(t.length<2)return null;let n=``;for(let e=0;e<t.length;e++){let r=t[e],i=e>0?t[e-1]:null;if(!i)n+=r;else{let t=/^\d/.test(i),a=/^\d/.test(r);t&&a?n+=` + `+r:e===1&&i===`-`&&a?n+=r:(/[+\-*/%×÷−xX^]/.test(r)||/[+\-*/%×÷−xX^]/.test(i),n+=` `+r)}}n=n.trim(),n=n.replace(/[+\-*/%×÷−xX^]+$/,``).trim();let r=(n.match(/\d/g)||[]).length,i=/[+\-*/%×÷−xX^]/.test(n);return r>=2&&i?n:null}function g(e){if(!e||typeof e!=`string`)throw Error(`No OCR text received`);let t=m(e).split(/\r?\n/).map(e=>e.trim()).filter(Boolean);if(t.length===0)throw Error(`No arithmetic expression detected. Try a clearer image.`);let n=t.filter(e=>{let t=e.replace(/[–—−_]/g,`-`).replace(/[:∕]/g,`/`).replace(/[=?#~]/g,``).trim();return/[\d+\-*/%×÷−xX^]/.test(t)});if(n.length>1){let e=h(n);if(e)return e}let r=[];for(let e of t){let t=e;if(t.includes(`=`)){let e=t.split(`=`),n=e[0].trim(),r=e.slice(1).join(`=`).trim();t=/[+\-*/%×÷−xX^]/.test(n)?n:/[+\-*/%×÷−xX^]/.test(r)?r:n}let n=t.replace(/[?_#~]/g,` `).replace(/\s+/g,` `).trim().match(/[-+*/%×÷−xX\d().\s^]+/);if(!n)continue;let i=n[0].trim();i=i.replace(/[+\-*/×÷xX^]+$/,``).trim();let a=(i.match(/\d/g)||[]).length,o=/[+\-*/%×÷−xX^]/.test(i);(a>=2&&o||a>=1&&/%/.test(i))&&r.push({expression:i,digits:a,length:i.length})}if(r.length>0)return r.sort((e,t)=>t.digits-e.digits||t.length-e.length),r[0].expression;if(n.length>0){let e=h(n);if(e)return e}throw Error(`No arithmetic expression detected. Try a clearer image.`)}function _(){let e=document.querySelector(`[data-testid="daily-math-answer-title"]`);if(e){let t=e.getBoundingClientRect();return{left:Math.max(0,t.left-200),right:Math.min(window.innerWidth,t.right+200),top:Math.max(40,t.top-460),bottom:t.top-4}}let t=document.querySelector(`img[src*="questionBackground"], [style*="questionBackground"]`);if(t){let e=t.getBoundingClientRect();if(e.width>80&&e.height>80)return{left:e.left-15,right:e.right+15,top:e.top-15,bottom:e.bottom+15}}let n=window.innerWidth/2,r=window.innerHeight/2;return{left:n-220,right:n+220,top:r-220,bottom:r+220}}function v(){let e=document.querySelector(`img[src*="questionBackground"], [style*="questionBackground"]`);if(e){let t=e.parentElement;for(;t&&t!==document.body;){let e=t.getBoundingClientRect();if(e.width>=260&&e.width<=540&&e.height>=260&&e.height<=540)return t;t=t.parentElement}return e.parentElement||e}let t=document.querySelector(`[data-testid="daily-math-answer-title"]`);if(t){let e=t.getBoundingClientRect(),n=document.querySelectorAll(`div, img, canvas`);for(let t of n){if(t.closest(`#matiks-companion-root`))continue;let n=t.getBoundingClientRect();if(n.width>=280&&n.width<=500&&n.height>=280&&n.height<=500&&n.bottom<=e.top+30)return t}}return document.body}function y(){let e=_(),t=[],n=document.querySelectorAll(`div, span, p, svg`);for(let r of n){if(r.closest(`#matiks-companion-root`)||r.closest(`#matiks-picker-guide`)||r.children.length>1&&r.tagName.toLowerCase()!==`svg`)continue;let n=r.getBoundingClientRect();if(n.width===0||n.height===0||n.left<e.left||n.right>e.right||n.top<e.top||n.bottom>e.bottom)continue;if(r.tagName.toLowerCase()===`svg`||r.querySelector(`svg`)){let e=r.tagName.toLowerCase()===`svg`?r:r.querySelector(`svg`),i=(e.getAttribute(`aria-label`)||``).toLowerCase(),a=e.innerHTML.toLowerCase(),o=null;if(i.includes(`divide`)||i.includes(`division`)||a.includes(`divide`))o=`÷`;else if(i.includes(`multiply`)||i.includes(`times`)||a.includes(`multiply`))o=`×`;else if(i.includes(`plus`)||i.includes(`add`)||a.includes(`plus`))o=`+`;else if(i.includes(`minus`)||i.includes(`sub`)||a.includes(`minus`))o=`-`;else{let t=e.querySelectorAll(`circle, ellipse`),r=e.querySelectorAll(`path, line, rect`);(t.length>=2||r.length>=2&&n.height>=n.width*.7)&&(o=`÷`)}o&&t.push({text:o,top:Math.round(n.top),left:Math.round(n.left),height:Math.round(n.height),isOperator:!0});continue}let i=r.textContent.trim();if(!i||r.children.length===1&&r.children[0].textContent.trim()===i||i.includes(`TYPE OUT`)||i.includes(`ANSWER`)||/[a-wy-zA-WY-Z]/.test(i)||/\d+:\d{2}/.test(i)||!/[0-9+\-*/×÷:∕−^√()]/.test(i))continue;let a=i.replace(/[:∕]/g,`/`);t.push({text:a,top:Math.round(n.top),left:Math.round(n.left),height:Math.round(n.height),isOperator:/[+\-*/×÷−^]/.test(a)})}let r=[];for(let e of t)r.some(t=>Math.abs(t.top-e.top)<6&&Math.abs(t.left-e.left)<6&&t.text===e.text)||r.push(e);if(r.length===0)return null;r.sort((e,t)=>e.top-t.top||e.left-t.left);let i=[],a=[],o=null;for(let e of r)o===null||Math.abs(e.top-o)<=Math.max(16,e.height*.6)?(a.push(e),o===null&&(o=e.top)):(a.sort((e,t)=>e.left-t.left),i.push(a.map(e=>e.text).join(` `)),a=[e],o=e.top);if(a.length>0&&(a.sort((e,t)=>e.left-t.left),i.push(a.map(e=>e.text).join(` `))),i.length===0)return null;if(i.length===1){let e=i[0].replace(/[–—−]/g,`-`).trim();if(/\d+.*[+\-*/×÷^].*\d+/.test(e))return e}return h(i)}async function b(e){if(e instanceof HTMLCanvasElement)try{let t=e.toDataURL(`image/png`);return{dataUrl:t,blob:await(await fetch(t)).blob()}}catch{}let t=_(),n=window.devicePixelRatio||1,r={x:Math.round(t.left*n),y:Math.round(t.top*n),width:Math.round((t.right-t.left)*n),height:Math.round((t.bottom-t.top)*n)};return new Promise((e,t)=>{chrome.runtime.sendMessage({type:`CAPTURE_VISIBLE_TAB`},async n=>{if(!n||!n.success)t(Error(n?.error||`Tab capture error`));else try{e(await u(n.dataUrl,r))}catch(e){t(e)}})})}function x(e,t){let n=null,r=document.createElement(`div`);r.id=`matiks-picker-guide`,Object.assign(r.style,{position:`fixed`,top:`24px`,left:`50%`,transform:`translateX(-50%)`,padding:`12px 24px`,background:`#090d16`,color:`#60a5fa`,border:`2px solid #3b82f6`,borderRadius:`24px`,fontFamily:`Inter, sans-serif`,fontSize:`14px`,fontWeight:`700`,zIndex:`2147483647`,boxShadow:`0 8px 24px rgba(0,0,0,0.6)`,pointerEvents:`none`}),r.textContent=`🎯 Click on the equation on your screen · Press ESC to cancel`,document.body.appendChild(r);let i=``;function a(e){let t=document.elementFromPoint(e.clientX,e.clientY);t&&t!==n&&t.id!==`matiks-picker-guide`&&!t.closest(`#matiks-companion-root`)&&(n&&(n.style.outline=i),n=t,i=t.style.outline,t.style.outline=`3px solid #38bdf8`)}function o(){n&&(n.style.outline=i),window.removeEventListener(`mousemove`,a,!0),window.removeEventListener(`click`,s,!0),window.removeEventListener(`keydown`,c,!0),r.parentNode&&r.parentNode.removeChild(r)}function s(t){t.preventDefault(),t.stopPropagation();let r=n;o(),r&&e&&e(r)}function c(e){e.key===`Escape`&&(o(),t&&t())}window.addEventListener(`mousemove`,a,!0),window.addEventListener(`click`,s,!0),window.addEventListener(`keydown`,c,!0)}var S=a(((e,t)=>{var n=function(e){"use strict";var t=Object.prototype,n=t.hasOwnProperty,r=Object.defineProperty||function(e,t,n){e[t]=n.value},i,a=typeof Symbol==`function`?Symbol:{},o=a.iterator||`@@iterator`,s=a.asyncIterator||`@@asyncIterator`,c=a.toStringTag||`@@toStringTag`;function l(e,t,n){return Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}),e[t]}try{l({},``)}catch{l=function(e,t,n){return e[t]=n}}function u(e,t,n,i){var a=t&&t.prototype instanceof _?t:_,o=Object.create(a.prototype);return r(o,`_invoke`,{value:E(e,n,new A(i||[]))}),o}e.wrap=u;function d(e,t,n){try{return{type:`normal`,arg:e.call(t,n)}}catch(e){return{type:`throw`,arg:e}}}var f=`suspendedStart`,p=`suspendedYield`,m=`executing`,h=`completed`,g={};function _(){}function v(){}function y(){}var b={};l(b,o,function(){return this});var x=Object.getPrototypeOf,S=x&&x(x(j([])));S&&S!==t&&n.call(S,o)&&(b=S);var C=y.prototype=_.prototype=Object.create(b);v.prototype=y,r(C,`constructor`,{value:y,configurable:!0}),r(y,`constructor`,{value:v,configurable:!0}),v.displayName=l(y,c,`GeneratorFunction`);function w(e){[`next`,`throw`,`return`].forEach(function(t){l(e,t,function(e){return this._invoke(t,e)})})}e.isGeneratorFunction=function(e){var t=typeof e==`function`&&e.constructor;return t?t===v||(t.displayName||t.name)===`GeneratorFunction`:!1},e.mark=function(e){return Object.setPrototypeOf?Object.setPrototypeOf(e,y):(e.__proto__=y,l(e,c,`GeneratorFunction`)),e.prototype=Object.create(C),e},e.awrap=function(e){return{__await:e}};function T(e,t){function i(r,a,o,s){var c=d(e[r],e,a);if(c.type===`throw`)s(c.arg);else{var l=c.arg,u=l.value;return u&&typeof u==`object`&&n.call(u,`__await`)?t.resolve(u.__await).then(function(e){i(`next`,e,o,s)},function(e){i(`throw`,e,o,s)}):t.resolve(u).then(function(e){l.value=e,o(l)},function(e){return i(`throw`,e,o,s)})}}var a;function o(e,n){function r(){return new t(function(t,r){i(e,n,t,r)})}return a=a?a.then(r,r):r()}r(this,`_invoke`,{value:o})}w(T.prototype),l(T.prototype,s,function(){return this}),e.AsyncIterator=T,e.async=function(t,n,r,i,a){a===void 0&&(a=Promise);var o=new T(u(t,n,r,i),a);return e.isGeneratorFunction(n)?o:o.next().then(function(e){return e.done?e.value:o.next()})};function E(e,t,n){var r=f;return function(i,a){if(r===m)throw Error(`Generator is already running`);if(r===h){if(i===`throw`)throw a;return M()}for(n.method=i,n.arg=a;;){var o=n.delegate;if(o){var s=D(o,n);if(s){if(s===g)continue;return s}}if(n.method===`next`)n.sent=n._sent=n.arg;else if(n.method===`throw`){if(r===f)throw r=h,n.arg;n.dispatchException(n.arg)}else n.method===`return`&&n.abrupt(`return`,n.arg);r=m;var c=d(e,t,n);if(c.type===`normal`){if(r=n.done?h:p,c.arg===g)continue;return{value:c.arg,done:n.done}}c.type===`throw`&&(r=h,n.method=`throw`,n.arg=c.arg)}}}function D(e,t){var n=t.method,r=e.iterator[n];if(r===i)return t.delegate=null,n===`throw`&&e.iterator.return&&(t.method=`return`,t.arg=i,D(e,t),t.method===`throw`)||n!==`return`&&(t.method=`throw`,t.arg=TypeError(`The iterator does not provide a '`+n+`' method`)),g;var a=d(r,e.iterator,t.arg);if(a.type===`throw`)return t.method=`throw`,t.arg=a.arg,t.delegate=null,g;var o=a.arg;if(!o)return t.method=`throw`,t.arg=TypeError(`iterator result is not an object`),t.delegate=null,g;if(o.done)t[e.resultName]=o.value,t.next=e.nextLoc,t.method!==`return`&&(t.method=`next`,t.arg=i);else return o;return t.delegate=null,g}w(C),l(C,c,`Generator`),l(C,o,function(){return this}),l(C,`toString`,function(){return`[object Generator]`});function O(e){var t={tryLoc:e[0]};1 in e&&(t.catchLoc=e[1]),2 in e&&(t.finallyLoc=e[2],t.afterLoc=e[3]),this.tryEntries.push(t)}function k(e){var t=e.completion||{};t.type=`normal`,delete t.arg,e.completion=t}function A(e){this.tryEntries=[{tryLoc:`root`}],e.forEach(O,this),this.reset(!0)}e.keys=function(e){var t=Object(e),n=[];for(var r in t)n.push(r);return n.reverse(),function e(){for(;n.length;){var r=n.pop();if(r in t)return e.value=r,e.done=!1,e}return e.done=!0,e}};function j(e){if(e){var t=e[o];if(t)return t.call(e);if(typeof e.next==`function`)return e;if(!isNaN(e.length)){var r=-1,a=function t(){for(;++r<e.length;)if(n.call(e,r))return t.value=e[r],t.done=!1,t;return t.value=i,t.done=!0,t};return a.next=a}}return{next:M}}e.values=j;function M(){return{value:i,done:!0}}return A.prototype={constructor:A,reset:function(e){if(this.prev=0,this.next=0,this.sent=this._sent=i,this.done=!1,this.delegate=null,this.method=`next`,this.arg=i,this.tryEntries.forEach(k),!e)for(var t in this)t.charAt(0)===`t`&&n.call(this,t)&&!isNaN(+t.slice(1))&&(this[t]=i)},stop:function(){this.done=!0;var e=this.tryEntries[0].completion;if(e.type===`throw`)throw e.arg;return this.rval},dispatchException:function(e){if(this.done)throw e;var t=this;function r(n,r){return s.type=`throw`,s.arg=e,t.next=n,r&&(t.method=`next`,t.arg=i),!!r}for(var a=this.tryEntries.length-1;a>=0;--a){var o=this.tryEntries[a],s=o.completion;if(o.tryLoc===`root`)return r(`end`);if(o.tryLoc<=this.prev){var c=n.call(o,`catchLoc`),l=n.call(o,`finallyLoc`);if(c&&l){if(this.prev<o.catchLoc)return r(o.catchLoc,!0);if(this.prev<o.finallyLoc)return r(o.finallyLoc)}else if(c){if(this.prev<o.catchLoc)return r(o.catchLoc,!0)}else if(l){if(this.prev<o.finallyLoc)return r(o.finallyLoc)}else throw Error(`try statement without catch or finally`)}}},abrupt:function(e,t){for(var r=this.tryEntries.length-1;r>=0;--r){var i=this.tryEntries[r];if(i.tryLoc<=this.prev&&n.call(i,`finallyLoc`)&&this.prev<i.finallyLoc){var a=i;break}}a&&(e===`break`||e===`continue`)&&a.tryLoc<=t&&t<=a.finallyLoc&&(a=null);var o=a?a.completion:{};return o.type=e,o.arg=t,a?(this.method=`next`,this.next=a.finallyLoc,g):this.complete(o)},complete:function(e,t){if(e.type===`throw`)throw e.arg;return e.type===`break`||e.type===`continue`?this.next=e.arg:e.type===`return`?(this.rval=this.arg=e.arg,this.method=`return`,this.next=`end`):e.type===`normal`&&t&&(this.next=t),g},finish:function(e){for(var t=this.tryEntries.length-1;t>=0;--t){var n=this.tryEntries[t];if(n.finallyLoc===e)return this.complete(n.completion,n.afterLoc),k(n),g}},catch:function(e){for(var t=this.tryEntries.length-1;t>=0;--t){var n=this.tryEntries[t];if(n.tryLoc===e){var r=n.completion;if(r.type===`throw`){var i=r.arg;k(n)}return i}}throw Error(`illegal catch attempt`)},delegateYield:function(e,t,n){return this.delegate={iterator:j(e),resultName:t,nextLoc:n},this.method===`next`&&(this.arg=i),g}},e}(typeof t==`object`?t.exports:{});try{regeneratorRuntime=n}catch{typeof globalThis==`object`?globalThis.regeneratorRuntime=n:Function(`r`,`regeneratorRuntime = r`)(n)}})),C=a(((e,t)=>{t.exports=(e,t)=>`${e}-${t}-${Math.random().toString(16).slice(3,8)}`})),w=a(((e,t)=>{var n=C(),r=0;t.exports=({id:e,action:t,payload:i={}})=>{let a=e;return a===void 0&&(a=n(`Job`,r),r+=1),{id:a,action:t,payload:i}}})),T=a(((e,t,n)=>{var r=!1;e.logging=r,e.setLogging=e=>{r=e},e.log=(...e)=>r?console.log.apply(n,e):null})),E=a(((e,t,n)=>{var r=w(),{log:i}=T(),a=C(),o=0;t.exports=()=>{let e=a(`Scheduler`,o),t={},s={},c=[];o+=1;let l=()=>c.length,u=()=>Object.keys(t).length,d=()=>{if(c.length!==0){let e=Object.keys(t);for(let n=0;n<e.length;n+=1)if(s[e[n]]===void 0){c[0](t[e[n]]);break}}},f=(t,a)=>new Promise((o,l)=>{let u=r({action:t,payload:a});c.push(async e=>{c.shift(),s[e.id]=u;try{o(await e[t].apply(n,[...a,u.id]))}catch(e){l(e)}finally{delete s[e.id],d()}}),i(`[${e}]: Add ${u.id} to JobQueue`),i(`[${e}]: JobQueue length=${c.length}`),d()});return{addWorker:n=>(t[n.id]=n,i(`[${e}]: Add ${n.id}`),i(`[${e}]: Number of workers=${u()}`),d(),n.id),addJob:async(t,...n)=>{if(u()===0)throw Error(`[${e}]: You need to have at least one worker before adding jobs`);return f(t,n)},terminate:async()=>{Object.keys(t).forEach(async e=>{await t[e].terminate()}),c=[]},getQueueLen:l,getNumWorkers:u}}})),D=a(((e,t)=>{t.exports=e=>{let t={};return typeof WorkerGlobalScope<`u`?t.type=`webworker`:typeof document==`object`?t.type=`browser`:typeof process==`object`&&typeof require==`function`&&(t.type=`node`),e===void 0?t:t[e]}})),O=a(((e,t)=>{var n=D()(`type`)===`browser`?e=>new URL(e,window.location.href).href:e=>e;t.exports=e=>{let t={...e};return[`corePath`,`workerPath`,`langPath`].forEach(r=>{e[r]&&(t[r]=n(t[r]))}),t}})),k=a(((e,t)=>{t.exports={TESSERACT_ONLY:0,LSTM_ONLY:1,TESSERACT_LSTM_COMBINED:2,DEFAULT:3}})),A=o({author:()=>``,browser:()=>B,bugs:()=>ee,collective:()=>ne,contributors:()=>V,default:()=>re,dependencies:()=>W,description:()=>N,devDependencies:()=>U,homepage:()=>te,jsdelivr:()=>R,license:()=>H,main:()=>P,name:()=>j,overrides:()=>G,repository:()=>K,scripts:()=>z,type:()=>F,types:()=>I,unpkg:()=>L,version:()=>M}),j,M,N,P,F,I,L,R,z,B,V,H,U,W,G,K,ee,te,ne,re,ie=i((()=>{j=`tesseract.js`,M=`7.0.0`,N=`Pure Javascript Multilingual OCR`,P=`src/index.js`,F=`commonjs`,I=`src/index.d.ts`,L=`dist/tesseract.min.js`,R=`dist/tesseract.min.js`,z={start:`node scripts/server.js`,build:`rimraf dist && webpack --config scripts/webpack.config.prod.js && rollup -c scripts/rollup.esm.mjs`,"profile:tesseract":`webpack-bundle-analyzer dist/tesseract-stats.json`,"profile:worker":`webpack-bundle-analyzer dist/worker-stats.json`,prepublishOnly:`npm run build`,wait:`rimraf dist && wait-on http://localhost:3000/dist/tesseract.min.js`,test:`npm-run-all -p -r start test:all`,"test:all":`npm-run-all wait test:browser test:node:all`,"test:browser":`karma start karma.conf.js`,"test:node":`nyc mocha --exit --bail --require ./scripts/test-helper.mjs`,"test:node:all":`npm run test:node -- ./tests/*.test.mjs`,lint:`eslint src`,"lint:fix":`eslint --fix src`,postinstall:`opencollective-postinstall || true`},B={"./src/worker/node/index.js":`./src/worker/browser/index.js`},V=[`jeromewu`],H=`Apache-2.0`,U={"@babel/core":`^7.21.4`,"@babel/eslint-parser":`^7.21.3`,"@babel/preset-env":`^7.21.4`,"@rollup/plugin-commonjs":`^24.1.0`,acorn:`^8.8.2`,"babel-loader":`^9.1.2`,buffer:`^6.0.3`,cors:`^2.8.5`,eslint:`^7.32.0`,"eslint-config-airbnb-base":`^14.2.1`,"eslint-plugin-import":`^2.27.5`,"expect.js":`^0.3.1`,express:`^4.18.2`,mocha:`^10.2.0`,"npm-run-all":`^4.1.5`,karma:`^6.4.2`,"karma-chrome-launcher":`^3.2.0`,"karma-firefox-launcher":`^2.1.2`,"karma-mocha":`^2.0.1`,"karma-webpack":`^5.0.0`,nyc:`^15.1.0`,rimraf:`^5.0.0`,rollup:`^3.20.7`,"wait-on":`^7.0.1`,webpack:`^5.79.0`,"webpack-bundle-analyzer":`^4.8.0`,"webpack-cli":`^5.0.1`,"webpack-dev-middleware":`^6.0.2`,"rollup-plugin-sourcemaps":`^0.6.3`},W={"bmp-js":`^0.1.0`,"idb-keyval":`^6.2.0`,"is-url":`^1.2.4`,"node-fetch":`^2.6.9`,"opencollective-postinstall":`^2.0.3`,"regenerator-runtime":`^0.13.3`,"tesseract.js-core":`^7.0.0`,"wasm-feature-detect":`^1.8.0`,zlibjs:`^0.3.1`},G={"@rollup/pluginutils":`^5.0.2`},K={type:`git`,url:`https://github.com/naptha/tesseract.js.git`},ee={url:`https://github.com/naptha/tesseract.js/issues`},te=`https://github.com/naptha/tesseract.js`,ne={type:`opencollective`,url:`https://opencollective.com/tesseractjs`},re={name:j,version:M,description:N,main:P,type:F,types:I,unpkg:L,jsdelivr:R,scripts:z,browser:B,author:``,contributors:V,license:H,devDependencies:U,dependencies:W,overrides:G,repository:K,bugs:ee,homepage:te,collective:ne}})),ae=a(((e,t)=>{t.exports={workerBlobURL:!0,logger:()=>{}}})),oe=a(((e,t)=>{var n=(ie(),c(A).default).version;t.exports={...ae(),workerPath:`https://cdn.jsdelivr.net/npm/tesseract.js@v${n}/dist/worker.min.js`}})),se=a(((e,t)=>{t.exports=({workerPath:e,workerBlobURL:t})=>{let n;if(Blob&&URL&&t){let t=new Blob([`importScripts("${e}");`],{type:`application/javascript`});n=new Worker(URL.createObjectURL(t))}else n=new Worker(e);return n}})),ce=a(((e,t)=>{t.exports=e=>{e.terminate()}})),le=a(((e,t)=>{t.exports=(e,t)=>{e.onmessage=({data:e})=>{t(e)}}})),ue=a(((e,t)=>{t.exports=async(e,t)=>{e.postMessage(t)}})),de=a(((e,t)=>{var n=e=>new Promise((t,n)=>{let r=new FileReader;r.onload=()=>{t(r.result)},r.onerror=({target:{error:{code:e}}})=>{n(Error(`File could not be read! Code=${e}`))},r.readAsArrayBuffer(e)}),r=async e=>{let t=e;return e===void 0?`undefined`:(typeof e==`string`?t=/data:image\/([a-zA-Z]*);base64,([^"]*)/.test(e)?atob(e.split(`,`)[1]).split(``).map(e=>e.charCodeAt(0)):await(await fetch(e)).arrayBuffer():typeof HTMLElement<`u`&&e instanceof HTMLElement?(e.tagName===`IMG`&&(t=await r(e.src)),e.tagName===`VIDEO`&&(t=await r(e.poster)),e.tagName===`CANVAS`&&await new Promise(r=>{e.toBlob(async e=>{t=await n(e),r()})})):typeof OffscreenCanvas<`u`&&e instanceof OffscreenCanvas?t=await n(await e.convertToBlob()):(e instanceof File||e instanceof Blob)&&(t=await n(e)),new Uint8Array(t))};t.exports=r})),fe=a(((e,t)=>{t.exports={defaultOptions:oe(),spawnWorker:se(),terminateWorker:ce(),onMessage:le(),send:ue(),loadImage:de()}})),pe=a(((e,t)=>{var n=O(),r=w(),{log:i}=T(),a=C(),o=k(),{defaultOptions:s,spawnWorker:c,terminateWorker:l,onMessage:u,loadImage:d,send:f}=fe(),p=0;t.exports=async(e=`eng`,t=o.LSTM_ONLY,m={},h={})=>{let g=a(`Worker`,p),{logger:_,errorHandler:v,...y}=n({...s,...m}),b={},x=typeof e==`string`?e.split(`+`):e,S=t,C=h,w=[o.DEFAULT,o.LSTM_ONLY].includes(t)&&!y.legacyCore,T,E,D=new Promise((e,t)=>{E=e,T=t}),O=e=>{T(e.message)},k=c(y);k.onerror=O,p+=1;let A=({id:e,action:t,payload:n})=>new Promise((r,a)=>{i(`[${g}]: Start ${e}, action=${t}`);let o=`${t}-${e}`;b[o]={resolve:r,reject:a},f(k,{workerId:g,jobId:e,action:t,payload:n})}),j=()=>console.warn("`load` is depreciated and should be removed from code (workers now come pre-loaded)"),M=e=>A(r({id:e,action:`load`,payload:{options:{lstmOnly:w,corePath:y.corePath,logging:y.logging}}})),N=(e,t,n)=>A(r({id:n,action:`FS`,payload:{method:`writeFile`,args:[e,t]}})),P=(e,t)=>A(r({id:t,action:`FS`,payload:{method:`readFile`,args:[e,{encoding:`utf8`}]}})),F=(e,t)=>A(r({id:t,action:`FS`,payload:{method:`unlink`,args:[e]}})),I=(e,t,n)=>A(r({id:n,action:`FS`,payload:{method:e,args:t}})),L=(e,t)=>A(r({id:t,action:`loadLanguage`,payload:{langs:e,options:{langPath:y.langPath,dataPath:y.dataPath,cachePath:y.cachePath,cacheMethod:y.cacheMethod,gzip:y.gzip,lstmOnly:[o.DEFAULT,o.LSTM_ONLY].includes(S)&&!y.legacyLang}}})),R=(e,t,n,i)=>A(r({id:i,action:`initialize`,payload:{langs:e,oem:t,config:n}})),z=(e=`eng`,t,n,r)=>{if(w&&[o.TESSERACT_ONLY,o.TESSERACT_LSTM_COMBINED].includes(t))throw Error(`Legacy model requested but code missing.`);let i=t||S;S=i;let a=n||C;C=a;let s=(typeof e==`string`?e.split(`+`):e).filter(e=>!x.includes(e));return x.push(...s),s.length>0?L(s,r).then(()=>R(e,i,a,r)):R(e,i,a,r)},B=(e={},t)=>A(r({id:t,action:`setParameters`,payload:{params:e}})),V=async(e,t={},n={text:!0},i)=>A(r({id:i,action:`recognize`,payload:{image:await d(e),options:t,output:n}})),H=async(e,t)=>{if(w)throw Error("`worker.detect` requires Legacy model, which was not loaded.");return A(r({id:t,action:`detect`,payload:{image:await d(e)}}))},U=async()=>(k!==null&&(l(k),k=null),Promise.resolve());u(k,({workerId:e,jobId:t,status:n,action:r,data:a})=>{let o=`${r}-${t}`;if(n===`resolve`)i(`[${e}]: Complete ${t}`),b[o].resolve({jobId:t,data:a}),delete b[o];else if(n===`reject`){if(b[o].reject(a),delete b[o],r===`load`&&T(a),v)v(a);else throw Error(a)}else n===`progress`&&_({...a,userJobId:t})});let W={id:g,worker:k,load:j,writeText:N,readText:P,removeFile:F,FS:I,reinitialize:z,setParameters:B,recognize:V,detect:H,terminate:U};return M().then(()=>L(e)).then(()=>R(e,t,h)).then(()=>E(W)).catch(()=>{}),D}})),me=a(((e,t)=>{var n=pe();t.exports={recognize:async(e,t,r)=>{let i=await n(t,1,r);return i.recognize(e).finally(async()=>{await i.terminate()})},detect:async(e,t)=>{let r=await n(`osd`,0,t);return r.detect(e).finally(async()=>{await r.terminate()})}}})),he=a(((e,t)=>{t.exports={AFR:`afr`,AMH:`amh`,ARA:`ara`,ASM:`asm`,AZE:`aze`,AZE_CYRL:`aze_cyrl`,BEL:`bel`,BEN:`ben`,BOD:`bod`,BOS:`bos`,BUL:`bul`,CAT:`cat`,CEB:`ceb`,CES:`ces`,CHI_SIM:`chi_sim`,CHI_TRA:`chi_tra`,CHR:`chr`,CYM:`cym`,DAN:`dan`,DEU:`deu`,DZO:`dzo`,ELL:`ell`,ENG:`eng`,ENM:`enm`,EPO:`epo`,EST:`est`,EUS:`eus`,FAS:`fas`,FIN:`fin`,FRA:`fra`,FRK:`frk`,FRM:`frm`,GLE:`gle`,GLG:`glg`,GRC:`grc`,GUJ:`guj`,HAT:`hat`,HEB:`heb`,HIN:`hin`,HRV:`hrv`,HUN:`hun`,IKU:`iku`,IND:`ind`,ISL:`isl`,ITA:`ita`,ITA_OLD:`ita_old`,JAV:`jav`,JPN:`jpn`,KAN:`kan`,KAT:`kat`,KAT_OLD:`kat_old`,KAZ:`kaz`,KHM:`khm`,KIR:`kir`,KOR:`kor`,KUR:`kur`,LAO:`lao`,LAT:`lat`,LAV:`lav`,LIT:`lit`,MAL:`mal`,MAR:`mar`,MKD:`mkd`,MLT:`mlt`,MSA:`msa`,MYA:`mya`,NEP:`nep`,NLD:`nld`,NOR:`nor`,ORI:`ori`,PAN:`pan`,POL:`pol`,POR:`por`,PUS:`pus`,RON:`ron`,RUS:`rus`,SAN:`san`,SIN:`sin`,SLK:`slk`,SLV:`slv`,SPA:`spa`,SPA_OLD:`spa_old`,SQI:`sqi`,SRP:`srp`,SRP_LATN:`srp_latn`,SWA:`swa`,SWE:`swe`,SYR:`syr`,TAM:`tam`,TEL:`tel`,TGK:`tgk`,TGL:`tgl`,THA:`tha`,TIR:`tir`,TUR:`tur`,UIG:`uig`,UKR:`ukr`,URD:`urd`,UZB:`uzb`,UZB_CYRL:`uzb_cyrl`,VIE:`vie`,YID:`yid`}})),ge=a(((e,t)=>{t.exports={OSD_ONLY:`0`,AUTO_OSD:`1`,AUTO_ONLY:`2`,AUTO:`3`,SINGLE_COLUMN:`4`,SINGLE_BLOCK_VERT_TEXT:`5`,SINGLE_BLOCK:`6`,SINGLE_LINE:`7`,SINGLE_WORD:`8`,CIRCLE_WORD:`9`,SINGLE_CHAR:`10`,SPARSE_TEXT:`11`,SPARSE_TEXT_OSD:`12`,RAW_LINE:`13`}})),_e=a(((e,t)=>{S();var n=E(),r=pe(),i=me(),a=he(),o=k(),s=ge(),{setLogging:c}=T();t.exports={languages:a,OEM:o,PSM:s,createScheduler:n,createWorker:r,setLogging:c,...i}}))(),q=null;async function ve(){return q||=(0,_e.createWorker)(`eng`).catch(e=>{throw q=null,e}),q}async function ye(e){let t=await ve();await t.setParameters({tessedit_char_whitelist:`0123456789+-*/:().%=xX×÷−? 
\r`,load_system_dawg:`0`,load_freq_dawg:`0`,preserve_interword_spaces:`0`,tessedit_pageseg_mode:`6`});let n=performance.now(),r=await t.recognize(e),i=Math.round(performance.now()-n),a=null;try{a=g(r.data.text)}catch{}return{text:r.data.text.trim(),expression:a,confidence:r.data.confidence,duration:i}}var be=[[/×/g,`*`],[/÷/g,`/`],[/[:∕⁄]/g,`/`],[/[−–—]/g,`-`],[/[＋]/g,`+`],[/[＊]/g,`*`],[/[／]/g,`/`],[/[％]/g,`%`],[/\*\*/g,`^`],[/√/g,`sqrt `],[/\bof\b/gi,`*`],[/\s+/g,` `]];function xe(e){if(typeof e!=`string`)throw TypeError(`Expression must be a string`);let t=e.trim();if(!t)throw Error(`Expression cannot be empty`);if(t.length>200)throw Error(`Expression is too long`);for(let[e,n]of be)t=t.replace(e,n);return t=t.replace(/(\d|\))\s*[xX]\s*(?=\d|\()/g,`$1 * `),t=t.replace(/(\d)\s*\(/g,`$1 * (`),t=t.replace(/\)\s*(\d)/g,`) * $1`),t=t.replace(/\)\s*\(/g,`) * (`),t.trim()}var Se=/^(?:\d+(?:\.\d*)?|\.\d+|sqrt|[()+\-*/%^])/;function Ce(e){let t=[],n=0;for(;n<e.length;){if(/\s/.test(e[n])){n++;continue}let r=e.slice(n).match(Se);if(!r)throw Error(`Invalid character at position ${n}: ${e[n]}`);if(t.push(r[0]),n+=r[0].length,t.length>100)throw Error(`Too many tokens`)}return t}var we=class{constructor(e){this.tokens=e,this.position=0}peek(){return this.tokens[this.position]}consume(){return this.tokens[this.position++]}expect(e){if(this.consume()!==e)throw Error(`Expected ${e}`)}parse(){if(this.tokens.length===0)throw Error(`No valid tokens found`);let e=this.parseExpression();if(this.position!==this.tokens.length)throw Error(`Unexpected token: ${this.peek()}`);return e}parseExpression(){let e=this.parseTerm();for(;this.peek()===`+`||this.peek()===`-`;){let t=this.consume(),n=this.parseTerm();e=t===`+`?e+n:e-n,this.checkFinite(e)}return e}parseTerm(){let e=this.parsePower();for(;this.peek()===`*`||this.peek()===`/`;){let t=this.consume(),n=this.parsePower();if(t===`/`){if(n===0)throw Error(`Division by zero`);e/=n}else e*=n;this.checkFinite(e)}return e}parsePower(){let e=this.parseUnary();if(this.peek()===`^`){this.consume();let t=this.parsePower();e**=+t,this.checkFinite(e)}return e}parseUnary(){return this.peek()===`+`?(this.consume(),this.parseUnary()):this.peek()===`-`?(this.consume(),-this.parseUnary()):this.parsePostfix()}parsePostfix(){let e=this.parsePrimary();for(;this.peek()===`%`;)this.consume(),e/=100,this.checkFinite(e);return e}parsePrimary(){let e=this.peek();if(e===`(`){this.consume();let e=this.parseExpression();return this.expect(`)`),e}if(e===`sqrt`){this.consume();let e;if(this.peek()===`(`?(this.consume(),e=this.parseExpression(),this.expect(`)`)):e=this.parsePrimary(),e<0)throw Error(`Square root of negative number`);let t=Math.sqrt(e);return this.checkFinite(t),t}if(e===void 0||!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(e))throw Error(`Expected a number, received: ${e??`end`}`);this.consume();let t=Number(e);return this.checkFinite(t),t}checkFinite(e){if(!Number.isFinite(e))throw Error(`Calculation produced an invalid number`)}};function Te(e){return new we(Ce(e)).parse()}function Ee(e){return Object.is(e,-0)?0:Number.isFinite(e)?Math.abs(e-Math.round(e))<1e-12?Math.round(e):parseFloat(e.toPrecision(12)):e}function De(e){let t=xe(e),n=Te(t);if(!Number.isFinite(n))throw Error(`Result is not a finite number`);return{originalExpression:e,normalizedExpression:t,result:Ee(n)}}function Oe(e){let{originalExpression:t,normalizedExpression:n,result:r}=De(e);return{success:!0,originalExpression:t,normalizedExpression:n,answer:r}}var J=!0,Y=!1,X=null,Z={success:!1,expression:``,answer:null,ambiguous:!1};function Q(e){p({expression:e?.expression||`Scanning board...`,answer:e?.answer===void 0?null:e.answer,ambiguous:e?.ambiguous||!1,conflicts:e?.conflicts||null,isLiveTracking:J,onToggleTracking:Me,onManualScan:()=>$(!0)})}async function ke(e){let t=await ye(e),n=null,r=t.expression;if(r)try{n=Oe(r).answer}catch(e){console.warn(`Solve error:`,e.message)}return{success:n!==null,expression:r||``,answer:n,confidence:t.confidence,ambiguous:!1}}async function $(e=!1){let t=y();if(t){if(!e&&t===Z.expression&&Z.answer!==null)return Z;try{let e={success:!0,expression:t,answer:Oe(t).answer,source:`DOM`,ambiguous:!1};return Z=e,Q(e),e}catch(e){console.warn(`DOM expression solve error:`,e)}}try{let e=await ke((await b(v())).blob);if(e.success)return Z=e,Q(e),e}catch(e){console.warn(`Visual OCR fallback error:`,e)}return{success:!1,error:`Equation could not be resolved from board`}}function Ae(){J=!0,Q(Z),X&&clearInterval(X),X=setInterval(async()=>{if(!J||Y)return;let e=y();if(e&&e!==Z.expression){Y=!0;try{await $()}finally{Y=!1}}},80)}function je(){J=!1,X&&=(clearInterval(X),null),Q(Z)}function Me(){J?je():(Ae(),$(!0))}var Ne=null,Pe=new MutationObserver(()=>{J&&!Y&&(clearTimeout(Ne),Ne=setTimeout(()=>{let e=y();e&&e!==Z.expression&&$().catch(()=>{})},40))});document.body?(Pe.observe(document.body,{childList:!0,subtree:!0}),Ae()):window.addEventListener(`DOMContentLoaded`,()=>{Pe.observe(document.body,{childList:!0,subtree:!0}),Ae()}),chrome.runtime.onMessage.addListener((e,t,n)=>{if(e.action===`PING`)return n({status:`PONG`,isTracking:J,lastSolved:Z}),!0;if(e.action===`GET_STATUS`)return n({isTracking:J,lastSolved:Z}),!0;if(e.action===`TOGGLE_TRACKING`)return Me(),n({isTracking:J,lastSolved:Z}),!0;if(e.action===`AUTO_DETECT`)return $(!0).then(e=>n(e)).catch(e=>{n({success:!1,error:e.message||`Failed to detect equation`})}),!0;if(e.action===`PICK_ELEMENT`)return x(e=>{b(e).then(e=>ke(e.blob)).then(e=>{e.success&&(Z=e,Q(e))}).catch(e=>console.error(e))},()=>console.log(`Picker canceled`)),n({status:`Picker started`}),!0;if(e.action===`TRIGGER_CAPTURE`)return l(e=>{chrome.runtime.sendMessage({type:`CAPTURE_VISIBLE_TAB`},t=>{t&&t.success&&u(t.dataUrl,e).then(e=>ke(e.blob)).then(e=>{e.success&&(Z=e,Q(e))}).catch(e=>console.error(`Crop error:`,e))})},()=>console.log(`Capture canceled`)),n({status:`Selection initiated`}),!0})})();