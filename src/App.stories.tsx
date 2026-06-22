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

export const MobileV1SearchDown: Story = {
  name: 'Mobile V1 — Header 全選（Search 下放）',
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="w-full h-screen">
      <ApprovalCenterMobile selectAllPlacement="header" searchPlacement="subfilter" />
    </div>
  ),
}

export const MobileV2SearchDown: Story = {
  name: 'Mobile V2 — Sub-toolbar 全選（Search 下放）',
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="w-full h-screen">
      <ApprovalCenterMobile selectAllPlacement="subbar" searchPlacement="subfilter" />
    </div>
  ),
}

export const MobileV1SearchTop: Story = {
  name: 'Mobile V1 — Header 全選（Search 在上）',
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="w-full h-screen">
      <ApprovalCenterMobile selectAllPlacement="header" searchPlacement="header" />
    </div>
  ),
}

export const MobileV2SearchTop: Story = {
  name: 'Mobile V2 — Sub-toolbar 全選（Search 在上）',
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="w-full h-screen">
      <ApprovalCenterMobile selectAllPlacement="subbar" searchPlacement="header" />
    </div>
  ),
}
