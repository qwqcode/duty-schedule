<template>
  <Dialog ref="dialog">
    <div v-if="!!one" :class="{ 'as-selector': !!selMode, 'hide-task-sel': !showTaskSel }" class="person-profile">
      <div class="base-info">
        <span class="name">{{ one.name }}</span>
        <span v-for="(val, key) in profileDetails" :key="key">{{ key }}: {{ val }}</span>
        <span
          @click="openPersonTaskChart()"
          class="btn"
        ><i class="zmdi zmdi-calendar-check" /> 历史图表</span>
      </div>

      <div class="task-sel">
        <div v-if="showTaskSel" class="area-list">
          <div v-for="area in areaList" :key="area.name" class="area-item">
            <div class="area-name">
              {{ area.name }}
            </div>
            <div class="task-list">
              <div
                v-for="task in area.taskList"
                :key="task.name"
                @click="selectTask(task)"
                :class="{ 'selected': !!selMode && task.name === selMode.data.taskName }"
                class="task-item"
              >
                <div class="name">
                  {{ task.name }}
                </div>
                <div class="badge-box">
                  <span
                    v-if="selMode !== null && !!selMode.plan && (task.demandNumOne - countTaskInPlan(task) > 0)"
                    class="warn"
                  >差 {{ task.demandNumOne - countTaskInPlan(task) }} 人</span>
                  <span
                    v-if="selMode !== null && !!selMode.plan && (countTaskInPlan(task) - task.demandNumOne > 0)"
                    class="warn"
                  >多 {{ countTaskInPlan(task) - task.demandNumOne }} 人</span>
                  <span
                    v-if="!!one && one.isJustDidTask(task)"
                    :title="`${one.name} 上次做的就是这个任务`"
                    class="warn"
                  >上次</span>
                  <span v-if="!!one" :title="`${one.name} 已做过 ${one.getTaskActionNum(task.name)} 次该任务`" class="clickable">
                    <i class="zmdi zmdi-calendar-check" />
                    {{ one.getTaskActionNum(task.name) }}
                  </span>
                  <span
                    v-if="selMode !== null && !!selMode.plan"
                    :title="`本次计划共有 ${countTaskInPlan(task)} 人参与该任务`"
                    class="success"
                  >{{ countTaskInPlan(task) }} 人</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="action-bar">
          <span @click="() => {}"><i class="zmdi zmdi-arrow-left" /> 返回</span>
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
import { Task, Plan, GrpInPlan, Asgn, One } from 'duty-schedule-core'
import Dialog from '@/components/Dialog.vue'

type SelMode = {
  plan: Plan
  data: Asgn
  beforeSel?: ((task: Task) => boolean|void)
}

@Component({
  components: { CalendarHeatmap, Dialog }
})
export default class PersonProfile extends Vue {
  one: One|null = null
  selMode: SelMode|null = null
  showTaskSel = true

  created () {
    Vue.prototype.$personProfile = this
  }

  mounted () {
  }

  /** 显示 */
  open (oneName: string, selMode?: SelMode) {
    const one = this.$duty.Store.findOne(oneName)
    if (!one) return

    this.one = one
    this.selMode = selMode || null;
    (this.$refs.dialog as Dialog).show()
  }

  /** 隐藏 */
  hide () {
    (this.$refs.dialog as Dialog).hide()
  }

  /** 选中 Task */
  selectTask (task: Task) {
    if (!this.selMode) return
    if (this.selMode.beforeSel !== undefined && (this.selMode.beforeSel(task) === false)) return
    this.selMode.data.taskName = task.name
  }

  /** 获取某 Task 在 Plan 中已安排的人数 */
  countTaskInPlan (task: Task) {
    if (!this.selMode) return 0
    return _.countBy(_.flatMap(this.selMode.plan.grpList, o => o.asgnList), o => o.taskName)[task.name]
  }

  get areaList () {
    return this.$duty.Store.AreaList
  }

  get profileDetails (): {[label: string]: string} {
    if (!this.one) return {}

    return {
      '最后执行': this.one.lastDidTaskRec ? `${this.one.lastDidTaskRec.task.name}`
      + ` (${this.$duty.Utils.timeAgo(new Date(this.one.lastDidTaskRec.rec.lastTime))})` : '无'
    }
  }

  openPersonTaskChart () {
    if (!this.one) return
    this.$personTaskChart.open(this.one)
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
