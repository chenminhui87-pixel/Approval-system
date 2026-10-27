// 共用人員頭像 — App.tsx(申請人/代理人欄)、ApprovalRoute.tsx(簽核流程人員列)、
// FormSubmissionsView.tsx(當前簽核者欄)都消費同一份,不要各自重寫:色底圓 + 白色
// 人形 silhouette(data-uri SVG,不用中文姓名字首當 fallback),hover 顯示 DS
// ProfileCard(完整欄位,非 placeholder)。
import { Avatar, ProfileCard } from '@qijenchen/design-system'
// HoverCard 非 root front-door(DS 標 internal)。但 align=center 鎖死在 Avatar.hoverCard,
// 多人清單卡需靠左對齊 → 走 DS 官方 subpath export(非 /src、非 /dist 深層路徑,
// 符合 lint-ds-internal-imports 允許清單 + DS「internal 元件 subpath 包裝後可用」規範)。
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@qijenchen/design-system/components/HoverCard'
import { getPerson } from './data'

const AVATAR_COLORS = ['blue', 'violet', 'emerald', 'amber', 'rose', 'cyan', 'orange'] as const
export function nameToAvatarColor(name: string) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  return AVATAR_COLORS[h % AVATAR_COLORS.length]
}

const COLOR_HEX: Record<string, string> = {
  blue: '#3b82f6', violet: '#8b5cf6', emerald: '#10b981', amber: '#f59e0b',
  rose: '#f43f5e', cyan: '#06b6d4', orange: '#f97316',
}

export function personAvatarSrc(name: string): string {
  const hex = COLOR_HEX[nameToAvatarColor(name)] ?? '#64748b'
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect width="24" height="24" fill="${hex}"/><circle cx="12" cy="9" r="3.4" fill="#fff"/><path d="M12 13.1c-3.7 0-6.3 2.1-6.3 5V20h12.6v-1.9c0-2.9-2.6-5-6.3-5z" fill="#fff"/></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

function personProfileCard(name: string) {
  const p = getPerson(name)
  return (
    <ProfileCard
      name={name}
      avatar={{ src: personAvatarSrc(name), alt: name }}
      subtitle={p.title}
      defaultFieldValues={{ id: p.id, employeeNumber: p.employeeNumber }}
      fields={[
        { label: '組織課名代碼', value: p.deptCode },
        { label: '電子郵件', value: p.email },
        { label: '電話', value: p.phone },
        { label: '地點', value: p.location },
      ]}
    />
  )
}

export function PersonAvatar({ name, size = 22 }: { name: string; size?: number }) {
  return (
    <Avatar
      alt={name}
      size={size}
      src={personAvatarSrc(name)}
      hoverCard={personProfileCard(name)}
    />
  )
}

// 頭像 + 名字,名字下方補組織課名代碼／ID／電話(caption 灰字)—— 申請人欄共用寫法
// (App.tsx 主清單、FormSubmissionsView.tsx 送審清單都消費同一份,2026-10-27 user
// 拍板兩處申請人顯示要一致,不只有名字)。分隔符號跟下面 PersonListCard 一致。
export function PersonAvatarLabel({ name }: { name: string }) {
  const p = getPerson(name)
  return (
    <span className="inline-flex items-start gap-1.5 min-w-0">
      <PersonAvatar name={name} />
      <span className="flex flex-col min-w-0">
        <span className="truncate">{name}</span>
        <span className="text-caption text-fg-secondary truncate">
          {p.deptCode} ｜ {p.id} ｜ {p.phone}
        </span>
      </span>
    </span>
  )
}

// 多人清單卡(代理人 / 當前簽核者等多人欄共用)— 每人:組織課名代碼 ｜ ID ｜ 工號
function PersonListCard({ names }: { names: string[] }) {
  return (
    <div className="w-[320px] bg-surface-raised rounded-lg border border-border overflow-hidden">
      <div className="divide-y divide-divider max-h-[320px] overflow-auto">
        {names.map((name) => {
          const p = getPerson(name)
          return (
            <div key={name} className="px-4 py-3 flex items-start gap-2.5">
              <Avatar alt={name} size={28} src={personAvatarSrc(name)} />
              <div className="min-w-0 flex-1">
                <div className="text-body font-medium mb-1 truncate">{name}</div>
                <div className="text-caption text-fg-secondary">
                  {p.deptCode} ｜ {p.id} ｜ {p.employeeNumber}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// 多人頭像 overlap stack(代理人 / 當前簽核者等多人欄共用);hover 整組顯示清單卡。
// 走 DS HoverCard primitives(非 Avatar.hoverCard,後者鎖死 align=center)→
// 可用 align="start" 讓卡片靠頭像組左緣對齊。查無人員顯示 "-"。
export function PersonAvatarStack({ names }: { names?: string[] }) {
  if (!names || names.length === 0) return <span className="text-fg-placeholder">-</span>
  // 走 DS Avatar `stacked`(遮罩挖空,非寫死 ring-surface → 不會框線外溢);
  // 疊放量用 --avatar-stack-overlap。超過 MAX 顯示「+N」溢出圈。
  const MAX = 4
  const overflow = names.length > MAX
  const visible = overflow ? names.slice(0, MAX - 1) : names
  const hiddenCount = names.length - visible.length
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <span className="inline-flex items-center cursor-default">
          {visible.map((a, i) => (
            <span
              key={a + i}
              className="relative inline-flex -ml-[var(--avatar-stack-overlap)] first:ml-0"
              style={{ zIndex: names.length - i }}
            >
              <Avatar alt={a} size={22} src={personAvatarSrc(a)} stacked />
            </span>
          ))}
          {overflow && (
            <span
              className="relative inline-flex items-center justify-center -ml-[var(--avatar-stack-overlap)] rounded-full bg-muted text-fg-secondary text-caption font-medium"
              style={{ width: 22, height: 22, zIndex: 0 }}
              aria-label={`另外 ${hiddenCount} 人`}
            >
              +{hiddenCount}
            </span>
          )}
        </span>
      </HoverCardTrigger>
      <HoverCardContent align="start" className="p-0 w-auto border-0 bg-transparent shadow-none">
        <PersonListCard names={names} />
      </HoverCardContent>
    </HoverCard>
  )
}
