<template>
  <div class="page schedule-page fullscreen">
    <div class="inner">
      <div class="task-list">
        <div
          class="task-list-item"
          v-for="task in taskList"
          :key="task.title"
          @click="openTask(task)">
          <div class="inner">
            <div class="title">{{ task.title }}</div>
            <div class="time">{{ timeAgo(new Date(task.time)) }}</div>
            <div class="flags">
              <span class="flag flag-green" v-if="dateFormat(new Date(task.time)) === dateFormat(new Date())">今日</span>
              <span class="flag flag-red" v-if="task.time < new Date().getTime() - 24*60*60*1000">已过期</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import _ from 'lodash'

  export default {
    data () {
      return {

      }
    },
    computed: {
      taskList () {
        return _.sortBy(this.$store.state.Setting.taskList, (o) => -Number(o.time))
      }
    },
    methods: {
      openTask (task) {
        this.$router.replace({ name: 'viewer', params: { title: task.title } })
      },

      padWithZeros (vNumber, width) {
        var numAsString = vNumber.toString()
        while (numAsString.length < width) {
          numAsString = '0' + numAsString
        }
        return numAsString
      },

      dateFormat (date) {
        var vDay = this.padWithZeros(date.getDate(), 2)
        var vMonth = this.padWithZeros(date.getMonth() + 1, 2)
        var vYear = this.padWithZeros(date.getFullYear(), 2)
        // var vHour = padWithZeros(date.getHours(), 2);
        // var vMinute = padWithZeros(date.getMinutes(), 2);
        // var vSecond = padWithZeros(date.getSeconds(), 2);
        return `${vYear}-${vMonth}-${vDay}`
      },

      timeAgo (date) {
        try {
          var oldTime = date.getTime()
          var currTime = new Date().getTime()
          var diffValue = currTime - oldTime

          var days = Math.floor(diffValue / (24 * 3600 * 1000))
          if (days === 0) {
            // 计算相差小时数
            var leave1 = diffValue % (24 * 3600 * 1000) // 计算天数后剩余的毫秒数
            var hours = Math.floor(leave1 / (3600 * 1000))
            if (hours === 0) {
              // 计算相差分钟数
              var leave2 = leave1 % (3600 * 1000) // 计算小时数后剩余的毫秒数
              var minutes = Math.floor(leave2 / (60 * 1000))
              if (minutes === 0) {
                // 计算相差秒数
                var leave3 = leave2 % (60 * 1000) // 计算分钟数后剩余的毫秒数
                var seconds = Math.round(leave3 / 1000)
                return seconds + ' 秒前'
              }
              return minutes + ' 分钟前'
            }
            return hours + ' 小时前'
          }
          if (days < 0) return '刚刚'

          if (days < 8) {
            return days + ' 天前'
          } else {
            return this.dateFormat(date)
          }
        } catch (error) {
          console.error(error)
        }
      }
    }
  }
</script>

<style scoped lang="scss">
.schedule-page {
  background: #F4F4F4;

  & > .inner {
    padding: 60px 30px 20px 30px;
  }

  .task-list {
    .task-list-item {
      padding: 5px;

      & > .inner {
        background: #FFF;
        border: 1px solid #F4F4F4;
        padding: 20px 30px;
        cursor: pointer;
        transition: all .2s linear;
        box-shadow: 0 2px 15px rgba(0, 0, 0, 0.05);
        position: relative;

        &:before {
          content: ' ';
          position: absolute;
          left: -2px;
          top: 10px;
          height: calc(100% - 20px);
          width: 3px;
          background: #0083ff;
          box-shadow: 0px 2px 15px rgba(0, 131, 255, 0.22);
        }

        &:hover {
          box-shadow: 0 2px 15px rgba(0, 0, 0, 0.1);
          transform: translate3d(0, -4px, 0);
        }
      }

      .title {
        font-size: 1.4em;
        color: #0083ff;
        margin-bottom: 15px;
      }

      .time {}

      .flags {
        position: absolute;
        right: 20px;
        top: 20px;

        .flag {
          border-radius: 3px;
          padding: 5px 10px;
          color: #FFF;

          &.flag-green {
            background: rgba(35, 209, 96, 0.85);
            box-shadow: 3px 2px 15px rgba(35, 209, 96, 0.22);
          }

          &.flag-red {
            background: rgba(209, 35, 58, 0.85);
            box-shadow: 3px 2px 15px rgba(209, 35, 58, 0.22);
          }
        }
      }
    }
  }
}
</style>
