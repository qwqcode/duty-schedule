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
                  @click="adminBtn(() => { toggleDataEditor(fieldName) })"
                >{{ fieldName }}</el-button>
              </template>
              <el-button size="small" @click="adminBtn(() => { toggleDataEditor('__ALL__') })">__ALL__</el-button>
              <el-button size="small" @click="adminBtn(() => { toggleDataEditor('__ALL_OLD_VERSION__') })">__ALL__ (旧版)</el-button>
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
            <el-button type="success" size="mini" @click="adminBtn(dataEditorSave)">
              <i class="zmdi zmdi-save"></i> 保存
            </el-button>
          </div>
        </div>
      </div>

      <div class="setting-card">
        <div class="title">维护操作</div>
        <div class="inner">
          <div class="setting-item">
            <div class="buttons">
              <el-button size="small" @click="adminBtn(() => { openPasswordDialog('modify') })">修改密码</el-button>
              <el-button size="small" @click="adminBtn(syncRecList)">同步 RecList</el-button>
              <el-button size="small" @click="adminBtn(openDevTools)">打开调试工具</el-button>
              <el-button
                size="small"
                @click="adminBtn(deleteVuexStoreData)"
                ref="deleteVuexStoreDataBtn"
              >清除所有内容和设定</el-button>
            </div>
          </div>
        </div>
      </div>

      <div class="setting-card">
        <div class="title">云端同步</div>
        <div class="inner">
          <div class="setting-item">
            <el-form class="form" @submit.native.prevent>
              <el-checkbox :checked="$dataStore.Settings.remoteSync.enabled" @change="remoteSyncSwitch('enabled', $event)">启用</el-checkbox>
              <el-checkbox :checked="$dataStore.Settings.remoteSync.autoSync" @change="remoteSyncSwitch('autoSync', $event)">自动同步</el-checkbox>
              <el-form-item label="服务器">
                <el-input v-model="$dataStore.Settings.remoteSync.server" placeholder="输入 Server URL" @input="$dataStore.save()"></el-input>
              </el-form-item>
            </el-form>
            <div class="buttons">
              <el-button size="small" @click="adminBtn($dataAction.remoteSyncUpload)">上传数据到云端</el-button>
              <el-button size="small" @click="adminBtn($dataAction.remoteSyncDownload)">从云端同步数据</el-button>
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

      <Dialog :isOpened="passwordDialog.isOpened" @close="passwordDialog.isOpened = false">
        <div class="password-dialog">
          <div class="desc">{{ { 'input': '请求管理员权限', 'modify': '修改管理员密码' }[passwordDialog.type] }}</div>
          <el-form :inline="true" @submit.native.prevent>
            <el-form-item>
              <el-input
                ref="passwordInput"
                v-model="passwordDialog.value"
                :type="{ 'input': 'password', 'modify': 'text' }[passwordDialog.type]"
                placeholder="输入密码"
                autocomplete="off"
              >
                <i slot="prefix" class="el-input__icon el-icon-lock"></i>
              </el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" native-type="submit" plain size="small" @click="passwordAction()">确认</el-button>
            </el-form-item>
          </el-form>
        </div>
      </Dialog>

    </div>
  </div>
</template>

<script lang="ts">
import _ from 'lodash'
import { ipcRenderer, shell } from 'electron'
import Vue from 'vue'
import Dialog from '../components/Dialog.vue'
import * as DataType from '@/core/data-interfaces'
import { Component } from 'vue-property-decorator';

@Component({
  components: { Dialog }
})
export default class Setting extends Vue {
  dataEditorTargetFieldName: string | null = null
  dataEditorVal: string = ""
  passwordDialog = {
    isOpened: false,
    type: <'input'|'modify'|null> null,
    value: '',
    onSuccess: () => {}
  }

  mounted() {
    if (typeof (window as any).SETTING_DATA_ALLOW_EDIT === "undefined") {
      (window as any).SETTING_DATA_ALLOW_EDIT = false
    }
  }

  get version() {
    return require("../../../package.json").version
  }

  openPasswordDialog (type: 'input'|'modify'|null) {
    this.passwordDialog.value = ''
    this.passwordDialog.isOpened = true
    this.passwordDialog.type = type
    window.setTimeout(() => {
      (this.$refs.passwordInput as HTMLElement).focus()
    }, 80)
  }

  passwordAction () {
    switch (this.passwordDialog.type) {
      case 'input':
        if (this.passwordDialog.value === this.$dataStore.Settings.password) {
          this.passwordDialog.isOpened = false
          this.passwordDialog.onSuccess()
        } else {
          this.passwordDialog.value = ''
          window.notify('密码错误', 'e')
        }
        break
      case 'modify':
        this.$dataStore.Settings.password = this.passwordDialog.value
        this.$dataStore.save()
        window.notify('密码修改成功', 's')
        this.passwordDialog.isOpened = false
        this.passwordDialog.value = ''
        break
    }
  }

  adminBtn (evt: () => void) {
    if (
      typeof this.$dataStore.Settings.password === 'undefined' ||
      this.$dataStore.Settings.password === '' ||
      this.passwordDialog.value === this.$dataStore.Settings.password
    ) {
      evt()
      return
    }

    this.openPasswordDialog('input')
    this.passwordDialog.onSuccess = evt
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

  remoteSyncSwitch (fieldName: string, isEnabled: boolean) {
    if (!this.$dataStore.Settings.remoteSync.hasOwnProperty(fieldName)) {
      let err = 'remoteSyncSwitch() "'+fieldName+'" fieldName not found.'
      window.notify(err, 'e')
      throw new Error(err)
    }
    this.adminBtn(() => {
      (this.$dataStore.Settings.remoteSync as any)[fieldName] = isEnabled
      this.$dataStore.save()
    })
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

        & > *:not(:last-child) {
          margin-bottom: 10px;
        }
      }
    }
  }
}

.password-dialog {
  background: #fff;
  padding: 20px 30px;

  .desc {
    margin-top: 15px;
    margin-bottom: 15px;
  }
}
</style>
