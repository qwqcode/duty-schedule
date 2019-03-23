import Router from 'vue-router'

export default new Router({
  routes: [
    {
      path: '/schedule',
      name: 'home',
      component: require('@/pages/Schedule').default
    },
    {
      path: '/builder',
      component: require('@/pages/Builder').default
    },
    {
      path: '/viewer/:title',
      name: 'viewer',
      props: true,
      component: require('@/pages/Viewer').default
    },
    {
      path: '/groupList',
      component: require('@/pages/GroupList').default
    },
    {
      path: '/taskTypeList',
      component: require('@/pages/TaskTypeList').default
    },
    {
      path: '/setting',
      component: require('@/pages/Setting').default
    },
    {
      path: '*',
      redirect: '/schedule'
    }
  ],
  linkActiveClass: 'active'
})
