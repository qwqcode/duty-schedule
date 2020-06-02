import { LoDashStatic } from 'lodash'
import { DutyScheduleCoreInterface } from 'duty-schedule-core'
import DutyHelper from '@/services/DutyHelper.vue'
import PersonProfile from '@/services/PersonProfile.vue'
import PersonTaskChart from '@/services/PersonTaskChart.vue'
import Permission from '@/services/Permission.vue'

declare module 'vue/types/vue' {
  interface Vue {
    _: LoDashStatic
    $marked: (src: string, callback?: (error: any, parseResult: string) => void) => string
    $dutyHelper: DutyHelper
    $personProfile: PersonProfile
    $personTaskChart: PersonTaskChart
    $permission: Permission
    $duty: DutyScheduleCoreInterface
  }
}

declare global {
  interface Window {
    notify(message: string, level?: string, timeout?: number): void
    test: any
  }
}
