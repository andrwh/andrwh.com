require('style!css!./basestyles.css')
import preStyles from 'raw!./styles/prestyles.css'
let styleText = [0].map((i) => { return require(`raw!./styles/styles${i}.css`)})
let style, styleElement, workElement, skipAnimationElement, pauseElement
let animationSkipped = false, paused = false, done = false

const initialize = () => {
  console.log('we\'re ready to rock')
  insertPreStyle()
  writeLinks()
  createSelectors()
  createEventHandlers()
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

document.addEventListener('DOMContentLoaded', initialize)
