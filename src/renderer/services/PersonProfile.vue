<template>
  <Dialog ref="dialog">
  <div v-if="!!profile" class="person-profile" :class="{ 'as-selector': !!selMode, 'hide-task-sel': !showTaskSel }">
    <div class="base-info">
      <span class="name">{{ personName }}</span>
      <span v-for="(val, key) in profileDetails" :key="key">{{ key }}: {{ val }}</span>

      <slide-y-up-transition>
        <div v-if="taskRecView.show" class="task-rec-view">
          <div class="view-desc">"{{ personName }}" 的 “{{ taskRecView.taskName }}” 记录</div>
          <calendar-heatmap v-if="!showTaskSel" :values="taskRecViewData" :end-date="$dataQuery.dateFormat(new Date())" />
        </div>
      </slide-y-up-transition>
    </div>

    <div class="task-sel">
      <div v-if="showTaskSel" class="area-list">
        <div v-for="(area, areaI) in areaList" :key="areaI" class="area-item">
          <div class="area-name">{{ area.name }}</div>
          <div class="task-list">
            <div
              v-for="(task, taskI) in area.taskList"
              :key="taskI"
              class="task-item" @click="selectTask(task)"
              :class="{ 'selected': !!selMode && task === selMode.data.task }"
            >
              <div class="name">{{ task }}</div>
              <div class="badge-box">
                <span @click.stop="openTaskRecView(task)" :title="`${personName} 已做过 ${$dataQuery.getPersonTaskRec(personName, task)} 次该任务`">
                  <i class="zmdi zmdi-calendar-check" />
                  {{ $dataQuery.getPersonTaskRec(personName, task) }}
                </span>
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
import { Component, Prop } from 'vue-property-decorator'
import { Plan, PlanGrp, PersonTaskItem } from '../core/data-interfaces'
import { CalendarHeatmap } from 'vue-calendar-heatmap'
import Dialog from '@/components/Dialog.vue'

type SelMode = {
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
    taskName: <string|null>null
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

  selectTask (taskName: string) {
    if (!!this.selMode) {
      if (this.selMode.beforeSel !== undefined && (this.selMode.beforeSel(taskName) === false)) {
        return
      }
      this.selMode.data.task = taskName
    }
  }

  get areaList () {
    return this.$dataQuery.getAreaListWithUniqueTask()
  }

  get profile () {
    return !!this.personName ? this.$dataQuery.getPersonProfile(this.personName) : null
  }

  get profileDetails (): {[label: string]: string} {
    if (!this.profile) { return {} }

    return {
      '最后执行': this.profile.lastWorkPlan ? `${this.profile.lastWorkPlan.name} (${this.$dataQuery.timeAgo(new Date(this.profile.lastWorkPlan.time))})` : '无'
    }
  }

  get taskRecViewData () {
    let dateToCount: {[date: string]: number} = {}

    _.forEach(this.$dataStore.PlanList, (plan: Plan) => {
      let date = this.$dataQuery.dateFormat(new Date(plan.time))
      _.forEach(plan.grpList, (planGrp: PlanGrp) => {
        if (planGrp.personTaskList.find(o => (o.person === this.personName && o.task === this.taskRecView.taskName))) {
          if (!dateToCount.hasOwnProperty(date)) {
            dateToCount[date] = 1
          } else {
            dateToCount[date] += 1;
          }
        }
      })
    })

    return _.map(dateToCount, (value, key) => ({ date: key, count: value }))
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
    flex-basis: 35%;
    background: #FFF;
    padding: 40px 50px;
    z-index: 1;
    box-shadow: 0 2px 15px rgba(0, 0, 0, 0.2);

    & > span {
      display: block;

      &:not(:last-child) {
        margin-bottom: 10px;
      }

      &.name {
        font-size: 26px;
        margin-bottom: 20px;
      }
    }

    .task-rec-view {
      margin-top: 30px;

      .view-desc {
        color: #0083ff;
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
          border-left: 2px solid #0083ff;
        }

        .task-list {
          padding: 10px;

          .task-item {
            display: flex;
            align-items: center;
            flex-direction: row;
            padding: 5px 10px;

            &.selected, &.selected:hover {
              color: #fff;
              background: #67c23a;

              &:before {
                content: "\F26B";
                font: normal normal normal 14px/1 Material-Design-Iconic-Font;
                margin-right: 10px;
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
              & > span {
                cursor: pointer;
                display: inline-block;
                background: rgba(66,133,244,.12);
                padding: 3px 10px;
                border-radius: 50px;
                font-size: 12px;

                &:not(:last-child) {
                  margin-right: 5px;
                }

                & > i {
                  margin-right: 5px;
                }

                &:hover {
                  color: #FFF;
                  background: #0083ff;
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
