import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
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
} from '@qijenchen/design-system'
import { Paperclip, Share2, UserCheck, Undo2, Ban } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@qijenchen/design-system'
import type { ApprovalRecord } from './data'
import { ApprovalRoute } from './ApprovalRoute'

interface ApprovalModalProps {
  record: ApprovalRecord | null
  open: boolean
  onClose: () => void
  mode: 'approve' | 'view'
  onApprove?: (id: string, comment?: string) => void
  onReject?: (id: string, comment: string) => void
  onMoreAction?: (label: string) => void
}

const URGENCY_COLOR = {
  high: 'red',
  medium: 'yellow',
  low: 'neutral',
} as const

const URGENCY_LABEL = {
  high: '緊急',
  medium: '一般',
  low: '低',
} as const

const STATUS_COLOR = {
  pending: 'blue',
  approved: 'green',
  rejected: 'red',
} as const

const STATUS_LABEL = {
  pending: '簽核中',
  approved: '已核准',
  rejected: '已退件',
} as const

export function ApprovalModal({
  record,
  open,
  onClose,
  mode,
  onApprove,
  onReject,
  onMoreAction,
}: ApprovalModalProps) {
  const [confirmAction, setConfirmAction] = useState<'approve' | 'reject' | null>(null)
  const [comment, setComment] = useState('')

  if (!record) return null

  const currentStep = record.steps.find((s) => s.status === 'current')
  const completedValues = record.steps.filter((s) => s.status === 'completed').map((s) => s.id)
  const errorValues = record.steps.filter((s) => s.status === 'error').map((s) => s.id)
  const hasRichRoute = record.steps.some((s) => s.people && s.people.length > 0)

  function openConfirm(action: 'approve' | 'reject') {
    setComment('')
    setConfirmAction(action)
  }

  function closeConfirm() {
    setConfirmAction(null)
    setComment('')
  }

  function submit() {
    if (!confirmAction || !record) return
    if (confirmAction === 'approve') {
      onApprove?.(record.id, comment.trim() || undefined)
    } else {
      onReject?.(record.id, comment.trim())
    }
    closeConfirm()
  }

  const submitDisabled = confirmAction === 'reject' && comment.trim().length === 0

  return (
    <Dialog open={open} onOpenChange={(o: boolean) => !o && onClose()}>
      <DialogContent maxWidth="920px" onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="truncate">{record.title}</span>
            <Tag size="sm" color={STATUS_COLOR[record.status]} solid={record.status === 'approved'}>
              {STATUS_LABEL[record.status]}
            </Tag>
            {record.urgency === 'high' && (
              <Tag size="sm" color={URGENCY_COLOR[record.urgency]}>
                {URGENCY_LABEL[record.urgency]}
              </Tag>
            )}
          </DialogTitle>
        </DialogHeader>

        {/* Custom body — bypass DialogBody ScrollArea wrap 讓 divider 能撐滿到底 */}
        <div data-dialog-body className="flex-1 min-h-0 flex flex-row gap-0">
          {/* Left — form details */}
          <div className="flex-[3] min-w-0 flex flex-col gap-5 px-6 py-5 overflow-y-auto">
            {/* Fixed fields */}
            <section>
              <p className="text-h4 font-medium mb-3">基本資訊</p>
              <DescriptionList direction="vertical">
                {record.fixedFields.map((f) => (
                  <DescriptionItem key={f.label} label={f.label}>
                    {f.value}
                  </DescriptionItem>
                ))}
              </DescriptionList>
            </section>

            <Separator />

            {/* Custom fields */}
            <section>
              <p className="text-h4 font-medium mb-3">申請內容</p>
              <DescriptionList direction="vertical">
                {record.customFields.map((f) => (
                  <DescriptionItem key={f.label} label={f.label}>
                    {f.value}
                  </DescriptionItem>
                ))}
              </DescriptionList>
            </section>

            <Separator />

            {/* Attachments */}
            <section>
              <p className="text-h4 font-medium mb-3">附件</p>
              {record.attachments.length === 0 ? (
                <p className="text-body text-fg-placeholder">無附件</p>
              ) : (
                <ul className="flex flex-col gap-2 list-none m-0 p-0">
                  {record.attachments.map((att) => (
                    <li key={att.id}>
                      <a
                        href={att.url}
                        className="inline-flex items-center gap-1.5 text-body text-fg-link hover:underline"
                      >
                        <Paperclip size={16} className="shrink-0" />
                        <span>{att.name}</span>
                        <span className="text-fg-placeholder text-caption">
                          {att.size}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          {/* Divider */}
          <div className="w-px bg-divider shrink-0" />

          {/* Right — approval route */}
          <div className="flex-[1.5] min-w-0 px-5 py-5 overflow-y-auto">
            <p className="text-h4 font-medium mb-4">簽核流程</p>
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
                        <span className="block text-fg-success">
                          已簽：{step.approvedBy.join('、')}
                        </span>
                      )}
                      {step.approvedAt && (
                        <span className="block text-fg-placeholder">{step.approvedAt}</span>
                      )}
                    </StepDescription>
                  </StepItem>
                ))}
              </Steps>
            )}
          </div>
        </div>

        {mode === 'approve' && record.status === 'pending' && (
          <DialogFooter>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">⋯</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem startIcon={Share2} onClick={() => onMoreAction?.('轉寄')}>轉寄</DropdownMenuItem>
                <DropdownMenuItem startIcon={UserCheck} onClick={() => onMoreAction?.('移交 Owner')}>移交</DropdownMenuItem>
                <DropdownMenuItem startIcon={Undo2} onClick={() => onMoreAction?.('退回給申請人')}>退回給申請人</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem startIcon={Ban} className="text-fg-danger" onClick={() => onMoreAction?.('作廢')}>作廢</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="secondary" danger onClick={() => openConfirm('reject')}>
              退件
            </Button>
            <Button variant="secondary" onClick={() => openConfirm('approve')}>
              核准
            </Button>
          </DialogFooter>
        )}
      </DialogContent>

      {/* Confirm dialog — header(close X) + body(comment textarea) + footer(送出) */}
      <Dialog
        open={confirmAction !== null}
        onOpenChange={(o: boolean) => !o && closeConfirm()}
      >
        <DialogContent
          maxWidth="480px"
          autoHeight
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>
              {confirmAction === 'approve' ? '核准簽核' : '退件簽核'}
            </DialogTitle>
          </DialogHeader>
          <DialogBody className="flex flex-col gap-3">
            <p className="text-body text-fg-secondary">
              單據：<span className="text-foreground font-medium">{record.title}</span>
            </p>
            <label className="flex flex-col gap-1.5">
              <span className="text-body">
                簽核意見
                {confirmAction === 'reject' && (
                  <span className="text-fg-danger ml-1">*</span>
                )}
                {confirmAction === 'approve' && (
                  <span className="text-fg-placeholder ml-1 text-caption">（選填）</span>
                )}
              </span>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                placeholder={
                  confirmAction === 'reject'
                    ? '請說明退件原因，讓申請人能依此修正再送'
                    : '可補充核准意見供下一站簽核人參考'
                }
              />
            </label>
          </DialogBody>
          <DialogFooter>
            <Button variant="tertiary" onClick={closeConfirm}>
              取消
            </Button>
            <Button
              variant="primary"
              danger={confirmAction === 'reject'}
              disabled={submitDisabled}
              onClick={submit}
            >
              送出
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  )
}
