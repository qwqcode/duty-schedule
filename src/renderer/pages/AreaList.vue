<template>
  <div class="page area-list-page" :class="{ 'as-selector': !!asSelector }">
    <div class="area-list">
      <div class="page-title" v-if="!asSelector">任务类型</div>
      <div class="inner">
        <div class="group" v-for="(area, areaIndex) in areaList" :key="areaIndex">
          <div class="group-title">{{ !isUniqueMode ? area.name : `为 ${value.name} 分配任务` }}</div>

          <div class="item"
            v-for="(task, taskIndex) in area.taskList"
            :key="taskIndex"
            @click="!!asSelector ? selectType(task) : null"
            :class="{ 'selected': !!asSelector && value.task === task }">
            <span class="item-text">{{ taskIndex + 1 }}. {{ task }}</span>

            <span class="item-info" v-if="asSelector">
              <span :title="`${value.name} 已做过 ${getTaskTypeCount(typeName, value.name)} 次该任务`">
                <i class="zmdi zmdi-account"></i> {{ getTaskTypeCount(typeName, value.name) }}
              </span>
              <span :title="`共有 ${getSelectedTotal(typeName)} 人参与该任务`">
                <i class="zmdi zmdi-accounts"></i> {{ getSelectedTotal(typeName) }}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import _ from 'lodash'
import Vue from 'vue'
import { Component, Prop } from 'vue-property-decorator'
import DataStore from '../core/data-store';
import DataQuery from '../core/data-query';

@Component({})
  export default class AreaList extends Vue {
    isUniqueMode: boolean = false
    @Prop() readonly asSelector!: boolean
    @Prop() readonly value!: Object
    @Prop() readonly task!: Object

    created () {
      if (this.asSelector) {
        this.isUniqueMode = true
      }
    }

    get areaList () {
        if (!this.isUniqueMode)
          return DataStore.AreaList
        else
          return DataQuery.getAreaListWithUniqueTask()
      }

    selectType (taskName: string) {
        this.$emit('input', Object.assign(this.value, { task: taskName }))
      }

      getSelectedTotal (taskName: string) {
        let count = 0
        /* _.forEach(this.task.memberGroupList, (group) => {
          _.forEach(group.data, (item) => {
            if (item.task === taskName) {
              count++
            }
          })
        }) */

        return count
      }
  }
</script>

<style lang="scss">
.area-list-page {
  .area-list {
    max-width: 40%;
    margin: 0 auto;

    .inner {
      .group {
        padding: 20px;
        background: #FFF;

        &:not(:last-child) {
          margin-bottom: 10px;
        }

        .group-title {
          padding: 5px 10px;
          font-size: 16px;
          color: #1a73e8;
          margin-bottom: 5px;
        }

        .item {
          padding: 5px 10px;
          position: relative;

          .item-info {
            position: absolute;
            right: 10px;

            & > span {
              background: rgba(66,133,244,0.12);
              padding: 3px 10px;
              border-radius: 50px;
              font-size: 12px;

              & > i {
                margin-right: 2px;
              }

              &:not(:last-child) {
                margin-right: 5px;
              }
            }
          }
        }
      }
    }
  }

  &.as-selector {
    .area-list {
      max-width: 50%;
    }

    .area-list .inner .group .item {
      cursor: pointer;
      padding-right: 100px;

      &:not(:last-child) {
        margin-bottom: 3px;
      }

      &:hover {
        background: rgba(66,133,244,0.12);
        color: #1a73e8;
      }

      &.selected {
        color: #fff;
        background: #67C23A;

        &:before {
          content: '\F26B';
          font: normal normal normal 14px/1 'Material-Design-Iconic-Font';
          margin-right: 10px;
        }
      }
    }
  }
}
</style>