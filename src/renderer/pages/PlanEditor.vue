<template>
  <div class="task-editor">

    <el-form class="center-form">
      <el-form-item label="标题">
        <el-input placeholder="输入文字" v-model="task.title"></el-input>
      </el-form-item>
    </el-form>

    <div class="task-group-list center-form">
      <div class="group-item" v-for="(group, groupIndex) in this.task.memberGroupList" :key="groupIndex">
        <div class="group-item-title">{{ group.name }}
          <span class="sub-text">
            <el-select @change="onTaskTypeGroupSelected($event, groupIndex)" placeholder="请选择" :value="group.taskTypeGroupIndex">
            <el-option
              v-for="(item, key) in taskTypeGroupList"
              :key="key"
              :label="item.name + ` [已做 ${getTaskTypeGroupCount(group.taskTypeGroupName, group.name)} 次]`"
              :value="key"></el-option>
            </el-select>
          </span>
        </div>
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
          <AreaList :asSelector="true" v-model="typeSelector.memeberItem" :task="task" @input="closeTypeSelector()"></AreaList>
        </div>
      </div>
    </div>
    </slide-y-up-transition>

  </div>

</template>

<script>
import { ipcRenderer } from 'electron'
import _ from 'lodash'
import Vue from 'vue'
import AreaList from './AreaList'
import $ from 'jquery'

