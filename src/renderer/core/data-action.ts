import _ from 'lodash'
import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import { Plan, Rec, PlanGrp } from './data-interfaces'

/**
 * 数据操作类
 */
@Component({})
export default class DataAction extends Vue {
  public created () {
    Vue.prototype.$dataAction = this
  }

  /** 获取一个空 Plan */
  public newEmptyPlan () : Plan {
    return {
      id: new Date().getTime(),
      name: `${this.getDateText()}`,
      time: new Date().getTime(),
      grpList: []
    }
  }

  /** 保存计划 */
  public savePlan (plan: Plan): void {
    this.$dataStore.PlanList.push(plan)
    this.syncRec()
    this.$dataStore.save()
  }

  /** 删除计划 */
  public delPlan (plan: Plan): void {
    this.$dataStore.PlanList.splice(this.$dataStore.PlanList.indexOf(plan), 1)
    this.syncRec()
    this.$dataStore.save()
  }

  /** 同步 Rec */
  public syncRec (): void {
    let recList: Rec[] = []
    // 遍历计划列表
    _.forEach(this.$dataStore.PlanList, (plan: Plan) => {
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
    this.$dataStore.RecList = recList
    this.$dataStore.save()
  }

  /** 为设置界面提供的数据修改 */
  public settingSetData (key: string, obj: object) {
    if (this.$dataStore.DATA_FIELDS.indexOf(key) <= -1) {
      window.notify(`[settingSetData()] 参数 key: ${key} 无效`, 'e')
    }
    (this.$dataStore as any)[key] = obj
    this.$dataStore.save()
    window.notify(`配置 ${key} 已保存`)
  }

  /** 为设置界面提供的数据清空 */
  public settingClearData () {
    this.$dataStore.clearAll()
  }

  /** 获取日期文字 */
  public getDateText () {
    let myDate = new Date()
    let year = myDate.getFullYear()
    let month = myDate.getMonth() + 1
    let date = myDate.getDate()
    let str = '星期' + '日一二三四五六'.charAt(new Date().getDay())
    return year + '-' + month + '-' + date + ' ' + str
  }
}
