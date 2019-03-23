import _ from 'lodash'

const state = {
  taskList: [],
  groupList: [],
  taskTypeList: {},
  taskTypeCountList: {}
}

const mutations = {
  SET_SETTING (state, obj) {
    state[obj[0]] = obj[1]
    if (typeof obj[2] === 'undefined' || obj[2]) {
      window.notify(`配置 ${obj[0]} 已保存`)
    }
  },

  PUSH_TASK (state, task) {
    state.taskList.push(task)
    this.dispatch('Setting/syncTaskTypeCount')
  }
}

const actions = {
  /** 同步 Task Type 计数 */
  syncTaskTypeCount ({ commit, state }) {
    let countList = {}
    _.forEach(state.taskList, (task) => {
      _.forEach(task.groupList, (group) => {
        _.forEach(group.data, (item) => {
          let task = item.task
          let name = item.name
          if (!countList[task]) {
            countList[task] = {}
          }
          if (typeof countList[task][name] === 'undefined') {
            countList[task][name] = 1
          } else {
            countList[task][name] += 1
          }
        })
      })
    })

    commit('SET_SETTING', ['taskTypeCountList', countList, false])
  }
}

const getters = {
  getTaskTypeCount: (state) => (taskType, name) => {
    return state.taskTypeCountList[taskType] ? (state.taskTypeCountList[taskType][name] || 0) : 0
  },

  groupMemberFlatList: (state, getters) => {
    let groupList = state.groupList
    let flatList = []
    for (let groupI in groupList) {
      for (let o in groupList[groupI].data) {
        flatList.push(groupList[groupI].data[o])
      }
    }

    return flatList
  },

  taskTypeFlatList: (state, getters) => {
    let rawTaskTypeList = state.taskTypeList
    let flatList = []
    for (let groupI in rawTaskTypeList) {
      for (let typeI in rawTaskTypeList[groupI].data) {
        flatList.push(rawTaskTypeList[groupI].data[typeI])
      }
    }
    return flatList
  },

  taskTypeListUnique: (state, getters) => {
    return getters.taskTypeFlatList.filter((val, index, array) => {
      return array.indexOf(val) === index
    })
  },

  /** 每种 taskType 最多需要分配的人数 */
  taskTypeMaxNeedNumList: (state, getters) => {
    let list = {}
    _.forEach(getters.taskTypeFlatList, (item) => {
      if (typeof list[item] === 'undefined') {
        list[item] = 0
      }
      list[item]++
    })
    return list
  }
}

export default {
  state,
  mutations,
  actions,
  getters
}
