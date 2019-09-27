// ==UserScript==
// @name SZ-PaidContent-be-gone
// @namespace Violentmonkey Scripts
// @match https://www.sueddeutsche.de/
// @description Das Script erkennt Paid-Content-Blöcke des SZ-Online-Auftrittes und 'deaktiviert' diese Blöcke / Links. 
// @grant unsafeWindow
// ==/UserScript==
// 
// 
let trace = console.log;
//
const hasClass = (el, className) => {
  return el.classList ? el.classList.contains(className) : new RegExp('\\b'+ className+'\\b').test(el.className);
}
;
const addClass = (el, className) => {
  if (el.classList) el.classList.add(className);
  else if (!hasClass(el, className)) el.className += ' ' + className;
}
;
const opac = 0.2
;
let cssstyles = `
.sz-content {
  position: relative;
}
.sz-content:before {
  content: '🙈 Articles plussed: {{blocked}} ({{articles}})';

  position: fixed;
  z-index: 10000000;
  right: 0;
  top: 70px;
  
  background: #FFF;
  color: red;
  padding: 0.2em 0.5em;
  text-align: center;
  font-family: sans-serif;
  font-size: 11px;
  font-weight: 600;
  
  box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.5);
}

.be-gone .be-gone {
  opacity: 1 !important;
}

.be-gone-special-sp {
  position: absolute;
  z-index: 10000;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.8);
  cursor: auto;
}
.be-gone-special a {
  pointer-events: none;
}
`;
const main = () => {
  let PC_els = document.querySelectorAll('[class*="label-plus"]')
  ;
  let PCS_els = document.querySelectorAll('[class="interactiveeditorial"]')
  ;
  let articles = document.querySelectorAll('[class="sz-teaser"]')
  ;
  let all_articles = articles.length;
  ;
  let blocked_articles = PC_els.length;
  if( blocked_articles > 0 ) {
    //
    PC_els.forEach( (el, n) => {
      // each paid-content-link has most likely a wrapper / linkblock, so:
      let wrapper = el.closest('[class="sz-teaser"]')
      ;
      if(wrapper !== undefined && wrapper !== null) {
        wrapper.setAttribute('style', `
          opacity: ${opac};  
          pointer-events: none; 
        `)
        ;
        addClass(wrapper, 'be-gone')
        ;
      } else {
        el.setAttribute('style', `
          opacity: ${opac};  
          pointer-events: none;
        `)
        ;
        addClass(el, 'be-gone')
        ;        
      }
    })
    ;
    //
    PCS_els.forEach( (el, n) => {
      addClass(el, 'be-gone-special')
      ;
      let sp = document.createElement('div');
      addClass(sp, 'be-gone-special-sp');
      el.appendChild(sp);
    })
    ;
    //
    let percent = 0
    ;
    trace(all_articles)
    if(all_articles <= 0) {
      percent = '???' + '%'
      ;
    } else {
      percent = parseInt( ( blocked_articles / all_articles ) * 100, 10 ) + '%'
      ;
    }
    //
    let style = document.createElement('style');
    cssstyles = cssstyles
      .replace(/{{blocked}}/g, blocked_articles + ' (' + (all_articles === -1 ? '???' : all_articles)  + ')') 
      .replace(/{{articles}}/g, percent)
    ;
    style.appendChild( document.createTextNode( cssstyles ) );
    document.body.appendChild(style);
    //
    trace('[FF] SZ-PaidContent-be-gone')
    ;
  }
}
;
setTimeout(main, 10)
;
