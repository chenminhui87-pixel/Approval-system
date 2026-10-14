// 表單管理模組(C)— 增量 2a:表單詳情(欄位內容 read-only + 依角色操作鈕)。
// 送審清單(複用簽核 DataTable + 代理操作)於增量 2b 接上。
// 註:人員層「owner」是下游指派的「負責窗口」,非系統最高權限(系統 token 才是,不以人呈現)。
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Button,
  Tag,
  Badge,
  DescriptionList,
  DescriptionItem,
} from '@qijenchen/design-system'
import { ChevronLeft, Pencil, Ban } from 'lucide-react'
import {
  FORM_STATUS_LABEL,
  FORM_STATUS_COLOR,
  FIELD_TYPE_LABEL,
  can,
  categoryLabel,
  type FormRole,
  type ManagedForm,
} from './formsData'

export function FormDetailView({
  form,
  role,
  onBack,
  onStub,
}: {
  form: ManagedForm
  role: FormRole
  onBack: () => void
  onStub: (label: string) => void
}) {
  const canEdit = can(role, 'editForm')
  const canDisable = can(role, 'disableForm') && form.status === 'published'

  return (
    <div className="flex flex-col h-full">
      {/* Top bar:返回 + 名稱 + 狀態 + 依角色操作 */}
      <div className="flex items-center gap-2 px-[var(--layout-space-loose)] pt-5 pb-3 shrink-0 border-b border-divider">
        <Button variant="text" size="sm" iconOnly startIcon={ChevronLeft} aria-label="返回表單清單" onClick={onBack} />
        <h2 className="text-body-lg font-medium truncate">{form.name}</h2>
        <Tag size="sm" color={FORM_STATUS_COLOR[form.status]} solid={form.status === 'published'}>
          {FORM_STATUS_LABEL[form.status]}
        </Tag>
        <div className="flex-1" />
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

      <Tabs defaultValue="fields" className="flex-1 flex flex-col min-h-0">
        <div className="shrink-0 bg-surface px-[var(--layout-space-loose)] pt-2">
          <TabsList>
            <TabsTrigger value="fields">表單欄位</TabsTrigger>
            <TabsTrigger value="submissions">送審清單</TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-[var(--layout-space-loose)] py-4">
          {/* 表單欄位 */}
          <TabsContent value="fields" className="flex flex-col gap-5">
            <section>
              <p className="text-h5 font-medium mb-3">基本資訊</p>
              <DescriptionList orientation="horizontal">
                <DescriptionItem label="表單編號">{form.id}</DescriptionItem>
                <DescriptionItem label="分類">{categoryLabel(form.category)}</DescriptionItem>
                <DescriptionItem label="負責窗口">{form.owner}</DescriptionItem>
                <DescriptionItem label="最後更新">{form.updatedAt}</DescriptionItem>
              </DescriptionList>
            </section>

            <section>
              <div className="flex items-center justify-between mb-3">
                <p className="text-h5 font-medium">欄位設定（{form.fields.length}）</p>
                {canEdit && (
                  <Button variant="text" size="sm" startIcon={Pencil} onClick={() => onStub('編輯欄位')}>
                    編輯欄位
                  </Button>
                )}
              </div>
              <ul className="flex flex-col list-none m-0 p-0 border border-divider rounded-lg overflow-hidden">
                {form.fields.map((f, i) => (
                  <li
                    key={f.label + i}
                    className="flex items-start gap-3 px-4 py-3 bg-surface border-b border-divider last:border-b-0"
                  >
                    <span className="text-caption text-fg-placeholder tabular-nums mt-0.5 w-5 shrink-0">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <span className="text-body font-medium">{f.label}</span>
                      {f.options && f.options.length > 0 && (
                        <div className="text-caption text-fg-placeholder mt-0.5">選項：{f.options.join('、')}</div>
                      )}
                    </div>
                    <Tag size="sm" color="neutral">{FIELD_TYPE_LABEL[f.type]}</Tag>
                    {f.required && <Tag size="sm" color="red">必填</Tag>}
                  </li>
                ))}
              </ul>
              {!canEdit && (
                <p className="text-caption text-fg-placeholder mt-2">
                  目前身分為唯讀檢視,欄位設定由 owner / admin（下游指派）維護。
                </p>
              )}
            </section>
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
