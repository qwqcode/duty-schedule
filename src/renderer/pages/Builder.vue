<template>
  <div class="page fullscreen builder-page">
    <div class="grp-selector">
      <div class="sel-action-bar">
        <span class="action-btn">
          <i class="zmdi zmdi-flare"></i> 一键安排
        </span>
        <span class="action-btn">
          <i class="zmdi zmdi-graphic-eq"></i> 自动选组
        </span>
      </div>
      <div class="grp-list">
        <div
          class="grp-item"
          v-for="grp in $dataStore.GrpList"
          :key="grp.id"
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
            <el-form-item label="标题">
              <div class="grp-input">
                <input v-model="plan.name" type="text" autocomplete="off" placeholder="输入文字" />
              </div>
            </el-form-item>
          </el-form>
        </div>

        <div class="plan-grp-list">
          <div
            class="grp-item form-box anim-fade-in"
            v-for="planGrp in plan.grpList"
            :key="planGrp.grpId"
          >
            <div class="grp-head">第 {{ planGrp.grpId }} 组</div>

            <div
              class="grp-person-item"
              v-for="(item, index) in planGrp.personTaskList"
              :key="index"
            >
              <div class="item-form">
                <div class="left-part">
                  <div class="grp-input person-input">
                    <input v-model="item.person" type="text" autocomplete="off" placeholder="名字" />
                  </div>
                </div>
                <div class="right-part">
                  <div class="grp-input task-input">
                    <input
                      :value="item.task"
                      @focus="showTaskSelDialog(item)"
                      type="text"
                      readonly="readonly"
                      autocomplete="off"
                      placeholder="任务"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="plan-action-bar">
      <div class="plan-save-btn" @click="savePlan()">
        保存
        <i class="zmdi zmdi-save"></i>
      </div>
    </div>

    <Dialog :isOpened="taskSelDialog.isShow" @close="hideTaskSelDialog()">
    </Dialog>
  </div>
</template>

<script lang="ts">
import GrpList from './GrpList.vue'
import Dialog from '../components/Dialog.vue'
import $ from 'jQuery'
import _ from 'lodash'
import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { Plan, Grp, PlanGrp, PersonTaskItem } from '../core/data-interfaces'

@Component({
  components: { GrpList, Dialog }
})
export default class Builder extends Vue {
  plan: Plan = this.$dataAction.newEmptyPlan()
  selGrpList: Grp[] = []

  taskSelDialog = {
    isShow: false,
    personTaskItem: <PersonTaskItem>{}
  }

  created() {}

  ///
  /// 小组选择
  ///

  selectGrp(grp: Grp) {
    if (!this.isGrpSelected(grp)) {
      // 若未选中
      this.selGrpList.push(grp)
    } else {
      this.selGrpList.splice(this.selGrpList.indexOf(grp), 1)
    }
  }

  isGrpSelected(grp: Grp) {
    return this.selGrpList.indexOf(grp) > -1
  }


  ///
  /// 小组成员任务安排
  ///

  @Watch('selGrpList')
  onSelGrpListChanged(selGrpList: Grp[]) {
    let areaOrder = ['教室', '教室', '公区', '公区']
    let grpToAreaDict: { [grpId: number]: string } = {}
    _.forEach(selGrpList, (grp, index) => {
      grpToAreaDict[grp.id] = areaOrder[index]
    })

    let personToTask = this.$dataFate.assignTaskToGrpListPersons(selGrpList, grpToAreaDict)

    // 创建新 grpList
    let PlanGrpList: PlanGrp[] = []

    _.forEach(selGrpList, (grp, key) => {
      let nPl: { person: string; task: string }[] = []
      _.forEach(grp.personList, (person, index) => {
        nPl.push({ person: person, task: personToTask[person] || '' })
      })

      let planGrp: PlanGrp = {
        grpId: grp.id,
        personTaskList: nPl,
        area: grpToAreaDict[grp.id]
      }

      PlanGrpList.push(planGrp)
    })

    this.plan.grpList = PlanGrpList
  }

  savePlan() {
    // 刷新时间
    this.plan.time = new Date().getTime()
    this.$dataAction.savePlan(this.plan)
    this.$router.replace('/')
  }

  showTaskSelDialog (personTaskItem: PersonTaskItem) {
    this.taskSelDialog.isShow = true
    this.taskSelDialog.personTaskItem = personTaskItem
  }

