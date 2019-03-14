<template>
  <div id="app">
    <top-bar></top-bar>
    <div class="page-wrap">
      <transition :name="transitionName">
        <router-view></router-view>
      </transition>
    </div>
    <bottom-bar></bottom-bar>
  </div>
</template>

<script>
  import TopBar from './components/TopBar'
  import BottomBar from './components/BottomBar'

  export default {
    name: 'duty-schedule',
    data () {
      return {
        transitionName: ''
      }
    },
    components: { TopBar, BottomBar },
    watch: {
      '$route' (to, from) {
        const toDepth = to.path.split('/').length
        const fromDepth = from.path.split('/').length
        this.transitionName = toDepth < fromDepth ? 'slide-right' : 'slide-left'
      }
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
    transition: all .5s cubic-bezier(0.55, 0, 0.1, 1);

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
  }
}

.slide-left-enter, .slide-right-leave-active { 
  opacity: 0;
  transform: translate(30px, 0); 
} 
.slide-left-leave-active, .slide-right-enter { 
  opacity: 0;
  transform: translate(-30px, 0); 
}
</style>
