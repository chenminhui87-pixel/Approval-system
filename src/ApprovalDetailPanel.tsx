// 右側面板內容 — 把原 ApprovalModal 的詳情搬進較窄的 AppShellAside。
// 因面板寬度小,header 下方用 Tabs 把「申請內容 / 簽核流程」拆兩頁。
// 核准 / 退件 在窄面板走 inline 確認(footer 切成留言 + 送出),不另開 Dialog。
import { useState } from 'react'
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Button,
  Steps,
  StepItem,
  StepLabel,
  StepDescription,
  DescriptionList,
  DescriptionItem,
  Tag,
  Textarea,
  Separator,
  Avatar,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@qijenchen/design-system'
import { Paperclip, Share2, UserCheck, Undo2, Ban, ChevronLeft, MoreHorizontal, Maximize2 } from 'lucide-react'
import type { ApprovalRecord } from './data'
import { ApprovalRoute } from './ApprovalRoute'

interface ApprovalDetailPanelProps {
  record: ApprovalRecord
  mode: 'approve' | 'view'
  onApprove: (id: string, comment?: string) => void
  onReject: (id: string, comment: string) => void
  onMoreAction: (label: string) => void
  /** 展開為完整 modal 大視圖 */
  onExpand?: () => void
}

const URGENCY_COLOR = { high: 'red', medium: 'yellow', low: 'neutral' } as const
const URGENCY_LABEL = { high: '緊急', medium: '一般', low: '低' } as const
const STATUS_COLOR = { pending: 'blue', approved: 'green', rejected: 'red' } as const
const STATUS_LABEL = { pending: '簽核中', approved: '已核准', rejected: '已退件' } as const

