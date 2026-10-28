import { useState, useRef, useEffect, type ReactNode } from 'react'
import {
  TooltipProvider,
  AppShell,
  Sidebar,
  SidebarProvider,
  SidebarTrigger,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuBadge,
  useSidebar,
  Chip,
  ChipGroup,
  SegmentedControl,
  SegmentedControlItem,
  Tag,
  Button,
  BulkActionBar,
  Textarea,
  Checkbox,
  Input,
  Badge,
  toast,
  Toaster,
  DataTable,
  type DataTableProps,
  DataTableFilterPanel,
  createEmptyFilterTree,
  evaluateTree,
  isFilterTreeActive,
  type FilterTree,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogClose,
} from '@qijenchen/design-system'
import {
  AlertCircle,
  Search,
  X,
  Plus,
  ClipboardList,
  ClipboardCheck,
  ClipboardPen,
  ClipboardCopy,
  Info,
  Filter,
  Contact,
} from 'lucide-react'
import {
  MOCK_RECORDS,
  CATEGORIES,
  CURRENT_USER,
  getTabRecords,
  approveRecord,
  rejectRecord,
  currentApprovers,
  type ApprovalRecord,
  type CategoryId,
} from './data'
import { PersonAvatarLabel, PersonAvatarStack } from './PersonAvatar'
import { ApprovalDetailPanel } from './ApprovalDetailPanel'
import { ApprovalModal } from './ApprovalModal'
import { DetailAside } from './DetailAside'
import { FormManagementView } from './FormManagementView'
import {
  MOCK_FORMS,
  can as canForm,
  type FormRole,
  type ManagedForm,
} from './formsData'

// ── 外層 filter(A / PM 2026-10-13)──────────────────────────────────────────────
// 只放「簽核系統固定/共同欄位」:狀態 / 緊急程度 / 申請人 / 到期區間。
// 篩選欄位對每個分類都一樣(2026-10-27 user 拍板:篩選欄位要對應看得到的表格欄,
// 不攤出去外層表格的欄位就不該可篩選 —— 之前做過「依分類動態組欄位 + 切換自動
// 剔除不適用 condition」,但沒有任何分類真的需要專屬篩選欄,整套機制沒在做事,
// 已拿掉,改回單一共用清單,不要留沒用到的複雜度)。
// 切分類一律清空 filterTree(見 ChipGroup onValueChange)—— 不依賴「欄位目前剛好
// 相同」這個前提,future-proof 之後萬一哪個分類又要開放客製欄位/排序。
// 篩選邏輯走 DS 統一入口 DataTableFilterPanel(data-table.spec.md L278),不做表頭 inline filter;
// 表頭只提供「依此欄篩選…」捷徑(onColumnFilterTrigger)跳進此面板並預填。
const APPLICANT_OPTIONS = Array.from(new Set(MOCK_RECORDS.map((r) => r.applicant))).map((name) => ({
  value: name,
  label: name,
}))

const FILTER_COLUMNS: DataTableProps<ApprovalRecord>['columns'] = [
  {
    id: 'status',
    header: '狀態',
    meta: {
      type: 'select',
      options: [
        { value: 'pending', label: '簽核中' },
        { value: 'approved', label: '已核准' },
        { value: 'rejected', label: '已退件' },
      ],
    },
  },
  {
    id: 'urgency',
    header: '緊急程度',
    meta: {
      type: 'select',
      options: [
        { value: 'high', label: '緊急' },
        { value: 'medium', label: '一般' },
        { value: 'low', label: '低' },
      ],
    },
  },
  { id: 'applicant', header: '申請人', meta: { type: 'select', options: APPLICANT_OPTIONS } },
  { id: 'dueDate', header: '到期時間', meta: { type: 'date' } },
]

const FILTERABLE_IDS = new Set((FILTER_COLUMNS ?? []).map((c) => (c as { id: string }).id))


const STATUS_COLOR = { pending: 'blue', approved: 'green', rejected: 'red' } as const
const STATUS_LABEL = { pending: '簽核中', approved: '已核准', rejected: '已退件' } as const

function RowCheckbox({ checked, indeterminate, onChange }: {
  checked: boolean
  indeterminate?: boolean
  onChange: () => void
}) {
  return (
    <div onClick={(e) => e.stopPropagation()}>
      <Checkbox
        checked={indeterminate ? 'indeterminate' : checked}
        onCheckedChange={onChange}
      />
    </div>
  )
}

function PageHeader({
  title,
  breadcrumb,
  rightSlot,
}: {
  title: string
  /** 有值時改以麵包屑呈現(如 表單管理 / 表單名),取代單一標題;進詳情不另長 header */
  breadcrumb?: { label: string; onClick?: () => void; tag?: ReactNode }[]
  /** 標題右側的情境操作(如表單的狀態 + 編輯/停用 / 建立表單) */
  rightSlot?: ReactNode
}) {
  // sidebar 收合時,展開鈕移到內容 header 最左;展開時展開鈕在 sidebar header 內
  const { state } = useSidebar()
  return (
    <header className="flex items-center gap-3 h-[var(--chrome-header-height)] px-[var(--layout-space-loose)] bg-surface border-b border-divider">
      {state === 'collapsed' && <SidebarTrigger />}
      {breadcrumb ? (
        <nav aria-label="麵包屑" className="flex items-center gap-1.5 flex-1 min-w-0 text-body-lg font-medium">
          {breadcrumb.map((b, i) => (
            <span key={i} className="flex items-center gap-1.5 min-w-0">
              {i > 0 && <span className="text-fg-placeholder shrink-0">/</span>}
              {b.onClick ? (
                <button
                  type="button"
                  onClick={b.onClick}
                  className="text-fg-secondary hover:text-foreground truncate focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                >
                  {b.label}
                </button>
              ) : (
                <span className="truncate">{b.label}</span>
              )}
              {/* tag 獨立於 truncate 文字之外,視窗窄也不會被連帶裁掉 */}
              {b.tag && <span className="shrink-0">{b.tag}</span>}
            </span>
          ))}
        </nav>
      ) : (
        <h1 className="text-body-lg font-medium flex-1 truncate">{title}</h1>
      )}
      {rightSlot}
    </header>
  )
}

