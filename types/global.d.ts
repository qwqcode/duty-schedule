import DataStore from '@/core/data-store'
import DataAction from '@/core/data-action'
import DataQuery from '@/core/data-query'
import DataFate from '@/core/data-fate'
import DataHelper from '@/DataHelper.vue'

declare module 'vue/types/vue' {
  interface Vue {
    $dataStore: DataStore
    $dataAction: DataAction
    $dataQuery: DataQuery
    $dataFate: DataFate
    $dataHelper: DataHelper
  }
}
