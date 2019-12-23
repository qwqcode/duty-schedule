<template>
  <div class="page schedule-page fullscreen">
    <!-- 标识书签 -->
    <div v-if="!!taskBookmark" :class="`bookmark ${taskBookmark.type}`">
      {{ taskBookmark.text }}
    </div>
    <!-- Plan 选择 侧边栏 -->
    <PlanListSidebar ref="planListSidebar" @openPlan="openPlan" :selected-plan="plan" />

    <BarTimer ref="autoSwitcher" />

    <div class="inner">
      <!-- 左侧操作条 -->
      <div class="left-bar">
        <div class="card group-switch">
          <div @click="openPlanListSidebar()" class="item">
            <i class="zmdi zmdi-menu" />
          </div>
          <div class="dividing" />
          <div @click="switchNoteCard()" :class="{ 'active': !!cardList[curtCardPos] && cardList[curtCardPos].type === 'text' }" class="item">
            <i class="zmdi zmdi-flag" />
          </div>
        </div>

        <div v-if="plan !== null" class="card group-switch">
          <div class="title">
            组
          </div>
          <div
            v-for="grp in plan.grpList"
            :key="grp.grpId"
            @click="switchGrp(grp)"
            :class="{ 'active': !!cardList[curtCardPos] && grp === cardList[curtCardPos].value }"
            class="item"
          >
            {{ grp.grpId }}
          </div>
        </div>

        <div class="card group-switch">
          <div @click="!isAutoSwitcherOn ? startAutoSwitcher() : stopAutoSwitcher()" class="item">
            <i :class="`zmdi zmdi-${!isAutoSwitcherOn ? 'play' : 'pause'}`" />
          </div>
        </div>
      </div>

      <!-- 卡片堆叠 -->
      <div v-if="plan !== null" class="right-card">
        <transition-group name="zoom" tag="div">
          <ScheduleCard
            v-for="(card, i) in cardList"
            :key="i"
            v-show="i == curtCardPos"
            :card="card"
          />
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
import PlanListSidebar from '../components/PlanListSidebar.vue'
import Dialog from '../components/Dialog.vue'
import ScheduleCard, { Card } from '../components/ScheduleCard.vue'
import BarTimer from '../components/BarTimer.vue'

@Component({
  components: { PlanListSidebar, ScheduleCard, Dialog, BarTimer }
})
export default class Schedule extends Vue {
  plan: Plan | null = null

  planListSidebar?: PlanListSidebar
  isTaskListSidebarShow: boolean = false

  cardList: Card[] = []
  curtCardPos: number = 0
  autoSwitcher?: BarTimer
  isAutoSwitcherOn = false

  created () {
    if (this.PlanList.length >= 1) {
      // eslint-disable-next-line prefer-destructuring
      this.openPlan(this.PlanList[0])
    }
  }

  mounted () {
    this.autoSwitcher = this.$refs.autoSwitcher as BarTimer
    this.planListSidebar = this.$refs.planListSidebar as PlanListSidebar
  }

  @Watch('PlanList')
  onPlanListChanged () {
    if (this.PlanList.length >= 1) {
      // eslint-disable-next-line prefer-destructuring
      this.openPlan(this.PlanList[0])
    }
  }

  @Watch('plan')
  onPlanChanged(newPlan: Plan) {
    (this.$parent as any).setSubTitle(`${newPlan.name} - ${this.$duty.Utils.timeAgo(new Date(newPlan.actionTime))}`)
  }

  switchGrp (grp: PlanGrp) {
    const findCardPos = this.cardList.findIndex(o => o.type === 'grp' && o.value === grp)
    if (findCardPos <= -1) return

    this.curtCardPos = findCardPos
  }

  switchNoteCard () {
    const findCardPos = this.cardList.findIndex(o => o.type === 'text')
    if (findCardPos <= -1) return

    this.curtCardPos = findCardPos
  }

  @Watch('curtCardPos')
  onCurtCardPosChanged () {
    if (this.isAutoSwitcherOn && this.autoSwitcher) {
      this.autoSwitcher.resetTimer()
      window.setTimeout(() => {
        this.startAutoSwitcher()
      }, 80)
    }
  }

  startAutoSwitcher () {
    if (this.plan === null || !this.plan.grpList) return
    if (!this.autoSwitcher) return

    this.autoSwitcher.startTimer(() => {
      // 切换 Card
      if ((this.curtCardPos + 1) < this.cardList.length) {
        this.curtCardPos += 1
      } else {
        this.curtCardPos = 0
      }
    })
    this.isAutoSwitcherOn = true
  }

  stopAutoSwitcher () {
    if (this.autoSwitcher) this.autoSwitcher.resetTimer()
    this.isAutoSwitcherOn = false
  }

  /** 计划列表 */
  get PlanList() {
    return _.sortBy(this.$dataStore.PlanList, (o) => -o.actionTime)
  }

  openPlan (plan: Plan) {
    this.plan = plan
    this.stopAutoSwitcher()
    this.closePlanListSidebar()

    this.curtCardPos = 0
    this.cardList = []
    _.forEach(this.plan.grpList, (grp) => {
      this.cardList.push({
        type: 'grp',
        value: grp
      })
    })
    if (this.plan.note) {
      this.cardList.push({
        type: 'text',
        value: this.plan.note
      })
    }
  }

  openPlanListSidebar () {
    if (this.planListSidebar)
      this.planListSidebar.open()
  }

  closePlanListSidebar () {
    if (this.planListSidebar)
      this.planListSidebar.close()
  }

  get taskBookmark () {
    if (this.plan === null) return null

    let bookmark: { type: 'warn'|'info', text: string }|null = null
    if (this.plan.actionTime < new Date().getTime() && this.$duty.Utils.dateFormat(new Date(this.plan.actionTime)) !== this.$duty.Utils.dateFormat(new Date())) {
      bookmark = { type: 'info', text: '历史计划' }
    }

    return bookmark
  }
}
</script>

<style scoped lang="scss">
.bookmark {
  text-align: center;
  pointer-events: none;
  z-index: 999;
  position: fixed;
  padding: 0 45px;
  height: 45px;
  line-height: 45px;
  font-size: 1.7em;
  top: 50px;
  right: 0;
  color: #fff;
  background: rgba(59, 59, 59, 0.8);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);

  &.warn {
    background: rgba(239, 83, 80, 0.77);
  }

  &.info {
    background: rgba(33, 150, 243, 0.68);
  }
}

.schedule-page {
  background: #f4f4f4;

  & > .inner {
    position: relative;
    height: 100%;
    display: flex;
    flex-direction: row;
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
      }
    }
  }

  .right-card {
    position: relative;
    flex: 1;
    overflow: hidden;
  }
}
</style>
