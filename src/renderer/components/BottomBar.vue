<template>
  <div class="bottom-bar-wrap">
    <div class="bottom-bar">
      <div class="left">
        <router-link
          v-for="btn in leftBtnList"
          :key="btn.path"
          :to="btn.path"
          tag="button"
          replace
        >
          <i :class="`zmdi zmdi-${btn.icon}`" />
        </router-link>
      </div>
      <div class="right">
        <router-link
          v-for="btn in rightBtnList"
          :key="btn.path"
          :to="btn.path"
          tag="button"
          replace
        >
          <i :class="`zmdi zmdi-${btn.icon}`" />
        </router-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component } from 'vue-property-decorator'

type Btn = {
  path: string
  icon: string
}

@Component({})
export default class BottomBar extends Vue {
  leftBtnList: Btn[] = [
    { path: '/Schedule', icon: 'calendar-note' },
    { path: '/Builder', icon: 'file-plus' }
  ]

  rightBtnList: Btn[] = [
    { path: '/Setting', icon: 'settings' },
    { path: '/AreaList', icon: 'flag' },
    { path: '/GrpList', icon: 'accounts' },
  ]
}
</script>

<style lang="scss" scoped>
.bottom-bar-wrap {
  z-index: 9998;
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 40px;
}

.bottom-bar {
  width: 100%;
  height: 40px;
  overflow: hidden;
  position: fixed;
  width: 100%;
  background: #fff;
  color: #000;
  display: flex;
  align-items: center;
  font-size: 15px;
  border-top: 1px solid #f4f4f4;

  .left,
  .right {
  }

  .left {
    padding-left: 10px;
    flex: 1;
  }

  .right {
    border-left: 1px solid #f4f4f4;
    padding: 0 10px;

    button {
      float: right;
    }
  }

  button {
    height: 40px;
    min-width: 50px;
    width: auto;
    outline: none;
    color: #000;
    background: #fff;
    border: 4px solid transparent;
    border-left: 0;
    border-right: 0;
    cursor: pointer;
    font-size: 12px;
    vertical-align: bottom;
    padding: 0 10px;

    &.active {
      border-bottom: 4px solid #1a73e8;
    }

    &:hover {
      background: rgba(66, 133, 244, 0.12);
      color: #1a73e8;
    }

    & > i {
      font-size: 18px;
      vertical-align: bottom;
    }
  }
}
</style>
