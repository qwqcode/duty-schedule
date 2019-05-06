<template>
  <div class="page schedule-page fullscreen">
    <div class="task-list-sidebar" style="display: none">
      <div class="inner" ref="taskListSidebarInner">
        <task-list class="task-list" @openTask="openTask" :selected-task="this.task"></task-list>
      </div>
    </div>
    <div class="inner">
      <div class="left-bar">
        <div class="card group-switch">
          <div class="item" @click="showTaskListSidebar()"><i class="zmdi zmdi-menu"></i></div>
          <div class="dividing"></div>
          <div class="item"><i class="zmdi zmdi-flag"></i></div>
        </div>
        <div class="card group-switch">
          <div class="title">组</div>
          <div class="item"
               v-for="(group, key) in task.memberGroupList"
               :key="key"
               :class="{ 'active': key == currentMemberGroupKey }"
               @click="switchGroupByKey(key)">
            {{ getGroupNumByName(group.name) }}
          </div>
        </div>
        <div class="card group-switch">
          <div class="item" @click="autoSwitch = !autoSwitch"><i :class="`zmdi zmdi-${!autoSwitch ? 'play' : 'pause'}`"></i></div>
          <div class="dividing"></div>
          <router-link tag="div" class="item" :to="{ name: 'viewer', params: { title: task.title }}"><i class="zmdi zmdi-view-list"></i></router-link>
        </div>
      </div>
      <div class="right-card">
        <transition-group name="zoom" tag="div">
        <div class="float-card group-info"
             v-for="(group, key) in task.memberGroupList"
             :key="group.name"
             :ref="`groupInfoCard_${key}`"
             v-show="key == currentMemberGroupKey">
          <div class="inner">
            <div class="auto-switch-bar" v-show="autoSwitch"></div>
            <div class="content">
              <div class="title">{{ currentMemberGroup.name }}</div>
              <el-row class="task-type-group-wrap" :gutter="30">
                <el-col class="task-type-group"
                        v-for="(item, i) in taskMemberGroupListModeTaskType"
                        :key="i"
                        :span="8">
                  <div class="type-name">{{ item.name }}</div>
                  <div class="members">
                    <div class="member-item" v-for="(member, mi) in item.data" :key="mi">{{ member }}</div>
                  </div>
                </el-col>
              </el-row>
            </div>
          </div>
        </div>
        </transition-group>
      </div>
    </div>
  </div>
</template>

<script>
import TaskList from './TaskList.vue'
import _ from 'lodash'
import { mapGetters } from 'vuex'
import $ from 'jquery'

export default {
  components: { TaskList },
  created () {
    this.task = this.taskList[0]
  },
  data () {
    return {
      task: null,
      currentMemberGroupKey: 0,
      autoSwitch: false,
      isTaskListSidebarShow: false
    }
  },
  watch: {
    task (newVal) {
      this.$parent.setSubTitle(' ' + newVal.title)
    },
    currentMemberGroupKey (newVal, oldVal) {
      if (this.autoSwitch) {
        this.startAutoSwitchTimeout(this.$refs['groupInfoCard_' + newVal][0])
      }
    },
    autoSwitch (newVal) {
      if (newVal === true) {
        this.startAutoSwitchTimeout(this.$refs['groupInfoCard_' + this.currentMemberGroupKey][0])
      }
    }
  },
  computed: {
    taskList () {
      return _.sortBy(this.$store.state.Setting.taskList, (o) => -Number(o.time))
    },
    currentMemberGroup () {
      return this.task.memberGroupList[this.currentMemberGroupKey]
    },
    taskMemberGroupListModeTaskType () {
      let typesListUnique = []
      _.forEach(this.currentMemberGroup.data, (member) => {
        if (typesListUnique.indexOf(member.task) <= -1) {
          typesListUnique.push(member.task)
        }
      })

      let list = []
      _.forEach(typesListUnique, (taskType) => {
        let members = []
        _.forEach(this.currentMemberGroup.data, (member) => {
          if (member.task === taskType) {
            members.push(member.name)
          }
        })

        list.push({
          name: taskType,
          data: members
        })
      })

      return list
    },
    ...mapGetters('Setting', ['taskTypeGroupListUnique'])
  },
  methods: {
    openTask (task) {
      this.task = task
      this.currentMemberGroupKey = 0
      this.autoSwitch = false
      this.hideTaskListSidebar()
    },
    getGroupNumByName (groupName) {
      return groupName.match(/第 (.*) 组/)[1]
    },
    switchGroupByKey (key) {
      this.autoSwitch = false
      this.currentMemberGroupKey = key
    },
    startAutoSwitchTimeout (cardElem) {
      const timeout = 10 * 1000
      const perTime = 50

      let timeLeft = 0
      let switchBar = cardElem.querySelector('.auto-switch-bar')
      switchBar.style.height = ''

      let intervalKey = window.setInterval(() => {
        if (this.autoSwitch === false) {
          window.clearInterval(intervalKey)
          return
        }
        switchBar.style.height = (((timeout - timeLeft) / timeout) * 100).toFixed(2) + '%'
        timeLeft += perTime
        if (timeLeft > timeout) {
          // 切换组
          if (this.currentMemberGroupKey + 1 < Object.keys(this.task.memberGroupList).length) {
            this.currentMemberGroupKey++
          } else {
            this.currentMemberGroupKey = 0
          }
          window.clearInterval(intervalKey)
        }
      }, perTime)
    },
    showTaskListSidebar () {
      $('.task-list-sidebar').show().css('background-color', 'rgba(110, 110, 110, 0.39)')
      $(this.$refs.taskListSidebarInner).removeClass('show')
      this.isTaskListSidebarShow = true
      window.setTimeout(() => {
        $(this.$refs.taskListSidebarInner).addClass('show')
        $(document).bind('click.hideSidebar', (e) => {
          if ($(e.target).is($('.task-list-sidebar')) || !$(e.target).closest(this.$refs.taskListSidebarInner)) {
            this.hideTaskListSidebar()
            $(document).unbind('click.hideSidebar')
          }
        })
      }, 20)
    },
    hideTaskListSidebar () {
      $(this.$refs.taskListSidebarInner).removeClass('show')
      $('.task-list-sidebar').css('background-color', '')
      window.setTimeout(() => {
        this.isTaskListSidebarShow = false
        $('.task-list-sidebar').hide()
      }, 400)
    }
  }
}
</script>

