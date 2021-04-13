<template>
  <Dialog ref="dialog" :noSlotStyle="true" :outclickClose="true">
    <div ref="planList" class="plan-list">
      <div
        v-for="plan in PlanList"
        :key="plan.id"
        :class="{ 'selected': (plan === selectedPlan) }"
        class="plan-list-item"
      >
        <div @click="openPlan(plan)" class="inner">
          <div class="title">
            {{ plan.name }}
          </div>
          <div class="meta">
            <span class="time">{{ $duty.Utils.timeAgo(new Date(plan.actionTime)) }}</span>
            <span v-html="`组: ${plan.getGrpNamesPreviewHTML()}`" class="groups" />
          </div>
        </div>
        <div class="flags">
          <span
            v-if="$duty.Utils.dateFormat(new Date(plan.actionTime)) === $duty.Utils.dateFormat(new Date())"
            class="flag flag-green"
          >今日</span>
        <!--<span class="flag flag-red" v-if="plan.actionTime < new Date().getTime() - 24*60*60*1000">已过期</span>-->
        </div>
        <span class="act-btns">
          <ConfirmPopover
            :text="`是否删除计划: “${plan.name}” ?`"
            @confirmed="$permission.adminBtn(() => { deletePlan(plan) })"
          >
            <span class="btn-item">
              <i class="zmdi zmdi-delete" />
            </span>
          </ConfirmPopover>
        </span>
      </div>
    </div>
  </Dialog>
</template>

<script lang="ts">
import _ from 'lodash'
import Vue from 'vue'
import { Prop, Component } from 'vue-property-decorator'
import { Plan } from 'duty-schedule-core'
import ConfirmPopover from './ConfirmPopover.vue'
import Dialog from './Dialog.vue'

@Component({
  components: { ConfirmPopover, Dialog }
})
export default class PlanListSidebar extends Vue {
  @Prop() readonly selectedPlan!: Plan

  get PlanList () {
    return this.$duty.Store.PlanListSorted
  }

  open () {
    (this.$refs.dialog as Dialog).show()
  }

  close () {
    (this.$refs.dialog as Dialog).hide()
  }

  openPlan (plan: Plan) {
    this.$emit('openPlan', plan)
  }

  deletePlan (plan: Plan) {
    this.$duty.Store.PlanList.splice(this.$duty.Store.PlanList.indexOf(plan), 1)
    this.$duty.Store.recSync()
    this.$dutyHelper.localSave()
    window.notify(`"${plan.name}" 已删除`, 'i')
  }
}
</script>

<style lang="scss" scoped>
.plan-list {
  left: 0;
  top: 0;
  position: absolute;
  overflow-y: auto;
  width: 40%;
  height: 100%;
  padding: 5px;
  padding-top: 40px;
  padding-bottom: 50px;
  background: #f4f4f4;

  .plan-list-item {
    padding: 5px;
    position: relative;

    &.selected {
      & > .inner:before {
        background: #1a73e8;
      }
    }

    &:hover > .inner {
      box-shadow: 0 2px 15px rgba(0, 0, 0, 0.1);
    }

    & > .inner {
      position: relative;
      background: #fff;
      border: 1px solid #eee;
      padding: 20px 30px;
      cursor: pointer;
      transition: all 0.2s linear;
      border-radius: 3px;
      box-shadow: 0 2px 15px rgba(0, 0, 0, 0.05);

      &:before {
        content: ' ';
        position: absolute;
        left: -2px;
        top: 10px;
        height: calc(100% - 20px);
        width: 3px;
        background: transparent;
        box-shadow: 0px 2px 15px rgba(0, 131, 255, 0.22);
      }
    }

    .title {
      font-size: 1.4em;
      color: #1a73e8;
      margin-bottom: 15px;
    }

    .meta {
      display: flex;
      flex-direction: row;

      & > span {
        margin-right: 10px;
        padding-right: 10px;

        &:not(:last-child) {
          border-right: 2px solid #eee;
        }

        &.time {
        }

        &.groups {
        }
      }
    }

    .act-btns {
      position: absolute;
      display: none;
      top: 30px;
      right: 30px;

      .btn-item {
        cursor: pointer;
        font-size: 20px;
        color: #5a6370;
      }
    }

    &:hover .act-btns {
      display: inherit;
    }

    .flags {
      pointer-events: none;
      position: absolute;
      right: 9px;
      top: -1px;

      .flag {
        border-radius: 50px;
        font-size: 13px;
        padding: 4px 10px;
        color: #fff;

        &.flag-green {
          background: rgba(35, 209, 96, 0.85);
          box-shadow: 3px 2px 15px rgba(35, 209, 96, 0.22);
        }

        &.flag-red {
          background: rgba(209, 35, 58, 0.85);
          box-shadow: 3px 2px 15px rgba(209, 35, 58, 0.22);
        }
      }
    }
  }
}
</style>
