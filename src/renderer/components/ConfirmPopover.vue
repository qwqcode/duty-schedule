<template>
  <el-popover
    v-model="isShow"
    :placement="placement"
    width="160"
  >
    <p>{{ text }}</p>
    <div style="text-align: right; margin: 0">
      <el-button @click="isShow = false" size="mini" type="text">
        取消
      </el-button>
      <el-button @click="onConfirmed" type="primary" size="mini">
        确定
      </el-button>
    </div>
    <slot slot="reference" />
  </el-popover>
</template>

<script lang="ts">
import Vue from 'vue'
import { Prop, Component } from 'vue-property-decorator'

@Component({})
export default class ConfirmPopover extends Vue {
  isShow: boolean = false

  @Prop({
    default: 'top'
  }) readonly placement!: string

  @Prop({
    default: '是否确定？'
  }) readonly text!: string

  show () {
    this.isShow = true
  }

  hide () {
    this.isShow = false
  }

  onConfirmed () {
    this.isShow = false
    this.$emit('confirmed')
  }
}
</script>

<style lang="scss" scoped>
.del-confirm {
}
</style>
