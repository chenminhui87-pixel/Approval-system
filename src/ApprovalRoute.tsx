// 進階簽核流程元件 — 在 DS 元件之上做組合擴展，不修改 DS source。
// 消費的 DS 元件:Avatar / Tag / Button(asChild)。
// 自繪部分:左側 step indicator + connector line(對齊 DS Steps 視覺 token,
// 用 var(--color-blue-6) 為 active、var(--color-neutral-6) 為 upcoming),
// 因為 DS Steps 不支援「每 step 內含多 person row + 收折」這種 layout family,
// 屬於 product-specific composition,不適合反推進 DS canonical。

import { useState } from 'react'
import { Avatar } from '@qijenchen/design-system'
import {
  Check,
  Clock,
  ChevronDown,
  ChevronRight,
  Users,
  User,
  Info,
  X,
} from 'lucide-react'
import type { ApprovalStep, ApprovalPerson } from './data'

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

// ── Person row ───────────────────────────────────────────────────────────────
function PersonRow({ person }: { person: ApprovalPerson }) {
  const [expanded, setExpanded] = useState(false)
  const meta = PERSON_STATUS_TAG[person.status]
  const StatusIcon = meta.icon
  const hasComment = !!person.comment

  return (
    <div className="flex gap-3 py-2">
      <Avatar alt={person.name} size={24} color={person.avatarColor ?? 'neutral'} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-body font-medium">{person.name}</span>
        </div>
        <div className="flex items-center gap-1.5 text-caption text-fg-secondary mb-1">
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
          <>
            <p
              className={
                'text-body text-fg-secondary' +
                (expanded ? '' : ' line-clamp-2')
              }
            >
              {person.comment}
            </p>
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="text-caption hover:underline mt-0.5"
              style={{ color: 'var(--color-neutral-7)' }}
            >
              {expanded ? '收合' : '查看全部'}
            </button>
          </>
        )}
      </div>
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

  return (
    <li className="relative flex gap-3">
      {/* Left rail: chevron slot (always reserved) + dot column (dot + connector,
          both centered to dot's X so single 和 multi step 的 dot/line 都在同一條垂直線)。 */}
      <div className="flex gap-1 shrink-0">
        {/* Chevron slot — 固定 14px 寬 reservation,單人 step 留白 padding */}
        <div className="w-[14px] shrink-0 flex items-start pt-1">
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
        {/* Dot + connector column — items-center 對齊 dot 中軸,line 自動跟著 */}
        <div className="flex flex-col items-center pt-1">
          <StepDot state={step.status} />
          {!isLast && (
            <div
              className="w-px flex-1 mt-1"
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
            (isMulti ? ' cursor-pointer' : ' cursor-default')
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

        {/* Body */}
        {(!isMulti || open) && (
          <div
            className={
              'mt-2 rounded-md' +
              (step.status === 'current' && isMulti
                ? ' p-3 bg-muted'
                : '')
            }
          >
            {mode === 'parallel-any' && (
              <div className="flex items-center gap-1.5 mb-2 text-caption text-fg-link">
                <Info size={14} />
                <span>任一人簽核即通過</span>
              </div>
            )}
            <div className="divide-y divide-divider">
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
