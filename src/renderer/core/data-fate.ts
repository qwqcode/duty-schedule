import _ from 'lodash'
import DataStore from './data-store'
import DataQuery from './data-query'
import { Grp } from './data-interfaces'

export default class DataFate {
  /**
   * 向 GrpList 中所有 Grp 下的 Person 分配任务
   *
   * @param grpList 已选中的小组列表
   * @param grpAreaSpecified 小组区域指定表（grpId: areaName）
   * @returns 字典 {成员名: 任务名}
   */
  public static assignTaskToGrpListPersons (grpList: Grp[], grpAreaSpecified: {[grpId: number]: string}) {
    // >> Step 1: 构建一个 AreaName->PersonNames 的表（区域名->所有负责该区域的人名）
    let areaPersonList: {[areaName: string]: string[]} = {}
    _.forEach(grpAreaSpecified, (area, grpId) => {
      let persons: string[] = []
      if (!areaPersonList.hasOwnProperty(area)) {
        // 若没有负责这个区域的成员名单，则初始化
        areaPersonList[area] = persons
      } else {
        persons = areaPersonList[area]
      }
      // 查询该组的所有人
      let findGrp = DataStore.GrpList.find((o) => o.id === Number(grpId))
      if (findGrp !== undefined) {
        // 名字丢进 areaPersonList[某区域] 里
        _.forEach(findGrp.personList, (personName) => persons.push(personName))
      }
    })
    console.log(areaPersonList)

    // >> Step 2: 遍历 S1 创建的 areaPersonList，进行任务安排，并构建 ResultObj
    let personToTaskDict: {[personName: string]: string} = {}
    _.forEach(areaPersonList, (personList, areaName) => {
      // 获取该区域的所有 Task
      let findArea = DataStore.AreaList.find((o) => o.name === areaName)
      if (findArea === undefined) {
        console.error('未找到 Area:', areaName)
        return
      }
      let taskList = findArea.taskList
      // > 给该区域的 personList 中的所有人安排任务
      _.forEach(taskList, (taskName) => {
        // 构建候选名单：[{name: 姓名, rec: 执行过该 task 的次数}]
        let personShortlist: {name: string, rec: number}[] = []
        _.forEach(personList, (personName, index) => {
          // 若这个人已经被安排上了任务，则不安排了
          if (personToTaskDict.hasOwnProperty(personName)) return
          // !! 如果这个人上一次扫地就是做这个 Task, 并且候选名单中还有其他人（至少一个人），那么就不加入候选名单中
          if (
            ((personList.length > 1 && index === 0) // 小组成员数大于 1，并且这个人是第一个人
            || personShortlist.length >= 1) // 或者，候选名单人数不少于 1
            && DataQuery.getIsPersonJustDidTheTask(personName, taskName)
          ) return
          // 查询这个人做过该 Task 的 Rec
          personShortlist.push({ name: personName, rec: DataQuery.getPersonTaskRec(personName, taskName) })
        })
        // 根据值（Rec）从小到大排序
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