  hideTaskSelDialog () {
    this.taskSelDialog.isShow = false
  }
}
</script>

<style lang="scss">
.builder-page {
  overflow: hidden !important;
  display: flex;
  flex-flow: row;

  .grp-selector {
    flex-basis: 280px;
    background: rgba(255, 255, 255, 0.82);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
    height: 100%;
    padding-top: 45px;

    $bar-height: 40px;
    .sel-action-bar {
      display: flex;
      height: $bar-height;
      border-top: 1px solid #e9e9e9;
      border-bottom: 1px solid #e9e9e9;

      .action-btn {
        cursor: pointer;
        height: 100%;
        flex: 1;
        padding: 0 20px;
        text-align: center;
        line-height: $bar-height;

        &:not(:last-child) {
          border-right: 1px solid #e9e9e9;
        }

        & > i {
          margin-right: 6px;
        }

        &:hover {
          color: #1a73e8;
          background: rgba(66, 133, 244, 0.12);
        }
      }
    }

    .grp-list {
      overflow-y: auto;
      overflow-x: hidden;
      height: calc(100% - 45px - $bar-height);
      padding-top: 10px;

      .grp-item {
        display: flex;
        cursor: pointer;
        flex-flow: row;

        &:hover {
          background: rgba(190, 190, 190, 0.12);
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
          background: rgba(66, 133, 244, 0.12);

          .grp-sel-icon {
            color: #1a73e8;
          }
        }
      }
    }
  }

  .plan-editor {
    $bg: rgba(255, 255, 255, 0.82);
    flex: 1;
    height: calc(100% - 80px);
    overflow-x: hidden;
    overflow-y: auto;
    padding: 40px 15px;

    .form-box {
      padding: 10px 20px;
      &:not(:last-child) {
        border-bottom: 1px solid rgba(117, 117, 117, 0.12);
      }
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);

      .grp-input {
        position: relative;
        font-size: 14px;
        display: inline-block;
        width: 100%;
      }

      .grp-input > input {
        border-radius: 2px;
        height: 34px;
        line-height: 34px;
        padding: 0 12px;
        background-color: #fff;
        border: 2px solid #dcdfe6;
        color: #606266;
        display: inline-block;
        font-size: inherit;
        outline: 0;
        transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
        width: 100%;
        box-sizing: border-box;

        &:hover {
          border-color: #c0c4cc;
        }

        &:focus {
          border-color: #409eff;
          outline: 0;
        }
      }
    }

    .base-info {
      background: $bg;
    }

    .plan-grp-list {
      padding-top: 0;

      .grp-item {
        background: $bg;
        padding: 5px 20px 20px 20px;

        .grp-head {
          position: relative;
          font-size: 21px;
          margin: 10px 0 20px 0;
          color: #1a73e8;
        }

        .grp-person-item {
          &:not(:last-child) {
            margin-bottom: 15px;
          }

          & > .columns {
            padding: 10px 9px;

            & > .column {
              padding: 0 2px;
            }
          }

          .item-form {
            display: flex;
            flex-direction: row;

            & > * {
              display: flex;
            }

            & > .left-part {
              flex-basis: 12.5%;
            }

            & > .right-part {
              flex-basis: 87.5%;
            }

            .grp-input {
              & > input {
              }
            }

            .task-input,
            .task-input > input {
              cursor: pointer;
              margin-left: -2px;
            }
          }
        }
      }
    }

    .plan-grp-list-empty {
      $height: calc(100vh - 265px);
      height: $height;
      user-select: none;
      .center-brand {
        position: relative;
        font-size: 25px;
        color: rgba(138, 138, 138, 0.369);
        text-align: center;
        line-height: $height;
      }
    }
  }

  .plan-action-bar {
    position: absolute;
    display: flex;
    flex-direction: row;
    place-items: center;
    z-index: 999;
    bottom: 25px;
    right: 30px;
    background: rgba(255, 255, 255, 0.82);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);

    .plan-save-btn {
      cursor: pointer;
      padding: 7px 15px;
      background: rgba(35, 209, 96, 0.85);
      color: #fff;
      user-select: none;

      &:hover {
        opacity: 0.9;
      }

      i {
        margin-left: 10px;
      }
    }
  }

  .task-sel-dialog {
  }
}
</style>
