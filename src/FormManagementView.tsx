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
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@qijenchen/design-system'
import { Pencil, Ban, MoreVertical } from 'lucide-react'
import {
  FORM_ROLES,
  FORM_ROLE_LABEL,
  FORM_ROLE_DESC,
  FORM_STATUS_LABEL,
  FORM_STATUS_COLOR,
  can,
  categoryLabel,
  type FormRole,
  type ManagedForm,
} from './formsData'
import { FormDetailView } from './FormDetailView'
import { FormSubmissionsView } from './FormSubmissionsView'

export function FormManagementView({
  forms,
  role,
  onRoleChange,
  selectedForm,
  view,
  editing,
  onSelectForm,
  onEditForm,
  onViewSubmissions,
  onDisableForm,
  onUpdateForm,
  stub,
}: {
  forms: ManagedForm[]
  role: FormRole
  onRoleChange: (r: FormRole) => void
  selectedForm: ManagedForm | null
  view: 'content' | 'submissions'
  editing: boolean
  onSelectForm: (f: ManagedForm | null) => void
  onEditForm: (f: ManagedForm) => void
  onViewSubmissions: (f: ManagedForm) => void
  onDisableForm: (f: ManagedForm) => void
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
        <Tag size="sm" color={FORM_STATUS_COLOR[row.original.status]} solid={row.original.status === 'published'}>
          {FORM_STATUS_LABEL[row.original.status]}
        </Tag>
      ),
    },
    {
      id: 'submissions',
      header: '送審數',
      meta: { width: 140 },
      cell: ({ row }) => (
        <span className="whitespace-nowrap tabular-nums">
          <span className="text-body text-foreground font-medium">{row.original.submissionCount}</span>
          {row.original.pendingCount > 0 && (
            <span className="text-caption text-fg-placeholder"> · {row.original.pendingCount} 簽核中</span>
          )}
        </span>
      ),
    },
    {
      id: 'actions',
      header: () => <span className="block text-right w-full">操作</span>,
      meta: { width: 160 },
      // DS row-action 規則:主要動作(查看送審單)inline 文字鈕,其餘(編輯 / 停用)收進 ⋯ overflow。
      // 檢視表單 = 點表單名開啟。viewer 無編輯/停用 → 不顯示 ⋯。
      cell: ({ row }) => {
        const canEdit = can(role, 'editForm')
        const canDisable = can(role, 'disableForm') && row.original.status === 'published'
        const hasOverflow = canEdit || canDisable
        return (
          <div className="flex items-center gap-0.5 justify-end" onClick={(e) => e.stopPropagation()}>
            <Button variant="text" size="sm" onClick={() => onViewSubmissions(row.original)}>
              查看送審單
            </Button>
            {hasOverflow && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="text" size="sm" iconOnly startIcon={MoreVertical} aria-label="更多操作" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {canEdit && (
                    <DropdownMenuItem startIcon={Pencil} onClick={() => onEditForm(row.original)}>
                      編輯表單
                    </DropdownMenuItem>
                  )}
                  {canDisable && (
                    <DropdownMenuItem startIcon={Ban} className="text-fg-danger" onClick={() => onDisableForm(row.original)}>
                      停用表單
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
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
            <FormSubmissionsView key={selectedForm.id} form={selectedForm} role={role} stub={stub} />
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
