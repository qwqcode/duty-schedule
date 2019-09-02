<template>
  <div>
    <component v-for="key in componentKeys" :is="key" :key="key"></component>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Prop, Watch, Component } from 'vue-property-decorator'
import DataStore from '@/core/data-store'
import DataAction from '@/core/data-action'
import DataQuery from '@/core/data-query'
import DataFate from '@/core/data-fate'

const components = {
  DataStore,
  DataAction,
  DataQuery,
  DataFate
}

@Component({ components })
export default class DataHelper extends Vue {
  get componentKeys () {
    return Object.keys(components)
  }

  created () {
  }
}
</script>

