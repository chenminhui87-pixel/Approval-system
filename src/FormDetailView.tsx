// 表單管理模組(C)— 表單詳情。「表單欄位」tab = 完整表單 view(非欄位清單):
//   - 檢視模式:像一張真實表單公版(標題 + 各欄位 label + 對應 input,read-only 預覽)
//   - 編輯模式(header「編輯表單」進入):每個欄位可改標題 / 型別 / 必填,最下方「新增欄位」
// 簡單 input 版,先訂關鍵介面;實際存檔(prototype)為 session 內本地狀態。
// 送審清單(複用簽核 DataTable + 代理操作)於增量 2b 接上。
// 註:人員層「owner」是下游指派的「負責窗口」,非系統最高權限。
import { useState } from 'react'
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Badge,
  Input,
  Textarea,
  Select,
  Checkbox,
  Button,
} from '@qijenchen/design-system'
import { Plus, Trash2 } from 'lucide-react'
import {
  FIELD_TYPE_LABEL,
  categoryLabel,
  type FormRole,
  type ManagedForm,
  type FormField,
  type FormFieldType,
} from './formsData'

const TYPE_OPTIONS = (Object.keys(FIELD_TYPE_LABEL) as FormFieldType[]).map((t) => ({
  value: t,
  label: FIELD_TYPE_LABEL[t],
}))

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
}: {
  form: ManagedForm
  role: FormRole
  editing: boolean
}) {
  // prototype:欄位草稿存本地(component 以 form.id 為 key 掛載 → 切表單自動重置)
  const [fields, setFields] = useState<FormField[]>(form.fields)

  const updateField = (i: number, patch: Partial<FormField>) =>
    setFields((prev) => prev.map((f, idx) => (idx === i ? { ...f, ...patch } : f)))
  const removeField = (i: number) => setFields((prev) => prev.filter((_, idx) => idx !== i))
  const addField = () => setFields((prev) => [...prev, { label: '新欄位', type: 'string', required: false }])

  return (
    <div className="flex flex-col h-full">
      <Tabs defaultValue="fields" className="flex-1 flex flex-col min-h-0">
        <div className="shrink-0 bg-surface px-[var(--layout-space-loose)] pt-2">
          <TabsList>
            <TabsTrigger value="fields">表單欄位</TabsTrigger>
            <TabsTrigger value="submissions">送審清單</TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-[var(--layout-space-loose)] py-5">
          {/* 表單欄位 = 完整表單 view(公版);編輯模式進 builder */}
          <TabsContent value="fields">
            <div className="mx-auto w-full max-w-xl">
              <div className="bg-surface border border-divider rounded-xl px-6 py-6">
                {/* 表單公版標題 */}
                <div className="pb-4 mb-5 border-b border-divider">
                  <h3 className="text-h4 font-semibold">{form.name}</h3>
                  <p className="text-caption text-fg-placeholder mt-1">
                    {categoryLabel(form.category)} · 使用者以此表單送出審核
                  </p>
                </div>

                {editing ? (
                  // ── 編輯模式(builder)──
                  <div className="flex flex-col gap-3">
                    {fields.map((f, i) => (
                      <div key={i} className="rounded-lg border border-divider bg-canvas p-3 flex flex-col gap-2.5">
                        <div className="flex items-center gap-2">
                          <Input
                            value={f.label}
                            onChange={(e) => updateField(i, { label: e.target.value })}
                            placeholder="欄位標題"
                            className="flex-1"
                          />
                          <Select
                            value={f.type}
                            onChange={(v) => updateField(i, { type: v as FormFieldType })}
                            options={TYPE_OPTIONS}
                            width="hug"
                          />
                          <Button
                            variant="text"
                            size="sm"
                            iconOnly
                            danger
                            startIcon={Trash2}
                            aria-label="移除欄位"
                            onClick={() => removeField(i)}
                          />
                        </div>
                        <Checkbox
                          checked={f.required}
                          onCheckedChange={(c) => updateField(i, { required: c === true })}
                          label="必填"
                        />
                      </div>
                    ))}
                    <Button variant="tertiary" startIcon={Plus} onClick={addField} className="w-full">
                      新增欄位
                    </Button>
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
          </TabsContent>

          {/* 送審清單（增量 2b 複用簽核 DataTable + 代理操作）*/}
          <TabsContent value="submissions">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="inline-flex items-center gap-2 text-body">
                累計送審
                <Badge variant="low" count={form.submissionCount} />
              </span>
              {form.pendingCount > 0 && (
                <span className="inline-flex items-center gap-2 text-body">
                  簽核中
                  <Badge variant="critical" count={form.pendingCount} />
                </span>
              )}
            </div>
            <div className="rounded-lg border border-dashed border-divider px-4 py-8 text-center text-fg-placeholder">
              <p className="text-body">此處將複用簽核清單(DataTable + 右側詳情面板)呈現以此表單送出的審核,</p>
              <p className="text-body">owner / admin 可對送審單執行代理操作(轉寄 / 移交簽核者 / 退回 / 作廢 / 催辦…)。</p>
              <p className="text-caption mt-2">— 增量 2b 施工中 —</p>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
