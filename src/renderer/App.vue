<template>
  <div id="app">
    <component v-for="name in serviceNames" :is="name" :key="name" />
    <top-bar :sub-title="subTitle" />
    <div class="page-wrap">
      <transition :name="transitionName">
        <router-view />
      </transition>
    </div>
    <bottom-bar />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import _ from 'lodash'
import sanitizeHtml from 'sanitize-html'
import marked from 'marked'
import DutyScheduleCore from 'duty-schedule-core'
import { Watch, Component } from 'vue-property-decorator'
import TopBar from './components/TopBar.vue'
import BottomBar from './components/BottomBar.vue'
import Services from './services'

@Component({
  components: { TopBar, BottomBar, ...Services }
})
export default class App extends Vue {
  get serviceNames () {
    return Object.keys(Services)
  }

  created () {
    Vue.prototype._ = _
    Vue.prototype.$duty = Vue.observable(DutyScheduleCore) // Core

    this.initMarked()
  }

  initMarked () {
    const renderer = new marked.Renderer()
    const linkRenderer = renderer.link
    renderer.link = (href, title, text) => {
      const html = linkRenderer.call(renderer, href, title, text)
      return html.replace(/^<a /, '<a target="_blank" rel="nofollow" ')
    }

    const nMarked = marked
    nMarked.setOptions({
      renderer,
      pedantic: false,
      gfm: true,
      tables: true,
      breaks: true,
      sanitize: false, // 净化（TODO: 存在问题，以后搞）
      sanitizer: (dirty) => sanitizeHtml(dirty, { allowedTags: sanitizeHtml.defaults.allowedTags.concat([ 'img' ]) }),
      smartLists: true,
      smartypants: true,
      xhtml: false
    })

    Vue.prototype.$marked = nMarked
  }

  subTitle: string = ''
  setSubTitle (str: string) {
    this.subTitle = str
  }

  transitionName: string = ''
  @Watch('$route')
  onRouteChanged (to: any, from: any) {
    const toDepth = to.path.split('/').length
    const fromDepth = from.path.split('/').length
    this.transitionName = toDepth < fromDepth ? 'slide-right' : 'slide-left'
    this.setSubTitle('')
  }
}
</script>

<style lang="scss">
.page-wrap {
  position: relative;
  width: 100%;
  height: 100%;

  & > .page {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    margin-top: 40px;
    height: calc(100vh - 140px);
    width: 100vw;
    overflow-y: auto;
    overflow-x: hidden;
    padding-top: 20px;
    padding-bottom: 40px;
    transition: all 0.5s cubic-bezier(0.55, 0, 0.1, 1);

    &.fullscreen {
      margin-top: 0;
      height: calc(100vh - 40px);
      padding-top: 0;
      padding-bottom: 0;
    }
  }

  .page-title {
    font-size: 2em;
    margin-bottom: 10px;

    .action-box {
      display: inline-block;
      font-size: 14px;
      vertical-align: sub;

      .action-item {
        user-select: none;
        float: left;
        padding: 1px 6px;
        cursor: pointer;

        &:hover,
        &.active {
          color: #1a73e8;
        }

        &:not(:last-child) {
          margin-right: 2px;
        }
      }
    }
  }
}

.slide-left-enter,
.slide-right-leave-active {
  opacity: 0;
  transform: translate(30px, 0);
}
.slide-left-leave-active,
.slide-right-enter {
  opacity: 0;
  transform: translate(-30px, 0);
}
</style>
