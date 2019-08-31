import Vue from 'vue'
import axios from 'axios'
import Router from 'vue-router'

import App from './App.vue'
import router from './router'
import 'normalize.css/normalize.css'
import './element-ui'

import './css/main.scss'
import 'vue2-animate/dist/vue2-animate.min.css'
import 'material-design-iconic-font/dist/css/material-design-iconic-font.min.css'
import $ from 'jquery'

Vue.use(require('vue2-transitions'))

Vue.use(Router)
if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.prototype.$http = axios
Vue.config.productionTip = false

declare global {
  interface Window {
    notify(message: string, level?: string, timeout?: number): void
    test: any
  }
}

/* notify */
window.notify = (message: string, level?: string, timeout?: number): void => {
  console.log('[notify][' + level + '][' + new Date().toLocaleString() + '] ' + message)

  timeout = timeout || 1000

  let layerElem = $('.notify-layer')
  if (layerElem.length === 0) {
    layerElem = $('<div class="notify-layer" />').appendTo('body')
  }

  let notifyElem = $('<div class="notify-item anim-fade-in ' + (level ? 'type-' + level : '') + '"><p class="notify-content"></p></div>')
  notifyElem.find('.notify-content').html(message.replace('\n', '<br/>'))
  notifyElem.prependTo(layerElem);

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

/* ipcRenderer.on('show-notify', (evt, args) => {
  window.notify(args[0], args[1], args[2])
})

ipcRenderer.on('reload-page', (evt, args) => {
  window.location.reload()
}) */

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  template: '<App/>'
}).$mount('#app')
