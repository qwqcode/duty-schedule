import _ from 'lodash'
import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import { Grp } from './data-interfaces'

@Component({})
export default class DataFate extends Vue {
  public created () {
    Vue.prototype.$dataFate = this
  }

  /**
   * 向 GrpList 中全部 Grp 下的 Person 分配任务
   *
   * @param grpList 已选中的小组列表
   * @param grpToAreaDict 小组区域指定表（grpId: areaName）
   * @returns 字典 {成员名: 任务名}
   */
  public assignTaskToGrpListPersons (grpList: Grp[], grpToAreaDict: {[grpId: number]: string}) {
    // >> Step 1: 构建一个 AreaName->PersonNames 的表（区域名->全部负责该区域的人名）
    let personNamesOfAreas = this.$dataQuery.getPersonsOfAreaNameDict(grpToAreaDict)
    console.log(personNamesOfAreas)

    // >> Step 2: 遍历 S1 创建的 personNamesInAreas，进行任务安排，并构建 ResultObj
    let personToTaskDict: {[personName: string]: string} = {}
    _.forEach(personNamesOfAreas, (personNames, areaName) => {
      // 获取该区域的全部 Task
      let findArea = this.$dataStore.AreaList.find((o) => o.name === areaName)
      if (findArea === undefined) { console.error('未找到 Area:', areaName);return }
      let thisAreaTaskNameArr = this.$dataQuery.getTaskNameArrSorted(findArea.taskList, grpList)
      // 遍历该区域的全部 Task
      _.forEach(thisAreaTaskNameArr, (taskName, taskIndex) => {
        if (taskIndex +1 > personNames.length) return // 如果 该Task index 超过总人数
        // > 给该区域中的全部人安排任务
        // 构建候选名单：[{name: 姓名, rec: 执行过该 task 的次数}]
        let personShortlist: {name: string, rec: number}[] = []
        _.forEach(personNames, (personName, index) => {
          // 若这个人已经被安排上了任务，则不安排了
          if (personToTaskDict.hasOwnProperty(personName)) return
          // !! 如果这个人上一次扫地就是做这个 Task, 并且候选名单中还有其他人（至少一个人），那么就不加入候选名单中
          if (
            ((personNames.length >= 2 && index === 0) // 如果 小组成员数 >= 两人，并且这个人是第一个人
              || personShortlist.length >= 1) // 或者，候选名单中已经有了一个人
          ) {
            // 才查询是否上次做过
            if (this.$dataQuery.getIsPersonLastDidTheTask(personName, taskName)) {
              return // 如果他上次就做过该任务，那么就不安排给他
            }
          }
          // 查询并 push 他做过该 Task 的 Rec
          personShortlist.push({ name: personName, rec: this.$dataQuery.getPersonTaskRec(personName, taskName) })
        })
        // 根据 Rec 值从小到大排序
        let personShortlistSorted = _.sortBy(personShortlist, (o) => o.rec) // 注意，object 不能排序，array 才能
        // 安排这个任务给做这个任务最少的人
        let minRecPersonName = personShortlistSorted[0].name
        personToTaskDict[minRecPersonName] = taskName
      })
    })
    console.log(personToTaskDict)

    return personToTaskDict
  }
}
