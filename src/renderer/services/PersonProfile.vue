<template>
  <Dialog ref="dialog">
    <div v-if="!!profile" :class="{ 'as-selector': !!selMode, 'hide-task-sel': !showTaskSel }" class="person-profile">
      <div class="base-info">
        <span class="name">{{ personName }}</span>
        <span v-for="(val, key) in profileDetails" :key="key">{{ key }}: {{ val }}</span>
        <span
          @click="openPersonTaskChart()"
          class="btn"
        ><i class="zmdi zmdi-calendar-check" /> 历史图表</span>

        <slide-y-up-transition>
          <div v-if="taskRecView.show" class="task-rec-view">
            <div class="view-desc">
              "{{ personName }}" 的 “{{ taskRecView.taskName }}” 记录
            </div>
            <calendar-heatmap v-if="!showTaskSel" :values="taskRecViewData" :end-date="$dataQuery.dateFormat(new Date())" />
            <div class="plan-work-rec-list">
              <div v-for="(item, i) in taskRecViewData" :key="i" class="rec-item">
                {{ i+1 }}. {{ item.date }}: {{ _.flatMap(item.planList, (o => o.name)) }}
              </div>
            </div>
          </div>
        </slide-y-up-transition>
      </div>

      <div class="task-sel">
        <div v-if="showTaskSel" class="area-list">
          <div v-for="(area, areaI) in areaList" :key="areaI" class="area-item">
            <div class="area-name">
              {{ area.name }}
            </div>
            <div class="task-list">
              <div
                v-for="(task, taskI) in area.taskList"
                :key="taskI"
                @click="selectTask(task)"
                :class="{ 'selected': !!selMode && task === selMode.data.task }"
                class="task-item"
              >
                <div class="name">
                  {{ task }}
                </div>
                <div class="badge-box">
                  <span v-if="selMode !== null && !!selMode.plan && (getTaskMaxNeed(task) - countPlanTask(task) > 0)" class="warn">还差 {{ getTaskMaxNeed(task) - countPlanTask(task) }} 人</span>
                  <span v-if="$dataQuery.getIsPersonLastDidTheTask(personName, task)" :title="`${personName} 上次做的就是这个任务`" class="warn">上次</span>
                  <span @click.stop="openTaskRecView(task)" :title="`${personName} 已做过 ${$dataQuery.getPersonTaskRec(personName, task)} 次该任务`" class="clickable">
                    <i class="zmdi zmdi-calendar-check" />
                    {{ $dataQuery.getPersonTaskRec(personName, task) }}
                  </span>
                  <span v-if="selMode !== null && !!selMode.plan" :title="`本次计划共有 ${countPlanTask(task)} 人参与该任务`" class="success">{{ countPlanTask(task) }} 人</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="action-bar">
          <span @click="closeTaskRecView()"><i class="zmdi zmdi-arrow-left" /> 返回</span>
        </div>
      </div>
    </div>
  </Dialog>
</template>

<script lang="ts">
import _ from 'lodash'
import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import { CalendarHeatmap } from 'vue-calendar-heatmap'
import { Plan, PlanGrp, PersonTaskItem } from '../core/data-interfaces'
import Dialog from '@/components/Dialog.vue'

type SelMode = {
  plan: Plan
  data: PersonTaskItem
  beforeSel?: ((taskName: string) => boolean|void)
}

@Component({
  components: { CalendarHeatmap, Dialog }
})
export default class PersonProfile extends Vue {
  personName: string = ''

  selMode: SelMode|null = null

  showTaskSel = true
  taskRecView = {
    show: false,
    taskName: null as string|null
  }

  created () {
    Vue.prototype.$personProfile = this
  }

  mounted () {
  }

  open (personName: string, selMode?: SelMode) {
    this.personName = personName
    this.selMode = selMode || null;

    (this.$refs.dialog as Dialog).show()
  }

  hide () {
    (this.$refs.dialog as Dialog).hide()
  }

  selectTask (taskName: string) {
    if (this.selMode) {
      if (this.selMode.beforeSel !== undefined && (this.selMode.beforeSel(taskName) === false)) {
        return
      }
      this.selMode.data.task = taskName
    }
  }

  countPlanTask (taskName: string) {
    if (!this.selMode) return 0
    return _.countBy(_.flatMap(this.selMode.plan.grpList, o => o.personTaskList), o => o.task)[taskName]
  }

  getTaskMaxNeed (taskName: string) {
    return _.countBy(_.flatMap(this.$dataStore.AreaList, o => o.taskList))[taskName]
  }

  get areaList () {
    return this.$dataQuery.getAreaListWithUniqueTask()
  }

  get profile () {
    return this.personName ? this.$dataQuery.getPersonProfile(this.personName) : null
  }

  get profileDetails (): {[label: string]: string} {
    if (!this.profile) { return {} }

    return {
      '最后执行': this.profile.lastWorkPlan ? `${this.profile.lastWorkPlan.name} (${this.$dataQuery.timeAgo(new Date(this.profile.lastWorkPlan.actionTime))})` : '无'
    }
  }

