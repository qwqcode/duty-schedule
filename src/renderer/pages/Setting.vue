<template>
  <div class="page setting-page">
    <div class="setting-list">
      <div class="page-title">Settings</div>

      <div class="setting-card">
        <div class="title">基础设置</div>
        <div class="inner">
          <div class="setting-item">
            <div class="buttons">
              <template v-for="(fieldName, index) in $dataStore.DATA_FIELDS">
                <el-button
                  size="small"
                  :key="index"
                  @click="toggleDataEditor(fieldName)"
                >{{ fieldName }}</el-button>
              </template>
              <el-button size="small" @click="toggleDataEditor('__ALL__')">__ALL__</el-button>
              <el-button size="small" @click="toggleDataEditor('__ALL_OLD_VERSION__')">__ALL__ (旧版)</el-button>
            </div>
          </div>
          <div
            class="setting-item"
            v-if="dataEditorTargetFieldName !== null"
          >
            <div class="field">
              <el-input
                type="textarea"
                :rows="5"
                :placeholder="`编辑数据 ${dataEditorTargetFieldName}`"
                v-model="dataEditorVal"
              ></el-input>
            </div>
            <el-button type="success" size="mini" @click="dataEditorSave">
              <i class="zmdi zmdi-save"></i> 保存
            </el-button>
          </div>
        </div>
      </div>

      <div class="setting-card">
        <div class="title">其他操作</div>
        <div class="inner">
          <div class="setting-item">
            <div class="buttons">
              <el-button size="small" @click="syncRecList()">同步 RecList</el-button>
              <el-button size="small" @click="openDevTools()">打开调试工具</el-button>
              <el-button
                size="small"
                @click="deleteVuexStoreData()"
                ref="deleteVuexStoreDataBtn"
              >清除所有内容和设定</el-button>
            </div>
          </div>
        </div>
      </div>

      <div class="setting-card" style="text-align: center;">
        <img src="../assets/icon.png" style="padding-top: 20px;" width="60px" height="60px">
        <br>
        <br>
        <b style="font-size: 1.4em;">值日任务表 v{{ version }}</b>
        <br>
        <br>© 2019
        <span @click="openBlog()" style="cursor: pointer;color: #1a73e8">qwqaq.com</span>
      </div>

    </div>
  </div>
</template>

<script lang="ts">
import _ from 'lodash'
import { ipcRenderer, shell } from 'electron'
import Vue from 'vue'
import * as DataType from '@/core/data-interfaces'
import { Component } from 'vue-property-decorator';

@Component({})
export default class Setting extends Vue {
  dataEditorTargetFieldName: string | null = null
  dataEditorVal: string = ""

  mounted() {
    if (typeof (window as any).SETTING_DATA_ALLOW_EDIT === "undefined") {
      (window as any).SETTING_DATA_ALLOW_EDIT = false
    }
  }

  get version() {
    return require("../../../package.json").version
  }

  isDataAllowEdit() {
    if (
      typeof (window as any).SETTING_DATA_ALLOW_EDIT !== "boolean" ||
      (window as any).SETTING_DATA_ALLOW_EDIT !== true
    ) {
      window.notify("没有权限修改数据", "w")
      console.log("[window.SETTING_DATA_ALLOW_EDIT]")
      return false
    } else {
      return true
    }
  }

  toggleDataEditor(fieldName: string) {
    if (this.dataEditorTargetFieldName === fieldName) {
      this.dataEditorTargetFieldName = null
      this.dataEditorVal = ''
      return
    }

    if (fieldName === "__ALL_OLD_VERSION__") {
      this.dataEditorVal = ''
      this.dataEditorTargetFieldName = fieldName
      return
    }

    let jsonObj = {}
    if (fieldName === "__ALL__") {
      let allJson: any = {}
      _.forEach(this.$dataStore.DATA_FIELDS, (key) => {
        allJson[key] = (this.$dataStore as any)[key]
      })
      jsonObj = allJson
    } else {
      jsonObj = (this.$dataStore as any)[fieldName]
    }

    this.dataEditorVal = JSON.stringify(
      jsonObj,
      null,
      fieldName !== "__ALL__" ? "  " : undefined
    )
    this.dataEditorTargetFieldName = fieldName
  }

