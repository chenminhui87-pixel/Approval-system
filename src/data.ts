export type CategoryId = 'article' | 'computer'

export type UrgencyLevel = 'low' | 'medium' | 'high'

export type ApprovalStatus = 'pending' | 'approved' | 'rejected'

export interface ApprovalStep {
  id: string
  label: string
  description?: string
  approvers: string[]
  parallel?: boolean
  status: 'upcoming' | 'current' | 'completed' | 'error'
  approvedBy?: string[]
  approvedAt?: string
}

export interface Attachment {
  id: string
  name: string
  url: string
  type: 'image' | 'file'
  size: string
}

export interface ApprovalRecord {
  id: string
  category: CategoryId
  title: string
  applicant: string
  applicantAvatar?: string
  submittedAt: string
  urgency: UrgencyLevel
  status: ApprovalStatus
  currentStep: number
  steps: ApprovalStep[]
  fixedFields: { label: string; value: string }[]
  customFields: { label: string; value: string }[]
  attachments: Attachment[]
}

export const CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: 'article', label: '文章發布審核' },
  { id: 'computer', label: '電腦採購申請' },
]

export const MOCK_RECORDS: ApprovalRecord[] = [
  {
    id: 'REQ-2026-0001',
    category: 'article',
    title: '2026 年 Q2 產品發布公告',
    applicant: '黃建偉',
    submittedAt: '2026-05-28 14:32',
    urgency: 'high',
    status: 'pending',
    currentStep: 0,
    steps: [
      {
        id: 's1',
        label: '部門審核',
        approvers: ['陳美惠', '王大明'],
        parallel: true,
        status: 'current',
        approvedBy: ['王大明'],
      },
      {
        id: 's2',
        label: '法務審閱',
        approvers: ['張法務'],
        status: 'upcoming',
      },
      {
        id: 's3',
        label: '處長核准',
        approvers: ['林處長'],
        status: 'upcoming',
      },
    ],
    fixedFields: [
      { label: '單號', value: 'REQ-2026-0001' },
      { label: '申請時間', value: '2026-05-28 14:32' },
      { label: '緊急程度', value: '緊急' },
      { label: '申請者', value: '黃建偉' },
    ],
    customFields: [
      { label: '發布平台', value: '官網 / Medium / LinkedIn' },
      { label: '目標受眾', value: '企業客戶' },
      { label: '預計發布時間', value: '2026-06-01 09:00' },
    ],
    attachments: [
      { id: 'a1', name: '文章草稿.pdf', url: '#', type: 'file', size: '1.2 MB' },
      { id: 'a2', name: 'banner.png', url: '#', type: 'image', size: '340 KB' },
    ],
  },
  {
    id: 'REQ-2026-0002',
    category: 'computer',
    title: 'MacBook Pro 採購申請 × 3',
    applicant: '林志明',
    submittedAt: '2026-05-27 09:15',
    urgency: 'medium',
    status: 'pending',
    currentStep: 0,
    steps: [
      {
        id: 's1',
        label: '直屬主管',
        approvers: ['陳美惠'],
        status: 'current',
      },
      {
        id: 's2',
        label: '採購部門',
        approvers: ['採購王'],
        status: 'upcoming',
      },
      {
        id: 's3',
        label: '財務長',
        approvers: ['劉財務'],
        status: 'upcoming',
      },
    ],
    fixedFields: [
      { label: '單號', value: 'REQ-2026-0002' },
      { label: '申請時間', value: '2026-05-27 09:15' },
      { label: '緊急程度', value: '一般' },
      { label: '申請者', value: '林志明' },
    ],
    customFields: [
      { label: '規格', value: 'MacBook Pro 14" M4 Pro 24GB' },
      { label: '數量', value: '3 台' },
      { label: '預估金額', value: 'NT$ 210,000' },
      { label: '用途說明', value: '新進工程師設備配置' },
    ],
    attachments: [
      { id: 'a3', name: '報價單.pdf', url: '#', type: 'file', size: '892 KB' },
    ],
  },
  {
    id: 'REQ-2026-0003',
    category: 'article',
    title: '技術部落格：Tailwind v4 升級指南',
    applicant: '黃建偉',
    submittedAt: '2026-05-26 16:45',
    urgency: 'low',
    status: 'approved',
    currentStep: 2,
    steps: [
      {
        id: 's1',
        label: '部門審核',
        approvers: ['陳美惠', '王大明'],
        parallel: true,
        status: 'completed',
        approvedBy: ['陳美惠', '王大明'],
        approvedAt: '2026-05-27 10:00',
      },
      {
        id: 's2',
        label: '法務審閱',
        approvers: ['張法務'],
        status: 'completed',
        approvedBy: ['張法務'],
        approvedAt: '2026-05-27 14:30',
      },
      {
        id: 's3',
        label: '處長核准',
        approvers: ['林處長'],
        status: 'completed',
        approvedBy: ['林處長'],
        approvedAt: '2026-05-28 09:00',
      },
    ],
    fixedFields: [
      { label: '單號', value: 'REQ-2026-0003' },
      { label: '申請時間', value: '2026-05-26 16:45' },
      { label: '緊急程度', value: '一般' },
      { label: '申請者', value: '黃建偉' },
    ],
    customFields: [
      { label: '發布平台', value: '技術部落格' },
      { label: '目標受眾', value: '開發者社群' },
      { label: '預計發布時間', value: '2026-05-30 10:00' },
    ],
    attachments: [
      { id: 'a4', name: '文章草稿.md', url: '#', type: 'file', size: '45 KB' },
    ],
  },
  {
    id: 'REQ-2026-0004',
    category: 'computer',
    title: 'Dell 顯示器採購申請 × 5',
    applicant: '陳美惠',
    submittedAt: '2026-05-25 11:20',
    urgency: 'low',
    status: 'rejected',
    currentStep: 1,
    steps: [
      {
        id: 's1',
        label: '直屬主管',
        approvers: ['張主管'],
        status: 'completed',
        approvedBy: ['張主管'],
        approvedAt: '2026-05-25 14:00',
      },
      {
        id: 's2',
        label: '採購部門',
        approvers: ['採購王'],
        status: 'error',
      },
      {
        id: 's3',
        label: '財務長',
        approvers: ['劉財務'],
        status: 'upcoming',
      },
    ],
    fixedFields: [
      { label: '單號', value: 'REQ-2026-0004' },
      { label: '申請時間', value: '2026-05-25 11:20' },
      { label: '緊急程度', value: '一般' },
      { label: '申請者', value: '陳美惠' },
    ],
    customFields: [
      { label: '規格', value: 'Dell U2723D 27" 4K' },
      { label: '數量', value: '5 台' },
      { label: '預估金額', value: 'NT$ 87,500' },
      { label: '用途說明', value: '設計團隊換機' },
    ],
    attachments: [
      { id: 'a5', name: '報價單.pdf', url: '#', type: 'file', size: '654 KB' },
      { id: 'a6', name: '產品規格.png', url: '#', type: 'image', size: '210 KB' },
    ],
  },
]

export const CURRENT_USER = '陳美惠'

export function getTabRecords(
  tab: 'pending-me' | 'submitted' | 'signed',
  records: ApprovalRecord[],
  currentUser: string
): ApprovalRecord[] {
  if (tab === 'submitted') {
    return records.filter((r) => r.applicant === currentUser)
  }
  if (tab === 'signed') {
    return records.filter(
      (r) =>
        r.status !== 'pending' &&
        r.steps.some((s) => s.approvedBy?.includes(currentUser))
    )
  }
  // pending-me: 待我簽核 — 目前 step 有我且 status pending
  return records.filter(
    (r) =>
      r.status === 'pending' &&
      r.steps.some((s) => s.status === 'current' && s.approvers.includes(currentUser))
  )
}
