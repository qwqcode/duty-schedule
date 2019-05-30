import Router from 'vue-router'

export default new Router({
  routes: [
    {
      path: '/Schedule',
      name: 'home',
      component: require('@/pages/Schedule').default
    },
    {
      path: '/Builder',
      component: require('@/pages/Builder').default
    },
    {
      path: '/GrpList',
      component: require('@/pages/GrpList').default
    },
    {
      path: '/AreaList',
      component: require('@/pages/AreaList').default
    },
    {
      path: '/Setting',
      component: require('@/pages/Setting').default
    },
    {
      path: '*',
      redirect: '/Schedule'
    }
  ],
  linkActiveClass: 'active'
})
