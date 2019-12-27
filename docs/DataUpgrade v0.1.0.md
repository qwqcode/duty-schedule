# Migrating Data from v0.0.9 to v0.1.0

```js
JSON.stringify(_.countBy(srcObj.AreaList[0].taskList), null, ' ')

"(.+)": ([0-9]+),?

// to: 

{
   "name": "$1",
   "aliasList": [],
   "demandNumOne": $2,
   "recForOnes": {}
}

// resolve aliasList manually
```

## PLAN LIST
```js
newPlanList = [];
srcObj.PlanList.forEach(plan => {
  const nPlan = {};
  nPlan.id = plan.id;
  nPlan.name = plan.name;
  nPlan.actionTime = plan.actionTime;
  nPlan.createdTime = plan.createdTime;
  nPlan.note = plan.note || "";
  nPlan.grpList = [];
  _.forEach(plan.grpList, grp => {
    const newGrp = {};
    newGrp.name = String(grp.grpId);
    newGrp.areaName = grp.area;
    newGrp.asgnList = [];
    _.forEach(grp.personTaskList, o => {
      newGrp.asgnList.push({ oneName: o.person, taskName: o.task });
    });
    nPlan.grpList.push(newGrp);
  });
  newPlanList.push(nPlan);
});
console.log(JSON.stringify(newPlanList, null, " "));
```

## GRP LIST
```js
newGrpList = [];
srcObj.GrpList.forEach(grp => {
  const nGrp = {};
  nGrp.name = String(grp.id);
  nGrp.oneList = [];
  _.forEach(grp.personList, oneName => {
    nGrp.oneList.push({
      name: oneName
    });
  });

  newGrpList.push(nGrp);
});
console.log(JSON.stringify(newGrpList, null, " "));
```