// 主導覽改走左側 sidebar(待簽核/已簽核/已申請/轉寄給我),對齊整合平台的統一框架。
// active 狀態由 SidebarProvider controlled(activeId=tab);待辦類(待簽核/轉寄給我)顯示筆數 badge。
function ApprovalSidebar({
  records,
  hasFormAccess,
  onFormAccessChange,
}: {
  records: ApprovalRecord[]
  /** 平台層存取控管(demo)— 獨立於表單管理模組內的 owner/admin/viewer 角色矩陣:
      這個開關管「看不看得到表單管理入口」,角色矩陣管「進去後能做什麼」,兩個維度分開。 */
  hasFormAccess: boolean
  onFormAccessChange: (v: boolean) => void
}) {
  const badgeFor = (t: TabId): number | null => {
    const n = getTabRecords(t, records, CURRENT_USER).length
    return n > 0 ? n : null
  }
  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader>
        {/* 展開時:標題 Approvals + 收合鈕在右;收合(icon)時整列隱藏,改由內容 header 的展開鈕 */}
        <div className="flex w-full items-center gap-2 px-2 py-1 group-data-[collapsible=icon]:hidden">
          <span className="text-body-lg font-semibold truncate flex-1">Approvals</span>
          <SidebarTrigger />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {TAB_ORDER.map((t) => {
                const badge = badgeFor(t)
                return (
                  <SidebarMenuItem key={t}>
                    <SidebarMenuButton id={t} startIcon={TAB_ICONS[t]} tooltip={TAB_LABELS[t]}>
                      {TAB_LABELS[t]}
                    </SidebarMenuButton>
                    {badge !== null && (
                      <SidebarMenuBadge variant={t === 'pending-me' ? 'critical' : 'low'} count={badge} />
                    )}
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {/* 表單管理模組(C)— 獨立 group;平台存取 demo 開關關閉時整個不渲染(無權限 = 看不到入口) */}
        {hasFormAccess && (
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton id="forms" startIcon={Contact} tooltip="表單管理">
                    表單管理
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      {/* 平台存取(demo)— 跟表單管理模組內的角色切換器是不同維度,刻意放在模組外,
          切成「無權限」後仍摸得到這顆開關可以切回來。 */}
      <SidebarFooter>
        <div className="flex flex-col gap-1.5 px-2 py-1.5 group-data-[collapsible=icon]:hidden">
          <span className="text-caption text-fg-muted">平台存取(demo)</span>
          <SegmentedControl
            value={hasFormAccess ? 'granted' : 'denied'}
            onValueChange={(v: string | undefined) => v && onFormAccessChange(v === 'granted')}
            size="sm"
          >
            <SegmentedControlItem value="granted">有權限</SegmentedControlItem>
            <SegmentedControlItem value="denied">無權限</SegmentedControlItem>
          </SegmentedControl>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

function RecordList({
  records,
  selectable,
  selectedIds,
  allSelected,
  someSelected,
  onToggleSelectAll,
  onToggleSelect,
  onClick,
  onOpenModal,
  activeId,
  showSelectAll,
  onColumnFilterTrigger,
}: {
  records: ApprovalRecord[]
  /** 只有待簽核開放批次勾選;其餘 tab 不渲染 select 欄(2026-10-28 user 拍板:
      批次核准/退件只在待簽核有意義,其餘 tab 隱藏這整個操作面) */
  selectable: boolean
  selectedIds: Set<string>
  allSelected: boolean
  someSelected: boolean
  onToggleSelectAll: () => void
  onToggleSelect: (id: string) => void
  /** 點 info 鈕 → 開右側面板 */
  onClick: (r: ApprovalRecord) => void
  /** 點標題 → 開完整 modal */
  onOpenModal: (r: ApprovalRecord) => void
  /** 目前面板開著的單據 id → 該列 info 鈕呈 pressed/checked */
  activeId: string | null
  /** 表頭「依此欄篩選…」捷徑 → 開外層面板並預填該欄 */
  onColumnFilterTrigger: (columnId: string) => void
  /** 只有「選定具體分類」時才顯示表頭「全選」;全部類別僅列可勾、無一鍵全選
      (per 設計決策:跨類型一鍵全選是盲簽最常發生處,批次鎖在單一類型內) */
  showSelectAll: boolean
}) {
  // 凍結欄捲動深度陰影:橫向捲動時從左/右凍結面板投一道陰影,讓內容讀作「滑到下面」
  // 而非被硬邊切斷。依 center 捲動位置 toggle attr,CSS 投向性陰影(globals.css)。
  const wrapRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return
    const scroller = wrap.querySelector<HTMLElement>('[data-datatable-hscroll]')
    if (!scroller) return
    const update = () => {
      const max = scroller.scrollWidth - scroller.clientWidth
      wrap.toggleAttribute('data-shadow-left', scroller.scrollLeft > 1)
      wrap.toggleAttribute('data-shadow-right', max > 1 && scroller.scrollLeft < max - 1)
    }
    update()
    scroller.addEventListener('scroll', update, { passive: true })
    const ro = new ResizeObserver(update)
    ro.observe(scroller)
    return () => { scroller.removeEventListener('scroll', update); ro.disconnect() }
  }, [records])

  // DS DataTable 欄位定義。凍結欄用 pinnedLeft(select / title)+ pinnedRight(info),
  // 取代原手刻 sticky + z-index。height="100%" + 父層 flex 約束 → 少筆 hug、多筆內捲
  // (data-table.spec.md L78)。選取不另上 row 底色(L249:有 checkbox 就只用 checkbox)。
  const columns: DataTableProps<ApprovalRecord>['columns'] = [
    // select 欄只在 selectable(= 待簽核)渲染 —— 其餘 tab 整欄不存在,不是停用/隱藏,
    // 批次勾選操作面完全不出現(2026-10-28 user 拍板)。
    ...(selectable
      ? [
          {
            id: 'select',
            meta: { width: 48, resizable: false },
            header: () =>
              showSelectAll ? (
                <div className="flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                  <RowCheckbox checked={allSelected} indeterminate={someSelected} onChange={onToggleSelectAll} />
                </div>
              ) : null,
            cell: ({ row }: { row: { original: ApprovalRecord } }) => (
              <div className="flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                <RowCheckbox checked={selectedIds.has(row.original.id)} onChange={() => onToggleSelect(row.original.id)} />
              </div>
            ),
          },
        ]
      : []),
    {
      id: 'title',
      header: '標題',
      meta: { width: 240 },
      cell: ({ row }) => (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onOpenModal(row.original) }}
          className="text-left line-clamp-2 font-medium hover:text-primary hover:underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
        >
          {row.original.title}
        </button>
      ),
    },
    {
      id: 'applicant',
      header: '申請人',
      meta: { width: 180 },
      cell: ({ row }) => <PersonAvatarLabel name={row.original.applicant} />,
    },
    {
      id: 'currentApprover',
      header: '目前簽核者',
      meta: { width: 120 },
      // 重用「代理人」欄位同一套多頭像呈現(PersonAvatarStack,PersonAvatar.tsx 共用
      // 元件,FormSubmissionsView.tsx 也消費同一份),語意一致(都是「誰在處理這張
      // 單」);currentApprovers 查無 current step 或查無人員時回傳 []、
      // PersonAvatarStack 對空陣列顯示 "-"。
      cell: ({ row }) => <PersonAvatarStack names={currentApprovers(row.original)} />,
    },
    {
      id: 'agents',
      header: '代理人',
      meta: { width: 120 },
      cell: ({ row }) => <PersonAvatarStack names={row.original.agents} />,
    },
    {
      id: 'submittedAt',
      header: '申請時間',
      meta: { width: 112 },
      cell: ({ row }) => (
        <span className="text-caption text-fg-secondary whitespace-nowrap">
          {row.original.submittedAt.slice(0, 10).replace(/-/g, '/')}
        </span>
      ),
    },
    {
      id: 'status',
      header: '狀態',
      meta: { width: 92 },
      cell: ({ row }) => (
        <Tag size="sm" color={STATUS_COLOR[row.original.status]}>{STATUS_LABEL[row.original.status]}</Tag>
      ),
    },
    {
      id: 'urgency',
      header: '緊急程度',
      meta: { width: 96 },
      cell: ({ row }) =>
        row.original.urgency === 'high'
          ? <Tag size="sm" color="red">緊急</Tag>
          : <span className="text-fg-placeholder">-</span>,
    },
    {
      id: 'dueDate',
      header: '到期時間',
      meta: { width: 112 },
      cell: ({ row }) => {
        const { text, urgent } = deadlineDisplay(row.original.dueDate)
        return <span className={`text-caption ${urgent ? 'text-error-text' : 'text-fg-secondary'}`}>{text}</span>
      },
    },
    {
      id: 'info',
      header: '',
      meta: { width: 48, resizable: false },
      cell: ({ row }) => (
        <div className="flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="text"
            size="sm"
            iconOnly
            startIcon={Info}
            pressed={activeId === row.original.id}
            aria-label="展開詳情"
            onClick={() => onClick(row.original)}
          />
        </div>
      ),
    },
  ]

  return (
    <div ref={wrapRef} className="approval-datatable-wrap h-full min-h-0">
      <DataTable
        className="approval-datatable"
        columns={columns}
        data={records}
        getRowId={(r) => r.id}
        height="100%"
        size="md"
        // 多行列(標題換行)時 cell 頂對齊,不垂直置中(DS row-mode:auto → items-start)
        autoRowHeight
        pinnedLeftColumns={selectable ? ['select', 'title'] : ['title']}
        pinnedRightColumns={['info']}
        // 表頭「依此欄篩選…」捷徑 → 開外層面板並預填(僅可篩選欄顯示此 ⌄ 選單,見 globals.css)
        onColumnFilterTrigger={onColumnFilterTrigger}
        // 呈現型表格:關閉欄位排序 / 隱藏。filter 在 data 層以 evaluateTree 套用(見上層 `filtered`),
        // 不走 DataTable 內部 globalFilter(DS dist 自帶 bundled TanStack,跨 instance 無法驅動)。
        tableOptions={{ enableSorting: false, enableHiding: false }}
      />
    </div>
  )
}

function deadlineDisplay(dueDate?: string): { text: string; urgent: boolean } {
  if (!dueDate) return { text: '-', urgent: false }
  const due = new Date(dueDate + 'T00:00:00')
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const diffDays = Math.ceil((due.getTime() - today.getTime()) / 86400000)
  if (diffDays < 0) return { text: `逾期 ${Math.abs(diffDays)} 天`, urgent: true }
  if (diffDays === 0) return { text: '今日到期', urgent: true }
  return { text: `剩 ${diffDays} 天`, urgent: diffDays <= 3 }
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-fg-placeholder gap-2">
      <AlertCircle size={36} />
      <p className="text-body">{message}</p>
    </div>
  )
}

type TabId = 'pending-me' | 'submitted' | 'signed' | 'cc'

const TAB_LABELS: Record<TabId, string> = {
  'pending-me': '待簽核',
  signed: '已簽核',
  submitted: '已申請',
  cc: '轉寄給我',
}
// icon 與 mobile 底部 tab 一致
const TAB_ICONS: Record<TabId, typeof ClipboardList> = {
  'pending-me': ClipboardList,
  signed: ClipboardCheck,
  submitted: ClipboardPen,
  cc: ClipboardCopy,
}
// 順序即分組線索:審核者(待簽核→已簽核)相鄰在前,再申請者(已申請)、被轉寄者
// (轉寄給我)。不加分隔線 / 群組間距,純靠 icon + 順序區辨(per 設計決策 B)。
const TAB_ORDER: TabId[] = ['pending-me', 'signed', 'submitted', 'cc']

function ApprovalPage() {
  const [tab, setTab] = useState<TabId>('pending-me')
  // null = 使用者明確把分類 chip 點第二下取消選取(任一 tab 皆然,含有「全部類別」
  // 可退的其餘 tab,見 ChipGroup onValueChange,2026-10-28 user 拍板:行為跟待簽核
  // 一致,不要頂替回 'all')。跟初始/預設狀態的 'all' 分開表示,才能區分「從沒選過」
  // (待簽核會自動挑第一個分類)和「選過又主動取消」(不自動幫他選,顯示空狀態提示)。
  const [category, setCategory] = useState<CategoryId | 'all' | null>('all')
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null)
  const [formView, setFormView] = useState<'content' | 'submissions'>('content')
  const [records, setRecords] = useState<ApprovalRecord[]>(MOCK_RECORDS)
  const [rejectComment, setRejectComment] = useState('')
  // 批次退件 / 核准確認 modal(對齊 DS「確認 = Dialog」+ mobile);退件原因必填、核准意見選填
  const [rejectConfirmOpen, setRejectConfirmOpen] = useState(false)
  const [approveConfirmOpen, setApproveConfirmOpen] = useState(false)
  const [approveComment, setApproveComment] = useState('')
  // 外層 filter(A):FilterTree controlled + popover 開關 + 表頭捷徑預填欄位
  const [filterTree, setFilterTree] = useState<FilterTree>(() => createEmptyFilterTree('flat'))
  const [filterOpen, setFilterOpen] = useState(false)
  const [filterPrefilledId, setFilterPrefilledId] = useState<string | undefined>(undefined)
  // 表單管理模組(C):section 切換(簽核 vs 表單管理)+ prototype 檢視身分(角色切換器)
  const [section, setSection] = useState<'approvals' | 'forms'>('approvals')
  const [formRole, setFormRole] = useState<FormRole>('admin')
  // 表單清單提升為 state(全域設定即時寫回,不能只讀 MOCK_FORMS 常數)
  const [forms, setForms] = useState<ManagedForm[]>(MOCK_FORMS)
  // 平台層存取控管(demo)— 獨立於 formRole,管「看不看得到表單管理入口」
  const [hasFormAccess, setHasFormAccess] = useState(true)

  // 示範中途被收回表單管理存取權時,若正站在表單管理 section 內要退回簽核中心,
  // 不留在一個已經看不到入口的頁面上。
  useEffect(() => {
    if (!hasFormAccess && section === 'forms') {
      setSection('approvals')
      setSelectedFormId(null)
      setFormView('content')
    }
  }, [hasFormAccess, section])

  const tabRecords = getTabRecords(tab, records, CURRENT_USER)
  const searchFiltered = tabRecords
    .filter((r) => !search || r.title.includes(search) || r.applicant.includes(search) || r.id.includes(search))

  // 分類統計(給 chips + 下拉選單共用):只留該 tab(+搜尋)有單據的類別,
  // 目前選取中的類別一律保留(避免 chip / 選項消失)
  const categoryStats = CATEGORIES.map((c) => ({
    id: c.id,
    label: c.label,
    count: searchFiltered.filter((r) => r.category === c.id).length,
    hasAlert: searchFiltered.some((r) => r.category === c.id && r.urgency === 'high'),
  })).filter((c) => c.count > 0 || category === c.id)

  // 待簽核沒有「全部類別」chip(見下方 ChipGroup),category 還停在初始值 'all'
  // 時(= 從沒手動選過)用第一個可選分類頂替,避免清單其實是「全部類別」卻找不到
  // 對應 chip 可以反白(2026-10-28 user 拍板)。category 是 null(= 使用者點兩下
  // 主動取消選取)時則不頂替,維持空狀態,見下方「請選擇一個分類查看簽核單」。
  const effectiveCategory: CategoryId | 'all' | null =
    tab === 'pending-me' && category === 'all' ? categoryStats[0]?.id ?? 'all' : category

  const categoryFiltered =
    effectiveCategory === null
      ? []
      : searchFiltered.filter((r) => effectiveCategory === 'all' || r.category === effectiveCategory)
  // 外層 filter(A):走 DS 匯出的 evaluateTree 在 data 層過濾。
  // (DS dist 自帶 bundled TanStack,consumer 的 getFilteredRowModel 是不同 module instance、
  //  無法驅動 DataTable 內部 globalFilter → 改在 data 層套用,等效且無跨 instance 問題。)
  const filtered = isFilterTreeActive(filterTree)
    ? categoryFiltered.filter((r) => evaluateTree(filterTree, r))
    : categoryFiltered

  const selectedRecord = selectedId ? records.find((r) => r.id === selectedId) ?? null : null
  // 批次勾選只在待簽核開放(2026-10-28 user 拍板:其餘 tab 隱藏批次勾選操作,
  // 連帶 select 欄本身都不渲染,見 RecordList 的 selectable prop)。
  const isSelecting = tab === 'pending-me' && selectedIds.size > 0
  const allVisibleSelected = filtered.length > 0 && filtered.every((r) => selectedIds.has(r.id))
  const someSelected = selectedIds.size > 0 && !allVisibleSelected
  // 同分類內搜尋保留選取;已選但被目前搜尋隱藏的筆數(對齊 mobile submitBatch 的提示)
  const filteredIds = new Set(filtered.map((r) => r.id))
  const hiddenSelectedCount = [...selectedIds].filter((id) => !filteredIds.has(id)).length

  function showToast(msg: string) {
    toast({ variant: 'success', title: msg })
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function handleSelectAll() {
    if (allVisibleSelected) {
      setSelectedIds((prev) => { const next = new Set(prev); filtered.forEach((r) => next.delete(r.id)); return next })
    } else {
      setSelectedIds((prev) => { const next = new Set(prev); filtered.forEach((r) => next.add(r.id)); return next })
    }
  }

  function clearSelection() {
    setSelectedIds(new Set())
    setRejectComment('')
  }

  // 切換主導覽(sidebar / 原 tab 共用):清選取 + 清搜尋 + Q2 分類退回
  // sidebar 點選:'forms' → 表單管理 section;其餘為簽核 tab
  function handleSidebarChange(id: string) {
    if (id === 'forms') {
      setSection('forms')
      setSelectedFormId(null) // 點 sidebar「表單管理」一律回清單
      setFormView('content')
      return
    }
    setSection('approvals')
    handleTabChange(id as TabId)
  }

  function handleTabChange(nextTab: TabId) {
    setTab(nextTab)
    setSelectedIds(new Set())
    setSearch('')
    // null(主動取消選取的空狀態)只在「待簽核」這次停留有意義,換 tab 就重置回
    // 'all' —— 回到待簽核時會再走 effectiveCategory 自動挑第一個分類,不會卡在
    // 空狀態跨 tab 殘留。
    if (category === null) {
      setCategory('all')
    } else if (category !== 'all') {
      const has = getTabRecords(nextTab, records, CURRENT_USER).some((r) => r.category === category)
      if (!has) setCategory('all')
    }
  }

  function openRecord(r: ApprovalRecord) {
    // 批次中也可開單張「唯讀預覽」:保留勾選(不清),面板隱藏單張操作列,
    // 作用域由底部批次列表達(per PM 2026-10-13 item B)。
    setSelectedId(r.id)
    setPanelOpen(true)
  }

  function openModalFor(r: ApprovalRecord) {
    setSelectedId(r.id)
    setModalOpen(true)
  }

  function handleApprove(id: string, comment?: string) {
    setRecords((prev) => prev.map((r) => (r.id === id ? approveRecord(r, CURRENT_USER, comment) : r)))
    setModalOpen(false)
    setPanelOpen(false)
    showToast('已核准')
  }

  function handleReject(id: string, comment: string) {
    setRecords((prev) => prev.map((r) => (r.id === id ? rejectRecord(r, CURRENT_USER, comment) : r)))
    setModalOpen(false)
    setPanelOpen(false)
    showToast('已退件')
  }

  function handleBatchApprove(comment?: string) {
    const count = [...selectedIds].filter((id) => records.find((r) => r.id === id)?.status === 'pending').length
    setRecords((prev) => prev.map((r) => selectedIds.has(r.id) && r.status === 'pending' ? approveRecord(r, CURRENT_USER, comment) : r))
    clearSelection()
    showToast(`已核准 ${count} 件`)
  }

  function handleBatchRejectSubmit() {
    const count = [...selectedIds].filter((id) => records.find((r) => r.id === id)?.status === 'pending').length
    setRecords((prev) => prev.map((r) => selectedIds.has(r.id) && r.status === 'pending' ? rejectRecord(r, CURRENT_USER, rejectComment) : r))
    clearSelection()
    showToast(`已退件 ${count} 件`)
  }

  function handleStub(label: string) {
    showToast(`${label} — 功能開發中`)
  }

  // ── 表單管理(C)header 計算:麵包屑 + 情境操作,集中在最上方 header ──
  const selectedForm = selectedFormId ? forms.find((f) => f.id === selectedFormId) ?? null : null
  const formStub = (label: string) => showToast(`${label}(施工中)`)
  function openForm(id: string | null, opts?: { view?: 'content' | 'submissions' }) {
    setSelectedFormId(id)
    setFormView(opts?.view ?? 'content')
  }
  // 表單命名 / 分類 / 全域設定即時寫回 forms state(2026-10-27 user 拍板:表單管理只保留
  // 設定功能 —— 建立表單、草稿/發佈、停用/刪除整組生命週期管理都隱藏,不留在這個介面)。
  function handleUpdateForm(id: string, patch: Partial<ManagedForm>) {
    setForms((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)))
  }
  // 表單名稱不再帶狀態 tag(2026-10-27 user 拍板:草稿/已發布/已停用整組狀態隱藏 ——
  // 這個狀態已經沒有任何介面能改變它,留著顯示沒有意義,見 formsData.ts 的 ManagedForm 註解)。
  const formsBreadcrumb = !selectedForm
    ? undefined
    : [{ label: '表單管理', onClick: () => openForm(null) }, { label: selectedForm.name }]
  // 表單詳情頁一進去就是設定(FormDetailView 不再分檢視/編輯兩態),所以 header 只留一個
  // 「保存」—— 點了直接回表單清單(欄位本來就逐欄位即時寫回 forms state,不需要額外的
  // 存檔動作,這顆鈕純粹是「我改完了,回清單」的退出路徑)。viewer 無編輯權限時不顯示。
  const formsHeaderRight: ReactNode =
    section !== 'forms' || !selectedForm || formView === 'submissions'
      ? null
      : canForm(formRole, 'editForm')
        ? <Button variant="primary" size="sm" onClick={() => openForm(null)}>保存</Button>
        : null

  return (
    <SidebarProvider activeId={section === 'forms' ? 'forms' : tab} onActiveChange={handleSidebarChange}>
    <AppShell
      layout="primary-sidebar"
      header={
        section === 'forms'
          ? <PageHeader title="表單管理" breadcrumb={formsBreadcrumb} rightSlot={formsHeaderRight} />
          : (
            <PageHeader
              title={TAB_LABELS[tab]}
              rightSlot={
                // 新增申請單 — 移到 header(與表單模組「建立表單」同位置);弱化用 tertiary,
                // 只在「已申請」(申請者視角)出現。未來交下游系統時移除此一按鈕即可。
                tab === 'submitted' ? (
                  <Button variant="tertiary" size="sm" startIcon={Plus} onClick={() => handleStub('新增申請單')}>
                    新增申請單
                  </Button>
                ) : undefined
              }
            />
          )
      }
      sidebar={
        <ApprovalSidebar
          records={records}
          hasFormAccess={hasFormAccess}
          onFormAccessChange={setHasFormAccess}
        />
      }
      asideOpen={section === 'approvals' && panelOpen && !!selectedRecord}
      onAsideOpenChange={setPanelOpen}
    >
    {/* 表單管理 section:渲染獨立 view(增量 1);簽核 section 保持原內容(用 hidden 保留掛載,
        讓 Toaster / modal 在兩 section 都在) */}
    {section === 'forms' && (
      <FormManagementView
        forms={forms}
        records={records}
        role={formRole}
        onRoleChange={setFormRole}
        selectedForm={selectedForm}
        view={formView}
        onSelectForm={(f) => openForm(f ? f.id : null)}
        onViewSubmissions={(f) => openForm(f.id, { view: 'submissions' })}
        onUpdateForm={handleUpdateForm}
        stub={formStub}
      />
    )}
    <div className={`flex flex-col h-full ${section === 'forms' ? 'hidden' : ''}`}>
      {/* 內容 body row:左側清單欄 + 右側詳情面板(面板長在內容 header 下方,非 AppShell 頂天 aside)*/}
      <div className="flex flex-1 min-h-0">
      {/* 左側:搜尋/篩選 toolbar + 清單 + 批次操作列 */}
      <div className="flex flex-col flex-1 min-w-0 min-h-0">
      {/* 主導覽改左側 sidebar(見 ApprovalSidebar);此處只剩搜尋 + 篩選 toolbar。
          Search + filter bar — 內部 gap-3;pt-6(24px)頂距、pb-3(12px)chip↔table */}
      <div className="flex flex-col gap-3 px-[var(--layout-space-loose)] pt-6 pb-3">
        {/* Search row */}
        <Input
          startIcon={Search}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜尋單號、標題、申請者…"
          endAction={search ? { icon: X, label: '清除搜尋', onClick: () => setSearch('') } : undefined}
          className="!bg-muted"
        />

        {/* Chips + view toggle row */}
        <div className="flex items-center justify-between gap-4">
          {/* 分類列:走 DS ChipGroup layout="menu"(溢出才收合成 ▼ 導覽選單;
              選單 item 直接渲染 chip children → 自帶 Badge)。category-chips class 供
              globals.css 微調。flex-1 min-w-0 讓 menu 內層 overflow-x-auto 能收縮捲動。 */}
          <div className="flex-1 min-w-0 category-chips">
            <ChipGroup
              type="single"
              value={effectiveCategory ?? undefined}
              onValueChange={(v: string) => {
                // ChipGroup 底層是 Radix ToggleGroup(type="single"):點已選中的 chip 第二下
                // 會觸發 onValueChange('')(取消選取)——這是 DS chip.spec.md 記載的官方
                // 機制(「再點一次 deselect」= 移除 filter 的唯一 affordance,故意不加
                // dismiss X),不應該整個擋掉。空值時一律設成 null,顯示下面的空狀態提示
                // ——所有 tab 行為一致(2026-10-28 user 拍板:其餘 tab 不要因為有「全部
                // 類別」可退就自動頂替回去,跟待簽核一樣老實顯示「沒有選分類」,不要
                // 靜默幫使用者挑一個分類)。
                setCategory(v ? (v as CategoryId | 'all') : null)
                clearSelection()
                // 切分類一律清空 filter(2026-10-27 user 拍板)—— 目前篩選欄位剛好每個分類
                // 都一樣,不清也不會 stale,但這是會隨時間失效的假設:之後一旦哪個分類開放
                // 客製欄位/排序,欄位又會依分類不同,屆時若忘了同步處理清除邏輯就會重踩
                // stale-filter 的坑。切分類直接清空更簡單、更不依賴「欄位剛好相同」這個前提。
                setFilterTree(createEmptyFilterTree('flat'))
                // search 一併清空(2026-10-27 user 拍板)—— filter 清空、search 不清空的話,
                // 使用者會從「search 切了還在」類推以為 filter 也還在套用,實際上已經被清空,
                // 誤以為清單還受著某個篩選條件限制。兩者都是「縮小清單範圍」的機制,清空行為
                // 要一致,避免這種誤導。
                setSearch('')
              }}
              layout="menu"
            >
              {/* 待簽核沒有「全部類別」(2026-10-28 user 拍板):批次核准/退件跨分類一次
                  全選風險最高的就是這個 tab,拿掉「全部」逼使用者一定先選定分類。其餘
                  tab(已簽核/已申請/轉寄給我)保留。 */}
              {tab !== 'pending-me' && (
                <Chip value="all">
                  <span className="flex items-center gap-1">
                    全部類別
                    {(search ? true : searchFiltered.length > 0) && (
                      <Badge
                        variant={searchFiltered.some((r) => r.urgency === 'high') ? 'critical' : 'low'}
                        count={searchFiltered.length}
                      />
                    )}
                  </span>
                </Chip>
              )}
              {categoryStats.map((c) => (
                <Chip key={c.id} value={c.id}>
                  <span className="flex items-center gap-1">
                    {c.label}
                    <Badge variant={c.hasAlert ? 'critical' : 'low'} count={c.count} />
                  </span>
                </Chip>
              ))}
            </ChipGroup>
          </div>

          {/* 外層 filter(A)— 統一入口(DS data-table.spec.md L278)。filter 套在 data 層,
              卡片 / 列表共用同一份篩完資料 → 兩種檢視都顯示此鈕(避免卡片模式 filter 隱形卻仍作用)。
              pressed:套用條件後維持 active 視覺。表頭「依此欄篩選…」捷徑另在列表表頭(卡片無欄位表頭)。 */}
          <Popover open={filterOpen} onOpenChange={setFilterOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="text"
                size="sm"
                iconOnly
                startIcon={Filter}
                aria-label="篩選"
                pressed={isFilterTreeActive(filterTree)}
              />
            </PopoverTrigger>
            <PopoverContent align="end" className="w-auto p-0">
              <DataTableFilterPanel
                columns={FILTER_COLUMNS}
                value={filterTree}
                onChange={setFilterTree}
                prefilledColumnId={filterPrefilledId}
                onPrefillConsumed={() => setFilterPrefilledId(undefined)}
                onClose={() => setFilterOpen(false)}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Content — 只保留 table 檢視(2026-10-27 user 拍板移除卡片檢視,連帶拿掉切換鈕)*/}
      <div className="flex-1 min-h-0 flex flex-col px-[var(--layout-space-loose)] pb-4">
        {effectiveCategory === null ? (
          // 任一 tab 把分類 chip 點兩下取消選取後的空狀態,行為一致(2026-10-28 user
          // 拍板):不要靜默幫使用者挑回一個分類 / 頂替回全部類別,明確提示要重新選,
          // 使用者才不會沒注意到已經換了篩選範圍。
          <EmptyState message="請選擇一個分類查看簽核單" />
        ) : filtered.length === 0 ? (
          <EmptyState message="目前沒有相關單據" />
        ) : (
          <RecordList
            records={filtered}
            selectable={tab === 'pending-me'}
            selectedIds={selectedIds}
            allSelected={allVisibleSelected}
            someSelected={someSelected}
            onToggleSelectAll={handleSelectAll}
            onToggleSelect={toggleSelect}
            onClick={openRecord}
            onOpenModal={openModalFor}
            activeId={panelOpen ? selectedId : null}
            showSelectAll={effectiveCategory !== 'all'}
            onColumnFilterTrigger={(columnId) => {
              const prefill = FILTERABLE_IDS.has(columnId) ? columnId : undefined
              // 延一 tick 開 popover:等表頭 ⌄ DropdownMenu 關閉完成,
              // 否則 Radix 會把剛開的 filter popover 當成「外點」立刻關掉(跨浮層 gotcha)。
              setFilterPrefilledId(prefill)
              setTimeout(() => setFilterOpen(true), 0)
            }}
          />
        )}
      </div>

      </div>{/* /左側清單欄 */}

      {/* 右側詳情面板 — 置於內容 header 下方(DetailAside 讀 AppShell context 自決 inline/Sheet)。
          批次模式:面板本身仍是唯讀預覽(隱藏單張操作列,作用域交給底部批次列)。放大鈕
          不再因批次模式關閉(2026-10-27 user 拍板:除了關閉鈕,所有功能都該支援放大檢視)
          —— 展開的 Modal 改靠 mode 本身帶 !isSelecting 退回 view,批次中只給轉寄/作廢這類
          單項 utility 動作,核准/退件仍只能走底部批次列,不會因為放大鈕而繞過批次限制。 */}
      {selectedRecord && (
        <DetailAside
          title={selectedRecord.title}
          onExpand={() => setModalOpen(true)}
        >
          <ApprovalDetailPanel
            key={selectedRecord.id}
            record={selectedRecord}
            mode={tab === 'pending-me' ? 'approve' : 'view'}
            batchMode={isSelecting}
            onApprove={handleApprove}
            onReject={handleReject}
            onMoreAction={handleStub}
          />
        </DetailAside>
      )}
      </div>{/* /body row */}

      {/* 批次操作列 — 置於 body row 下方 = 橫跨「清單 + 右側面板」全寬(Gmail / Apple Mail 式底部工具列)。
          作用域靠位置區隔:批次操作 = 底部全寬列;單張操作 = 面板內 footer(批次時隱藏)。
          走 DS BulkActionBar(自帶上分隔線 border-t;placement 由 consumer 決定,全寬合法)。 */}
      {isSelecting && (
        <div className="shrink-0">
          <BulkActionBar
            selection={[...selectedIds]}
            onClearSelection={clearSelection}
            hiddenByFilter={hiddenSelectedCount}
            labels={{
              count: (n: number) => `已選取 ${n} 項`,
              hiddenSuffix: (hidden: number) => ` · ${hidden} 項被搜尋隱藏`,
              clear: '取消選取',
            }}
            actions={
              <>
                {/* BulkActionBar actions 左對齊:主要動作(核准)最左,danger(退件)排其後遠離焦點
                    (action-bar.spec.md L121/L122)。文案強調「一併」(2026-10-27 user 拍板)——
                    點擊前就要讓使用者清楚這是對所有勾選項目一次執行,不是單張動作,避免誤以為
                    只動到目前瀏覽中的那一張。 */}
                <Button variant="secondary" onClick={() => { setApproveComment(''); setApproveConfirmOpen(true) }}>
                  一併核准
                </Button>
                <Button variant="secondary" danger onClick={() => { setRejectComment(''); setRejectConfirmOpen(true) }}>
                  一併退件
                </Button>
              </>
            }
          />
        </div>
      )}

      <Toaster />
      <ApprovalModal
        record={selectedRecord}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={tab === 'pending-me' && !isSelecting ? 'approve' : 'view'}
        onApprove={handleApprove}
        onReject={handleReject}
        onMoreAction={handleStub}
      />
      {/* 批次核准確認 modal(DS「確認 = Dialog」+ 對齊 mobile)。附核准意見(選填),
          跟單張核准 / 退件一致;有被搜尋隱藏的已選單據時,另顯示一併核准提示。 */}
      <Dialog open={approveConfirmOpen} onOpenChange={setApproveConfirmOpen}>
        <DialogContent height="hug" maxWidth={440}>
          <DialogHeader>
            <DialogTitle>核准 {selectedIds.size} 件申請單</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <div className="flex flex-col gap-3">
              {hiddenSelectedCount > 0 && (
                <p className="text-body text-fg-secondary">
                  其中 {hiddenSelectedCount} 張已勾選的單據不在目前搜尋結果中，確認後將一併核准。
                </p>
              )}
              <div className="flex flex-col gap-1.5">
                <span className="text-body font-medium">
                  核准意見 <span className="text-fg-placeholder text-caption font-normal">（選填）</span>
                </span>
                <Textarea
                  value={approveComment}
                  onChange={(e) => setApproveComment(e.target.value)}
                  rows={3}
                  placeholder="可補充核准意見供下一站簽核人參考"
                />
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="tertiary">取消</Button>
            </DialogClose>
            <Button variant="secondary" onClick={() => { setApproveConfirmOpen(false); handleBatchApprove(approveComment.trim() || undefined) }}>
              確認核准
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 批次退件確認 modal — 退件原因必填;紅色強調留給 dialog 內最終確認(DS canonical) */}
      <Dialog open={rejectConfirmOpen} onOpenChange={setRejectConfirmOpen}>
        <DialogContent height="hug" maxWidth={440}>
          <DialogHeader>
            <DialogTitle>退件 {selectedIds.size} 件申請單</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <div className="flex flex-col gap-3">
              {hiddenSelectedCount > 0 && (
                <p className="text-body text-fg-secondary">
                  其中 {hiddenSelectedCount} 張已勾選的單據不在目前搜尋結果中，確認後將一併退件。
                </p>
              )}
              <div className="flex flex-col gap-1.5">
                <span className="text-body font-medium">
                  退件原因 <span className="text-fg-danger">*</span>
                </span>
                <Textarea
                  value={rejectComment}
                  onChange={(e) => setRejectComment(e.target.value)}
                  rows={3}
                  placeholder="請說明退件原因，讓申請人能依此修正再送"
                />
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="tertiary">取消</Button>
            </DialogClose>
            <Button
              variant="secondary"
              danger
              disabled={rejectComment.trim().length === 0}
              onClick={() => { setRejectConfirmOpen(false); handleBatchRejectSubmit() }}
            >
              確認退件
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>

    </AppShell>
    </SidebarProvider>
  )
}

export default function App() {
  return (
    <TooltipProvider delayDuration={500} skipDelayDuration={300}>
      <div className="h-svh bg-canvas">
        <ApprovalPage />
      </div>
    </TooltipProvider>
  )
}
