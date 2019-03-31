<template>
  <div class="page task-type-list-page" :class="{ 'as-selector': !!asSelector }">
    <div class="task-type-list">
      <div class="page-title" v-if="!asSelector">任务种类列表</div>
      <div class="inner">
        <div class="group" v-for="(taskType, taskTypeIndex) in taskTypeGroupList" :key="taskTypeIndex">
          <div class="group-title" v-if="!isUniqueMode">{{ taskType.name }}</div>
          <div class="group-title" v-if="isUniqueMode">为 {{ value.name }} 分配任务</div>
          <div class="item"
            v-for="(typeName, nameIndex) in taskType.data"
            :key="nameIndex"
            @click="!!asSelector ? typeSelect(typeName) : null"
            :class="{ 'selected': !!asSelector && value.task === typeName }">
            <span class="item-text">{{ nameIndex + 1 }}. {{ typeName }}</span>
            <span class="item-info" v-if="asSelector">
              <span :title="`${value.name} 已做过 ${getTaskTypeCount(typeName, value.name)} 次该任务`">
                <i class="zmdi zmdi-account"></i> {{ getTaskTypeCount(typeName, value.name) }}
              </span>
              <span :title="`共有 ${getSelectedTotal(typeName)} 人参与该任务`">
                <i class="zmdi zmdi-accounts"></i> {{ getSelectedTotal(typeName) }}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import _ from 'lodash'
  import { mapGetters } from 'vuex'

  export default {
    props: {
      asSelector: Boolean,
      value: Object,
      task: Object
    },
    data () {
      return {
        isUniqueMode: false
      }
    },
    created () {
      if (this.asSelector) {
        this.isUniqueMode = true
      }
    },
    methods: {
      typeSelect (taskName) {
        this.$emit('input', Object.assign(this.value, { task: taskName }))
      },
      getSelectedTotal (taskName) {
        let count = 0
        _.forEach(this.task.memberGroupList, (group) => {
          _.forEach(group.data, (item) => {
            if (item.task === taskName) {
              count++
            }
          })
        })

        return count
      }
    },
    computed: {
      taskTypeGroupList () {
        let list = {}

        if (!this.isUniqueMode) {
          list = this.$store.state.Setting.taskTypeGroupList
        } else {
          list = [{ data: this.$store.getters['Setting/taskTypeGroupListUnique'] }]
        }

        return list
      },
      ...mapGetters('Setting', ['getTaskTypeCount'])
    }
  }
</script>

<style lang="scss">
.task-type-list-page {
  .task-type-list {
    max-width: 40%;
    margin: 0 auto;

    .inner {
      .group {
        padding: 20px;
        background: #FFF;

        &:not(:last-child) {
          margin-bottom: 10px;
        }

        .group-title {
          padding: 5px 10px;
          font-size: 16px;
          color: #1a73e8;
          margin-bottom: 5px;
        }

        .item {
          padding: 5px 10px;
          position: relative;

          .item-info {
            position: absolute;
            right: 10px;

            & > span {
              background: rgba(66,133,244,0.12);
              padding: 3px 10px;
              border-radius: 50px;
              font-size: 12px;

              & > i {
                margin-right: 2px;
              }

              &:not(:last-child) {
                margin-right: 5px;
              }
            }
          }
        }
      }
    }
  }

  &.as-selector {
    .task-type-list {
      max-width: 50%;
    }

    .task-type-list .inner .group .item {
      cursor: pointer;
      padding-right: 100px;

      &:not(:last-child) {
        margin-bottom: 3px;
      }

      &:hover {
        background: rgba(66,133,244,0.12);
        color: #1a73e8;
      }

      &.selected {
        color: #fff;
        background: #67C23A;

        &:before {
          content: '\F26B';
          font: normal normal normal 14px/1 'Material-Design-Iconic-Font';
          margin-right: 10px;
        }
      }
    }
  }
}
</style>
