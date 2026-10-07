import { useState, useRef, useEffect } from 'react'
import {
  TooltipProvider,
  AppShell,
  Avatar,
  Tabs,
  TabsList,
  TabsTrigger,
  Chip,
  ChipGroup,
  SegmentedControl,
  SegmentedControlItem,
  Tag,
  Button,
  Textarea,
  Checkbox,
  Input,
  Badge,
  toast,
  Toaster,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  ProfileCard,
  DataTable,
  type DataTableProps,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogClose,
} from '@qijenchen/design-system'
// HoverCard 非 root front-door(DS 標 internal)。但 align=center 鎖死在 Avatar.hoverCard,
// 代理人清單卡需靠左對齊 → 走 DS 官方 subpath export(非 /src、非 /dist 深層路徑,
// 符合 lint-ds-internal-imports 允許清單 + DS「internal 元件 subpath 包裝後可用」規範)。
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@qijenchen/design-system/components/HoverCard'
import {
  LayoutGrid,
  List,
  AlertCircle,
  Search,
  X,
  ChevronLeft,
  Plus,
  MoreHorizontal,
  FileText,
  ClipboardList,
  CheckCircle2,
  Send,
  Forward,
  Info,
  ChevronDown,
} from 'lucide-react'
import {
  MOCK_RECORDS,
  CATEGORIES,
  CURRENT_USER,
  getTabRecords,
  approveRecord,
  rejectRecord,
  getPerson,
  type ApprovalRecord,
  type CategoryId,
} from './data'
import { ApprovalDetailPanel } from './ApprovalDetailPanel'
import { ApprovalModal } from './ApprovalModal'
import { FormTemplateManager } from './FormTemplateManager'
import { DetailAside } from './DetailAside'


const AVATAR_COLORS = ['blue', 'violet', 'emerald', 'amber', 'rose', 'cyan', 'orange'] as const
function nameToAvatarColor(name: string) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  return AVATAR_COLORS[h % AVATAR_COLORS.length]
}
const STATUS_COLOR = { pending: 'blue', approved: 'green', rejected: 'red' } as const
const STATUS_LABEL = { pending: '簽核中', approved: '已核准', rejected: '已退件' } as const

