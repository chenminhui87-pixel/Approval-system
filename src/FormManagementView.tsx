// 表單管理模組(C)— 增量 1:角色切換器 + 表單清單(依角色顯示對應操作鈕)。
// 角色由下游系統指派,此處僅以「檢視身分」切換器呈現三種角色的 feature 完整度差異。
// 表單詳情 / 送審清單 / 建立編輯(增量 2–3)目前以 toast 佔位。
import {
  SegmentedControl,
  SegmentedControlItem,
  Tag,
  Button,
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

function FormRow({ form, role, onStub }: { form: ManagedForm; role: FormRole; onStub: (label: string) => void }) {
  const canEdit = can(role, 'editForm')
  const canDisable = can(role, 'disableForm') && form.status === 'published'
  return (
    <tr className="border-b border-divider hover:bg-surface-hover">
      <td className="py-3 pr-4 align-top">
        <button
          type="button"
          onClick={() => onStub('表單詳情')}
          className="text-left font-medium hover:text-primary hover:underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
        >
          {form.name}
        </button>
        <div className="text-caption text-fg-placeholder mt-0.5">{form.id}</div>
      </td>
      <td className="py-3 pr-4 align-top text-body text-fg-secondary whitespace-nowrap">{categoryLabel(form.category)}</td>
      <td className="py-3 pr-4 align-top">
        <Tag size="sm" color={FORM_STATUS_COLOR[form.status]} solid={form.status === 'published'}>
          {FORM_STATUS_LABEL[form.status]}
        </Tag>
      </td>
      <td className="py-3 pr-4 align-top whitespace-nowrap tabular-nums">
        <span className="text-body text-foreground font-medium">{form.submissionCount}</span>
        {form.pendingCount > 0 && (
          <span className="text-caption text-fg-placeholder"> · {form.pendingCount} 簽核中</span>
        )}
      </td>
      <td className="py-2 align-top">
        <div className="flex items-center gap-1 justify-end">
          {/* 檢視:所有角色皆可(含 viewer 唯讀) */}
          <Button variant="text" size="sm" startIcon={Eye} onClick={() => onStub('表單詳情')}>
            檢視
          </Button>
          {canEdit && (
            <Button variant="tertiary" size="sm" startIcon={Pencil} onClick={() => onStub('編輯表單')}>
              編輯
            </Button>
          )}
          {canDisable && (
            <Button variant="text" size="sm" danger startIcon={Ban} onClick={() => onStub('停用表單')}>
              停用
            </Button>
          )}
        </div>
      </td>
    </tr>
  )
}

export function FormManagementView({
  role,
  onRoleChange,
}: {
  role: FormRole
  onRoleChange: (r: FormRole) => void
}) {
  const stub = (label: string) => toast({ variant: 'info', title: `${label}(增量 2 / 3 施工中)` })
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

      {/* 表單清單 */}
      <div className="flex-1 min-h-0 overflow-y-auto px-[var(--layout-space-loose)] pb-4">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-divider text-left">
              <th className="py-2 pr-4 text-caption font-medium text-fg-muted">表單名稱</th>
              <th className="py-2 pr-4 text-caption font-medium text-fg-muted">分類</th>
              <th className="py-2 pr-4 text-caption font-medium text-fg-muted">狀態</th>
              <th className="py-2 pr-4 text-caption font-medium text-fg-muted">送審數</th>
              <th className="py-2 text-caption font-medium text-fg-muted text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_FORMS.map((f) => (
              <FormRow key={f.id} form={f} role={role} onStub={stub} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
