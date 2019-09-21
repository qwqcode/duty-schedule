<template>
  <div class="page group-list-page" :class="{ 'as-selector': !!asSelector }">
    <div class="search">
      <el-input v-model="searchKeyWords" placeholder="搜索" autocomplete="off" clearable>
        <i slot="prefix" class="el-input__icon el-icon-search"></i>
      </el-input>
    </div>

    <el-row class="group-list">
      <el-col
        v-for="grp in grpList"
        :key="grp.id"
        class="group-item"
        :class="{ 'is-selected': isGrpSelected(grp) }"
        :span="6"
      >
        <div class="inner" @click="!!asSelector ? selectGrp(grp) : null">
          <div class="group-title">
            <span class="group-title-text">第 {{ grp.id }} 组</span>
            <span v-if="!!asSelector" class="select-btn">
              <i :class="!isGrpSelected(grp) ? 'zmdi zmdi-circle' : 'zmdi zmdi-check-circle'"></i>
            </span>
          </div>
          <div class="item" v-for="person in grp.personList" :key="person">
            <div class="name" @click="$personProfile.open(person)" v-html="searchHighlight(person)"></div>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts">
import _ from 'lodash'
import Vue from 'vue'
import { Prop, Watch, Component } from 'vue-property-decorator'
import Dialog from '../components/Dialog.vue'
import { Grp } from '../core/data-interfaces'

@Component({
  components: { Dialog }
})
export default class GrpList extends Vue {
  grpSelList: Grp[] = []
  searchKeyWords: string = ''

  profileDialog = {
    personName: ''
  }

  @Prop() readonly asSelector!: boolean

  mounted () {
  }

  get grpList() {
    return this.$dataStore.GrpList
  }

  @Watch('grpSelList')
  onGrpSelListChanged(obj: Grp[]) {
    // 让 this.groupSelectedList 和父 v-model="XXX" 的 XXX 对象联动
    this.$emit('input', obj)
  }

  /**
   * 选中 Group
   */
  selectGrp(grp: Grp) {
    if (!this.isGrpSelected(grp)) {
      // 若未选中
      this.grpSelList.push(grp)
    } else {
      this.grpSelList.splice(this.grpSelList.indexOf(grp), 1)
    }
  }

  /**
   * 判断 Group 是否选中
   */
  isGrpSelected(grp: Grp) {
    return this.grpSelList.indexOf(grp) > -1
  }

  /**
   * 搜索文字高亮
   */
  searchHighlight(text: string) {
    if (!this.searchKeyWords) {
      return text
    }
    let index = text.indexOf(this.searchKeyWords)
    if (index >= 0) {
      text =
        text.substring(0, index) +
        '<span style="color: red;font-weight: bold;">' +
        text.substring(index, index + text.length) +
        '</span>' +
        text.substring(index + text.length)
    }
    return text
  }
}
</script>

<style lang="scss">
.group-list-page {
  .search {
    padding: 0 14px 0 14px;

    input {
      border-radius: 0;
    }
  }

  .group-list {
    margin-left: 0;
    margin-right: 0;
    margin-top: 0;
    padding: 10px;
    padding-top: 5px;

    .group-item {
      padding: 0.3rem;
      border-radius: 4px;

      & > .inner {
        background: rgba(255, 255, 255, 0.82);
        padding: 20px;
        padding-top: 15px;
        transition: all 0.2s linear;
        border: 3px solid transparent;
      }

      .group-title {
        font-size: 1.2em;
        border-left: 2px solid #1a73e8;
        padding-left: 30px;
        margin-left: -25px;
        margin-bottom: 10px;
        color: #1a73e8;
        position: relative;

        & > .select-btn {
          position: absolute;
          right: 0;
          top: 0;

          & > i {
            color: rgb(190, 190, 190);
          }
        }
      }

      &.is-selected {
        & > .inner {
          border: 3px solid rgba(35, 209, 96, 0.85);
        }

        .select-btn > i {
          color: rgba(35, 209, 96, 0.85);
        }
      }

      .item {
        padding: 5px 10px;

        .name {
          cursor: pointer;

          &:hover {
            color: #1a73e8;
          }
        }
      }
    }
  }

  &.as-selector .group-list .group-item {
    & > .inner {
      cursor: pointer;

      &:hover {
        transform: translate3d(0, -4px, 0);
        box-shadow: 0 2px 15px rgba(0, 0, 0, 0.1);
      }
    }
  }
}
</style>
