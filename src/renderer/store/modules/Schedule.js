const state = {
  main: 0,
  scheduleList: {},
  taskTypeCountList: {
    '教室 地面扫+拖': {
      '毛铁林': 5
    }
  }
}

const mutations = {
  SET_SCHEDULE (state, obj) {
    state[obj[0]] = obj[1]
    window.notify(`配置 ${obj[0]} 已保存`)
  }
}

const actions = {
}

const getters = {
  getTaskTypeCount: (state) => (taskType, name) => {
    return state.taskTypeCountList[taskType] ? (state.taskTypeCountList[taskType][name] || 0) : 0
  }
}

export default {
  state,
  mutations,
  actions,
  getters
}