export default {
  components: { AreaList },
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
    if (!this.task.memberGroupList && !!this.task.memberGroupListInit) {
      // 若为新 Task，给 memberGroupList 分配任务
      this.initGroupListWithTask()
    }
  },
  methods: {
    setAndAutoDealingTaskType (obj) {
      if (typeof obj !== 'undefined') {
        Vue.set(this.task, 'groupSelectList', obj)
      }
      this.autoDealingTaskType()
      console.log(this.task.groupSelectList)
    },
    onTaskTypeGroupSelected (taskTypeGroupI, memberGroupI) {
      window.notify('暂时无法自动修改，请转为手动修改', 'w')
      console.log(`// "任务 index" => "组位置序号"\nwindow.setAndAutoDealingTaskType(${JSON.stringify(this.task.groupSelectList, null, '  ')})`)
      window.setAndAutoDealingTaskType = this.setAndAutoDealingTaskType
      ipcRenderer.send('open-dev-tools')

      /*
      console.log(taskTypeGroupI, memberGroupI)
      taskTypeGroupI = Number(taskTypeGroupI)
      memberGroupI = Number(memberGroupI)

      let obj = {}
      obj[taskTypeGroupI] = String(memberGroupI)
      let arr = []
      arr.push(taskTypeGroupI)
      Vue.set(this.task, 'groupSelectList', this.buildGroupSelectListByCount(obj, arr))

      this.autoDealingTaskType()
      */
    },
    initGroupListWithTask () {
      let memberGroupListInit = this.task.memberGroupListInit
      let memberGroupList = {}

      _.forEach(memberGroupListInit, (rawGroup, groupI) => {
        let group = memberGroupList[groupI] = _.cloneDeep(rawGroup)
        group.data = {}

        _.forEach(rawGroup.data, (memberName, memberI) => {
          group.data[memberI] = {
            name: memberName,
            task: '' // taskType
          }
        })
      })

      Vue.set(this.task, 'memberGroupList', memberGroupList)
      Vue.delete(this.task, 'memberGroupListInit')

      // 执行自动分发任务
      this.autoDealingTaskType()
    },
    /**
     * 只是存放数据的 example 注释，无实际作用
     */
    ___dataExample___ () {
      /**
       * @example Array this.$store.state.Setting.taskTypeGroupList (=this.taskTypeGroupList)
       * ```
       * [
       *  { "data":[ "教室 地面扫+拖", "教室 地面扫+拖", ... ] },
       *  { "data":[ "走廊 地面扫+拖", "擦 教室瓷砖+走廊瓷砖", ... ] },
       *  ...
       * ]
       * ```
       */
      /**
       * @example Object this.task.memberGroupList 当前 task 中已选取的组
       * ```
       * {
       *    "0": { "name": "第 1 组", "data": { "0": {"name": "张XX", "task": "教室 地面扫+拖"}, "1": {"name": "李XX", "task": "教室 地面扫+拖"}, "n": ... }},
       *    "1": { "name": "第 2 组", "data": { "0": {"name": "黄XX", "task": "洗白板+倒垃圾"}, "1": {"name": "赵XX","task": "走廊 地面扫+拖"}, "n": ... }},
       *    ...
       * }
       * ```
       */
    },
    /**
     * 自动分发任务
     * (核心功能)
     */
    autoDealingTaskType () {
      // 在注释中：^XXX^ => 表示 taskType 组，*XXX* => 表示 memberGroupList 组
      let groupSelectList = this.task.groupSelectList
      if (typeof groupSelectList === 'undefined') {
        groupSelectList = this.task.groupSelectList = this.buildGroupSelectListByCount() // 选组列表（自动分配）
      }

      let exceptedMemberNameList = [] // 排除的人 列表
      console.log(groupSelectList)

      // 遍历 taskType list 出所有的 ^taskType 组^
      _.forEach(this.taskTypeGroupList, (taskTypeGroup, taskTypeGroupI) => {
        // 克隆一份 memberGroupList（可任意操作数据，不改变原始数据）
        let memberGroupList = _.cloneDeep(this.task.memberGroupList)
        // 仅选择*一个组* 对应 ^taskType 的一个组^（用来抽取成员，并分配任务）
        let selectedGroupIndex = groupSelectList[taskTypeGroupI]
        // 对这个组设置 taskTypeGroupName
        this.task.memberGroupList[selectedGroupIndex].taskTypeGroupIndex = taskTypeGroupI
        this.task.memberGroupList[selectedGroupIndex].taskTypeGroupName = taskTypeGroup.name
        // 获取这个组的成员数据
        memberGroupList = [memberGroupList[selectedGroupIndex]]
        // 遍历 taskType list ^一个组^里面的所有 typeType Names
        _.forEach(taskTypeGroup.data, (taskTypeName) => {
          // 获取*一个组*内，做这个 taskTypeName 做得最少的成员
          let resultMember = this.getTaskTypeMinCountMemberOne(memberGroupList, taskTypeName, exceptedMemberNameList)
          // 找到了该成员后，为该成员设置这个 taskTypeName
          this.setMemberTask(resultMember.data.name, taskTypeName)
          // 已分配任务的人，添加到排除列表（下一次 getTaskTypeMinCountMemberOne 就不会再找 TA）
          exceptedMemberNameList.push(resultMember.data.name)
        })
      })
    },
    /**
     * 通过 taskTypeGroupCountList 生成选组列表
     */
    buildGroupSelectListByCount (groupSelectList, exceptedTaskTypeGroupNames) {
      groupSelectList = groupSelectList || {}
      exceptedTaskTypeGroupNames = exceptedTaskTypeGroupNames || []

      // TODO: 注意 _.shuffle(this.task.memberGroupList) 是不行的，因为会改变 memberGroupI，下次记得改：不使用 memberGroupI 作为 map 的 key
      _.forEach(this.task.memberGroupList, (memberGroup, memberGroupI) => {
        if (_.filter(groupSelectList, (o) => o === memberGroupI).length > 0) {
          return
        }

        // 分配给该成员组最少执行的次数的任务组
        let countMinGroupKey = null
        let countMinGroupKeyNum

        _.forEach(this.taskTypeGroupList, (taskTypeGroup, taskTypeGroupI) => {
          // 若存在于排除任务组名组列表中，则跳过（不再安排这个任务组给成员组了）
          if (exceptedTaskTypeGroupNames.indexOf(taskTypeGroupI) > -1) {
            return
          }

          // 一个接一个地查询，比较大小，保存
          let count = this.getTaskTypeGroupCount(taskTypeGroup.name, memberGroup.name, true)
          console.log(`\nget(${taskTypeGroup.name}, ${memberGroup.name})=${count}\n`)
          if (typeof countMinGroupKeyNum === 'undefined') {
            countMinGroupKey = taskTypeGroupI
            countMinGroupKeyNum = count
          }

          if (count < countMinGroupKeyNum) {
            countMinGroupKey = taskTypeGroupI
            countMinGroupKeyNum = count
          }
        })

        groupSelectList[countMinGroupKey] = memberGroupI

        // 已安排该组，添加 任务类型组key 到排除列表
        exceptedTaskTypeGroupNames.push(countMinGroupKey)
        console.log(`groupSelectList[${countMinGroupKey}] = ${memberGroupI}`)
        console.log(`${countMinGroupKeyNum}`)
        console.log(`${JSON.stringify(exceptedTaskTypeGroupNames)}`)
        console.log(`\n`)
      })

      return groupSelectList
    },
    /**
     * （已废弃）通过总和，生成选组列表（作用是：不让某个组一直扫 公区or教室 其中一个地方）
     * 生成 {"taskType 组 Index": "memberGroupList 组 Index", ...}
     * 根据 memberGroupList 中成员做每个 taskType 组中每个 taskType 的次数排序
     */
    buildGroupSelectListByCountBySum () {
      let groupSelectList = {}
      // _.shuffle 打乱顺序，防止当数据相同时，一直抽到某一个 *memberGroupList 组*
      _.forEach(_.shuffle(this.taskTypeGroupList), (taskTypeGroup, taskTypeGroupI) => {
        // 获取 *所有 memberGroupList 组中所有成员* 做过这个 ^taskType 组^ 中所有 taskType 的次数 的总和
        let sumList = {} // '*memberGroupI*': '总和'
        // taskTypeGroup 去重
        let uniqTaskTypeGroup = _.uniq(taskTypeGroup.data)
        // console.log(`\nuniqTaskTypeGroup=${taskTypeGroupI}: ${JSON.stringify(uniqTaskTypeGroup)}`)

        // 遍历当前 task 的 memberGroupList（已选取的组）
        _.forEach(this.task.memberGroupList, (memberGroup, memberGroupI) => {
          // console.log(`【${memberGroup.name}】`)
          // 排除已在 groupSelectList 中的 *组*
          if (_.filter(groupSelectList, (val) => val === memberGroupI).length > 0) {
            // console.log(`-- 跳过 --`)
            return
          }
          // 初始化这个 *组* 在 sumList 中的数据
          if (typeof sumList[memberGroupI] === 'undefined') {
            sumList[memberGroupI] = 0 // 初始化
          }
          // 遍历*一个组*中的成员
          _.forEach(memberGroup.data, (member) => {
            // 查询这个成员做过该 taskTypeGroup 中所有 taskType 的次数，并求和
            _.forEach(uniqTaskTypeGroup, (taskTypeName) => {
              // console.log(`【"${taskTypeName}", "${member.name}"】sumList[${memberGroupI}] += ${Number(this.getTaskTypeCount(taskTypeName, member.name))}`)
              sumList[memberGroupI] += Number(this.getTaskTypeCount(taskTypeName, member.name))
            })
          })
          // console.log('\n')
        })

        // console.log(`【结果】taskTypeGroupI=${taskTypeGroupI}, sumList=`, sumList)
        /**
         * taskTypeGroupI: 0 {0: 40, 1: 4, 2: 0, 3: 0}
         * taskTypeGroupI: 1 {0: 4, 1: 28, 3: 0}
         * taskTypeGroupI: 2 {0: 0, 1: 0}
         * taskTypeGroupI: 3 {1: 0}
         */
        // 找出一个 做 ^这个taskTypeGroupList Group中任务^ 最少的 *memberGroupList 组*
        let countMinMemberGroupIndex = null
        let countMinMemberGroupNum
        _.forEach(sumList, (num, memberGroupI) => {
          if (typeof countMinMemberGroupNum !== 'number') {
            // 初始化
            countMinMemberGroupIndex = memberGroupI
            countMinMemberGroupNum = num
          } else {
            // 若这个 memberGroup 的 sum 小于前一个的 sum
            if (num < countMinMemberGroupNum) {
              countMinMemberGroupIndex = memberGroupI
              countMinMemberGroupNum = num
            }
          }
        })

        groupSelectList[taskTypeGroupI] = countMinMemberGroupIndex
        // console.log(`【结果】groupSelectList[${taskTypeGroupI}] = ${countMinMemberGroupIndex}`)
      })

      return groupSelectList
    },
    /**
     * 从本 task 中获取做 指定 taskType 最少的人
     */
    getTaskTypeMinCountMemberOne (memberGroupList, taskType, exceptedMemberNameList) {
      let countMinNum // 最小 count 数值
      let countMinMember = null // 做过该 taskType 最少的人

      // 获取 task 中该 taskType 做得最少的人
      // _.shuffle 打乱顺序（防止每次都抽到最前面的人）
      _.forEach(_.shuffle(memberGroupList), (group, groupI) => {
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
    // 为 this.task.memberGroupList 中的指定成员设置任务
    setMemberTask (memberName, taskTypeName) {
      _.forEach(this.task.memberGroupList, (group, groupI) => {
        _.forEach(group.data, (member, memberI) => {
          if (member.name === memberName) {
            Vue.set(this.task.memberGroupList[groupI].data[memberI], 'task', taskTypeName)
          }
        })
      })
    },
    // 获取本 this.task.memberGroupList 中做指定任务的人数
    getTaskTypeSelectedTotal (taskTypeName) {
      let count = 0
      _.forEach(this.task.memberGroupList, (group) => {
        _.forEach(group.data, (item) => {
          if (item.task === taskTypeName) {
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
    ...mapState('Setting', ['taskTypeGroupList', 'taskTypeGroupCountList']),
    ...mapGetters('Setting', ['taskTypeGroupListFlat', 'taskTypeGroupListUnique', 'getTaskTypeCount', 'getTaskTypeGroupCount', 'eachTaskTypeMaxNeedNumList'])
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
      padding: 10px 20px 30px 20px;

      & > .group-item-title {
        position: relative;
        font-size: 21px;
        margin: 10px 0 20px 0;
        color: #1a73e8;

        .sub-text {
          position: absolute;
          right: 0;
          top: 0;
          font-size: 13px;
          color: rgb(79, 80, 82);
        }
      }

      &:not(:last-child) {
        margin-bottom: 10px;
        border-bottom: 1px dashed #dedede;
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
