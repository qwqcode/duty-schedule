# Migrating Data from v0.0.9 to v0.1.0

```ts
function transOldVersionData (jsonStr: string) {
  const srcObj = JSON.parse(jsonStr)

  const makeNewArea = (areaSrc: any) => {
    const nArea: any = {
        name: areaSrc.name,
      demandNumGrp: 2,
      recForGrps: {},
      taskList: []
    }
    _.forEach(_.countBy(areaSrc.taskList), (demandNumOne, taskName) => {
      const nTask: any = {
        name: taskName,
        aliasList: [],
        demandNumOne: Number(demandNumOne),
        recForOnes: {}
      }
      if (!!areaSrc.taskAliasList && !!areaSrc.taskAliasList[taskName])
        nTask.aliasList = areaSrc.taskAliasList[taskName]
      nArea.taskList.push(nTask)
    })
    return nArea
  }

  const makeNewPlan = (planSrc: any) => {
    const nPlan: any = {
      id: planSrc.id,
      name: planSrc.name,
      actionTime: planSrc.actionTime,
      createdTime: planSrc.createdTime,
      note: (planSrc.note || ''),
      grpList: []
    }
    _.forEach(planSrc.grpList, (grp) => {
      const newGrp: any = {
        name: String(grp.grpId),
        areaName: grp.area,
        asgnList: []
      }
      _.forEach(grp.personTaskList, (o) => {
        newGrp.asgnList.push({ oneName: o.person, taskName: o.task })
      })
      nPlan.grpList.push(newGrp)
    })
    return nPlan
  }

  const makeNewGrp = (grpSrc: any) => {
    const nGrp: any = {
      name: String(grpSrc.id),
      oneList: []
    }
    _.forEach(grpSrc.personList, (oneName) => {
      nGrp.oneList.push({ name: oneName })
    })
    return nGrp
   }

  const nObj: any = { PlanList: [], GrpList: [], AreaList: [] }
  _.forEach(srcObj.AreaList, (area) => { nObj.AreaList.push(makeNewArea(area)) })
  _.forEach(srcObj.PlanList, (plan) => { nObj.PlanList.push(makeNewPlan(plan)) })
  _.forEach(srcObj.GrpList, (grp) => { nObj.GrpList.push(makeNewGrp(grp)) })

  return JSON.stringify(nObj, null, ' ')
}
```
