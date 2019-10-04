<template>
  <div class="plan-list">
    <div
      v-for="plan in planList"
      :key="plan.id"
      :class="{ 'selected': (plan === selectedPlan) }"
      class="plan-list-item"
    >
      <div @click="openPlan(plan)" class="inner">
        <div class="title">
          {{ plan.name }}
        </div>
        <div class="meta">
          <span class="time">{{ $dataQuery.timeAgo(new Date(plan.actionTime)) }}</span>
          <span class="groups" v-html="`组: ${$dataQuery.getPlanGrpIdSummary(plan)}`" />
        </div>
      </div>
      <div class="flags">
        <span
          v-if="$dataQuery.dateFormat(new Date(plan.actionTime)) === $dataQuery.dateFormat(new Date())"
          class="flag flag-green"
        >今日</span>
        <!--<span class="flag flag-red" v-if="plan.actionTime < new Date().getTime() - 24*60*60*1000">已过期</span>-->
      </div>
      <span class="act-btns">
        <ConfirmPopover :text="`是否删除计划: “${plan.name}” ?`" @confirmed="$permission.adminBtn(() => { deletePlan(plan) })">
          <span class="btn-item"><i class="zmdi zmdi-delete" /></span>
        </ConfirmPopover>
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import _ from 'lodash'
import Vue from 'vue'
import { Prop, Component } from 'vue-property-decorator'
import { Plan } from '@/core/data-interfaces'
import ConfirmPopover from './ConfirmPopover.vue'

@Component({
  components: { ConfirmPopover }
})
export default class PlanList extends Vue {
  @Prop() readonly selectedPlan!: Plan

  get planList () {
    return _.sortBy(this.$dataStore.PlanList, (o) => -o.actionTime)
  }

  openPlan (plan: Plan) {
    this.$emit('openPlan', plan)
  }

  isDataAllowEdit () {
    if (typeof (window as any).SETTING_DATA_ALLOW_EDIT !== 'boolean' || (window as any).SETTING_DATA_ALLOW_EDIT !== true) {
      window.notify('没有权限修改数据', 'w')
      window.console.log('[window.SETTING_DATA_ALLOW_EDIT]')
      return false
    }
    return true
  }

  deletePlan (plan: Plan) {
    this.$dataAction.delPlan(plan)
    window.notify(`"${plan.name}" 已删除`, 'i')
  }
}
</script>

<style lang="scss" scoped>
  .plan-list {
    padding: 5px;
    padding-top: 40px;
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
        background: #FFF;
        border: 1px solid #eee;
        padding: 20px 30px;
        cursor: pointer;
        transition: all .2s linear;
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
            border-right: 2px solid #EEE;
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
        top: 20px;
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
        position: absolute;
        right: 6px;
        top: -2px;

        .flag {
          border-radius: 50px;
          font-size: 13px;
          padding: 4px 10px;
          color: #FFF;

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