  dataEditorSave() {
    if (!this.isDataAllowEdit()) {
      return
    }

    let targetKey = this.dataEditorTargetFieldName
    if (targetKey !== null) {
      if (targetKey === "__ALL_OLD_VERSION__") {
        this.oldVersionDataImport(JSON.parse(this.dataEditorVal))
        return
      }

      if (targetKey === "__ALL__") {
        let obj = JSON.parse(this.dataEditorVal)
        for (let key in obj) {
          this.$dataAction.settingSetData(key, obj[key])
        }
      } else {
        this.$dataAction.settingSetData(targetKey, JSON.parse(this.dataEditorVal))
      }
    }
  }

  syncRecList() {
    this.$dataAction.syncRec()
    window.notify('RecList 已同步')
  }
  deleteVuexStoreData() {
    if (!this.isDataAllowEdit()) {
      return
    }

    let el = this.$refs.deleteVuexStoreDataBtn as any
    if (typeof el.clickTime !== "number") {
      el.clickTime = 1
    } else {
      el.clickTime++
    }
    if (el.clickTime < 5) {
      window.notify("危险操作，请再点 " + (5 - el.clickTime) + " 次", 'e')
    } else {
      this.$dataStore.clearAll()
    }
  }

  openDevTools() {
    ipcRenderer.send("open-dev-tools")
  }

  openBlog() {
    shell.openExternal("https://qwqaq.com")
  }

  oldVersionDataImport(data: any) {
    let PlanList: DataType.Plan[] = []
    let GrpList: DataType.Grp[] = []
    let AreaList: DataType.Area[] = []

    const getGrpIdByStr = (str: string) => { return Number((str.match(/第 ([0-9]+) 组/) as any)[1]) }
    const getHandledAreaName = (str: string) => {
      return ({ '教室': '教室', '工区': '公区', '公区': '公区' } as any)[
        (str.match(/(教室|工区|公区)/) as any)[1]
      ]
    }

    // PlanList
    _.forEach(data.taskList, (item, i) => {
      let planGrpList: DataType.PlanGrp[] = []

      _.forEach(item.memberGroupList, (grpItem, i) => {
        let personTaskList: DataType.PersonTaskItem[] = []
        _.forEach(grpItem.data, (personTaskItem, i) => {
          personTaskList.push({ person: personTaskItem.name, task: personTaskItem.task })
        })

        planGrpList.push({
          grpId: getGrpIdByStr(grpItem.name),
          area: getHandledAreaName(grpItem.taskTypeGroupName),
          personTaskList: personTaskList
        })
      })

      PlanList.push({
        id: Number(item.time),
        name: item.title as string,
        time: Number(item.time),
        grpList: planGrpList
      })
    })

    // GrpList
    _.forEach(data.memberGroupList, (grpItem, i) => {
      GrpList.push({
        id: getGrpIdByStr(grpItem.name),
        personList: grpItem.data
      })
    })

    // AreaList
    _.forEach(data.taskTypeGroupList, (areaItem, i) => {
      let findArea = AreaList.find(o => o.name === getHandledAreaName(areaItem.name))
      if (!findArea) {
        findArea = { name: getHandledAreaName(areaItem.name), taskList: areaItem.data }
        AreaList.push(findArea)
      } else {
        _.forEach(areaItem.data, (item) => { if (!!findArea) { findArea.taskList.push(item) } })
      }
    })


    this.$dataAction.settingSetData('PlanList', PlanList)
    this.$dataAction.settingSetData('GrpList', GrpList)
    this.$dataAction.settingSetData('AreaList', AreaList)

    // 同步 Res
    this.$dataAction.syncRec()
  }
}
</script>

<style scoped lang="scss">
.setting-page {
  .setting-list {
    max-width: 80%;
    margin: 0 auto;

    .setting-card {
      padding: 20px;
      background: rgba(255, 255, 255, 0.92);

      &:not(:last-child) {
        margin-bottom: 10px;
      }

      .title {
        font-size: 1.4em;
        font-weight: bold;
        margin-bottom: 15px;
      }

      .setting-item {
        &:not(:last-child) {
          margin-bottom: 10px;
        }
      }
    }
  }
}
</style>
