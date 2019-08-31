<template>
  <div class="person-profile" :class="{ 'as-selector': !!asSelector }">
    <div class="base-info">
      <div class="name">{{ personName }}</div>
    </div>
    <div class="task-list">
      <div
        class="item"
        v-for="(task, taskIndex) in []"
        :key="taskIndex"
        @click="!!asSelector ? selectTask(task) : null"
      >
        <span
          :title="`${DataValue.person} 已做过 ${$dataQuery.getPersonTaskRec(DataValue.person, task)} 次该任务`"
        >
          <i class="zmdi zmdi-account"></i>
          {{ $dataQuery.getPersonTaskRec(DataValue.person, task) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import _ from 'lodash'
import Vue from 'vue'
import { Component, Prop } from 'vue-property-decorator'
import { Plan } from '../core/data-interfaces'

@Component({})
export default class PersonProfile extends Vue {
  isUniqueMode: boolean = false
  @Prop() readonly asSelector!: boolean
  @Prop({
    required: true
  }) readonly personName!: string
  @Prop() readonly value!: Object
  @Prop() readonly plan!: Plan

  created() {
    if (this.asSelector) {
      this.isUniqueMode = true
    }
  }

  mounted () {
    console.log(this.profile)
  }

  get DataValue(): any {
    return this.value
  }

  get AreaList() {
    if (!this.isUniqueMode) return this.$dataStore.AreaList
    else return this.$dataQuery.getAreaListWithUniqueTask()
  }

  get profile () {
    return this.$dataQuery.getPersonProfile(this.personName)
  }

  selectTask(taskName: string) {
    this.$emit('input', Object.assign(this.value, { task: taskName }))
  }
}
</script>

<style lang="scss" scoped>
.person-profile {
  display: block;
  width: 100%;
  display: flex;
  flex-direction: row;
  overflow: hidden;

  .base-info {
    flex: 35%;
    background: #FFF;
    padding: 40px 25px 40px 50px;
    z-index: 1;
    box-shadow: 0 2px 15px rgba(0, 0, 0, 0.2);

    .name {
      font-size: 26px;
    }
  }

  .task-list {
    flex: 65%;
    background: #FFF;
    padding: 40px 50px 40px 25px;
  }
}
</style>
