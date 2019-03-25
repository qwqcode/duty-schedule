<template>
  <div class="page setting-page">
    <div class="setting-list">
      <div class="page-title">Settings</div>

      <div class="setting-card" v-for="(storeLabel, storeKey) in dataEditorCardList" :key="storeKey">
        <div class="title">{{ storeLabel }}</div>
        <div class="inner">
          <div class="setting-item">
            <div class="buttons">
              <template v-for="(item, key) in $store.state[storeKey]">
                <el-button size="small" :key="key" v-if="typeof item === 'object'" @click="toggleDataEditor(storeKey, key)">{{ key }}</el-button>
              </template>
              <el-button size="small" @click="toggleDataEditor(storeKey, '__ALL__')">__ALL__</el-button>
            </div>
          </div>
          <div class="setting-item" v-if="dataEditorTargetKey !== null && dataEditorStoreKey === storeKey">
            <div class="field">
              <el-input type="textarea" :rows="5" :placeholder="`编辑 ${storeKey}.${dataEditorTargetKey} 数据`" v-model="dataEditorVal"></el-input>
            </div>
            <el-button type="success" size="mini" @click="dataEditorSave"><i class="zmdi zmdi-save"></i> 保存</el-button>
          </div>
        </div>
      </div>

      <div class="setting-card">
        <div class="title">其他操作</div>
        <div class="inner">
          <div class="setting-item">
            <div class="buttons">
              <el-button size="small" @click="syncTaskTypeCountList()">同步 taskTypeCountList</el-button>
              <el-button size="small" @click="syncTaskTypeGroupCountList()">同步 taskTypeGroupCountList</el-button>
              <el-button size="small" @click="openDevTools()">打开调试工具</el-button>
              <el-button size="small" @click="deleteVuexStoreData()" ref="deleteVuexStoreDataBtn">清除所有内容和设定</el-button>
            </div>
          </div>
        </div>
      </div>

      <div class="setting-card" style="text-align: center;">
        <img src="../assets/icon.png" width="60px" height="60px">
        <br/><br/>
        <b style="font-size: 1.4em;">值日任务表 v{{ version }}</b>
        <br/><br/>© 2019 <span @click="openBlog()" style="cursor: pointer;color: #1a73e8">qwqaq.com</span>
      </div>

    </div>
  </div>
</template>

<script>
  import { ipcRenderer, shell } from 'electron'

  export default {
    mounted () {
      if (typeof window.SETTING_DATA_ALLOW_EDIT === 'undefined') {
        window.SETTING_DATA_ALLOW_EDIT = false
      }
    },
    data () {
      return {
        dataEditorCardList: {
          'Setting': '基础设置'
        },
        dataEditorStoreKey: null,
        dataEditorTargetKey: null,
        dataEditorVal: ''
      }
    },
    methods: {
      isDataAllowEdit () {
        if (typeof window.SETTING_DATA_ALLOW_EDIT !== 'boolean' || window.SETTING_DATA_ALLOW_EDIT !== true) {
          window.notify('没有权限修改数据', 'w')
          console.log('[window.SETTING_DATA_ALLOW_EDIT]')
          return false
        } else {
          return true
        }
      },
      toggleDataEditor (storeKey, targetKey) {
        if (!this.isDataAllowEdit()) {
          return
        }

        if (this.dataEditorStoreKey === storeKey && this.dataEditorTargetKey === targetKey) {
          this.dataEditorStoreKey = null
          this.dataEditorTargetKey = null
          this.dataEditorVal = ''
          return
        }

        let jsonObj = {}
        if (targetKey === '__ALL__') {
          let allJson = {}
          for (let key in this.$store.state[storeKey]) {
            allJson[key] = this.$store.state[storeKey][key]
          }
          jsonObj = allJson
        } else {
          jsonObj = this.$store.state[storeKey][targetKey]
        }

        this.dataEditorVal = JSON.stringify(jsonObj, null, (targetKey !== '__ALL__') ? '  ' : undefined)
        this.dataEditorStoreKey = storeKey
        this.dataEditorTargetKey = targetKey
      },
      dataEditorSave () {
        if (!this.isDataAllowEdit()) {
          return
        }

        let storeKey = this.dataEditorStoreKey
        let targetKey = this.dataEditorTargetKey
        if (storeKey !== null && targetKey !== null) {
          let mutationName = `${storeKey}/SET_${storeKey.toUpperCase()}`
          if (targetKey === '__ALL__') {
            let obj = JSON.parse(this.dataEditorVal)
            for (let key in obj) {
              this.$store.commit(mutationName, [key, obj[key]])
            }
          } else {
            this.$store.commit(mutationName, [targetKey, JSON.parse(this.dataEditorVal)])
          }
        }
      },
      syncTaskTypeCountList () {
        this.$store.dispatch('Setting/syncTaskTypeCount')
        window.notify('已同步 taskTypeCountList')
      },
      syncTaskTypeGroupCountList () {
        this.$store.dispatch('Setting/syncTaskTypeGroupCount')
        window.notify('已同步 taskTypeGroupList')
      },
      deleteVuexStoreData (evt) {
        if (!this.isDataAllowEdit()) {
          return
        }

        let el = this.$refs.deleteVuexStoreDataBtn
        if (typeof el.clickTime !== 'number') {
          el.clickTime = 1
        } else {
          el.clickTime++
        }
        if (el.clickTime < 5) {
          window.notify('危险操作，请再点 ' + (5 - el.clickTime) + ' 次', 'e')
        } else {
          ipcRenderer.send('delete-vuex-store-data')
        }
      },
      openDevTools (evt) {
        ipcRenderer.send('open-dev-tools')
      },
      openBlog () {
        shell.openExternal('https://qwqaq.com')
      }
    },
    computed: {
      version () {
        return require('../../../package.json').version
      }
    },
    watch: {
    }
  }
</script>

<style scoped lang="scss">
.setting-page {
  .setting-list {
    max-width: 80%;
    margin: 0 auto;

    .setting-card {
      padding: 20px;
      background: rgba(255, 255, 255, 0.92);

      &:not(:last-child) {
        margin-bottom: 10px;
      }

      .title {
        font-size: 1.4em;
        font-weight: bold;
        margin-bottom: 15px;
      }

      .setting-item {
        &:not(:last-child) {
          margin-bottom: 10px;
        }
      }
    }


  }
}
</style>
