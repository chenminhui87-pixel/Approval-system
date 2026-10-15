// 共用人員頭像 — App.tsx(申請人/代理人欄)、ApprovalRoute.tsx(簽核流程人員列)都消費同一份,
// 不要各自重寫:色底圓 + 白色人形 silhouette(data-uri SVG,不用中文姓名字首當 fallback),
// hover 顯示 DS ProfileCard(完整欄位,非 placeholder)。
import { Avatar, ProfileCard } from '@qijenchen/design-system'
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
