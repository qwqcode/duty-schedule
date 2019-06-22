import _ from 'lodash'
import DataStore from './data-store'
import { Rec, Area, Plan, Grp } from './data-interfaces'

/**
 * 数据查询类
 */
export default class DataQuery {
  /** 获取计划（通过 ID） */
  public static getPlan (planId: number): Plan | undefined {
    return _.find(DataStore.PlanList, (o) => o.id === planId)
  }

  /** 获取所有区域的全部任务类型 */
  public static getAllTaskInAllArea (): string[] {
    let arr: string[] = []
    _.forEach(DataStore.AreaList, (area) => {
      _.forEach(area.taskList, (taskName) => {
        arr.push(taskName)
      })
    })
    return arr
  }

  /** 获取所有区域的全部任务类型（去除重复） */
  public static getAllUniqueTaskInAllArea (): string[] {
    return _.uniq(this.getAllTaskInAllArea())
  }

  /** 获取 TaskList 已去除重复的 AreaList */
  public static getAreaListWithUniqueTask (): Area[] {
    let cloneAreaList = _.clone(DataStore.AreaList)
    _.forEach(cloneAreaList, (area) => {
      area.taskList = _.uniq(area.taskList)
    })
    return cloneAreaList
  }

  /** 获取某个组的 Rec 实例 */
  public static getGrpRec (grpId: number): Rec | undefined {
    return _.find(DataStore.RecList, (o) => o.grpId === grpId)
  }

  /** 获取某个组的区域次数记录 */
  public static getGrpAreaRec (grpId: number, areaName: string): number {
    let grpRec = this.getGrpRec(grpId)
    if (grpRec === undefined) return 0
    return grpRec.areaList[areaName] || 0
  }

  /** 某个人是否上一次就是做的该 Task */
  public static getIsPersonJustDidTheTask (personName: string, taskName: string) {
    let planList = DataStore.PlanList
    if (!planList) return false
    let planListLastest: Plan | null = _.sortBy(planList, (o) => -o.time)[0] || null
    if (!planListLastest) return false
    let result = false
    _.forEach(planListLastest.grpList, (grp) => {
      let findOne = grp.personTaskList.find(o => o.person === personName)
      if (findOne !== undefined && findOne.task === taskName) {
        result = true
        return false // 结束遍历
      }
    })
    return result
  }

  /** 获取某个人的任务次数记录 */
  public static getPersonTaskRec (personName: string, taskName: string): number {
    let result: number = 0
    _.find(DataStore.RecList, (rec) => {
      if (rec.taskList.hasOwnProperty(taskName) && rec.taskList[taskName].hasOwnProperty(personName)) {
        result = rec.taskList[taskName][personName] || 0
        return false
      }
    })
    return result
  }

  /** 获取一定规则顺序的 TaskList */
  public static getTaskListSorted (taskList: string[], rangeGrpList: Grp[]) {
    let list: {task: string, diff: number}[] = []
    _.forEach(taskList, (task) => list.push({task: task, diff: 0}))
    _.forEach(rangeGrpList, (grp) => {
      let grpRec = DataStore.RecList.find(o => o.grpId === grp.id)
      if (grpRec !== undefined) {
        _.forEach(grpRec.taskList, (personNumList, task) => {
          let listTask = list.find(o => o.task === task)
          if (listTask === undefined) return
          let diff = (_.max(Object.values(personNumList)) || 0) - (_.min(Object.values(personNumList)) || 0)
          if (diff < 0) diff = 0
          if (diff > listTask.diff) listTask.diff = diff
        })
      }
    })
    let listSorted = _.sortBy(list, o => -o.diff)
    return _.flatMap(listSorted, o => o.task)
  }
}
