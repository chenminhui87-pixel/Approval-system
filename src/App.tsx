import { useState } from 'react'
import {
  AppShell,
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  TooltipProvider,
  Avatar,
  ItemAvatar,
  Tabs,
  TabsList,
  TabsTrigger,
  Chip,
  ChipGroup,
  SegmentedControl,
  SegmentedControlItem,
  Tag,
} from '@qijenchen/design-system'
import {
  ClipboardList,
  LayoutGrid,
  List,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
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

const NAV = [{ id: 'approval', label: '簽核管理', icon: ClipboardList }] as const

const URGENCY_COLOR = {
  high: 'red',
  medium: 'yellow',
  low: 'neutral',
} as const

const URGENCY_LABEL = {
  high: '緊急',
  medium: '一般',
  low: '低',
} as const

const STATUS_COLOR = {
  pending: 'blue',
  approved: 'green',
  rejected: 'red',
} as const

const STATUS_LABEL = {
  pending: '簽核中',
  approved: '已核准',
  rejected: '已退件',
} as const

const STATUS_ICON = {
  pending: Clock,
  approved: CheckCircle2,
  rejected: XCircle,
}

function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 min-w-0 group-data-[collapsible=icon]:justify-center">
          <Avatar alt="簽核系統" size={24} shape="square" color="blue" solid />
          <span className="text-body-lg font-medium truncate group-data-[collapsible=icon]:hidden">
            簽核系統
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV.map(({ id, label, icon }) => (
                <SidebarMenuItem key={id}>
                  <SidebarMenuButton id={id} startIcon={icon} tooltip={label}>
                    {label}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <div role="group" aria-label="當前使用者">
                <ItemAvatar alt={CURRENT_USER} color="blue" />
                <span data-sidebar="menu-label" className="min-w-0 flex-1 truncate">
                  {CURRENT_USER}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

function PageHeader({ title }: { title: string }) {
  return (
    <header className="flex items-center gap-2 h-[var(--chrome-header-height)] px-[var(--layout-space-loose)] bg-surface border-b border-divider">
      <SidebarTrigger />
      <h1 className="text-body-lg font-medium flex-1 truncate">{title}</h1>
    </header>
  )
}

function RecordCard({
  record,
  onClick,
}: {
  record: ApprovalRecord
  onClick: () => void
}) {
  const StatusIcon = STATUS_ICON[record.status]
  const currentStepLabel = record.steps.find((s) => s.status === 'current')?.label

  return (
    <button
      onClick={onClick}
      className="text-left w-full rounded-lg border border-divider bg-surface p-4 hover:bg-surface-hover transition-colors flex flex-col gap-3"
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
        {currentStepLabel && (
          <>
            <span>·</span>
            <span>{currentStepLabel}</span>
          </>
        )}
      </div>

      <div className="flex items-center justify-between text-caption text-fg-placeholder">
        <span>{record.applicant}</span>
        <span>{record.submittedAt}</span>
      </div>

      <div className="text-caption text-fg-placeholder">#{record.id}</div>
    </button>
  )
}

function RecordList({
  records,
  onClick,
}: {
  records: ApprovalRecord[]
  onClick: (r: ApprovalRecord) => void
}) {
  return (
    <div className="rounded-lg border border-divider overflow-hidden">
      <table className="w-full text-body">
        <thead>
          <tr className="border-b border-divider bg-muted">
            {['單號', '標題', '申請者', '緊急程度', '狀態', '申請時間'].map((h) => (
              <th
                key={h}
                className="text-left px-4 py-2.5 text-caption text-fg-secondary font-medium"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {records.map((r) => (
            <tr
              key={r.id}
              onClick={() => onClick(r)}
              className="border-b border-divider last:border-0 hover:bg-surface-hover cursor-pointer transition-colors"
            >
              <td className="px-4 py-3 text-caption text-fg-secondary">{r.id}</td>
              <td className="px-4 py-3 font-medium max-w-xs truncate">{r.title}</td>
              <td className="px-4 py-3 text-fg-secondary">{r.applicant}</td>
              <td className="px-4 py-3">
                {r.urgency !== 'low' && (
                  <Tag size="sm" color={URGENCY_COLOR[r.urgency]}>
                    {URGENCY_LABEL[r.urgency]}
                  </Tag>
                )}
              </td>
              <td className="px-4 py-3">
                <Tag size="sm" color={STATUS_COLOR[r.status]}>
                  {STATUS_LABEL[r.status]}
                </Tag>
              </td>
              <td className="px-4 py-3 text-caption text-fg-secondary">{r.submittedAt}</td>
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

const TAB_LABELS: Record<TabId, string> = {
  'pending-me': '待我簽核',
  submitted: '已申請',
  signed: '已簽核',
}

function ApprovalPage() {
  const [tab, setTab] = useState<TabId>('pending-me')
  const [category, setCategory] = useState<CategoryId | 'all'>('all')
  const [view, setView] = useState<ViewMode>('card')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [records, setRecords] = useState<ApprovalRecord[]>(MOCK_RECORDS)

  const tabRecords = getTabRecords(tab, records, CURRENT_USER)
  const filtered =
    category === 'all' ? tabRecords : tabRecords.filter((r) => r.category === category)
  // Re-derive the selected record from state so it reflects latest changes
  const selectedRecord = selectedId ? records.find((r) => r.id === selectedId) ?? null : null

  function openRecord(r: ApprovalRecord) {
    setSelectedId(r.id)
    setModalOpen(true)
  }

  function handleApprove(id: string, comment?: string) {
    setRecords((prev) =>
      prev.map((r) => (r.id === id ? approveRecord(r, CURRENT_USER, comment) : r)),
    )
    setModalOpen(false)
  }

  function handleReject(id: string, comment: string) {
    setRecords((prev) =>
      prev.map((r) => (r.id === id ? rejectRecord(r, CURRENT_USER, comment) : r)),
    )
    setModalOpen(false)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Underline tabs */}
      <div className="border-b border-divider px-[var(--layout-space-loose)]">
        <Tabs value={tab} onValueChange={(v: string) => setTab(v as TabId)}>
          <TabsList>
            {(Object.keys(TAB_LABELS) as TabId[]).map((t) => (
              <TabsTrigger key={t} value={t}>
                {TAB_LABELS[t]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Filter bar */}
      <div className="flex items-center justify-between px-[var(--layout-space-loose)] py-3 gap-4">
        <ChipGroup
          type="single"
          value={category}
          onValueChange={(v: string) => setCategory((v ?? 'all') as CategoryId | 'all')}
          layout="scroll"
        >
          <Chip value="all">全部類別</Chip>
          {CATEGORIES.map((c) => (
            <Chip key={c.id} value={c.id}>
              {c.label}
            </Chip>
          ))}
        </ChipGroup>

        <SegmentedControl
          value={view}
          onValueChange={(v: string | undefined) => v && setView(v as ViewMode)}
          size="sm"
          iconOnly
        >
          <SegmentedControlItem value="card" startIcon={LayoutGrid} aria-label="卡片模式" />
          <SegmentedControlItem value="list" startIcon={List} aria-label="列表模式" />
        </SegmentedControl>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto px-[var(--layout-space-loose)] pb-6">
        {filtered.length === 0 ? (
          <EmptyState message={`目前沒有${TAB_LABELS[tab]}的單據`} />
        ) : view === 'card' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((r) => (
              <RecordCard key={r.id} record={r} onClick={() => openRecord(r)} />
            ))}
          </div>
        ) : (
          <RecordList records={filtered} onClick={openRecord} />
        )}
      </div>

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
  const [activeId, setActiveId] = useState<string>('approval')

  return (
    <TooltipProvider delayDuration={500} skipDelayDuration={300}>
      <SidebarProvider activeId={activeId} onActiveChange={setActiveId}>
        <AppShell
          layout="primary-sidebar"
          sidebar={<AppSidebar />}
          header={<PageHeader title="簽核管理" />}
        >
          <ApprovalPage />
        </AppShell>
      </SidebarProvider>
    </TooltipProvider>
  )
}
