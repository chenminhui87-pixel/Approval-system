// 表單管理模組(C)— 表單清單 / 表單內容詳情 / 送審清單子頁。
// 清單走 DS DataTable;列操作依 DS row-action 規則:主要動作 inline + 其餘收進 ⋯ overflow。
// 角色切換器弱化為底部固定 demo 列(不隨捲動)。
import {
  SegmentedControl,
  SegmentedControlItem,
  Tag,
  Button,
  DataTable,
  type DataTableProps,
} from '@qijenchen/design-system'
import { Pencil, Eye } from 'lucide-react'
import {
  FORM_ROLES,
  FORM_ROLE_LABEL,
  FORM_ROLE_DESC,
  FORM_STATUS_LABEL,
  FORM_STATUS_COLOR,
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
  editing,
  onSelectForm,
  onEditForm,
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
  editing: boolean
  onSelectForm: (f: ManagedForm | null) => void
  onEditForm: (f: ManagedForm) => void
  onViewSubmissions: (f: ManagedForm) => void
  onUpdateForm: (id: string, patch: Partial<ManagedForm>) => void
  stub: (label: string) => void
}) {
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
      id: 'status',
      header: '狀態',
      meta: { width: 96 },
      cell: ({ row }) => (
        <Tag size="sm" color={FORM_STATUS_COLOR[row.original.status]}>
          {FORM_STATUS_LABEL[row.original.status]}
        </Tag>
      ),
    },
    {
      id: 'submissions',
      header: '簽核單送出總數',
      meta: { width: 140 },
      // 跟送審清單子頁(FormSubmissionsView)共用同一個 formSubmissionCounts,
      // 不能各自維護數字 —— 這是之前「清單數字跟點進去看到的不一致」的根因。
      cell: ({ row }) => (
        <span className="text-body text-foreground font-medium tabular-nums whitespace-nowrap">
          {formSubmissionCounts(row.original, records).total}
        </span>
      ),
    },
    {
      id: 'pending',
      header: '簽核中',
      meta: { width: 100 },
      // 跟「簽核單送出總數」做主從區分:總數是 primary(foreground + font-medium),
      // 這欄是衍生出來的子集,降一階用 secondary(沿用本檔案「分類」欄同一套次要層級),
      // 不然兩欄一樣粗一樣黑,看不出誰是誰的子集。
      cell: ({ row }) => (
        <span className="text-body text-fg-secondary tabular-nums whitespace-nowrap">
          {formSubmissionCounts(row.original, records).pending}
        </span>
      ),
    },
    {
      id: 'actions',
      // 對齊 FormSubmissionsView 的 actions 欄寫法:表頭不顯文字,sr-only 保留給輔助技術
      header: () => <span className="sr-only">操作</span>,
      // viewer 沒有編輯表單按鈕,欄寬跟著 hug(不留編輯按鈕的空白)——role 是整張表共用的
      // global 狀態,不是逐列不同,直接在欄定義算一次即可,不用每個 cell 各自判斷。
      meta: { width: can(role, 'editForm') ? 300 : 170 },
      // 只留查看所有簽核單 + 編輯表單兩個 inline 動作(都帶 prefix icon),不再用 ⋯ overflow。
      // 停用改到表單內容頁 header(進去看過內容才停用,避免清單列一鍵誤觸);
      // 檢視表單 = 點表單名開啟。viewer 無編輯權限 → 不顯示編輯表單。
      cell: ({ row }) => {
        const canEdit = can(role, 'editForm')
        return (
          <div className="flex items-center gap-1 justify-end" onClick={(e) => e.stopPropagation()}>
            <Button variant="text" size="sm" startIcon={Eye} onClick={() => onViewSubmissions(row.original)}>
              查看所有簽核單
            </Button>
            {canEdit && (
              <Button variant="text" size="sm" startIcon={Pencil} onClick={() => onEditForm(row.original)}>
                編輯表單
              </Button>
            )}
          </div>
        )
      },
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
              editing={editing}
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
