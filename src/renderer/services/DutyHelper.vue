<template>
  <div>
    <Dialog ref="loading" :showCloseBtn="false" class="loading">
      <div class="msg">
        <i class="zmdi zmdi-download" /> 数据正在从云端同步中 <span class="dots" />
      </div>
    </Dialog>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import _ from 'lodash'
import axios from 'axios'
import { Component, Watch } from 'vue-property-decorator'
import Dialog from '@/components/Dialog.vue'

@Component({ components: { Dialog } })
export default class DutyHelper extends Vue {
  created () {
    Vue.prototype.$dutyHelper = this
    this.localLoad() // 从 本地(LocalStorage) 装载数据
  }

  mounted () {
    if (this.SettingRemoteSync.enabled && this.SettingRemoteSync.autoSync) {
      this.remoteDownload()
    }
  }

  get SettingRemoteSync () {
    return this.$duty.Setting.RemoteSync
  }

  /** LocalStorage 数据的 KEY */
  public readonly LS_KEY = 'DS_DATASTORE'

  /** 本地装载 */
  public localLoad () {
    // 尝试从 LocalStorage 中加载数据
    const jsonStr = window.localStorage.getItem(this.LS_KEY)
    if (jsonStr !== null) {
      this.$duty.Store.import(jsonStr)
    }
  }

  /** 本地保存 */
  public localSave () {
    window.localStorage.setItem(
      this.LS_KEY,
      this.$duty.Store.export()
    )
  }

  /** 云端下载 */
  public remoteDownload () {
    if (!this.SettingRemoteSync.enabled) {
      window.notify('云端同步功能未开启', 'w')
      return
    }

    if (!navigator.onLine) {
      window.notify('当前网络为离线状态，数据无法保持最新')
      return
    }

    this.setLoading(true)
    axios.get(this.SettingRemoteSync.server, {
      params: { 'op': 'download' }
    }).then(({ data }) => {
      if (!data || !data.success) {
        window.notify('数据从云端同步失败', 'e')
        window.console.error('尝试获取云端数据时，响应了错误')
        return
      }

      const jsonData = data.data
      if (!jsonData || String(jsonData).trim() === '') {
        window.notify('数据从云端同步失败', 'e')
        window.console.error('云端 JSON 数据为空')
        return
      }

      try {
        JSON.parse(jsonData) // 测试是否可解析 JSON
        this.$duty.Store.clearAll() // 本地数据清零
        this.$duty.Store.import(jsonData)
        this.localSave()
      } catch (err) {
        window.notify('数据从云端同步失败', 'e')
        window.console.error('尝试解析 & 导入云端数据时出错', err)
        return
      }

      window.notify('数据已成功从云端同步', 's')
    }).then(() => {
      this.setLoading(false) // 请求完毕，取消加载
    })
  }

  /** 云端上传 */
  public remoteUpload () {
    if (!this.SettingRemoteSync.enabled) {
      window.notify('云端同步功能未开启', 'w')
      return
    }

    this.localSave() // 首先本地保存一次数据

    const data = new FormData()
    data.set('data', this.$duty.Store.export()) // TODO: 添加敏感信息不上传处理（用修饰器标记字段的方式）
    axios.post(this.SettingRemoteSync.server, data, {
      params: { 'op': 'upload' }
    }).then(({ data: respData }) => {
      if (!!respData && respData.success) {
        window.notify('数据已成功上传到云端', 's')
      } else {
        window.notify('数据上传到云端失败', 'e')
      }
    })
  }

  setLoading (isLoading: boolean) {
    const el = this.$refs.loading as Dialog
    if (isLoading)
      el.show()
    else
      el.hide()
  }

  /** 将旧数据转为新数据结构 */
  transOldVersionData (jsonStr: string) {
    const srcObj = JSON.parse(jsonStr)

    const makeNewArea = (areaSrc: any) => {
      const nArea: any = {
        name: areaSrc.name,
        demandNumGrp: 2,
        recForGrps: {},
        taskList: []
      }
      _.forEach(_.countBy(areaSrc.taskList), (demandNumOne, taskName) => {
        const nTask: any = {
          name: taskName,
          aliasList: [],
          demandNumOne: Number(demandNumOne),
          recForOnes: {}
        }
        if (!!areaSrc.taskAliasList && !!areaSrc.taskAliasList[taskName])
          nTask.aliasList = areaSrc.taskAliasList[taskName]
        nArea.taskList.push(nTask)
      })
      return nArea
    }

    const makeNewPlan = (planSrc: any) => {
      const nPlan: any = {
        id: planSrc.id,
        name: planSrc.name,
        actionTime: planSrc.actionTime,
        createdTime: planSrc.createdTime,
        note: (planSrc.note || ''),
        grpList: []
      }
      _.forEach(planSrc.grpList, (grp) => {
        const newGrp: any = {
          name: String(grp.grpId),
          areaName: grp.area,
          asgnList: []
        }
        _.forEach(grp.personTaskList, (o) => {
          newGrp.asgnList.push({ oneName: o.person, taskName: o.task })
        })
        nPlan.grpList.push(newGrp)
      })
      return nPlan
    }

    const makeNewGrp = (grpSrc: any) => {
      const nGrp: any = {
        name: String(grpSrc.id),
        oneList: []
      }
      _.forEach(grpSrc.personList, (oneName) => {
        nGrp.oneList.push({ name: oneName })
      })
      return nGrp
    }

    const nObj: any = { PlanList: [], GrpList: [], AreaList: [] }
    _.forEach(srcObj.AreaList, (area) => { nObj.AreaList.push(makeNewArea(area)) })
    _.forEach(srcObj.PlanList, (plan) => { nObj.PlanList.push(makeNewPlan(plan)) })
    _.forEach(srcObj.GrpList, (grp) => { nObj.GrpList.push(makeNewGrp(grp)) })

    return JSON.stringify(nObj, null, ' ')
  }
}
</script>

<style lang="scss" scoped>
.loading {
  .msg {
    text-align: center;
    padding: 20px 0;
    background: rgba(255, 255, 255, 0.897);
    min-width: 257px;

    & > i {
      margin-right: 10px;
      color: #1a73e8;
    }

    .dots:after {
      content: ' ';
      animation: dotsAnim 2s  infinite alternate;
    }

    @keyframes dotsAnim {
      0% { content: ' ' }
      20% { content: '.' }
      40% { content: '..' }
      60% { content: '...' }
      80% { content: '....' }
      100% { content: '.....' }
    }
  }
}
</style>

