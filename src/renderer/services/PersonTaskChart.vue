<template>
  <Dialog ref="dialog">
    <div v-if="!!profile" class="chart">
      <div class="title">
        {{ personName }} PersonTaskRecChart
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
          v-for="task in UniqTaskList"
          :key="task"
          :label="`${task}`"
          :prop="task"
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
import { Plan } from '../core/data-interfaces'
import Dialog from '@/components/Dialog.vue'

@Component({
  components: { Dialog }
})
export default class PersonTaskChart extends Vue {
  personName: string = ''

  readonly CHECK_SIGN = '√'

  created () {
    Vue.prototype.$personTaskChart = this
  }

  mounted () {
  }

  open (personName: string) {
    this.personName = personName;

    (this.$refs.dialog as Dialog).show()
  }

  hide () {
    (this.$refs.dialog as Dialog).hide()
  }

  get profile () {
    return this.personName ? this.$dataQuery.getPersonProfile(this.personName) : null
  }

  get tableData () {
    const table: any[] = []
    _.forEach(this.PlanList, (plan) => {
      const data: { [taskName: string]: string } = {}
      _.forEach(this.UniqTaskList, (task) => {
        data[task] = this.isPersonSelfWorkTask(plan, task) ? this.CHECK_SIGN : ``
        if (this.isPersonSelfWorkAliseTask(plan, task)) {
          data[task] = `${this.CHECK_SIGN} (记录转移)`
        }
      })
      table.push({
        plan,
        date: this.$dataQuery.dateFormat(new Date(plan.actionTime)),
        ...data
      })
    })

    return table
  }

  get UniqTaskList () {
    return _.uniq(_.flatMap(this.$dataStore.AreaList, (o) => o.taskList))
  }

  get PlanList () {
    return _.sortBy(
      _.filter(this.$dataStore.PlanList, (o) =>
        _.flatMap(o.grpList, (grp) => _.flatMap(grp.personTaskList, (i) => i.person)).includes(this.personName)
      ),
      (o) => -o.actionTime
    )
  }

  getPlanPersonSelfTaskItem (plan: Plan) {
    return _.find(_.flatMap(plan.grpList, (o) => o.personTaskList), (o) => o.person === this.personName)
  }

  isPersonSelfWorkTask (plan: Plan, task: string) {
    const find = this.getPlanPersonSelfTaskItem(plan)
    if (!find) return false
    return find.task === task
  }

  isPersonSelfWorkAliseTask (plan: Plan, task: string) {
    const find = this.getPlanPersonSelfTaskItem(plan)
    if (!find) return false
    return this.$dataQuery.testIsAliasTask(find.task, task)
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
      const tableTaskTotal = _.filter(data, (item: any) => String(item[column.property]).startsWith(this.CHECK_SIGN)).length
      const recListTaskTotal = this.$dataQuery.getPersonTaskRec(this.personName, column.property)
      sums.push(`${tableTaskTotal.toString()} ${recListTaskTotal !== tableTaskTotal ? `[R: ${recListTaskTotal}]` : ``}`)
    })

    return sums
  }

  getPlanInfoList (plan: Plan) {
    const planGrp = _.flatMap(plan.grpList).find(o => o.personTaskList.find(p => p.person === this.personName))
    const taskItem = this.getPlanPersonSelfTaskItem(plan)
    const isAliasTask = taskItem ? this.$dataQuery.testIsAliasTask(taskItem.task) : false
    const infoList: { [key: string]: string } = {
      '执行日期': this.$dataQuery.timeAgo(new Date(plan.actionTime)),
      '所属小组': `${this.$dataQuery.getPlanGrpIdSummary(plan)} ${planGrp ? `(当时在 ${planGrp.grpId.toString()} 组)` : ''}`,
      '指派任务': `${taskItem ? taskItem.task : '(未知)'}`
               + `${taskItem && isAliasTask ? ` (曾因 "${_.trimEnd(this.$dataQuery.getTaskListByAlias(taskItem.task).join(', '), ', ')}" 的变动而记录转移)` : ``}`
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
