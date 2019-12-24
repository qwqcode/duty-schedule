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

