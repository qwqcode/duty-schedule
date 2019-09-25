<template>
  <div class="page schedule-page fullscreen">
    <div class="task-list-sidebar" style="display: none">
      <div ref="taskListSidebarInner" class="inner">
        <plan-list @openPlan="openPlan" :selected-plan="plan" class="plan-list" />
      </div>
    </div>
    <div class="inner">
      <div class="left-bar">
        <div class="card group-switch">
          <div @click="showTaskListSidebar()" class="item">
            <i class="zmdi zmdi-menu" />
          </div>
          <div class="dividing" />
          <div class="item">
            <i class="zmdi zmdi-flag" />
          </div>
        </div>
        <div v-if="plan !== null" class="card group-switch">
          <div class="title">
            组
          </div>
          <div
            v-for="(group, key) in plan.grpList"
            :key="key"
            @click="switchGrp(key)"
            :class="{ 'active': key == curtGrpKey }"
            class="item"
          >
            {{ group.grpId }}
          </div>
        </div>
        <div class="card group-switch">
          <div @click="autoSwitch = !autoSwitch" class="item">
            <i :class="`zmdi zmdi-${!autoSwitch ? 'play' : 'pause'}`" />
          </div>
        </div>
      </div>

      <div v-if="plan !== null" class="right-card">
        <transition-group name="zoom" tag="div">
          <div
            v-for="(grp, key) in plan.grpList"
            :key="grp.grpId"
            :ref="`groupInfoCard_${key}`"
            v-show="key == curtGrpKey"
            class="float-card group-info"
          >
            <div class="inner">
              <div v-show="autoSwitch" class="auto-switch-bar" />
              <div class="content">
                <div class="title">
                  第 {{ grp.grpId }} 组
                </div>
                <el-row :gutter="30" class="task-type-group-wrap">
                  <el-col
                    v-for="(item, i) in tasksPersonNameList"
                    :key="i"
                    :span="8"
                    class="task-type-group"
                    style="margin-bottom: 20px;"
                  >
                    <div class="type-name">
                      {{ item.task }}
                    </div>
                    <div class="members">
                      <div
                        v-for="(person, pi) in item.persons"
                        :key="pi"
                        @click="$personProfile.open(person)"
                        class="member-item"
                      >
                        {{ person }}
                      </div>
                    </div>
                  </el-col>
                </el-row>
              </div>
            </div>
          </div>
        </transition-group>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import _ from 'lodash'
import $ from 'jquery'
import { Watch, Component } from 'vue-property-decorator'
import { Plan, PlanGrp } from '../core/data-interfaces'
import { GrpList, AreaList } from '../core/data-localtest'
import PlanList from '../components/PlanList.vue'
import Dialog from '../components/Dialog.vue'

@Component({
  components: { PlanList, Dialog }
})
export default class Schedule extends Vue {
  plan: Plan | null = null

  curtGrpKey: number = 0

  autoSwitch: boolean = false

  autoSwitchInterval: number|null = null

  isTaskListSidebarShow: boolean = false

  created() {
    // 测试
    // this.$dataStore.clearAll()
    /* this.$dataStore.GrpList = GrpList
    this.$dataStore.AreaList = AreaList
    this.$dataStore.save() */

    const createTestPlan = (grpIdList: number[] = [1, 2, 3, 4], areaArr: string[] = ['教室', '教室', '公区', '公区']) => {
      const selGrp = this.$dataStore.GrpList.filter(o => grpIdList.includes(o.id))

      const areaDict: { [grpId: number]: string } = {}
      grpIdList.forEach((id, index) => {
        areaDict[id] = areaArr[index]
      })

      const personToTask = this.$dataFate.assignTaskToGrpListPersons(selGrp, areaDict)

      const grpList2 = JSON.parse(JSON.stringify(selGrp))
      const newPlanGrpList: PlanGrp[] = []

      _.forEach(grpList2, (grp, key) => {
        const nPl: { person: string, task: string }[] = []
        _.forEach(grp.personList, (person, index) => {
          if (!personToTask[person]) return
          nPl.push({ person, task: personToTask[person]})
        })

        const planGrp: PlanGrp = {
          grpId: grp.id,
          personTaskList: nPl,
          area: areaDict[grp.id]
        }

        newPlanGrpList.push(planGrp)
      })

      const plan: Plan = {
        id: +new Date(),
        name: '测试计划',
        grpList: newPlanGrpList,
        time: +new Date()
      }

      window.console.log(plan)

      this.$dataAction.savePlan(plan)
    }

    for (let i = 0; i < 100; i++) {
      // createTestPlan([1, 2, 3, 4], ['教室', '教室', '公区', '公区'])
      // createTestPlan([3, 4, 1, 2], ['教室', '教室', '公区', '公区'])
    }

    window.console.log(this.$dataStore)

    if (this.planList.length >= 1) {
      // eslint-disable-next-line prefer-destructuring
      this.plan = this.planList[0]
    }
  }

