<template>
  <div class="page fullscreen builder-page">
    <div class="builder-header">
      <div class="page-title">创建新的日程</div>

      <el-steps :active="stepNum-1" simple finish-status="success" style="padding: 0 8%">
        <el-step v-for="(desc, num) in stepDesc" :key="num" :title="`${num}. ${desc}`"></el-step>
      </el-steps>
    </div>
    
    <div class="inner" ref="scrollableArea">
      <div class="step-1" v-if="stepNum === 1">
        <GroupList asSelector="true" v-model="selectedGroups"></GroupList>
      </div>

      <div class="step-2" v-if="stepNum === 2">

        <el-form class="center-form">
          <el-form-item label="标题">
            <el-input placeholder="输入文字" v-model="title"></el-input>
          </el-form-item>
        </el-form>

        <div class="task-group-list center-form">
          <div class="group-item" v-for="(task, taskIndex) in taskGroupList" :key="taskIndex">
            <div class="group-item-title">第 {{ task.groupNum }} 组</div>
            <div class="member-item" v-for="(item, key) in task['members']" :key="key">
              <el-row :gutter="10">
                <el-col :span="12">
                  <el-input placeholder="名字" v-model="taskGroupList[taskIndex]['members'][key].name"></el-input>
                </el-col>
                <el-col :span="12">
                  <div class="select is-fullwidth">
                    <select v-model="taskGroupList[taskIndex]['members'][key].task">
                      <option
                        v-for="(type, num) in taskTypeListUnique" 
                        :key="num"
                        :value="type"
                        >{{ type }}（{{ $store.getters['Schedule/getTaskTypeCount'](type, item.name) }} 次）</option>
                    </select>
                  </div>
                </el-col>
              </el-row>
            </div>
          </div>
        </div>

      </div>

      <div class="step-3" v-if="stepNum === 3">

        <div class="table-view-last">

          <div class="inner">

          <div v-for="(group, groupKey) in taskGroupList" :key="groupKey">
          <div class="group-title">第 {{ group.groupNum }} 组</div>
          <table class="table is-bordered is-striped is-narrow is-hoverable is-fullwidth">
            <thead>
              <tr>
                <th>姓名</th>
                <th>项目</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(task, i) in group['members']" :key="i">
                <td width="80px">{{ task.name }}</td>
                <td>{{ task.task }}</td>
              </tr>
            </tbody>
          </table>
          </div>

        </div>

        <p>调试</p>
        <textarea class="textarea" v-model="taskGroupListStr"></textarea>
        </div>
      </div>

    </div>

    <div class="step-toggle-bar" v-if="stepNum < Object.keys(stepDesc).length">
      <div class="left">
        <template v-if="stepNum === 1">已选取 {{ countSelectedGroups }} 个小组</template>
      </div>
      <div class="right" @click="onNextStepBtnClick">下一步 <i class="zmdi zmdi-chevron-right"></i></div>
    </div>

  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import GroupList from './GroupList'
import $ from 'jQuery'

export default {
  components: { GroupList },
  data () {
    return {
      title: `${this.getDate()}`,
      stepNum: 1,
      stepDesc: {
        '1': '选择小组',
        '2': '分配任务',
        '3': '完成创建'
      },
      selectedGroups: {},
      taskGroupList: {},
      taskGroupListStr: '',
      task: {}
    }
  },
  mounted () {
  },
  methods: {
    getDate () {
      let myDate = new Date()
      let year = myDate.getFullYear()
      let month = myDate.getMonth() + 1
      let date = myDate.getDate()
      let str = '星期' + '日一二三四五六'.charAt(new Date().getDay())
      return year + '-' + month + '-' + date + ' ' + str
    },
    onNextStepBtnClick () {
      if (this.stepNum === 1 && this.countSelectedGroups === 0) {
        window.notify('请选择小组')
        return
      }

      this.stepNum++
      $(this.$refs.scrollableArea).scrollTop(0)
    }
  },
  computed: {
    countSelectedGroups () {
      return Object.keys(this.selectedGroups).length
    },
    ...mapGetters('Setting', ['taskTypeFlatList', 'taskTypeListUnique']),
    ...mapState('Setting', ['taskTypeList'])
  },
  watch: {
    selectedGroups (selectedGroups) {
      let taskGroupList = []
      for (let placeKey in selectedGroups) {
        let groupItem = selectedGroups[placeKey]
        let taskGroup = {
          groupNum: groupItem.groupNum,
          members: {}
        }

        for (let o in groupItem.members) {
          let name = groupItem.members[o]
          let taskTypeList = this.$store.state.Setting.taskTypeList

          taskGroup.members[o] = {
            name: name,
            task: taskTypeList[placeKey - 1] ? (taskTypeList[placeKey - 1][o] || '') : ''
          }
        }

        taskGroupList.push(taskGroup)
      }

      this.taskGroupList = taskGroupList
    },
    taskGroupList (newValue) {
      this.taskGroupListStr = JSON.stringify(this.taskGroupList, null, '  ')
    },
    taskGroupListStr (newValue) {
      try {
        let newFoo = JSON.parse(newValue)
        this.taskGroupList = newFoo
      } catch (err) {
        window.notify('seems to be invalid json: ' + err, 'e')
        // reset:
        this.taskGroupListStr = JSON.stringify(this.taskGroupList, null, '  ')
      }
    }
  }
}
</script>

<style scoped lang="scss">
.builder-page {
  .builder-header {
    z-index: 999;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 130px;
    background: rgba(255, 255, 255, 0.82);
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);

    .page-title {
      font-size: 23px;
      margin-top: 40px;
      margin-bottom: 20px;
      text-align: center;
    }
  }

  & > .inner {
    position: relative;
    height: calc(100% - 130px);
    margin-top: 130px;
    overflow-x: hidden;
    overflow-y: scroll;
  }

  & > .inner > .step-1 {
    padding-top: 10px;
  }

  .center-form {
    max-width: 70%;
    margin: 20px auto;
    background: rgba(255, 255, 255, 0.82);
    padding: 10px 20px 30px 20px;
  }

  .task-group-list {
    .group-item {
      & > .group-item-title {
        font-size: 17px;
        margin: 10px 0 20px 0;
        text-align: center;
        color: #1a73e8;
      }

      &:not(:last-child) {
        margin-bottom: 20px;
      }
    }

    .member-item {
      &:not(:last-child) {
        margin-bottom: 10px;
      }

      & > .columns {
        padding: 10px 9px;

        & > .column {
          padding: 0 2px;
        }
      }
    }
  }

  .step-toggle-bar {
    position: fixed;
    display: flex;
    flex-direction: row;
    place-items: center;
    z-index: 999;
    bottom: 60px;
    right: 30px;
    background: rgba(255, 255, 255, 0.82);
    box-shadow: 0 1px 3px rgba(0,0,0,.12);

    .left {
      padding: 6px 10px;
      border-right: 1px solid #F4F4F4;
      pointer-events: none;
    }

    .right {
      cursor: pointer;
      padding: 6px 10px;
      background: rgba(35, 209, 96, 0.85);
      color: #FFF;
      user-select: none;

      &:hover {
        opacity: .9;
      }

      i {
        margin: 0 5px;
      }
    }
  }

  .table-view-last {
    background: #FFF;
    min-height: calc(100vh - 145px);

    & > .inner {
      max-width: 90%;
      margin: 0 auto;
      padding: 20px 0 100px 0;
    }

    .group-title {
      font-size: 20px;
      margin: 20px 0 10px 0;
      color: #1a73e8;
    }

    & * {
      font-size: 18px;
    }
  }
}
</style>
