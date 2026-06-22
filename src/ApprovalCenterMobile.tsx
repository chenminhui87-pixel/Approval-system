import { useState } from 'react'
import {
  TooltipProvider,
  Avatar,
  Tag,
  Button,
  Steps,
  StepItem,
  StepLabel,
  StepDescription,
  DescriptionList,
  DescriptionItem,
  Textarea,
  Separator,
  SegmentedControl,
  SegmentedControlItem,
  Checkbox,
  Badge,
  toast as dsToast,
  Toaster,
} from '@qijenchen/design-system'
import {
  ClipboardList,
  Send,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Paperclip,
  AlertCircle,
  Search,
  Sun,
  Moon,
  Monitor,
  LogOut,
  CheckSquare,
  Square,
  X,
  MoreHorizontal,
  Share2,
  UserCheck,
  Undo2,
  Ban,
  Newspaper,
  Laptop,
  Receipt,
  Plane,
  Calendar,
  Users,
  GraduationCap,
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
import { ApprovalRoute } from './ApprovalRoute'

// ─── Constants ────────────────────────────────────────────────────────────────

const URGENCY_COLOR = { high: 'red', medium: 'yellow', low: 'neutral' } as const
const URGENCY_LABEL = { high: '緊急', medium: '一般', low: '低' } as const
const STATUS_COLOR = { pending: 'blue', approved: 'green', rejected: 'red' } as const
const STATUS_LABEL = { pending: '簽核中', approved: '已核准', rejected: '已退件' } as const
// Fixed demo date matching mock data era so overdue calculations are meaningful
const TODAY = new Date('2026-06-18')
const OVERDUE_THRESHOLD_DAYS = 7

const CATEGORY_META: Record<CategoryId, { Icon: React.ElementType; iconBg: string; iconColor: string }> = {
  article:  { Icon: Newspaper, iconBg: 'bg-blue-100',   iconColor: 'text-blue-600' },
  computer: { Icon: Laptop,    iconBg: 'bg-violet-100', iconColor: 'text-violet-600' },
  expense:  { Icon: Receipt,   iconBg: 'bg-emerald-100',iconColor: 'text-emerald-600' },
  travel:   { Icon: Plane,     iconBg: 'bg-amber-100',  iconColor: 'text-amber-600' },
  vacation: { Icon: Calendar,  iconBg: 'bg-yellow-100', iconColor: 'text-yellow-600' },
  recruit:  { Icon: Users,         iconBg: 'bg-rose-100',   iconColor: 'text-rose-600' },
  training: { Icon: GraduationCap, iconBg: 'bg-pink-100',   iconColor: 'text-pink-600' },
}

const AVATAR_COLORS = ['blue', 'violet', 'emerald', 'amber', 'rose', 'cyan', 'orange'] as const
function nameToAvatarColor(name: string): string {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  return AVATAR_COLORS[h % AVATAR_COLORS.length]
}

type TabId = 'pending-me' | 'submitted' | 'signed'
type DetailTab = 'detail' | 'route'
type ThemeOption = 'light' | 'dark' | 'system'
type Screen = 'products' | 'requests'

type ProductItem = {
  id: CategoryId
  label: string
  Icon: React.ElementType
  iconBg: string
  iconColor: string
  count: number
  hasAlert: boolean
  overdueCount: number
  urgentCount: number
}

function getEffectiveTheme(theme: ThemeOption): 'light' | 'dark' {
  if (theme !== 'system') return theme
  return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

function computeProductItems(tab: TabId, records: ApprovalRecord[]): ProductItem[] {
  const tabRecords = getTabRecords(tab, records, CURRENT_USER)

  const priority = (item: { overdueCount: number; urgentCount: number }) =>
    item.overdueCount > 0 ? 0 : item.urgentCount > 0 ? 1 : 2

  return CATEGORIES.flatMap((cat) => {
    const catRecords = tabRecords.filter((r) => r.category === cat.id)
    if (catRecords.length === 0) return []

    const meta = CATEGORY_META[cat.id]
    let overdueCount = 0
    let urgentCount = 0

    catRecords.forEach((r) => {
      if (r.urgency === 'high') urgentCount++
      const [datePart, timePart] = r.submittedAt.split(' ')
      const submitted = new Date(`${datePart}T${timePart}`)
      const days = Math.floor((TODAY.getTime() - submitted.getTime()) / (1000 * 60 * 60 * 24))
      if (days > OVERDUE_THRESHOLD_DAYS) overdueCount++
    })

    const hasAlert = tab === 'pending-me' && (overdueCount > 0 || urgentCount > 0)

    return [{
      id: cat.id,
      label: cat.label,
      Icon: meta.Icon,
      iconBg: meta.iconBg,
      iconColor: meta.iconColor,
      count: catRecords.length,
      hasAlert,
      overdueCount,
      urgentCount,
    }]
  }).sort((a, b) => priority(a) - priority(b))
}

// ─── ProductListPanel ─────────────────────────────────────────────────────────

function ProductListPanel({
  tab,
  records,
  onSelectCategory,
}: {
  tab: TabId
  records: ApprovalRecord[]
  onSelectCategory: (cat: CategoryId) => void
}) {
  const items = computeProductItems(tab, records)

  return (
    <div className="flex-1 min-h-0 overflow-y-auto">
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-fg-placeholder gap-2 px-4">
          <AlertCircle size={32} />
          <p className="text-body">目前沒有相關單據</p>
        </div>
      ) : (
        <div className="bg-surface border-t border-b border-divider overflow-hidden">
          {items.map((item, idx) => {
            const IconComponent = item.Icon
            return (
              <button
                key={item.id}
                onClick={() => onSelectCategory(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-surface-hover active:bg-surface-hover transition-colors text-left ${
                  idx < items.length - 1 ? 'border-b border-divider' : ''
                }`}
              >
                {/* App-style icon */}
                <div
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0"
                >
                  <IconComponent size={16} className="text-gray-900" />
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className="text-body font-medium">{item.label}</p>
                  {item.hasAlert && (
                    <p className="text-caption text-fg-danger mt-0.5">
                      {item.overdueCount > 0
                        ? `${item.overdueCount} overdue`
                        : `${item.urgentCount} high priority`}
                    </p>
                  )}
                </div>

                {/* Badge + arrow */}
                <div className="flex items-center gap-2 shrink-0">
                  <Badge
                    variant={item.hasAlert ? 'critical' : 'low'}
                    count={item.count}
                  />
                  <ChevronRight size={16} className="text-fg-placeholder" />
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── ListRow ──────────────────────────────────────────────────────────────────

function ListRow({
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
  let deadlineText = ''
  let deadlineUrgent = false
  if (record.dueDate) {
    const due = new Date(record.dueDate + 'T00:00:00')
    const diffDays = Math.ceil((due.getTime() - TODAY.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays < 0) {
      deadlineText = `逾期 ${Math.abs(diffDays)} 天`
      deadlineUrgent = true
    } else if (diffDays === 0) {
      deadlineText = '今日到期'
      deadlineUrgent = true
    } else {
      deadlineText = `剩 ${diffDays} 天`
      deadlineUrgent = diffDays <= 3
    }
  }

  const submittedDate = record.submittedAt.slice(0, 10).replace(/-/g, '/')

  return (
    <div className={`flex items-stretch border-b border-divider ${selected ? 'bg-muted' : 'bg-surface'}`}>
      <div
        className="flex items-start justify-center w-12 pt-3.5 shrink-0"
        onClick={onToggleSelect}
      >
        <Checkbox checked={selected} onCheckedChange={onToggleSelect} onClick={(e) => e.stopPropagation()} />
      </div>

      <button
        onClick={onClick}
        className="flex-1 min-w-0 py-3 pr-4 text-left flex flex-col gap-1.5 active:bg-surface-hover"
      >
        {/* Row 1: title */}
        <span className="text-body font-medium line-clamp-2">{record.title}</span>

        {/* Row 2: 申請人 avatar + name */}
        <div className="flex items-center gap-1 text-caption text-fg-secondary">
          <span className="text-fg-placeholder shrink-0">申請人：</span>
          <Avatar alt={record.applicant} size={14} color={nameToAvatarColor(record.applicant) as Parameters<typeof Avatar>[0]['color']} />
          <span>{record.applicant}</span>
        </div>

        {/* Row 3: 代理人 */}
        <div className="flex items-center gap-1 text-caption text-fg-secondary min-w-0">
          <span className="text-fg-placeholder shrink-0">代理人：</span>
          <span className="truncate">{record.agents && record.agents.length > 0 ? record.agents.join('、') : '-'}</span>
        </div>

        {/* Row 4: submitted date left + deadline + urgency tag right */}
        <div className="flex items-center justify-between gap-2 text-caption">
          <span className="text-fg-placeholder">{submittedDate} Submitted</span>
          <div className="flex items-center gap-1.5 shrink-0">
            {deadlineText && (
              <span className={deadlineUrgent ? 'text-fg-danger' : 'text-fg-secondary'}>
                {deadlineText}
              </span>
            )}
            {record.urgency === 'high' && (
              <Tag size="sm" color="red">緊急</Tag>
            )}
          </div>
        </div>
      </button>
    </div>
  )
}

// ─── SettingsSheet ────────────────────────────────────────────────────────────

function SettingsSheet({
  open,
  theme,
  onThemeChange,
  onClose,
  onLogout,
}: {
  open: boolean
  theme: ThemeOption
  onThemeChange: (t: ThemeOption) => void
  onClose: () => void
  onLogout: () => void
}) {
  return (
    <div
      aria-hidden={!open}
      className={`absolute inset-0 z-30 flex flex-col bg-canvas transition-transform duration-300 ease-in-out ${
        open ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="flex items-center h-14 px-3 border-b border-divider bg-surface shrink-0">
        <button
          onClick={onClose}
          className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-surface-hover active:bg-surface-hover"
          aria-label="返回"
        >
          <ChevronLeft size={20} />
        </button>
        <h2 className="flex-1 text-center text-body font-semibold">設定</h2>
        <div className="w-8 shrink-0" />
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="flex flex-col items-center gap-2 py-8 mx-4 mt-4 rounded-2xl bg-surface border border-divider">
          <Avatar alt={CURRENT_USER} size={64} color="blue" />
          <p className="text-h4 font-semibold mt-1">{CURRENT_USER}</p>
          <p className="text-caption text-fg-secondary">chenminhui87@gmail.com</p>
        </div>

        <div className="flex flex-col gap-3 p-4">
          <section className="bg-surface rounded-2xl border border-divider p-4 flex flex-col gap-3">
            <p className="text-body font-medium">外觀主題</p>
            <SegmentedControl
              value={theme}
              onValueChange={(v: string | undefined) => v && onThemeChange(v as ThemeOption)}
              size="sm"
            >
              <SegmentedControlItem value="light" startIcon={Sun}>淺色</SegmentedControlItem>
              <SegmentedControlItem value="dark" startIcon={Moon}>深色</SegmentedControlItem>
              <SegmentedControlItem value="system" startIcon={Monitor}>系統</SegmentedControlItem>
            </SegmentedControl>
          </section>

          <section className="bg-surface rounded-2xl border border-divider overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-divider">
              <span className="text-body">版本</span>
              <span className="text-body text-fg-secondary">0.0.1</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3.5">
              <span className="text-body">設計系統</span>
              <span className="text-body text-fg-secondary">@qijenchen/ds</span>
            </div>
          </section>
        </div>
      </div>

      <div className="px-4 pb-8 pt-2 shrink-0">
        <Button
          variant="secondary"
          danger
          startIcon={LogOut}
          className="w-full"
          onClick={onLogout}
        >
          登出
        </Button>
      </div>
    </div>
  )
}

// ─── DetailSheet ──────────────────────────────────────────────────────────────

function DetailSheet({
  record,
  open,
  mode,
  onClose,
  onApprove,
  onReject,
  onMoreAction,
}: {
  record: ApprovalRecord | null
  open: boolean
  mode: 'approve' | 'view'
  onClose: () => void
  onApprove?: (id: string, comment?: string) => void
  onReject?: (id: string, comment: string) => void
  onMoreAction?: (label: string) => void
}) {
  const [detailTab, setDetailTab] = useState<DetailTab>('detail')
  const [confirmAction, setConfirmAction] = useState<'approve' | 'reject' | null>(null)
  const [comment, setComment] = useState('')
  const [singleMoreOpen, setSingleMoreOpen] = useState(false)

  function handleClose() {
    onClose()
    setDetailTab('detail')
    setConfirmAction(null)
    setComment('')
  }

  function submit() {
    if (!confirmAction || !record) return
    if (confirmAction === 'approve') {
      onApprove?.(record.id, comment.trim() || undefined)
    } else {
      onReject?.(record.id, comment.trim())
    }
    setConfirmAction(null)
    setComment('')
  }

  const submitDisabled = confirmAction === 'reject' && comment.trim().length === 0
  const canApprove = !!record && mode === 'approve' && record.status === 'pending'
  const hasRichRoute = record?.steps.some((s) => s.people && s.people.length > 0)
  const currentStep = record?.steps.find((s) => s.status === 'current')
  const completedValues = record?.steps.filter((s) => s.status === 'completed').map((s) => s.id) ?? []
  const errorValues = record?.steps.filter((s) => s.status === 'error').map((s) => s.id) ?? []

  return (
    <div
      aria-hidden={!open}
      className={`absolute inset-0 z-20 flex flex-col bg-canvas transition-transform duration-300 ease-in-out ${
        open ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="flex items-center gap-2 h-14 px-3 border-b border-divider bg-surface shrink-0">
        <button
          onClick={handleClose}
          className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-surface-hover active:bg-surface-hover -ml-0.5 shrink-0"
          aria-label="返回"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-body font-medium truncate">{record?.title ?? ''}</p>
        </div>
        {record && (
          <div className="flex items-center gap-1 shrink-0">
            <Tag size="sm" color={STATUS_COLOR[record.status]} solid={record.status === 'approved'}>
              {STATUS_LABEL[record.status]}
            </Tag>
            {record.urgency !== 'low' && (
              <Tag size="sm" color={URGENCY_COLOR[record.urgency]}>
                {URGENCY_LABEL[record.urgency]}
              </Tag>
            )}
          </div>
        )}
      </div>

      <div className="flex border-b border-divider bg-surface shrink-0">
        {(['detail', 'route'] as DetailTab[]).map((t) => (
          <button
            key={t}
            onClick={() => setDetailTab(t)}
            className={`flex-1 py-2.5 text-body font-medium transition-colors border-b-2 ${
              detailTab === t
                ? 'text-primary border-primary'
                : 'text-fg-secondary border-transparent'
            }`}
          >
            {t === 'detail' ? '申請詳情' : '簽核流程'}
          </button>
        ))}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        {record && detailTab === 'detail' ? (
          <div className="flex flex-col gap-5 p-4 pb-24">
            <section>
              <p className="text-caption font-semibold text-fg-secondary mb-3 tracking-wide uppercase">基本資訊</p>
              <DescriptionList direction="vertical">
                {record.fixedFields.map((f) => (
                  <DescriptionItem key={f.label} label={f.label}>{f.value}</DescriptionItem>
                ))}
              </DescriptionList>
            </section>
            <Separator />
            <section>
              <p className="text-caption font-semibold text-fg-secondary mb-3 tracking-wide uppercase">申請內容</p>
              <DescriptionList direction="vertical">
                {record.customFields.map((f) => (
                  <DescriptionItem key={f.label} label={f.label}>{f.value}</DescriptionItem>
                ))}
              </DescriptionList>
            </section>
            <Separator />
            <section>
              <p className="text-caption font-semibold text-fg-secondary mb-3 tracking-wide uppercase">附件</p>
              {record.attachments.length === 0 ? (
                <p className="text-body text-fg-placeholder">無附件</p>
              ) : (
                <ul className="flex flex-col gap-3 list-none m-0 p-0">
                  {record.attachments.map((att) => (
                    <li key={att.id}>
                      <a href={att.url} className="inline-flex items-center gap-2 text-body text-fg-link">
                        <Paperclip size={15} className="shrink-0" />
                        <span>{att.name}</span>
                        <span className="text-fg-placeholder text-caption">{att.size}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        ) : record ? (
          <div className="p-4 pb-24">
            {hasRichRoute ? (
              <ApprovalRoute steps={record.steps} />
            ) : (
              <Steps
                value={currentStep?.id}
                completedValues={completedValues}
                errorValues={errorValues}
                orientation="vertical"
                size="sm"
              >
                {record.steps.map((step) => (
                  <StepItem key={step.id} value={step.id}>
                    <StepLabel>{step.label}</StepLabel>
                    <StepDescription>
                      {step.parallel ? '平行簽核：' : ''}
                      {step.approvers.join('、')}
                      {step.approvedBy && step.approvedBy.length > 0 && (
                        <span className="block text-fg-success">已簽：{step.approvedBy.join('、')}</span>
                      )}
                      {step.approvedAt && (
                        <span className="block text-fg-placeholder">{step.approvedAt}</span>
                      )}
                    </StepDescription>
                  </StepItem>
                ))}
              </Steps>
            )}
          </div>
        ) : null}
      </div>

      {canApprove && confirmAction === null && (
        <div className="absolute bottom-0 left-0 right-0 flex gap-3 px-4 py-3 bg-surface border-t border-divider">
          <button
            onClick={() => setSingleMoreOpen(true)}
            className="w-10 h-10 flex items-center justify-center rounded-full text-fg-secondary hover:bg-surface-hover active:bg-surface-hover shrink-0"
            aria-label="更多操作"
          >
            <MoreHorizontal size={20} />
          </button>
          <Button variant="secondary" danger className="flex-1" onClick={() => { setComment(''); setConfirmAction('reject') }}>
            退件
          </Button>
          <Button variant="secondary" className="flex-1" onClick={() => { setComment(''); setConfirmAction('approve') }}>
            核准
          </Button>
        </div>
      )}

      {/* Confirm full-page — slides in from right */}
      <div
        className={`absolute inset-0 z-10 flex flex-col bg-canvas transition-transform duration-300 ease-in-out ${
          confirmAction !== null ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center gap-2 h-14 px-3 border-b border-divider bg-surface shrink-0">
          <button
            onClick={() => { setConfirmAction(null); setComment('') }}
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-surface-hover active:bg-surface-hover shrink-0"
            aria-label="返回"
          >
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-body font-semibold flex-1">
            {confirmAction === 'approve' ? '確認核准' : '確認退件'}
          </h2>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-4 flex flex-col gap-4">
          {record && (
            <p className="text-body text-fg-secondary">{record.title}</p>
          )}
          <label className="flex flex-col gap-1.5">
            <span className="text-body">
              簽核意見
              {confirmAction === 'reject' && <span className="text-fg-danger ml-1">*</span>}
              {confirmAction === 'approve' && (
                <span className="text-fg-placeholder ml-1 text-caption">（選填）</span>
              )}
            </span>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={5}
              placeholder={
                confirmAction === 'reject'
                  ? '請說明退件原因，讓申請人能依此修正再送'
                  : '可補充核准意見供下一站簽核人參考'
              }
            />
          </label>
        </div>

        <div className="flex gap-3 px-4 py-3 border-t border-divider bg-surface shrink-0">
          <Button variant="tertiary" className="flex-1" onClick={() => { setConfirmAction(null); setComment('') }}>
            取消
          </Button>
          <Button
            variant="secondary"
            danger={confirmAction === 'reject'}
            disabled={submitDisabled}
            className="flex-1"
            onClick={submit}
          >
            送出
          </Button>
        </div>
      </div>

      {/* Single record more action sheet */}
      {singleMoreOpen && (
        <div
          className="absolute inset-0 z-30 flex flex-col justify-end bg-black/40"
          onClick={() => setSingleMoreOpen(false)}
        >
          <div
            className="bg-canvas rounded-t-2xl overflow-hidden shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-divider">
              <p className="text-caption text-fg-secondary">更多操作</p>
              <button
                onClick={() => setSingleMoreOpen(false)}
                className="flex items-center justify-center w-7 h-7 rounded-full hover:bg-surface-hover active:bg-surface-hover text-fg-secondary"
                aria-label="關閉"
              >
                <X size={16} />
              </button>
            </div>
            {([
              { Icon: Share2, label: '轉寄', action: '轉寄', danger: false },
              { Icon: UserCheck, label: '移交', action: '移交 Owner', danger: false },
              { Icon: Undo2, label: '退回給申請人', action: '退回給申請人', danger: false },
              { Icon: Ban, label: '作廢', action: '作廢', danger: true },
            ] as const).map(({ Icon, label, action, danger }) => (
              <button
                key={action}
                className={`w-full flex items-center gap-3 px-4 py-3.5 text-body border-b border-divider hover:bg-surface-hover active:bg-surface-hover ${danger ? 'text-fg-danger' : ''}`}
                onClick={() => { onMoreAction?.(action); setSingleMoreOpen(false) }}
              >
                <Icon size={18} className="shrink-0" />
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Logged-out screen ────────────────────────────────────────────────────────

function LoggedOutScreen({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-canvas gap-6 p-8">
      <div className="flex flex-col items-center gap-3">
        <Avatar alt="?" size={64} color="neutral" />
        <p className="text-h4 font-semibold">已登出</p>
        <p className="text-body text-fg-secondary text-center">請重新登入以繼續使用簽核中心</p>
      </div>
      <Button variant="primary" onClick={onLogin}>重新登入</Button>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

const TABS: { id: TabId; label: string; Icon: React.ElementType }[] = [
  { id: 'pending-me', label: '待簽核', Icon: ClipboardList },
  { id: 'submitted', label: '已申請', Icon: Send },
  { id: 'signed', label: '已簽核', Icon: CheckCircle2 },
]

export function ApprovalCenterMobile({
  selectAllPlacement = 'header',
  searchPlacement = 'header',
}: {
  selectAllPlacement?: 'header' | 'subbar'
  searchPlacement?: 'header' | 'subfilter'
} = {}) {
  const [screen, setScreen] = useState<Screen>('products')
  const [activeCategory, setActiveCategory] = useState<CategoryId | null>(null)
  const [tab, setTab] = useState<TabId>('pending-me')
  const [category, setCategory] = useState<CategoryId | 'all'>('all')
  const [search, setSearch] = useState('')
  const [searchVisible, setSearchVisible] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [theme, setTheme] = useState<ThemeOption>('light')
  const [loggedOut, setLoggedOut] = useState(false)
  const [records, setRecords] = useState<ApprovalRecord[]>(MOCK_RECORDS)
  const [batchAction, setBatchAction] = useState<'approve' | 'reject' | null>(null)
  const [batchComment, setBatchComment] = useState('')
  const [moreMenuOpen, setMoreMenuOpen] = useState(false)
  const [pendingBatchApprove, setPendingBatchApprove] = useState<{ comment: string; hiddenCount: number } | null>(null)

  const isDark = getEffectiveTheme(theme) === 'dark'

  if (loggedOut) {
    return (
      <TooltipProvider delayDuration={500} skipDelayDuration={300}>
        <div
          className={`h-full text-foreground ${isDark ? 'dark' : ''}`}
          data-theme={isDark ? 'dark' : 'light'}
        >
          <LoggedOutScreen onLogin={() => setLoggedOut(false)} />
        </div>
      </TooltipProvider>
    )
  }

  const tabRecords = getTabRecords(tab, records, CURRENT_USER)
  const filtered = tabRecords
    .filter((r) => category === 'all' || r.category === category)
    .filter(
      (r) =>
        !search ||
        r.title.includes(search) ||
        r.id.includes(search) ||
        r.applicant.includes(search),
    )

  const selectedRecord = selectedId ? (records.find((r) => r.id === selectedId) ?? null) : null
  const pendingCount = getTabRecords('pending-me', records, CURRENT_USER).length
  const allVisibleSelected = filtered.length > 0 && filtered.every((r) => selectedIds.has(r.id))
  const someSelected = selectedIds.size > 0 && !allVisibleSelected
  const isSelecting = selectedIds.size > 0

  const activeCategoryLabel = activeCategory
    ? CATEGORIES.find((c) => c.id === activeCategory)?.label ?? ''
    : ''

  // ── Navigation ──────────────────────────────────────────────────────────────

  function handleSelectCategory(cat: CategoryId) {
    setActiveCategory(cat)
    setCategory(cat)
    setScreen('requests')
    setSelectedIds(new Set())
    setSearch('')
    setSearchVisible(false)
  }

  function handleBack() {
    setScreen('products')
    setSelectedIds(new Set())
    setSearch('')
    setSearchVisible(false)
    setActiveCategory(null)
  }

  function handleTabChange(newTab: TabId) {
    setTab(newTab)
    setSelectedIds(new Set())
  }

  // ── Record actions ───────────────────────────────────────────────────────────

  function handleSelectAll() {
    if (allVisibleSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev)
        filtered.forEach((r) => next.delete(r.id))
        return next
      })
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev)
        filtered.forEach((r) => next.add(r.id))
        return next
      })
    }
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function openRecord(r: ApprovalRecord) {
    setSelectedId(r.id)
    setSheetOpen(true)
  }

  function showToast(type: 'approve' | 'reject') {
    const message = type === 'approve' ? '已核准' : '已退件'
    dsToast({ variant: 'success', title: message })
  }

  function handleApprove(id: string, comment?: string) {
    setRecords((prev) =>
      prev.map((r) => (r.id === id ? approveRecord(r, CURRENT_USER, comment) : r)),
    )
    setSheetOpen(false)
    setSearch('')
    setSearchVisible(false)
    showToast('approve')
  }

  function handleReject(id: string, comment: string) {
    setRecords((prev) =>
      prev.map((r) => (r.id === id ? rejectRecord(r, CURRENT_USER, comment) : r)),
    )
    setSheetOpen(false)
    setSearch('')
    setSearchVisible(false)
    showToast('reject')
  }

  function submitBatch() {
    if (!batchAction) return

    // 搜尋中送出批次核准時，偵測已勾選但被搜尋隱藏的單據
    if (batchAction === 'approve' && searchVisible && search.trim()) {
      const visibleIds = new Set(filtered.map((r) => r.id))
      const hiddenCount = [...selectedIds].filter((id) => !visibleIds.has(id)).length
      if (hiddenCount > 0) {
        setPendingBatchApprove({ comment: batchComment.trim(), hiddenCount })
        setBatchAction(null)
        setBatchComment('')
        return
      }
    }

    executeBatch(batchAction, batchComment.trim())
  }

  function executeBatch(action: 'approve' | 'reject', comment: string) {
    if (action === 'approve') {
      setRecords((prev) =>
        prev.map((r) =>
          selectedIds.has(r.id) && r.status === 'pending'
            ? approveRecord(r, CURRENT_USER, comment || undefined)
            : r,
        ),
      )
    } else {
      setRecords((prev) =>
        prev.map((r) =>
          selectedIds.has(r.id) && r.status === 'pending'
            ? rejectRecord(r, CURRENT_USER, comment)
            : r,
        ),
      )
    }
    setSelectedIds(new Set())
    setBatchAction(null)
    setBatchComment('')
    setSearch('')
    setSearchVisible(false)
    showToast(action)
  }

  function confirmPendingBatch() {
    if (!pendingBatchApprove) return
    setRecords((prev) =>
      prev.map((r) =>
        selectedIds.has(r.id) && r.status === 'pending'
          ? approveRecord(r, CURRENT_USER, pendingBatchApprove.comment || undefined)
          : r,
      ),
    )
    setSelectedIds(new Set())
    setPendingBatchApprove(null)
  }

  function toggleSearch() {
    if (searchVisible) {
      setSearchVisible(false)
      setSearch('')
    } else {
      setSearchVisible(true)
    }
  }

  const batchSubmitDisabled = batchAction === 'reject' && batchComment.trim().length === 0

  return (
    <TooltipProvider delayDuration={500} skipDelayDuration={300}>
      <div
        className={`relative flex flex-col h-full overflow-hidden bg-canvas text-foreground ${isDark ? 'dark' : ''}`}
        data-theme={isDark ? 'dark' : 'light'}
      >
        {/* ── Header ── */}
        <header className="flex items-center gap-2 h-12 px-3 bg-surface border-b border-divider shrink-0 z-10">
          {screen === 'products' ? (
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              aria-label={`${CURRENT_USER}（設定）`}
              className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0 ml-1"
            >
              <Avatar alt={CURRENT_USER} size={32} color="blue" />
            </button>
          ) : (
            <button
              onClick={searchVisible ? toggleSearch : handleBack}
              className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-surface-hover active:bg-surface-hover shrink-0"
              aria-label={searchVisible ? '退出搜尋' : '返回'}
            >
              <ChevronLeft size={20} />
            </button>
          )}

          {screen === 'requests' && searchVisible ? (
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜尋單據、申請人…"
              autoFocus
              className="flex-1 min-w-0 text-body text-foreground bg-transparent focus-visible:outline-none placeholder:text-fg-placeholder"
            />
          ) : (
            <h1 className="text-body font-semibold flex-1 truncate">
              {screen === 'products'
                ? '簽核中心'
                : selectAllPlacement === 'header' && isSelecting
                  ? `已選取 ${selectedIds.size} 項`
                  : activeCategoryLabel}
            </h1>
          )}

          {screen === 'requests' && searchPlacement === 'header' && (
            searchVisible ? (
              <button
                onClick={toggleSearch}
                className="text-body font-medium text-primary hover:text-primary-hover active:text-primary-hover shrink-0 pl-2 py-1"
              >
                取消
              </button>
            ) : (
              <div className="flex items-center gap-0.5">
                <button
                  onClick={toggleSearch}
                  className="w-8 h-8 flex items-center justify-center rounded-full transition-colors hover:bg-surface-hover active:bg-surface-hover text-fg-secondary"
                  aria-label="搜尋"
                >
                  <Search size={18} />
                </button>
                {selectAllPlacement === 'header' && (
                  <button
                    onClick={handleSelectAll}
                    className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors hover:bg-surface-hover active:bg-surface-hover ${
                      allVisibleSelected && filtered.length > 0 ? 'text-primary' : 'text-fg-secondary'
                    }`}
                    aria-label="全選"
                  >
                    {allVisibleSelected && filtered.length > 0 ? (
                      <CheckSquare size={18} />
                    ) : (
                      <Square size={18} />
                    )}
                  </button>
                )}
              </div>
            )
          )}
        </header>

        {/* ── subfilter: search filter row ── */}
        {searchPlacement === 'subfilter' && screen === 'requests' && (
          <div className="flex items-center h-12 px-3 gap-2 bg-surface border-b border-divider shrink-0">
            <div className="flex items-center gap-2 flex-1 min-w-0 h-8 px-3 rounded-lg bg-muted">
              <Search size={14} className="text-fg-placeholder shrink-0" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="搜尋單據、申請人…"
                className="flex-1 min-w-0 text-body text-foreground bg-transparent focus-visible:outline-none placeholder:text-fg-placeholder"
              />
              {search && (
                <button onClick={() => setSearch('')} className="text-fg-placeholder hover:text-fg-secondary shrink-0" aria-label="清除搜尋">
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── V2: Gmail-style select-all sub-toolbar ── */}
        {selectAllPlacement === 'subbar' && screen === 'requests' && (
          <div className="flex items-center h-10 px-3 bg-surface border-b border-divider shrink-0">
            <div
              onClick={handleSelectAll}
              className="flex items-center gap-2.5 text-fg-secondary hover:text-foreground active:text-foreground transition-colors cursor-pointer"
              aria-label={allVisibleSelected ? '取消全選' : '全選'}
            >
              <Checkbox
                checked={
                  allVisibleSelected && filtered.length > 0
                    ? true
                    : someSelected
                      ? 'indeterminate'
                      : false
                }
                onCheckedChange={handleSelectAll}
                onClick={(e) => e.stopPropagation()}
              />
              <span className="text-body">
                {isSelecting ? `已選取 ${selectedIds.size} 項` : '全選'}
              </span>
            </div>
            {filtered.length > 0 && (
              <span className="ml-auto text-caption text-fg-placeholder">
                共 {filtered.length} 件
              </span>
            )}
          </div>
        )}

        {/* ── Animated content area ── */}
        <div className="relative flex-1 min-h-0 overflow-hidden">
          {/* Products panel — slides out left when navigating to requests */}
          <div
            className={`absolute inset-0 flex flex-col transition-transform duration-300 ease-in-out ${
              screen === 'products' ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <ProductListPanel tab={tab} records={records} onSelectCategory={handleSelectCategory} />
          </div>

          {/* Requests panel — slides in from right */}
          <div
            className={`absolute inset-0 flex flex-col transition-transform duration-300 ease-in-out ${
              screen === 'requests' ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            {/* Record list */}
            <div className="flex-1 min-h-0 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-fg-placeholder gap-2 px-4">
                  <AlertCircle size={32} />
                  <p className="text-body">目前沒有相關單據</p>
                </div>
              ) : (
                <div>
                  {filtered.map((r) => (
                    <ListRow
                      key={r.id}
                      record={r}
                      selected={selectedIds.has(r.id)}
                      onToggleSelect={() => toggleSelect(r.id)}
                      onClick={() => openRecord(r)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Bottom nav — tab bar ↔ batch action bar ── */}
        <nav className="shrink-0 border-t border-divider bg-surface">
          {isSelecting ? (
            <div className="flex items-center gap-2 px-3 py-3">
              <button
                onClick={() => setMoreMenuOpen(true)}
                className="w-10 h-10 flex items-center justify-center rounded-full text-fg-secondary hover:bg-surface-hover active:bg-surface-hover shrink-0"
                aria-label="更多操作"
              >
                <MoreHorizontal size={20} />
              </button>
              <Button
                variant="secondary"
                danger
                className="flex-1"
                onClick={() => { setBatchComment(''); setBatchAction('reject') }}
              >
                退件
              </Button>
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => { setBatchComment(''); setBatchAction('approve') }}
              >
                核准
              </Button>
            </div>
          ) : (
            <div className="flex">
              {TABS.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  onClick={() => handleTabChange(id)}
                  className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-colors ${
                    tab === id ? 'text-primary' : 'text-fg-secondary'
                  }`}
                >
                  <div className="relative">
                    <Icon size={22} />
                    {id === 'pending-me' && pendingCount > 0 && (
                      <span className="absolute -top-1 -right-2 min-w-4 h-4 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-0.5">
                        {pendingCount}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-medium">{label}</span>
                </button>
              ))}
            </div>
          )}
        </nav>

        {/* ── Batch confirm full-page — z-40 ── */}
        <div
          className={`absolute inset-0 z-40 flex flex-col bg-canvas transition-transform duration-300 ease-in-out ${
            batchAction !== null ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex items-center gap-2 h-14 px-3 border-b border-divider bg-surface shrink-0">
            <button
              onClick={() => { setBatchAction(null); setBatchComment('') }}
              className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-surface-hover active:bg-surface-hover shrink-0"
              aria-label="返回"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex-1">
              <h2 className="text-body font-semibold">
                {batchAction === 'approve' ? '批次核准' : '批次退件'}
              </h2>
              <p className="text-caption text-fg-secondary">共 {selectedIds.size} 件待處理單據</p>
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto p-4 flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-body">
                簽核意見
                {batchAction === 'reject' && <span className="text-fg-danger ml-1">*</span>}
                {batchAction === 'approve' && (
                  <span className="text-fg-placeholder ml-1 text-caption">（選填）</span>
                )}
              </span>
              <Textarea
                value={batchComment}
                onChange={(e) => setBatchComment(e.target.value)}
                rows={5}
                placeholder={
                  batchAction === 'reject'
                    ? '請說明退件原因，讓申請人能依此修正再送'
                    : '可補充核准意見供下一站簽核人參考'
                }
              />
            </label>
          </div>

          <div className="flex gap-3 px-4 py-3 border-t border-divider bg-surface shrink-0">
            <Button
              variant="tertiary"
              className="flex-1"
              onClick={() => { setBatchAction(null); setBatchComment('') }}
            >
              取消
            </Button>
            <Button
              variant="secondary"
              danger={batchAction === 'reject'}
              disabled={batchSubmitDisabled}
              className="flex-1"
              onClick={submitBatch}
            >
              送出
            </Button>
          </div>
        </div>

        {/* ── Hidden-selected approve confirmation — z-45 ── */}
        {pendingBatchApprove !== null && (
          <div className="absolute inset-0 z-[45] flex flex-col justify-end bg-black/40">
            <div className="bg-canvas rounded-t-2xl px-5 pt-5 pb-8 flex flex-col gap-4 shadow-xl">
              <div className="flex flex-col gap-1">
                <p className="text-h4 font-semibold">一併簽核不在搜尋結果的單據</p>
                <p className="text-body text-fg-secondary">
                  另有 {pendingBatchApprove.hiddenCount} 張已勾選但不在搜尋結果中，將一併核准。
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="tertiary" className="flex-1" onClick={() => setPendingBatchApprove(null)}>
                  取消
                </Button>
                <Button variant="secondary" className="flex-1" onClick={confirmPendingBatch}>
                  一併簽核
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ── More options menu — z-50 ── */}
        {moreMenuOpen && (
          <div
            className="absolute inset-0 z-50 flex flex-col justify-end bg-black/40"
            onClick={() => setMoreMenuOpen(false)}
          >
            <div
              className="bg-canvas rounded-t-2xl overflow-hidden shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-divider">
                <p className="text-caption text-fg-secondary">
                  已選取 {selectedIds.size} 項
                </p>
                <button
                  onClick={() => setMoreMenuOpen(false)}
                  className="flex items-center justify-center w-7 h-7 rounded-full hover:bg-surface-hover active:bg-surface-hover text-fg-secondary"
                  aria-label="關閉"
                >
                  <X size={16} />
                </button>
              </div>
              {([
                { Icon: Share2, label: '轉寄', action: '轉寄', danger: false },
                { Icon: UserCheck, label: '移交', action: '移交 Owner', danger: false },
                { Icon: Undo2, label: '退回給申請人', action: '退回給申請人', danger: false },
                { Icon: Ban, label: '作廢', action: '作廢', danger: true },
              ] as const).map(({ Icon, label, action, danger }) => (
                <button
                  key={action}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-body border-b border-divider hover:bg-surface-hover active:bg-surface-hover ${danger ? 'text-fg-danger' : ''}`}
                  onClick={() => { dsToast({ variant: 'neutral', title: `${label}（功能待實作）` }); setMoreMenuOpen(false) }}
                >
                  <Icon size={18} className="shrink-0" />
                  {label}
                </button>
              ))}
              <button
                className="w-full flex items-center gap-3 px-4 py-3.5 text-body hover:bg-surface-hover active:bg-surface-hover border-b border-divider"
                onClick={() => { setSelectedIds(new Set()); setMoreMenuOpen(false) }}
              >
                <X size={18} className="text-fg-secondary shrink-0" />
                取消選取
              </button>
            </div>
          </div>
        )}

        <Toaster position="bottom-center" />

        {/* ── Settings sheet — z-30 ── */}
        <SettingsSheet
          open={settingsOpen}
          theme={theme}
          onThemeChange={setTheme}
          onClose={() => setSettingsOpen(false)}
          onLogout={() => { setSettingsOpen(false); setLoggedOut(true) }}
        />

        {/* ── Detail sheet — z-20 ── */}
        <DetailSheet
          record={selectedRecord}
          open={sheetOpen}
          mode={tab === 'pending-me' ? 'approve' : 'view'}
          onClose={() => setSheetOpen(false)}
          onApprove={handleApprove}
          onReject={handleReject}
          onMoreAction={(label) => dsToast({ variant: 'neutral', title: `${label}（功能待實作）` })}
        />
      </div>
    </TooltipProvider>
  )
}
