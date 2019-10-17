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
const removeClass = (el, className) => {
  el.classList.remove(className);
}
;
const hasClassLike = (list, str) => {
  if([...list].join(' ').indexOf('freeuntilbadge_open') > -1 ){
      return true;
  } else {
      return false;
  }
}
;
const extractTime = (str) => {
  return str.match(/(\d{1,2}([:])\d{1,2})/gm)[0];
}
;
const addTimer = (el) => {
  let minutes = el.getAttribute('data-minutes');
  if(minutes === 0) {
    addClass(el, 'be-gone');
    removeClass(el, 'be-gone-soon');
  } else {
    let intV = setInterval( (el) => {
      let m = el.getAttribute('data-minutes')-1;
      trace(m)
      if (m < 1) {
        clearInterval(intV);
        addClass(el, 'be-gone');
        removeClass(el, 'be-gone-soon');
        removeClass(el, 'be-gone-soon-soon');
        trace(el)
      }
      if (m < 5 && m > 0) {
        addClass(el, 'be-gone-soon-soon');
      }
      el.setAttribute('data-minutes', m)
      
    }, 1000*60, el);
  }
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
.pdb-bigteaser-item.be-gone-soon {
  display: flex;
  flex-direction: column;
  
}
.be-gone-soon {
  position: relative;
  display: block;
}
.be-gone-soon > [class*="teaser-release"] {
  bottom: initial;
}
.be-gone-soon:after {
  position: absolute;
  z-index: 1;
  left: 15px;
  top: 15px;
  content: attr(data-minutes);
  font-family: sans-serif;
  font-size: 11px;
  font-weight: 700;
  background: #FFF;
  box-shadow: 0 3px 5px 0 rgba(0,0,0,0.5);
  width: 3em;
  height: 3em;
  line-height: 3em;
  border-radius: 50%;
  text-align:center;
}
.be-gone-soon:before {
  position: absolute;
  content: '';
  z-index: 2;
  left: calc(14px + 1.5em);
  top: 15px;
  font-family: sans-serif;
  font-size: 11px;
  font-weight: 700;
  width: 2px;
  background: rgba(0, 0, 0, 0.3);
  height: 1.5em;
  transform-origin: bottom center;
  animation:spin 60s linear infinite;
}
.be-gone-soon-soon:after {
  background: red;
  color: #FFF;
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
    background: red;
  }
  2% {
    transform: rotate(0deg);
    background: rgba(0, 0, 0, 0.3);
  }
  100% { 
    transform: rotate(359deg);
  }
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
      let freeuntil = hasClassLike(el.classList, 'freeuntilbadge_open');
      //trace(el, freeuntil)
      if(!freeuntil) {
        // each paid-content-link has most likely a wrapper / linkblock, so:
        let wrapper = el.closest('[data-component="linkblock"]')
        ;
        if( !hasClass(wrapper, 'be-gone-soon') ) {
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
        }
      } else {
        let wrapper = el.closest('[data-component="linkblock"]')
        ;
        let time = extractTime(el.textContent).split(':');
        let now = new Date();
        let day = now.getDate();
        let month = now.getMonth();
        let year = now.getFullYear();
        let then = new Date(year, month, day, time[0], time[1]);
        let diff = Math.abs(then - now);
        let minutes = Math.floor((diff/1000)/60);
        wrapper.setAttribute('data-minutes', minutes);
        addClass(wrapper, 'be-gone-soon')
        addTimer(wrapper);
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
