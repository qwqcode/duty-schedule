<template>
  <div v-if="isRunning" class="bar-timer">
    <div :style="{ height: `${Progress}%` }" class="progress-bar" />
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator'

@Component({})
export default class BarTimer extends Vue {
  readonly TOTAL_TIME = 10 * 1000 // 10s
  readonly PER_PASS_TIME = 50

  isRunning = false
  time: number = this.TOTAL_TIME
  intervalId: number|null = null

  get Progress () {
    if (this.time < 0) this.time = 0
    if (this.time > this.TOTAL_TIME) this.time = this.TOTAL_TIME

    return Number(((this.time / this.TOTAL_TIME) * 100).toFixed(2))
  }

  startTimer (actionFunc: () => void) {
    this.resetTimer()
    this.isRunning = true
    this.intervalId = window.setInterval(() => {
      this.time -= this.PER_PASS_TIME
      if (this.time <= 0) {
        this.resetTimer()
        actionFunc() // 执行自定操作
      }
    }, this.PER_PASS_TIME)
  }

  resetTimer () {
    if (this.intervalId !== null) {
      window.clearInterval(this.intervalId)
      this.intervalId = null
    }
    this.time = this.TOTAL_TIME
    this.isRunning = false
  }

  beforeDestroy () {
    this.resetTimer()
  }
}
</script>


<style scoped lang="scss">
.bar-timer {
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  overflow: hidden;
  position: absolute;

  .progress-bar {
    width: 100%;
    height: 100%;
    transition: height 0.2s;
    background: linear-gradient(#1a73e8, #0eefff);
    box-shadow: 0 1px 3px rgba(14, 239, 255, 0.4);
  }
}
</style>
