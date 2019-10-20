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

  /** 设置 */
  public Settings = {
    /** 密码 */
    password: '',
    /** 远程同步 */
    remoteSync: {
      enabled: false,
      server: '',
      autoSync: false
    },
    fate: {
      effectivePlanDateForGrp: '2019-10-14'
    }
  }

  /** LocalStorage 数据的 KEY */
  public readonly LS_KEY = 'DS_DATASTORE'

  /** LocalStorage 数据中所包含的字段（属于 this 中的字段名） */
  public readonly DATA_FIELDS = ['PlanList', 'GrpList', 'RecList', 'AreaList', 'Settings']

  /** 允许上传到云端的字段 */
  public readonly DATA_ALLOW_UPLOAD_FIELDS = ['PlanList', 'GrpList', 'RecList', 'AreaList']

  /** 初始化数据 */
  public created (): void {
    Vue.prototype.$dataStore = this
    // 尝试从 LocalStorage 中加载数据
    const jsonStr = window.localStorage.getItem(this.LS_KEY)
    if (jsonStr !== null) {
      this.loadDataByJsonStr(jsonStr)
    }
  }

  render () { return '' /* 消除 Vue 警告 */ }

  /** 从 Json Str 装载数据 */
  public loadDataByJsonStr (jsonStr: string) {
    const obj = JSON.parse(jsonStr)
    _.forEach(this.DATA_FIELDS, (key) => {
      if (_.has(obj, key) && _.has(this, key)) {
        if (Array.isArray(obj[key])) {
          (this as any)[key] = []
          _.forEach(obj[key], (item) => (this as any)[key].push(item))
        } else if (typeof obj[key] === 'object') {
          const newObj = _.extend({}, (this as any)[key], obj[key])
          Array.prototype.forEach.call(Object.keys((this as any)[key]), (iKey) => {
            const iValue = (this as any)[key][iKey]
            if (typeof iValue === 'object') {
              newObj[iKey] = _.extend({}, iValue, newObj[iKey])
            }
          });
          (this as any)[key] = newObj
        } else {
          (this as any)[key] = obj[key]
        }
      }
    })
  }

  /** 获取所有数据为 Json Str */
  public getAllDataAsJsonStr (dataFields: string[] = this.DATA_FIELDS) {
    const obj: any = {}
    _.forEach(dataFields, (key) => {
      obj[key] = (this as any)[key]
    })
    return JSON.stringify(obj)
  }

  /** 保存数据 */
  public save (): void {

    window.localStorage.setItem(this.LS_KEY, this.getAllDataAsJsonStr())
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