  @Watch('planList')
  onPlanListChanged () {
    if (this.planList.length >= 1) {
      // eslint-disable-next-line prefer-destructuring
      this.plan = this.planList[0]
    }
  }

  @Watch('plan')
  onPlanChanged(newPlan: Plan) {
    (this.$parent as any).setSubTitle(` ${newPlan.name}`)
  }

  @Watch('curtGrpKey')
  onCurtGrpKeyChanged(newKey: number, oldKey: number) {
    // 当切换组时
  }

  @Watch('autoSwitch')
  onAutoSwitchChanged(newVal: boolean) {
    if (newVal === true) {
      this.startAutoSwitch()
    } else if (this.autoSwitchInterval !== null) {
        window.clearInterval(this.autoSwitchInterval)
      }
  }

  /** 计划列表 */
  get planList() {
    return _.sortBy(this.$dataStore.PlanList, o => -o.time)
  }

  /** 当前显示的组 */
  get currGrp() {
    return this.plan !== null ? this.plan.grpList[this.curtGrpKey] || null : null
  }

  /** 每个任务下的成员名字 列表 */
  get tasksPersonNameList() {
    const list: Array<{ task: string; persons: string[] }> = []
    _.forEach((this.currGrp as PlanGrp).personTaskList, (personTaskItem) => {
      const {person} = personTaskItem;
          const {task} = personTaskItem
      let item = list.find(o => o.task === task)
      if (item === undefined) {
        item = { task, persons: [] }
        list.push(item)
      }
      item.persons.push(person)
    })

    return list
  }

  openPlan(plan: Plan) {
    this.plan = plan
    this.curtGrpKey = 0
    this.autoSwitch = false // 停止自动播放
    this.hideTaskListSidebar()
  }

  switchGrp(grpKey: number) {
    this.curtGrpKey = grpKey
    if (this.autoSwitch === true) {
      this.autoSwitch = false
      window.setTimeout(() => {
        this.autoSwitch = true
      }, 80)
    }
  }

  getSwitchBar () {
    return ((this.$refs[`groupInfoCard_${this.curtGrpKey}`] as Element[])[0] as Element).querySelector('.auto-switch-bar') as HTMLElement
  }

  startAutoSwitch() {
    if (this.plan === null || !this.plan.grpList) {
      return
    }

    const timeout = 10 * 1000 // 10s
    const perTime = 50

    let timeLeft = 0

    this.getSwitchBar().style.height = '100%';

    this.autoSwitchInterval = window.setInterval(() => {
      const switchBar = this.getSwitchBar()
      switchBar.style.height = `${(((timeout - timeLeft) / timeout) * 100).toFixed(2)  }%`
      timeLeft += perTime
      if (timeLeft > timeout) {
        // 切换组
        if (this.curtGrpKey + 1 < Object.keys((this.plan as Plan).grpList).length) {
          this.curtGrpKey++
        } else {
          this.curtGrpKey = 0
        }
        timeLeft = 0
        switchBar.style.height = '100%';
      }
    }, perTime)
  }

  showTaskListSidebar() {
    $('.task-list-sidebar')
      .show()
      .css('background-color', 'rgba(110, 110, 110, 0.39)')
    $(this.$refs.taskListSidebarInner).removeClass('show')
    this.isTaskListSidebarShow = true
    window.setTimeout(() => {
      $(this.$refs.taskListSidebarInner).addClass('show')
      $(document).bind('click.hideSidebar', e => {
        if ($(e.target).is($('.task-list-sidebar')) || !$(e.target).closest(this.$refs.taskListSidebarInner as Element)) {
          this.hideTaskListSidebar()
          $(document).unbind('click.hideSidebar')
        }
      })
    }, 20)
  }

