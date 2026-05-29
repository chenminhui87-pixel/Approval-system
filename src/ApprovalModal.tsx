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
  Separator,
} from '@qijenchen/design-system'
import { FileText, Image as ImageIcon } from 'lucide-react'
import type { ApprovalRecord } from './data'

interface ApprovalModalProps {
  record: ApprovalRecord | null
  open: boolean
  onClose: () => void
  mode: 'approve' | 'view'
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

export function ApprovalModal({ record, open, onClose, mode }: ApprovalModalProps) {
  if (!record) return null

  const currentStep = record.steps.find((s) => s.status === 'current')
  const completedValues = record.steps.filter((s) => s.status === 'completed').map((s) => s.id)
  const errorValues = record.steps.filter((s) => s.status === 'error').map((s) => s.id)

  return (
    <Dialog open={open} onOpenChange={(o: boolean) => !o && onClose()}>
      <DialogContent className="max-w-4xl w-full" onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="truncate">{record.title}</span>
            <Tag color={STATUS_COLOR[record.status]} solid={record.status === 'approved'}>
              {STATUS_LABEL[record.status]}
            </Tag>
            <Tag color={URGENCY_COLOR[record.urgency]}>
              {URGENCY_LABEL[record.urgency]}
            </Tag>
          </DialogTitle>
        </DialogHeader>

        <DialogBody className="flex flex-row gap-0 !p-0">
          {/* Left — form details */}
          <div className="flex-[3] min-w-0 flex flex-col gap-5 px-6 py-5 overflow-y-auto">
            {/* Fixed fields */}
            <section>
              <p className="text-caption text-fg-secondary mb-2">基本資訊</p>
              <DescriptionList direction="horizontal">
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
              <p className="text-caption text-fg-secondary mb-2">申請內容</p>
              <DescriptionList direction="horizontal">
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
              <p className="text-caption text-fg-secondary mb-2">附件</p>
              {record.attachments.length === 0 ? (
                <p className="text-body text-fg-placeholder">無附件</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {record.attachments.map((att) => (
                    <a
                      key={att.id}
                      href={att.url}
                      className="flex items-center gap-2 text-body text-fg-link hover:underline"
                    >
                      {att.type === 'image' ? (
                        <ImageIcon size={16} className="text-fg-secondary shrink-0" />
                      ) : (
                        <FileText size={16} className="text-fg-secondary shrink-0" />
                      )}
                      <span className="truncate">{att.name}</span>
                      <span className="text-caption text-fg-placeholder shrink-0">
                        {att.size}
                      </span>
                    </a>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Divider */}
          <div className="w-px bg-divider shrink-0" />

          {/* Right — approval route */}
          <div className="flex-[1.5] min-w-0 px-5 py-5 overflow-y-auto">
            <p className="text-caption text-fg-secondary mb-4">簽核流程</p>
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
          </div>
        </DialogBody>

        {mode === 'approve' && record.status === 'pending' && (
          <DialogFooter>
            <Button variant="outline" color="danger" onClick={onClose}>
              退件
            </Button>
            <Button variant="primary" onClick={onClose}>
              核准
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
