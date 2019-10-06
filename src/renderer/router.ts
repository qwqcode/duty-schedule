/* eslint-disable global-require */
import Router from 'vue-router'

export default new Router({
  routes: [
    {
      path: '/Schedule',
      name: 'home',
      component: require('@/pages/Schedule.vue').default
    },
    {
      path: '/Builder',
      component: require('@/pages/Builder.vue').default
    },
    {
      path: '/GrpList',
      component: require('@/pages/GrpList.vue').default
    },
    {
      path: '/AreaList',
      component: require('@/pages/AreaList.vue').default
    },
    {
      path: '/Setting',
      component: require('@/pages/Setting.vue').default
    },
    {
      path: '*',
      redirect: '/Schedule'
    }
  ],
  linkActiveClass: 'active'
})
