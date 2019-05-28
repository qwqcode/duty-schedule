import Router from 'vue-router'

export default new Router({
  routes: [
    {
      path: '/schedule',
      name: 'home',
      component: require('@/pages/Schedule').default
    },
    {
      path: '*',
      redirect: '/schedule'
    }
  ],
  linkActiveClass: 'active'
})
