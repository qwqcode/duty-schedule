import _ from 'lodash'
import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import { Rec, Area, Plan, Grp, PersonProfile, PlanGrp } from './data-interfaces'

/**
 * 数据查询类
 */
@Component({})
export default class DataQuery extends Vue {
  public created () {
    Vue.prototype.$dataQuery = this
  }

  /** 获取计划（通过 ID） */
  public getPlan (planId: number): Plan | undefined {
    return _.find(this.$dataStore.PlanList, (o) => o.id === planId)
  }

  /** 获取所有区域的全部任务类型 */
  public getAllTaskInAllArea (): string[] {
    let arr: string[] = []
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

  /** 获取 TaskList 已去除重复的 AreaList */
  public getAreaListWithUniqueTask (): Area[] {
    let areaList = JSON.parse(JSON.stringify(this.$dataStore.AreaList))
    _.forEach(areaList, (area) => {
      area.taskList = _.uniq(area.taskList)
    })
    return areaList
  }

  /** 获取某个组的 Rec 实例 */
  public getGrpRec (grpId: number): Rec | undefined {
    return _.find(this.$dataStore.RecList, (o) => o.grpId === grpId)
  }

  /** 获取某个人的任务次数记录 */
  public getPersonTaskRec (personName: string, taskName: string): number {
    let result: number = 0
    _.find(this.$dataStore.RecList, (rec) => {
      if (rec.taskList.hasOwnProperty(taskName) && rec.taskList[taskName].hasOwnProperty(personName)) {
        result = rec.taskList[taskName][personName] || 0
        return false
      }
    })
    return result
  }

  /** 获取某个组的区域次数记录 */
  public getGrpAreaRec (grpId: number, areaName: string): number {
    let grpRec = this.getGrpRec(grpId)
    if (grpRec === undefined) return 0
    return grpRec.areaList[areaName] || 0
  }

  /** 获取某个人最后一次执行的 Plan */
  public getPersonLastWorkPlan (personName: string): Plan|null {
    let planList = this.$dataStore.PlanList
    if (!planList) return null
    let planListSorted: Plan[] | null = _.sortBy(planList, (o) => -o.time) || null
    if (!planListSorted) return null
    let plan: Plan|null = null
    _.forEach(planListSorted, (planItem) => {
      let isExisting = _.flatMap(_.flatMap(planItem.grpList, o => o.personTaskList), o => o.person).includes(personName)
      if (isExisting) {
        plan = planItem
        return false // 停止遍历
      }
    })
    return plan
  }

  /** 某人最后做的是否为这个 Task */
  public getIsPersonLastDidTheTask (personName: string, taskName: string) {
    let planList = this.$dataStore.PlanList
    if (!planList) return false
    let lastWorkPlan = this.getPersonLastWorkPlan(personName)
    if (!lastWorkPlan) return false
    let findOne = _.flatMap(lastWorkPlan.grpList, o => o.personTaskList).find((o) => {
      return o.person === personName && o.task === taskName
    })
    return !!findOne
  }

  /** 获取个人资料 */
  public getPersonProfile (personName: string) {
    let findPerson = _.flatMap(this.$dataStore.GrpList, (o) => o.personList).includes(personName)
    if (!findPerson) { return null }

    let profile: PersonProfile = {
      name: personName,
      lastWorkPlan: this.getPersonLastWorkPlan(personName)
    }

    return profile
  }

  /** 某组是否存在于最新的 Plan 中 */
  public getIsGrpExitsInLatestPlan (grpId: number) {
    let latestPlan = _.sortBy(this.$dataStore.PlanList, o => -o.time)[0]
    if (!latestPlan) return false
    return !!latestPlan.grpList.find(o => o.grpId === grpId)
  }

  /**
   * 构建一个 AreaName->PersonNames 的表（区域名->全部负责该区域的人名）
   * @param grpToAreaDict 小组区域指定表 { [grpId]: areaName }
   */
  public getPersonsOfAreaNameDict (grpToAreaDict: {[grpId: number]: string}) {
    let personNamesOfAreas: {[areaName: string]: string[]} = {}
    _.forEach(grpToAreaDict, (area, grpId) => {
      let persons: string[] = []
      if (!personNamesOfAreas.hasOwnProperty(area)) {
        personNamesOfAreas[area] = persons // 初始化
      } else {
        persons = personNamesOfAreas[area]
      }
      // 查询该组的全部人
      let findGrp = this.$dataStore.GrpList.find((o) => o.id === Number(grpId))
      if (findGrp !== undefined) {
        // 名字丢进 personNamesOfAreas[某区域] 里
        _.forEach(findGrp.personList, (personName) => persons.push(personName))
      }
    })
    return personNamesOfAreas
  }

  /**
   * 获取一定规则顺序的 TaskNameArray
   *
   * @param taskList
   * @param rangeGrpList
   * @returns 根据 rangeGrpList 的全部组中全部人的 “Task RecList 记录” 极差值生成倒序排列 ["TaskName.1", ...]
   * (TaskName 按全部组中全部人在 RecList 中做过该 Task 次数极差 (最大次数值 - 最小次数值) 值倒序排列)
   */
  public getTaskNameArrSorted (taskList: string[], rangeGrpList: Grp[]) {
    let arr: {task: string, diff: number}[] = []
    _.forEach(taskList, (task) => arr.push({task: task, diff: 0}))
    _.forEach(rangeGrpList, (grp) => {
      let grpRec = this.$dataStore.RecList.find(o => o.grpId === grp.id)
      if (grpRec !== undefined) {
        _.forEach(grpRec.taskList, (personNumList, task) => {
          let listTask = arr.find(o => o.task === task)
          if (listTask === undefined) return
          let diff = (_.max(Object.values(personNumList)) || 0) - (_.min(Object.values(personNumList)) || 0)
          if (diff < 0) diff = 0
          if (diff > listTask.diff) listTask.diff = diff
        })
      }
    })
    let arrSorted = _.sortBy(arr, o => -o.diff)
    return _.flatMap(arrSorted, o => o.task)
  }

  public padWithZeros (vNumber: number, width: number): string {
    var numAsString = vNumber.toString()
    while (numAsString.length < width) {
      numAsString = '0' + numAsString
    }
    return numAsString
  }

  public dateFormat (date: Date) {
    var vDay = this.padWithZeros(date.getDate(), 2)
    var vMonth = this.padWithZeros(date.getMonth() + 1, 2)
    var vYear = this.padWithZeros(date.getFullYear(), 2)
    // var vHour = padWithZeros(date.getHours(), 2);
    // var vMinute = padWithZeros(date.getMinutes(), 2);
    // var vSecond = padWithZeros(date.getSeconds(), 2);
    return `${vYear}-${vMonth}-${vDay}`
  }

  public timeAgo (date: Date) {
    try {
      var oldTime = date.getTime()
      var currTime = new Date().getTime()
      var diffValue = currTime - oldTime

      var days = Math.floor(diffValue / (24 * 3600 * 1000))
      if (days === 0) {
        // 计算相差小时数
        var leave1 = diffValue % (24 * 3600 * 1000) // 计算天数后剩余的毫秒数
        var hours = Math.floor(leave1 / (3600 * 1000))
        if (hours === 0) {
          // 计算相差分钟数
          var leave2 = leave1 % (3600 * 1000) // 计算小时数后剩余的毫秒数
          var minutes = Math.floor(leave2 / (60 * 1000))
          if (minutes === 0) {
            // 计算相差秒数
            var leave3 = leave2 % (60 * 1000) // 计算分钟数后剩余的毫秒数
            var seconds = Math.round(leave3 / 1000)
            return seconds + ' 秒前'
          }
          return minutes + ' 分钟前'
        }
        return hours + ' 小时前'
      }
      if (days < 0) return '刚刚'

      if (days < 8) {
        return days + ' 天前'
      } else {
        return this.dateFormat(date)
      }
    } catch (error) {
      console.error(error)
    }
  }
}
