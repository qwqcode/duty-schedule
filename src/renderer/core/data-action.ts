import _ from 'lodash'
import { Plan, Rec, PlanGrp } from './data-interfaces'
import DataStore from './data-store'

/**
 * 数据操作类
 */
export default class DataAction {
  /** 获取一个空 Plan */
  public static newEmptyPlan () : Plan {
    return {
      id: new Date().getTime(),
      name: `${this.getDateText()}`,
      time: new Date().getTime(),
      grpList: []
    }
  }

  /** 保存计划 */
  public static savePlan (plan: Plan): void {
    DataStore.PlanList.push(plan)
    this.syncRec()
    DataStore.save()
  }

  /** 删除计划 */
  public static delPlan (planId: number): void {
    _.remove(DataStore.PlanList, (plan) => plan.id === planId)
    this.syncRec()
    DataStore.save()
  }

  /** 同步 Rec */
  public static syncRec (): void {
    let recList: Rec[] = []
    // 遍历计划列表
    _.forEach(DataStore.PlanList, (plan: Plan) => {
      // 遍历所有参加任务的小组
      _.forEach(plan.grpList, (planGrp: PlanGrp) => {
        // 初始化 recList 中的该组数据 rec
        let rec: Rec
        let findRec = _.find(recList, (o) => o.grpId === planGrp.grpId)
        if (findRec === undefined) {
          rec = {
            grpId: planGrp.grpId,
            areaList: {},
            taskList: {}
          }
          recList.push(rec)
        } else {
          rec = findRec
        }
        // 更新该组的区域列表
        if (!rec.areaList.hasOwnProperty(planGrp.area)) {
          rec.areaList[planGrp.area] = 1
        } else {
          rec.areaList[planGrp.area] += 1
        }
        // 更新该组的个人任务列表
        _.forEach(planGrp.personTaskList, (item) => {
          let task = item.task
          let person = item.person
          if (!rec.taskList.hasOwnProperty(task)) {
            rec.taskList[task] = {}
          }
          if (!rec.taskList[task].hasOwnProperty(person)) {
            rec.taskList[task][person] = 1
          } else {
            rec.taskList[task][person] += 1
          }
        })
      })
    })
    // 保存数据
    DataStore.RecList = recList
    DataStore.save()
  }

  /** 为设置界面提供的数据修改 */
  public static settingSetData (key: string, obj: object) {
    if (DataStore.DATA_FIELDS.indexOf(key) <= -1) {
      window.notify(`[settingSetData()] 参数 key: ${key} 无效`, 'e')
    }
    (DataStore as any)[key] = obj
    DataStore.save()
    window.notify(`配置 ${key} 已保存`)
  }

  /** 为设置界面提供的数据清空 */
  public static settingClearData () {
    DataStore.clearAll()
  }

  /** 获取日期文字 */
  public static getDateText () {
    let myDate = new Date()
    let year = myDate.getFullYear()
    let month = myDate.getMonth() + 1
    let date = myDate.getDate()
    let str = '星期' + '日一二三四五六'.charAt(new Date().getDay())
    return year + '-' + month + '-' + date + ' ' + str
  }
}
