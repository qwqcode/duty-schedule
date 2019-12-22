import _ from 'lodash'
import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import { Area, Plan, Grp, PersonProfile, PlanGrp } from './data-interfaces'

/**
 * 数据查询类
 */
@Component({})
export default class DataQuery extends Vue {
  public created () {
    Vue.prototype.$dataQuery = this
  }

  render () { return '' }

  /** 获取计划（通过 ID） */
  public getPlan (planId: number): Plan | undefined {
    return _.find(this.$dataStore.PlanList, (o) => o.id === planId)
  }

  /** 获取所有区域的全部任务类型 */
  public getAllTaskInAllArea (): string[] {
    const arr: string[] = []
    _.forEach(this.$dataStore.AreaList, (area) => {
      _.forEach(area.taskList, (taskName) => {
        arr.push(taskName)
      })
    })
    return arr
  }

  /** 获取所有区域的全部任务类型（去除重复） */
  public getAllUniqueTaskInAllArea (): string[] {
    return _.uniq(this.getAllTaskInAllArea())
  }

  /** 获取 已去重 TaskList 的 AreaList */
  public getAreaListWithUniqueTask (): Area[] {
    const areaList = JSON.parse(JSON.stringify(this.$dataStore.AreaList))
    _.forEach(areaList, (area) => {
      area.taskList = _.uniq(area.taskList)
    })
    return areaList
  }

  /** 获取某个人的任务次数记录 */
  public getPersonTaskRec (personName: string, taskName: string): number {
    const taskRec = this.$dataStore.RecList.find(o => o.type === 'Task' && o.name === taskName)
    if (!taskRec) { return 0 }
    return taskRec.data[personName] || 0
  }

  /** 获取某个人的任务最后执行日期记录 */
  public getPersonTaskTime (personName: string, taskName: string): number {
    const taskRec = this.$dataStore.RecList.find(o => o.type === 'TaskTime' && o.name === taskName)
    if (!taskRec) { return -1 }
    return taskRec.data[personName] || -1
  }

  public getPlanListFilteredForGrpFate () {
    const effectivePlanDate = this.$dataStore.Settings.fate.effectivePlanDateForGrp
    if (!effectivePlanDate || effectivePlanDate.toString().trim() === '')
      return this.$dataStore.PlanList

    const planList = this.$dataStore.PlanList.filter(plan => {
      return plan.actionTime >= new Date(effectivePlanDate).getTime()
    })
    return planList
  }

  /** 获取某个组的区域次数记录 */
  public getGrpAreaRec (grpId: number, areaName: string|null = null): number {
    let result = 0
    if (areaName === null) {
      // 所有 Area 次数之和
      const allAreaRec = _.filter(this.$dataStore.RecList, o => o.type === 'Area')
      if (!allAreaRec) { return 0 }
      _.forEach(allAreaRec, (rec) => {
        result += rec.data[grpId] || 0
      })
    } else {
      const rec = this.$dataStore.RecList.find(o => o.type === 'Area' && o.name === areaName)
      result = rec ? (rec.data[grpId] || 0) : 0
    }
    return result
  }

  /** 获取某个人最后一次执行的 Plan */
  public getPersonLastWorkPlan (personName: string): Plan|null {
    const planList = this.$dataStore.PlanList
    if (!planList) return null
    const planListSorted: Plan[] | null = _.sortBy(planList, (o) => -o.actionTime) || null
    if (!planListSorted) return null
    let plan: Plan|null = null
    _.forEach(planListSorted, (planItem) => {
      const isExisting = _.flatMap(_.flatMap(planItem.grpList, o => o.personTaskList), o => o.person).includes(personName)
      if (isExisting) {
        plan = planItem
        return false // 停止遍历
      }
      return true
    })
    return plan
  }

  /** 某人最后做的是否为这个 Task */
  public getIsPersonLastDidTheTask (personName: string, taskName: string) {
    const planList = this.$dataStore.PlanList
    if (!planList) return false
    const lastWorkPlan = this.getPersonLastWorkPlan(personName)
    if (!lastWorkPlan) return false
    const findOne = _.flatMap(lastWorkPlan.grpList, o => o.personTaskList).find((o) => {
      return o.person === personName && o.task === taskName
    })
    return !!findOne
  }

  /** 获取个人资料 */
  public getPersonProfile (personName: string) {
    const findPerson = _.flatMap(this.$dataStore.GrpList, (o) => o.personList).includes(personName)
    if (!findPerson) { return null }

    const profile: PersonProfile = {
      name: personName,
      lastWorkPlan: this.getPersonLastWorkPlan(personName)
    }

    return profile
  }

