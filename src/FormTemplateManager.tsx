// 申請單「表單」管理 — 暫時入口(Header ⋯ 選單)。
// 列出我設計的申請單表單 + 上架狀態。實際表單設計未來由下游系統負責,
// 此處「新建表單」先 stub;整個元件屬暫時性,之後交棒即可整包移除。
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  Button,
  Tag,
} from '@qijenchen/design-system'
import { Plus } from 'lucide-react'

type FormStatus = 'published' | 'draft' | 'unpublished'

interface FormTemplate {
  id: string
  name: string
  category: string
  status: FormStatus
  updatedAt: string
}

const STATUS_META: Record<FormStatus, { label: string; color: 'green' | 'neutral' | 'red'; solid?: boolean }> = {
  published: { label: '已上架', color: 'green', solid: true },
  draft: { label: '草稿', color: 'neutral' },
  unpublished: { label: '已下架', color: 'red' },
}

// 暫時 mock — 之後由下游系統提供
const MOCK_FORMS: FormTemplate[] = [
  { id: 'F-001', name: '出差申請單', category: '出差申請', status: 'published', updatedAt: '2026/06/01' },
  { id: 'F-002', name: '費用報銷單（加班誤餐費）', category: '費用報銷', status: 'published', updatedAt: '2026/05/20' },
  { id: 'F-003', name: '設備借用申請單', category: '電腦採購申請', status: 'draft', updatedAt: '2026/06/18' },
  { id: 'F-004', name: '教育訓練報名單', category: '教育訓練', status: 'unpublished', updatedAt: '2026/04/10' },
  { id: 'F-005', name: '專案請款單', category: '費用報銷', status: 'draft', updatedAt: '2026/06/20' },
]

interface FormTemplateManagerProps {
  open: boolean
  onClose: () => void
  onCreate: () => void
}

export function FormTemplateManager({ open, onClose, onCreate }: FormTemplateManagerProps) {
  const thCls = 'text-left px-4 py-2.5 text-caption text-fg-secondary font-medium whitespace-nowrap'
  const tdCls = 'px-4 py-3 align-middle'

  return (
    <Dialog open={open} onOpenChange={(o: boolean) => !o && onClose()}>
      <DialogContent maxWidth="760px" onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span>申請單表單</span>
            <Button variant="secondary" size="sm" startIcon={Plus} onClick={onCreate} className="ml-auto mr-2">
              新建表單
            </Button>
          </DialogTitle>
        </DialogHeader>
        <DialogBody>
          <div className="rounded-lg border border-divider overflow-hidden">
            <table className="w-full text-body">
              <thead>
                <tr className="border-b border-divider bg-muted">
                  <th className={thCls}>表單名稱</th>
                  <th className={thCls}>類別</th>
                  <th className={thCls}>上架狀態</th>
                  <th className={thCls}>更新時間</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_FORMS.map((f) => {
                  const s = STATUS_META[f.status]
                  return (
                    <tr key={f.id} className="border-b border-divider last:border-0">
                      <td className={`${tdCls} font-medium`}>{f.name}</td>
                      <td className={`${tdCls} text-fg-secondary whitespace-nowrap`}>{f.category}</td>
                      <td className={tdCls}>
                        <Tag size="sm" color={s.color} solid={s.solid}>{s.label}</Tag>
                      </td>
                      <td className={`${tdCls} text-caption text-fg-secondary whitespace-nowrap`}>{f.updatedAt}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-caption text-fg-placeholder">
            表單設計未來由下游系統處理,此處為暫時入口。
          </p>
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}
