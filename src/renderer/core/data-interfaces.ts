/**
 * 基本用语：
 * Plan 计划
 * Grp 小组
 * Person 小组成员
 * Area 工作区域
 * Task 工作任务类型
 * Rec 工作历史记录
 *
 * Plan = Grp + Area(By Rec) + Person + Task(By Rec)
 */

/**
 * 小组
 */
export interface Grp {
  id: number
  /** 成员名字列表 */
  personList: string[]
}

/**
 * 小组内工作次数记录
 */
export interface Rec {
  /** Rec 名 */
  name: string
  /** 类别 */
  type: 'Area'|'Task'
  /** 数据 */
  data: {[key: string]: number}
}

/**
 * 工作区域
 */
export interface Area {
  /** 区域名（例如：教室、公区） */
  name: string
  /** 工作类型列表 */
  taskList: string[]
}

/**
 * 计划
 */
export interface Plan {
  id: number
  /** 计划标题 */
  name: string
  /** 计划创建时间 */
  time: number
  /** 计划中的小组列表 */
  grpList: PlanGrp[]
}

/**
 * 计划中所包含的小组
 */
export interface PlanGrp {
  /** 小组 ID */
  grpId: number
  /** 小组工作区域 */
  area: string
  /** 个人任务列表 */
  personTaskList: PersonTaskItem[]
}

/**
 * 个人任务
 */
export interface PersonTaskItem {
  /** 人名 */
  person: string
  /** 任务名 */
  task: string
}

/**
 * 个人资料
 */
export interface PersonProfile {
  /** 人名 */
  name: string
  /** 最后一次执行的 Plan */
  lastWorkPlan: Plan|null
}
