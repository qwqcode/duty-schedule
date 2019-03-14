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
              <el-button size="small" @click="deleteVuexStoreData()">清除所有内容和设定</el-button>
            </div>
          </div>
        </div>
      </div>

      <div class="setting-card">
        <div class="title">版本信息</div>
        **预发布版本**
      </div>

    </div>
  </div>
</template>

<script>
  import { ipcRenderer } from 'electron'

  export default {
    mounted () {
    },
    data () {
      return {
        dataEditorCardList: {
          'Setting': '基础设置',
          'Schedule': '值日日程表'
        },
        dataEditorStoreKey: null,
        dataEditorTargetKey: null,
        dataEditorVal: ''
      }
    },
    methods: {
      toggleDataEditor (storeKey, targetKey) {
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
      deleteVuexStoreData () {
        ipcRenderer.send('delete-vuex-store-data')
      }
    },
    watch: {
    }
  }
</script>

<style scoped lang="scss">
.setting-page {
  .setting-list {
    max-width: 70%;
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
