<template>
  <div class="page fullscreen builder-page">
    <div class="grp-selector">
      <div class="sel-action-bar">
        <span @click="autoSelectGrp()" class="action-btn">
          <i class="zmdi zmdi-flare" /> 一键安排
        </span>
        <span @click="autoSelectGrp()" class="action-btn">
          <i class="zmdi zmdi-graphic-eq" /> 自动选组
        </span>
      </div>
      <div class="grp-list">
        <div
          v-for="grp in $duty.Store.GrpList"
          :key="grp.name"
          @click="selectGrp(grp)"
          :class="{ 'is-selected': isGrpSelected(grp) }"
          class="grp-item"
        >
          <div class="grp-sel-icon">
            <i :class="!isGrpSelected(grp) ? 'zmdi zmdi-circle' : 'zmdi zmdi-check-circle'" />
          </div>
          <div class="grp-name">
            组 {{ grp.name }}
          </div>
          <div class="badge-box">
            <span v-if="grp.isExitsInLatestPlan" class="warn">上次</span>
            <span v-if="!!getGrpAssignedArea(grp.name)" class="success">本次: {{ getGrpAssignedArea(grp.name) }}</span>
            <span v-if="grpBadgeConf.showAreaHistory">{{ (grp.lastDidAreaRec ? grp.lastDidAreaRec.area.name || '?' : '?').substr(0, 1) }}</span>
            <span>
              {{ grp.getAreaActionNumTotal() }} =
              {{ grp.getAreaActionNum('教室') }} + {{ grp.getAreaActionNum('公区') }}
            </span>
          </div>
        </div>
      </div>
      <div class="grp-badge-controller">
        <span @click="grpBadgeConf.showAreaHistory = !grpBadgeConf.showAreaHistory">
          <i :class="`zmdi zmdi-${grpBadgeConf.showAreaHistory ? 'check-circle' : 'circle-o'}`" />
          历史区域
        </span>
      </div>
    </div>

    <div class="plan-editor">
      <div class="inner">
        <div class="base-info form-box">
          <el-form class="center-form">
            <el-form-item label="标题">
              <div class="grp-input">
                <input v-model="plan.name" type="text" autocomplete="off" placeholder="输入文字">
              </div>
            </el-form-item>
            <el-form-item label="执行日期">
              <div class="grp-input">
                <el-date-picker
                  v-model="plan.actionTime"
                  :default-value="new Date()"
                  type="date"
                  placeholder="选择日期"
                  format="yyyy 年 MM 月 dd 日"
                  value-format="timestamp"
                />
              </div>
            </el-form-item>
            <el-form-item label="提醒事项">
              <div class="grp-input">
                <textarea v-model="plan.note" type="text" placeholder="输入文字" />
              </div>
            </el-form-item>
          </el-form>
        </div>

        <div class="plan-grp-list">
          <div
            v-for="planGrp in plan.grpList"
            :key="planGrp.name"
            class="grp-item form-box anim-fade-in"
          >
            <div class="grp-head">
              组 {{ planGrp.name }}
            </div>

            <div
              v-for="(asgn, index) in planGrp.asgnList"
              :key="index"
              class="grp-person-item"
            >
              <div class="item-form">
                <div class="left-part">
                  <div class="grp-input person-input">
                    <input
                      v-model="asgn.oneName"
                      @focus="exchangeTool.on ? exchangePerson(asgn, $event.target) : null"
                      readonly
                      type="text"
                      autocomplete="off"
                      placeholder="名字"
                    >
                  </div>
                </div>
                <div class="right-part">
                  <div class="grp-input task-input">
                    <input
                      :value="asgn.taskName"
                      @focus="$personProfile.open(asgn.oneName, { data: asgn, plan })"
                      type="text"
                      readonly="readonly"
                      autocomplete="off"
                      placeholder="任务"
                    >
                    <div class="badge-box">
                      <span v-if="!!asgn.one ? asgn.one.isJustDidTask(asgn.taskName) : false" class="warn">上次做过</span>
                      <span v-if="!!asgn.one">{{ asgn.one.getTaskActionNum(asgn.taskName) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="plan-action-bar">
      <span class="left-btns">
        <span @click="toggleExchangeTool()" :class="{ active: exchangeTool.on }" class="tool-btn action-btn no-hover">
          置换工具
          <i class="zmdi zmdi-swap-alt" />
        </span>
      </span>

      <span class="right-btns">
        <span @click="$permission.adminBtn(() => { savePlan() })" class="save-plan-btn action-btn">
          保存
          <i class="zmdi zmdi-save" />
        </span>
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import $ from 'jquery'
import _ from 'lodash'
import Vue from 'vue'
import { Plan, Grp, GrpInPlan, Asgn, Area } from 'duty-schedule-core'
import { Component, Watch } from 'vue-property-decorator'
import GrpList from './GrpList.vue'
import Dialog from '../components/Dialog.vue'

@Component({
  components: { GrpList, Dialog }
})
export default class Builder extends Vue {
  plan!: Plan
  selGrpList: Grp[] = []

  exchangeTool: {
    on: boolean,
    asgn: Asgn|null
  } = {
    on: false,
    asgn: null,
  }

  grpBadgeConf = {
    showAreaHistory: false
  }

  created () {
    this.createEmptyPlan()
  }

  createEmptyPlan () {
    this.plan = new Plan()
    this.plan.id = new Date().getTime()
    this.plan.name = `${this.getDateText()}`
    this.plan.actionTime = new Date().getTime()
    this.plan.createdTime = new Date().getTime()
    this.plan.grpList = []
    this.plan.note = ''
  }

  public getDateText () {
    const myDate = new Date()
    const year = myDate.getFullYear()
    const month = myDate.getMonth() + 1
    const date = myDate.getDate()
    const str = `星期${'日一二三四五六'.charAt(new Date().getDay())}`
    return `${year}-${month}-${date} ${str}`
  }

  getGrpAssignedArea (grpName: string) {
    const grpInPlan = this.plan.grpList.find(o => o.name === grpName)
    if (!grpInPlan) return undefined
    return (grpInPlan.areaName || '?').substr(0, 1)
  }

  //
  // 小组选择
  //

  selectGrp (grp: Grp) {
    if (!this.isGrpSelected(grp)) { // 若未选中
      this.selGrpList.push(grp)
    } else {
      this.selGrpList.splice(this.selGrpList.indexOf(grp), 1)
    }
  }

  isGrpSelected (grp: Grp) {
    return this.selGrpList.indexOf(grp) > -1
  }

  /** 自动选组 */
  autoSelectGrp () {
    const fateList = this.$duty.Fate.getFateAreaToGrpDict()

    this.selGrpList = [
      fateList['教室'][0],
      fateList['教室'][1],
      fateList['公区'][0],
      fateList['公区'][1]
    ]
  }


  // /
  // / 小组成员任务安排
  // /

  @Watch('selGrpList')
  onSelGrpListChanged (selGrpList: Grp[]) {
    window.console.log('selGrpList', selGrpList)

    const areaOrder = ['教室', '教室', '公区', '公区']
    const areaToGrps: { [areaName: string]: Grp[] } = {}
    const grpToAreaDict: { [grpName: string]: string } = {}
    _.forEach(selGrpList, (grp, index) => {
      const areaName = areaOrder[index]
      const areaGrps = areaToGrps[areaName] || (areaToGrps[areaName] = [])
      areaGrps.push(grp)
      grpToAreaDict[grp.name] = areaName
    })
    window.console.log('grpToAreaDict', areaToGrps)

    const oneToTaskDict = this.$duty.Fate.getFateOneToTaskDict(areaToGrps)
    window.console.log('personToTask', oneToTaskDict)

    // 创建新 grpList
    const GrpInPlanList: GrpInPlan[] = []

    _.forEach(selGrpList, (grp) => {
      const asgnList: Asgn[] = []
      _.forEach(grp.oneList, (one) => {
        const asgn = new Asgn()
        asgn.oneName = one.name
        asgn.taskName = oneToTaskDict[one.name] || ''
        asgnList.push(asgn)
      })

      const grpInPlan = new GrpInPlan()
      grpInPlan.name = grp.name
      grpInPlan.asgnList = asgnList
      grpInPlan.areaName = grpToAreaDict[grp.name]

      GrpInPlanList.push(grpInPlan)
    })

    this.plan.grpList = GrpInPlanList
    window.console.log("\n\n")
  }

  savePlan () {
    // 刷新时间
    this.plan.createdTime = new Date().getTime()
    this.$dataAction.savePlan(this.plan)
    this.$router.replace('/')
  }

  exchangePerson (asgn: Asgn, inputEl: HTMLElement) {
    if (!this.exchangeTool.on) return
    if (!this.exchangeTool.asgn) {
      // 添加置换源
      this.exchangeTool.asgn = asgn
    } else {
      // 执行置换
      const aRawTaskName = this.exchangeTool.asgn.taskName
      const bRawTaskName = asgn.taskName

      this.exchangeTool.asgn.taskName = bRawTaskName
      asgn.taskName = aRawTaskName

      this.exchangeTool.asgn = null
      this.exchangeTool.on = false

      inputEl.blur()
    }
  }

  toggleExchangeTool () {
    this.exchangeTool.on = !this.exchangeTool.on
    if (this.exchangeTool.on === false) {
      this.exchangeTool.asgn = null
    }
  }
}
</script>

<style lang="scss" scoped>
.builder-page {
  overflow: hidden !important;
  display: flex;
  flex-flow: row;

  .badge-box {
    position: absolute;
    right: 10px;
    top: 0;
    height: 100%;
    display: flex;
    flex-direction: row;
    justify-content: center;
    place-items: center;

    & > span {
      height: 20px;
      line-height: 20px;
      background: rgba(66, 133, 244, 0.12);
      padding: 0 7px;
      border-radius: 1px;
      font-size: 11px;

      &:not(:last-child) {
        margin-right: 5px;
      }

      &.warn {
        background: rgba(255, 166, 32, 0.264);
      }

      &.success {
        color: #009474;
        background: rgba(35, 209, 96, 0.16)
      }
    }
  }

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

    $grp-badge-controller-height: 35px;

    .grp-list {
      overflow-y: auto;
      overflow-x: hidden;
      height: calc(100% - 47px - 10px - #{$bar-height} - #{$grp-badge-controller-height});
      padding-top: 10px;

      .grp-item {
        position: relative;
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

    .grp-badge-controller {
      height: $grp-badge-controller-height;
      line-height: $grp-badge-controller-height;
      display: flex;
      flex-direction: row;

      & > span {
        font-size: 12px;
        flex: 1;
        cursor: pointer;
        padding: 0 15px;

        & > i {
          margin-right: 4px;
        }

        &:hover {
          color: #0083ff;
          background: #FFF;
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

      .grp-input > input, .grp-input > textarea {
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

      .grp-input > textarea {
        min-height: 80px;
        resize: vertical;
        padding: 6px 12px;
        line-height: 20px;
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

            .task-input {
              position: relative;
              &, & > input {
                cursor: pointer;
                margin-left: -2px;
              }
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
    bottom: 45px;
    right: 30px;
    width: calc(100% - 337px);
    height: 0;
    place-content: space-between;

    .action-btn {
	    cursor: pointer;
	    padding: 7px 15px;
	    user-select: none;
 	    background: rgba(255, 255, 255, 0.82);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);

      i {
        margin-left: 6px;
      }

      &.active {
        color: #1a73e8;
        background: rgb(202, 222, 255);
      }

      &:hover:not(.no-hover) {
        color: #1a73e8;
        background: rgba(202, 222, 255, 0.74);
      }

      &.save-plan-btn {
        color: #fff;
        background: rgba(35, 209, 96, 0.85);

        &:hover {
          color: #fff;
          background: rgba(35, 209, 96, 0.85);
          opacity: 0.9;
        }
      }
    }
  }

  .task-sel-dialog {
  }
}
</style>
