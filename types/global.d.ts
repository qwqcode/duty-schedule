import DataStore from '@/core/data-store'
import DataAction from '@/core/data-action'
import DataQuery from '@/core/data-query'
import DataFate from '@/core/data-fate'
import DataHelper from '@/services/DataHelper.vue'
import PersonProfile from '@/services/PersonProfile.vue'
import PersonTaskChart from '@/services/PersonTaskChart.vue'
import Permission from '@/services/Permission.vue'

declare module 'vue/types/vue' {
  interface Vue {
    $marked: (src: string, callback?: (error: any, parseResult: string) => void) => string
    $dataStore: DataStore
    $dataAction: DataAction
    $dataQuery: DataQuery
    $dataFate: DataFate
    $dataHelper: DataHelper
    $personProfile: PersonProfile
    $personTaskChart: PersonTaskChart
    $permission: Permission
  }
}

declare global {
  interface Window {
    notify(message: string, level?: string, timeout?: number): void
    test: any
  }
}
