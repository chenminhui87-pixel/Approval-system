// 表單管理模組(C)— 表單清單 / 表單內容詳情 / 送審清單子頁。
// 清單走 DS DataTable;列操作依 DS row-action 規則:主要動作 inline + 其餘收進 ⋯ overflow。
// 角色切換器弱化為底部固定 demo 列(不隨捲動)。
import {
  SegmentedControl,
  SegmentedControlItem,
  Button,
  DataTable,
  type DataTableProps,
} from '@qijenchen/design-system'
import { Eye } from 'lucide-react'
import {
  FORM_ROLES,
  FORM_ROLE_LABEL,
  FORM_ROLE_DESC,
  can,
  categoryLabel,
  formSubmissionCounts,
  type FormRole,
  type ManagedForm,
} from './formsData'
import type { ApprovalRecord } from './data'
import { FormDetailView } from './FormDetailView'
import { FormSubmissionsView } from './FormSubmissionsView'

export function FormManagementView({
  forms,
  records,
  role,
  onRoleChange,
  selectedForm,
  view,
  onSelectForm,
  onViewSubmissions,
  onUpdateForm,
  stub,
}: {
  forms: ManagedForm[]
  records: ApprovalRecord[]
  role: FormRole
  onRoleChange: (r: FormRole) => void
  selectedForm: ManagedForm | null
  view: 'content' | 'submissions'
  onSelectForm: (f: ManagedForm | null) => void
  onViewSubmissions: (f: ManagedForm) => void
  onUpdateForm: (id: string, patch: Partial<ManagedForm>) => void
  stub: (label: string) => void
}) {
  const canEdit = can(role, 'editForm')
  const columns: DataTableProps<ManagedForm>['columns'] = [
    {
      id: 'name',
      header: '表單名稱',
      meta: { width: 280 },
      cell: ({ row }) => (
        <div className="flex flex-col gap-0.5 py-1">
          <button
            type="button"
            onClick={() => onSelectForm(row.original)}
            className="text-left font-medium hover:text-primary hover:underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
          >
            {row.original.name}
          </button>
          <span className="text-caption text-fg-placeholder">{row.original.id}</span>
        </div>
      ),
    },
    {
      id: 'category',
      header: '分類',
      meta: { width: 120 },
      cell: ({ row }) => (
        <span className="text-body text-fg-secondary whitespace-nowrap">{categoryLabel(row.original.category)}</span>
      ),
    },
    {
      id: 'submissions',
      header: '簽核單送出總數',
      meta: { width: 140 },
      // 跟送審清單子頁(FormSubmissionsView)共用同一個 formSubmissionCounts,
      // 不能各自維護數字 —— 這是之前「清單數字跟點進去看到的不一致」的根因。
      // 跟「簽核中」欄統一用 secondary(灰字正常粗細),不特別加粗。
      cell: ({ row }) => (
        <span className="text-body text-fg-secondary tabular-nums whitespace-nowrap">
          {formSubmissionCounts(row.original, records).total}
        </span>
      ),
    },
    {
      id: 'pending',
      header: '簽核中',
      meta: { width: 100 },
      cell: ({ row }) => (
        <span className="text-body text-fg-secondary tabular-nums whitespace-nowrap">
          {formSubmissionCounts(row.original, records).pending}
        </span>
      ),
    },
    {
      id: 'updatedBy',
      header: '更新者',
      meta: { width: 100 },
      cell: ({ row }) => (
        <span className="text-body text-fg-secondary whitespace-nowrap">{row.original.updatedBy}</span>
      ),
    },
    {
      id: 'updatedAt',
      header: '更新時間',
      meta: { width: 100 },
      cell: ({ row }) => (
        <span className="text-body text-fg-secondary tabular-nums whitespace-nowrap">
          {row.original.updatedAt.replace(/-/g, '/')}
        </span>
      ),
    },
    {
      id: 'actions',
      // 對齊 FormSubmissionsView 的 actions 欄寫法:表頭不顯文字,sr-only 保留給輔助技術
      header: () => <span className="sr-only">操作</span>,
      meta: { width: 170 },
      // 只留查看所有簽核單一個 inline 動作 —— 表單名稱點擊即進設定頁(name 欄),
      // 不需要另一個「編輯表單」按鈕通往同一個目的地。
      cell: ({ row }) => (
        <div className="flex items-center gap-1 justify-end" onClick={(e) => e.stopPropagation()}>
          <Button variant="text" size="sm" startIcon={Eye} onClick={() => onViewSubmissions(row.original)}>
            查看所有簽核單
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col h-full">
      {/* 主體:清單 / 表單內容 / 送審清單 */}
      <div className="flex-1 min-h-0 flex flex-col">
        {selectedForm ? (
          view === 'submissions' ? (
            <FormSubmissionsView key={selectedForm.id} form={selectedForm} records={records} role={role} stub={stub} />
          ) : (
            <FormDetailView
              key={selectedForm.id}
              form={selectedForm}
              canEdit={canEdit}
              onUpdateForm={(patch) => onUpdateForm(selectedForm.id, patch)}
            />
          )
        ) : (
          <div className="h-full px-[var(--layout-space-loose)] pt-4 pb-4">
            <DataTable
              columns={columns}
              data={forms}
              getRowId={(f) => f.id}
              height="100%"
              size="md"
              autoRowHeight
              pinnedRightColumns={['actions']}
              tableOptions={{ enableSorting: false, enableHiding: false }}
            />
          </div>
        )}
      </div>

      {/* 底部固定「檢視身分」demo 列 — 弱化(muted 底 + caption),不隨捲動 */}
      <div className="shrink-0 border-t border-divider bg-muted px-[var(--layout-space-loose)] py-2 flex items-center gap-3 flex-wrap">
        <span className="text-caption text-fg-muted shrink-0">檢視身分(demo)</span>
        <SegmentedControl
          value={role}
          onValueChange={(v: string | undefined) => v && onRoleChange(v as FormRole)}
          size="sm"
        >
          {FORM_ROLES.map((r) => (
            <SegmentedControlItem key={r} value={r}>
              {FORM_ROLE_LABEL[r]}
            </SegmentedControlItem>
          ))}
        </SegmentedControl>
        <span className="text-caption text-fg-placeholder">{FORM_ROLE_DESC[role]}</span>
      </div>
    </div>
  )
}
