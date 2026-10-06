import { useState } from 'react'
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
} from '@qijenchen/design-system'
import {
  LayoutGrid,
  List,
  AlertCircle,
  Search,
  X,
  ChevronLeft,
  Share2,
  UserCheck,
  Undo2,
  Ban,
  Plus,
  MoreHorizontal,
  FileText,
  ClipboardList,
  CheckCircle2,
  Send,
  Forward,
  Info,
} from 'lucide-react'
import {
  MOCK_RECORDS,
  CATEGORIES,
  CURRENT_USER,
  getTabRecords,
  approveRecord,
  rejectRecord,
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
  activeId,
  fullHeight,
}: {
  records: ApprovalRecord[]
  selectedIds: Set<string>
  allSelected: boolean
  someSelected: boolean
  onToggleSelectAll: () => void
  onToggleSelect: (id: string) => void
  onClick: (r: ApprovalRecord) => void
  /** 目前面板開著的單據 id → 該列 info 鈕呈 pressed/checked */
  activeId: string | null
  fullHeight?: boolean
}) {
  const thCls = 'text-left px-4 py-2.5 text-caption text-fg-secondary font-medium whitespace-nowrap'
  const tdBase = 'px-4 py-3 cursor-pointer'

  const tableEl = (
    <table className="w-full text-body min-w-[860px]">
      <thead>
        <tr className="border-b border-divider bg-muted">
          {/* 凍結左欄:checkbox + 標題(標題右緣 stroke) */}
          <th className="sticky left-0 z-20 bg-muted w-12 px-0 py-2.5">
            <div className="flex items-center justify-center">
              <RowCheckbox checked={allSelected} indeterminate={someSelected} onChange={onToggleSelectAll} />
            </div>
          </th>
          <th className={`${thCls} sticky left-12 z-20 bg-muted border-r border-divider`}>標題</th>
          <th className={thCls}>申請人</th>
          <th className={`${thCls} hidden md:table-cell`}>代理人</th>
          <th className={thCls}>申請時間</th>
          <th className={thCls}>狀態</th>
          <th className={`${thCls} hidden sm:table-cell`}>緊急程度</th>
          <th className={`${thCls} hidden md:table-cell`}>到期時間</th>
          {/* 凍結右欄:操作(左緣 stroke) */}
          <th className="sticky right-0 z-20 bg-muted border-l border-divider px-3 py-2.5 w-12" aria-label="操作" />
        </tr>
      </thead>
      <tbody>
        {records.map((r) => {
          const { text: dlText, urgent: dlUrgent } = deadlineDisplay(r.dueDate)
          const submittedDate = r.submittedAt.slice(0, 10).replace(/-/g, '/')
          return (
            <tr
              key={r.id}
              onClick={() => onClick(r)}
              className={`group border-b border-divider last:border-0 transition-colors cursor-pointer ${
                selectedIds.has(r.id) ? 'bg-primary/5' : 'hover:bg-surface-hover'
              }`}
            >
              {/* 凍結左欄:checkbox + 標題(標題右緣 stroke) */}
              <td className="sticky left-0 z-20 bg-surface group-hover:bg-surface-hover w-12 px-0 py-3" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-center">
                  <RowCheckbox checked={selectedIds.has(r.id)} onChange={() => onToggleSelect(r.id)} />
                </div>
              </td>
              <td className={`${tdBase} sticky left-12 z-20 bg-surface group-hover:bg-surface-hover border-r border-divider font-medium max-w-xs`}>
                <span className="line-clamp-2">{r.title}</span>
              </td>
              <td className={`${tdBase} text-fg-secondary whitespace-nowrap`}>{r.applicant}</td>
              <td className={`${tdBase} text-fg-secondary hidden md:table-cell`}>
                {r.agents && r.agents.length > 0 ? r.agents.join('、') : '-'}
              </td>
              <td className={`${tdBase} text-caption text-fg-secondary whitespace-nowrap`}>{submittedDate}</td>
              <td className={tdBase}>
                <Tag size="sm" color={STATUS_COLOR[r.status]}>{STATUS_LABEL[r.status]}</Tag>
              </td>
              <td className={`${tdBase} hidden sm:table-cell`}>
                {r.urgency === 'high' ? <Tag size="sm" color="red">緊急</Tag> : <span className="text-fg-placeholder">-</span>}
              </td>
              <td className={`${tdBase} text-caption hidden md:table-cell ${dlUrgent ? 'text-error-text' : 'text-fg-secondary'}`}>
                {dlText}
              </td>
              {/* 凍結右欄:info 按鈕(左緣 stroke),面板開著該列時 pressed */}
              <td
                className="sticky right-0 z-20 bg-surface group-hover:bg-surface-hover border-l border-divider px-2 py-3 w-12 text-center"
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  variant="text"
                  size="sm"
                  iconOnly
                  startIcon={Info}
                  pressed={activeId === r.id}
                  aria-label="展開詳情"
                  onClick={() => onClick(r)}
                />
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )

  if (fullHeight) {
    return (
      <div className="flex-1 min-h-0 overflow-auto rounded-lg border border-divider">
        {tableEl}
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-divider overflow-hidden">
      <div className="overflow-x-auto">
        {tableEl}
      </div>
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

  const tabRecords = getTabRecords(tab, records, CURRENT_USER)
  const searchFiltered = tabRecords
    .filter((r) => !search || r.title.includes(search) || r.applicant.includes(search) || r.id.includes(search))
  const filtered = searchFiltered
    .filter((r) => category === 'all' || r.category === category)

  const selectedRecord = selectedId ? records.find((r) => r.id === selectedId) ?? null : null
  const isSelecting = selectedIds.size > 0
  const allVisibleSelected = filtered.length > 0 && filtered.every((r) => selectedIds.has(r.id))
  const someSelected = selectedIds.size > 0 && !allVisibleSelected

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

  function handleBatchApprove() {
    const count = [...selectedIds].filter((id) => records.find((r) => r.id === id)?.status === 'pending').length
    setRecords((prev) => prev.map((r) => selectedIds.has(r.id) && r.status === 'pending' ? approveRecord(r, CURRENT_USER) : r))
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
      header={<PageHeader title="簽核管理" onOpenForms={() => setFormMgrOpen(true)} />}
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
        <Tabs value={tab} onValueChange={(v: string) => { setTab(v as TabId); setSelectedIds(new Set()); setSearch('') }}>
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
          pt-8 明顯拉開與上方 tab 的距離(table 上方不加 divider) */}
      <div className="flex flex-col gap-3 px-[var(--layout-space-loose)] pt-8 pb-4">
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
          {/* flex-1 min-w-0 讓 menu layout 能偵測溢出 → 顯示向下箭頭收合鈕;
              category-chips class 供 globals.css 給溢出 ▼ 鈕加框(對齊 chip pill) */}
          <div className="flex-1 min-w-0 category-chips">
          <ChipGroup
            type="single"
            value={category}
            onValueChange={(v: string) => setCategory((v ?? 'all') as CategoryId | 'all')}
            layout="menu"
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
            {CATEGORIES.map((c) => {
              const catCount = searchFiltered.filter((r) => r.category === c.id).length
              const catHasAlert = searchFiltered.some((r) => r.category === c.id && r.urgency === 'high')
              // 只顯示該 tab(+搜尋)下有單據的類別;目前選取中的類別一律保留(避免 chip 消失)
              if (catCount === 0 && category !== c.id) return null
              return (
                <Chip key={c.id} value={c.id}>
                  <span className="flex items-center gap-1">
                    {c.label}
                    <Badge variant={catHasAlert ? 'critical' : 'low'} count={catCount} />
                  </span>
                </Chip>
              )
            })}
          </ChipGroup>
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
      <div className={`flex-1 min-h-0 ${view === 'list' ? 'flex flex-col p-4' : 'overflow-y-auto px-[var(--layout-space-loose)] py-4'}`}>
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
            activeId={panelOpen ? selectedId : null}
            fullHeight
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
                <span className="text-body text-fg-secondary">已選取 {selectedIds.size} 項</span>
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

              {/* Secondary actions */}
              <div className="flex items-center gap-1">
                <Button variant="tertiary" size="sm" startIcon={Share2} onClick={() => handleStub('轉寄')}>轉寄</Button>
                <Button variant="tertiary" size="sm" startIcon={UserCheck} onClick={() => handleStub('移交 Owner')}>移交</Button>
                <Button variant="tertiary" size="sm" startIcon={Undo2} onClick={() => handleStub('退回給申請人')}>退回</Button>
                <Button variant="tertiary" size="sm" danger startIcon={Ban} onClick={() => handleStub('作廢')}>作廢</Button>
              </div>

              {/* Primary actions */}
              <div className="flex items-center gap-2 shrink-0">
                <Button variant="secondary" danger onClick={() => { setRejectComment(''); setBottomBarMode('reject') }}>
                  拒絕
                </Button>
                <Button variant="secondary" onClick={handleBatchApprove}>
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
