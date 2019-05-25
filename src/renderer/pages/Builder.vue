<template>
  <div class="page fullscreen builder-page">
    <div class="builder-header">
      <div class="page-title">创建新的日程</div>

      <el-steps :active="stepNum-1" simple finish-status="success" style="padding: 0 8%">
        <el-step v-for="(desc, num) in stepDesc" :key="num" :title="`${num}. ${desc}`"></el-step>
      </el-steps>
    </div>

    <div class="inner">
      <slide-x-left-transition>
      <div class="step step-1" v-if="stepNum === 1">
        <MemberGroupList :asSelector="true" v-model="task.memberGroupListInit"></MemberGroupList>
      </div>
      </slide-x-left-transition>

      <slide-x-left-transition>
      <div class="step step-2" v-if="stepNum === 2">
        <TaskEditor v-model="task"></TaskEditor>
      </div>
      </slide-x-left-transition>

      <slide-x-left-transition>
      <div class="step step-3 build-done" v-if="stepNum === 3">
        <div class="icon"><slide-y-up-transition><i class="zmdi zmdi-check"></i></slide-y-up-transition></div>
        <div class="big-text">创建完成</div>
        <div class="action-bar">
          <el-button-group>
            <router-link :to="{ name: 'viewer', params: { title: task.title }}"><el-button size="mini">点击展示</el-button></router-link>
            <router-link to="/"><el-button size="mini">返回日程表</el-button></router-link>
          </el-button-group>
        </div>
      </div>
      </slide-x-left-transition>

    </div>

    <div class="step-toggle-bar" v-if="stepNum < Object.keys(stepDesc).length">
      <div class="left" v-if="stepNum === 1">
        <template v-if="stepNum === 1">已选取 {{ task.memberGroupListInit.length }} 个小组</template>
      </div>
      <div class="right" @click="nextStep()">
        <template v-if="stepNum !== 2">下一步 <i class="zmdi zmdi-chevron-right"></i></template>
        <template v-else>保存 <i class="zmdi zmdi-chevron-right"></i></template>
      </div>
    </div>

  </div>
</template>

<script lang="ts">
import MemberGroupList from './MemberGroupList.vue'
import TaskEditor from './TaskEditor.vue'
import $ from 'jQuery'
import _ from 'lodash'
import Vue from 'vue'

export default Vue.extend({
  components: { MemberGroupList, TaskEditor },
  data () {
    return {
      task: null,
      stepNum: 1,
      stepDesc: {
        '1': '选择小组',
        '2': '分配任务',
        '3': '完成创建'
      }
    }
  },
  created () {
    // 初始化 Task
    this.task = {
      title: `${this.getDate()}`,
      memberGroupListInit: [],
      time: ''
    }
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
    nextStep () {
      // 切换 step 前
      if (this.stepNum === 1 && this.task.memberGroupListInit.length === 0) {
        window.notify('请选择小组')
        return
      }

      if (this.stepNum === 2) {
        if (_.find(this.$store.state.Setting.taskList, (o) => { return o.title === this.task.title })) {
          window.notify('标题重复，请更换标题', 'w', 2000)
          return
        }

        // 保存数据
        this.task.time = (new Date()).getTime()
        this.$store.commit('Setting/PUSH_TASK', this.task)
      }

      // 执行切换 step
      this.stepNum++
      $(`step-${this.stepNum}`).scrollTop(0)
    }
  }
})
</script>

<style scoped lang="scss">
.builder-page {
  overflow: hidden;

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
      margin-top: 30px;
      margin-bottom: 30px;
      text-align: center;
    }

    .el-steps--simple {
      background: transparent;
    }
  }

  .step {
    position: fixed;
    top: 130px;
    left: 0;
    width: 100%;
    height: calc(100vh - 170px - 10px);
    overflow-x: hidden;
    overflow-y: auto;
    padding-top: 10px;
  }

  .build-done {
    background: #FFF;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    place-items: center;
    top: 0;

    .icon {
      font-size: 3em;
      color: #67C23A;
      height: 1.8em;
      width: 1.8em;
      text-align: center;
      line-height: 1.8em;
      border-radius: 50%;
      border: 3px solid #67C23A;
    }

    .big-text {
      margin-top: 20px;
      font-size: 1.6em;
    }

    .action-bar {
      margin-top: 20px;
    }
  }

  .step-toggle-bar {
    position: absolute;
    display: flex;
    flex-direction: row;
    place-items: center;
    z-index: 999;
    bottom: 25px;
    right: 30px;
    background: rgba(255, 255, 255, 0.82);
    box-shadow: 0 1px 3px rgba(0,0,0,.12);

    .left {
      padding: 7px 12px;
      border-right: 1px solid #F4F4F4;
      pointer-events: none;
    }

    .right {
      cursor: pointer;
      padding: 7px 12px;
      background: rgba(35, 209, 96, 0.85);
      color: #FFF;
      user-select: none;

      &:hover {
        opacity: .9;
      }

      i {
        margin-left: 5px;
      }
    }
  }
}
</style>
