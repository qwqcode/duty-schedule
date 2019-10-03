import _ from 'lodash'
import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import { Grp, Area } from './data-interfaces'

@Component({})
export default class DataFate extends Vue {
  public created () {
    Vue.prototype.$dataFate = this;
    (window as any).$dataFate = this
  }

  render () { return '' }

  /**
   * 向 GrpList 中全部 Grp 下的 Person 分配任务
   *
   * @param grpList 已选中的小组列表
   * @param grpToAreaDict 小组区域指定表（grpId: areaName）
   * @returns 字典 {成员名: 任务名}
   */
  getPersonFateList (grpList: Grp[], grpToAreaDict: {[grpId: number]: string}) {
    /** Person -> Task */
    const fateList: { [personName: string]: string } = {}

    const sortedTaskNameList: { [areaName: string]: string[] } = {}
    _.forEach(this.$dataStore.AreaList, (area) => {
      sortedTaskNameList[area.name] = this.$dataQuery.getTaskNameArrSorted(_.uniq(area.taskList), grpList)
    })

    const taskSelectedCount: { [taskName: string]: number } = {}
    const taskSelMax: { [taskName: string]: number } = _.countBy(_.flatMap(this.$dataStore.AreaList, o => o.taskList))
    const isTaskFull = (taskName: string) => ((taskSelectedCount[taskName] || 0) >= taskSelMax[taskName])
    const isPersonAssigned = (person: string) => _.has(fateList, person)
    const getNeedTaskPersonNum = (task: string) => (taskSelMax[task] - (taskSelectedCount[task] || 0))
    const pushToFateList = (personName: string, taskName: string) => {
      fateList[personName] = taskName
      taskSelectedCount[taskName] = (taskSelectedCount[taskName] || 0) + 1
    }

    const areaPersonList = this.$dataQuery.getPersonsOfAreaNameDict(grpToAreaDict)
    const assignTaskOnce = ({ isPersonCanAssign }: {
      isPersonCanAssign: (person: string, task: string) => boolean
    }) => {
      _.forEach(areaPersonList, (personList, areaName) => {
        _.forEach(sortedTaskNameList[areaName], (assignTask) => {
          if (isTaskFull(assignTask)) { return }
          let personTaskSortList: {name: string, rec: number}[] = []
          _.forEach(personList, (person) => {
            if (isPersonAssigned(person)) { return }
            personTaskSortList.push({
              name: person,
              rec: this.$dataQuery.getPersonTaskRec(person, assignTask)
            })
          })
          personTaskSortList = _.sortBy(personTaskSortList, (o) => o.rec)
          const needNum = getNeedTaskPersonNum(assignTask) // 不能写到 for (...) 的括号内。艹，不然 needNum 会一直改变
          for (let i = 0; i < needNum; i++) {
            if (!_.has(personTaskSortList, i)) break
            const assignPerson = personTaskSortList[i].name
            if (isPersonCanAssign(assignPerson, assignTask)) {
              pushToFateList(assignPerson, assignTask)
            }
          }
        })
      });
    }

    assignTaskOnce({
      isPersonCanAssign: (person, task) => {
        if (this.$dataQuery.getIsPersonLastDidTheTask(person, task)) {
          return false
        }
        return true
      }
    })

    // 无条件安排
    assignTaskOnce({
      isPersonCanAssign: (person, task) => true
    })

    return fateList
  }

  getGrpFateList () {
    const fateList: { [areaName: string]: Grp[] } = {}
    _.forEach(this.$dataStore.AreaList, (area) => { fateList[area.name] = [] }) // 初始化

    const assignAreaOnce = ({ sortedGrpList, isGrpCanSel }: {
      /** 已排序的 GrpList（会按照排列顺序根据条件安排）  */
      sortedGrpList: Grp[]|((area: Area) => Grp[])
      /** 某个 Grp 是否能被选择 */
      isGrpCanSel: (grp: Grp, area: Area) => boolean
    }) => {
      _.forEach(this.$dataStore.AreaList, (area) => {
        const resultGrpList = fateList[area.name]
        if (resultGrpList.length >= 2) { return }
        sortedGrpList = (typeof sortedGrpList === 'function') ? sortedGrpList(area) : sortedGrpList
        _.forEach(sortedGrpList, (grp) => {
          if (Object.values(resultGrpList).length >= 2) { return } // 若已排满
          if (_.flatMap(fateList).find(o => o.id === grp.id)) { return } // 若已安排
          if (isGrpCanSel(grp, area)) {
            resultGrpList.push(grp)
          }
        })
      })
    }

    assignAreaOnce({
      sortedGrpList: (area) => _.sortBy(this.$dataStore.GrpList, o => this.$dataQuery.getGrpAreaRec(o.id, area.name)),
      isGrpCanSel: (grp, area) => {
        if (this.$dataQuery.getIsGrpExitsInLatestPlan(grp.id)) { return false } // 条件 1
        if (this.$dataQuery.getIsGrpLastDidTheArea(grp.id, area.name)) { return false } // 条件 2
        return true
      }
    })

    const grpListSortedByRecSum = _.sortBy(this.$dataStore.GrpList, o => this.$dataQuery.getGrpAreaRec(o.id))

    // 补充缺的组（上次做同样的 Area 也满足条件）<-- 条件慢慢放开
    assignAreaOnce({
      sortedGrpList: grpListSortedByRecSum,
      isGrpCanSel: (grp, area) => {
        if (this.$dataQuery.getIsGrpExitsInLatestPlan(grp.id)) { return false } // 条件 1
        return true
      }
    })

    // 补充缺的组（上周刚做了的也满足条件）
    assignAreaOnce({
      sortedGrpList: grpListSortedByRecSum,
      isGrpCanSel: (grp, area) => true
    })

    return fateList
  }
}
