<template>
  <div class="page schedule-page fullscreen">
    <div class="inner">
      <div class="left-bar">
        <div class="card group-switch">
          <div class="item"><i class="zmdi zmdi-menu"></i></div>
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
        </div>
      </div>
      <div class="right-card">
        <transition-group name="zoom" tag="div">
        <div class="float-card group-info"
             v-for="(group, key) in task.memberGroupList"
             :key="key"
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

export default {
  components: { TaskList },
  created () {
    this.task = this.taskList[0]
  },
  data () {
    return {
      task: null,
      currentMemberGroupKey: 0,
      autoSwitch: false
    }
  },
  watch: {
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

      console.log(list)

      return list
    },
    ...mapGetters('Setting', ['taskTypeGroupListUnique'])
  },
  methods: {
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
          background: rgba(28, 116, 233, 0.37);
        }

        .content {
          padding: 20px;
        }
      }

      &.group-info {
        .title {
          font-size: 30px;
          padding-left: 10px;
          margin-bottom: 20px;
          &:before {
            content: '\f2fb';
            font-family: 'Material-Design-Iconic-Font';
            padding-right: 20gipx;
          }
        }

        .task-type-group-wrap {
          padding: 0 25px;

          .task-type-group {
            .type-name {
              color: #1a73e8;
              font-size: 25px;
              margin-bottom: 20px;
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
