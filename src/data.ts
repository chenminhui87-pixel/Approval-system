export type CategoryId =
  | 'article'
  | 'computer'
  | 'expense'
  | 'travel'
  | 'vacation'
  | 'recruit'
  | 'training'

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
  dueDate?: string
  agents?: string[]
  /** 副本給我:被加為副本（CC）知會的人,非簽核者、非申請者 */
  copiedTo?: string[]
}

export const CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: 'article', label: '文章發布審核' },
  { id: 'expense', label: '費用報銷' },
  { id: 'vacation', label: '請假申請' },
  { id: 'recruit', label: '人力招募' },
  { id: 'training', label: '教育訓練' },
  { id: 'computer', label: '電腦採購申請' },
  { id: 'travel', label: '出差申請' },
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
    dueDate: '2026-06-20',
  },
  {
    id: 'REQ-2026-0002',
    copiedTo: ['陳美惠'],
    category: 'computer',
    title: 'MacBook Pro 採購申請 × 3',
    applicant: '林志明',
    submittedAt: '2026-06-11 09:15',
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
      { label: '申請時間', value: '2026-06-11 09:15' },
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
    agents: ['採購協辦'],
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
    submittedAt: '2026-06-11 09:00',
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
        approvedAt: '2026-06-11 14:20',
      },
      {
        id: 's2',
        label: '採購部門',
        approvers: ['採購王'],
        status: 'completed',
        approvedBy: ['採購王'],
        approvedAt: '2026-06-12 10:00',
      },
      {
        id: 's3',
        label: '財務長',
        approvers: ['劉財務'],
        status: 'completed',
        approvedBy: ['劉財務'],
        approvedAt: '2026-06-13 16:00',
      },
    ],
    fixedFields: [
      { label: '單號', value: 'REQ-2026-0006' },
      { label: '申請時間', value: '2026-06-11 09:00' },
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
    submittedAt: '2026-06-11 11:20',
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
        approvedAt: '2026-06-11 14:00',
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
      { label: '申請時間', value: '2026-06-11 11:20' },
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
  {
    id: 'REQ-2026-0007',
    category: 'expense',
    title: '5 月份客戶招待餐費報銷',
    applicant: '陳美惠',
    submittedAt: '2026-06-14 16:20',
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
        label: '財務複核',
        approvers: ['財務美'],
        status: 'upcoming',
      },
    ],
    fixedFields: [
      { label: '單號', value: 'REQ-2026-0007' },
      { label: '申請時間', value: '2026-06-14 16:20' },
      { label: '緊急程度', value: '一般' },
      { label: '申請者', value: '陳美惠' },
    ],
    customFields: [
      { label: '報銷類別', value: '客戶招待' },
      { label: '報銷金額', value: 'NT$ 8,640' },
      { label: '消費日期', value: '2026-05-22' },
      { label: '備註', value: '與 Acme 客戶用餐 4 人，已附發票' },
    ],
    attachments: [
      { id: 'a9', name: '發票 INV-0522.pdf', url: '#', type: 'file', size: '320 KB' },
    ],
    dueDate: '2026-06-18',
  },
  {
    id: 'REQ-2026-0008',
    copiedTo: ['陳美惠'],
    category: 'travel',
    title: '日本東京 6/15-6/18 客戶拜訪出差',
    applicant: '黃建偉',
    submittedAt: '2026-06-11 11:40',
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
        label: '部門主管',
        approvers: ['周總監'],
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
      { label: '單號', value: 'REQ-2026-0008' },
      { label: '申請時間', value: '2026-06-11 11:40' },
      { label: '緊急程度', value: '一般' },
      { label: '申請者', value: '黃建偉' },
    ],
    customFields: [
      { label: '出差地點', value: '日本 東京' },
      { label: '出差期間', value: '2026-06-15 ~ 2026-06-18（4 天）' },
      { label: '預估總費用', value: 'NT$ 85,000' },
      { label: '出差目的', value: '與 Sony 客戶面對面討論 Q3 合約細節' },
    ],
    attachments: [
      { id: 'a10', name: '行程規劃.pdf', url: '#', type: 'file', size: '480 KB' },
    ],
  },
  {
    id: 'REQ-2026-0009',
    category: 'vacation',
    title: '年假申請 6/10-6/14',
    applicant: '林志明',
    submittedAt: '2026-05-28 17:55',
    urgency: 'low',
    status: 'approved',
    currentStep: 1,
    steps: [
      {
        id: 's1',
        label: '直屬主管',
        approvers: ['陳美惠'],
        status: 'completed',
        approvedBy: ['陳美惠'],
        approvedAt: '2026-05-29 09:30',
      },
      {
        id: 's2',
        label: '人資備案',
        approvers: ['人資李'],
        status: 'completed',
        approvedBy: ['人資李'],
        approvedAt: '2026-05-29 14:00',
      },
    ],
    fixedFields: [
      { label: '單號', value: 'REQ-2026-0009' },
      { label: '申請時間', value: '2026-05-28 17:55' },
      { label: '緊急程度', value: '低' },
      { label: '申請者', value: '林志明' },
    ],
    customFields: [
      { label: '請假類別', value: '年假' },
      { label: '請假期間', value: '2026-06-10 ~ 2026-06-14（5 天）' },
      { label: '代理人', value: '黃建偉' },
      { label: '備註', value: '回鄉探親' },
    ],
    attachments: [],
    agents: ['黃建偉'],
  },
  {
    id: 'REQ-2026-0010',
    copiedTo: ['陳美惠'],
    category: 'recruit',
    title: '前端工程師招募職缺開放',
    applicant: '周總監',
    submittedAt: '2026-06-16 13:10',
    urgency: 'medium',
    status: 'pending',
    currentStep: 1,
    steps: [
      {
        id: 's1',
        label: '部門主管',
        approvers: ['周總監'],
        status: 'completed',
        approvedBy: ['周總監'],
        approvedAt: '2026-05-27 13:10',
      },
      {
        id: 's2',
        label: '人資審核',
        approvers: ['陳美惠'],
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
      { label: '單號', value: 'REQ-2026-0010' },
      { label: '申請時間', value: '2026-05-27 13:10' },
      { label: '緊急程度', value: '一般' },
      { label: '申請者', value: '周總監' },
    ],
    customFields: [
      { label: '職稱', value: '資深前端工程師' },
      { label: '部門', value: '產品研發部' },
      { label: '招募名額', value: '2 人' },
      { label: '薪資級距', value: 'NT$ 80,000 ~ 120,000' },
      { label: '到職期望', value: '2026-08 起' },
    ],
    attachments: [
      { id: 'a11', name: '職務說明書.pdf', url: '#', type: 'file', size: '210 KB' },
    ],
    dueDate: '2026-07-01',
    agents: ['人資專員', '人資助理'],
  },
  {
    id: 'REQ-2026-0011',
    category: 'expense',
    title: '差旅交通費報銷',
    applicant: '黃建偉',
    submittedAt: '2026-05-24 10:05',
    urgency: 'low',
    status: 'rejected',
    currentStep: 0,
    steps: [
      {
        id: 's1',
        label: '直屬主管',
        approvers: ['陳美惠'],
        status: 'error',
        approvedBy: ['陳美惠'],
        approvedAt: '2026-05-24 15:00',
      },
      {
        id: 's2',
        label: '財務複核',
        approvers: ['財務美'],
        status: 'upcoming',
      },
    ],
    fixedFields: [
      { label: '單號', value: 'REQ-2026-0011' },
      { label: '申請時間', value: '2026-05-24 10:05' },
      { label: '緊急程度', value: '低' },
      { label: '申請者', value: '黃建偉' },
    ],
    customFields: [
      { label: '報銷類別', value: '差旅交通' },
      { label: '報銷金額', value: 'NT$ 2,180' },
      { label: '消費日期', value: '2026-05-18' },
    ],
    attachments: [],
  },
  // ── badge demo: gray (no overdue, low urgency) ──────────────────────────────
  {
    id: 'REQ-2026-0012',
    category: 'vacation',
    title: '端午連假補休申請',
    applicant: '林志明',
    submittedAt: '2026-06-16 14:00',
    urgency: 'low',
    status: 'pending',
    currentStep: 0,
    steps: [
      { id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' },
      { id: 's2', label: '人資備案', approvers: ['人資李'], status: 'upcoming' },
    ],
    fixedFields: [
      { label: '單號', value: 'REQ-2026-0012' },
      { label: '申請時間', value: '2026-06-16 14:00' },
      { label: '緊急程度', value: '低' },
      { label: '申請者', value: '林志明' },
    ],
    customFields: [
      { label: '請假類別', value: '補休' },
      { label: '請假期間', value: '2026-06-19（1 天）' },
      { label: '代理人', value: '黃建偉' },
    ],
    attachments: [],
    dueDate: '2026-06-20',
    agents: ['黃建偉'],
  },
  // ── badge demo: urgent-no-overdue (red "緊急待審") ──────────────────────────
  {
    id: 'REQ-2026-0013',
    copiedTo: ['陳美惠'],
    category: 'training',
    title: '外部 AI 工作坊報名申請',
    applicant: '周總監',
    submittedAt: '2026-06-15 09:30',
    urgency: 'medium',
    status: 'pending',
    currentStep: 0,
    steps: [
      { id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' },
      { id: 's2', label: '預算審核', approvers: ['財務美'], status: 'upcoming' },
    ],
    fixedFields: [
      { label: '單號', value: 'REQ-2026-0013' },
      { label: '申請時間', value: '2026-06-15 09:30' },
      { label: '緊急程度', value: '一般' },
      { label: '申請者', value: '周總監' },
    ],
    customFields: [
      { label: '課程名稱', value: 'GenAI for Product Teams' },
      { label: '舉辦日期', value: '2026-06-20' },
      { label: '費用', value: 'NT$ 15,000' },
      { label: '報名截止', value: '2026-06-19' },
    ],
    attachments: [
      { id: 'a12', name: '課程說明.pdf', url: '#', type: 'file', size: '280 KB' },
    ],
  },
  // ── additional records for batch testing ────────────────────────────────────
  {
    id: 'REQ-2026-0014',
    category: 'article',
    title: '行銷部落格：6 月新功能介紹',
    applicant: '黃建偉',
    submittedAt: '2026-05-31 10:00',
    urgency: 'medium',
    status: 'pending',
    currentStep: 0,
    steps: [
      { id: 's1', label: '部門審核', approvers: ['陳美惠'], status: 'current' },
      { id: 's2', label: '處長核准', approvers: ['林處長'], status: 'upcoming' },
    ],
    fixedFields: [
      { label: '單號', value: 'REQ-2026-0014' },
      { label: '申請時間', value: '2026-05-31 10:00' },
      { label: '緊急程度', value: '一般' },
      { label: '申請者', value: '黃建偉' },
    ],
    customFields: [
      { label: '發布平台', value: '官網部落格' },
      { label: '目標受眾', value: '現有客戶' },
      { label: '預計發布時間', value: '2026-06-05 09:00' },
    ],
    attachments: [],
  },
  {
    id: 'REQ-2026-0015',
    category: 'article',
    title: '客戶案例分享：TechCorp 導入心得',
    applicant: '黃建偉',
    submittedAt: '2026-06-14 15:30',
    urgency: 'low',
    status: 'pending',
    currentStep: 0,
    steps: [
      { id: 's1', label: '部門審核', approvers: ['陳美惠'], status: 'current' },
      { id: 's2', label: '法務審閱', approvers: ['張法務'], status: 'upcoming' },
    ],
    fixedFields: [
      { label: '單號', value: 'REQ-2026-0015' },
      { label: '申請時間', value: '2026-06-14 15:30' },
      { label: '緊急程度', value: '低' },
      { label: '申請者', value: '黃建偉' },
    ],
    customFields: [
      { label: '發布平台', value: '官網案例頁' },
      { label: '目標受眾', value: '潛在客戶' },
    ],
    attachments: [
      { id: 'a13', name: '案例稿件.docx', url: '#', type: 'file', size: '92 KB' },
    ],
  },
  {
    id: 'REQ-2026-0016',
    category: 'computer',
    title: 'Dell 鍵盤滑鼠組採購 × 10',
    applicant: '林志明',
    submittedAt: '2026-06-11 09:30',
    urgency: 'low',
    status: 'pending',
    currentStep: 0,
    steps: [
      { id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' },
      { id: 's2', label: '採購部門', approvers: ['採購王'], status: 'upcoming' },
    ],
    fixedFields: [
      { label: '單號', value: 'REQ-2026-0016' },
      { label: '申請時間', value: '2026-06-11 09:30' },
      { label: '緊急程度', value: '低' },
      { label: '申請者', value: '林志明' },
    ],
    customFields: [
      { label: '規格', value: 'Dell KM5221W 無線組' },
      { label: '數量', value: '10 組' },
      { label: '預估金額', value: 'NT$ 25,000' },
    ],
    attachments: [],
  },
  {
    id: 'REQ-2026-0017',
    category: 'computer',
    title: 'USB-C Hub 採購申請 × 6',
    applicant: '周總監',
    submittedAt: '2026-06-15 14:00',
    urgency: 'medium',
    status: 'pending',
    currentStep: 0,
    steps: [
      { id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' },
      { id: 's2', label: '採購部門', approvers: ['採購王'], status: 'upcoming' },
    ],
    fixedFields: [
      { label: '單號', value: 'REQ-2026-0017' },
      { label: '申請時間', value: '2026-06-15 14:00' },
      { label: '緊急程度', value: '一般' },
      { label: '申請者', value: '周總監' },
    ],
    customFields: [
      { label: '規格', value: 'CalDigit TS4 USB-C Hub' },
      { label: '數量', value: '6 台' },
      { label: '預估金額', value: 'NT$ 48,000' },
    ],
    attachments: [],
  },
  {
    id: 'REQ-2026-0018',
    category: 'expense',
    title: '展覽攤位布置費用報銷',
    applicant: '黃建偉',
    submittedAt: '2026-06-15 11:15',
    urgency: 'medium',
    status: 'pending',
    currentStep: 0,
    steps: [
      { id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' },
      { id: 's2', label: '財務複核', approvers: ['財務美'], status: 'upcoming' },
    ],
    fixedFields: [
      { label: '單號', value: 'REQ-2026-0018' },
      { label: '申請時間', value: '2026-06-15 11:15' },
      { label: '緊急程度', value: '一般' },
      { label: '申請者', value: '黃建偉' },
    ],
    customFields: [
      { label: '報銷類別', value: '展覽費用' },
      { label: '報銷金額', value: 'NT$ 32,000' },
      { label: '消費日期', value: '2026-05-28' },
    ],
    attachments: [
      { id: 'a14', name: '發票-展覽布置.pdf', url: '#', type: 'file', size: '415 KB' },
    ],
  },
  {
    id: 'REQ-2026-0025',
    category: 'expense',
    title: '2026 年上半年度全體員工教育訓練補助費用統一報銷申請',
    applicant: '王大明',
    submittedAt: '2026-06-14 10:30',
    urgency: 'medium',
    status: 'pending',
    currentStep: 0,
    steps: [
      { id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' },
      { id: 's2', label: '財務複核', approvers: ['財務美'], status: 'upcoming' },
    ],
    fixedFields: [
      { label: '單號', value: 'REQ-2026-0025' },
      { label: '申請時間', value: '2026-06-14 10:30' },
      { label: '緊急程度', value: '一般' },
      { label: '申請者', value: '王大明' },
    ],
    customFields: [
      { label: '報銷類別', value: '教育訓練補助' },
      { label: '報銷金額', value: 'NT$ 42,000' },
      { label: '適用期間', value: '2026-01-01 ~ 2026-06-30' },
    ],
    attachments: [],
  },
  {
    id: 'REQ-2026-0026',
    category: 'travel',
    title: '北美東岸多城市客戶拜訪暨年度夥伴峰會出差申請（紐約、波士頓、舊金山）',
    applicant: '周總監',
    submittedAt: '2026-06-11 09:00',
    urgency: 'medium',
    status: 'pending',
    currentStep: 0,
    steps: [
      { id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' },
      { id: 's2', label: '部門主管', approvers: ['周總監'], status: 'upcoming' },
      { id: 's3', label: '財務長', approvers: ['劉財務'], status: 'upcoming' },
    ],
    fixedFields: [
      { label: '單號', value: 'REQ-2026-0026' },
      { label: '申請時間', value: '2026-06-11 09:00' },
      { label: '緊急程度', value: '一般' },
      { label: '申請者', value: '周總監' },
    ],
    customFields: [
      { label: '出差地點', value: '美國 紐約、波士頓、舊金山' },
      { label: '出差期間', value: '2026-07-08 ~ 2026-07-16（9 天）' },
      { label: '預估總費用', value: 'NT$ 185,000' },
    ],
    attachments: [],
  },
  {
    id: 'REQ-2026-0019',
    category: 'expense',
    title: '辦公室文具耗材採購報銷',
    applicant: '林志明',
    submittedAt: '2026-06-17 09:00',
    urgency: 'low',
    status: 'pending',
    currentStep: 0,
    steps: [
      { id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' },
      { id: 's2', label: '財務複核', approvers: ['財務美'], status: 'upcoming' },
    ],
    fixedFields: [
      { label: '單號', value: 'REQ-2026-0019' },
      { label: '申請時間', value: '2026-06-17 09:00' },
      { label: '緊急程度', value: '低' },
      { label: '申請者', value: '林志明' },
    ],
    customFields: [
      { label: '報銷類別', value: '文具耗材' },
      { label: '報銷金額', value: 'NT$ 1,840' },
      { label: '消費日期', value: '2026-06-15' },
    ],
    attachments: [],
  },
  {
    id: 'REQ-2026-0020',
    category: 'travel',
    title: '台南客戶廠房巡查出差',
    applicant: '周總監',
    submittedAt: '2026-06-12 08:30',
    urgency: 'medium',
    status: 'pending',
    currentStep: 0,
    steps: [
      { id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' },
      { id: 's2', label: '財務長', approvers: ['劉財務'], status: 'upcoming' },
    ],
    fixedFields: [
      { label: '單號', value: 'REQ-2026-0020' },
      { label: '申請時間', value: '2026-06-12 08:30' },
      { label: '緊急程度', value: '一般' },
      { label: '申請者', value: '周總監' },
    ],
    customFields: [
      { label: '出差地點', value: '台南 仁德' },
      { label: '出差期間', value: '2026-06-25（1 天）' },
      { label: '預估總費用', value: 'NT$ 4,200' },
      { label: '出差目的', value: '客戶生產線現場稽查' },
    ],
    attachments: [],
  },
  {
    id: 'REQ-2026-0021',
    category: 'travel',
    title: '新加坡技術研討會出差',
    applicant: '黃建偉',
    submittedAt: '2026-06-16 10:00',
    urgency: 'medium',
    status: 'pending',
    currentStep: 0,
    steps: [
      { id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' },
      { id: 's2', label: '部門主管', approvers: ['周總監'], status: 'upcoming' },
      { id: 's3', label: '財務長', approvers: ['劉財務'], status: 'upcoming' },
    ],
    fixedFields: [
      { label: '單號', value: 'REQ-2026-0021' },
      { label: '申請時間', value: '2026-06-16 10:00' },
      { label: '緊急程度', value: '一般' },
      { label: '申請者', value: '黃建偉' },
    ],
    customFields: [
      { label: '出差地點', value: '新加坡' },
      { label: '出差期間', value: '2026-06-22 ~ 2026-06-25（4 天）' },
      { label: '預估總費用', value: 'NT$ 68,000' },
      { label: '出差目的', value: '參加 GovTech 2026 並拜訪合作夥伴' },
    ],
    attachments: [
      { id: 'a15', name: '研討會邀請函.pdf', url: '#', type: 'file', size: '320 KB' },
    ],
  },
  {
    id: 'REQ-2026-0022',
    category: 'vacation',
    title: '婚假申請（6/28–7/4）',
    applicant: '周總監',
    submittedAt: '2026-06-16 14:30',
    urgency: 'low',
    status: 'pending',
    currentStep: 0,
    steps: [
      { id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' },
      { id: 's2', label: '人資備案', approvers: ['人資李'], status: 'upcoming' },
    ],
    fixedFields: [
      { label: '單號', value: 'REQ-2026-0022' },
      { label: '申請時間', value: '2026-06-16 14:30' },
      { label: '緊急程度', value: '低' },
      { label: '申請者', value: '周總監' },
    ],
    customFields: [
      { label: '請假類別', value: '婚假' },
      { label: '請假期間', value: '2026-06-28 ~ 2026-07-04（7 天）' },
      { label: '代理人', value: '黃建偉' },
    ],
    attachments: [],
    dueDate: '2026-06-27',
    agents: ['黃建偉'],
  },
  {
    id: 'REQ-2026-0023',
    category: 'recruit',
    title: 'UX 設計師招募（1 名）',
    applicant: '黃建偉',
    submittedAt: '2026-06-15 09:45',
    urgency: 'medium',
    status: 'pending',
    currentStep: 0,
    steps: [
      { id: 's1', label: '人資審核', approvers: ['陳美惠'], status: 'current' },
      { id: 's2', label: '處長核准', approvers: ['林處長'], status: 'upcoming' },
    ],
    fixedFields: [
      { label: '單號', value: 'REQ-2026-0023' },
      { label: '申請時間', value: '2026-06-04 09:45' },
      { label: '緊急程度', value: '一般' },
      { label: '申請者', value: '黃建偉' },
    ],
    customFields: [
      { label: '職稱', value: 'UX/UI 設計師' },
      { label: '部門', value: '產品設計部' },
      { label: '招募名額', value: '1 人' },
      { label: '薪資級距', value: 'NT$ 60,000 ~ 85,000' },
      { label: '到職期望', value: '2026-09 起' },
    ],
    attachments: [
      { id: 'a16', name: '職務說明書.pdf', url: '#', type: 'file', size: '178 KB' },
    ],
  },
  {
    id: 'REQ-2026-0024',
    category: 'training',
    title: 'AWS 解決方案架構師認證申請',
    applicant: '林志明',
    submittedAt: '2026-06-13 11:00',
    urgency: 'medium',
    status: 'pending',
    currentStep: 0,
    steps: [
      { id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' },
      { id: 's2', label: '預算審核', approvers: ['財務美'], status: 'upcoming' },
    ],
    fixedFields: [
      { label: '單號', value: 'REQ-2026-0024' },
      { label: '申請時間', value: '2026-06-13 11:00' },
      { label: '緊急程度', value: '一般' },
      { label: '申請者', value: '林志明' },
    ],
    customFields: [
      { label: '課程名稱', value: 'AWS SAA-C03 認證考試' },
      { label: '考試日期', value: '2026-07-05' },
      { label: '費用', value: 'NT$ 9,000' },
    ],
    attachments: [],
  },

  // ── 補充記錄：各種標題長度 ──────────────────────────────────────────────────

  { id: 'REQ-2026-0027', category: 'expense', title: 'Q3 行銷預算調整申請', applicant: '林志明', submittedAt: '2026-06-15 10:00', urgency: 'low', status: 'pending', currentStep: 0,
    steps: [{ id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' }],
    fixedFields: [{ label: '單號', value: 'REQ-2026-0027' }, { label: '申請時間', value: '2026-06-15 10:00' }, { label: '緊急程度', value: '低' }, { label: '申請者', value: '林志明' }],
    customFields: [{ label: '調整金額', value: 'NT$ 12,000' }], attachments: [] },

  { id: 'REQ-2026-0028', category: 'travel', title: '年終考核差旅費報銷', applicant: '王大明', submittedAt: '2026-06-12 09:00', urgency: 'low', status: 'pending', currentStep: 0,
    steps: [{ id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' }],
    fixedFields: [{ label: '單號', value: 'REQ-2026-0028' }, { label: '申請時間', value: '2026-06-12 09:00' }, { label: '緊急程度', value: '低' }, { label: '申請者', value: '王大明' }],
    customFields: [{ label: '金額', value: 'NT$ 3,200' }], attachments: [] },

  { id: 'REQ-2026-0029', category: 'computer', title: '辦公桌椅人體工學升級採購', applicant: '黃建偉', submittedAt: '2026-06-11 14:00', urgency: 'low', status: 'pending', currentStep: 0,
    steps: [{ id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' }],
    fixedFields: [{ label: '單號', value: 'REQ-2026-0029' }, { label: '申請時間', value: '2026-06-11 14:00' }, { label: '緊急程度', value: '低' }, { label: '申請者', value: '黃建偉' }],
    customFields: [{ label: '數量', value: '3 套' }, { label: '金額', value: 'NT$ 27,000' }], attachments: [] },

  { id: 'REQ-2026-0030', category: 'vacation', title: '暑期親子假申請 7/21-7/25', applicant: '林志明', submittedAt: '2026-06-10 08:30', urgency: 'low', status: 'pending', currentStep: 0,
    steps: [{ id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' }],
    fixedFields: [{ label: '單號', value: 'REQ-2026-0030' }, { label: '申請時間', value: '2026-06-10 08:30' }, { label: '緊急程度', value: '低' }, { label: '申請者', value: '林志明' }],
    customFields: [{ label: '假別', value: '特休假' }, { label: '天數', value: '5 天' }], attachments: [] },

  { id: 'REQ-2026-0031', category: 'article', title: '產品官網 Q3 首頁改版內容審核與發布申請', applicant: '王大明', submittedAt: '2026-06-09 11:00', urgency: 'medium', status: 'pending', currentStep: 0,
    steps: [{ id: 's1', label: '內容審核', approvers: ['陳美惠'], status: 'current' }, { id: 's2', label: '法務確認', approvers: ['法務張'], status: 'upcoming' }],
    fixedFields: [{ label: '單號', value: 'REQ-2026-0031' }, { label: '申請時間', value: '2026-06-09 11:00' }, { label: '緊急程度', value: '一般' }, { label: '申請者', value: '王大明' }],
    customFields: [{ label: '發布平台', value: '官網首頁、Facebook、LinkedIn' }], attachments: [] },

  { id: 'REQ-2026-0032', category: 'expense', title: '前端開發團隊遠端工作設備升級採購計畫費用申請', applicant: '黃建偉', submittedAt: '2026-06-08 15:30', urgency: 'medium', status: 'pending', currentStep: 0,
    steps: [{ id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' }, { id: 's2', label: '財務審核', approvers: ['財務美'], status: 'upcoming' }],
    fixedFields: [{ label: '單號', value: 'REQ-2026-0032' }, { label: '申請時間', value: '2026-06-08 15:30' }, { label: '緊急程度', value: '一般' }, { label: '申請者', value: '黃建偉' }],
    customFields: [{ label: '採購項目', value: '顯示器、鍵盤、攝影機各 6 組' }, { label: '金額', value: 'NT$ 96,000' }], attachments: [] },

  { id: 'REQ-2026-0033', category: 'training', title: 'Google Cloud Professional Data Engineer 認證考試費用報銷', applicant: '林志明', submittedAt: '2026-06-12 09:30', urgency: 'low', status: 'pending', currentStep: 0,
    steps: [{ id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' }],
    fixedFields: [{ label: '單號', value: 'REQ-2026-0033' }, { label: '申請時間', value: '2026-06-07 09:30' }, { label: '緊急程度', value: '低' }, { label: '申請者', value: '林志明' }],
    customFields: [{ label: '考試日期', value: '2026-07-12' }, { label: '費用', value: 'NT$ 7,200' }], attachments: [] },

  { id: 'REQ-2026-0034', category: 'recruit', title: '資深後端工程師擴編招募申請（Java / Kotlin，2 名）', applicant: '王大明', submittedAt: '2026-06-14 10:00', urgency: 'high', status: 'pending', currentStep: 0,
    steps: [{ id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' }, { id: 's2', label: 'HR 審核', approvers: ['HR 李'], status: 'upcoming' }],
    fixedFields: [{ label: '單號', value: 'REQ-2026-0034' }, { label: '申請時間', value: '2026-06-06 10:00' }, { label: '緊急程度', value: '緊急' }, { label: '申請者', value: '王大明' }],
    customFields: [{ label: '職缺數', value: '2 名' }, { label: '預計到職', value: '2026-09-01' }], attachments: [] },

  { id: 'REQ-2026-0035', category: 'travel', title: '2026 年下半年度產品藍圖規劃工作坊暨客戶焦點座談出差費用報銷申請', applicant: '黃建偉', submittedAt: '2026-06-12 13:00', urgency: 'medium', status: 'pending', currentStep: 0,
    steps: [{ id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' }, { id: 's2', label: '財務長', approvers: ['劉財務'], status: 'upcoming' }],
    fixedFields: [{ label: '單號', value: 'REQ-2026-0035' }, { label: '申請時間', value: '2026-06-12 13:00' }, { label: '緊急程度', value: '一般' }, { label: '申請者', value: '黃建偉' }],
    customFields: [{ label: '出差地點', value: '高雄' }, { label: '天數', value: '2 天' }, { label: '金額', value: 'NT$ 8,400' }], attachments: [] },

  { id: 'REQ-2026-0036', category: 'vacation', title: '婚假申請', applicant: '林志明', submittedAt: '2026-06-04 09:00', urgency: 'low', status: 'pending', currentStep: 0,
    steps: [{ id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' }],
    fixedFields: [{ label: '單號', value: 'REQ-2026-0036' }, { label: '申請時間', value: '2026-06-04 09:00' }, { label: '緊急程度', value: '低' }, { label: '申請者', value: '林志明' }],
    customFields: [{ label: '假別', value: '婚假' }, { label: '天數', value: '8 天' }, { label: '日期', value: '2026-07-01 ~ 2026-07-10' }], attachments: [] },

  { id: 'REQ-2026-0037', category: 'computer', title: 'M4 MacBook Pro 14" 開發機採購申請 × 2', applicant: '王大明', submittedAt: '2026-06-12 11:30', urgency: 'medium', status: 'pending', currentStep: 0,
    steps: [{ id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' }, { id: 's2', label: '財務審核', approvers: ['財務美'], status: 'upcoming' }],
    fixedFields: [{ label: '單號', value: 'REQ-2026-0037' }, { label: '申請時間', value: '2026-06-12 11:30' }, { label: '緊急程度', value: '一般' }, { label: '申請者', value: '王大明' }],
    customFields: [{ label: '規格', value: 'M4 Pro / 24GB / 512GB' }, { label: '金額', value: 'NT$ 118,000' }], attachments: [] },

  { id: 'REQ-2026-0038', category: 'article', title: '技術部落格系列文章：微服務架構導入實戰心得分享（共三篇）發布審核申請', applicant: '黃建偉', submittedAt: '2026-06-02 14:00', urgency: 'low', status: 'pending', currentStep: 0,
    steps: [{ id: 's1', label: '內容審核', approvers: ['陳美惠'], status: 'current' }],
    fixedFields: [{ label: '單號', value: 'REQ-2026-0038' }, { label: '申請時間', value: '2026-06-02 14:00' }, { label: '緊急程度', value: '低' }, { label: '申請者', value: '黃建偉' }],
    customFields: [{ label: '平台', value: 'Medium、iThome' }, { label: '篇數', value: '3 篇' }], attachments: [] },

  { id: 'REQ-2026-0039', category: 'training', title: '全員資安意識培訓', applicant: '林志明', submittedAt: '2026-06-11 09:00', urgency: 'medium', status: 'pending', currentStep: 0,
    steps: [{ id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' }, { id: 's2', label: '資安長', approvers: ['資安王'], status: 'upcoming' }],
    fixedFields: [{ label: '單號', value: 'REQ-2026-0039' }, { label: '申請時間', value: '2026-06-01 09:00' }, { label: '緊急程度', value: '緊急' }, { label: '申請者', value: '林志明' }],
    customFields: [{ label: '培訓人數', value: '全體 42 人' }, { label: '費用', value: 'NT$ 63,000' }], attachments: [] },

  { id: 'REQ-2026-0040', category: 'expense', title: '2026 年度跨部門數位轉型專案啟動工作坊場地租借、餐飲與視聽設備整合費用申請，涵蓋產品、工程、設計及行銷四個部門共 28 名與會人員，預計於 7 月 3 日全天於松菸文創園區舉行', applicant: '王大明', submittedAt: '2026-05-30 10:00', urgency: 'medium', status: 'pending', currentStep: 0,
    steps: [{ id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' }, { id: 's2', label: '財務審核', approvers: ['財務美'], status: 'upcoming' }],
    fixedFields: [{ label: '單號', value: 'REQ-2026-0040' }, { label: '申請時間', value: '2026-05-30 10:00' }, { label: '緊急程度', value: '一般' }, { label: '申請者', value: '王大明' }],
    customFields: [{ label: '活動日期', value: '2026-07-03' }, { label: '金額', value: 'NT$ 54,000' }], attachments: [] },

  { id: 'REQ-2026-0041', category: 'recruit', title: '產品設計師（Senior Product Designer）暨使用者體驗研究員（UX Researcher）兩職缺同步對外開放招募，預計各錄取 1 名，目標 Q4 到職', applicant: '黃建偉', submittedAt: '2026-06-13 11:00', urgency: 'medium', status: 'pending', currentStep: 0,
    steps: [{ id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' }, { id: 's2', label: 'HR 審核', approvers: ['HR 李'], status: 'upcoming' }],
    fixedFields: [{ label: '單號', value: 'REQ-2026-0041' }, { label: '申請時間', value: '2026-05-29 11:00' }, { label: '緊急程度', value: '一般' }, { label: '申請者', value: '黃建偉' }],
    customFields: [{ label: '職缺數', value: '2 名' }, { label: '預計到職', value: '2026-10-01' }], attachments: [] },

  { id: 'REQ-2026-0042', category: 'vacation', title: '颱風假補休及育嬰留職停薪前年假結算申請', applicant: '林志明', submittedAt: '2026-05-28 09:30', urgency: 'low', status: 'pending', currentStep: 0,
    steps: [{ id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' }],
    fixedFields: [{ label: '單號', value: 'REQ-2026-0042' }, { label: '申請時間', value: '2026-05-28 09:30' }, { label: '緊急程度', value: '低' }, { label: '申請者', value: '林志明' }],
    customFields: [{ label: '剩餘天數', value: '12 天' }, { label: '到期日', value: '2026-08-31' }], attachments: [] },

  // ── article ×8 ───────────────────────────────────────────────────────────────
  { id: 'REQ-2026-0043', category: 'article', title: '官網隱私權政策更新公告', applicant: '林志明', submittedAt: '2026-06-17 10:00', urgency: 'medium', status: 'pending', currentStep: 0,
    steps: [{ id: 's1', label: '內容審核', approvers: ['陳美惠'], status: 'current' }],
    fixedFields: [{ label: '單號', value: 'REQ-2026-0043' }, { label: '申請時間', value: '2026-06-17 10:00' }, { label: '緊急程度', value: '一般' }, { label: '申請者', value: '林志明' }],
    customFields: [{ label: '發布平台', value: '官網' }], attachments: [] },

  { id: 'REQ-2026-0044', category: 'article', title: 'LinkedIn 品牌形象改版系列貼文發布審核', applicant: '王大明', submittedAt: '2026-06-16 14:00', urgency: 'low', status: 'pending', currentStep: 0,
    steps: [{ id: 's1', label: '內容審核', approvers: ['陳美惠'], status: 'current' }],
    fixedFields: [{ label: '單號', value: 'REQ-2026-0044' }, { label: '申請時間', value: '2026-06-16 14:00' }, { label: '緊急程度', value: '低' }, { label: '申請者', value: '王大明' }],
    customFields: [{ label: '篇數', value: '5 篇' }], attachments: [] },

  { id: 'REQ-2026-0045', category: 'article', title: 'Q2 產品更新電子報', applicant: '黃建偉', submittedAt: '2026-06-15 09:00', urgency: 'medium', status: 'pending', currentStep: 0,
    steps: [{ id: 's1', label: '內容審核', approvers: ['陳美惠'], status: 'current' }],
    fixedFields: [{ label: '單號', value: 'REQ-2026-0045' }, { label: '申請時間', value: '2026-06-15 09:00' }, { label: '緊急程度', value: '一般' }, { label: '申請者', value: '黃建偉' }],
    customFields: [{ label: '發送對象', value: '訂閱用戶 12,400 人' }], attachments: [] },

  { id: 'REQ-2026-0046', category: 'article', title: '2026 上半年度產品功能回顧暨下半年度路線圖預覽部落格長文發布審核申請', applicant: '林志明', submittedAt: '2026-06-14 11:00', urgency: 'high', status: 'pending', currentStep: 0,
    steps: [{ id: 's1', label: '內容審核', approvers: ['陳美惠'], status: 'current' }, { id: 's2', label: '法務確認', approvers: ['法務張'], status: 'upcoming' }],
    fixedFields: [{ label: '單號', value: 'REQ-2026-0046' }, { label: '申請時間', value: '2026-06-14 11:00' }, { label: '緊急程度', value: '緊急' }, { label: '申請者', value: '林志明' }],
    customFields: [{ label: '字數', value: '約 3,200 字' }, { label: '平台', value: 'Medium、官網 Blog' }], attachments: [] },

  { id: 'REQ-2026-0047', category: 'article', title: 'YouTube 產品示範影片腳本與字幕審核', applicant: '王大明', submittedAt: '2026-06-13 15:00', urgency: 'low', status: 'pending', currentStep: 0,
    steps: [{ id: 's1', label: '內容審核', approvers: ['陳美惠'], status: 'current' }],
    fixedFields: [{ label: '單號', value: 'REQ-2026-0047' }, { label: '申請時間', value: '2026-06-13 15:00' }, { label: '緊急程度', value: '低' }, { label: '申請者', value: '王大明' }],
    customFields: [{ label: '影片長度', value: '約 4 分鐘' }], attachments: [] },

  { id: 'REQ-2026-0048', category: 'article', title: '客戶成功案例：某跨國電商導入本系統後訂單處理效率提升 40% 的完整心得報告發布申請', applicant: '黃建偉', submittedAt: '2026-06-12 10:30', urgency: 'medium', status: 'pending', currentStep: 0,
    steps: [{ id: 's1', label: '內容審核', approvers: ['陳美惠'], status: 'current' }, { id: 's2', label: '客戶確認', approvers: ['業務陳'], status: 'upcoming' }],
    fixedFields: [{ label: '單號', value: 'REQ-2026-0048' }, { label: '申請時間', value: '2026-06-12 10:30' }, { label: '緊急程度', value: '一般' }, { label: '申請者', value: '黃建偉' }],
    customFields: [{ label: '平台', value: '官網、G2 評測頁' }], attachments: [] },

  { id: 'REQ-2026-0049', category: 'article', title: '社群媒體端午節活動貼文', applicant: '林志明', submittedAt: '2026-06-11 09:00', urgency: 'high', status: 'pending', currentStep: 0,
    steps: [{ id: 's1', label: '內容審核', approvers: ['陳美惠'], status: 'current' }],
    fixedFields: [{ label: '單號', value: 'REQ-2026-0049' }, { label: '申請時間', value: '2026-06-11 09:00' }, { label: '緊急程度', value: '緊急' }, { label: '申請者', value: '林志明' }],
    customFields: [{ label: '平台', value: 'Facebook、Instagram、X' }], attachments: [] },

  { id: 'REQ-2026-0050', category: 'article', title: 'iOS / Android App 商店頁面文案與截圖更新審核', applicant: '王大明', submittedAt: '2026-06-10 14:00', urgency: 'medium', status: 'pending', currentStep: 0,
    steps: [{ id: 's1', label: '內容審核', approvers: ['陳美惠'], status: 'current' }],
    fixedFields: [{ label: '單號', value: 'REQ-2026-0050' }, { label: '申請時間', value: '2026-06-10 14:00' }, { label: '緊急程度', value: '一般' }, { label: '申請者', value: '王大明' }],
    customFields: [{ label: '版本', value: '3.2.0' }], attachments: [] },

  // ── computer ×8 ──────────────────────────────────────────────────────────────
  { id: 'REQ-2026-0051', category: 'computer', title: '工程部 27" 4K 顯示器採購 × 4', applicant: '黃建偉', submittedAt: '2026-06-17 09:30', urgency: 'low', status: 'pending', currentStep: 0,
    steps: [{ id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' }],
    fixedFields: [{ label: '單號', value: 'REQ-2026-0051' }, { label: '申請時間', value: '2026-06-17 09:30' }, { label: '緊急程度', value: '低' }, { label: '申請者', value: '黃建偉' }],
    customFields: [{ label: '規格', value: 'LG 27UK850-W 4K' }, { label: '金額', value: 'NT$ 48,000' }], attachments: [] },

  { id: 'REQ-2026-0052', category: 'computer', title: 'Magic Keyboard + Magic Trackpad 組合採購 × 6', applicant: '林志明', submittedAt: '2026-06-16 11:00', urgency: 'low', status: 'pending', currentStep: 0,
    steps: [{ id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' }],
    fixedFields: [{ label: '單號', value: 'REQ-2026-0052' }, { label: '申請時間', value: '2026-06-16 11:00' }, { label: '緊急程度', value: '低' }, { label: '申請者', value: '林志明' }],
    customFields: [{ label: '金額', value: 'NT$ 30,000' }], attachments: [] },

  { id: 'REQ-2026-0053', category: 'computer', title: '新進員工 MacBook Air M3 標準配備採購申請（設計部門新人 × 2）', applicant: '王大明', submittedAt: '2026-06-15 15:00', urgency: 'medium', status: 'pending', currentStep: 0,
    steps: [{ id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' }, { id: 's2', label: '財務審核', approvers: ['財務美'], status: 'upcoming' }],
    fixedFields: [{ label: '單號', value: 'REQ-2026-0053' }, { label: '申請時間', value: '2026-06-15 15:00' }, { label: '緊急程度', value: '一般' }, { label: '申請者', value: '王大明' }],
    customFields: [{ label: '規格', value: 'M3 / 16GB / 512GB' }, { label: '金額', value: 'NT$ 78,000' }], attachments: [] },

  { id: 'REQ-2026-0054', category: 'computer', title: 'NAS 網路附加儲存設備擴充硬碟採購', applicant: '黃建偉', submittedAt: '2026-06-14 09:00', urgency: 'low', status: 'pending', currentStep: 0,
    steps: [{ id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' }],
    fixedFields: [{ label: '單號', value: 'REQ-2026-0054' }, { label: '申請時間', value: '2026-06-14 09:00' }, { label: '緊急程度', value: '低' }, { label: '申請者', value: '黃建偉' }],
    customFields: [{ label: '容量', value: '4TB × 4' }, { label: '金額', value: 'NT$ 22,000' }], attachments: [] },

  { id: 'REQ-2026-0055', category: 'computer', title: '會議室視訊會議系統升級：4K 攝影機、無線麥克風陣列及大型顯示器一次性採購申請', applicant: '林志明', submittedAt: '2026-06-13 10:00', urgency: 'medium', status: 'pending', currentStep: 0,
    steps: [{ id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' }, { id: 's2', label: '財務審核', approvers: ['財務美'], status: 'upcoming' }],
    fixedFields: [{ label: '單號', value: 'REQ-2026-0055' }, { label: '申請時間', value: '2026-06-13 10:00' }, { label: '緊急程度', value: '一般' }, { label: '申請者', value: '林志明' }],
    customFields: [{ label: '會議室', value: 'A棟 3F 大型會議室' }, { label: '金額', value: 'NT$ 135,000' }], attachments: [] },

  { id: 'REQ-2026-0056', category: 'computer', title: 'iPad Air × 3 採購申請', applicant: '王大明', submittedAt: '2026-06-12 14:30', urgency: 'low', status: 'pending', currentStep: 0,
    steps: [{ id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' }],
    fixedFields: [{ label: '單號', value: 'REQ-2026-0056' }, { label: '申請時間', value: '2026-06-12 14:30' }, { label: '緊急程度', value: '低' }, { label: '申請者', value: '王大明' }],
    customFields: [{ label: '用途', value: '展場展示用' }, { label: '金額', value: 'NT$ 42,000' }], attachments: [] },

  { id: 'REQ-2026-0057', category: 'computer', title: 'Windows 開發環境用高效能工作站採購 × 2', applicant: '黃建偉', submittedAt: '2026-06-11 11:00', urgency: 'medium', status: 'pending', currentStep: 0,
    steps: [{ id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' }],
    fixedFields: [{ label: '單號', value: 'REQ-2026-0057' }, { label: '申請時間', value: '2026-06-11 11:00' }, { label: '緊急程度', value: '一般' }, { label: '申請者', value: '黃建偉' }],
    customFields: [{ label: '規格', value: 'i9 / 64GB RAM / 2TB SSD' }, { label: '金額', value: 'NT$ 86,000' }], attachments: [] },

  { id: 'REQ-2026-0058', category: 'computer', title: '行動辦公室無線充電板、集線器與備用電源組合採購，供業務團隊外出展覽使用', applicant: '林志明', submittedAt: '2026-06-12 09:30', urgency: 'low', status: 'pending', currentStep: 0,
    steps: [{ id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' }],
    fixedFields: [{ label: '單號', value: 'REQ-2026-0058' }, { label: '申請時間', value: '2026-06-12 09:30' }, { label: '緊急程度', value: '低' }, { label: '申請者', value: '林志明' }],
    customFields: [{ label: '數量', value: '業務團隊 8 人份' }, { label: '金額', value: 'NT$ 19,200' }], attachments: [] },

  // ── expense ×7 ───────────────────────────────────────────────────────────────
  { id: 'REQ-2026-0059', category: 'expense', title: '客戶端晚宴餐費報銷', applicant: '王大明', submittedAt: '2026-06-17 11:00', urgency: 'low', status: 'pending', currentStep: 0,
    steps: [{ id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' }],
    fixedFields: [{ label: '單號', value: 'REQ-2026-0059' }, { label: '申請時間', value: '2026-06-17 11:00' }, { label: '緊急程度', value: '低' }, { label: '申請者', value: '王大明' }],
    customFields: [{ label: '金額', value: 'NT$ 4,800' }, { label: '消費日期', value: '2026-06-16' }], attachments: [] },

  { id: 'REQ-2026-0060', category: 'expense', title: '部門 Q2 成果慶功聚餐費用報銷申請', applicant: '黃建偉', submittedAt: '2026-06-16 15:00', urgency: 'low', status: 'pending', currentStep: 0,
    steps: [{ id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' }],
    fixedFields: [{ label: '單號', value: 'REQ-2026-0060' }, { label: '申請時間', value: '2026-06-16 15:00' }, { label: '緊急程度', value: '低' }, { label: '申請者', value: '黃建偉' }],
    customFields: [{ label: '人數', value: '12 人' }, { label: '金額', value: 'NT$ 9,600' }], attachments: [] },

  { id: 'REQ-2026-0061', category: 'expense', title: '計程車資補貼報銷（加班深夜返家交通）', applicant: '林志明', submittedAt: '2026-06-15 09:00', urgency: 'low', status: 'pending', currentStep: 0,
    steps: [{ id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' }],
    fixedFields: [{ label: '單號', value: 'REQ-2026-0061' }, { label: '申請時間', value: '2026-06-15 09:00' }, { label: '緊急程度', value: '低' }, { label: '申請者', value: '林志明' }],
    customFields: [{ label: '金額', value: 'NT$ 1,250' }, { label: '次數', value: '5 次' }], attachments: [] },

  { id: 'REQ-2026-0062', category: 'expense', title: '2026 下半年度設計部門 Adobe Creative Cloud 年度授權訂閱費用集中請款', applicant: '王大明', submittedAt: '2026-06-14 10:00', urgency: 'medium', status: 'pending', currentStep: 0,
    steps: [{ id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' }, { id: 's2', label: '財務審核', approvers: ['財務美'], status: 'upcoming' }],
    fixedFields: [{ label: '單號', value: 'REQ-2026-0062' }, { label: '申請時間', value: '2026-06-14 10:00' }, { label: '緊急程度', value: '一般' }, { label: '申請者', value: '王大明' }],
    customFields: [{ label: '授權數', value: '8 人' }, { label: '金額', value: 'NT$ 57,600' }], attachments: [] },

  { id: 'REQ-2026-0063', category: 'expense', title: 'SaaS 工具訂閱費報銷', applicant: '黃建偉', submittedAt: '2026-06-13 09:30', urgency: 'low', status: 'pending', currentStep: 0,
    steps: [{ id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' }],
    fixedFields: [{ label: '單號', value: 'REQ-2026-0063' }, { label: '申請時間', value: '2026-06-13 09:30' }, { label: '緊急程度', value: '低' }, { label: '申請者', value: '黃建偉' }],
    customFields: [{ label: '工具', value: 'Figma、Notion、Linear' }, { label: '金額', value: 'NT$ 6,400' }], attachments: [] },

  { id: 'REQ-2026-0064', category: 'expense', title: '辦公室零食飲料補給費用報銷', applicant: '林志明', submittedAt: '2026-06-12 11:00', urgency: 'low', status: 'pending', currentStep: 0,
    steps: [{ id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' }],
    fixedFields: [{ label: '單號', value: 'REQ-2026-0064' }, { label: '申請時間', value: '2026-06-12 11:00' }, { label: '緊急程度', value: '低' }, { label: '申請者', value: '林志明' }],
    customFields: [{ label: '金額', value: 'NT$ 3,200' }], attachments: [] },

  { id: 'REQ-2026-0065', category: 'expense', title: '工程師大會 WWDC 2026 線上串流觀看方案及相關技術資料購買費用統一請款申請', applicant: '王大明', submittedAt: '2026-06-11 14:00', urgency: 'medium', status: 'pending', currentStep: 0,
    steps: [{ id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' }],
    fixedFields: [{ label: '單號', value: 'REQ-2026-0065' }, { label: '申請時間', value: '2026-06-11 14:00' }, { label: '緊急程度', value: '一般' }, { label: '申請者', value: '王大明' }],
    customFields: [{ label: '人數', value: '6 人' }, { label: '金額', value: 'NT$ 14,400' }], attachments: [] },

  // ── travel ×9 ────────────────────────────────────────────────────────────────
  { id: 'REQ-2026-0066', category: 'travel', title: '台中業務拜訪出差', applicant: '黃建偉', submittedAt: '2026-06-17 08:00', urgency: 'low', status: 'pending', currentStep: 0,
    steps: [{ id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' }],
    fixedFields: [{ label: '單號', value: 'REQ-2026-0066' }, { label: '申請時間', value: '2026-06-17 08:00' }, { label: '緊急程度', value: '低' }, { label: '申請者', value: '黃建偉' }],
    customFields: [{ label: '目的地', value: '台中市' }, { label: '天數', value: '1 天' }, { label: '金額', value: 'NT$ 2,100' }], attachments: [] },

  { id: 'REQ-2026-0067', category: 'travel', title: '新竹科學園區客戶技術評估會議出差', applicant: '林志明', submittedAt: '2026-06-16 09:00', urgency: 'medium', status: 'pending', currentStep: 0,
    steps: [{ id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' }],
    fixedFields: [{ label: '單號', value: 'REQ-2026-0067' }, { label: '申請時間', value: '2026-06-16 09:00' }, { label: '緊急程度', value: '一般' }, { label: '申請者', value: '林志明' }],
    customFields: [{ label: '目的地', value: '新竹' }, { label: '天數', value: '1 天' }, { label: '金額', value: 'NT$ 1,800' }], attachments: [] },

  { id: 'REQ-2026-0068', category: 'travel', title: '韓國首爾 AWS re:Invent APAC 技術峰會參展暨合作夥伴洽談出差申請', applicant: '王大明', submittedAt: '2026-06-15 10:00', urgency: 'medium', status: 'pending', currentStep: 0,
    steps: [{ id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' }, { id: 's2', label: '財務長', approvers: ['劉財務'], status: 'upcoming' }],
    fixedFields: [{ label: '單號', value: 'REQ-2026-0068' }, { label: '申請時間', value: '2026-06-15 10:00' }, { label: '緊急程度', value: '一般' }, { label: '申請者', value: '王大明' }],
    customFields: [{ label: '目的地', value: '韓國 首爾' }, { label: '天數', value: '4 天' }, { label: '金額', value: 'NT$ 72,000' }], attachments: [] },

  { id: 'REQ-2026-0069', category: 'travel', title: '高雄駐點客戶季度系統維護出差', applicant: '黃建偉', submittedAt: '2026-06-14 08:30', urgency: 'low', status: 'pending', currentStep: 0,
    steps: [{ id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' }],
    fixedFields: [{ label: '單號', value: 'REQ-2026-0069' }, { label: '申請時間', value: '2026-06-14 08:30' }, { label: '緊急程度', value: '低' }, { label: '申請者', value: '黃建偉' }],
    customFields: [{ label: '目的地', value: '高雄' }, { label: '天數', value: '2 天' }, { label: '金額', value: 'NT$ 5,600' }], attachments: [] },

  { id: 'REQ-2026-0070', category: 'travel', title: '花蓮遠距工作試辦計畫交通補貼申請', applicant: '林志明', submittedAt: '2026-06-13 09:00', urgency: 'low', status: 'pending', currentStep: 0,
    steps: [{ id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' }],
    fixedFields: [{ label: '單號', value: 'REQ-2026-0070' }, { label: '申請時間', value: '2026-06-13 09:00' }, { label: '緊急程度', value: '低' }, { label: '申請者', value: '林志明' }],
    customFields: [{ label: '目的地', value: '花蓮' }, { label: '天數', value: '5 天' }, { label: '金額', value: 'NT$ 3,800' }], attachments: [] },

  { id: 'REQ-2026-0071', category: 'travel', title: '香港金融科技峰會 FinTech HK 2026 參展出差費用申請（含攤位布置人力）', applicant: '王大明', submittedAt: '2026-06-12 11:00', urgency: 'medium', status: 'pending', currentStep: 0,
    steps: [{ id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' }, { id: 's2', label: '財務長', approvers: ['劉財務'], status: 'upcoming' }],
    fixedFields: [{ label: '單號', value: 'REQ-2026-0071' }, { label: '申請時間', value: '2026-06-12 11:00' }, { label: '緊急程度', value: '一般' }, { label: '申請者', value: '王大明' }],
    customFields: [{ label: '目的地', value: '香港' }, { label: '天數', value: '3 天' }, { label: '金額', value: 'NT$ 58,000' }], attachments: [] },

  { id: 'REQ-2026-0072', category: 'travel', title: '桃園機場接送客戶交通費報銷', applicant: '黃建偉', submittedAt: '2026-06-11 15:00', urgency: 'low', status: 'pending', currentStep: 0,
    steps: [{ id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' }],
    fixedFields: [{ label: '單號', value: 'REQ-2026-0072' }, { label: '申請時間', value: '2026-06-11 15:00' }, { label: '緊急程度', value: '低' }, { label: '申請者', value: '黃建偉' }],
    customFields: [{ label: '金額', value: 'NT$ 1,400' }], attachments: [] },

  { id: 'REQ-2026-0073', category: 'travel', title: '上海、深圳雙城合作夥伴年度策略會議及工廠參訪出差（工程與業務聯合出訪）', applicant: '林志明', submittedAt: '2026-06-12 10:00', urgency: 'medium', status: 'pending', currentStep: 0,
    steps: [{ id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' }, { id: 's2', label: '財務長', approvers: ['劉財務'], status: 'upcoming' }],
    fixedFields: [{ label: '單號', value: 'REQ-2026-0073' }, { label: '申請時間', value: '2026-06-12 10:00' }, { label: '緊急程度', value: '一般' }, { label: '申請者', value: '林志明' }],
    customFields: [{ label: '目的地', value: '上海、深圳' }, { label: '天數', value: '5 天' }, { label: '金額', value: 'NT$ 96,000' }], attachments: [] },

  { id: 'REQ-2026-0074', category: 'travel', title: '員工旅遊補助核銷', applicant: '王大明', submittedAt: '2026-06-13 09:00', urgency: 'low', status: 'pending', currentStep: 0,
    steps: [{ id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' }],
    fixedFields: [{ label: '單號', value: 'REQ-2026-0074' }, { label: '申請時間', value: '2026-06-13 09:00' }, { label: '緊急程度', value: '低' }, { label: '申請者', value: '王大明' }],
    customFields: [{ label: '目的地', value: '宜蘭' }, { label: '人數', value: '24 人' }, { label: '金額', value: 'NT$ 72,000' }], attachments: [] },

  // ── vacation ×50 ─────────────────────────────────────────────────────────────
  { id: 'REQ-2026-0075', category: 'vacation', title: '特休假申請 7/1-7/4（4天）', applicant: '林志明', submittedAt: '2026-06-11 08:30', urgency: 'low', status: 'pending', currentStep: 0, steps: [{ id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' }], fixedFields: [{ label: '單號', value: 'REQ-2026-0075' }, { label: '申請時間', value: '2026-06-11 08:30' }, { label: '緊急程度', value: '低' }, { label: '申請者', value: '林志明' }], customFields: [{ label: '假別', value: '特休假' }, { label: '請假期間', value: '2026-07-01 ~ 2026-07-04' }, { label: '天數', value: '4 天' }], attachments: [] },
  { id: 'REQ-2026-0076', category: 'vacation', title: '病假申請（急性腸胃炎）', applicant: '王大明', submittedAt: '2026-06-11 09:15', urgency: 'medium', status: 'pending', currentStep: 0, steps: [{ id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' }], fixedFields: [{ label: '單號', value: 'REQ-2026-0076' }, { label: '申請時間', value: '2026-06-11 09:15' }, { label: '緊急程度', value: '一般' }, { label: '申請者', value: '王大明' }], customFields: [{ label: '假別', value: '病假' }, { label: '請假期間', value: '2026-06-12 ~ 2026-06-12' }, { label: '天數', value: '1 天' }], attachments: [] },
  { id: 'REQ-2026-0077', category: 'vacation', title: '事假申請（家庭緊急事項）', applicant: '黃建偉', submittedAt: '2026-06-11 10:00', urgency: 'medium', status: 'pending', currentStep: 0, steps: [{ id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' }], fixedFields: [{ label: '單號', value: 'REQ-2026-0077' }, { label: '申請時間', value: '2026-06-11 10:00' }, { label: '緊急程度', value: '一般' }, { label: '申請者', value: '黃建偉' }], customFields: [{ label: '假別', value: '事假' }, { label: '請假期間', value: '2026-06-13 ~ 2026-06-13' }, { label: '天數', value: '1 天' }], attachments: [] },
  { id: 'REQ-2026-0078', category: 'vacation', title: '補休申請 6/25', applicant: '周總監', submittedAt: '2026-06-11 11:30', urgency: 'low', status: 'pending', currentStep: 0, steps: [{ id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' }], fixedFields: [{ label: '單號', value: 'REQ-2026-0078' }, { label: '申請時間', value: '2026-06-11 11:30' }, { label: '緊急程度', value: '低' }, { label: '申請者', value: '周總監' }], customFields: [{ label: '假別', value: '補休' }, { label: '請假期間', value: '2026-06-25 ~ 2026-06-25' }, { label: '天數', value: '1 天' }], attachments: [] },
  { id: 'REQ-2026-0079', category: 'vacation', title: '婚假申請（7/14-7/20）', applicant: '林志明', submittedAt: '2026-06-11 13:00', urgency: 'low', status: 'pending', currentStep: 0, steps: [{ id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' }], fixedFields: [{ label: '單號', value: 'REQ-2026-0079' }, { label: '申請時間', value: '2026-06-11 13:00' }, { label: '緊急程度', value: '低' }, { label: '申請者', value: '林志明' }], customFields: [{ label: '假別', value: '婚假' }, { label: '請假期間', value: '2026-07-14 ~ 2026-07-20' }, { label: '天數', value: '7 天' }], attachments: [] },
  { id: 'REQ-2026-0080', category: 'vacation', title: '喪假申請（祖父喪）', applicant: '王大明', submittedAt: '2026-06-11 14:20', urgency: 'medium', status: 'pending', currentStep: 0, steps: [{ id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' }], fixedFields: [{ label: '單號', value: 'REQ-2026-0080' }, { label: '申請時間', value: '2026-06-11 14:20' }, { label: '緊急程度', value: '一般' }, { label: '申請者', value: '王大明' }], customFields: [{ label: '假別', value: '喪假' }, { label: '請假期間', value: '2026-06-14 ~ 2026-06-16' }, { label: '天數', value: '3 天' }], attachments: [] },
  { id: 'REQ-2026-0081', category: 'vacation', title: '陪產假申請', applicant: '黃建偉', submittedAt: '2026-06-11 15:45', urgency: 'low', status: 'pending', currentStep: 0, steps: [{ id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' }], fixedFields: [{ label: '單號', value: 'REQ-2026-0081' }, { label: '申請時間', value: '2026-06-11 15:45' }, { label: '緊急程度', value: '低' }, { label: '申請者', value: '黃建偉' }], customFields: [{ label: '假別', value: '陪產假' }, { label: '請假期間', value: '2026-07-05 ~ 2026-07-07' }, { label: '天數', value: '3 天' }], attachments: [] },
  { id: 'REQ-2026-0082', category: 'vacation', title: '育嬰假申請（新生兒照護）', applicant: '周總監', submittedAt: '2026-06-11 16:30', urgency: 'low', status: 'pending', currentStep: 0, steps: [{ id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' }], fixedFields: [{ label: '單號', value: 'REQ-2026-0082' }, { label: '申請時間', value: '2026-06-11 16:30' }, { label: '緊急程度', value: '低' }, { label: '申請者', value: '周總監' }], customFields: [{ label: '假別', value: '育嬰假' }, { label: '請假期間', value: '2026-07-21 ~ 2026-08-20' }, { label: '天數', value: '31 天' }], attachments: [] },
  { id: 'REQ-2026-0083', category: 'vacation', title: '公假申請（政府公務出席）', applicant: '林志明', submittedAt: '2026-06-12 08:00', urgency: 'medium', status: 'pending', currentStep: 0, steps: [{ id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' }], fixedFields: [{ label: '單號', value: 'REQ-2026-0083' }, { label: '申請時間', value: '2026-06-12 08:00' }, { label: '緊急程度', value: '一般' }, { label: '申請者', value: '林志明' }], customFields: [{ label: '假別', value: '公假' }, { label: '請假期間', value: '2026-06-18 ~ 2026-06-18' }, { label: '天數', value: '1 天' }], attachments: [] },
  { id: 'REQ-2026-0084', category: 'vacation', title: '特休假申請 7/7-7/11（5天）', applicant: '王大明', submittedAt: '2026-06-12 09:00', urgency: 'low', status: 'pending', currentStep: 0, steps: [{ id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' }], fixedFields: [{ label: '單號', value: 'REQ-2026-0084' }, { label: '申請時間', value: '2026-06-12 09:00' }, { label: '緊急程度', value: '低' }, { label: '申請者', value: '王大明' }], customFields: [{ label: '假別', value: '特休假' }, { label: '請假期間', value: '2026-07-07 ~ 2026-07-11' }, { label: '天數', value: '5 天' }], attachments: [] },
  { id: 'REQ-2026-0085', category: 'vacation', title: '病假申請（感冒發燒）', applicant: '黃建偉', submittedAt: '2026-06-12 09:45', urgency: 'medium', status: 'pending', currentStep: 0, steps: [{ id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' }], fixedFields: [{ label: '單號', value: 'REQ-2026-0085' }, { label: '申請時間', value: '2026-06-12 09:45' }, { label: '緊急程度', value: '一般' }, { label: '申請者', value: '黃建偉' }], customFields: [{ label: '假別', value: '病假' }, { label: '請假期間', value: '2026-06-13 ~ 2026-06-14' }, { label: '天數', value: '2 天' }], attachments: [] },
  { id: 'REQ-2026-0086', category: 'vacation', title: '事假申請（搬家整理）', applicant: '周總監', submittedAt: '2026-06-12 10:30', urgency: 'low', status: 'pending', currentStep: 0, steps: [{ id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' }], fixedFields: [{ label: '單號', value: 'REQ-2026-0086' }, { label: '申請時間', value: '2026-06-12 10:30' }, { label: '緊急程度', value: '低' }, { label: '申請者', value: '周總監' }], customFields: [{ label: '假別', value: '事假' }, { label: '請假期間', value: '2026-06-20 ~ 2026-06-20' }, { label: '天數', value: '1 天' }], attachments: [] },
  { id: 'REQ-2026-0087', category: 'vacation', title: '補休申請 6/30', applicant: '林志明', submittedAt: '2026-06-12 11:15', urgency: 'low', status: 'pending', currentStep: 0, steps: [{ id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' }], fixedFields: [{ label: '單號', value: 'REQ-2026-0087' }, { label: '申請時間', value: '2026-06-12 11:15' }, { label: '緊急程度', value: '低' }, { label: '申請者', value: '林志明' }], customFields: [{ label: '假別', value: '補休' }, { label: '請假期間', value: '2026-06-30 ~ 2026-06-30' }, { label: '天數', value: '1 天' }], attachments: [] },
  { id: 'REQ-2026-0088', category: 'vacation', title: '喪假申請（外祖母喪）', applicant: '王大明', submittedAt: '2026-06-12 13:00', urgency: 'medium', status: 'pending', currentStep: 0, steps: [{ id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' }], fixedFields: [{ label: '單號', value: 'REQ-2026-0088' }, { label: '申請時間', value: '2026-06-12 13:00' }, { label: '緊急程度', value: '一般' }, { label: '申請者', value: '王大明' }], customFields: [{ label: '假別', value: '喪假' }, { label: '請假期間', value: '2026-06-16 ~ 2026-06-18' }, { label: '天數', value: '3 天' }], attachments: [] },
  { id: 'REQ-2026-0089', category: 'vacation', title: '特休假申請 6/22-6/24（3天）', applicant: '黃建偉', submittedAt: '2026-06-12 14:00', urgency: 'low', status: 'pending', currentStep: 0, steps: [{ id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' }], fixedFields: [{ label: '單號', value: 'REQ-2026-0089' }, { label: '申請時間', value: '2026-06-12 14:00' }, { label: '緊急程度', value: '低' }, { label: '申請者', value: '黃建偉' }], customFields: [{ label: '假別', value: '特休假' }, { label: '請假期間', value: '2026-06-22 ~ 2026-06-24' }, { label: '天數', value: '3 天' }], attachments: [] },
  { id: 'REQ-2026-0090', category: 'vacation', title: '公假申請（職業訓練）', applicant: '周總監', submittedAt: '2026-06-12 15:30', urgency: 'medium', status: 'pending', currentStep: 0, steps: [{ id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' }], fixedFields: [{ label: '單號', value: 'REQ-2026-0090' }, { label: '申請時間', value: '2026-06-12 15:30' }, { label: '緊急程度', value: '一般' }, { label: '申請者', value: '周總監' }], customFields: [{ label: '假別', value: '公假' }, { label: '請假期間', value: '2026-06-19 ~ 2026-06-20' }, { label: '天數', value: '2 天' }], attachments: [] },
  { id: 'REQ-2026-0091', category: 'vacation', title: '陪產假申請（第二胎）', applicant: '林志明', submittedAt: '2026-06-12 16:00', urgency: 'low', status: 'pending', currentStep: 0, steps: [{ id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' }], fixedFields: [{ label: '單號', value: 'REQ-2026-0091' }, { label: '申請時間', value: '2026-06-12 16:00' }, { label: '緊急程度', value: '低' }, { label: '申請者', value: '林志明' }], customFields: [{ label: '假別', value: '陪產假' }, { label: '請假期間', value: '2026-07-10 ~ 2026-07-12' }, { label: '天數', value: '3 天' }], attachments: [] },
  { id: 'REQ-2026-0092', category: 'vacation', title: '病假申請（慢性病回診）', applicant: '王大明', submittedAt: '2026-06-12 17:00', urgency: 'low', status: 'pending', currentStep: 0, steps: [{ id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' }], fixedFields: [{ label: '單號', value: 'REQ-2026-0092' }, { label: '申請時間', value: '2026-06-12 17:00' }, { label: '緊急程度', value: '低' }, { label: '申請者', value: '王大明' }], customFields: [{ label: '假別', value: '病假' }, { label: '請假期間', value: '2026-06-17 ~ 2026-06-17' }, { label: '天數', value: '1 天' }], attachments: [] },
  { id: 'REQ-2026-0093', category: 'vacation', title: '事假申請（子女學校活動）', applicant: '黃建偉', submittedAt: '2026-06-13 08:15', urgency: 'low', status: 'pending', currentStep: 0, steps: [{ id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' }], fixedFields: [{ label: '單號', value: 'REQ-2026-0093' }, { label: '申請時間', value: '2026-06-13 08:15' }, { label: '緊急程度', value: '低' }, { label: '申請者', value: '黃建偉' }], customFields: [{ label: '假別', value: '事假' }, { label: '請假期間', value: '2026-06-21 ~ 2026-06-21' }, { label: '天數', value: '1 天' }], attachments: [] },
  { id: 'REQ-2026-0094', category: 'vacation', title: '特休假申請 8/4-8/8（5天）', applicant: '周總監', submittedAt: '2026-06-13 09:30', urgency: 'low', status: 'pending', currentStep: 0, steps: [{ id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' }], fixedFields: [{ label: '單號', value: 'REQ-2026-0094' }, { label: '申請時間', value: '2026-06-13 09:30' }, { label: '緊急程度', value: '低' }, { label: '申請者', value: '周總監' }], customFields: [{ label: '假別', value: '特休假' }, { label: '請假期間', value: '2026-08-04 ~ 2026-08-08' }, { label: '天數', value: '5 天' }], attachments: [] },
  { id: 'REQ-2026-0095', category: 'vacation', title: '育嬰假申請（延長申請）', applicant: '林志明', submittedAt: '2026-06-13 10:00', urgency: 'low', status: 'pending', currentStep: 0, steps: [{ id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' }], fixedFields: [{ label: '單號', value: 'REQ-2026-0095' }, { label: '申請時間', value: '2026-06-13 10:00' }, { label: '緊急程度', value: '低' }, { label: '申請者', value: '林志明' }], customFields: [{ label: '假別', value: '育嬰假' }, { label: '請假期間', value: '2026-08-01 ~ 2026-08-31' }, { label: '天數', value: '31 天' }], attachments: [] },
  { id: 'REQ-2026-0096', category: 'vacation', title: '補休申請 7/3', applicant: '王大明', submittedAt: '2026-06-13 10:45', urgency: 'low', status: 'pending', currentStep: 0, steps: [{ id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' }], fixedFields: [{ label: '單號', value: 'REQ-2026-0096' }, { label: '申請時間', value: '2026-06-13 10:45' }, { label: '緊急程度', value: '低' }, { label: '申請者', value: '王大明' }], customFields: [{ label: '假別', value: '補休' }, { label: '請假期間', value: '2026-07-03 ~ 2026-07-03' }, { label: '天數', value: '1 天' }], attachments: [] },
  { id: 'REQ-2026-0097', category: 'vacation', title: '病假申請（手術後療養）', applicant: '黃建偉', submittedAt: '2026-06-13 11:30', urgency: 'medium', status: 'pending', currentStep: 0, steps: [{ id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' }], fixedFields: [{ label: '單號', value: 'REQ-2026-0097' }, { label: '申請時間', value: '2026-06-13 11:30' }, { label: '緊急程度', value: '一般' }, { label: '申請者', value: '黃建偉' }], customFields: [{ label: '假別', value: '病假' }, { label: '請假期間', value: '2026-06-20 ~ 2026-06-26' }, { label: '天數', value: '7 天' }], attachments: [] },
  { id: 'REQ-2026-0098', category: 'vacation', title: '公假申請（消防演習出席）', applicant: '周總監', submittedAt: '2026-06-13 13:15', urgency: 'medium', status: 'pending', currentStep: 0, steps: [{ id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' }], fixedFields: [{ label: '單號', value: 'REQ-2026-0098' }, { label: '申請時間', value: '2026-06-13 13:15' }, { label: '緊急程度', value: '一般' }, { label: '申請者', value: '周總監' }], customFields: [{ label: '假別', value: '公假' }, { label: '請假期間', value: '2026-06-24 ~ 2026-06-24' }, { label: '天數', value: '1 天' }], attachments: [] },
  { id: 'REQ-2026-0099', category: 'vacation', title: '特休假申請 7/28-7/31（4天）', applicant: '林志明', submittedAt: '2026-06-13 14:00', urgency: 'low', status: 'pending', currentStep: 0, steps: [{ id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' }], fixedFields: [{ label: '單號', value: 'REQ-2026-0099' }, { label: '申請時間', value: '2026-06-13 14:00' }, { label: '緊急程度', value: '低' }, { label: '申請者', value: '林志明' }], customFields: [{ label: '假別', value: '特休假' }, { label: '請假期間', value: '2026-07-28 ~ 2026-07-31' }, { label: '天數', value: '4 天' }], attachments: [] },
  { id: 'REQ-2026-0100', category: 'vacation', title: '事假申請（搬遷協助）', applicant: '王大明', submittedAt: '2026-06-13 15:00', urgency: 'low', status: 'pending', currentStep: 0, steps: [{ id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' }], fixedFields: [{ label: '單號', value: 'REQ-2026-0100' }, { label: '申請時間', value: '2026-06-13 15:00' }, { label: '緊急程度', value: '低' }, { label: '申請者', value: '王大明' }], customFields: [{ label: '假別', value: '事假' }, { label: '請假期間', value: '2026-06-27 ~ 2026-06-27' }, { label: '天數', value: '1 天' }], attachments: [] },
  { id: 'REQ-2026-0101', category: 'vacation', title: '補休申請 7/8-7/9（2天）', applicant: '黃建偉', submittedAt: '2026-06-13 16:30', urgency: 'low', status: 'pending', currentStep: 0, steps: [{ id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' }], fixedFields: [{ label: '單號', value: 'REQ-2026-0101' }, { label: '申請時間', value: '2026-06-13 16:30' }, { label: '緊急程度', value: '低' }, { label: '申請者', value: '黃建偉' }], customFields: [{ label: '假別', value: '補休' }, { label: '請假期間', value: '2026-07-08 ~ 2026-07-09' }, { label: '天數', value: '2 天' }], attachments: [] },
  { id: 'REQ-2026-0102', category: 'vacation', title: '婚假申請（8/3-8/9）', applicant: '周總監', submittedAt: '2026-06-14 08:30', urgency: 'low', status: 'pending', currentStep: 0, steps: [{ id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' }], fixedFields: [{ label: '單號', value: 'REQ-2026-0102' }, { label: '申請時間', value: '2026-06-14 08:30' }, { label: '緊急程度', value: '低' }, { label: '申請者', value: '周總監' }], customFields: [{ label: '假別', value: '婚假' }, { label: '請假期間', value: '2026-08-03 ~ 2026-08-09' }, { label: '天數', value: '7 天' }], attachments: [] },
  { id: 'REQ-2026-0103', category: 'vacation', title: '病假申請（偏頭痛）', applicant: '林志明', submittedAt: '2026-06-14 09:00', urgency: 'medium', status: 'pending', currentStep: 0, steps: [{ id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' }], fixedFields: [{ label: '單號', value: 'REQ-2026-0103' }, { label: '申請時間', value: '2026-06-14 09:00' }, { label: '緊急程度', value: '一般' }, { label: '申請者', value: '林志明' }], customFields: [{ label: '假別', value: '病假' }, { label: '請假期間', value: '2026-06-15 ~ 2026-06-15' }, { label: '天數', value: '1 天' }], attachments: [] },
  { id: 'REQ-2026-0104', category: 'vacation', title: '特休假申請 9/1-9/5（5天）', applicant: '王大明', submittedAt: '2026-06-14 10:00', urgency: 'low', status: 'pending', currentStep: 0, steps: [{ id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' }], fixedFields: [{ label: '單號', value: 'REQ-2026-0104' }, { label: '申請時間', value: '2026-06-14 10:00' }, { label: '緊急程度', value: '低' }, { label: '申請者', value: '王大明' }], customFields: [{ label: '假別', value: '特休假' }, { label: '請假期間', value: '2026-09-01 ~ 2026-09-05' }, { label: '天數', value: '5 天' }], attachments: [] },
  { id: 'REQ-2026-0105', category: 'vacation', title: '喪假申請（配偶父喪）', applicant: '黃建偉', submittedAt: '2026-06-14 11:00', urgency: 'medium', status: 'pending', currentStep: 0, steps: [{ id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' }], fixedFields: [{ label: '單號', value: 'REQ-2026-0105' }, { label: '申請時間', value: '2026-06-14 11:00' }, { label: '緊急程度', value: '一般' }, { label: '申請者', value: '黃建偉' }], customFields: [{ label: '假別', value: '喪假' }, { label: '請假期間', value: '2026-06-17 ~ 2026-06-19' }, { label: '天數', value: '3 天' }], attachments: [] },
  { id: 'REQ-2026-0106', category: 'vacation', title: '事假申請（體檢複診）', applicant: '周總監', submittedAt: '2026-06-14 13:30', urgency: 'low', status: 'pending', currentStep: 0, steps: [{ id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' }], fixedFields: [{ label: '單號', value: 'REQ-2026-0106' }, { label: '申請時間', value: '2026-06-14 13:30' }, { label: '緊急程度', value: '低' }, { label: '申請者', value: '周總監' }], customFields: [{ label: '假別', value: '事假' }, { label: '請假期間', value: '2026-06-23 ~ 2026-06-23' }, { label: '天數', value: '1 天' }], attachments: [] },
  { id: 'REQ-2026-0107', category: 'vacation', title: '陪產假申請（雙胞胎）', applicant: '林志明', submittedAt: '2026-06-14 14:15', urgency: 'medium', status: 'pending', currentStep: 0, steps: [{ id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' }], fixedFields: [{ label: '單號', value: 'REQ-2026-0107' }, { label: '申請時間', value: '2026-06-14 14:15' }, { label: '緊急程度', value: '一般' }, { label: '申請者', value: '林志明' }], customFields: [{ label: '假別', value: '陪產假' }, { label: '請假期間', value: '2026-07-15 ~ 2026-07-17' }, { label: '天數', value: '3 天' }], attachments: [] },
  { id: 'REQ-2026-0108', category: 'vacation', title: '公假申請（勞安法規教育訓練）', applicant: '王大明', submittedAt: '2026-06-14 15:00', urgency: 'medium', status: 'pending', currentStep: 0, steps: [{ id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' }], fixedFields: [{ label: '單號', value: 'REQ-2026-0108' }, { label: '申請時間', value: '2026-06-14 15:00' }, { label: '緊急程度', value: '一般' }, { label: '申請者', value: '王大明' }], customFields: [{ label: '假別', value: '公假' }, { label: '請假期間', value: '2026-06-25 ~ 2026-06-26' }, { label: '天數', value: '2 天' }], attachments: [] },
  { id: 'REQ-2026-0109', category: 'vacation', title: '補休申請 7/18', applicant: '黃建偉', submittedAt: '2026-06-14 16:00', urgency: 'low', status: 'pending', currentStep: 0, steps: [{ id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' }], fixedFields: [{ label: '單號', value: 'REQ-2026-0109' }, { label: '申請時間', value: '2026-06-14 16:00' }, { label: '緊急程度', value: '低' }, { label: '申請者', value: '黃建偉' }], customFields: [{ label: '假別', value: '補休' }, { label: '請假期間', value: '2026-07-18 ~ 2026-07-18' }, { label: '天數', value: '1 天' }], attachments: [] },
  { id: 'REQ-2026-0110', category: 'vacation', title: '特休假申請 10/5-10/9（5天）', applicant: '周總監', submittedAt: '2026-06-14 17:00', urgency: 'low', status: 'pending', currentStep: 0, steps: [{ id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' }], fixedFields: [{ label: '單號', value: 'REQ-2026-0110' }, { label: '申請時間', value: '2026-06-14 17:00' }, { label: '緊急程度', value: '低' }, { label: '申請者', value: '周總監' }], customFields: [{ label: '假別', value: '特休假' }, { label: '請假期間', value: '2026-10-05 ~ 2026-10-09' }, { label: '天數', value: '5 天' }], attachments: [] },
  { id: 'REQ-2026-0111', category: 'vacation', title: '病假申請（腰椎復健）', applicant: '林志明', submittedAt: '2026-06-15 08:00', urgency: 'low', status: 'pending', currentStep: 0, steps: [{ id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' }], fixedFields: [{ label: '單號', value: 'REQ-2026-0111' }, { label: '申請時間', value: '2026-06-15 08:00' }, { label: '緊急程度', value: '低' }, { label: '申請者', value: '林志明' }], customFields: [{ label: '假別', value: '病假' }, { label: '請假期間', value: '2026-06-18 ~ 2026-06-19' }, { label: '天數', value: '2 天' }], attachments: [] },
  { id: 'REQ-2026-0112', category: 'vacation', title: '事假申請（長輩就醫陪伴）', applicant: '王大明', submittedAt: '2026-06-15 09:00', urgency: 'medium', status: 'pending', currentStep: 0, steps: [{ id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' }], fixedFields: [{ label: '單號', value: 'REQ-2026-0112' }, { label: '申請時間', value: '2026-06-15 09:00' }, { label: '緊急程度', value: '一般' }, { label: '申請者', value: '王大明' }], customFields: [{ label: '假別', value: '事假' }, { label: '請假期間', value: '2026-06-22 ~ 2026-06-22' }, { label: '天數', value: '1 天' }], attachments: [] },
  { id: 'REQ-2026-0113', category: 'vacation', title: '育嬰假申請（第三胎）', applicant: '黃建偉', submittedAt: '2026-06-15 10:15', urgency: 'low', status: 'pending', currentStep: 0, steps: [{ id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' }], fixedFields: [{ label: '單號', value: 'REQ-2026-0113' }, { label: '申請時間', value: '2026-06-15 10:15' }, { label: '緊急程度', value: '低' }, { label: '申請者', value: '黃建偉' }], customFields: [{ label: '假別', value: '育嬰假' }, { label: '請假期間', value: '2026-09-01 ~ 2026-09-30' }, { label: '天數', value: '30 天' }], attachments: [] },
  { id: 'REQ-2026-0114', category: 'vacation', title: '補休申請 7/22-7/23（2天）', applicant: '周總監', submittedAt: '2026-06-15 11:00', urgency: 'low', status: 'pending', currentStep: 0, steps: [{ id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' }], fixedFields: [{ label: '單號', value: 'REQ-2026-0114' }, { label: '申請時間', value: '2026-06-15 11:00' }, { label: '緊急程度', value: '低' }, { label: '申請者', value: '周總監' }], customFields: [{ label: '假別', value: '補休' }, { label: '請假期間', value: '2026-07-22 ~ 2026-07-23' }, { label: '天數', value: '2 天' }], attachments: [] },
  { id: 'REQ-2026-0115', category: 'vacation', title: '特休假申請 8/17-8/21（5天）', applicant: '林志明', submittedAt: '2026-06-15 13:00', urgency: 'low', status: 'pending', currentStep: 0, steps: [{ id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' }], fixedFields: [{ label: '單號', value: 'REQ-2026-0115' }, { label: '申請時間', value: '2026-06-15 13:00' }, { label: '緊急程度', value: '低' }, { label: '申請者', value: '林志明' }], customFields: [{ label: '假別', value: '特休假' }, { label: '請假期間', value: '2026-08-17 ~ 2026-08-21' }, { label: '天數', value: '5 天' }], attachments: [] },
  { id: 'REQ-2026-0116', category: 'vacation', title: '喪假申請（父親喪）', applicant: '王大明', submittedAt: '2026-06-15 14:00', urgency: 'medium', status: 'pending', currentStep: 0, steps: [{ id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' }], fixedFields: [{ label: '單號', value: 'REQ-2026-0116' }, { label: '申請時間', value: '2026-06-15 14:00' }, { label: '緊急程度', value: '一般' }, { label: '申請者', value: '王大明' }], customFields: [{ label: '假別', value: '喪假' }, { label: '請假期間', value: '2026-06-18 ~ 2026-06-24' }, { label: '天數', value: '7 天' }], attachments: [] },
  { id: 'REQ-2026-0117', category: 'vacation', title: '公假申請（議員市政諮詢出席）', applicant: '黃建偉', submittedAt: '2026-06-15 15:30', urgency: 'medium', status: 'pending', currentStep: 0, steps: [{ id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' }], fixedFields: [{ label: '單號', value: 'REQ-2026-0117' }, { label: '申請時間', value: '2026-06-15 15:30' }, { label: '緊急程度', value: '一般' }, { label: '申請者', value: '黃建偉' }], customFields: [{ label: '假別', value: '公假' }, { label: '請假期間', value: '2026-06-20 ~ 2026-06-20' }, { label: '天數', value: '1 天' }], attachments: [] },
  { id: 'REQ-2026-0118', category: 'vacation', title: '病假申請（牙科手術）', applicant: '周總監', submittedAt: '2026-06-15 16:30', urgency: 'low', status: 'pending', currentStep: 0, steps: [{ id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' }], fixedFields: [{ label: '單號', value: 'REQ-2026-0118' }, { label: '申請時間', value: '2026-06-15 16:30' }, { label: '緊急程度', value: '低' }, { label: '申請者', value: '周總監' }], customFields: [{ label: '假別', value: '病假' }, { label: '請假期間', value: '2026-06-19 ~ 2026-06-19' }, { label: '天數', value: '1 天' }], attachments: [] },
  { id: 'REQ-2026-0119', category: 'vacation', title: '事假申請（戶政事務所辦理）', applicant: '林志明', submittedAt: '2026-06-16 08:30', urgency: 'low', status: 'pending', currentStep: 0, steps: [{ id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' }], fixedFields: [{ label: '單號', value: 'REQ-2026-0119' }, { label: '申請時間', value: '2026-06-16 08:30' }, { label: '緊急程度', value: '低' }, { label: '申請者', value: '林志明' }], customFields: [{ label: '假別', value: '事假' }, { label: '請假期間', value: '2026-06-24 ~ 2026-06-24' }, { label: '天數', value: '1 天' }], attachments: [] },
  { id: 'REQ-2026-0120', category: 'vacation', title: '特休假申請 7/14-7/18（5天）', applicant: '王大明', submittedAt: '2026-06-16 09:15', urgency: 'low', status: 'pending', currentStep: 0, steps: [{ id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' }], fixedFields: [{ label: '單號', value: 'REQ-2026-0120' }, { label: '申請時間', value: '2026-06-16 09:15' }, { label: '緊急程度', value: '低' }, { label: '申請者', value: '王大明' }], customFields: [{ label: '假別', value: '特休假' }, { label: '請假期間', value: '2026-07-14 ~ 2026-07-18' }, { label: '天數', value: '5 天' }], attachments: [] },
  { id: 'REQ-2026-0121', category: 'vacation', title: '補休申請 8/1（1天）', applicant: '黃建偉', submittedAt: '2026-06-16 10:00', urgency: 'low', status: 'pending', currentStep: 0, steps: [{ id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' }], fixedFields: [{ label: '單號', value: 'REQ-2026-0121' }, { label: '申請時間', value: '2026-06-16 10:00' }, { label: '緊急程度', value: '低' }, { label: '申請者', value: '黃建偉' }], customFields: [{ label: '假別', value: '補休' }, { label: '請假期間', value: '2026-08-01 ~ 2026-08-01' }, { label: '天數', value: '1 天' }], attachments: [] },
  { id: 'REQ-2026-0122', category: 'vacation', title: '陪產假申請（初產）', applicant: '周總監', submittedAt: '2026-06-16 11:30', urgency: 'low', status: 'pending', currentStep: 0, steps: [{ id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' }], fixedFields: [{ label: '單號', value: 'REQ-2026-0122' }, { label: '申請時間', value: '2026-06-16 11:30' }, { label: '緊急程度', value: '低' }, { label: '申請者', value: '周總監' }], customFields: [{ label: '假別', value: '陪產假' }, { label: '請假期間', value: '2026-08-10 ~ 2026-08-12' }, { label: '天數', value: '3 天' }], attachments: [] },
  { id: 'REQ-2026-0123', category: 'vacation', title: '病假申請（過敏氣喘發作）', applicant: '林志明', submittedAt: '2026-06-16 13:45', urgency: 'medium', status: 'pending', currentStep: 0, steps: [{ id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' }], fixedFields: [{ label: '單號', value: 'REQ-2026-0123' }, { label: '申請時間', value: '2026-06-16 13:45' }, { label: '緊急程度', value: '一般' }, { label: '申請者', value: '林志明' }], customFields: [{ label: '假別', value: '病假' }, { label: '請假期間', value: '2026-06-17 ~ 2026-06-18' }, { label: '天數', value: '2 天' }], attachments: [] },
  { id: 'REQ-2026-0124', category: 'vacation', title: '特休假申請 8/24-8/28（5天）', applicant: '王大明', submittedAt: '2026-06-17 09:00', urgency: 'low', status: 'pending', currentStep: 0, steps: [{ id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' }], fixedFields: [{ label: '單號', value: 'REQ-2026-0124' }, { label: '申請時間', value: '2026-06-17 09:00' }, { label: '緊急程度', value: '低' }, { label: '申請者', value: '王大明' }], customFields: [{ label: '假別', value: '特休假' }, { label: '請假期間', value: '2026-08-24 ~ 2026-08-28' }, { label: '天數', value: '5 天' }], attachments: [] },
]

export const CURRENT_USER = '陳美惠'

// 人員通訊錄 — 供頭像 hover 的 ProfileCard 顯示部門 / 職稱
export interface Person {
  department: string
  title?: string
}
export const PEOPLE: Record<string, Person> = {
  黃建偉: { department: '行銷部', title: '行銷企劃' },
  林志明: { department: '資訊部', title: 'IT 工程師' },
  陳美惠: { department: '財務部', title: '財務專員' },
  周總監: { department: '業務部', title: '業務總監' },
  王大明: { department: '行政部', title: '行政專員' },
  張法務: { department: '法務部', title: '法務專員' },
  林法務: { department: '法務部', title: '法務專員' },
  林處長: { department: '管理部', title: '處長' },
  人資專員: { department: '人力資源部', title: '人資專員' },
  人資助理: { department: '人力資源部', title: '人資助理' },
  採購協辦: { department: '採購部', title: '採購協辦' },
}
const DEPT_CODE: Record<string, string> = {
  行銷部: 'MKT', 資訊部: 'IT', 財務部: 'FIN', 業務部: 'SALES', 行政部: 'ADM',
  法務部: 'LEGAL', 管理部: 'MGT', 人力資源部: 'HR', 採購部: 'PUR',
}
export interface PersonInfo extends Person {
  id: string
  employeeNumber: string
  email: string
  phone: string
  location: string
  status: 'online' | 'away' | 'busy' | 'offline'
  /** 組織課名代碼(部門 + 代碼) */
  deptCode: string
}
const STATUSES = ['online', 'away', 'busy', 'offline'] as const
function hashName(name: string): number {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  return h
}
// 由姓名確定性衍生其餘欄位(mock),讓 ProfileCard 內容完整(非 placeholder)
export function getPerson(name: string): PersonInfo {
  const base = PEOPLE[name] ?? { department: '—' }
  const h = hashName(name)
  const emp = 10000 + (h % 90000)
  return {
    ...base,
    id: `U-${1000 + (h % 9000)}`,
    employeeNumber: `EMP-${emp}`,
    email: `emp${emp}@cpcm.tw`,
    phone: `02-${2700 + (h % 100)}-${1000 + (h % 9000)}`,
    location: '台北總部',
    status: STATUSES[h % STATUSES.length],
    deptCode: DEPT_CODE[base.department] ? `${base.department} ${DEPT_CODE[base.department]}` : base.department,
  }
}

export function getTabRecords(
  tab: 'pending-me' | 'submitted' | 'signed' | 'cc',
  records: ApprovalRecord[],
  currentUser: string
): ApprovalRecord[] {
  if (tab === 'cc') {
    return records.filter((r) => r.copiedTo?.includes(currentUser))
  }
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
