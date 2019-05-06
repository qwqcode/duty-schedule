<template>
  <div class="page group-list-page" :class="{ 'as-selector': !!asSelector }">

    <!--<div class="search">
      <el-input v-model="searchKeyWords" placeholder="搜索" autocomplete="off" clearable>
        <i slot="prefix" class="el-input__icon el-icon-search"></i>
      </el-input>
    </div>-->

    <el-row class="group-list">
      <el-col
        v-for="group in memberGroupList" :key="group.name"
        class="group-item"
        :class="{ 'is-selected': isGroupSelected(group) }"
        :span="6"
      >
        <div class="inner" @click="!!asSelector ? groupSelect(group) : null">
          <div class="group-title">
            <span class="group-title-text">{{ group.name }}</span>
            <span v-if="!!asSelector" class="select-btn">
              <i :class="!isGroupSelected(group) ? 'zmdi zmdi-circle' : 'zmdi zmdi-check-circle'"></i>
            </span>
          </div>
          <div class="group-work-info" v-html="getLastWorkInfo(group)"></div>
          <div class="item" v-for="member in group.data" :key="member">
            <div class="name" v-html="searchHighlight(member)"></div>
          </div>
        </div>
      </el-col>
    </el-row>

  </div>
</template>

<script>
  import _ from 'lodash'
  import { mapGetters } from 'vuex'

  export default {
    props: {
      asSelector: Boolean
    },
    data () {
      return {
        groupSelectedList: [],
        searchKeyWords: '',
        dataColor: {}
      }
    },
    computed: {
      memberGroupList () {
        return this.$store.state.Setting.memberGroupList
      },
      ...mapGetters('Setting', ['getTaskTypeGroupCount'])
    },
    methods: {
      /**
       * 选中 Group
       */
      groupSelect (group) {
        if (!this.isGroupSelected(group)) {
          // 若未选中
          this.groupSelectedList.push(group)
        } else {
          this.groupSelectedList.splice(this.groupSelectedList.indexOf(group), 1)
        }
      },

      getRandColor () {
        var colorElements = '0,1,2,3,4,5,6,7,8,9,a,b,c,d,e,f'
        var colorArray = colorElements.split(',')
        var color = '#'
        for (var i = 0; i < 6; i++) {
          color += colorArray[Math.floor(Math.random() * 16)]
        }
        return color
      },

      getLastWorkInfo (group) {
        let gpName = group.name
        let taskListSorted = _.sortBy(this.$store.state.Setting.taskList, (o) => -Number(o.time))
        let lastWorkArea = ''
        let lastWorkDate = ''
        _.forEach(taskListSorted, (task, key) => {
          _.forEach(task.memberGroupList, (groupItem) => {
            if (groupItem.name === gpName) {
              lastWorkArea = groupItem.taskTypeGroupName
              lastWorkDate = task.title
            }
          })
        })
        let color = this.dataColor[lastWorkDate] || (this.dataColor[lastWorkDate] = this.getRandColor())
        return `上次：${lastWorkArea} [${this.getTaskTypeGroupCount(lastWorkArea, gpName)}]<br/> <span style="background: ${color}" class="color-block"></span><span style="color: ${color}">${lastWorkDate}</span>`
      },

      /**
       * 判断 Group 是否选中
       */
      isGroupSelected (group) {
        return this.groupSelectedList.indexOf(group) > -1
      },

      /**
       * 搜索文字高亮
       */
      searchHighlight (text) {
        if (!this.searchKeyWords) {
          return text
        }
        let index = text.indexOf(this.searchKeyWords)
        if (index >= 0) {
          text = text.substring(0, index) + '<span style="color: red;font-weight: bold;">' + text.substring(index, index + text.length) + '</span>' + text.substring(index + text.length)
        }
        return text
      }
    },
    watch: {
      groupSelectedList (obj) {
        // 让 this.groupSelectedList 和父 v-model="XXX" 的 XXX 对象联动
        this.$emit('input', obj)
      }
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
        transition: all .2s linear;
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

      .group-work-info {
        line-height: 20px;
        padding: 5px 15px;
        margin: 15px 0 10px 0;
        font-size: 13px;
        background-color: rgba(66,133,244,0.12);
        border: 1px solid #d2e3fc;
        color: #1a73e8;
        border-radius: 4px;

        .color-block {
          display: inline-block;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          margin-right: 5px;
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
