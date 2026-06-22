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

export const Default: Story = {}

function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center w-full min-h-screen bg-gray-900 p-8">
      <div
        className="relative rounded-[2.5rem] overflow-hidden border-[6px] border-gray-700 shadow-2xl"
        style={{ width: 390, height: 844 }}
      >
        {children}
      </div>
    </div>
  )
}

export const MobileApp: Story = {
  name: 'Approval Center Mobile — V1 Header 全選',
  parameters: {
    layout: 'fullscreen',
  },
  render: () => (
    <PhoneFrame>
      <ApprovalCenterMobile />
    </PhoneFrame>
  ),
}

export const MobileAppV2: Story = {
  name: 'Approval Center Mobile — V2 Gmail-style 全選',
  parameters: {
    layout: 'fullscreen',
  },
  render: () => (
    <PhoneFrame>
      <ApprovalCenterMobile selectAllPlacement="subbar" />
    </PhoneFrame>
  ),
}

export const MobileAppV1Bare: Story = {
  name: 'Mobile V1 裸版（手機直接開）',
  parameters: {
    layout: 'fullscreen',
  },
  render: () => (
    <div className="w-full h-screen">
      <ApprovalCenterMobile />
    </div>
  ),
}

export const MobileAppV2Bare: Story = {
  name: 'Mobile V2 裸版（手機直接開）',
  parameters: {
    layout: 'fullscreen',
  },
  render: () => (
    <div className="w-full h-screen">
      <ApprovalCenterMobile selectAllPlacement="subbar" />
    </div>
  ),
}

export const MobileSelectAllComparison: Story = {
  name: 'Select All — V1 vs V2 對照',
  parameters: {
    layout: 'fullscreen',
  },
  render: () => (
    <div className="flex items-start justify-center gap-10 w-full min-h-screen bg-gray-900 p-10">
      <div className="flex flex-col items-center gap-4">
        <p className="text-white text-sm font-medium tracking-wide">V1 — Header 全選</p>
        <div
          className="relative rounded-[2.5rem] overflow-hidden border-[6px] border-gray-700 shadow-2xl"
          style={{ width: 390, height: 844 }}
        >
          <ApprovalCenterMobile />
        </div>
      </div>
      <div className="flex flex-col items-center gap-4">
        <p className="text-white text-sm font-medium tracking-wide">V2 — Sub-toolbar 全選（Gmail 風格）</p>
        <div
          className="relative rounded-[2.5rem] overflow-hidden border-[6px] border-gray-700 shadow-2xl"
          style={{ width: 390, height: 844 }}
        >
          <ApprovalCenterMobile selectAllPlacement="subbar" />
        </div>
      </div>
    </div>
  ),
}
