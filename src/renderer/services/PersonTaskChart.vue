<template>
  <Dialog ref="dialog">
    <div v-if="!!one" class="chart">
      <div class="title">
        {{ one.name }} PersonTaskRecChart
      </div>

      <el-table
        :data="tableData"
        :summary-method="getSummaries"
        style="width: 100%;"
        height="calc(100% - 50px)"
        border
        stripe
        size="mini"
        show-summary
      >
        <el-table-column type="expand">
          <template slot-scope="props">
            <p v-for="(val, key) in getPlanInfoList(props.row.plan)" :key="key">
              {{ key }}: <span v-html="val" />
            </p>
          </template>
        </el-table-column>
        <el-table-column
          label="日期"
          prop="date"
          fixed
          width="100"
          align="center"
        />
        <el-table-column
          v-for="task in TaskList"
          :key="task.name"
          :label="`${task.name}`"
          :prop="task.name"
          width="100"
          align="center"
        />
      </el-table>
    </div>
  </Dialog>
</template>

<script lang="ts">
import _ from 'lodash'
import { Vue, Component, Watch } from 'vue-property-decorator'
import { One, Plan, Task } from 'duty-schedule-core'
import Dialog from '@/components/Dialog.vue'

@Component({
  components: { Dialog }
})
export default class PersonTaskChart extends Vue {
  one!: One
  readonly CHECK_SIGN = '√'

  created () {
    Vue.prototype.$personTaskChart = this
  }

  mounted () {
  }

  open (one: One) {
    this.one = one;
    (this.$refs.dialog as Dialog).show()
  }

  hide () {
    (this.$refs.dialog as Dialog).hide()
  }

  get tableData () {
    const table: any[] = []
    _.forEach(this.PlanList, (plan) => {
      const data: { [taskName: string]: string } = {}
      _.forEach(this.TaskList, (task) => {
        data[task.name] = this.isActionTask(plan, task) ? this.CHECK_SIGN : ``
        if (this.isActionHasAliseTask(plan, task))
          data[task.name] = `${this.CHECK_SIGN} (记录转移)`
      })
      table.push({
        plan,
        date: this.$duty.Utils.dateFormat(new Date(plan.actionTime)),
        ...data
      })
    })

    return table
  }

  get TaskList () {
    return this.$duty.Store.TaskList
  }

  get PlanList () {
    return _.sortBy(
      _.filter(this.$duty.Store.PlanList, (plan) =>
        _.flatMap(plan.grpList, (grp) => _.flatMap(grp.asgnList, (a) => a.oneName)).includes(this.one.name)
      ),
      (o) => -o.actionTime
    )
  }

  getAsgn (plan: Plan) {
    return _.find(_.flatMap(plan.grpList, (o) => o.asgnList), (o) => o.oneName === this.one.name)
  }

  isActionTask (plan: Plan, task: Task) {
    const asgn = this.getAsgn(plan)
    if (!asgn) return false
    return asgn.taskName === task.name
  }

  isActionHasAliseTask (plan: Plan, parentTask: Task) {
    const asgn = this.getAsgn(plan)
    if (!asgn) return false
    return this.$duty.Store.testIsTaskAlias(asgn.taskName, parentTask.name)
  }

  getSummaries (param: any) {
    const { columns, data } = param
    const sums: string[] = []
    columns.forEach((column: any, index: number) => {
      if (index === 0) {
        sums[index] = '执行次数'
        return
      }
      if (index === 1) {
        sums[index] = ''
        return
      }
      const tableTaskTotal = _.filter(data, (item: any) => String(item[column.property]).startsWith(this.CHECK_SIGN)).length // 表格中，某列(Task)有符号的行总数
      const recListTaskTotal = this.one.getTaskActionNum(this.TaskList.find(o => o.name === column.property) as Task) // 该成员该 Task 执行次数
      sums.push(`${tableTaskTotal.toString()} ${recListTaskTotal !== tableTaskTotal ? `[F: ${recListTaskTotal}]` : ``}`)
    })

    return sums
  }

  getPlanInfoList (plan: Plan) {
    const planGrp = _.flatMap(plan.grpList).find(o => o.asgnList.find(p => p.oneName === this.one.name))
    const asgn = this.getAsgn(plan)
    const isAliasTask = asgn ? this.$duty.Store.testIsTaskAlias(asgn.taskName) : false
    const infoList: { [key: string]: string } = {
      '执行日期': this.$duty.Utils.timeAgo(new Date(plan.actionTime)),
      '所属小组': `${plan.getGrpNamesPreviewHTML()} ${planGrp ? `(当时在成员组: ${planGrp.name.toString()})` : ''}`,
      '指派任务': `${asgn ? asgn.taskName : '(未知)'}`
               + `${asgn && isAliasTask ? ` (曾因 "${_.trimEnd(this.$duty.Store.findTasksByAlias(asgn.taskName).join(', '), ', ')}" 的变动而记录转移)` : ``}`
    }

    return infoList
  }
}
</script>

<style scoped lang="scss">
.chart {
  height: calc(100vh - 150px);

  .title {
    font-size: 1.7em;
    margin: 0;
    margin-bottom: 17px;
    margin-left: 30px;
    color: #fff;
    text-shadow: 0 3px 13px #696969;
  }
}
</style>
