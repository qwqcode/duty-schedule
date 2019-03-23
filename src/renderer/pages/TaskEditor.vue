<template>
  <div class="task-editor">

    <el-form class="center-form">
      <el-form-item label="标题">
        <el-input placeholder="输入文字" v-model="task.title"></el-input>
      </el-form-item>
    </el-form>

    <div class="task-group-list center-form">
      <div class="group-item" v-for="(group, taskIndex) in this.task.groupList" :key="taskIndex">
        <div class="group-item-title">{{ group.name }}</div>
        <div class="member-item" v-for="(item, key) in group.data" :key="key">
          <el-row>
            <el-col :span="3">
              <el-input placeholder="名字" v-model="item.name" class="name-input"></el-input>
            </el-col>
            <el-col :span="21">
              <el-input
                class="type-input"
                placeholder="任务"
                :readonly="true"
                :value="(itemValue = `${item.task} [${getTaskTypeCount(item.task, item.name)} 次]`)"
                :title="`${item.name} -> ${itemValue}`"
                @focus="openTypeSelector(item)"></el-input>
            </el-col>
          </el-row>
        </div>
      </div>
    </div>

    <slide-y-up-transition>
    <div class="type-selector-dialog" v-if="typeSelector.isDialogOpen" @click="closeTypeSelectorFromBg">
      <div class="inner">
        <div class="close-btn"><i class="zmdi zmdi-close"></i></div>
        <div class="body">
          <TaskTypeList :asSelector="true" v-model="typeSelector.memeberItem" :task="task" @input="closeTypeSelector()"></TaskTypeList>
        </div>
      </div>
    </div>
    </slide-y-up-transition>

  </div>

</template>

<script>
import { mapGetters } from 'vuex'
import _ from 'lodash'
import Vue from 'vue'
import TaskTypeList from './TaskTypeList.vue'
import $ from 'jquery'

