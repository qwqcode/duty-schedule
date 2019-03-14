const state = {
  groupList: {},
  taskTypeList: {}
}

const mutations = {
  SET_SETTING (state, obj) {
    state[obj[0]] = obj[1]
    window.notify(`配置 ${obj[0]} 已保存`)
  }
}

const actions = {
  updateSetting ({ commit, state }, { key, val }) {
    console.log('11')
    commit('SET_SETTING', { key, val })
  }
}

const getters = {
  taskTypeFlatList: (state, getters) => {
    let rawTaskTypeList = state.taskTypeList
    let flatList = []
    for (let groupI in rawTaskTypeList) {
      for (let typeI in rawTaskTypeList[groupI]) {
        flatList.push(rawTaskTypeList[groupI][typeI])
      }
    }
    return flatList
  },
  taskTypeListUnique: (state, getters) => {
    return getters.taskTypeFlatList.filter((val, index, array) => {
      return array.indexOf(val) === index
    })
  }
}

export default {
  state,
  mutations,
  actions,
  getters
}
