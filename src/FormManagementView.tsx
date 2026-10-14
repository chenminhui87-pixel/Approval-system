// 表單管理模組(C)— 表單清單 / 表單詳情。清單走 DS DataTable(與簽核清單視覺一致)。
// 麵包屑 + 建立/編輯/停用 等情境操作集中在最上方 header(App 的 PageHeader rightSlot),
// 本 view 不另長 header。角色切換器弱化為底部固定 demo 列(不隨捲動)。
import {
  SegmentedControl,
  SegmentedControlItem,
  Tag,
  Button,
  DataTable,
  type DataTableProps,
} from '@qijenchen/design-system'
import { Pencil, Ban, Eye } from 'lucide-react'
import {
  MOCK_FORMS,
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

export function FormManagementView({
  role,
  onRoleChange,
  selectedForm,
  editing,
  onSelectForm,
  onEditForm,
  stub,
}: {
  role: FormRole
  onRoleChange: (r: FormRole) => void
  selectedForm: ManagedForm | null
  editing: boolean
  onSelectForm: (f: ManagedForm | null) => void
  onEditForm: (f: ManagedForm) => void
  stub: (label: string) => void
}) {
  // DataTable 欄位 — 操作欄依角色渲染(pinned right,與簽核清單 info 欄一致)
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
      meta: { width: 148 },
      // 一律 icon-only 無框(variant text),視覺一致;依角色顯示
      cell: ({ row }) => {
        const canEdit = can(role, 'editForm')
        const canDisable = can(role, 'disableForm') && row.original.status === 'published'
        return (
          <div className="flex items-center gap-0.5 justify-end" onClick={(e) => e.stopPropagation()}>
            <Button variant="text" size="sm" iconOnly startIcon={Eye} aria-label="檢視" onClick={() => onSelectForm(row.original)} />
            {canEdit && (
              <Button variant="text" size="sm" iconOnly startIcon={Pencil} aria-label="編輯表單" onClick={() => onEditForm(row.original)} />
            )}
            {canDisable && (
              <Button variant="text" size="sm" iconOnly danger startIcon={Ban} aria-label="停用表單" onClick={() => stub('停用表單')} />
            )}
          </div>
        )
      },
    },
  ]

  return (
    <div className="flex flex-col h-full">
      {/* 主體:清單 or 詳情 */}
      <div className="flex-1 min-h-0">
        {selectedForm ? (
          <FormDetailView key={selectedForm.id} form={selectedForm} role={role} editing={editing} />
        ) : (
          <div className="h-full px-[var(--layout-space-loose)] pt-4 pb-4">
            <DataTable
              columns={columns}
              data={MOCK_FORMS}
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

      {/* 底部固定「檢視身分」demo 列 — 弱化(muted 底 + caption),不隨捲動。
          角色由下游系統指派,此處僅供 prototype 檢視三種角色的功能差異。 */}
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