  /** 根据 PlanGrp 获取每个任务下的成员名字列表 */
  getTaskPersonListByPlanGrp (planGrp: PlanGrp) {
    const taskList: { task: string; persons: string[] }[] = []
    _.forEach(planGrp.personTaskList, ({ task, person }) => {
      let taskItem = taskList.find((o) => o.task === task)
      if (!taskItem) {
        taskItem = { task, persons: [] }
        taskList.push(taskItem)
      }
      taskItem.persons.push(person)
    })

    return taskList
  }

  /** 某组是否存在于最新的 Plan 中 */
  public getIsGrpExitsInLatestPlan (grpId: number) {
    const latestPlan = _.sortBy(this.getPlanListFilteredForGrpFate(), o => -o.actionTime)[0]
    if (!latestPlan) return false
    return !!latestPlan.grpList.find(o => o.grpId === grpId)
  }

  /** 获取某组最后一次执行的 Plan */
  public getGrpLastWorkPlan (grpId: number): Plan|null {
    const planList = this.getPlanListFilteredForGrpFate()
    if (!planList) return null
    const planListSorted: Plan[] | null = _.sortBy(planList, (o) => -o.actionTime) || null
    if (!planListSorted) return null
    let plan: Plan|null = null
    _.forEach(planListSorted, (planItem) => {
      if (planItem.grpList.find(o => o.grpId === grpId)) {
        plan = planItem
        return false // 停止遍历
      }
      return true
    })
    return plan
  }

  /** 某组最后做的 Area */
  public getGrpLastDidArea (grpId: number) {
    const planList = this.getPlanListFilteredForGrpFate()
    if (!planList) return null
    const lastWorkPlan = this.getGrpLastWorkPlan(grpId)
    if (!lastWorkPlan) return null
    const find = lastWorkPlan.grpList.find(o => o.grpId === grpId)
    if (!find) return null
    return find.area
  }

  /** 某组最后做的是否为这个 Area */
  public getIsGrpLastDidTheArea (grpId: number, areaName: string) {
    const planList = this.getPlanListFilteredForGrpFate()
    if (!planList) return false
    const lastWorkPlan = this.getGrpLastWorkPlan(grpId)
    if (!lastWorkPlan) return false
    const findOne = lastWorkPlan.grpList.find((o) => {
      return o.grpId === grpId && o.area === areaName
    })
    return !!findOne
  }

  /**
   * 构建一个 AreaName->PersonNames 的表（区域名->全部负责该区域的人名）
   * @param grpToAreaDict 小组区域指定表 { [grpId]: areaName }
   */
  public getPersonsOfAreaNameDict (grpToAreaDict: {[grpId: number]: string}) {
    const personNamesOfAreas: {[areaName: string]: string[]} = {}
    _.forEach(grpToAreaDict, (area, grpId) => {
      let persons: string[] = []
      if (!_.has(personNamesOfAreas, area)) {
        personNamesOfAreas[area] = persons // 初始化
      } else {
        persons = personNamesOfAreas[area]
      }
      // 查询该组的全部人
      const findGrp = this.$dataStore.GrpList.find((o) => o.id === Number(grpId))
      if (findGrp !== undefined) {
        // 名字丢进 personNamesOfAreas[某区域] 里
        _.forEach(findGrp.personList, (personName) => persons.push(personName))
      }
    })
    return personNamesOfAreas
  }

  /**
   * @deprecated
   */
  public getOldTaskRecList (rangeGrpList: Grp[]) {
    const allTaskRec = _.filter(this.$dataStore.RecList, o => o.type === 'Task')
    type OldRec = {
      grpId: number
      /** 小组区域记录表 (key: 区域名) */
      areaList: {[area: string]: number}
      /** 个人任务记录表 (key: 任务名.人名) */
      taskList: {[task: string]: {
        [person: string]: number
      }}
    }
    const recList: OldRec[] = []
    _.forEach(rangeGrpList, (grp) => {
      const resultRec: OldRec = {
        grpId: grp.id,
        areaList: {},
        taskList: {}
      }
      _.forEach(allTaskRec, (recItem) => {
        _.forEach(recItem.data, (num, personName) => {
          if (grp.personList.includes(personName)) {
            if (!_.has(resultRec.taskList, recItem.name)) {
              resultRec.taskList[recItem.name] = {}
            }
            resultRec.taskList[recItem.name][personName] = num
          }
        })
      })
      recList.push(resultRec)
    })
    return recList
  }

