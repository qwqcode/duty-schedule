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
              <template v-for="(fieldName, index) in $dataStore.DATA_FIELDS">
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
              <el-button @click="$permission.adminBtn(() => { toggleDataEditor('__ALL_OLD_VERSION__') })" size="small">
                __ALL__ (旧版)
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
                :rows="5"
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
              <el-checkbox :checked="$dataStore.Settings.remoteSync.enabled" @change="remoteSyncSwitch('enabled', $event)">
                启用
              </el-checkbox>
              <el-checkbox :checked="$dataStore.Settings.remoteSync.autoSync" @change="remoteSyncSwitch('autoSync', $event)">
                自动同步
              </el-checkbox>
              <el-form-item label="服务器">
                <el-input v-model="$dataStore.Settings.remoteSync.server" @input="$dataStore.save()" placeholder="输入 Server URL" />
              </el-form-item>
            </el-form>
            <div class="buttons">
              <el-button @click="$permission.adminBtn($dataAction.remoteSyncUpload)" size="small">
                上传数据到云端
              </el-button>
              <el-button @click="$permission.adminBtn($dataAction.remoteSyncDownload)" size="small">
                从云端同步数据
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
import Dialog from '../components/Dialog.vue'
import * as DataType from '@/core/data-interfaces'

@Component({
  components: { Dialog }
})
export default class Setting extends Vue {
  dataEditorTargetFieldName: string | null = null

  dataEditorVal: string = ""

  mounted() {
    if (typeof (window as any).SETTING_DATA_ALLOW_EDIT === "undefined") {
      (window as any).SETTING_DATA_ALLOW_EDIT = false
    }
  }

  get version() {
    // eslint-disable-next-line global-require
    return require("../../../package.json").version
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
      const allJson: any = {}
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
    const targetKey = this.dataEditorTargetFieldName
    if (targetKey !== null) {
      if (targetKey === "__ALL_OLD_VERSION__") {
        this.oldVersionDataImport(JSON.parse(this.dataEditorVal))
        return
      }

      if (targetKey === "__ALL__") {
        const obj = JSON.parse(this.dataEditorVal)
        _.forEach(obj, (val, key) => {
          this.$dataAction.settingSetData(key, val)
        })
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
    const el = this.$refs.deleteVuexStoreDataBtn as any
    if (typeof el.clickTime !== "number") {
      el.clickTime = 1
    } else {
      el.clickTime++
    }
    if (el.clickTime < 5) {
      window.notify(`危险操作，请再点 ${  5 - el.clickTime  } 次`, 'e')
    } else {
      this.$dataStore.clearAll()
    }
  }

  openDevTools() {
    if (this.isWeb) { return }
    // eslint-disable-next-line global-require
    require('electron').ipcRenderer.send("open-dev-tools")
  }

  openBlog() {
    if (this.isWeb) {
      window.location.href = 'https://qwqaq.com'
      return
    }
    // eslint-disable-next-line global-require
    require('electron').shell.openExternal("https://qwqaq.com")
  }

  remoteSyncSwitch (fieldName: string, isEnabled: boolean) {
    if (!_.has(this.$dataStore.Settings.remoteSync, fieldName)) {
      const err = `remoteSyncSwitch() "${fieldName}" fieldName not found.`
      window.notify(err, 'e')
      throw new Error(err)
    }
    this.$permission.adminBtn(() => {
      (this.$dataStore.Settings.remoteSync as any)[fieldName] = isEnabled
      this.$dataStore.save()
    })
  }

  oldVersionDataImport(data: any) {
    const PlanList: DataType.Plan[] = []
    const GrpList: DataType.Grp[] = []
    const AreaList: DataType.Area[] = []

    const getGrpIdByStr = (str: string) => { return Number((str.match(/第 ([0-9]+) 组/) as any)[1]) }
    const getHandledAreaName = (str: string) => {
      return ({ '教室': '教室', '工区': '公区', '公区': '公区' } as any)[
        (str.match(/(教室|工区|公区)/) as any)[1]
      ]
    }

    // PlanList
    _.forEach(data.taskList, (item) => {
      const planGrpList: DataType.PlanGrp[] = []

      _.forEach(item.memberGroupList, (grpItem) => {
        const personTaskList: DataType.PersonTaskItem[] = []
        _.forEach(grpItem.data, (personTaskItem) => {
          personTaskList.push({ person: personTaskItem.name, task: personTaskItem.task })
        })

        planGrpList.push({
          grpId: getGrpIdByStr(grpItem.name),
          area: getHandledAreaName(grpItem.taskTypeGroupName),
          personTaskList
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
        _.forEach(areaItem.data, (item) => { if (findArea) { findArea.taskList.push(item) } })
      }
    })


    this.$dataAction.settingSetData('PlanList', PlanList)
    this.$dataAction.settingSetData('GrpList', GrpList)
    this.$dataAction.settingSetData('AreaList', AreaList)

    // 同步 Res
    this.$dataAction.syncRec()
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
