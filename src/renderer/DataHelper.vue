<template>
  <div>
    <component v-for="key in dataHelpersKeys" :is="key" :key="key"></component>
    <Dialog class="remote-sync-dialog" :isOpened="remoteSyncDialog.isOpened" :showCloseBtn="false">
      <div class="msg"><i class="zmdi zmdi-download" /> 数据正在从云端同步中{{ remoteSyncDialog.dots }}</div>
    </Dialog>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Prop, Watch, Component } from 'vue-property-decorator'
import Dialog from '@/components/Dialog.vue'
import DataStore from '@/core/data-store'
import DataAction from '@/core/data-action'
import DataQuery from '@/core/data-query'
import DataFate from '@/core/data-fate'

const dataHelpers = {
  DataStore,
  DataAction,
  DataQuery,
  DataFate
}

@Component({ components: { ...dataHelpers, Dialog } })
export default class DataHelper extends Vue {
  remoteSyncDialog = {
    dots: '',
    dotsInterval: <number|undefined>undefined,
    isOpened: false
  }

  get dataHelpersKeys () {
    return Object.keys(dataHelpers)
  }

  created () {
    Vue.prototype.$dataHelper = this
  }

  mounted () {
    // 如果已联网，则执行云端同步
    if (navigator.onLine && !!this.$dataStore.Settings.remoteSync.enabled && !!this.$dataStore.Settings.remoteSync.autoSync) {
      this.setRemoteSyncLoading(true)
      this.$dataAction.remoteSyncDownload(() => {
        this.setRemoteSyncLoading(false)
      })
    }
  }

  setRemoteSyncLoading (isLoading: boolean) {
    if (isLoading) {
      this.remoteSyncDialog.isOpened = true
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
    } else {
      if (this.remoteSyncDialog.dotsInterval !== undefined) {
        this.remoteSyncDialog.isOpened = false
        this.remoteSyncDialog.dots = ''
        window.clearInterval(this.remoteSyncDialog.dotsInterval)
      }
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

