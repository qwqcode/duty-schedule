<template>
  <div class="page schedule-page fullscreen">
    <div class="task-list-sidebar" style="display: none">
      <div class="inner" ref="taskListSidebarInner">
        <plan-list class="plan-list" @openPlan="openPlan" :selected-plan="plan"></plan-list>
      </div>
    </div>
    <div class="inner">
      <div class="left-bar">
        <div class="card group-switch">
          <div class="item" @click="showTaskListSidebar()">
            <i class="zmdi zmdi-menu"></i>
          </div>
          <div class="dividing"></div>
          <div class="item">
            <i class="zmdi zmdi-flag"></i>
          </div>
        </div>
        <div class="card group-switch" v-if="plan !== null">
          <div class="title">组</div>
          <div
            class="item"
            v-for="(group, key) in plan.grpList"
            :key="key"
            :class="{ 'active': key == currGrpKey }"
            @click="switchGrp(key)"
          >{{ group.grpId }}</div>
        </div>
        <div class="card group-switch">
          <div class="item" @click="autoSwitch = !autoSwitch">
            <i :class="`zmdi zmdi-${!autoSwitch ? 'play' : 'pause'}`"></i>
          </div>
        </div>
      </div>
      <div class="right-card" v-if="plan !== null">
        <transition-group name="zoom" tag="div">
          <div
            class="float-card group-info"
            v-for="(grp, key) in plan.grpList"
            :key="grp.grpId"
            :ref="`groupInfoCard_${key}`"
            v-show="key == currGrpKey"
          >
            <div class="inner">
              <div class="auto-switch-bar" v-show="autoSwitch"></div>
              <div class="content">
                <div class="title">第 {{ grp.grpId }} 组</div>
                <el-row class="task-type-group-wrap" :gutter="30">
                  <el-col
                    class="task-type-group"
                    v-for="(item, i) in tasksPersonNameList"
                    :key="i"
                    :span="8"
                  >
                    <div class="type-name">{{ item.task }}</div>
                    <div class="members">
                      <div
                        class="member-item"
                        v-for="(person, pi) in item.persons"
                        :key="pi"
                      >{{ person }}</div>
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
import PlanList from './PlanList.vue'
import _ from 'lodash'
import $ from 'jquery'
import { Plan, PlanGrp } from '../core/data-interfaces'
import DataStore from '../core/data-store'
import DataFate from '../core/data-fate'
import { Watch, Component } from 'vue-property-decorator'
import { GrpList, AreaList } from '../core/data-localtest'
import DataAction from '../core/data-action'

@Component({
  components: { PlanList }
})
export default class Schedule extends Vue {
  plan: Plan | null = null
  currGrpKey: number = 0
  autoSwitch: boolean = false
  isTaskListSidebarShow: boolean = false

  created() {
    // 测试
    //DataStore.clearAll()
    DataStore.GrpList = GrpList
    DataStore.AreaList = AreaList
    DataStore.save()

    let createTestPlan = () => {
      let selGrp = DataStore.GrpList.filter(o => [1, 2, 3, 4].includes(o.id))
      console.log(`已选中的组：`, selGrp)

      let areaDict: { [grpId: number]: string } = {
        1: '教室',
        2: '教室',
        3: '公区',
        4: '公区'
      }

      let personToTask = DataFate.assignTaskToGrpListPersons(selGrp, areaDict)

      let grpList2 = _.clone(selGrp)
      let newPlanGrpList: PlanGrp[] = []

      _.forEach(grpList2, (grp, key) => {
        let nPl: { [person: string]: string } = {}
        _.forEach(grp.personList, (person, index) => {
          if (!personToTask[person]) return
          nPl[person] = personToTask[person]
        })

        let planGrp: PlanGrp = {
          grpId: grp.id,
          personTaskList: nPl,
          area: areaDict[grp.id]
        }

        newPlanGrpList.push(planGrp)
      })

      let plan: Plan = {
        id: +new Date(),
        name: '测试计划',
        grpList: newPlanGrpList,
        time: +new Date()
      }

      console.log(plan)

      DataAction.savePlan(plan)
    }

    //createTestPlan()

    for (let i = 0; i < 50; i++) {}

    console.log(DataStore)

    this.plan = this.planList[0]
  }

  @Watch('plan')
  onPlanChanged(newPlan: Plan) {
    //(this.$parent as any).setSubTitle(' ' + newPlan.name)
  }

  @Watch('currGrpKey')
  onCurrGrpKeyChanged(newKey: number, oldKey: number) {
    if (this.autoSwitch) {
      this.startAutoSwitch(this.$refs['groupInfoCard_' + newKey] as Element)
    }
  }

  @Watch('autoSwitch')
  onAutoSwitchChanged(newVal: boolean) {
    if (newVal === true) {
      this.startAutoSwitch(this.$refs['groupInfoCard_' + this.currGrpKey] as Element)
    }
  }

  /** 计划列表 */
  get planList() {
    return _.sortBy(DataStore.PlanList, o => -o.time)
  }

  /** 当前显示的组 */
  get currGrp() {
    return this.plan !== null ? this.plan.grpList[this.currGrpKey] || null : null
  }

  /** 每个任务下的成员名字 列表 */
  get tasksPersonNameList() {
    let list: Array<{ task: string; persons: string[] }> = []
    _.forEach((this.currGrp as PlanGrp).personTaskList, (task, person) => {
      let item = list.find(o => o.task === task)
      if (item === undefined) {
        item = { task: task, persons: [] }
        list.push(item)
      }
      item.persons.push(person)
    })

    return list
  }

  openPlan(plan: Plan) {
    this.plan = plan
    this.currGrpKey = 0
    this.autoSwitch = false // 停止自动播放
    this.hideTaskListSidebar()
  }

  switchGrp(grpKey: number) {
    this.autoSwitch = false
    this.currGrpKey = grpKey
  }

  startAutoSwitch(cardElem: Element) {
    if (this.plan === null || !this.plan.grpList) {
      return
    }

    const timeout = 10 * 1000
    const perTime = 50

    let timeLeft = 0
    let switchBar = cardElem.querySelector('.auto-switch-bar') as HTMLElement
    switchBar.style.height = ''

    let intervalKey = window.setInterval(() => {
      if (this.autoSwitch === false) {
        window.clearInterval(intervalKey)
        return
      }
      switchBar.style.height = (((timeout - timeLeft) / timeout) * 100).toFixed(2) + '%'
      timeLeft += perTime
      if (timeLeft > timeout) {
        // 切换组
        if (this.currGrpKey + 1 < Object.keys((this.plan as Plan).grpList).length) {
          this.currGrpKey++
        } else {
          this.currGrpKey = 0
        }
        window.clearInterval(intervalKey)
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
                font-size: 25px;
                &:not(:last-child) {
                  margin-bottom: 10px;
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
