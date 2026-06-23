import type { Meta, StoryObj } from '@storybook/react'
import App from './App'
import { ApprovalCenterMobile } from './ApprovalCenterMobile'

const meta: Meta<typeof App> = {
  title: 'App / Approval System',
  component: App,
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof App>

export const Default: Story = {
  name: 'PC',
}

export const MobileV1SearchTop: Story = {
  name: 'Mobile — 全選在頂列 · 搜尋在頂列',
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="w-full h-screen">
      <ApprovalCenterMobile selectAllPlacement="header" searchPlacement="header" />
    </div>
  ),
}

export const MobileV2SearchTop: Story = {
  name: 'Mobile — 全選在工具列 · 搜尋在頂列',
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="w-full h-screen">
      <ApprovalCenterMobile selectAllPlacement="subbar" searchPlacement="header" />
    </div>
  ),
}

export const MobileV1SearchDown: Story = {
  name: 'Mobile — 全選在頂列 · 搜尋在篩選欄',
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="w-full h-screen">
      <ApprovalCenterMobile selectAllPlacement="header" searchPlacement="subfilter" />
    </div>
  ),
}

export const MobileV2SearchDown: Story = {
  name: 'Mobile — 全選在工具列 · 搜尋在篩選欄',
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="w-full h-screen">
      <ApprovalCenterMobile selectAllPlacement="subbar" searchPlacement="subfilter" />
    </div>
  ),
}
