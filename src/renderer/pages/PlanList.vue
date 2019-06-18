<template>
  <div class="plan-list">
    <div class="plan-list-item"
         v-for="plan in planList"
         :key="plan.id"
         :class="{ 'selected': (plan === selectedPlan) }">
      <div class="inner" @click="openPlan(plan)">
        <div class="title">{{ plan.name }}</div>
        <div class="meta">
          <span class="time">{{ timeAgo(new Date(plan.time)) }}</span>
          <span class="groups">组: <span class="group-item" v-for="(item, i) in getPlanAllGrpIdList(plan)" :key="i">{{ item }}</span></span>
        </div>
      </div>
      <div class="flags">
        <span
          class="flag flag-green"
          v-if="dateFormat(new Date(plan.time)) === dateFormat(new Date())"
        >今日</span>
        <!--<span class="flag flag-red" v-if="plan.time < new Date().getTime() - 24*60*60*1000">已过期</span>-->
      </div>
      <span class="act-btns">
        <span class="btn-item" @click="deletePlan(plan)"><i class="zmdi zmdi-delete"></i></span>
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import _ from 'lodash'
import Vue from 'vue'
import { Prop, Watch, Component } from 'vue-property-decorator';
import DataStore from '../core/data-store';
import DataAction from '../core/data-action';
import { Plan } from '../core/data-interfaces';

@Component({})
export default class PlanList extends Vue {
  @Prop() readonly selectedPlan!: Plan
  deleteBtnClickTime: number = 0
  removingPlanId: number | null = null

  get planList () {
    return _.sortBy(DataStore.PlanList, (o) => -o.time)
  }

  get dataStore () {
    return DataStore
  }

  openPlan (plan: Plan) {
      this.$emit('openPlan', plan)
    }

    getPlanAllGrpIdList (plan: Plan) {
      let arr: number[] = []
      _.each(plan.grpList, (group, i) => {
        arr.push(group.grpId)
      })
      return _.sortBy(arr)
    }

    padWithZeros (vNumber: number, width: number): string {
      var numAsString = vNumber.toString()
      while (numAsString.length < width) {
        numAsString = '0' + numAsString
      }
      return numAsString
    }

    isDataAllowEdit () {
      if (typeof (window as any).SETTING_DATA_ALLOW_EDIT !== 'boolean' || (window as any).SETTING_DATA_ALLOW_EDIT !== true) {
        window.notify('没有权限修改数据', 'w')
        console.log('[window.SETTING_DATA_ALLOW_EDIT]')
        return false
      } else {
        return true
      }
    }

    deletePlan (plan: Plan) {
      if (this.isDataAllowEdit()) {
        if (this.removingPlanId !== plan.id) {
          this.removingPlanId = plan.id
          this.deleteBtnClickTime = 0
        }
        if (this.deleteBtnClickTime < 3 - 1) {
          this.deleteBtnClickTime++
          window.notify(`危险操作，请再点 ${(3 - this.deleteBtnClickTime)} 次`, 'e')
          return
        }
        DataAction.delPlan(plan.id)
        window.notify(`"${plan.name}" 已删除`, 'i')
        this.deleteBtnClickTime = 0
        this.removingPlanId = null
      }
    }

    dateFormat (date: Date) {
      var vDay = this.padWithZeros(date.getDate(), 2)
      var vMonth = this.padWithZeros(date.getMonth() + 1, 2)
      var vYear = this.padWithZeros(date.getFullYear(), 2)
      // var vHour = padWithZeros(date.getHours(), 2);
      // var vMinute = padWithZeros(date.getMinutes(), 2);
      // var vSecond = padWithZeros(date.getSeconds(), 2);
      return `${vYear}-${vMonth}-${vDay}`
    }

    timeAgo (date: Date) {
      try {
        var oldTime = date.getTime()
        var currTime = new Date().getTime()
        var diffValue = currTime - oldTime

        var days = Math.floor(diffValue / (24 * 3600 * 1000))
        if (days === 0) {
          // 计算相差小时数
          var leave1 = diffValue % (24 * 3600 * 1000) // 计算天数后剩余的毫秒数
          var hours = Math.floor(leave1 / (3600 * 1000))
          if (hours === 0) {
            // 计算相差分钟数
            var leave2 = leave1 % (3600 * 1000) // 计算小时数后剩余的毫秒数
            var minutes = Math.floor(leave2 / (60 * 1000))
            if (minutes === 0) {
              // 计算相差秒数
              var leave3 = leave2 % (60 * 1000) // 计算分钟数后剩余的毫秒数
              var seconds = Math.round(leave3 / 1000)
              return seconds + ' 秒前'
            }
            return minutes + ' 分钟前'
          }
          return hours + ' 小时前'
        }
        if (days < 0) return '刚刚'

        if (days < 8) {
          return days + ' 天前'
        } else {
          return this.dateFormat(date)
        }
      } catch (error) {
        console.error(error)
      }
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
          background: #0083ff;
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
        color: #0083ff;
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
            .group-item {
              &:not(:last-child) {
                margin-right: 5px;
              }
            }
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