<style scoped lang="scss">
.schedule-page {
  background: #f4f4f4;

  & > .inner {
    position: relative;
    height: 100%;
    display: flex;
    flex-direction: row;
  }

  .task-list-sidebar {
    z-index: 20;
    transition: background-color 400ms;
    position: absolute;
    width: 100%;
    height: 100%;
    overflow: hidden;

    & > .inner {
      overflow-y: auto;
      width: 40%;
      height: 100%;
      transform: translate(-100%, 0);
      transition: transform 400ms cubic-bezier(0.23, 1, 0.32, 1) 0ms;

      &.show {
        transform: translate(0, 0);
      }
    }

    .task-list {
      background: #FFF;
    }
  }

  .left-bar {
    flex-basis: 50px;
    padding-left: 20px;
    display: flex;
    place-items: center;
    justify-content: center;
    flex-flow: column;

    .card {
      width: 44px;
      min-height: 40px;
      background: #FFF;
      border-radius: 3px;
      box-shadow: 0 1px 3px rgba(0,0,0,.12);

      &:not(:last-child) {
        margin-bottom: 10px;
      }
    }

    .group-switch {
      & > div {
        text-align: center;
        width: 100%;
        height: 40px;
        line-height: 40px;
      }

      .title {
        user-select: none;
        color: #1a73e8;
        border-bottom: 1px solid #F4F4F4;
      }

      .dividing {
        height: 1px;
        background: #F4F4F4;
        width: 100%;
      }

      .item {
        position: relative;
        cursor: pointer;

        &.active, &:hover {
          color: #1a73e8;
          font-weight: bold;
          background: rgba(66, 133, 244, 0.12);
        }

        /*&.active:after {
          content: ' ';
          position: absolute;
          right: -30px;
          top: 10px;
          border-top: 10px solid transparent;
          transform: rotate(-135deg);
          border-style: solid;
          border-width: 10px;
          border-color: #fff #fff transparent transparent;
          box-shadow: 0 0px 3px rgba(0, 0, 0, 0.22)
        }*/
      }
    }
  }

  .right-card {
    position: relative;
    flex: 1;
    overflow: hidden;

    .float-card {
      position: absolute;
      background: #fff;
      top: 70px;
      left: 15px;
      height: calc(100% - 100px);
      width: calc(100% - 40px);
      box-shadow: 0 1px 3px rgba(0,0,0,.12);
      border-radius: 3px;

      & > .inner {
        position: relative;
        height: 100%;

        .auto-switch-bar {
          top: 0;
          left: 0;
          height: 100%;
          width: 3px;
          position: absolute;
          transition: height .2s;
          background: linear-gradient(#1a73e8, #0eefff);
          box-shadow: 0 1px 3px rgba(14, 239, 255, .40);
        }

        .content {
          padding: 20px;
        }
      }

      &.group-info {
        .title {
          font-size: 30px;
          padding-left: 10px;
          margin-bottom: 25px;
          &:before {
            content: '\f2fb';
            font-family: 'Material-Design-Iconic-Font';
            padding-right: 20px;
          }
        }

        .task-type-group-wrap {
          padding: 0 25px;

          .task-type-group {
            .type-name {
              color: #1a73e8;
              font-size: 22px;
              margin-bottom: 15px;
            }

            .members {
              margin-left: 10px;
              .member-item {
                font-size: 25px;
                &:not(:last-child) {
                  margin-bottom: 10px;
                }
              }
            }
          }
        }
      }
    }
  }
}
</style>
