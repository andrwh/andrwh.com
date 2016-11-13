require('style!css!./basestyles.css')

const initialize = () => {
  console.log('we\'re ready to rock')
  writeLinks()
}

const writeLinks = () => {
  let html = require('raw!./links.html')
  let header = document.querySelector('header')
  header.innerHTML = html
}

document.addEventListener('DOMContentLoaded', initialize)
