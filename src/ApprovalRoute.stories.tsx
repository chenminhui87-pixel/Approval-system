import type { Meta, StoryObj } from '@storybook/react'
import { ApprovalRoute } from './ApprovalRoute'
import { MOCK_RECORDS } from './data'

const meta: Meta<typeof ApprovalRoute> = {
  title: 'Components / ApprovalRoute',
  component: ApprovalRoute,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          '進階簽核流程元件 — 區分單簽 / 平簽（任一即過）/ 並簽（全員必簽）。多人 step 可收折，current step 灰底框 highlight，含頭像 / 留言 / 查看全部展開。',
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 360, padding: 24, background: 'white' }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof ApprovalRoute>

// 第一筆有完整 rich data,展示三種模式 + 留言互動
const richRecord = MOCK_RECORDS.find((r) => r.id === 'REQ-2026-0001')!

export const Default: Story = {
  args: {
    steps: richRecord.steps,
  },
}

export const SingleStepOnly: Story = {
  args: {
    steps: richRecord.steps.filter((s) => s.mode === 'single' || !s.mode),
  },
}

export const MultiStepCollapsed: Story = {
  args: {
    steps: richRecord.steps,
    defaultExpanded: [],
  },
}
