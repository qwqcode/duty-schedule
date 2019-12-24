<template>
  <Dialog ref="passwordDialog">
    <div class="password-dialog">
      <div class="desc">
        {{ { 'input': '请求管理员权限', 'modify': '修改管理员密码' }[dialog.type] }}
      </div>
      <el-form :inline="true" @submit.native.prevent>
        <el-form-item>
          <el-input
            ref="passwordInput"
            v-model="dialog.inputVal"
            :type="{ 'input': 'password', 'modify': 'text' }[dialog.type]"
            placeholder="输入密码"
            autocomplete="off"
          >
            <i slot="prefix" class="el-input__icon el-icon-lock" />
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button
            @click="dialogFormSubmit()"
            type="primary"
            native-type="submit"
            plain
            size="small"
          >
            确认
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </Dialog>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import Dialog from '../components/Dialog.vue'

type DialogType = 'input'|'modify'|null

@Component({ components: { Dialog } })
export default class Permission extends Vue {
  dialog = {
    type: null as DialogType,
    inputVal: '',
    onPermited: null as (() => void)|null
  }

  public created () {
    Vue.prototype.$permission = this
  }

  private openDialog (type: DialogType) {
    this.dialog.inputVal = '';
    (this.$refs.passwordDialog as Dialog).show()
    this.dialog.type = type
    window.setTimeout(() => {
      (this.$refs.passwordInput as HTMLElement).focus()
    }, 80)
  }

  private dialogFormSubmit () {
    switch (this.dialog.type) {
      case 'input':
        if (this.dialog.inputVal === this.$duty.Setting.Password) {
          (this.$refs.passwordDialog as Dialog).hide()
          if (this.dialog.onPermited !== null) { this.dialog.onPermited() }
        } else {
          this.dialog.inputVal = ''
          window.notify('密码错误', 'e')
        }
        break
      case 'modify':
        this.$duty.Setting.Password = this.dialog.inputVal
        this.$dutyHelper.localSave()
        window.notify('密码修改成功', 's');
        (this.$refs.passwordDialog as Dialog).hide()
        this.dialog.inputVal = ''
        break
      default:
        break
    }
  }

  public adminBtn (evt: () => void) {
    if (
      typeof this.$duty.Setting.Password === 'undefined' ||
      this.$duty.Setting.Password === '' ||
      this.dialog.inputVal === this.$duty.Setting.Password
    ) {
      evt()
      return
    }

    this.dialog.onPermited = evt
    this.openDialog('input')
  }

  public openModifyPasswordDialog () {
    this.dialog.inputVal = ''
    this.adminBtn(() => {
      this.openDialog('modify')
    })
  }
}
</script>


<style scoped lang="scss">
.password-dialog {
  background: #fff;
  padding: 20px 30px;

  .desc {
    margin-top: 15px;
    margin-bottom: 15px;
  }
}
</style>
