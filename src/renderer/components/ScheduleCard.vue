<template>
  <div class="card">
    <div class="inner">
      <!-- TYPE-GRP -->
      <div v-if="card.type === 'grp' && !!Grp" class="content">
        <div class="title">
          组 {{ Grp.name }}
        </div>
        <el-row :gutter="30" class="grp-task-list-wrap">
          <el-col
            v-for="(item, i) in (Grp.getTaskOnesNameList())"
            :key="i"
            :span="8"
            class="task-list"
            style="margin-bottom: 20px;"
          >
            <div class="task-name">
              {{ item.taskName }}
            </div>
            <div class="person-list">
              <div
                v-for="(oneName, pi) in item.oneNameList"
                :key="pi"
                @click="$personProfile.open(oneName)"
                class="person-item"
              >
                {{ oneName }}
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
      <!-- TYPE-TEXT -->
      <div v-else-if="card.type === 'text' && !!Text" class="content">
        <div class="title">
          提醒事项
        </div>
        <div class="note-text" v-html="$marked(Text)" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator'
import { GrpInPlan } from 'duty-schedule-core'

@Component({})
export default class ScheduleCard extends Vue {
  @Prop({})
  card!: Card

  get Grp (): GrpInPlan|null {
    if (this.card.type !== 'grp') return null
    return this.card.value as GrpInPlan
  }

  get Text (): string|null {
    if (this.card.type !== 'text') return null
    return this.card.value as string
  }
}

export interface Card {
  type: 'grp'|'text'
  value: any
}
</script>

<style scoped lang="scss">
.card {
  position: absolute;
  background: #fff;
  top: 70px;
  left: 15px;
  height: calc(100% - 100px);
  width: calc(100% - 40px);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
  border-radius: 3px;

  & > .inner {
    position: relative;
    height: 100%;

    .content {
      padding: 20px;
    }
  }

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

  .grp-task-list-wrap {
    padding: 0 25px;

    .task-list {
      .task-name {
        color: #1a73e8;
        font-size: 22px;
        margin-bottom: 15px;
      }

      .person-list {
        margin-left: 10px;
        .person-item {
          display: block;
          width: fit-content;
          cursor: pointer;
          font-size: 25px;
          &:not(:last-child) {
            margin-bottom: 10px;
          }

          &:hover {
            color: #1a73e8;
          }
        }
      }
    }
  }

  .note-text {
    font-size: 26px;
    padding: 0 25px;
  }
}
</style>
