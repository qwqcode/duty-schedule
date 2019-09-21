<template>
  <slide-y-up-transition>
    <div
      v-if="isShow"
      class="dialog"
      style="animation-duration: 0.3s"
    >
      <div class="inner">
        <div v-if="showCloseBtn" class="close-btn" @click="onCloseBtnClick">
          <i class="zmdi zmdi-close" />
        </div>
        <div class="body">
          <slot />
        </div>
      </div>
    </div>
  </slide-y-up-transition>
</template>

<script lang="ts">
import Vue from 'vue'
import { Prop, Watch, Component } from 'vue-property-decorator'

@Component({})
export default class Dialog extends Vue {
  isShow: boolean = false
  @Prop({
    default: true
  }) readonly showCloseBtn!: boolean

  show () {
    this.isShow = true
  }

  hide () {
    this.isShow = false
  }

  onCloseBtnClick () {
    this.isShow = false
    this.$emit('onclosed')
  }
}
</script>

<style lang="scss" scoped>
.dialog {
  z-index: 99;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;

  & > .inner {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    overflow-y: auto;
    overflow-x: hidden;
    background: rgba(105, 105, 105, 0.65);

    & > .body {
      padding: 0 10vw;
      display: flex;
      height: 100%;
      align-items: center;
      justify-content: center;
    }
  }

  .close-btn {
    z-index: 9999;
    position: fixed;
    right: 35px;
    top: 70px;

    & > i {
      font-size: 2.3em;
      color: #fff;
      cursor: pointer;
      user-select: none;

      &:hover {
        opacity: 0.7;
      }

      padding: 10px;
    }
  }
}
</style>
