import { useState } from 'react'
import {
  TooltipProvider,
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
} from '@qijenchen/design-system'
import {
  LayoutGrid,
  List,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  X,
  ChevronLeft,
  Share2,
  UserCheck,
  Undo2,
  Ban,
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
import { ApprovalModal } from './ApprovalModal'

const URGENCY_COLOR = { high: 'red', medium: 'yellow', low: 'neutral' } as const
const URGENCY_LABEL = { high: '緊急', medium: '一般', low: '低' } as const
const STATUS_COLOR = { pending: 'blue', approved: 'green', rejected: 'red' } as const
const STATUS_LABEL = { pending: '簽核中', approved: '已核准', rejected: '已退件' } as const
const STATUS_ICON = { pending: Clock, approved: CheckCircle2, rejected: XCircle }

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

function PageHeader({ title }: { title: string }) {
  return (
    <header className="flex items-center gap-3 h-[var(--chrome-header-height)] px-[var(--layout-space-loose)] bg-surface border-b border-divider">
      <Avatar alt="簽核系統" size={24} shape="square" color="blue" solid />
      <h1 className="text-body-lg font-medium flex-1 truncate">{title}</h1>
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
  const StatusIcon = STATUS_ICON[record.status]
  const currentStepLabel = record.steps.find((s) => s.status === 'current')?.label

  return (
    <div
      className={`relative group rounded-lg border bg-surface transition-colors flex flex-col gap-3 ${
        selected ? 'border-primary bg-primary/5' : 'border-divider hover:bg-surface-hover'
      }`}
    >
      {/* Checkbox top-left */}
      <div className="absolute top-3 left-3 z-10">
        <RowCheckbox checked={selected} onChange={onToggleSelect} />
      </div>

      {/* Click area for detail */}
      <button
        onClick={onClick}
        className="text-left w-full p-4 pl-10 flex flex-col gap-3"
      >
        <div className="flex items-start justify-between gap-2">
          <span className="text-body font-medium line-clamp-2 flex-1">{record.title}</span>
          {record.urgency !== 'low' && (
            <Tag size="sm" color={URGENCY_COLOR[record.urgency]} className="shrink-0">
              {URGENCY_LABEL[record.urgency]}
            </Tag>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-caption text-fg-secondary">
          <StatusIcon size={14} />
          <span>{STATUS_LABEL[record.status]}</span>
          {currentStepLabel && <><span>·</span><span>{currentStepLabel}</span></>}
        </div>
        <div className="flex items-center justify-between text-caption text-fg-placeholder">
          <span>{record.applicant}</span>
          <span>{record.submittedAt}</span>
        </div>
        <div className="text-caption text-fg-placeholder">#{record.id}</div>
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
}: {
  records: ApprovalRecord[]
  selectedIds: Set<string>
  allSelected: boolean
  someSelected: boolean
  onToggleSelectAll: () => void
  onToggleSelect: (id: string) => void
  onClick: (r: ApprovalRecord) => void
}) {
  return (
    <div className="rounded-lg border border-divider overflow-hidden">
      <table className="w-full text-body">
        <thead>
          <tr className="border-b border-divider bg-muted">
            <th className="px-4 py-2.5 w-10">
              <RowCheckbox
                checked={allSelected}
                indeterminate={someSelected}
                onChange={onToggleSelectAll}
              />
            </th>
            {['單號', '標題', '申請者', '緊急程度', '狀態', '申請時間'].map((h) => (
              <th key={h} className="text-left px-4 py-2.5 text-caption text-fg-secondary font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {records.map((r) => (
            <tr
              key={r.id}
              className={`border-b border-divider last:border-0 transition-colors cursor-pointer ${
                selectedIds.has(r.id) ? 'bg-primary/5' : 'hover:bg-surface-hover'
              }`}
            >
              <td className="px-4 py-3">
                <RowCheckbox checked={selectedIds.has(r.id)} onChange={() => onToggleSelect(r.id)} />
              </td>
              <td className="px-4 py-3 text-caption text-fg-secondary" onClick={() => onClick(r)}>{r.id}</td>
              <td className="px-4 py-3 font-medium max-w-xs truncate" onClick={() => onClick(r)}>{r.title}</td>
              <td className="px-4 py-3 text-fg-secondary" onClick={() => onClick(r)}>{r.applicant}</td>
              <td className="px-4 py-3" onClick={() => onClick(r)}>
                {r.urgency !== 'low' && <Tag size="sm" color={URGENCY_COLOR[r.urgency]}>{URGENCY_LABEL[r.urgency]}</Tag>}
              </td>
              <td className="px-4 py-3" onClick={() => onClick(r)}>
                <Tag size="sm" color={STATUS_COLOR[r.status]}>{STATUS_LABEL[r.status]}</Tag>
              </td>
              <td className="px-4 py-3 text-caption text-fg-secondary" onClick={() => onClick(r)}>{r.submittedAt}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-fg-placeholder gap-2">
      <AlertCircle size={36} />
      <p className="text-body">{message}</p>
    </div>
  )
}

type TabId = 'pending-me' | 'submitted' | 'signed'
type ViewMode = 'card' | 'list'
type BottomBarMode = 'action' | 'reject'

const TAB_LABELS: Record<TabId, string> = {
  'pending-me': '待我簽核',
  submitted: '已申請',
  signed: '已簽核',
}

function ApprovalPage() {
  const [tab, setTab] = useState<TabId>('pending-me')
  const [category, setCategory] = useState<CategoryId | 'all'>('all')
  const [view, setView] = useState<ViewMode>('list')
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [records, setRecords] = useState<ApprovalRecord[]>(MOCK_RECORDS)
  const [bottomBarMode, setBottomBarMode] = useState<BottomBarMode>('action')
  const [rejectComment, setRejectComment] = useState('')
  const [pcToast, setPcToast] = useState<string | null>(null)

  const tabRecords = getTabRecords(tab, records, CURRENT_USER)
  const filtered = tabRecords
    .filter((r) => category === 'all' || r.category === category)
    .filter((r) => !search || r.title.includes(search) || r.applicant.includes(search) || r.id.includes(search))

  const selectedRecord = selectedId ? records.find((r) => r.id === selectedId) ?? null : null
  const isSelecting = selectedIds.size > 0
  const allVisibleSelected = filtered.length > 0 && filtered.every((r) => selectedIds.has(r.id))
  const someSelected = selectedIds.size > 0 && !allVisibleSelected

  function showToast(msg: string) {
    setPcToast(msg)
    setTimeout(() => setPcToast(null), 2500)
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
    setModalOpen(true)
  }

  function handleApprove(id: string, comment?: string) {
    setRecords((prev) => prev.map((r) => (r.id === id ? approveRecord(r, CURRENT_USER, comment) : r)))
    setModalOpen(false)
  }

  function handleReject(id: string, comment: string) {
    setRecords((prev) => prev.map((r) => (r.id === id ? rejectRecord(r, CURRENT_USER, comment) : r)))
    setModalOpen(false)
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
    <div className="flex flex-col h-full">
      {/* Tabs */}
      <div className="border-b border-divider px-[var(--layout-space-loose)]">
        <Tabs value={tab} onValueChange={(v: string) => { setTab(v as TabId); setSelectedIds(new Set()); setSearch('') }}>
          <TabsList>
            {(Object.keys(TAB_LABELS) as TabId[]).map((t) => (
              <TabsTrigger key={t} value={t}>{TAB_LABELS[t]}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Search + filter bar */}
      <div className="flex flex-col gap-2 px-[var(--layout-space-loose)] pt-3 pb-2 border-b border-divider">
        {/* Search row */}
        <div className="flex items-center gap-2 h-9 px-3 rounded-lg bg-muted">
          <Search size={15} className="text-fg-placeholder shrink-0" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜尋單號、標題、申請者…"
            className="flex-1 min-w-0 text-body text-foreground bg-transparent focus-visible:outline-none placeholder:text-fg-placeholder"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-fg-placeholder hover:text-fg-secondary shrink-0">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Chips + view toggle row */}
        <div className="flex items-center justify-between gap-4">
          <ChipGroup
            type="single"
            value={category}
            onValueChange={(v: string) => setCategory((v ?? 'all') as CategoryId | 'all')}
            layout="scroll"
          >
            <Chip value="all">全部類別</Chip>
            {CATEGORIES.map((c) => (
              <Chip key={c.id} value={c.id}>{c.label}</Chip>
            ))}
          </ChipGroup>

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
      <div className="flex-1 overflow-y-auto px-[var(--layout-space-loose)] py-4">
        {filtered.length === 0 ? (
          <EmptyState message={`目前沒有${TAB_LABELS[tab]}的單據`} />
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
                <button
                  onClick={clearSelection}
                  className="w-6 h-6 flex items-center justify-center rounded-full text-fg-placeholder hover:bg-surface-hover hover:text-fg-secondary transition-colors"
                  aria-label="取消選取"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="flex-1" />

              {/* Secondary actions */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleStub('轉寄')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-body text-fg-secondary hover:bg-surface-hover transition-colors"
                >
                  <Share2 size={15} />
                  轉寄
                </button>
                <button
                  onClick={() => handleStub('移交 Owner')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-body text-fg-secondary hover:bg-surface-hover transition-colors"
                >
                  <UserCheck size={15} />
                  移交
                </button>
                <button
                  onClick={() => handleStub('退回給申請人')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-body text-fg-secondary hover:bg-surface-hover transition-colors"
                >
                  <Undo2 size={15} />
                  退回
                </button>
                <button
                  onClick={() => handleStub('作廢')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-body text-fg-danger hover:bg-surface-hover transition-colors"
                >
                  <Ban size={15} />
                  作廢
                </button>
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
                <button
                  onClick={() => setBottomBarMode('action')}
                  className="flex items-center gap-1 text-body text-fg-secondary hover:text-foreground transition-colors"
                >
                  <ChevronLeft size={16} />
                  返回
                </button>
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

      {/* PC Toast */}
      {pcToast && (
        <div className="fixed bottom-6 right-6 z-[70] flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl bg-foreground text-canvas">
          <CheckCircle2 size={16} className="shrink-0" />
          <span className="text-body font-medium">{pcToast}</span>
        </div>
      )}

      <ApprovalModal
        record={selectedRecord}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={tab === 'pending-me' ? 'approve' : 'view'}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  )
}

export default function App() {
  return (
    <TooltipProvider delayDuration={500} skipDelayDuration={300}>
      <div className="flex flex-col h-svh bg-canvas">
        <PageHeader title="簽核管理" />
        <main className="flex-1 min-h-0 overflow-hidden">
          <ApprovalPage />
        </main>
      </div>
    </TooltipProvider>
  )
}
