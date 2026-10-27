// 表單管理模組(C)— 表單詳情 =「表單內容」單頁。
//   - 檢視模式:像一張真實表單公版(標題 + 各欄位 label + 對應 input,read-only 預覽)
//   - 編輯模式(header「編輯表單」進入):只有「設定」—— 表單命名 / 分類 / 全域設定
//     (例:手機簽核開關),逐欄位即時寫回 forms state。不含客製欄位 builder,也不含
//     建立表單 / 草稿 / 發佈 / 停用 / 刪除這整套生命週期管理(2026-10-27 user 拍板:
//     產品現階段重點只在瀏覽/總覽已建立的表單,不是表單建構或生命週期管理工具;
//     欄位資料仍在 form.fields,檢視模式照常預覽)。
// 送審清單不在本頁 — 由清單列的「查看送審單」進獨立子頁(見 FormManagementView)。
// 註:人員層「owner」是下游指派的「負責窗口」,非系統最高權限。
import {
  Input,
  Textarea,
  Select,
  Switch,
  Field,
  FieldLabel,
} from '@qijenchen/design-system'
import { categoryLabel, type ManagedForm, type FormField } from './formsData'
import { CATEGORIES, type CategoryId } from './data'

// 檢視模式:依型別渲染 read-only 的 input 預覽(簡單版)
function FieldPreview({ field }: { field: FormField }) {
  if (field.type === 'textarea') return <Textarea disabled rows={2} placeholder="多行文字…" />
  if (field.type === 'select') {
    return (
      <Select
        disabled
        placeholder="請選擇…"
        options={(field.options ?? []).map((o) => ({ value: o, label: o }))}
      />
    )
  }
  const placeholder =
    field.type === 'date' ? 'YYYY / MM / DD' : field.type === 'currency' ? '$ 0' : field.type === 'number' ? '0' : '請輸入…'
  return <Input disabled placeholder={placeholder} />
}

export function FormDetailView({
  form,
  editing,
  onUpdateForm,
}: {
  form: ManagedForm
  editing: boolean
  /** 名稱 / 分類 / 全域設定即時寫回 forms state */
  onUpdateForm: (patch: Partial<ManagedForm>) => void
}) {
  const fields: FormField[] = form.fields

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-[var(--layout-space-loose)] py-5">
      <div className="mx-auto w-full max-w-xl">
        <div className="bg-surface border border-divider rounded-xl px-6 py-6">
          {/* 表單公版標題 — 狀態 tag 緊接標題,不放到頁面 header 右側(跟操作按鈕混一起)。
              編輯模式:名稱 / 分類改真的可編輯,即時寫回 forms state(即時反映到
              breadcrumb 與清單)。 */}
          {editing ? (
            <div className="pb-5 mb-5 border-b border-divider flex flex-col gap-3">
              <Field>
                <FieldLabel>表單名稱</FieldLabel>
                <Input
                  value={form.name}
                  onChange={(e) => onUpdateForm({ name: e.target.value })}
                  placeholder="未命名表單"
                />
              </Field>
              <Field>
                <FieldLabel>分類</FieldLabel>
                <Select
                  value={form.category}
                  onChange={(v) => onUpdateForm({ category: v as CategoryId })}
                  options={CATEGORIES.map((c) => ({ value: c.id, label: c.label }))}
                />
              </Field>
            </div>
          ) : (
            <div className="pb-4 mb-5 border-b border-divider">
              {/* 狀態 tag 移到頁面 header 麵包屑(緊接標題,view/editing 兩種模式都在),
                  這裡(表單內容區的 header)不重複顯示 */}
              <h3 className="text-h4 font-semibold">{form.name}</h3>
              <p className="text-caption text-fg-placeholder mt-1">
                {form.description?.trim() ? form.description : `${categoryLabel(form.category)} · 使用者以此表單送出審核`}
              </p>
            </div>
          )}

          {editing ? (
            // ── 編輯模式(全域設定)—— 客製欄位 builder / 生命週期管理不在此頁,見檔案頂部註解 ──
            // Switch 不包進 <Field>:Switch 在 Field context 內會忽略自己的 label/
            // description(改由 FieldLabel 接管,避免雙層 label),這裡要讓 Switch
            // 自己的 label/description 正常顯示,所以不用 Field 包。
            <div className="flex flex-col gap-3">
              <p className="text-body font-medium">全域設定</p>
              <Switch
                checked={form.mobileEnabled}
                onCheckedChange={(c) => onUpdateForm({ mobileEnabled: c === true })}
                label="支援手機簽核"
                description="開放後,使用者可用手機瀏覽器對此表單送出的單據進行簽核"
              />
            </div>
          ) : (
            // ── 檢視模式(表單公版預覽)──
            <div className="flex flex-col gap-4">
              {fields.map((f, i) => (
                <div key={i} className="flex flex-col gap-1.5">
                  <label className="text-body font-medium">
                    {f.label}
                    {f.required && <span className="text-fg-danger ml-1">*</span>}
                  </label>
                  <FieldPreview field={f} />
                </div>
              ))}
              {fields.length === 0 && (
                <p className="text-body text-fg-placeholder text-center py-6">此表單尚無欄位。</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
