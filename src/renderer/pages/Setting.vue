<template>
  <div class="page setting-page">
    <div class="setting-list">
      <div class="page-title">Settings</div>

      <div class="setting-card">
        <div class="title">基础设置</div>
        <div class="inner">
          <div class="setting-item">
            <div class="buttons">
              <template v-for="(fieldName, index) in dataStore.DATA_FIELDS">
                <el-button
                  size="small"
                  :key="index"
                  @click="toggleDataEditor(fieldName)"
                >{{ fieldName }}</el-button>
              </template>
              <el-button size="small" @click="toggleDataEditor('__ALL__')">__ALL__</el-button>
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
        <img src="../assets/icon.png" width="60px" height="60px">
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
import DataAction from "../core/data-action"
import DataStore from "../core/data-store"
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

  get dataStore () {
    return DataStore
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

    let jsonObj = {}
    if (fieldName === "__ALL__") {
      let allJson: any = {}
      _.forEach(DataStore.DATA_FIELDS, (key) => {
        allJson[key] = (DataStore as any)[key]
      })
      jsonObj = allJson
    } else {
      jsonObj = (DataStore as any)[fieldName]
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
      if (targetKey === "__ALL__") {
        let obj = JSON.parse(this.dataEditorVal)
        for (let key in obj) {
          DataAction.settingSetData(key, obj[key])
        }
      } else {
        DataAction.settingSetData(targetKey, JSON.parse(this.dataEditorVal))
      }
    }
  }

  syncRecList() {
    DataAction.syncRec()
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
      DataStore.clearAll()
    }
  }

  openDevTools() {
    ipcRenderer.send("open-dev-tools")
  }

  openBlog() {
    shell.openExternal("https://qwqaq.com")
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
