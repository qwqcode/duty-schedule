import _ from 'lodash'
import axios from 'axios'
import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import { Plan, Rec, PlanGrp, Area } from './data-interfaces'

/**
 * 数据操作类
 */
@Component({})
export default class DataAction extends Vue {
  public created () {
    Vue.prototype.$dataAction = this
  }

  public render () { return '' }

  /** 获取一个空 Plan */
  public newEmptyPlan () : Plan {
    return {
      id: new Date().getTime(),
      name: `${this.getDateText()}`,
      actionTime: new Date().getTime(),
      createdTime: new Date().getTime(),
      grpList: [],
      note: ''
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
    const recList: Rec[] = []

    const pushRec = (name: string, type: 'Area'|'Task'|'TaskTime', dataItemKey: string|number, dataItemVal?: number) => {
      let rec = _.find(recList, (o) => o.type === type && o.name === name)
      if (!rec) {
        rec = { name, type, data: {} }
        recList.push(rec)
      }

      if (type === 'TaskTime' && dataItemVal !== undefined && (rec.data[dataItemKey] || -1) >= dataItemVal)
        return

      if (dataItemVal === undefined) {
        rec.data[dataItemKey] = (rec.data[dataItemKey] || 0) + 1
      } else {
        rec.data[dataItemKey] = dataItemVal
      }
    }

    // 遍历计划列表
    _.forEach(this.$dataStore.PlanList, (plan: Plan) => {
      const { actionTime } = plan
      // 遍历所有参加任务的小组
      _.forEach(plan.grpList, (planGrp: PlanGrp) => {
        const { area } = planGrp
        // 更新该组的个人任务列表
        _.forEach(planGrp.personTaskList, (item) => {
          const { task, person } = item
          if (
            this.$dataStore.AreaList.find(o => o.name === area && o.taskList.includes(task)) // 仅记录 AreaList 存在项
          ) {
            pushRec(task, 'Task', person)
            pushRec(task, 'TaskTime', person, actionTime)
          }

          // Alias
          const taskListByAlias = this.$dataQuery.getTaskListByAlias(task)
          if (taskListByAlias.length > 0) {
            _.forEach(taskListByAlias, (val) => {
              pushRec(val, 'Task', person)
              pushRec(val, 'TaskTime', person, actionTime)
            })
          }
        })
      })
    })

    // 统计小组区域历史
    _.forEach(this.$dataQuery.getPlanListFilteredForGrpFate(), (plan: Plan) => {
      _.forEach(plan.grpList, (planGrp: PlanGrp) => {
        if (this.$dataStore.AreaList.find(o => o.name === planGrp.area)) { // 仅记录 AreaList 存在项
          pushRec(planGrp.area, 'Area', planGrp.grpId)
        }
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
    const myDate = new Date()
    const year = myDate.getFullYear()
    const month = myDate.getMonth() + 1
    const date = myDate.getDate()
    const str = `星期${'日一二三四五六'.charAt(new Date().getDay())}`
    return `${year}-${month}-${date} ${str}`
  }

  /** 从远程同步数据 */
  public remoteSyncDownload (onFinished?: () => void) {
    if (!this.$dataStore.Settings.remoteSync.enabled) {
      window.notify('云端同步功能未开启', 'w')
      return
    }

    axios.get(this.$dataStore.Settings.remoteSync.server, {
      params: { 'op': 'download' }
    }).then(({ data }) => {
      if (data.success) {
        const jsonData = data.data
        if (!!jsonData && String(jsonData).trim() !== '') {
          try {
            this.$dataStore.loadDataByJsonStr(jsonData)
            this.$dataStore.save()
          } catch (err) {
            window.notify('数据从云端同步失败', 'e')
            if (onFinished !== undefined) { onFinished() }
            throw new Error(err)
          }
          if (onFinished !== undefined) { onFinished() }
          window.notify('数据已成功从云端同步', 's')
        } else {
          if (onFinished !== undefined) { onFinished() }
          window.notify('数据从云端同步失败', 'e')
        }
      } else {
        window.notify('数据从云端同步失败', 'e')
        if (onFinished !== undefined) { onFinished() }
      }
    })
  }

  public remoteSyncUpload () {
    if (!this.$dataStore.Settings.remoteSync.enabled) {
      window.notify('云端同步功能未开启', 'w')
      return
    }

    const data = new FormData()
    data.set('data', this.$dataStore.getAllDataAsJsonStr(this.$dataStore.DATA_ALLOW_UPLOAD_FIELDS))
    axios.post(this.$dataStore.Settings.remoteSync.server, data, {
      params: { 'op': 'upload' }
    }).then(({ data: respData }) => {
      if (respData.success) {
        window.notify('数据已成功上传到云端', 's')
      } else {
        window.notify('数据上传到云端失败', 'e')
      }
    })
  }
}
