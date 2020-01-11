<template>
  <div class="page setting-page">
    <div class="setting-list">
      <div class="page-title">
        Settings
      </div>

      <div class="setting-card">
        <div class="title">
          基础设置
        </div>
        <div class="inner">
          <div class="setting-item">
            <div class="buttons">
              <template v-for="(fieldName, index) in StoredDataFields">
                <el-button
                  :key="index"
                  @click="$permission.adminBtn(() => { toggleDataEditor(fieldName) })"
                  size="small"
                >
                  {{ fieldName }}
                </el-button>
              </template>
              <el-button @click="$permission.adminBtn(() => { toggleDataEditor('__ALL__') })" size="small">
                __ALL__
              </el-button>
            </div>
          </div>
          <div
            v-if="dataEditorTargetFieldName !== null"
            class="setting-item"
          >
            <div class="field">
              <el-input
                v-model="dataEditorVal"
                :rows="15"
                :placeholder="`编辑数据 ${dataEditorTargetFieldName}`"
                type="textarea"
              />
            </div>
            <el-button @click="$permission.adminBtn(dataEditorSave)" type="success" size="mini">
              <i class="zmdi zmdi-save" /> 保存
            </el-button>
          </div>
        </div>
      </div>

      <div class="setting-card">
        <div class="title">
          维护操作
        </div>
        <div class="inner">
          <div class="setting-item">
            <div class="buttons">
              <el-button @click="$permission.openModifyPasswordDialog()" size="small">
                修改密码
              </el-button>
              <el-button @click="$permission.adminBtn(syncRecList)" size="small">
                同步 RecList
              </el-button>
              <el-button v-if="!isWeb" @click="$permission.adminBtn(openDevTools)" size="small">
                打开调试工具
              </el-button>
              <el-button
                ref="deleteVuexStoreDataBtn"
                @click="$permission.adminBtn(deleteVuexStoreData)"
                size="small"
              >
                清除所有内容和设定
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <div class="setting-card">
        <div class="title">
          云端同步
        </div>
        <div class="inner">
          <div class="setting-item">
            <el-form @submit.native.prevent class="form">
              <el-checkbox :checked="$duty.Setting.RemoteSync.enabled" @change="remoteSyncSwitch('enabled', $event)">
                启用
              </el-checkbox>
              <el-checkbox :checked="$duty.Setting.RemoteSync.autoSync" @change="remoteSyncSwitch('autoSync', $event)">
                自动同步
              </el-checkbox>
              <el-form-item label="服务器">
                <el-input v-model="$duty.Setting.RemoteSync.server" @input="$dutyHelper.localSave()" placeholder="输入 Server URL" />
              </el-form-item>
            </el-form>
            <div class="buttons">
              <el-button @click="$permission.adminBtn($dutyHelper.remoteUpload)" size="small">
                上传数据到云端
              </el-button>
              <el-button @click="$permission.adminBtn($dutyHelper.remoteDownload)" size="small">
                从云端下载数据
              </el-button>
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
import { Component } from 'vue-property-decorator'
import Vue from 'vue'
import * as DutyModels from 'duty-schedule-core'
import Dialog from '../components/Dialog.vue'

@Component({
  components: { Dialog }
})
export default class Setting extends Vue {
  dataEditorTargetFieldName: string | null = null

  dataEditorVal: string = ""

  mounted () {
    if (typeof (window as any).SETTING_DATA_ALLOW_EDIT === "undefined") {
      (window as any).SETTING_DATA_ALLOW_EDIT = false
    }
  }

  get version () {
    // eslint-disable-next-line global-require
    return require("../../../package.json").version
  }

  get StoredDataFields () {
    return this.$duty.Store.StoredFieldNames
  }

  toggleDataEditor (fieldName: string) {
    if (this.dataEditorTargetFieldName === fieldName) {
      this.dataEditorTargetFieldName = null
      this.dataEditorVal = ''
      return
    }

    /* if (fieldName === "__ALL_OLD_VERSION__") {
      this.dataEditorVal = ''
      this.dataEditorTargetFieldName = fieldName
      return
    } */

    const storeImportObj = this.$duty.Store.toObj()
    let jsonObj = storeImportObj
    if (fieldName !== "__ALL__") {
      jsonObj = storeImportObj[fieldName]
    }

    this.dataEditorVal = JSON.stringify(
      jsonObj,
      null,
      fieldName !== "__ALL__" ? "  " : undefined
    )
    this.dataEditorTargetFieldName = fieldName
  }

  dataEditorSave () {
    const targetKey = this.dataEditorTargetFieldName
    if (targetKey === null)
      return

    // 检验 JSON 是否可被解析
    try {
      JSON.parse(this.dataEditorVal)
    } catch (e) {
      throw new Error('this.dataEditorVal JSON 无法解析')
    }

    let json = this.dataEditorVal
    if (targetKey === "__ALL__") {
      this.$duty.Store.clearAll()
    } else {
      json = `{"${targetKey}": ${json}}`
    }

    this.$duty.Store.import(json)

    this.$dutyHelper.localSave()
    window.notify(`数据 ${targetKey} 已保存`)
  }

  syncRecList () {
    this.$duty.Store.recSync()
    this.$dutyHelper.localSave()
    window.notify('RecList 已同步')
  }

  deleteVuexStoreData () {
    const el = this.$refs.deleteVuexStoreDataBtn as any
    if (typeof el.clickTime !== "number") {
      el.clickTime = 1
    } else {
      el.clickTime++
    }
    if (el.clickTime < 5) {
      window.notify(`危险操作，请再点 ${  5 - el.clickTime  } 次`, 'e')
    } else {
      this.$duty.Store.clearAll()
      this.$dutyHelper.localSave()
      window.location.reload()
    }
  }

  openDevTools () {
    if (this.isWeb) { return }
    // eslint-disable-next-line global-require
    require('electron').ipcRenderer.send("open-dev-tools")
  }

  openBlog () {
    if (this.isWeb) {
      window.location.href = 'https://qwqaq.com'
      return
    }
    // eslint-disable-next-line global-require
    require('electron').shell.openExternal("https://qwqaq.com")
  }

  remoteSyncSwitch (fieldName: string, isEnabled: boolean) {
    if (!_.has(this.$duty.Setting.RemoteSync, fieldName)) {
      const err = `remoteSyncSwitch() "${fieldName}" fieldName not found.`
      window.notify(err, 'e')
      throw new Error(err)
    }
    this.$permission.adminBtn(() => {
      (this.$duty.Setting.RemoteSync as any)[fieldName] = isEnabled
      this.$dutyHelper.localSave()
    })
  }

  get isWeb () {
    return process.env.IS_WEB
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

        & > *:not(:last-child) {
          margin-bottom: 10px;
        }
      }
    }
  }
}
</style>
