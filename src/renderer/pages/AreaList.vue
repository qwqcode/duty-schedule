<template>
  <div class="page area-list-page">
    <div :class="{ 'edit-mode': editMode }" class="area-list">
      <div class="page-title">
        区域任务
        <div class="action-box">
          <span v-if="!editMode" @click="editMode = true">
            <i class="zmdi zmdi-edit" /> 编辑
          </span>
          <span v-if="editMode" @click="editSave()">
            <i class="zmdi zmdi-save" /> 保存
          </span>
          <span v-if="editMode" @click="editCancel()">
            <i class="zmdi zmdi-close" /> 放弃
          </span>
        </div>
      </div>
      <div class="inner">
        <div v-for="(area, areaIndex) in areaList" :key="areaIndex" class="group">
          <div class="group-title">
            <EditableContent :editable="editMode" :value="area.name" :on-editing="(val) => modifyAreaName(area, val)">
              {{ area.name }}
            </EditableContent>
          </div>

          <div
            v-for="(count, task) in getAreaTaskUniqueList(area)"
            :key="task"
            class="item"
          >
            <span class="item-text">
              <EditableContent :editable="editMode" :value="task" :on-editing="(val) => modifyTaskName(area, task, val)">
                {{ task }}
              </EditableContent>
            </span>

            <span class="item-info">
              <span v-if="!editMode" :title="`一次需要 ${count} 个人做该任务`">
                <span class="count">x{{ count }}</span>
              </span>
              <span v-else class="count-input">
                <input
                  :value="count"
                  @change="modifyTaskQuantity(area, task, $event.target.value)"
                  type="number"
                  min="1"
                >
              </span>
              <span v-if="editMode" @click="removeTask(area, task)" class="clickable"><i class="zmdi zmdi-delete" /></span>
            </span>
          </div>

          <div v-if="editMode" class="item">
            <span class="item-info">
              <span @click="addNewTask(area)"><i class="zmdi zmdi-plus" /></span>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import _ from 'lodash'
import Vue from 'vue'
import { Component, Prop, Watch } from 'vue-property-decorator'
import { Plan, Area } from '../core/data-interfaces'
import EditableContent from '../components/EditableContent.vue'

@Component({
  components: { EditableContent }
})
export default class AreaList extends Vue {
  editMode = false

  areaList: Area[] = []

  created () {
    this.areaList = JSON.parse(JSON.stringify(this.$dataStore.AreaList))
  }

  getAreaTaskUniqueList (area: Area) {
    const list: { [taskName: string]: number } = {}
    _.forEach(area.taskList, (taskName) => {
      if (!_.has(list, taskName)) {
        list[taskName] = 1
      } else {
        list[taskName]++
      }
    })

    return list
  }

  modifyAreaName (area: Area, toVal: string) {
    area.name = toVal
  }

  modifyTaskName (area: Area, taskName: string, toVal: string) {
    area.taskList = _.map(area.taskList, (item) => item === taskName ? toVal : item)
  }

  modifyTaskQuantity (area: Area, taskName: string, numStr?: string) {
    if (numStr === undefined || Number.isNaN(Number(numStr))) { return }
    const num = Number(numStr)
    if (num <= 0) { return }

    let firstIndex = area.taskList.indexOf(taskName)
    if (firstIndex <= -1) { firstIndex = 0 }
    const newList = _.filter(area.taskList, o => o !== taskName)
    for (let i = 0; i < num; i++) {
      newList.splice(firstIndex + i, 0, taskName)
    }
    area.taskList = newList
  }

  removeTask (area: Area, taskName: string) {
    area.taskList = _.filter(area.taskList, o => o !== taskName)
  }

  addNewTask (area: Area) {
    area.taskList.push(`新任务 ${area.taskList.filter(o => o.startsWith('新任务')).length + 1}`)
  }

  editSave () {
    this.$dataStore.AreaList = this.areaList
    this.$dataStore.save()
    window.notify('数据已保存', 's')
    this.editMode = false
  }

  editCancel () {
    this.areaList = JSON.parse(JSON.stringify(this.$dataStore.AreaList))
    this.editMode = false
  }
}
</script>

<style lang="scss" scoped>
.area-list-page {
  .area-list {
    max-width: 40%;
    margin: 0 auto;

    .inner {
      .group {
        padding: 20px;
        background: rgba(255, 255, 255, 0.82);

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
          display: flex;
          flex-direction: row;
          padding: 5px 10px;
          position: relative;

          .item-text {
            flex: 1;
            margin-right: 10px;
          }

          .item-info {
            & > span {
              background: rgba(66,133,244,0.12);
              padding: 3px 10px;
              border-radius: 50px;
              font-size: 12px;

              &:not(:last-child) {
                margin-right: 5px;
              }

              &.clickable {
                cursor: pointer;

                &:hover {
                  color: #FFF;
                  background: #0083ff;
                }
              }
            }

            .count-input {
              input {
                display: inline-block;
                border: 0;
                outline: none;
                background: transparent;
                font-size: inherit;
                box-sizing: border-box;
                width: 15px;
                text-align: center;

                &::-webkit-outer-spin-button, &::-webkit-inner-spin-button {
                  -webkit-appearance: none;
                  margin: 0;
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
