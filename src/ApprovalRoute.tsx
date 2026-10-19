// 進階簽核流程元件 — 在 DS 元件之上做組合擴展，不修改 DS source。
// 消費的 DS 元件:Avatar / Tag / Button(asChild)。
// 自繪部分:左側 step indicator + connector line(對齊 DS Steps 視覺 token,
// 用 var(--color-blue-6) 為 active、var(--color-neutral-6) 為 upcoming),
// 因為 DS Steps 不支援「每 step 內含多 person row + 收折」這種 layout family,
// 屬於 product-specific composition,不適合反推進 DS canonical。

import { useState } from 'react'
import { PersonAvatar } from './PersonAvatar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogClose,
  Button,
} from '@qijenchen/design-system'
import {
  Check,
  Clock,
  ChevronDown,
  ChevronRight,
  Users,
  User,
  Info,
  X,
  Forward,
  UserPlus,
} from 'lucide-react'
import type { ApprovalStep, ApprovalPerson, PersonHistoryEntry, PersonHistoryAction } from './data'

interface ApprovalRouteProps {
  steps: ApprovalStep[]
  /** 預設展開的 step id 陣列;不傳則 current step 自動展開 */
  defaultExpanded?: string[]
}

const PERSON_STATUS_TAG = {
  signed: { color: 'green' as const, label: '已簽', icon: Check },
  pending: { color: 'neutral' as const, label: '待簽', icon: Clock },
  rejected: { color: 'red' as const, label: '退件', icon: X },
}

const HISTORY_ACTION_META: Record<PersonHistoryAction, { label: string; icon: typeof Forward }> = {
  forward: { label: '轉寄', icon: Forward },
  addApprover: { label: '加簽', icon: UserPlus },
}

