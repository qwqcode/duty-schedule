<template>
  <div class="page area-list-page">
    <div :class="{ 'edit-mode': editMode }" class="area-list">
      <div class="page-title">
        区域任务
        <div class="action-box">
          <span @click="showAlias = !showAlias" :class="{ active: showAlias }" class="action-item">
            <i class="zmdi zmdi-turning-sign" /> 记录转移源
          </span>
          <span v-if="!editMode" @click="openEditMode()" class="action-item">
            <i class="zmdi zmdi-edit" /> 编辑
          </span>
          <ConfirmPopover v-if="editMode" @confirmed="editSave()" text="确定覆盖原有设定？">
            <span class="action-item">
              <i class="zmdi zmdi-save" /> 保存
            </span>
          </ConfirmPopover>
          <ConfirmPopover v-if="editMode" @confirmed="editCancel()" text="是否放弃修改？">
            <span class="action-item">
              <i class="zmdi zmdi-close" /> 放弃
            </span>
          </ConfirmPopover>
        </div>
      </div>

      <div class="inner">
        <div v-for="area in areaList" :key="area.name" class="group">
          <!-- 区域标题 -->
          <div class="group-title">
            <EditableContent
              :editable="editMode"
              :value="area.name"
              :on-editing="(val) => { area.name = val }"
            >
              {{ area.name }}
            </EditableContent>
          </div>

          <!-- 任务 -->
          <div
            v-for="task in area.taskList"
            :key="task.name"
            class="task-item"
          >
            <div class="task-main">
              <span class="task-name">
                <EditableContent
                  :editable="editMode"
                  :value="task.name"
                  :on-editing="(val) => { task.name = val }"
                >
                  {{ task.name }}
                </EditableContent>
              </span>

              <span class="task-info">
                <span v-if="!editMode" :title="`一次需要 ${task.demandNumOne} 个人做该任务`">
                  <span class="badge count">x{{ task.demandNumOne }}</span>
                </span>
                <span v-else class="badge count-input">
                  <input
                    :value="task.demandNumOne"
                    @change="task.demandNumOne = $event.target.value"
                    type="number"
                    min="1"
                  >
                </span>
                <ConfirmPopover
                  v-if="editMode"
                  @confirmed="deleteTask(area, task)"
                  text="确定删除该项？"
                >
                  <span class="badge clickable"><i class="zmdi zmdi-delete" /></span>
                </ConfirmPopover>
              </span>
            </div>

            <div v-if="showAlias" class="task-alias">
              <div>
                <div v-for="alias in task.aliasList" :key="alias" class="alias-item">
                  <i class="zmdi zmdi-turning-sign" /> {{ alias }}
                  <span class="task-info">
                    <span
                      v-if="editMode"
                      @click="deleteTaskAlias(task, alias)"
                      class="badge clickable"
                    ><i class="zmdi zmdi-minus" /></span>
                  </span>
                </div>
              </div>
              <!-- 编辑模式新增别名 -->
              <div v-if="editMode" class="alias-item">
                <i class="zmdi zmdi-turning-sign" />
                <div v-if="showAliaseSelector === `${area.name}-${task.name}`" class="alias-add-input">
                  <el-select
                    v-model="selectedAliase"
                    @change="addTaskAlias(task, $event)"
                    filterable
                    placeholder="请选择别名"
                    size="mini"
                  >
                    <el-option
                      v-for="item in getOptionalAliases(task.aliasList)"
                      :key="item"
                      :label="item"
                      :value="item"
                    />
                  </el-select>
                </div>
                <span v-if="showAliaseSelector === `${area.name}-${task.name}`" class="task-info">
                  <span @click="showAliaseSelector = ''" class="badge clickable"><i class="zmdi zmdi-minus" /></span>
                </span>

                <span v-if="showAliaseSelector !== `${area.name}-${task.name}`" class="task-info">
                  <span @click="showAliaseSelector = `${area.name}-${task.name}`" class="badge clickable"><i class="zmdi zmdi-plus" /></span>
                </span>
              </div>
            </div>
          </div>

          <!-- 新增任务按钮 -->
          <div v-if="editMode" class="task-item">
            <span class="task-info"><span @click="addNewTask(area)" class="badge"><i class="zmdi zmdi-plus" /></span></span>
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
import { Plan, Area, Task } from 'duty-schedule-core'
import EditableContent from '../components/EditableContent.vue'
import ConfirmPopover from '../components/ConfirmPopover.vue'

@Component({
  components: { EditableContent, ConfirmPopover }
})
export default class AreaList extends Vue {
  editMode = false
  showAlias = false
  areaList: Area[] = []

  created () {
    this.areaList = _.cloneDeep(this.$duty.Store.AreaList)
  }

  addNewTask (area: Area) {
    const task = new Task()
    task.name = `新任务 ${area.taskList.filter(o => o.name.startsWith('新任务')).length + 1}`
    area.taskList.push(task)
  }

  openEditMode () {
    this.$permission.adminBtn(() => {
      this.editMode = true
    })
  }

  editSave () {
    this.$duty.Store.AreaList = this.areaList
    this.$duty.Store.save()
    window.notify('数据已保存', 's')
    this.editMode = false
  }

  editCancel () {
    this.areaList = _.cloneDeep(this.$duty.Store.AreaList)
    this.editMode = false
  }

  addTaskAlias (task: Task, alias: string) {
    if (!alias || String(alias).trim() === '') return

    task.aliasList.push(alias)

    // 重置别名选择器
    this.showAliaseSelector = ''
    this.selectedAliase = ''
  }

  deleteTask (area: Area, task: Task) {
    area.taskList.splice(area.taskList.indexOf(task), 1)
  }
  deleteTaskAlias (task: Task, alias: string) {
    task.aliasList.splice(task.aliasList.indexOf(alias), 1)
  }

  selectedAliase: string = ''
  showAliaseSelector: string = ''

  getOptionalAliases (taskAliasList: string[]) {
    const curtAllTaskNames = _.flatMap(this.$duty.Store.AreaList, o => _.flatMap(o.taskList, v => v.name))

    const aliases: string[] = []
    _.forEach(this.$duty.Store.PlanList, (plan) => {
      _.forEach(plan.grpList, (grp) => {
        _.forEach(grp.asgnList, ({ taskName, oneName }) => {
          if (String(taskName).trim() === '') return
          if (aliases.includes(taskName)) return
          if (taskAliasList.includes(taskName)) return
          if (curtAllTaskNames.includes(taskName)) return

          aliases.push(taskName)
        })
      })
    })

    return aliases
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

        .task-item {
          .task-main {
            display: flex;
            flex-direction: row;
            padding: 5px 10px;
            position: relative;

            .task-name {
              flex: 1;
              margin-right: 10px;
            }
          }

          .task-info {
            .badge {
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
                  background: #1a73e8;
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

          .task-alias {
            margin-left: 20px;
            margin-bottom: 5px;
            padding-left: 5px;
            border-left: 1px dashed rgba(113, 113, 113, 0.5);

            .alias-item {
              font-size: 13px;
              padding: 2px 10px;

              & > i {
                color: rgba(26, 115, 232, 0.568);
                margin-right: 3px;
              }

              .task-info {
                margin-left: 5px;
                .badge {
                  padding: 2px 8px;
                  font-size: 10px;
                }
              }
            }

            .alias-add-input {
              display: inline-block;
            }
          }
        }
      }
    }
  }
}
</style>
