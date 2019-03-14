<template>
  <div class="page task-type-list-page">
    <div class="task-type-list">
      <div class="page-title">任务种类列表</div>
      <div class="inner">
        <div class="group" v-for="(group, groupIndex) in taskTypeList" :key="groupIndex">
          <div class="group-title">组 {{ groupIndex+1 }}</div>
          <div class="item" v-for="(name, typeIndex) in group" :key="typeIndex">
            {{ typeIndex+1 }}. {{ name }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    data () {
      return {
        taskTypeList: this.$store.state.Setting.taskTypeList
      }
    }
  }
</script>

<style scoped lang="scss">
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
          cursor: pointer;
          &:hover {
            background: rgba(66,133,244,0.12);
            color: #1a73e8;
          }
        }
      }
    }
  }
}
</style>
