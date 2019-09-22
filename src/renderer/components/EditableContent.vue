<template>
  <span>
    <span v-if="!isEditing" @click="showEditor" :class="{ 'is-editable': editable }" class="editable-content">
      <slot />
    </span>
    <form v-else @submit.prevent="submit" class="editable-content-form">
      <input
        ref="mainInput"
        :value="value"
        type="text"
        placeholder="输入修改内容"
        autocomplete="off"
      >
      <button class="btn submit-btn" type="submit"><i class="zmdi zmdi-check" /></button>
      <button @click="isEditing = false" type="button" class="btn close-btn"><i class="zmdi zmdi-close" /></button>
    </form>
  </span>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Prop, Watch } from 'vue-property-decorator'

@Component({})
export default class EditableContent extends Vue {
  @Prop({ default: true, type: Boolean }) readonly editable!: boolean

  @Prop({ default: '', type: String }) readonly value!: string

  @Prop({ default: () => {}, type: Function }) readonly onEditing!: (val: string) => boolean|void

  isEditing: boolean = false

  showEditor () {
    if (!this.editable) { return }

    this.isEditing = true
  }

  submit () {
    const inputEl = this.$refs.mainInput as HTMLInputElement
    const result = this.onEditing(inputEl.value)
    if (typeof result !== 'boolean' || result === true) {
      this.isEditing = false
    }
  }

  @Watch('isEditing')
  onIsEditingChanged (isEditing: boolean) {
    if (isEditing) {
      window.setTimeout(() => {
        (this.$refs.mainInput as HTMLInputElement).focus()
      }, 80)
    }
  }
}
</script>

<style lang="scss" scoped>
.editable-content {
  &.is-editable {
    cursor: pointer;

    &:hover {
      color: #1a73e8;
    }
  }
}

.editable-content-form {
  display: flex;
  flex-direction: row;

  input {
    flex: 1;
    outline: none;
    border-radius: 1px;
    height: auto;
    padding: 4px 2px;
    background-color: transparent;
    border: 0;
    border-bottom: 1px solid #dcdfe6;
    color: #606266;
    display: inline-block;
    font-size: inherit;
    transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
    box-sizing: border-box;

    &:focus {
      border-color: #1a73e8
    }
  }

  .btn {
    display: inline-block;
    padding: 0;
    width: 30px;
    height: auto;
    color: #5e5e5e;
    outline: none;
    border: 0;
    cursor: pointer;
    border-radius: 1px;
    margin-left: 3px;
    background: transparent;

    &:hover {
      color: #1a73e8;
    }
  }

  .submit-btn {
    color: #67c23a;
  }

  .close-btn {
  }
}
</style>
