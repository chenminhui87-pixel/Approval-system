// 表單管理模組(C)— 表單詳情 =「表單內容」單頁。
// 2026-10-27 user 拍板再收斂:不再分「檢視模式(公版預覽)」/「編輯模式」兩態 ——
// 一進來就是「設定」:表單名稱 / 分類 / 全域設定(手機簽核開關),逐欄位即時寫回
// forms state。不給表單公版欄位預覽(fields 資料還在 ManagedForm.fields,只是這頁
// 不再讀取渲染);也不含客製欄位 builder,或建立表單 / 草稿 / 發佈 / 停用 / 刪除這整套
// 生命週期管理 —— 產品現階段重點只在瀏覽/總覽已建立的表單。`canEdit=false`(viewer)
// 時整組設定欄位改唯讀(disabled),還是同一個頁面,只是不能改。
// 送審清單不在本頁 — 由清單列的「查看送審單」進獨立子頁(見 FormManagementView)。
// 註:人員層「owner」是下游指派的「負責窗口」,非系統最高權限。
import { Input, Select, Switch, Field, FieldLabel } from '@qijenchen/design-system'
import type { ManagedForm } from './formsData'
import { CATEGORIES, type CategoryId } from './data'

export function FormDetailView({
  form,
  canEdit,
  onUpdateForm,
}: {
  form: ManagedForm
  /** false(viewer)時整組設定欄位唯讀,不是不顯示 */
  canEdit: boolean
  /** 名稱 / 分類 / 全域設定即時寫回 forms state */
  onUpdateForm: (patch: Partial<ManagedForm>) => void
}) {
  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-[var(--layout-space-loose)] py-5">
      <div className="mx-auto w-full max-w-xl">
        <div className="bg-surface border border-divider rounded-xl px-6 py-6">
          <div className="pb-5 mb-5 border-b border-divider flex flex-col gap-3">
            <Field>
              <FieldLabel>表單名稱</FieldLabel>
              <Input
                value={form.name}
                onChange={(e) => onUpdateForm({ name: e.target.value })}
                placeholder="未命名表單"
                disabled={!canEdit}
              />
            </Field>
            <Field>
              <FieldLabel>分類</FieldLabel>
              <Select
                value={form.category}
                onChange={(v) => onUpdateForm({ category: v as CategoryId })}
                options={CATEGORIES.map((c) => ({ value: c.id, label: c.label }))}
                disabled={!canEdit}
              />
            </Field>
          </div>

          {/* Switch 不包進 <Field>:Switch 在 Field context 內會忽略自己的 label/
              description(改由 FieldLabel 接管,避免雙層 label),這裡要讓 Switch
              自己的 label/description 正常顯示,所以不用 Field 包。 */}
          <div className="flex flex-col gap-3">
            <p className="text-body font-medium">全域設定</p>
            <Switch
              checked={form.mobileEnabled}
              onCheckedChange={(c) => onUpdateForm({ mobileEnabled: c === true })}
              label="支援手機簽核"
              description="開放後,使用者可用手機瀏覽器對此表單送出的單據進行簽核"
              disabled={!canEdit}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
