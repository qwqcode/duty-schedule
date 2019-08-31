<template>
  <transition name="fadeDown">
    <div
      v-if="isOpened"
      class="dialog"
      style="animation-duration: 0.3s"
    >
      <div class="inner">
        <div class="close-btn" @click="$emit('close')">
          <i class="zmdi zmdi-close" />
        </div>
        <div class="body">
          <slot />
        </div>
      </div>
    </div>
  </transition>
</template>

<script lang="ts">
import Vue from 'vue'
import { Prop, Watch, Component } from 'vue-property-decorator'

@Component({})
export default class Dialog extends Vue {
  @Prop() readonly isOpened!: boolean
}
</script>

<style lang="scss" scoped>
.dialog {
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
      margin-top: 160px;
      margin-bottom: 70px;
      padding: 0 10vw;
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
