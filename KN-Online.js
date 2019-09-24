// ==UserScript==
// @name KN-PaidContent-be-gone
// @description Das Script erkennt Paid-Content-Blöcke des KN-Online-Auftrittes und 'deaktiviert' diese Blöcke / Links. Das Timeout scheint nicht wirklich notwendig zu sein, aber da auf der Seite Viele Dinge nur mit Javascript, also nach DOM-Ready funktionieren, und ggf auf noch herauszufilternde Events gewartet werden muss, hab ich das jetz erstmal so drin gelassen.
// @namespace Violentmonkey Scripts
// @match https://www.kn-online.de/
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
#seite {
  position: relative;
}
#seite:before {
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
`;
const main = () => {
  let PC_els = document.querySelectorAll('[class*="paidcontent"]')
  ;
  let articles = document.querySelectorAll('[data-component="linkblock"]')
  ;
  let all_articles = articles.length
  ;
  let PDBshare_els = document.querySelectorAll('[class*="pdb-share-"]')
  ;
  PDBshare_els.forEach( (el, n) => {
    el.parentNode.removeChild(el);
  })
  ;
  let blocked_articles = PC_els.length;
  if( blocked_articles > 0 ) {
    //
    PC_els.forEach( (el, n) => {
      // each paid-content-link has most likely a wrapper / linkblock, so:
      let wrapper = el.closest('[data-component="linkblock"]')
      ;
      //trace(wrapper)
      //;
      if(wrapper !== undefined) {
        wrapper.setAttribute('style', `
          opacity: ${opac};  
          pointer-events: none; 
        `)
        ;
        addClass(wrapper, 'be-gone')
        ;
      } else {
        all_articles++;
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
    let percent = parseInt( ( blocked_articles / all_articles ) * 100, 10 ) + '%'
    ;
    //
    let style = document.createElement('style');
    cssstyles = cssstyles
      .replace(/{{blocked}}/g, blocked_articles + ' (' + all_articles + ')') 
      .replace(/{{articles}}/g, percent)
    ;
    style.appendChild( document.createTextNode( cssstyles ) );
    document.body.appendChild(style);
    //
    trace('KN-PaidContent-be-gone')
    ;
  }
}
;
setTimeout(main, 10)
;