export default {
  components: { TaskTypeList },
  props: ['value'],
  data () {
    return {
      task: null,
      typeSelector: {
        isDialogOpen: false,
        memeberItem: null
      }
    }
  },
  created () {
    this.task = this.value
    if (!this.task.groupList && !!this.task.groupListInit) {
      // 若为新 Task，给 GroupList 分配任务
      this.initGroupListWithTask()
    }
  },
  methods: {
    initGroupListWithTask () {
      let groupListInit = this.task.groupListInit
      let groupList = {}

      _.forEach(groupListInit, (rawGroup, groupI) => {
        let group = groupList[groupI] = _.cloneDeep(rawGroup)
        group.data = {}

        _.forEach(rawGroup.data, (memberName, memberI) => {
          group.data[memberI] = {
            name: memberName,
            task: '' // taskType
          }
        })
      })

      Vue.set(this.task, 'groupList', groupList)
      Vue.delete(this.task, 'groupListInit')

      // 执行自动分发任务
      this.autoDealingTaskType()
    },
    /**
     * 自动分发任务
     * (核心功能)
     */
    autoDealingTaskType () {
      // 遍历 taskType 不重复的 list
      // 获取 task 中每个 taskType 做得最少的人
      let exceptedMemberNameList = [] // 排除列表
      _.forEach(this.taskTypeListUnique, (taskType) => {
        // 克隆一份 groupList 可任意操作数据，不改变原始数据
        let groupList = _.cloneDeep(this.task.groupList)

        // 循环 [该任务最多需要人数] 次
        for (let i = 0; i < this.taskTypeMaxNeedNumList[taskType]; i++) {
          let resultMember = this.getTaskTypeMinCountMember(groupList, taskType, exceptedMemberNameList)
          // 为 member 设置任务
          _.forEach(this.task.groupList, (group, groupI) => {
            _.forEach(group.data, (member, memberI) => {
              if (member.name === resultMember.data.name) {
                Vue.set(this.task.groupList[groupI].data[memberI], 'task', taskType)
              }
            })
          })
          // 已分配任务的人，添加到排除列表（下一次 getTaskTypeMinCountMember 就不会再找 TA）
          exceptedMemberNameList.push(resultMember.data.name)
          // 继续找人，直到达到 [该任务最多需要人数] 为止
        }
      })
    },
    /**
     * 从本 task 中获取做 指定 taskType 最少的人
     */
    getTaskTypeMinCountMember (groupList, taskType, exceptedMemberNameList) {
      let countMinNum // 最小 count 数值
      let countMinMember = null // 做过该 taskType 最少的人

      // 获取 task 中该 taskType 做得最少的人
      // _.shuffle 打乱顺序（防止每次都抽到最前面的人）
      _.forEach(_.shuffle(groupList), (group, groupI) => {
        _.forEach(_.shuffle(group.data), (member, memberI) => {
          let memberName = member.name

          // 若存在于排除列表，直接跳过
          if (exceptedMemberNameList.indexOf(memberName) > -1) {
            return
          }

          // 获取 单个成员 做过该 taskType 次数
          let didCount = this.getTaskTypeCount(taskType, memberName)
          if (typeof countMinNum !== 'number') {
            // 若 countMinNum 未设定，则初始化
            countMinNum = didCount
            countMinMember = { groupI, memberI, data: member }
          } else {
            // 若 已初始化过
            if (didCount <= countMinNum) {
              // 此人做过的任务数小于 countMinNum
              // 则改变 countMinNum（说明有更小的人）
              countMinNum = didCount
              countMinMember = { groupI, memberI, data: member }
            }
          }
        })
      })

      return countMinMember
    },
    // 获取本 task 中做指定 taskType 任务的人数
    getTaskTypeSelectedTotal (taskType) {
      let count = 0
      _.forEach(this.task.groupList, (group) => {
        _.forEach(group.data, (item) => {
          if (item.task === taskType) {
            count++
          }
        })
      })

      return count
    },
    openTypeSelector (memberItem) {
      Vue.set(this.typeSelector, 'isDialogOpen', true)
      Vue.set(this.typeSelector, 'memeberItem', memberItem)
    },
    closeTypeSelector () {
      Vue.set(this.typeSelector, 'isDialogOpen', false)
      Vue.set(this.typeSelector, 'memeberItem', null)
    },
    closeTypeSelectorFromBg (e) {
      let taskListInnerEl = $('.task-type-list > .inner')
      if (!$(e.target).is(taskListInnerEl) && !$(e.target).closest(taskListInnerEl).length) {
        this.closeTypeSelector()
      }
    }
  },
  computed: {
    ...mapGetters('Setting', ['taskTypeFlatList', 'taskTypeListUnique', 'getTaskTypeCount', 'taskTypeMaxNeedNumList'])
  },
  watch: {
    task (obj) {
      this.$emit('input', obj)
    }
  }
}
</script>

<style lang="scss">
.task-editor {
  position: relative;

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
        margin-bottom: 15px;
      }

      & > .columns {
        padding: 10px 9px;

        & > .column {
          padding: 0 2px;
        }
      }

      .name-input {

      }

      .type-input {
        cursor: pointer;

        & > input {
          margin-left: -2px;
          cursor: pointer;
        }
      }
    }
  }

  .type-selector-dialog {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;

    & > .inner {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      overflow-y: auto;
      overflow-x: hidden;
      background: rgba(105, 105, 105, 0.65);

      & > .body {
        margin-top: 160px;
        margin-bottom: 70px;
      }
    }

    .close-btn {
      z-index: 9999;
      position: fixed;
      right: 50px;
      top: 170px;

      & > i {
        font-size: 2.3em;
        color: #FFF;
        cursor: pointer;
        user-select: none;

        &:hover {
          opacity: .7;
        }

        padding: 10px;
      }
    }
  }
}
</style>
