// 右側詳情面板外殼 — 自組 header(放大 + 關閉),補 AppShellAside 無法在 header
// 放自訂按鈕的限制。用 useAppShell 保留桌機 inline / 手機 Sheet 的響應行為。
import type { ReactNode } from 'react'
import {
  useAppShell,
  ChromeHeader,
  Button,
  Sheet,
  SheetContent,
  SheetTitle,
} from '@qijenchen/design-system'
import { X, Maximize2 } from 'lucide-react'

interface DetailAsideProps {
  title: string
  /** 展開為完整 modal 大視圖 */
  onExpand?: () => void
  children: ReactNode
}

export function DetailAside({ title, onExpand, children }: DetailAsideProps) {
  // DS beta.148 破壞性變更:isMobile(768 斷點)退場,改讀 display.right
  // ('side-by-side' | 'overlay' | 'hidden' | 'closed')——以實際可用寬度判斷,非固定斷點。
  const { asideOpen, setAsideOpen, display } = useAppShell()
  const isOverlay = display.right === 'overlay'

  const headerActions = (
    <>
      {onExpand && (
        <Button
          variant="text"
          size="sm"
          iconOnly
          startIcon={Maximize2}
          aria-label="展開為完整視圖"
          onClick={onExpand}
        />
      )}
      <Button
        size="sm"
        iconOnly
        dismiss
        startIcon={X}
        aria-label="關閉"
        onClick={() => setAsideOpen(false)}
      />
    </>
  )

  if (isOverlay) {
    return (
      <Sheet open={asideOpen} onOpenChange={setAsideOpen}>
        <SheetContent side="right" className="w-[min(90vw,420px)] flex flex-col p-0 [&>button]:hidden">
          <ChromeHeader>
            <SheetTitle className="text-body-lg font-medium flex-1 truncate">{title}</SheetTitle>
            {headerActions}
          </ChromeHeader>
          <div className="flex-1 min-h-0">{children}</div>
        </SheetContent>
      </Sheet>
    )
  }

  if (!asideOpen) return null
  return (
    <aside
      aria-label={title}
      className="flex flex-col h-full w-[380px] xl:w-[420px] shrink-0 border-l border-divider bg-surface"
    >
      <ChromeHeader>
        <h2 className="text-body-lg font-medium flex-1 truncate">{title}</h2>
        {headerActions}
      </ChromeHeader>
      <div className="flex-1 min-h-0">{children}</div>
    </aside>
  )
}
