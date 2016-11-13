require('style!css!./basestyles.css')
import 'classlist-polyfill'
import preStyles from 'raw!./styles/prestyles.css'
import Promise from 'bluebird'
import getPrefix from './lib/getPrefix'
import replaceURLs from './lib/replaceURLs'
import {default as writeChar, writeSimpleChar, handleChar} from './lib/writeChar'

// Variables
const isDev = window.location.hostname === 'localhost';
const speed = isDev ? 0 : 16;
let styleText = [0].map((i) => { return require(`raw!./styles/styles${i}.css`)})
let style, styleElement, workElement, skipAnimationElement, pauseElement
let animationSkipped = false, paused = false, done = false, browserPrefix

const initialize = () => {
  console.log('we\'re ready to rock')
  getBrowserPrefix()
  insertPreStyle()
  writeLinks()
  createSelectors()
  createEventHandlers()
  startAnimation()
}

async function startAnimation() {
  try {
    await writeTo(styleElement, styleText[0], 0, speed, true, 1)
  }

  catch(e) {
    if (e.message === 'SKIP') {
      userIsBored()
    } else {
      throw e
    }
  }
}

const userIsBored = () => {
  if (done) return
  done = true
  let txt = styleText.join('\n')

  // The work-text animations are rough
  style.textContent = "#work-text * { " + browserPrefix + "transition: none; }"
  style.textContent += txt
  let styleHTML = ""
  for(let i = 0; i < txt.length; i++) {
     styleHTML = handleChar(styleHTML, txt[i])
  }
  styleElement.innerHTML = styleHTML;
  createWorkBox()

  // There's a bit of a scroll problem with this thing
  let start = Date.now()
  while(Date.now() - 1000 > start) {
    workElement.scrollTop = Infinity
    styleElement.scrollTop = Infinity
    // await Promise.delay(16)
  }
}

const insertPreStyle = () => {
  let preStyleElement = document.createElement('style')
  preStyleElement.textContent = preStyles
  document.head.insertBefore(preStyleElement, document.querySelector('style'))
}

const createSelectors = () => {
  // use global selectors
  style = document.querySelector('#style-tag')
  styleElement = document.querySelector('#style-text')
  workElement = document.querySelector('#work-text')
  skipAnimationElement = document.querySelector('#skip-animation')
  pauseElement = document.querySelector('#pause-resume')
}

// Necessary to get prefix for old browser versions of Android
const getBrowserPrefix = () => {
  // Ghetto per-browser prefixing
  browserPrefix = getPrefix() // could be empty string, which is fine
  styleText = styleText.map(function(text) {
    return text.replace(/-webkit-/g, browserPrefix)
  });
}

const createEventHandlers = () => {
  // allows user entry to live update style
  styleElement.addEventListener('input', () => {
    style.textContent = styleElement.textContent
  })

  // skip animation if clicked
  skipAnimationElement.addEventListener('click', (e) => {
    e.preventDefault()
    animationSkipped = true
  })

  pauseElement.addEventListener('click', (e) => {
    let text = pauseElement.textContent
    e.preventDefault()
    if (paused) {
      text = "Paused"
      paused = false
    } else {
      text = "Resume"
      paused = true
    }
  })
}

const writeLinks = () => {
  let html = require('raw!./links.html')
  let header = document.querySelector('.links')
  header.innerHTML = html
}

//
// Fire a listener when scrolling the 'work' box.
//
const createWorkBox = () => {
  if (workElement.classList.contains('flipped')) return
  workElement.innerHTML = '<div class="text">' + replaceURLs(workText) + '</div>' +
                     '<div class="md">' + replaceURLs(md(workText)) + '<div>'

  workElement.classList.add('flipped')
  workElement.scrollTop = 9999

  // flippy floppy
  let flipping = 0
  require('mouse-wheel')(workElement, async function(dx, dy) {
    if (flipping) return
    let flipped = workElement.classList.contains('flipped')
    let half = (workElement.scrollHeight - workElement.clientHeight) / 2
    let pastHalf = flipped ? workElement.scrollTop < half : workElement.scrollTop > half

    // If we're past half, flip the el.
    if (pastHalf) {
      workElement.classList.toggle('flipped')
      flipping = true
      await Promise.delay(500)
      workElement.scrollTop = flipped ? 0 : 9999
      flipping = false
    }

    // Scroll. If we've flipped, flip the scroll direction.
    workElement.scrollTop += (dy * (flipped ? -1 : 1))
  }, true)
}

/**
 * Helpers
 */

let endOfSentence = /[\.\?\!]\s$/;
let comma = /\D[\,]\s$/;
let endOfBlock = /[^\/]\n\n$/;

async function writeTo(el, message, index, interval, mirrorToStyle, charsPerInterval){
  if (animationSkipped) {
    // Lol who needs proper flow control
    throw new Error('SKIP');
  }
  // Write a character or multiple characters to the buffer.
  let chars = message.slice(index, index + charsPerInterval);
  index += charsPerInterval;

  // Ensure we stay scrolled to the bottom.
  el.scrollTop = el.scrollHeight;

  // If this is going to <style> it's more complex; otherwise, just write.
  if (mirrorToStyle) {
    writeChar(el, chars, style);
  } else {
    writeSimpleChar(el, chars);
  }

  // Schedule another write.
  if (index < message.length) {
    let thisInterval = interval;
    let thisSlice = message.slice(index - 2, index + 1);
    if (comma.test(thisSlice)) thisInterval = interval * 30;
    if (endOfBlock.test(thisSlice)) thisInterval = interval * 50;
    if (endOfSentence.test(thisSlice)) thisInterval = interval * 70;

    do {
      await Promise.delay(thisInterval);
    } while(paused);

    return writeTo(el, message, index, interval, mirrorToStyle, charsPerInterval);
  }
}

document.addEventListener('DOMContentLoaded', initialize)
