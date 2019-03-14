import { ipcRenderer } from 'electron'
import $ from 'jquery'
import Vue from 'vue'
import axios from 'axios'
import Router from 'vue-router'

import App from './App'
import router from './router'
import store from './store'
import 'normalize.css/normalize.css'
import './element-ui'

import './css/main.scss'
import 'material-design-iconic-font/dist/css/material-design-iconic-font.min.css'

Vue.use(Router)
if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false
/* notify */
window.notify = (message, level, timeout) => {
  console.log('[notify][' + level + '][' + new Date().toLocaleString() + '] ' + message)

  timeout = timeout || 1000

  let layerElem = $('.notify-layer')
  if (layerElem.length === 0) {
    layerElem = $('<div class="notify-layer" />').appendTo('body')
  }

  let notifyElem = $('<div class="notify-item anim-fade-in ' + (level ? 'type-' + level : '') + '"><p class="notify-content"></p></div>')
  notifyElem.find('.notify-content').html(message.replace('\n', '<br/>'))
  notifyElem.prependTo(layerElem)

  let notifyRemove = function () {
    notifyElem.addClass('anim-fade-out')
    setTimeout(function () {
      notifyElem.remove()
    }, 200)
  }

  let timeOutFn = setTimeout(() => {
    notifyRemove()
  }, timeout)

  notifyElem.click(() => {
    clearTimeout(timeOutFn)
    notifyRemove()
  })
}

ipcRenderer.on('show-notify', (evt, args) => {
  window.notify(args[0], args[1], args[2])
})

ipcRenderer.on('reload-page', (evt, args) => {
  window.location.reload()
})

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
