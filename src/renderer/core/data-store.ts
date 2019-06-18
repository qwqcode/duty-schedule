import _ from 'lodash'
import { Grp, Rec, Area, Plan } from './data-interfaces'

/**
 * 数据储存类
 */
export default class DataStore {
  /** 计划列表 */
  public static PlanList: Plan[] = []
  /** 小组列表 */
  public static GrpList: Grp[] = []
  /** 工作历史记录列表 */
  public static RecList: Rec[] = []
  /** 工作区域列表 */
  public static AreaList: Area[] = []

  /** LocalStorage 数据的 KEY */
  public static readonly LS_KEY = 'DS_DATASTORE'
  /** LocalStorage 数据中所包含的字段（属于 this 中的字段名） */
  public static readonly DATA_FIELDS = ['PlanList', 'GrpList', 'RecList', 'AreaList']

  /** 初始化数据 */
  public static init (): void {
    // 尝试从 LocalStorage 中加载数据
    console.log()
    let jsonStr = window.localStorage.getItem(this.LS_KEY)
    if (jsonStr !== null) {
      let obj = JSON.parse(jsonStr)
      _.forEach(this.DATA_FIELDS, (key) => {
        if (obj.hasOwnProperty(key) && (this as Object).hasOwnProperty(key)) {
          (this as any)[key] = obj[key]
        }
      })
    }
  }

  /** 保存数据 */
  public static save (): void {
    let obj: any = {}
    _.forEach(this.DATA_FIELDS, (key) => {
      obj[key] = (this as any)[key]
    })
    window.localStorage.setItem(this.LS_KEY, JSON.stringify(obj))
  }

  /** 清空数据 */
  public static clearAll (): void {
    _.forEach(this.DATA_FIELDS, (key) => {
      (this as any)[key] = []
    })
    this.save()
  }
}
