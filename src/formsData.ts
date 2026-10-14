// 表單管理模組(C)資料模型 — prototype。
// 角色(owner/admin/viewer)與欄位內容由「下游系統」透過介面指派/製作;簽核系統這邊
// 不提供管理角色的介面,只依「目前檢視身分」呈現對應角色能操作的功能(feature 完整度差異)。
import type { CategoryId } from './data'
import { CATEGORIES } from './data'

// ── 角色 ─────────────────────────────────────────────────────────────────────
export type FormRole = 'owner' | 'admin' | 'viewer'

export const FORM_ROLES: FormRole[] = ['owner', 'admin', 'viewer']

export const FORM_ROLE_LABEL: Record<FormRole, string> = {
  owner: 'Owner',
  admin: 'Admin',
  viewer: 'Viewer',
}
export const FORM_ROLE_DESC: Record<FormRole, string> = {
  owner: '擁有者 · 完整權限',
  admin: '管理者 · 可編輯內容與操作送審,不可刪表單',
  viewer: '檢視者 · 全唯讀',
}

// ── 權限矩陣(C 核心)──────────────────────────────────────────────────────────
// 已移除「管理協作者 / 轉移發起人」(由下游系統指派,不在本介面)。
export type FormAction =
  | 'viewForm' // 檢視表單內容 / 欄位
  | 'editForm' // 編輯表單內容 / 欄位
  | 'disableForm' // 停用 / 刪除表單
  | 'viewSubmissions' // 檢視送審清單 + 狀態
  | 'operateSubmission' // 對送審單操作 = 代理 applicant/approver 的全套動作
  //                      (轉寄 / 移交簽核者 / 退回 / 作廢 / 催辦 / 撤回…,同現有簽核 prototype)
  | 'createForm' // 建立新表單

const ROLE_CAN: Record<FormRole, FormAction[]> = {
  owner: ['viewForm', 'editForm', 'disableForm', 'viewSubmissions', 'operateSubmission', 'createForm'],
  admin: ['viewForm', 'editForm', 'viewSubmissions', 'operateSubmission', 'createForm'],
  viewer: ['viewForm', 'viewSubmissions'],
}

/** 目前檢視身分能否執行某動作(prototype 角色切換器驅動) */
export function can(role: FormRole, action: FormAction): boolean {
  return ROLE_CAN[role].includes(action)
}

// ── 表單 ─────────────────────────────────────────────────────────────────────
export type FormStatus = 'draft' | 'published' | 'disabled'

export const FORM_STATUS_LABEL: Record<FormStatus, string> = {
  draft: '草稿',
  published: '已發布',
  disabled: '已停用',
}
// Tag color（對齊 DS Tag color 語彙）
export const FORM_STATUS_COLOR: Record<FormStatus, 'green' | 'neutral' | 'yellow'> = {
  published: 'green',
  draft: 'yellow',
  disabled: 'neutral',
}

export type FormFieldType = 'string' | 'number' | 'currency' | 'date' | 'select' | 'textarea'

export const FIELD_TYPE_LABEL: Record<FormFieldType, string> = {
  string: '單行文字',
  textarea: '多行文字',
  number: '數字',
  currency: '金額',
  date: '日期',
  select: '下拉選單',
}

export interface FormField {
  label: string
  type: FormFieldType
  required: boolean
  options?: string[]
}

export interface ManagedForm {
  id: string
  name: string
  category: CategoryId
  status: FormStatus
  /** 下游系統指派的 owner（顯示用） */
  owner: string
  updatedAt: string
  /** 累計以此表單送出的審核數 */
  submissionCount: number
  /** 其中仍簽核中 */
  pendingCount: number
  fields: FormField[]
}

export function categoryLabel(id: CategoryId): string {
  return CATEGORIES.find((c) => c.id === id)?.label ?? id
}

export const MOCK_FORMS: ManagedForm[] = [
  {
    id: 'FORM-EXP-01',
    name: '一般費用報銷單',
    category: 'expense',
    status: 'published',
    owner: '陳美惠',
    updatedAt: '2026-09-28',
    submissionCount: 142,
    pendingCount: 14,
    fields: [
      { label: '費用類別', type: 'select', required: true, options: ['差旅', '餐費', '辦公用品', '其他'] },
      { label: '金額', type: 'currency', required: true },
      { label: '發生日期', type: 'date', required: true },
      { label: '用途說明', type: 'textarea', required: true },
    ],
  },
  {
    id: 'FORM-TRV-01',
    name: '國內出差申請單',
    category: 'travel',
    status: 'published',
    owner: '周總監',
    updatedAt: '2026-09-15',
    submissionCount: 58,
    pendingCount: 6,
    fields: [
      { label: '出差地點', type: 'string', required: true },
      { label: '起訖日期', type: 'date', required: true },
      { label: '預估費用', type: 'currency', required: true },
      { label: '出差事由', type: 'textarea', required: true },
    ],
  },
  {
    id: 'FORM-VAC-01',
    name: '請假申請單',
    category: 'vacation',
    status: 'published',
    owner: '人資專員',
    updatedAt: '2026-08-30',
    submissionCount: 230,
    pendingCount: 9,
    fields: [
      { label: '假別', type: 'select', required: true, options: ['特休', '病假', '事假', '婚假', '喪假'] },
      { label: '起訖時間', type: 'date', required: true },
      { label: '代理人', type: 'string', required: true },
      { label: '備註', type: 'textarea', required: false },
    ],
  },
  {
    id: 'FORM-CPU-01',
    name: '電腦設備採購申請單',
    category: 'computer',
    status: 'published',
    owner: '林志明',
    updatedAt: '2026-09-20',
    submissionCount: 37,
    pendingCount: 5,
    fields: [
      { label: '設備規格', type: 'string', required: true },
      { label: '數量', type: 'number', required: true },
      { label: '預估金額', type: 'currency', required: true },
      { label: '用途說明', type: 'textarea', required: true },
    ],
  },
  {
    id: 'FORM-TRN-01',
    name: '教育訓練報名單',
    category: 'training',
    status: 'draft',
    owner: '人資助理',
    updatedAt: '2026-10-05',
    submissionCount: 0,
    pendingCount: 0,
    fields: [
      { label: '課程名稱', type: 'string', required: true },
      { label: '上課日期', type: 'date', required: true },
      { label: '費用', type: 'currency', required: false },
    ],
  },
  {
    id: 'FORM-ART-01',
    name: '文章發布審核單（舊版）',
    category: 'article',
    status: 'disabled',
    owner: '黃建偉',
    updatedAt: '2026-06-10',
    submissionCount: 86,
    pendingCount: 0,
    fields: [
      { label: '標題', type: 'string', required: true },
      { label: '發布平台', type: 'select', required: true, options: ['官網', 'Medium', 'LinkedIn'] },
      { label: '內文', type: 'textarea', required: true },
    ],
  },
]
