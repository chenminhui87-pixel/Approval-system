// 表單管理模組(C)— 增量 1:角色切換器 + 表單清單(依角色顯示對應操作)。
// 清單走 DS DataTable(與簽核清單視覺一致)。角色由下游系統指派,此處以「檢視身分」
// 切換器呈現三種角色的 feature 完整度差異。詳情 / 建立 / 編輯(增量 2–3)以 toast 佔位。
import {
  SegmentedControl,
  SegmentedControlItem,
  Tag,
  Button,
  DataTable,
  type DataTableProps,
  toast,
} from '@qijenchen/design-system'
import { Plus, Pencil, Ban, Eye } from 'lucide-react'
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

export function FormManagementView({
  role,
  onRoleChange,
}: {
  role: FormRole
  onRoleChange: (r: FormRole) => void
}) {
  const stub = (label: string) => toast({ variant: 'info', title: `${label}(增量 2 / 3 施工中)` })

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
            onClick={() => stub('表單詳情')}
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
      meta: { width: 268 },
      cell: ({ row }) => {
        const canEdit = can(role, 'editForm')
        const canDisable = can(role, 'disableForm') && row.original.status === 'published'
        return (
          <div className="flex items-center gap-1 justify-end" onClick={(e) => e.stopPropagation()}>
            {/* 檢視:所有角色皆可(含 viewer 唯讀) */}
            <Button variant="text" size="sm" startIcon={Eye} onClick={() => stub('表單詳情')}>
              檢視
            </Button>
            {canEdit && (
              <Button variant="tertiary" size="sm" startIcon={Pencil} onClick={() => stub('編輯表單')}>
                編輯
              </Button>
            )}
            {canDisable && (
              <Button variant="text" size="sm" danger startIcon={Ban} onClick={() => stub('停用表單')}>
                停用
              </Button>
            )}
          </div>
        )
      },
    },
  ]

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar:檢視身分切換器(prototype demo)+ 建立表單(依角色) */}
      <div className="flex flex-col gap-2 px-[var(--layout-space-loose)] pt-6 pb-3 shrink-0">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <span className="text-caption text-fg-muted shrink-0">檢視身分</span>
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
          </div>
          {can(role, 'createForm') && (
            <Button variant="primary" size="sm" startIcon={Plus} onClick={() => stub('建立表單')}>
              建立表單
            </Button>
          )}
        </div>
        <p className="text-caption text-fg-placeholder">
          {FORM_ROLE_DESC[role]} · 下方操作鈕依此身分顯示(角色由下游系統指派,簽核系統僅呈現差異)
        </p>
      </div>

      {/* 表單清單 — DS DataTable(與簽核清單一致) */}
      <div className="flex-1 min-h-0 px-[var(--layout-space-loose)] pb-4">
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
    </div>
  )
}
