import _ from 'lodash'
import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import { Grp, Rec, Area, Plan } from './data-interfaces'

/**
 * 数据储存类
 */
@Component({})
class DataStore extends Vue {
  /** 计划列表 */
  public PlanList: Plan[] = []
  /** 小组列表 */
  public GrpList: Grp[] = []
  /** 工作历史记录列表 */
  public RecList: Rec[] = []
  /** 工作区域列表 */
  public AreaList: Area[] = []

  /** LocalStorage 数据的 KEY */
  public readonly LS_KEY = 'DS_DATASTORE'
  /** LocalStorage 数据中所包含的字段（属于 this 中的字段名） */
  public readonly DATA_FIELDS = ['PlanList', 'GrpList', 'RecList', 'AreaList']

  /** 初始化数据 */
  public created (): void {
    Vue.prototype.$dataStore = this
    // 尝试从 LocalStorage 中加载数据
    let jsonStr = window.localStorage.getItem(this.LS_KEY)
    if (jsonStr !== null) {
      let obj = JSON.parse(jsonStr)
      _.forEach(this.DATA_FIELDS, (key) => {
        if (obj.hasOwnProperty(key) && (this as Object).hasOwnProperty(key)) {
          if (Array.isArray(obj[key])) {
            (this as any)[key] = []
            _.forEach(obj[key], (item) => (this as any)[key].push(item))
          } else {
            (this as any)[key] = obj[key]
          }
        }
      })
    }
  }

  render () { return '' /* 消除 Vue 警告 */ }

  /** 保存数据 */
  public save (): void {
    let obj: any = {}
    _.forEach(this.DATA_FIELDS, (key) => {
      obj[key] = (this as any)[key]
    })
    window.localStorage.setItem(this.LS_KEY, JSON.stringify(obj))
  }

  /** 清空数据 */
  public clearAll (): void {
    _.forEach(this.DATA_FIELDS, (key) => {
      (this as any)[key] = []
    })
    this.save()
  }
}

export default DataStore
