import _ from 'lodash'

const state = {
  taskList: [],
  memberGroupList: [],
  taskTypeGroupList: {},
  taskTypeCountList: {},
  taskTypeGroupCountList: {}
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
    this.dispatch('Setting/syncTaskTypeGroupCount')
  }
}

const actions = {
  /** 同步 Task Type 计数 */
  syncTaskTypeCount ({ commit, state }) {
    let countList = {}
    _.forEach(state.taskList, (task) => {
      _.forEach(task.memberGroupList, (group) => {
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
  },

  /** 同步 taskTypeGroupCountList 记数 */
  syncTaskTypeGroupCount ({ commit, state }) {
    let countList = {}
    _.forEach(state.taskTypeGroupList, (taskTypeGroup) => {
      let taskTypeGroupName = taskTypeGroup.name
      countList[taskTypeGroupName] = {}

      _.forEach(state.taskList, (task) => {
        _.forEach(task.memberGroupList, (group) => {
          if (typeof countList[taskTypeGroupName][group.name] !== 'number') {
            countList[taskTypeGroupName][group.name] = 0
          }

          if (group.taskTypeGroupName === taskTypeGroupName) {
            countList[taskTypeGroupName][group.name] += 1
          }
        })
      })
    })

    commit('SET_SETTING', ['taskTypeGroupCountList', countList, false])
  }
}

const getters = {
  getTaskTypeCount: (state) => (taskType, name) => {
    return state.taskTypeCountList[taskType] ? (state.taskTypeCountList[taskType][name] || 0) : 0
  },

  /**
   * fuzzyTaskTypeGroupNameMode 模糊查询
   * $vm.$store.getters["Setting/getTaskTypeGroupCount"]("教室 A", "第 3 组", true)
   */

  getTaskTypeGroupCount: (state) => (taskTypeGroupName, memberGroupName, fuzzyTaskTypeGroupNameMode) => {
    let taskTypeGroupCountList = state.taskTypeGroupCountList
    if (typeof fuzzyTaskTypeGroupNameMode === 'boolean' && fuzzyTaskTypeGroupNameMode === true) {
      // 模糊任务类型组名模式查询
      let taskTypeGroupNameFuzzy = taskTypeGroupName.match(new RegExp('^(公区|教室).*$'))[1]
      if (!taskTypeGroupNameFuzzy) {
        return 0
      }
      let countResult = 0
      _.forEach(taskTypeGroupCountList, (item, itemGroupName) => {
        if (itemGroupName.indexOf(taskTypeGroupNameFuzzy) === 0) {
          countResult += item[memberGroupName]
        }
      })
      return countResult
    }
    return taskTypeGroupCountList[taskTypeGroupName] ? (taskTypeGroupCountList[taskTypeGroupName][memberGroupName] || 0) : 0
  },

  memberGroupListFlat: (state, getters) => {
    let memberGroupList = state.memberGroupList
    let flatList = []
    for (let groupI in memberGroupList) {
      for (let o in memberGroupList[groupI].data) {
        flatList.push(memberGroupList[groupI].data[o])
      }
    }

    return flatList
  },

  taskTypeGroupListFlat: (state, getters) => {
    let rawTaskTypeGroupList = state.taskTypeGroupList
    let flatList = []
    for (let groupI in rawTaskTypeGroupList) {
      for (let typeI in rawTaskTypeGroupList[groupI].data) {
        flatList.push(rawTaskTypeGroupList[groupI].data[typeI])
      }
    }
    return flatList
  },

  taskTypeGroupListUnique: (state, getters) => {
    return getters.taskTypeGroupListFlat.filter((val, index, array) => {
      return array.indexOf(val) === index
    })
  },

  /** 每种 taskType 最多需要分配的人数 */
  eachTaskTypeMaxNeedNumList: (state, getters) => {
    let list = {}
    _.forEach(getters.taskTypeGroupListFlat, (item) => {
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
