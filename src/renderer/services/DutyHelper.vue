<template>
  <div>
    <Dialog ref="remoteSyncDialog" :showCloseBtn="false" class="remote-sync-dialog">
      <div class="msg">
        <i class="zmdi zmdi-download" /> 数据正在从云端同步中{{ remoteSyncDialog.dots }}
      </div>
    </Dialog>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import _ from 'lodash'
import axios from 'axios'
import { Component } from 'vue-property-decorator'
import Dialog from '@/components/Dialog.vue'

@Component({ components: { Dialog } })
export default class DutyHelper extends Vue {
  remoteSyncDialog = {
    dots: '',
    dotsInterval: undefined as number|undefined
  }

  created () {
    Vue.prototype.$dutyHelper = this
    this.localLoad()
  }

  mounted () {
    if (this.SettingRemoteSync.enabled && this.SettingRemoteSync.autoSync)
      this.remoteLoad()
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
    window.localStorage.setItem(this.LS_KEY, this.$duty.Store.export())
  }

  /** 远程装载 */
  public remoteLoad () {
    if (!this.SettingRemoteSync.enabled) {
      window.notify('云端同步功能未开启', 'w')
      return
    }
    if (!navigator.onLine) {
      window.notify('当前网络为离线状态，数据无法保持最新')
      return
    }

    this.setRemoteSyncLoading(true)
    const onFinished = () => { this.setRemoteSyncLoading(false) }
    axios.get(this.SettingRemoteSync.server, {
      params: { 'op': 'download' }
    }).then(({ data }) => {
      if (data.success) {
        const jsonData = data.data
        if (!!jsonData && String(jsonData).trim() !== '') {
          try {
            JSON.parse(jsonData) // 测试是否可解析 JSON
            this.$duty.Store.clearAll() // 本地数据清零
            this.$duty.Store.import(jsonData)
            this.localSave()
          } catch (err) {
            window.notify('数据从云端同步失败', 'e')
            if (onFinished !== undefined) { onFinished() }
            throw new Error(err)
          }
          if (onFinished !== undefined) { onFinished() }
          window.notify('数据已成功从云端同步', 's')
        } else {
          if (onFinished !== undefined) { onFinished() }
          window.notify('数据从云端同步失败', 'e')
        }
      } else {
        window.notify('数据从云端同步失败', 'e')
        if (onFinished !== undefined) { onFinished() }
      }
    })
  }

  public remoteSave () {
    if (!this.SettingRemoteSync.enabled) {
      window.notify('云端同步功能未开启', 'w')
      return
    }

    // 首先本地保存一次
    this.localSave()

    const data = new FormData()
    data.set('data', this.$duty.Store.export()) // TODO: 添加敏感信息不上传处理（用修饰器标记字段的方式）
    axios.post(this.SettingRemoteSync.server, data, {
      params: { 'op': 'upload' }
    }).then(({ data: respData }) => {
      if (respData.success) {
        window.notify('数据已成功上传到云端', 's')
      } else {
        window.notify('数据上传到云端失败', 'e')
      }
    })
  }

  private setRemoteSyncLoading (isLoading: boolean) {
    if (isLoading) {
      (this.$refs.remoteSyncDialog as Dialog).show()
      let n = 0
      this.remoteSyncDialog.dotsInterval = window.setInterval(() => {
        if (n === 0) {
          this.remoteSyncDialog.dots = '.'
          n++
        } else if (n < 5) {
          this.remoteSyncDialog.dots += '.'
          n++
        } else {
          this.remoteSyncDialog.dots = ''
          n = 0
        }
      }, 500)
    } else if (!isLoading && this.remoteSyncDialog.dotsInterval !== undefined) {
      (this.$refs.remoteSyncDialog as Dialog).hide()
      this.remoteSyncDialog.dots = ''
      window.clearInterval(this.remoteSyncDialog.dotsInterval)
      this.remoteSyncDialog.dotsInterval = undefined
    }
  }
}
</script>

<style lang="scss" scoped>
.remote-sync-dialog {
  .msg {
    text-align: center;
    padding: 20px 0;
    background: rgba(255, 255, 255, 0.897);
    min-width: 257px;

    & > i {
      margin-right: 10px;
      color: #1a73e8;
    }
  }
}
</style>

