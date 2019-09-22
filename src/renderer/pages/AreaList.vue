<template>
  <div :class="{ 'as-selector': !!asSelector }" class="page area-list-page">
    <div class="area-list">
      <div v-if="!asSelector" class="page-title">
        任务类型
      </div>
      <div class="inner">
        <div v-for="(area, areaIndex) in areaList" :key="areaIndex" class="group">
          <div class="group-title">
            {{ !isUniqueMode ? area.name : `为 ${dataValue.person} 分配任务` }}
          </div>

          <div
            v-for="(task, taskIndex) in area.taskList"
            :key="taskIndex"
            @click="!!asSelector ? selectType(task) : null"
            :class="{ 'selected': !!asSelector && dataValue.task === task }"
            class="item"
          >
            <span class="item-text">{{ taskIndex + 1 }}. {{ task }}</span>

            <span v-if="asSelector" class="item-info">
              <span :title="`${dataValue.person} 已做过 ${$dataQuery.getPersonTaskRec(dataValue.person, task)} 次该任务`">
                <i class="zmdi zmdi-account" /> {{ $dataQuery.getPersonTaskRec(dataValue.person, task) }}
              </span>
              <span :title="`共有 ${getSelectedTotal(task)} 人参与该任务`">
                <i class="zmdi zmdi-accounts" /> {{ getSelectedTotal(task) }}
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
import { Plan } from '../core/data-interfaces';

@Component({})
export default class AreaList extends Vue {
    isUniqueMode: boolean = false

    @Prop() readonly asSelector!: boolean

    @Prop() readonly value!: Object

    @Prop() readonly plan!: Plan

    created () {
      if (this.asSelector) {
        this.isUniqueMode = true
      }
    }

    get dataValue (): any {
      return this.value
    }

    get areaList () {
        if (!this.isUniqueMode)
          return this.$dataStore.AreaList
        return this.$dataQuery.getAreaListWithUniqueTask()
      }

    selectType (taskName: string) {
        this.$emit('input', Object.assign(this.value, { task: taskName }))
      }

      getSelectedTotal (taskName: string) {
        let count = 0
        _.forEach(this.plan.grpList, (group) => {
          _.forEach(group.personTaskList, (item) => {
            if (item.task === taskName) {
              count++
            }
          })
        })

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
        background: rgba(255, 255, 255, 0.82);

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
