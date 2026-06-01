export type CategoryId = 'article' | 'computer'

export type UrgencyLevel = 'low' | 'medium' | 'high'

export type ApprovalStatus = 'pending' | 'approved' | 'rejected'

export type AvatarColor =
  | 'neutral' | 'blue' | 'red' | 'green' | 'yellow' | 'turquoise' | 'purple' | 'magenta' | 'indigo'

export type PersonStatus = 'signed' | 'pending' | 'rejected'

export interface ApprovalPerson {
  name: string
  avatarColor?: AvatarColor
  status: PersonStatus
  signedAt?: string
  comment?: string
}

/** single = 單簽 / parallel-any = 平簽（任一人即過）/ parallel-all = 並簽（全員必簽）*/
export type StepMode = 'single' | 'parallel-any' | 'parallel-all'

export interface ApprovalStep {
  id: string
  label: string
  description?: string
  /** kept for backwards compat with simple Steps */
  approvers: string[]
  parallel?: boolean
  status: 'upcoming' | 'current' | 'completed' | 'error'
  approvedBy?: string[]
  approvedAt?: string
  /** new — used by ApprovalRoute */
  mode?: StepMode
  people?: ApprovalPerson[]
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
        id: 's0',
        label: '起草',
        approvers: ['黃建偉'],
        status: 'completed',
        approvedBy: ['黃建偉'],
        approvedAt: '2026-05-28 14:32',
        mode: 'single',
        people: [
          {
            name: '黃建偉',
            avatarColor: 'green',
            status: 'signed',
            signedAt: '05-28 14:32',
            comment: '本季 Q2 主打方案的對外公告稿，已附帶 banner 與發布平台清單，麻煩各位審閱。',
          },
        ],
      },
      {
        id: 's1',
        label: '部門審核',
        approvers: ['陳美惠', '王大明'],
        parallel: true,
        status: 'current',
        approvedBy: ['王大明'],
        mode: 'parallel-all',
        people: [
          {
            name: '王大明',
            avatarColor: 'blue',
            status: 'signed',
            signedAt: '05-29 09:12',
            comment: '內容方向 OK，但第三段 KPI 數字請對齊財務上週公告的版本，避免不一致。',
          },
          {
            name: '陳美惠',
            avatarColor: 'neutral',
            status: 'pending',
          },
        ],
      },
      {
        id: 's2',
        label: '法務審閱',
        approvers: ['張法務', '林法務'],
        status: 'upcoming',
        mode: 'parallel-any',
        people: [
          { name: '張法務', avatarColor: 'neutral', status: 'pending' },
          { name: '林法務', avatarColor: 'neutral', status: 'pending' },
        ],
      },
      {
        id: 's3',
        label: '處長核准',
        approvers: ['林處長'],
        status: 'upcoming',
        mode: 'single',
        people: [{ name: '林處長', avatarColor: 'neutral', status: 'pending' }],
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
    id: 'REQ-2026-0005',
    category: 'article',
    title: '新版隱私權政策公告',
    applicant: '陳美惠',
    submittedAt: '2026-05-29 10:08',
    urgency: 'medium',
    status: 'pending',
    currentStep: 1,
    steps: [
      {
        id: 's1',
        label: '部門審核',
        approvers: ['王大明'],
        status: 'completed',
        approvedBy: ['王大明'],
        approvedAt: '2026-05-29 11:00',
      },
      {
        id: 's2',
        label: '法務審閱',
        approvers: ['張法務'],
        status: 'current',
      },
      {
        id: 's3',
        label: '處長核准',
        approvers: ['林處長'],
        status: 'upcoming',
      },
    ],
    fixedFields: [
      { label: '單號', value: 'REQ-2026-0005' },
      { label: '申請時間', value: '2026-05-29 10:08' },
      { label: '緊急程度', value: '一般' },
      { label: '申請者', value: '陳美惠' },
    ],
    customFields: [
      { label: '發布平台', value: '官網 / App' },
      { label: '目標受眾', value: '全體會員' },
      { label: '預計發布時間', value: '2026-06-05 00:00' },
    ],
    attachments: [
      { id: 'a7', name: '隱私權政策 v2.pdf', url: '#', type: 'file', size: '780 KB' },
    ],
  },
  {
    id: 'REQ-2026-0006',
    category: 'computer',
    title: 'iPad Pro 11" 採購申請 × 2',
    applicant: '林志明',
    submittedAt: '2026-05-20 09:00',
    urgency: 'low',
    status: 'approved',
    currentStep: 2,
    steps: [
      {
        id: 's1',
        label: '直屬主管',
        approvers: ['陳美惠'],
        status: 'completed',
        approvedBy: ['陳美惠'],
        approvedAt: '2026-05-20 14:20',
      },
      {
        id: 's2',
        label: '採購部門',
        approvers: ['採購王'],
        status: 'completed',
        approvedBy: ['採購王'],
        approvedAt: '2026-05-21 10:00',
      },
      {
        id: 's3',
        label: '財務長',
        approvers: ['劉財務'],
        status: 'completed',
        approvedBy: ['劉財務'],
        approvedAt: '2026-05-22 16:00',
      },
    ],
    fixedFields: [
      { label: '單號', value: 'REQ-2026-0006' },
      { label: '申請時間', value: '2026-05-20 09:00' },
      { label: '緊急程度', value: '低' },
      { label: '申請者', value: '林志明' },
    ],
    customFields: [
      { label: '規格', value: 'iPad Pro 11" M4 256GB' },
      { label: '數量', value: '2 台' },
      { label: '預估金額', value: 'NT$ 68,000' },
      { label: '用途說明', value: '行銷團隊外出展演' },
    ],
    attachments: [
      { id: 'a8', name: '報價單.pdf', url: '#', type: 'file', size: '512 KB' },
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
  // pending-me: 待我簽核 — 目前 step 有我、status pending、且我還沒簽過
  return records.filter(
    (r) =>
      r.status === 'pending' &&
      r.steps.some(
        (s) =>
          s.status === 'current' &&
          s.approvers.includes(currentUser) &&
          !s.approvedBy?.includes(currentUser),
      ),
  )
}

// ── Action helpers — update record after approve/reject ─────────────────────
const now = () => {
  const d = new Date()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd} ${hh}:${mi}`
}

export function approveRecord(
  record: ApprovalRecord,
  user: string,
  comment?: string,
): ApprovalRecord {
  const ts = now()
  const steps = record.steps.map((s) => ({ ...s, people: s.people ? [...s.people] : undefined }))
  const currentIdx = steps.findIndex((s) => s.status === 'current')
  if (currentIdx < 0) return record
  const current = steps[currentIdx]
  const newApprovedBy = [...(current.approvedBy ?? []), user]
  current.approvedBy = newApprovedBy
  current.approvedAt = ts
  if (current.people) {
    current.people = current.people.map((p) =>
      p.name === user
        ? { ...p, status: 'signed' as const, signedAt: ts, comment: comment || p.comment }
        : p,
    )
  }
  const mode = current.mode ?? 'single'
  const requiredCount = mode === 'parallel-any' ? 1 : current.approvers.length
  const stepComplete = newApprovedBy.length >= requiredCount
  if (stepComplete) {
    current.status = 'completed'
    if (currentIdx + 1 < steps.length) {
      steps[currentIdx + 1].status = 'current'
      return { ...record, steps }
    }
    return { ...record, steps, status: 'approved' as const }
  }
  return { ...record, steps }
}

export function rejectRecord(
  record: ApprovalRecord,
  user: string,
  comment: string,
): ApprovalRecord {
  const ts = now()
  const steps = record.steps.map((s) => ({ ...s, people: s.people ? [...s.people] : undefined }))
  const currentIdx = steps.findIndex((s) => s.status === 'current')
  if (currentIdx >= 0) {
    steps[currentIdx].status = 'error'
    steps[currentIdx].approvedAt = ts
    if (steps[currentIdx].people) {
      steps[currentIdx].people = steps[currentIdx].people!.map((p) =>
        p.name === user
          ? { ...p, status: 'rejected' as const, signedAt: ts, comment }
          : p,
      )
    }
  }
  return { ...record, steps, status: 'rejected' as const }
}