// ── 轉寄 / 加簽歷程 timeline ─────────────────────────────────────────────────
// 跟 ApprovalRoute 主視覺一致的 dot + connector 樣式,但歷程項目沒有 StepDot 的
// 多狀態(completed/current/upcoming)語意 —— 每筆都是已發生的事件,所以用單一
// 實心點,不重用 StepDot(那個元件的狀態機跟這裡的語意不同,硬套會混淆)。
function HistoryTimeline({ entries }: { entries: PersonHistoryEntry[] }) {
  return (
    <ol className="list-none m-0 p-0">
      {entries.map((entry, idx) => {
        const isLast = idx === entries.length - 1
        const { label, icon: ActionIcon } = HISTORY_ACTION_META[entry.action]
        return (
          <li key={idx} className="relative flex gap-3">
            <div className="flex flex-col items-center pt-1.5 shrink-0">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: 'var(--color-neutral-6)' }} />
              {!isLast && (
                <div className="w-px flex-1 mt-1 mb-1" style={{ background: 'var(--color-neutral-4)' }} />
              )}
            </div>
            <div className="flex-1 min-w-0 pb-3">
              <div className="flex items-center gap-1.5 text-body font-medium">
                <ActionIcon size={14} className="text-fg-secondary shrink-0" />
                <span>{label}</span>
              </div>
              <p className="text-caption text-fg-secondary mt-0.5">
                {entry.by} → {entry.target} · {entry.at}
              </p>
              {entry.comment && (
                <p className="text-body text-fg-secondary mt-1">{entry.comment}</p>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}

// ── Person row ───────────────────────────────────────────────────────────────
function PersonRow({ person }: { person: ApprovalPerson }) {
  const [modalOpen, setModalOpen] = useState(false)
  const meta = PERSON_STATUS_TAG[person.status]
  const StatusIcon = meta.icon
  const hasComment = !!person.comment
  const hasHistory = !!person.history?.length

  return (
    <div className="flex flex-col gap-1 py-2">
      <div className="flex items-center gap-2">
        <PersonAvatar name={person.name} size={20} />
        <span className="text-body font-medium">{person.name}</span>
      </div>
      <div className="flex items-center gap-1.5 text-caption text-fg-secondary">
        <StatusIcon
          size={14}
          className={
            person.status === 'signed'
              ? 'text-fg-success'
              : person.status === 'rejected'
                ? 'text-fg-danger'
                : 'text-fg-placeholder'
          }
        />
        <span className={person.status === 'signed' ? 'text-fg-success' : ''}>
          {meta.label}
        </span>
        {person.signedAt && (
          <span className="text-fg-placeholder">{person.signedAt}</span>
        )}
      </div>
      {hasComment && (
        <p className="text-body text-fg-secondary line-clamp-2">{person.comment}</p>
      )}
      {/* 「查看全部」改開 modal(不再原地展開截斷文字)—— modal 裡除了完整意見,
          還要能看到這個人在本站的轉寄/加簽歷程,原地展開放不下這段內容。
          沒有 comment 但有歷程時仍要給入口,文案改「查看歷程」。 */}
      {(hasComment || hasHistory) && (
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="text-caption hover:underline self-start text-left"
          style={{ color: 'var(--color-neutral-7)' }}
        >
          {hasComment ? '查看全部' : '查看歷程'}
        </button>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent height="hug" maxWidth={480}>
          <DialogHeader>
            <DialogTitle>{person.name}</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <div className="flex flex-col gap-4">
              {hasComment && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-caption text-fg-placeholder">簽核意見</span>
                  <p className="text-body text-fg-secondary whitespace-pre-wrap">{person.comment}</p>
                </div>
              )}
              {hasHistory && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-caption text-fg-placeholder">轉寄 / 加簽歷程</span>
                  <HistoryTimeline entries={person.history!} />
                </div>
              )}
            </div>
          </DialogBody>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="tertiary">關閉</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ── Step indicator dot ───────────────────────────────────────────────────────
function StepDot({ state }: { state: ApprovalStep['status'] }) {
  if (state === 'completed') {
    return (
      <div
        className="w-3 h-3 rounded-full"
        style={{ background: 'var(--color-blue-6)' }}
      />
    )
  }
  if (state === 'current') {
    return (
      <div
        className="w-3 h-3 rounded-full border-2"
        style={{ borderColor: 'var(--color-blue-6)', background: 'var(--surface-raised)' }}
      />
    )
  }
  if (state === 'error') {
    return (
      <div
        className="w-3 h-3 rounded-full flex items-center justify-center"
        style={{ background: 'var(--error-hover)' }}
      >
        <X size={8} className="text-on-emphasis" strokeWidth={3} />
      </div>
    )
  }
  // upcoming
  return (
    <div
      className="w-3 h-3 rounded-full border-2"
      style={{ borderColor: 'var(--color-neutral-6)', background: 'var(--surface-raised)' }}
    />
  )
}

// ── One step ────────────────────────────────────────────────────────────────
interface StepNodeProps {
  step: ApprovalStep
  isLast: boolean
  defaultOpen: boolean
}

function StepNode({ step, isLast, defaultOpen }: StepNodeProps) {
  const mode = step.mode ?? 'single'
  const people = step.people ?? []
  const isMulti = mode !== 'single'
  const [open, setOpen] = useState(defaultOpen)

  const signedCount = people.filter((p) => p.status === 'signed').length
  const totalCount = people.length
  const requiredForPass = mode === 'parallel-any' ? 1 : totalCount

  const HeaderChevron = open ? ChevronDown : ChevronRight

  // 灰底收折區段:multi + 展開時,整列(圓點/連接線 + 箭頭 + header + body)都要在
  // 灰底範圍內,不是只有右側內容。灰底掛在 <li> 本身;用 -mx-3/px-3 抵銷橫向位移,
  // 讓 dot 的 x 座標不因為展不展開而跑動(跟上下 collapsed 節點的連接線才會對齊)。
  const sectionOpen = isMulti && open

  return (
    <li className="relative flex gap-3">
      {/* 灰底用絕對定位背景層,不直接掛在 <li> 本身 —— li 的完整高度含連接線
          要延伸的尾段留白(給下一站點),若背景跟著 li 全高走,留白會被灰底蓋滿,
          看起來灰底貼到下一站。bottom-4 讓灰底提早收尾,尾段露出真正的留白。 */}
      {/* token 選用:DS Static Subtle 只有 muted(neutral-2,4%)/ secondary
          (neutral-3,6%)兩階,中間沒有第三階。語意上 secondary 才對(這裡的
          人員列表可操作,不是 muted 定義的「不可操作/placeholder」),但這塊
          面積大,6% 視覺份量感偏重,user 實測比較後選 muted(4%)———明知語意
          略寬鬆,視覺優先,保留在此記錄取捨,不要之後又改回 secondary。 */}
      {/* pointer-events-none 必加:這層拿掉 -z-10 後變成單純 position:absolute
          (z-index:auto),CSS 繪製順序會疊在 static 的內容 sibling 之上(即使
          4% 透明度視覺上看不出來),沒加會整個擋住底下 chevron/header 的點擊,
          展開後點不到收合按鈕(2026-10-15 user 回報抓到的 regression)。 */}
      {sectionOpen && (
        <div className="absolute -left-2 -right-2 top-0 bottom-4 rounded-md bg-muted pointer-events-none" aria-hidden="true" />
      )}
      {/* Left rail:箭頭回到原本位置(dot 左側)+ dot + connector。
          pt 要跟右側 header 的 pt 同步,不然灰底頂邊貼著 dot(dot 自己的 pt-1
          比 header 淺,灰底框頂邊幾乎撞到 dot)。dot 比 header 多 pt-1(4px)是
          刻意的 —— dot/文字兩者視覺中心本來就有這個差,不能設一樣的 pt。 */}
      <div className="flex gap-1 shrink-0">
        {/* Chevron slot — 固定 14px 寬 reservation,單人 step 留白 padding */}
        <div className={'w-[14px] shrink-0 flex items-start' + (sectionOpen ? ' pt-3' : ' pt-1')}>
          {isMulti && (
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? '收合' : '展開'}
              className="text-fg-secondary hover:text-foreground"
            >
              <HeaderChevron size={14} />
            </button>
          )}
        </div>
        {/* Dot + connector column */}
        <div className={'flex flex-col items-center' + (sectionOpen ? ' pt-3' : ' pt-1')}>
          <StepDot state={step.status} />
          {!isLast && (
            <div
              className={'w-px flex-1 mt-1' + (sectionOpen ? ' mb-6' : ' mb-2')}
              style={{
                background:
                  step.status === 'completed'
                    ? 'var(--color-blue-6)'
                    : 'var(--color-neutral-4)',
              }}
            />
          )}
        </div>
      </div>

      {/* Right side: header + body */}
      <div className="flex-1 min-w-0 pb-6">
        {/* Header row */}
        <button
          type="button"
          onClick={() => isMulti && setOpen((v) => !v)}
          className={
            'flex items-center gap-2 w-full text-left' +
            (isMulti ? ' cursor-pointer' : ' cursor-default') +
            (sectionOpen ? ' pt-2' : '')
          }
        >
          <span className="text-body font-medium">{step.label}</span>
          {isMulti && (
            <>
              {mode === 'parallel-all' ? (
                <Users size={14} className="text-fg-secondary" />
              ) : (
                <User size={14} className="text-fg-secondary" />
              )}
              <span className="text-caption text-fg-secondary">
                ({signedCount}/{requiredForPass})
              </span>
            </>
          )}
        </button>

        {/* parallel-any 的「任一人簽核即通過」說明:收合時也要能看到規則本身是什麼
            (不是只有展開看人員列表才知道),所以放在收折開關之外、header 下方固定顯示,
            不跟著 body 一起收合。 */}
        {mode === 'parallel-any' && (
          <div className={'flex items-center gap-1.5 text-caption text-fg-link' + (sectionOpen ? ' mt-1' : ' mt-0.5')}>
            <Info size={14} />
            <span>任一人簽核即通過</span>
          </div>
        )}

        {/* Body */}
        {(!isMulti || open) && (
          <div className={isMulti ? 'pt-3 pb-4' : 'mt-2'}>
            <div>
              {people.length === 0 ? (
                <p className="text-body text-fg-placeholder py-1">未指派</p>
              ) : (
                people.map((p, idx) => <PersonRow key={p.name + idx} person={p} />)
              )}
            </div>
          </div>
        )}
      </div>
    </li>
  )
}

// ── Root ─────────────────────────────────────────────────────────────────────
export function ApprovalRoute({ steps, defaultExpanded }: ApprovalRouteProps) {
  const defaultSet = new Set(
    defaultExpanded ?? steps.filter((s) => s.status === 'current').map((s) => s.id)
  )

  return (
    <ol className="list-none m-0 p-0">
      {steps.map((step, idx) => (
        <StepNode
          key={step.id}
          step={step}
          isLast={idx === steps.length - 1}
          defaultOpen={defaultSet.has(step.id)}
        />
      ))}
    </ol>
  )
}