  hideTaskListSidebar() {
    $(this.$refs.taskListSidebarInner).removeClass('show')
    $('.task-list-sidebar').css('background-color', '')
    window.setTimeout(() => {
      this.isTaskListSidebarShow = false
      $('.task-list-sidebar').hide()
    }, 400)
  }

  profileDialog = {
    isOpened: false,
    personName: ''
  }
}
</script>

<style scoped lang="scss">
.schedule-page {
  background: #f4f4f4;

  & > .inner {
    position: relative;
    height: 100%;
    display: flex;
    flex-direction: row;
  }

  .task-list-sidebar {
    z-index: 20;
    transition: background-color 400ms;
    position: absolute;
    width: 100%;
    height: 100%;
    overflow: hidden;

    & > .inner {
      overflow-y: auto;
      width: 40%;
      height: 100%;
      transform: translate(-100%, 0);
      transition: transform 400ms cubic-bezier(0.23, 1, 0.32, 1) 0ms;

      &.show {
        transform: translate(0, 0);
      }
    }

    .task-list {
      background: #fff;
    }
  }

  .left-bar {
    flex-basis: 50px;
    padding-left: 20px;
    display: flex;
    place-items: center;
    justify-content: center;
    flex-flow: column;

    .card {
      width: 44px;
      min-height: 40px;
      background: #fff;
      border-radius: 3px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);

      &:not(:last-child) {
        margin-bottom: 10px;
      }
    }

    .group-switch {
      & > div {
        text-align: center;
        width: 100%;
        height: 40px;
        line-height: 40px;
      }

      .title {
        user-select: none;
        color: #1a73e8;
        border-bottom: 1px solid #f4f4f4;
      }

      .dividing {
        height: 1px;
        background: #f4f4f4;
        width: 100%;
      }

      .item {
        position: relative;
        cursor: pointer;

        &.active,
        &:hover {
          color: #1a73e8;
          font-weight: bold;
          background: rgba(66, 133, 244, 0.12);
        }

        /*&.active:after {
          content: ' ';
          position: absolute;
          right: -30px;
          top: 10px;
          border-top: 10px solid transparent;
          transform: rotate(-135deg);
          border-style: solid;
          border-width: 10px;
          border-color: #fff #fff transparent transparent;
          box-shadow: 0 0px 3px rgba(0, 0, 0, 0.22)
        }*/
      }
    }
  }

  .right-card {
    position: relative;
    flex: 1;
    overflow: hidden;

    .float-card {
      position: absolute;
      background: #fff;
      top: 70px;
      left: 15px;
      height: calc(100% - 100px);
      width: calc(100% - 40px);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
      border-radius: 3px;

      & > .inner {
        position: relative;
        height: 100%;

        .auto-switch-bar {
          top: 0;
          left: 0;
          height: 100%;
          width: 3px;
          position: absolute;
          transition: height 0.2s;
          background: linear-gradient(#1a73e8, #0eefff);
          box-shadow: 0 1px 3px rgba(14, 239, 255, 0.4);
        }

        .content {
          padding: 20px;
        }
      }

      &.group-info {
        .title {
          font-size: 30px;
          padding-left: 10px;
          margin-bottom: 25px;
          &:before {
            content: '\f2fb';
            font-family: 'Material-Design-Iconic-Font';
            padding-right: 20px;
          }
        }

        .task-type-group-wrap {
          padding: 0 25px;

          .task-type-group {
            .type-name {
              color: #1a73e8;
              font-size: 22px;
              margin-bottom: 15px;
            }

            .members {
              margin-left: 10px;
              .member-item {
                display: block;
                width: fit-content;
                cursor: pointer;
                font-size: 25px;
                &:not(:last-child) {
                  margin-bottom: 10px;
                }

                &:hover {
                  color: #1a73e8;
                }
              }
            }
          }
        }
      }
    }
  }
}
</style>
