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

  render () { return '' }

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
        let areaRec = _.find(recList, (o) => o.type === 'Area' && o.name === planGrp.area)
        if (!areaRec) {
          areaRec = { name: planGrp.area, type: 'Area', data: {} }
          recList.push(areaRec)
        }
        if (!areaRec.data.hasOwnProperty(planGrp.grpId)) {
          areaRec.data[planGrp.grpId] = 1
        } else {
          areaRec.data[planGrp.grpId] += 1
        }

        // 更新该组的个人任务列表
        _.forEach(planGrp.personTaskList, (item) => {
          let task = item.task
          let person = item.person
          let taskRec = _.find(recList, (o) => o.type === 'Task' && o.name === task)
          if (!taskRec) {
            taskRec = { name: task, type: 'Task', data: {} }
            recList.push(taskRec)
          }
          if (!taskRec.data.hasOwnProperty(person)) {
            taskRec.data[person] = 1
          } else {
            taskRec.data[person] += 1
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
