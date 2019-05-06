<template>
  <div class="task-list">
    <div class="task-list-item"
         v-for="task in taskList"
         :key="task.title"
         :class="{ 'selected': (task === selectedTask) }">
      <div class="inner" @click="openTask(task)">
        <div class="title">{{ task.title }}</div>
        <div class="meta">
          <span class="time">{{ timeAgo(new Date(task.time)) }}</span>
          <span class="groups">组: <span class="group-item" v-for="(item, i) in getMemberGroupListNumbers(task)" :key="i">{{ item }}</span></span>
        </div>
      </div>
      <div class="flags">
        <span
          class="flag flag-green"
          v-if="dateFormat(new Date(task.time)) === dateFormat(new Date())"
        >今日</span>
        <!--<span class="flag flag-red" v-if="task.time < new Date().getTime() - 24*60*60*1000">已过期</span>-->
      </div>
      <span class="act-btns">
        <span class="btn-item" @click="deleteTask(task)"><i class="zmdi zmdi-delete"></i></span>
      </span>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'
export default {
  props: ['selected-task'],
  data () {
    return {
      deleteClickTime: 0,
      deleteTaskTitle: null
    }
  },
  computed: {
    taskList () {
      return _.sortBy(this.$store.state.Setting.taskList, (o) => -Number(o.time))
    }
  },
  methods: {
    openTask (task) {
      this.$emit('openTask', task)
    },
    getMemberGroupListNumbers (task) {
      let arr = []
      _.each(task.memberGroupList, (group, i) => {
        arr.push(this.getGroupNumByName(group.name))
      })
      return _.sortBy(arr)
    },
    getGroupNumByName (groupName) {
      return groupName.match(/第 (.*) 组/)[1]
    },
    padWithZeros (vNumber, width) {
      var numAsString = vNumber.toString()
      while (numAsString.length < width) {
        numAsString = '0' + numAsString
      }
      return numAsString
    },
    isDataAllowEdit () {
      if (typeof window.SETTING_DATA_ALLOW_EDIT !== 'boolean' || window.SETTING_DATA_ALLOW_EDIT !== true) {
        window.notify('没有权限修改数据', 'w')
        console.log('[window.SETTING_DATA_ALLOW_EDIT]')
        return false
      } else {
        return true
      }
    },
    deleteTask (task) {
      if (this.isDataAllowEdit()) {
        if (this.deleteTaskTitle !== task.title) {
          this.deleteTaskTitle = task.title
          this.deleteClickTime = 0
        }
        if (this.deleteClickTime < 3 - 1) {
          this.deleteClickTime++
          window.notify(`危险操作，请再点 ${(3 - this.deleteClickTime)} 次`, 'e')
          return
        }
        this.$store.commit('Setting/REMOVE_TASK', task)
        window.notify(`"${task.title}" 已删除`, 'i')
        this.deleteClickTime = 0
      }
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

<style lang="scss" scoped>
  .task-list {
    padding: 5px;
    padding-top: 40px;
    background: #f4f4f4;

    .task-list-item {
      padding: 5px;
      position: relative;

      &.selected {
        & > .inner:before {
          background: #0083ff;
        }
      }

      &:hover > .inner {
        box-shadow: 0 2px 15px rgba(0, 0, 0, 0.1);
      }

      & > .inner {
        position: relative;
        background: #FFF;
        border: 1px solid #eee;
        padding: 20px 30px;
        cursor: pointer;
        transition: all .2s linear;
        border-radius: 3px;
        box-shadow: 0 2px 15px rgba(0, 0, 0, 0.05);

        &:before {
          content: ' ';
          position: absolute;
          left: -2px;
          top: 10px;
          height: calc(100% - 20px);
          width: 3px;
          background: transparent;
          box-shadow: 0px 2px 15px rgba(0, 131, 255, 0.22);
        }
      }

      .title {
        font-size: 1.4em;
        color: #0083ff;
        margin-bottom: 15px;
      }

      .meta {
        display: flex;
        flex-direction: row;

        & > span {
          margin-right: 10px;
          padding-right: 10px;

          &:not(:last-child) {
            border-right: 2px solid #EEE;
          }

          &.time {

          }

          &.groups {
            .group-item {
              &:not(:last-child) {
                margin-right: 5px;
              }
            }
          }
        }
      }

      .act-btns {
        position: absolute;
        display: none;
        top: 20px;
        right: 30px;

        .btn-item {
          cursor: pointer;
          font-size: 20px;
          color: #5a6370;
        }
      }

      &:hover .act-btns {
        display: inherit;
      }

      .flags {
        position: absolute;
        right: 6px;
        top: -2px;

        .flag {
          border-radius: 50px;
          font-size: 13px;
          padding: 4px 10px;
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
</style>
