// 表單管理模組(C)— 表單詳情 =「表單內容」單頁(完整表單 view,非欄位清單)。
//   - 檢視模式:像一張真實表單公版(標題 + 各欄位 label + 對應 input,read-only 預覽)
//   - 編輯模式(header「編輯表單」進入):每欄可改標題 / 型別 / 必填,最下方「新增欄位」
// 送審清單不在本頁 — 由清單列的「查看送審單」進獨立子頁(見 FormManagementView)。
// 註:人員層「owner」是下游指派的「負責窗口」,非系統最高權限。
import { useEffect, useState } from 'react'
import {
  Input,
  Textarea,
  Select,
  Checkbox,
  Button,
  Tag,
  Field,
  FieldLabel,
  ChipGroup,
  Chip,
} from '@qijenchen/design-system'
import { Plus, Trash2 } from 'lucide-react'
import {
  FIELD_TYPE_LABEL,
  FORM_STATUS_LABEL,
  FORM_STATUS_COLOR,
  categoryLabel,
  type ManagedForm,
  type FormField,
  type FormFieldType,
} from './formsData'
import { CATEGORIES, type CategoryId } from './data'

const TYPE_OPTIONS = (Object.keys(FIELD_TYPE_LABEL) as FormFieldType[]).map((t) => ({
  value: t,
  label: FIELD_TYPE_LABEL[t],
}))

// prototype persist:per-viewer localStorage,不做共享後端(對齊 BACKLOG 既有定調)。
// key 以 form.id 區分,讀寫失敗(無痕模式 / storage 關閉)時 fallback 回表單原始欄位,不中斷編輯。
const fieldsStorageKey = (formId: string) => `approval-system:form-fields:${formId}`

function loadFields(formId: string, fallback: FormField[]): FormField[] {
  try {
    const raw = localStorage.getItem(fieldsStorageKey(formId))
    if (!raw) return fallback
    return JSON.parse(raw) as FormField[]
  } catch {
    return fallback
  }
}

function saveFields(formId: string, fields: FormField[]) {
  try {
    localStorage.setItem(fieldsStorageKey(formId), JSON.stringify(fields))
  } catch {
    // storage 不可用(無痕模式 / 容量滿)— prototype 範疇內靜默放棄 persist,不中斷編輯體驗
  }
}

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
  /** 標題 / 說明 / 分類即時寫回(與 fields 的 localStorage 草稿不同層次 — 見呼叫端註解) */
  onUpdateForm: (patch: Partial<ManagedForm>) => void
}) {
  // prototype persist:初始值優先讀 localStorage 草稿(若有),否則用表單原始欄位；
  // 每次變動即寫回 localStorage,離開頁面 / 重新整理後仍保留(component 以 form.id 為 key 掛載,
  // 切表單會重新初始化,各表單草稿互不影響)。
  const [fields, setFields] = useState<FormField[]>(() => loadFields(form.id, form.fields))

  useEffect(() => {
    saveFields(form.id, fields)
  }, [form.id, fields])

  const updateField = (i: number, patch: Partial<FormField>) =>
    setFields((prev) => prev.map((f, idx) => (idx === i ? { ...f, ...patch } : f)))
  const removeField = (i: number) => setFields((prev) => prev.filter((_, idx) => idx !== i))
  const addField = () => setFields((prev) => [...prev, { label: '新欄位', type: 'string', required: false }])

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-[var(--layout-space-loose)] py-5">
      <div className="mx-auto w-full max-w-xl">
        <div className="bg-surface border border-divider rounded-xl px-6 py-6">
          {/* 表單公版標題 — 狀態 tag 緊接標題,不放到頁面 header 右側(跟操作按鈕混一起)。
              編輯模式:標題 / 說明 / 分類改真的可編輯,即時寫回 forms state(即時反映到
              breadcrumb 與清單,不等「發佈」才同步)。 */}
          {editing ? (
            <div className="pb-5 mb-5 border-b border-divider flex flex-col gap-3">
              <Field>
                <FieldLabel>表單標題</FieldLabel>
                <Input
                  value={form.name}
                  onChange={(e) => onUpdateForm({ name: e.target.value })}
                  placeholder="未命名表單"
                />
              </Field>
              <Field>
                <FieldLabel>新增說明</FieldLabel>
                <Input
                  value={form.description ?? ''}
                  onChange={(e) => onUpdateForm({ description: e.target.value })}
                  placeholder="新增這張表單的用途"
                />
              </Field>
              <Field>
                <FieldLabel>分類</FieldLabel>
                <ChipGroup
                  type="single"
                  value={form.category}
                  onValueChange={(v: string | undefined) => v && onUpdateForm({ category: v as CategoryId })}
                >
                  {CATEGORIES.map((c) => (
                    <Chip key={c.id} value={c.id}>{c.label}</Chip>
                  ))}
                </ChipGroup>
              </Field>
            </div>
          ) : (
            <div className="pb-4 mb-5 border-b border-divider">
              <div className="flex items-center gap-2">
                <h3 className="text-h4 font-semibold">{form.name}</h3>
                <Tag size="sm" color={FORM_STATUS_COLOR[form.status]} solid={form.status === 'published'}>
                  {FORM_STATUS_LABEL[form.status]}
                </Tag>
              </div>
              <p className="text-caption text-fg-placeholder mt-1">
                {form.description?.trim() ? form.description : `${categoryLabel(form.category)} · 使用者以此表單送出審核`}
              </p>
            </div>
          )}

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
    </div>
  )
}
