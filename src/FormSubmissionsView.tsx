// 表單管理模組(C)— 增量 2b:某表單的「送審清單」子頁。
// 複用簽核 DataTable 呈現以此表單送出的審核(所有簽核狀態);點 info 開「右側詳情面板」
// (複用 ApprovalDetailPanel,與簽核清單一致)。owner / admin 可對「簽核中」的單代理操作
// (核准 / 退件 / 轉寄 / 移交簽核者 / 退回 / 作廢,在面板內);viewer 唯讀。代理動作先以 toast 佔位。
import { useState } from 'react'
import { DataTable, type DataTableProps, Tag, Button } from '@qijenchen/design-system'
import { Info, X } from 'lucide-react'
import { MOCK_RECORDS, type ApprovalRecord, type ApprovalStatus } from './data'
import { can, type FormRole, type ManagedForm } from './formsData'
import { ApprovalDetailPanel } from './ApprovalDetailPanel'

const STATUS: Record<ApprovalStatus, { label: string; color: 'blue' | 'green' | 'red' }> = {
  pending: { label: '簽核中', color: 'blue' },
  approved: { label: '已核准', color: 'green' },
  rejected: { label: '已退件', color: 'red' },
}

function deadline(dueDate?: string): { text: string; urgent: boolean } {
  if (!dueDate) return { text: '-', urgent: false }
  const due = new Date(dueDate + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const d = Math.ceil((due.getTime() - today.getTime()) / 86400000)
  if (d < 0) return { text: `逾期 ${Math.abs(d)} 天`, urgent: true }
  if (d === 0) return { text: '今天到期', urgent: true }
  return { text: `${d} 天後`, urgent: false }
}

export function FormSubmissionsView({
  form,
  role,
  stub,
}: {
  form: ManagedForm
  role: FormRole
  stub: (label: string) => void
}) {
  const [openId, setOpenId] = useState<string | null>(null)
  // prototype:以表單分類作為「此表單送出的審核」代理(MOCK 無 form↔record 關聯)
  const submissions = MOCK_RECORDS.filter((r) => r.category === form.category)
  const canOperate = can(role, 'operateSubmission')
  const openRecord = submissions.find((r) => r.id === openId) ?? null

  const columns: DataTableProps<ApprovalRecord>['columns'] = [
    {
      id: 'title',
      header: '標題',
      meta: { width: 260 },
      cell: ({ row }) => (
        <button
          type="button"
          onClick={() => setOpenId(row.original.id)}
          className="text-left font-medium line-clamp-2 hover:text-primary hover:underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm py-1"
        >
          {row.original.title}
        </button>
      ),
    },
    {
      id: 'applicant',
      header: '申請人',
      meta: { width: 110 },
      cell: ({ row }) => <span className="text-body text-fg-secondary whitespace-nowrap">{row.original.applicant}</span>,
    },
    {
      id: 'status',
      header: '狀態',
      meta: { width: 92 },
      cell: ({ row }) => (
        <Tag size="sm" color={STATUS[row.original.status].color} solid={row.original.status === 'approved'}>
          {STATUS[row.original.status].label}
        </Tag>
      ),
    },
    {
      id: 'urgency',
      header: '緊急',
      meta: { width: 76 },
      cell: ({ row }) =>
        row.original.urgency === 'high' ? (
          <Tag size="sm" color="red">緊急</Tag>
        ) : (
          <span className="text-fg-placeholder">-</span>
        ),
    },
    {
      id: 'submittedAt',
      header: '送出時間',
      meta: { width: 112 },
      cell: ({ row }) => (
        <span className="text-caption text-fg-secondary whitespace-nowrap">
          {row.original.submittedAt.slice(0, 10).replace(/-/g, '/')}
        </span>
      ),
    },
    {
      id: 'dueDate',
      header: '到期',
      meta: { width: 100 },
      cell: ({ row }) => {
        const { text, urgent } = deadline(row.original.dueDate)
        return <span className={`text-caption ${urgent ? 'text-error-text' : 'text-fg-secondary'}`}>{text}</span>
      },
    },
    {
      id: 'actions',
      // 表頭不顯標題(與簽核清單 info 欄一致);保留 sr-only 供輔助技術
      header: () => <span className="sr-only">明細</span>,
      meta: { width: 72 },
      cell: ({ row }) => (
        <div className="flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="text"
            size="sm"
            iconOnly
            startIcon={Info}
            aria-label="展開明細"
            pressed={openId === row.original.id}
            onClick={() => setOpenId(row.original.id)}
          />
        </div>
      ),
    },
  ]

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="px-[var(--layout-space-loose)] pt-4 pb-3 shrink-0">
        <h3 className="text-h4 font-semibold">{form.name}</h3>
        <p className="text-caption text-fg-placeholder mt-1">
          送審清單 · 以此表單送出的審核
          {canOperate ? '(可對簽核中的單代理操作)' : '(唯讀)'}
        </p>
      </div>

      {/* 清單 + 右側詳情面板(list-detail,與簽核清單一致)*/}
      <div className="flex-1 min-h-0 flex">
        <div className="flex-1 min-w-0 min-h-0 px-[var(--layout-space-loose)] pb-4">
          {submissions.length === 0 ? (
            <div className="rounded-lg border border-dashed border-divider px-4 py-10 text-center text-fg-placeholder">
              <p className="text-body">尚無以此表單送出的審核。</p>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={submissions}
              getRowId={(r) => r.id}
              height="100%"
              size="md"
              autoRowHeight
              pinnedLeftColumns={['title']}
              pinnedRightColumns={['actions']}
              tableOptions={{ enableSorting: false, enableHiding: false }}
            />
          )}
        </div>

        {openRecord && (
          <aside
            aria-label={openRecord.title}
            className="flex flex-col h-full w-[380px] xl:w-[420px] shrink-0 border-l border-divider bg-surface"
          >
            <div className="flex items-center gap-2 h-[var(--chrome-header-height)] px-4 shrink-0 border-b border-divider">
              <h2 className="text-body-lg font-medium flex-1 truncate">{openRecord.title}</h2>
              <Button
                variant="text"
                size="sm"
                iconOnly
                dismiss
                startIcon={X}
                aria-label="關閉"
                onClick={() => setOpenId(null)}
              />
            </div>
            <div className="flex-1 min-h-0">
              <ApprovalDetailPanel
                key={openRecord.id}
                record={openRecord}
                mode={canOperate && openRecord.status === 'pending' ? 'approve' : 'view'}
                onApprove={() => { stub('核准'); setOpenId(null) }}
                onReject={() => { stub('退件'); setOpenId(null) }}
                onMoreAction={stub}
              />
            </div>
          </aside>
        )}
      </div>
    </div>
  )
}
