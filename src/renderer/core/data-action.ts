import _ from 'lodash'
import axios from 'axios'
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

  public render () { return '' }

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
    const recList: Rec[] = []
    // 遍历计划列表
    _.forEach(this.$dataStore.PlanList, (plan: Plan) => {
      // 遍历所有参加任务的小组
      _.forEach(plan.grpList, (planGrp: PlanGrp) => {
        let areaRec = _.find(recList, (o) => o.type === 'Area' && o.name === planGrp.area)
        if (!areaRec) {
          areaRec = { name: planGrp.area, type: 'Area', data: {} }
          recList.push(areaRec)
        }
        if (!_.has(areaRec.data, planGrp.grpId)) {
          areaRec.data[planGrp.grpId] = 1
        } else {
          areaRec.data[planGrp.grpId]++
        }

        // 更新该组的个人任务列表
        _.forEach(planGrp.personTaskList, (item) => {
          const { task, person } = item
          let taskRec = _.find(recList, (o) => o.type === 'Task' && o.name === task)
          if (!taskRec) {
            taskRec = { name: task, type: 'Task', data: {} }
            recList.push(taskRec)
          }
          if (!_.has(taskRec.data, person)) {
            taskRec.data[person] = 1
          } else {
            taskRec.data[person]++
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
    data.append('data', this.$dataStore.getAllDataAsJsonStr(this.$dataStore.DATA_ALLOW_UPLOAD_FIELDS))
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