  get taskRecViewData () {
    const map: { date: string, count: number, planList: Plan[] }[] = []
    const planList = this.$dataStore.PlanList.filter(o => _.flatMap(o.grpList, grp => grp.personTaskList).find(
      ptItem => ptItem.person === this.personName && ptItem.task === this.taskRecView.taskName
    ))

    _.forEach(planList, (plan: Plan) => {
      const date = this.$dataQuery.dateFormat(new Date(plan.actionTime))
      let mapItem = map.find(o => o.date === date)
      if (!mapItem) {
        mapItem = { date, count: 0, planList: [] }
        map.push(mapItem)
      }
      mapItem.count++
      mapItem.planList.push(plan)
    })

    return map
  }

  openTaskRecView (taskName: string|null = null) {
    this.showTaskSel = false
    this.taskRecView.show = true
    this.taskRecView.taskName = taskName
  }

  closeTaskRecView () {
    this.showTaskSel = true
    this.taskRecView.show = false
  }

  openPersonTaskChart () {
    this.$personTaskChart.open(this.personName)
  }
}
</script>

<style lang="scss" scoped>
.person-profile {
  width: 100%;
  display: flex;
  flex-direction: row;
  overflow: hidden;
  height: 75vh;

  &.as-selector {
    .task-sel .task-item {
      cursor: pointer;
    }
  }

  & > div {
    // transition: flex-basis cubic-bezier(0.4, 0, 0.2, 1) 0.4s;
  }

  &.hide-task-sel {
    .base-info {
      flex-basis: 100%;
    }

    .task-sel {
      flex-basis: inherit;
      padding: 0;
    }
  }

  .base-info {
    display: flex;
    flex-direction: column;
    flex-basis: 35%;
    background: #FFF;
    padding: 40px 50px;
    z-index: 1;
    box-shadow: 0 2px 15px rgba(0, 0, 0, 0.2);

    & > span {
      display: inline-block;
      width: fit-content;

      &:not(:last-child) {
        margin-bottom: 10px;
      }

      &.name {
        font-size: 26px;
        margin-bottom: 20px;
      }

      & > i {
        margin-right: 5px;
      }

      &.btn {
        margin: 5px 0;
        cursor: pointer;
        color: #1a73e8;
        padding: 4px 13px;
        border-radius: 2px;
        border: 1px solid #1a73e8;

        &:hover {
          opacity: .9;
        }
      }
    }

    .task-rec-view {
      margin-top: 30px;

      .view-desc {
        color: #1a73e8;
        margin-bottom: 30px;
      }
    }
  }

  .task-sel {
    flex-basis: 65%;
    background: rgba(255, 255, 255, 0.82);
    padding: 40px 20px;
    overflow-y: auto;
    overflow-x: hidden;

    .area-list {
      .area-item {
        &:not(:last-child) {
          margin-bottom: 10px;
        }

        .area-name {
          font-size: 18px;
          padding-left: 17px;
          border-left: 2px solid #1a73e8;
        }

        .task-list {
          padding: 10px;

          .task-item {
            display: flex;
            align-items: center;
            flex-direction: row;
            padding: 5px 10px;
            transition: all 200ms cubic-bezier(0.4,0.0,0.2,1);

            &.selected, &.selected:hover {
              border-left: 3px solid #1a73e8;
              color: #1a73e8;
              background: #ffffff;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

              &:before {
                content: "\F26B";
                font: normal normal normal 14px/1 Material-Design-Iconic-Font;
                margin-left: 4px;
                margin-right: 12px;
              }
            }

            &:hover {
              background: rgba(66,133,244,.12);
              color: #1a73e8;
            }

            &:not(:last-child) {
              margin-bottom: 3px;
            }

            & > .name {
              flex: 1;
            }

            & > .badge-box {
              display: flex;
              flex-direction: row;

              & > span {
                background: rgba(66, 133, 244, 0.12);
                padding: 3px 7px;
                border-radius: 1px;
                font-size: 11px;

                &:not(:last-child) {
                  margin-right: 5px;
                }

                & > i {
                  margin-right: 5px;
                }

                &.clickable {
                  cursor: pointer;

                  &:hover {
                    color: #FFF;
                    background: #1a73e8;
                  }
                }

                &.warn {
                  background: rgba(255, 166, 32, 0.264);
                }

                &.success {
                  color: #009474;
                  background: rgba(35, 209, 96, 0.16)
                }
              }
            }
          }
        }
      }
    }

    .action-bar {
      display: flex;
      flex-direction: column;
      width: 60px;

      & > span {
        font-size: 18px;
        width: 30px;
        padding: 20px 10px;
        text-align: center;
        word-wrap: break-word;
        cursor: pointer;

        &:hover {
          background: #FFF;
          box-shadow: 0 2px 15px rgba(0, 0, 0, 0.1);
        }
      }
    }
  }
}
</style>
