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
}

export const CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: 'article', label: '文章發布審核' },
  { id: 'computer', label: '電腦採購申請' },
  { id: 'expense', label: '費用報銷' },
  { id: 'travel', label: '出差申請' },
  { id: 'vacation', label: '請假申請' },
  { id: 'recruit', label: '人力招募' },
  { id: 'training', label: '教育訓練' },
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
    dueDate: '2026-06-15',
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
    category: 'travel',
    title: '日本東京 6/15-6/18 客戶拜訪出差',
    applicant: '黃建偉',
    submittedAt: '2026-05-29 11:40',
    urgency: 'high',
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
      { label: '申請時間', value: '2026-05-29 11:40' },
      { label: '緊急程度', value: '緊急' },
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
    dueDate: '2026-06-14',
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
    category: 'recruit',
    title: '前端工程師招募職缺開放',
    applicant: '周總監',
    submittedAt: '2026-05-27 13:10',
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
    dueDate: '2026-06-19',
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
    submittedAt: '2026-06-01 09:30',
    urgency: 'low',
    status: 'pending',
    currentStep: 0,
    steps: [
      { id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' },
      { id: 's2', label: '採購部門', approvers: ['採購王'], status: 'upcoming' },
    ],
    fixedFields: [
      { label: '單號', value: 'REQ-2026-0016' },
      { label: '申請時間', value: '2026-06-01 09:30' },
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
    submittedAt: '2026-06-03 08:30',
    urgency: 'medium',
    status: 'pending',
    currentStep: 0,
    steps: [
      { id: 's1', label: '直屬主管', approvers: ['陳美惠'], status: 'current' },
      { id: 's2', label: '財務長', approvers: ['劉財務'], status: 'upcoming' },
    ],
    fixedFields: [
      { label: '單號', value: 'REQ-2026-0020' },
      { label: '申請時間', value: '2026-06-03 08:30' },
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
    urgency: 'high',
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
      { label: '緊急程度', value: '緊急' },
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
    dueDate: '2026-06-21',
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
    submittedAt: '2026-06-04 09:45',
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
