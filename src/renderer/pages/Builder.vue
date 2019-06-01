<template>
  <div class="page fullscreen builder-page">
    <div class="grp-selector">
      <div class="sel-action-bar">
        <span class="action-btn"><i class="zmdi zmdi-flare"></i> 一键安排</span>
        <span class="action-btn"><i class="zmdi zmdi-graphic-eq"></i> 自动选组</span>
      </div>
      <div class="grp-list">
        <div class="grp-item"
            v-for="grp in dataStore.GrpList" :key="grp.id"
            :class="{ 'is-selected': isGrpSelected(grp) }"
            @click="selectGrp(grp)"
        >
        <div class="grp-sel-icon">
          <i :class="!isGrpSelected(grp) ? 'zmdi zmdi-circle' : 'zmdi zmdi-check-circle'"></i>
        </div>
        <div class="grp-name">第 {{ grp.id }} 组</div>
        </div>
      </div>
    </div>

    <div class="plan-editor">
      <div class="inner">
        <div class="base-info form-box">
          <el-form class="center-form">
            <el-input placeholder="标题"></el-input>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import GrpList from './GrpList.vue'
import $ from 'jQuery'
import _ from 'lodash'
import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import { Plan, Grp } from '../core/data-interfaces'
import DataAction from '../core/data-action'
import DataStore from '../core/data-store'

@Component({
  components: { GrpList }
})
export default class Builder extends Vue {
  plan: Plan | null = null
  selGrpList: Grp[] = []

  created () {
    // 初始化 plan
    this.plan = DataAction.newEmptyPlan()
  }

  get dataStore () {
    return DataStore
  }

  selectGrp (grp: Grp) {
    if (!this.isGrpSelected(grp)) {
      // 若未选中
      this.selGrpList.push(grp)
    } else {
      this.selGrpList.splice(this.selGrpList.indexOf(grp), 1)
    }
  }

  isGrpSelected (grp: Grp) {
    return this.selGrpList.indexOf(grp) > -1
  }
}
</script>

<style scoped lang="scss">
.builder-page {
  overflow: hidden;
  display: flex;
  flex-flow: row;

  .grp-selector {
    flex-basis: 280px;
    background: rgba(255, 255, 255, 0.82);
    height: 100%;
    padding-top: 45px;

    $bar-height: 40px;
    .sel-action-bar {
      display: flex;
      height: $bar-height;

      .action-btn {
        cursor: pointer;
        height: 100%;
        flex: 1;
        padding: 0 20px;
        text-align: center;
        line-height: $bar-height;

        & > i {
         margin-right: 6px;
       }

        &:hover {
          color: #1a73e8;
          background: rgba(66,133,244,0.12);
        }
      }
    }

    .grp-list {
      overflow-y: auto;
      overflow-x: hidden;
      height: calc(100% - 45px - $bar-height);
      padding-top: 5px;

     .grp-item {
       display: flex;
       cursor: pointer;
       flex-flow: row;

       &:hover {
         color: #1a73e8;
       }

       .grp-sel-icon {
         color: rgb(190, 190, 190);
         padding: 10px 20px 10px 27px;
       }

       .grp-name {
         padding: 10px 30px 10px 0px;
       }

       &.is-selected {
         color: #1a73e8;
         background: rgba(66,133,244,0.12);

        .grp-sel-icon {
          color: #1a73e8;
        }
      }
     }
    }
  }

  .plan-editor {
    flex: 1;
    height: calc(100% - 80px);
    overflow-x: hidden;
    overflow-y: auto;
    padding: 40px 15px;

    .inner {
      background: rgba(255, 255, 255, 0.82);
      height: 1000px;
    }

    .form-box {
      padding: 25px 20px;
    }
  }
}
</style>
