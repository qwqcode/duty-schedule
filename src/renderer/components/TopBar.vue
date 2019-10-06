<template>
  <div class="top-bar-wrap">
    <div class="top-bar">
      <div class="left">
        值日任务表
        <span v-if="isWeb" class="version-badge">Online Version</span>
        <span class="sub-title">{{ subTitle }}</span>
      </div>
      <div v-if="!isWeb" class="right">
        <button class="btn" data-action="minimize">
          <span class="icon window-minimize" />
        </button>
        <button class="btn" data-action="maximize">
          <span :class="!isMaximize ? 'window-maximize' : 'window-unmaximize'" class="icon" />
        </button>
        <button class="btn" data-action="close">
          <span class="icon window-close" />
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Prop, Component } from 'vue-property-decorator'

@Component({})
export default class TopBar extends Vue {
  @Prop({ default: '' })
  subTitle: string = ''

  isMaximize = false

  mounted() {
    this.bindActionBtnEvt()
  }

  bindActionBtnEvt() {
    if (this.isWeb) {
      return
    }

    const btns = document.querySelectorAll('[data-action]')
    btns.forEach((btn) => {
      const type = btn.getAttribute('data-action')
      btn.addEventListener('click', () => {
        // eslint-disable-next-line global-require
        const window = require('electron').remote.getCurrentWindow()
        switch (type) {
          case 'close':
            window.close()
            break
          case 'maximize':
            if (window.isMaximized()) {
              window.unmaximize()
              this.isMaximize = false
            } else {
              window.maximize()
              this.isMaximize = true
            }
            break
          case 'minimize':
            window.minimize()
            break
          default:
            break
        }
      })
    })
  }

  get isWeb() {
    return process.env.IS_WEB
  }
}
</script>

<style lang="scss" scoped>
.top-bar-wrap {
  z-index: 9998;
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 40px;
  text-shadow: 0 1px 9px rgba(255, 255, 255, 0.43);
}

.top-bar {
  width: 100%;
  height: 40px;
  overflow: hidden;
  position: fixed;
  width: 100%;
  background: url('../assets/top_bar_mask.png') repeat-x;
  background-position: 0;
  color: #000;
  display: flex;
  font-size: 15px;
  -webkit-app-region: drag;

  .version-badge {
    position: absolute;
    right: 15px;
    top: 10px;
    font-family: SAOUI;
    font-size: 14px;
    padding: 0px 15px;
    margin-left: 9px;
    margin-right: 5px;
    background: #1a73e8;
    line-height: 20px;
    border-radius: 1px;
    color: #fff;
  }

  .left,
  .right {
    position: relative;
  }

  .left {
    padding-left: 20px;
    flex: 1;
    display: flex;
    align-items: center;
    flex-direction: row;
    text-shadow: 0px 3px 14px #ffffff;

    .sub-title {
      margin-left: 10px;
      color: #1a73e8;
      font-size: 12px;
      margin-top: 5px;
    }
  }

  .right {
    padding-right: 0;
    display: flex;
    place-content: flex-end;
  }

  .btn {
    background: transparent;
    border: none;
    color: #000;
    font-size: 15px;
    cursor: pointer;
    padding: 0;
    width: 48px;
    height: 30px;
    outline: none;
    -webkit-app-region: no-drag;

    &:hover,
    &:active {
      background: #1a73e8;
      & > .icon {
        background-color: #fff;
      }
    }

    &[data-action='close']:hover {
      background: #e81123;
    }

    & > .icon {
      display: block;
      height: 100%;
      width: 100%;
      -webkit-mask-size: 21% !important;
      background-color: #000;

      &.window-close {
        -webkit-mask: url("data:image/svg+xml;charset=utf-8,%3Csvg width='11' height='11' viewBox='0 0 11 11' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M6.279 5.5L11 10.221l-.779.779L5.5 6.279.779 11 0 10.221 4.721 5.5 0 .779.779 0 5.5 4.721 10.221 0 11 .779 6.279 5.5z' fill='%23000'/%3E%3C/svg%3E")
          no-repeat 50% 50%;
      }

      &.window-unmaximize {
        -webkit-mask: url("data:image/svg+xml;charset=utf-8,%3Csvg width='11' height='11' viewBox='0 0 11 11' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 8.798H8.798V11H0V2.202h2.202V0H11v8.798zm-3.298-5.5h-6.6v6.6h6.6v-6.6zM9.9 1.1H3.298v1.101h5.5v5.5h1.1v-6.6z' fill='%23000'/%3E%3C/svg%3E")
          no-repeat 50% 50%;
      }

      &.window-maximize {
        -webkit-mask: url("data:image/svg+xml;charset=utf-8,%3Csvg width='11' height='11' viewBox='0 0 11 11' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 0v11H0V0h11zM9.899 1.101H1.1V9.9h8.8V1.1z' fill='%23000'/%3E%3C/svg%3E")
          no-repeat 50% 50%;
      }

      &.window-minimize {
        -webkit-mask: url("data:image/svg+xml;charset=utf-8,%3Csvg width='11' height='11' viewBox='0 0 11 11' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 4.399V5.5H0V4.399h11z' fill='%23000'/%3E%3C/svg%3E")
          no-repeat 50% 50%;
      }
    }
  }
}
</style>
