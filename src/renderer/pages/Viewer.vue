<template>
  <div class="page viewer-page fullscreen">

    <div class="task-header">
      <router-link to="/" class="back-btn"><i class="zmdi zmdi-chevron-left"></i> 任务表</router-link>
      <div class="task-title">{{ task.title }}</div>
    </div>

    <div class="task-viewer" v-if="!!task">
      <div class="group-item" v-for="group in (viewMode === 1) ? this.taskMemberGroupList : this.taskMemberGroupListModeTaskType" :key="group.name">
      <div class="group-name">{{ group.name }}</div>
      <el-table
        :data="values(group.data)"
        stripe
        style="width: 100vw">
        <el-table-column
          prop="name"
          label="名字"
          width="100px">
        </el-table-column>
        <el-table-column
          prop="task"
          label="任务">
        </el-table-column>
      </el-table>
      </div>
    </div>

    <div class="not-found" v-if="!task">
      未找到 Task
    </div>

    <div class="action-bar">
      <div class="action-btn" @click="switchMode()">
        <template v-if="viewMode === 1">切换到 任务模式</template>
        <template v-if="viewMode === 2">切换到 小组模式</template>
      </div>
    </div>
  </div>
</template>


<script>
import _ from 'lodash'
import $ from 'jquery'
import { mapGetters } from 'vuex'

export default {
  props: ['title'],
  data () {
    return {
      task: null,
      viewMode: 1
    }
  },
  created () {
    this.task = _.find(this.taskList, (o) => o.title === this.title)
  },
  methods: {
    values (obj) {
      return _.values(obj)
    },
    switchMode () {
      this.viewMode = (this.viewMode !== 1) ? 1 : 2
      $('.task-viewer').scrollTop(0)
    }
  },
  computed: {
    taskList () {
      return this.$store.state.Setting.taskList
    },
    taskTypeGroupList () {
      return this.$store.state.Setting.taskTypeGroupList
    },
    taskMemberGroupList () {
      return this.task.memberGroupList
    },
    taskMemberGroupListModeTaskType () {
      let list = []
      _.forEach(this.taskTypeGroupListUnique, (taskType) => {
        let members = []
        _.forEach(this.taskMemberGroupList, (group) => {
          _.forEach(group.data, (member) => {
            if (member.task === taskType) {
              members.push(member)
            }
          })
        })

        list.push({
          name: taskType,
          data: members
        })
      })

      return list
    },
    ...mapGetters('Setting', ['taskTypeGroupListUnique'])
  }
}
</script>

<style lang="scss" scoped>
.viewer-page {
  .task-header {
    background: #FFF;
    padding: 55px 20px 20px 20px;
    position: relative;
    border-bottom: 1px solid #F4F4F4;

    .back-btn {
      z-index: 999;
      position: fixed;
      left: 20px;
      top: 55px;
      color: #0083ff;
      padding: 3px 16px;
      border-radius: 50px;
      text-decoration: none;
      background: rgba(255, 255, 255, 0.964);
      font-size: 1.15em;

      i {
        margin-right: 8px;
      }

      &:hover {
        color: #FFF;
        background: #0083ff;
        box-shadow: 0 1px 3px rgba(0,0,0,.12);
      }
    }

    .task-title {
      text-align: center;
      font-size: 1.6em;
    }
  }

  .task-viewer {
    overflow-y: auto;
    overflow-x: hidden;
    background: #FFF;
    padding: 5px 20px 40px 20px;
    height: calc(100vh - 107px - 85px);

    .group-item {
      * {
        font-size: 1.2em;
      }

      .group-name {
        color: #0083ff;
        font-size: 1.4em;
        margin-top: 30px;
        margin-bottom: 15px;
        padding-left: 15px;
        border-left: 2px solid #0083ff;
        font-size: 1.5em;
      }
    }
  }

  .action-bar {
    position: absolute;
    z-index: 999;
    bottom: 25px;
    right: 30px;

    .action-btn {
      background: #0083ff;
      padding: 4px 15px;
      box-shadow: 0 1px 3px rgba(0,0,0,.12);
      color: #FFF;
      border-radius: 2px;
      cursor: pointer;
    }
  }
}
</style>