export function ApprovalDetailPanel({
  record,
  mode,
  onApprove,
  onReject,
  onMoreAction,
  onExpand,
}: ApprovalDetailPanelProps) {
  const [tab, setTab] = useState<'content' | 'route'>('content')
  const [confirmAction, setConfirmAction] = useState<'approve' | 'reject' | null>(null)
  const [comment, setComment] = useState('')

  const currentStep = record.steps.find((s) => s.status === 'current')
  const completedValues = record.steps.filter((s) => s.status === 'completed').map((s) => s.id)
  const errorValues = record.steps.filter((s) => s.status === 'error').map((s) => s.id)
  const hasRichRoute = record.steps.some((s) => s.people && s.people.length > 0)

  const showActions = mode === 'approve' && record.status === 'pending'
  const submitDisabled = confirmAction === 'reject' && comment.trim().length === 0

  function openConfirm(action: 'approve' | 'reject') {
    setComment('')
    setConfirmAction(action)
  }

  function submit() {
    if (!confirmAction) return
    if (confirmAction === 'approve') onApprove(record.id, comment.trim() || undefined)
    else onReject(record.id, comment.trim())
    setConfirmAction(null)
    setComment('')
  }

  return (
    <div className="flex flex-col min-h-full">
      <Tabs value={tab} onValueChange={(v: string) => setTab(v as 'content' | 'route')} className="flex-1 flex flex-col min-h-0">
        {/* Tab bar — sticky 在標題列下方;右側「展開」開完整 modal */}
        <div className="sticky top-0 z-10 bg-surface border-b border-divider px-4 pt-2 flex items-end justify-between gap-2">
          <TabsList>
            <TabsTrigger value="content">申請內容</TabsTrigger>
            <TabsTrigger value="route">簽核流程</TabsTrigger>
          </TabsList>
          {onExpand && (
            <Button
              variant="tertiary"
              size="sm"
              startIcon={Maximize2}
              aria-label="展開為完整視圖"
              onClick={onExpand}
              className="mb-1.5"
            />
          )}
        </div>

        {/* 申請內容 */}
        <TabsContent value="content" className="flex flex-col gap-5 px-4 py-4">
          {/* Meta 列 — 面板標題只有單據名,狀態/緊急在此補回 */}
          <div className="flex flex-wrap items-center gap-2">
            <Tag size="sm" color={STATUS_COLOR[record.status]} solid={record.status === 'approved'}>
              {STATUS_LABEL[record.status]}
            </Tag>
            {record.urgency === 'high' && (
              <Tag size="sm" color={URGENCY_COLOR[record.urgency]}>{URGENCY_LABEL[record.urgency]}</Tag>
            )}
            <span className="inline-flex items-center gap-1 text-caption text-fg-secondary ml-auto">
              <Avatar alt={record.applicant} size={16} color="blue" />
              {record.applicant}
            </span>
          </div>

          <section>
            <p className="text-h5 font-medium mb-3">基本資訊</p>
            <DescriptionList orientation="vertical">
              {record.fixedFields.map((f) => (
                <DescriptionItem key={f.label} label={f.label}>{f.value}</DescriptionItem>
              ))}
            </DescriptionList>
          </section>

          <Separator />

          <section>
            <p className="text-h5 font-medium mb-3">申請內容</p>
            <DescriptionList orientation="vertical">
              {record.customFields.map((f) => (
                <DescriptionItem key={f.label} label={f.label}>{f.value}</DescriptionItem>
              ))}
            </DescriptionList>
          </section>

          <Separator />

          <section>
            <p className="text-h5 font-medium mb-3">附件</p>
            {record.attachments.length === 0 ? (
              <p className="text-body text-fg-placeholder">無附件</p>
            ) : (
              <ul className="flex flex-col gap-2 list-none m-0 p-0">
                {record.attachments.map((att) => (
                  <li key={att.id}>
                    <a href={att.url} className="inline-flex items-center gap-1.5 text-body text-fg-link hover:underline">
                      <Paperclip size={16} className="shrink-0" />
                      <span>{att.name}</span>
                      <span className="text-fg-placeholder text-caption">{att.size}</span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </TabsContent>

        {/* 簽核流程 */}
        <TabsContent value="route" className="px-4 py-4">
          {hasRichRoute ? (
            <ApprovalRoute steps={record.steps} />
          ) : (
            <Steps
              value={currentStep?.id}
              completedValues={completedValues}
              errorValues={errorValues}
              orientation="vertical"
              size="sm"
            >
              {record.steps.map((step) => (
                <StepItem key={step.id} value={step.id}>
                  <StepLabel>{step.label}</StepLabel>
                  <StepDescription>
                    {step.parallel ? '平行簽核：' : ''}
                    {step.approvers.join('、')}
                    {step.approvedBy && step.approvedBy.length > 0 && (
                      <span className="block text-fg-success">已簽：{step.approvedBy.join('、')}</span>
                    )}
                    {step.approvedAt && <span className="block text-fg-placeholder">{step.approvedAt}</span>}
                  </StepDescription>
                </StepItem>
              ))}
            </Steps>
          )}
        </TabsContent>
      </Tabs>

      {/* Footer 動作 — sticky 底部 */}
      {showActions && (
        <div className="sticky bottom-0 mt-auto bg-surface border-t border-divider px-4 py-3">
          {confirmAction === null ? (
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="tertiary" size="sm" startIcon={MoreHorizontal} aria-label="更多動作" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem startIcon={Share2} onClick={() => onMoreAction('轉寄')}>轉寄</DropdownMenuItem>
                  <DropdownMenuItem startIcon={UserCheck} onClick={() => onMoreAction('移交 Owner')}>移交</DropdownMenuItem>
                  <DropdownMenuItem startIcon={Undo2} onClick={() => onMoreAction('退回給申請人')}>退回給申請人</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem startIcon={Ban} className="text-fg-danger" onClick={() => onMoreAction('作廢')}>作廢</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <div className="flex-1" />
              <Button variant="secondary" danger onClick={() => openConfirm('reject')}>退件</Button>
              <Button variant="secondary" onClick={() => openConfirm('approve')}>核准</Button>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-2">
                <Button variant="tertiary" size="sm" startIcon={ChevronLeft} onClick={() => setConfirmAction(null)}>返回</Button>
                <span className="text-body font-medium flex-1">
                  {confirmAction === 'approve' ? '核准意見' : '退件原因'}
                  {confirmAction === 'reject' && <span className="text-fg-danger ml-1">*</span>}
                  {confirmAction === 'approve' && <span className="text-fg-placeholder ml-1 text-caption">（選填）</span>}
                </span>
                <Button
                  variant="primary"
                  danger={confirmAction === 'reject'}
                  disabled={submitDisabled}
                  onClick={submit}
                >
                  送出
                </Button>
              </div>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                placeholder={
                  confirmAction === 'reject'
                    ? '請說明退件原因，讓申請人能依此修正再送'
                    : '可補充核准意見供下一站簽核人參考'
                }
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