// 示意頭像 — 色底圓 + 白色人形 silhouette(data-uri SVG),無文字,各人以顏色區分
const COLOR_HEX: Record<string, string> = {
  blue: '#3b82f6', violet: '#8b5cf6', emerald: '#10b981', amber: '#f59e0b',
  rose: '#f43f5e', cyan: '#06b6d4', orange: '#f97316',
}
function personAvatarSrc(name: string): string {
  const hex = COLOR_HEX[nameToAvatarColor(name)] ?? '#64748b'
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect width="24" height="24" fill="${hex}"/><circle cx="12" cy="9" r="3.4" fill="#fff"/><path d="M12 13.1c-3.7 0-6.3 2.1-6.3 5V20h12.6v-1.9c0-2.9-2.6-5-6.3-5z" fill="#fff"/></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

// 人員頭像 — hover 顯示 DS ProfileCard(完整欄位)
function personProfileCard(name: string) {
  const p = getPerson(name)
  return (
    // DS「+ Info fields」版本:subtitle + fields(移除 status 區:燈號 + 簡易訊息)
    <ProfileCard
      name={name}
      avatar={{ src: personAvatarSrc(name), alt: name }}
      subtitle={p.title}
      defaultFieldValues={{ id: p.id, employeeNumber: p.employeeNumber }}
      fields={[
        { label: '組織課名代碼', value: p.deptCode },
        { label: '電子郵件', value: p.email },
        { label: '電話', value: p.phone },
        { label: '地點', value: p.location },
      ]}
    />
  )
}
function PersonAvatar({ name, size = 22 }: { name: string; size?: number }) {
  return (
    <Avatar
      alt={name}
      size={size}
      src={personAvatarSrc(name)}
      hoverCard={personProfileCard(name)}
    />
  )
}

// 申請人 — 頭像 + 名字
function Applicant({ name }: { name: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
      <PersonAvatar name={name} />
      <span>{name}</span>
    </span>
  )
}

// 代理人 — 多頭像 overlap stack(可能多位),各自 hover ProfileCard
// 代理人 hover 的自刻清單卡 — 每人:組織課名代碼 ｜ ID ｜ 工號
function AgentListCard({ agents }: { agents: string[] }) {
  return (
    <div className="w-[320px] bg-surface-raised rounded-lg border border-border overflow-hidden">
      <div className="divide-y divide-divider max-h-[320px] overflow-auto">
        {agents.map((name) => {
          const p = getPerson(name)
          return (
            <div key={name} className="px-4 py-3 flex items-start gap-2.5">
              <Avatar alt={name} size={28} src={personAvatarSrc(name)} />
              <div className="min-w-0 flex-1">
                <div className="text-body font-medium mb-1 truncate">{name}</div>
                <div className="text-caption text-fg-secondary">
                  {p.deptCode} ｜ {p.id} ｜ {p.employeeNumber}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// 代理人 — 多頭像 overlap stack;hover 整組顯示「代理人清單卡」
// 走 DS HoverCard primitives(非 Avatar.hoverCard,後者鎖死 align=center)→
// 可用 align="start" 讓卡片靠頭像組左緣對齊。
function AgentAvatars({ agents }: { agents?: string[] }) {
  if (!agents || agents.length === 0) return <span className="text-fg-placeholder">-</span>
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <span className="inline-flex items-center cursor-default">
          {agents.map((a, i) => (
            <span
              key={a + i}
              className={`rounded-full ring-2 ring-surface ${i > 0 ? '-ml-2' : ''}`}
              style={{ zIndex: agents.length - i }}
            >
              <Avatar alt={a} size={22} src={personAvatarSrc(a)} />
            </span>
          ))}
        </span>
      </HoverCardTrigger>
      <HoverCardContent align="start" className="p-0 w-auto border-0 bg-transparent shadow-none">
        <AgentListCard agents={agents} />
      </HoverCardContent>
    </HoverCard>
  )
}

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

function PageHeader({ title, onOpenForms }: { title: string; onOpenForms: () => void }) {
  return (
    <header className="flex items-center gap-3 h-[var(--chrome-header-height)] px-[var(--layout-space-loose)] bg-surface border-b border-divider">
      <Avatar alt="簽核系統" size={24} shape="square" color="blue" solid />
      <h1 className="text-body-lg font-medium flex-1 truncate">{title}</h1>
      {/* 管理/設定類暫時入口 — 創建申請單表單(未來交下游系統) */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="text" size="sm" iconOnly startIcon={MoreHorizontal} aria-label="更多" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem startIcon={FileText} onClick={onOpenForms}>創建申請單表單</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <button
        type="button"
        aria-label={`${CURRENT_USER}（個人設定）`}
        className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Avatar alt={CURRENT_USER} size={32} color="blue" />
      </button>
    </header>
  )
}

function RecordCard({
  record,
  selected,
  onToggleSelect,
  onClick,
}: {
  record: ApprovalRecord
  selected: boolean
  onToggleSelect: () => void
  onClick: () => void
}) {
  const submittedDate = record.submittedAt.slice(0, 10).replace(/-/g, '/')
  const { text: dlText, urgent: dlUrgent } = deadlineDisplay(record.dueDate)

  return (
    <div
      className={`rounded-lg border bg-surface transition-colors flex items-stretch ${
        selected ? 'border-primary bg-primary/5' : 'border-divider hover:bg-surface-hover'
      }`}
    >
      {/* Checkbox area */}
      <div
        className="flex items-start justify-center w-12 pt-3.5 shrink-0"
        onClick={(e) => { e.stopPropagation(); onToggleSelect() }}
      >
        <RowCheckbox checked={selected} onChange={onToggleSelect} />
      </div>

      {/* Content */}
      <button onClick={onClick} className="flex-1 min-w-0 py-3 pr-4 text-left flex flex-col gap-1.5">
        {/* Row 1: title */}
        <span className="text-body font-medium line-clamp-2">{record.title}</span>

        {/* Row 2: 申請人 */}
        <div className="flex items-center gap-1 text-caption text-fg-secondary">
          <span className="text-fg-muted shrink-0">申請人：</span>
          <Avatar
            alt={record.applicant}
            size={14}
            color={nameToAvatarColor(record.applicant) as Parameters<typeof Avatar>[0]['color']}
          />
          <span>{record.applicant}</span>
        </div>

        {/* Row 3: 代理人 */}
        <div className="flex items-center gap-1 text-caption text-fg-secondary min-w-0">
          <span className="text-fg-muted shrink-0">代理人：</span>
          <span className="truncate">{record.agents && record.agents.length > 0 ? record.agents.join('、') : '-'}</span>
        </div>

        {/* Row 4: date + overdue */}
        <div className="flex items-center justify-between gap-2 text-caption">
          <span className="text-fg-muted">{submittedDate}</span>
          {dlText !== '-' && (
            <span className={`shrink-0 ${dlUrgent ? 'text-error-text' : 'text-fg-secondary'}`}>
              {dlText}
            </span>
          )}
        </div>
      </button>
    </div>
  )
}

function RecordList({
  records,
  selectedIds,
  allSelected,
  someSelected,
  onToggleSelectAll,
  onToggleSelect,
  onClick,
  onOpenModal,
  activeId,
  showSelectAll,
}: {
  records: ApprovalRecord[]
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
    {
      id: 'select',
      meta: { width: 48, resizable: false },
      header: () =>
        showSelectAll ? (
          <div className="flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <RowCheckbox checked={allSelected} indeterminate={someSelected} onChange={onToggleSelectAll} />
          </div>
        ) : null,
      cell: ({ row }) => (
        <div className="flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
          <RowCheckbox checked={selectedIds.has(row.original.id)} onChange={() => onToggleSelect(row.original.id)} />
        </div>
      ),
    },
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
      meta: { width: 140 },
      cell: ({ row }) => <Applicant name={row.original.applicant} />,
    },
    {
      id: 'agents',
      header: '代理人',
      meta: { width: 120 },
      cell: ({ row }) => <AgentAvatars agents={row.original.agents} />,
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
        pinnedLeftColumns={['select', 'title']}
        pinnedRightColumns={['info']}
        // 呈現型表格,維持原手刻版的乾淨表頭:關閉欄位排序 / 隱藏(header ⌄ 空選單由
        // globals.css `.approval-datatable [data-col-menu]` 隱藏,避免蓋住 select 欄全選)
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
type ViewMode = 'card' | 'list'
type BottomBarMode = 'action' | 'reject'

const TAB_LABELS: Record<TabId, string> = {
  'pending-me': '待簽核',
  signed: '已簽核',
  submitted: '已申請',
  cc: '轉寄給我',
}
// icon 與 mobile 底部 tab 一致
const TAB_ICONS: Record<TabId, typeof ClipboardList> = {
  'pending-me': ClipboardList,
  signed: CheckCircle2,
  submitted: Send,
  cc: Forward,
}
// 順序即分組線索:審核者(待簽核→已簽核)相鄰在前,再申請者(已申請)、被轉寄者
// (轉寄給我)。不加分隔線 / 群組間距,純靠 icon + 順序區辨(per 設計決策 B)。
const TAB_ORDER: TabId[] = ['pending-me', 'signed', 'submitted', 'cc']

function ApprovalPage() {
  const [tab, setTab] = useState<TabId>('pending-me')
  const [category, setCategory] = useState<CategoryId | 'all'>('all')
  const [view, setView] = useState<ViewMode>('list')
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [formMgrOpen, setFormMgrOpen] = useState(false)
  const [records, setRecords] = useState<ApprovalRecord[]>(MOCK_RECORDS)
  const [bottomBarMode, setBottomBarMode] = useState<BottomBarMode>('action')
  const [rejectComment, setRejectComment] = useState('')
  // 批次核准確認 modal(對齊 DS「確認 = Dialog」+ mobile);附核准意見(選填,跟單張/退件一致)
  const [approveConfirmOpen, setApproveConfirmOpen] = useState(false)
  const [approveComment, setApproveComment] = useState('')

  const tabRecords = getTabRecords(tab, records, CURRENT_USER)
  const searchFiltered = tabRecords
    .filter((r) => !search || r.title.includes(search) || r.applicant.includes(search) || r.id.includes(search))
  const filtered = searchFiltered
    .filter((r) => category === 'all' || r.category === category)

  // 分類統計(給 chips + 下拉選單共用):只留該 tab(+搜尋)有單據的類別,
  // 目前選取中的類別一律保留(避免 chip / 選項消失)
  const categoryStats = CATEGORIES.map((c) => ({
    id: c.id,
    label: c.label,
    count: searchFiltered.filter((r) => r.category === c.id).length,
    hasAlert: searchFiltered.some((r) => r.category === c.id && r.urgency === 'high'),
  })).filter((c) => c.count > 0 || category === c.id)

  const selectedRecord = selectedId ? records.find((r) => r.id === selectedId) ?? null : null
  const isSelecting = selectedIds.size > 0
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
    setBottomBarMode('action')
    setRejectComment('')
  }

  function openRecord(r: ApprovalRecord) {
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

  return (
    <AppShell
      layout="primary-header"
      globalHeader={<PageHeader title="簽核管理" onOpenForms={() => setFormMgrOpen(true)} />}
      asideOpen={panelOpen && !!selectedRecord}
      onAsideOpenChange={setPanelOpen}
      aside={
        selectedRecord ? (
          <DetailAside title={selectedRecord.title} onExpand={() => setModalOpen(true)}>
            <ApprovalDetailPanel
              key={selectedRecord.id}
              record={selectedRecord}
              mode={tab === 'pending-me' ? 'approve' : 'view'}
              onApprove={handleApprove}
              onReject={handleReject}
              onMoreAction={handleStub}
            />
          </DetailAside>
        ) : undefined
      }
    >
    <div className="flex flex-col h-full">
      {/* Tabs — 不加 border-b,DS TabsList 自帶底線(避免雙線);pt-2 與 header 拉開 */}
      <div className="px-[var(--layout-space-loose)] pt-2">
        <Tabs value={tab} onValueChange={(v: string) => {
          const nextTab = v as TabId
          setTab(nextTab)
          setSelectedIds(new Set())
          setSearch('')
          // Q2 幽靈空清單修正:切 tab 後若目前分類在新 tab 沒有任何單據 → 退回「全部類別」,
          // 避免顯示一個 0 筆的分類 filter + 空表;分類在新 tab 仍有單據則保留(跨 tab 連續性)。
          if (category !== 'all') {
            const has = getTabRecords(nextTab, records, CURRENT_USER).some((r) => r.category === category)
            if (!has) setCategory('all')
          }
        }}>
          <TabsList>
            {TAB_ORDER.map((t) => (
              <TabsTrigger key={t} value={t} startIcon={TAB_ICONS[t]}>
                {TAB_LABELS[t]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Search + filter bar — 搜尋+篩選為同一 toolbar 區,內部 gap-3;
          pt-6(24px)tab↔search、pb-3(12px)chip↔table */}
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
          {/* 分類列:chips 水平捲動 + 自組單選下拉(導覽 / 溢出)。
              DS ChipGroup layout="menu" 的下拉用 checkbox item,不符「一次選一個」語意,
              故改 layout="scroll" + 自組 DropdownMenuRadioGroup(單選 + selected 高亮)。 */}
          <div className="flex-1 min-w-0 flex items-center gap-2 category-chips">
            {/* ScrollChipGroup 根節點(relative)無寬度約束 + className 只進內層 ToggleGroup,
                故需外包 flex-1 min-w-0 讓它填滿並由內層 overflow-x-auto 捲動(修 RWD) */}
            <div className="flex-1 min-w-0">
              <ChipGroup
                type="single"
                value={category}
                onValueChange={(v: string) => { setCategory((v ?? 'all') as CategoryId | 'all'); clearSelection() }}
                layout="scroll"
              >
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

            {/* 單選分類選單:一次只選一個 → Radio(selected 高亮),非 checkbox。
                簽單數用與 chip 相同的 Badge(不用純文字括號) */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="text" size="sm" iconOnly startIcon={ChevronDown} aria-label="分類選單" className="shrink-0" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="max-h-[60vh] overflow-auto">
                <DropdownMenuRadioGroup
                  value={category}
                  onValueChange={(v: string) => { setCategory(v as CategoryId | 'all'); clearSelection() }}
                >
                  <DropdownMenuRadioItem value="all">
                    <span className="flex items-center gap-1.5">
                      全部類別
                      <Badge
                        variant={searchFiltered.some((r) => r.urgency === 'high') ? 'critical' : 'low'}
                        count={searchFiltered.length}
                      />
                    </span>
                  </DropdownMenuRadioItem>
                  {categoryStats.map((c) => (
                    <DropdownMenuRadioItem key={c.id} value={c.id}>
                      <span className="flex items-center gap-1.5">
                        {c.label}
                        <Badge variant={c.hasAlert ? 'critical' : 'low'} count={c.count} />
                      </span>
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* 新增申請單 — 弱化:只在「已申請」(申請者視角)出現的次級按鈕。
              未來送單改由下游系統處理時,移除此一按鈕即可。 */}
          {tab === 'submitted' && (
            <Button variant="tertiary" size="sm" startIcon={Plus} onClick={() => handleStub('新增申請單')}>
              新增申請單
            </Button>
          )}

          <SegmentedControl
            value={view}
            onValueChange={(v: string | undefined) => v && setView(v as ViewMode)}
            size="sm"
            iconOnly
          >
            <SegmentedControlItem
              value="card"
              startIcon={LayoutGrid}
              aria-label="卡片模式"
              className="aria-checked:text-primary-hover aria-checked:border-primary-hover aria-checked:relative aria-checked:z-10"
            />
            <SegmentedControlItem
              value="list"
              startIcon={List}
              aria-label="列表模式"
              className="aria-checked:text-primary-hover aria-checked:border-primary-hover aria-checked:relative aria-checked:z-10"
            />
          </SegmentedControl>
        </div>
      </div>

      {/* Content */}
      <div className={`flex-1 min-h-0 ${view === 'list' ? 'flex flex-col px-[var(--layout-space-loose)] pb-4' : 'overflow-y-auto px-[var(--layout-space-loose)] py-4'}`}>
        {filtered.length === 0 ? (
          <EmptyState message="目前沒有相關單據" />
        ) : view === 'card' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((r) => (
              <RecordCard
                key={r.id}
                record={r}
                selected={selectedIds.has(r.id)}
                onToggleSelect={() => toggleSelect(r.id)}
                onClick={() => openRecord(r)}
              />
            ))}
          </div>
        ) : (
          <RecordList
            records={filtered}
            selectedIds={selectedIds}
            allSelected={allVisibleSelected}
            someSelected={someSelected}
            onToggleSelectAll={handleSelectAll}
            onToggleSelect={toggleSelect}
            onClick={openRecord}
            onOpenModal={openModalFor}
            activeId={panelOpen ? selectedId : null}
            showSelectAll={category !== 'all'}
          />
        )}
      </div>

      {/* Bottom action bar */}
      {isSelecting && (
        <div className="shrink-0 border-t border-divider bg-surface">
          {bottomBarMode === 'action' ? (
            <div className="flex items-center gap-3 px-[var(--layout-space-loose)] py-3">
              {/* Left: count + cancel */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-body text-fg-secondary">
                  已選取 {selectedIds.size} 項
                  {hiddenSelectedCount > 0 && (
                    <span className="text-fg-placeholder">（{hiddenSelectedCount} 項被搜尋隱藏）</span>
                  )}
                </span>
                <Button
                  variant="tertiary"
                  size="sm"
                  iconOnly
                  startIcon={X}
                  onClick={clearSelection}
                  aria-label="取消選取"
                />
              </div>

              <div className="flex-1" />

              {/* Primary actions — 僅退件 / 核准 */}
              <div className="flex items-center gap-2 shrink-0">
                <Button variant="secondary" danger onClick={() => { setRejectComment(''); setBottomBarMode('reject') }}>
                  退件
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => { setApproveComment(''); setApproveConfirmOpen(true) }}
                >
                  核准
                </Button>
              </div>
            </div>
          ) : (
            /* Reject confirm mode */
            <div className="flex flex-col gap-3 px-[var(--layout-space-loose)] py-3">
              <div className="flex items-center gap-2">
                <Button
                  variant="tertiary"
                  size="sm"
                  startIcon={ChevronLeft}
                  onClick={() => setBottomBarMode('action')}
                >
                  返回
                </Button>
                <span className="text-body font-medium flex-1">退件原因 <span className="text-fg-danger">*</span></span>
                <Button
                  variant="secondary"
                  danger
                  disabled={rejectComment.trim().length === 0}
                  onClick={handleBatchRejectSubmit}
                >
                  確認退件
                </Button>
              </div>
              <Textarea
                value={rejectComment}
                onChange={(e) => setRejectComment(e.target.value)}
                rows={2}
                placeholder="請說明退件原因，讓申請人能依此修正再送"
              />
            </div>
          )}
        </div>
      )}

      <Toaster />
      <ApprovalModal
        record={selectedRecord}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={tab === 'pending-me' ? 'approve' : 'view'}
        onApprove={handleApprove}
        onReject={handleReject}
        onMoreAction={handleStub}
      />
      <FormTemplateManager
        open={formMgrOpen}
        onClose={() => setFormMgrOpen(false)}
        onCreate={() => handleStub('新建表單')}
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
    </div>
    </AppShell>
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
