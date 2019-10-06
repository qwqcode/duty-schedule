import Vue from 'vue'
import axios from 'axios'
import Router from 'vue-router'
import VueTransitions from 'vue2-transitions'
import Element from 'element-ui'

import App from './App.vue'
import router from './router'
import 'normalize.css/normalize.css'

import 'element-ui/lib/theme-chalk/index.css'
import './css/main.scss'
import 'vue2-animate/dist/vue2-animate.min.css'
import 'material-design-iconic-font/dist/css/material-design-iconic-font.min.css'

Vue.use(Element)

Vue.use(VueTransitions)

Vue.use(Router)

// eslint-disable-next-line global-require
if (!process.env.IS_WEB) Vue.use(require('vue-electron'))

Vue.prototype.$http = axios
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  template: '<App/>'
}).$mount('#app')