  /**
   * 获取一定规则顺序的 TaskNameArray
   *
   * @deprecated
   * @param taskList
   * @param rangeGrpList
   * @returns 根据 rangeGrpList 的全部组中全部人的 “Task RecList 记录” 极差值生成倒序排列 ["TaskName.1", ...]
   * (TaskName 按全部组中全部人在 RecList 中做过该 Task 次数极差 (最大次数值 - 最小次数值) 值倒序排列)
   */
  public getTaskNameArrSorted (taskList: string[], rangeGrpList: Grp[]) {
    const oldRecList = this.getOldTaskRecList(rangeGrpList)
    const arr: {task: string, diff: number}[] = []
    _.forEach(taskList, (task) => arr.push({ task, diff: 0 }))
    _.forEach(rangeGrpList, (grp) => {
      const grpRec = oldRecList.find(o => o.grpId === grp.id)
      if (grpRec !== undefined) {
        _.forEach(grpRec.taskList, (personNumList, task) => {
          const listTask = arr.find(o => o.task === task)
          if (listTask === undefined) return
          let diff = (_.max(Object.values(personNumList)) || 0) - (_.min(Object.values(personNumList)) || 0)
          if (diff < 0) diff = 0
          if (diff > listTask.diff) listTask.diff = diff
        })
      }
    })
    const arrSorted = _.sortBy(arr, o => -o.diff)
    return _.flatMap(arrSorted, o => o.task)
  }

  /**
   * 获取 Task 的别名列表
   * @param taskName（目前 $dataStore.AreaList 中的 Task）
   */
  public getTaskAliasList (taskName: string) {
    const area = this.$dataStore.AreaList.find(o => o.taskList.includes(taskName))
    if (!area) return null
    return (area.taskAliasList && _.has(area.taskAliasList, taskName)) ? area.taskAliasList[taskName] : null
  }

  /**
   * 反向获取 目前全部存在该别名的 Task
   */
  public getTaskListByAlias (aliasTask: string) {
    const resultList: string[] = []
    _.forEach(this.$dataStore.AreaList, (area) => {
      _.forEach(area.taskAliasList, (aliasTaskList, curtTaskName) => {
        if (aliasTaskList.includes(aliasTask)) {
          resultList.push(curtTaskName)
        }
      })
    })
    return resultList
  }

  /**
   * 判断是否为别名 Task
   *
   * @param testTask 待测试的 Task
   * @param curtTask 指定待测 Task 范围（目前 $dataStore.AreaList 中的 Task）
   */
  public testIsAliasTask (testTask: string, curtTask?: string) {
    if (!curtTask) {
      return this.getTaskListByAlias(testTask).length > 0
    }
    const aliasList = this.getTaskAliasList(curtTask)
    if (!aliasList) return false
    return (aliasList.includes(testTask))
  }

  public padWithZeros (vNumber: number, width: number): string {
    let numAsString = vNumber.toString()
    while (numAsString.length < width) {
      numAsString = `0${numAsString}`
    }
    return numAsString
  }

  public dateFormat (date: Date) {
    const vDay = this.padWithZeros(date.getDate(), 2)
    const vMonth = this.padWithZeros(date.getMonth() + 1, 2)
    const vYear = this.padWithZeros(date.getFullYear(), 2)
    // var vHour = padWithZeros(date.getHours(), 2);
    // var vMinute = padWithZeros(date.getMinutes(), 2);
    // var vSecond = padWithZeros(date.getSeconds(), 2);
    return `${vYear}-${vMonth}-${vDay}`
  }

  public timeAgo (date: Date) {
    try {
      const oldTime = date.getTime()
      const currTime = new Date().getTime()
      const diffValue = currTime - oldTime

      const days = Math.floor(diffValue / (24 * 3600 * 1000))
      if (days === 0) {
        // 计算相差小时数
        const leave1 = diffValue % (24 * 3600 * 1000) // 计算天数后剩余的毫秒数
        const hours = Math.floor(leave1 / (3600 * 1000))
        if (hours === 0) {
          // 计算相差分钟数
          const leave2 = leave1 % (3600 * 1000) // 计算小时数后剩余的毫秒数
          const minutes = Math.floor(leave2 / (60 * 1000))
          if (minutes === 0) {
            // 计算相差秒数
            const leave3 = leave2 % (60 * 1000) // 计算分钟数后剩余的毫秒数
            const seconds = Math.round(leave3 / 1000)
            return `${seconds} 秒前`
          }
          return `${minutes} 分钟前`
        }
        return `${hours} 小时前`
      }
      if (days < 0) return '刚刚'

      return (days < 8) ? `${days} 天前` : this.dateFormat(date)
    } catch (error) {
      window.console.error(error)
      return ''
    }
  }
}
