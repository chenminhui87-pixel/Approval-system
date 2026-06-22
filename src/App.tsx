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
  Input,
  toast,
  Toaster,
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
  const submittedDate = record.submittedAt.slice(0, 10).replace(/-/g, '/')

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
          <span className="text-fg-placeholder shrink-0">申請人：</span>
          <Avatar
            alt={record.applicant}
            size={14}
            color={nameToAvatarColor(record.applicant) as Parameters<typeof Avatar>[0]['color']}
          />
          <span>{record.applicant}</span>
        </div>

        {/* Row 3: 代理人 */}
        <div className="flex items-center gap-1 text-caption text-fg-secondary min-w-0">
          <span className="text-fg-placeholder shrink-0">代理人：</span>
          <span className="truncate">{record.agents && record.agents.length > 0 ? record.agents.join('、') : '-'}</span>
        </div>

        {/* Row 4: date + status + urgency */}
        <div className="flex items-center justify-between gap-2 text-caption">
          <span className="text-fg-placeholder">{submittedDate}</span>
          <div className="flex items-center gap-1.5 shrink-0">
            <Tag size="sm" color={STATUS_COLOR[record.status]}>{STATUS_LABEL[record.status]}</Tag>
            {record.urgency === 'high' && (
              <Tag size="sm" color="red">緊急</Tag>
            )}
          </div>
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
}: {
  records: ApprovalRecord[]
  selectedIds: Set<string>
  allSelected: boolean
  someSelected: boolean
  onToggleSelectAll: () => void
  onToggleSelect: (id: string) => void
  onClick: (r: ApprovalRecord) => void
}) {
  const thCls = 'text-left px-4 py-2.5 text-caption text-fg-secondary font-medium whitespace-nowrap'
  const tdBase = 'px-4 py-3 cursor-pointer'

  return (
    <div className="rounded-lg border border-divider overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-body min-w-[860px]">
          <thead>
            <tr className="border-b border-divider bg-muted">
              <th className="px-4 py-2.5 w-10">
                <RowCheckbox checked={allSelected} indeterminate={someSelected} onChange={onToggleSelectAll} />
              </th>
              <th className={thCls}>標題</th>
              <th className={thCls}>申請人</th>
              <th className={`${thCls} hidden md:table-cell`}>代理人</th>
              <th className={thCls}>申請時間</th>
              <th className={thCls}>狀態</th>
              <th className={`${thCls} hidden sm:table-cell`}>緊急程度</th>
              <th className={`${thCls} hidden md:table-cell`}>到期時間</th>
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
                  className={`border-b border-divider last:border-0 transition-colors cursor-pointer ${
                    selectedIds.has(r.id) ? 'bg-primary/5' : 'hover:bg-surface-hover'
                  }`}
                >
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <RowCheckbox checked={selectedIds.has(r.id)} onChange={() => onToggleSelect(r.id)} />
                  </td>
                  <td className={`${tdBase} font-medium max-w-xs`}>
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
                  <td className={`${tdBase} text-caption hidden md:table-cell ${dlUrgent ? 'text-fg-danger' : 'text-fg-secondary'}`}>
                    {dlText}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
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

  const tabRecords = getTabRecords(tab, records, CURRENT_USER)
  const filtered = tabRecords
    .filter((r) => category === 'all' || r.category === category)
    .filter((r) => !search || r.title.includes(search) || r.applicant.includes(search) || r.id.includes(search))

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
        <Input
          type="search"
          startIcon={Search}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜尋單號、標題、申請者…"
          endAction={search ? { icon: X, label: '清除', onClick: () => setSearch('') } : undefined}
        />

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
                <Button
                  variant="tertiary"
                  size="sm"
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
