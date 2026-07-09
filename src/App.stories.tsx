import type { Meta, StoryObj } from '@storybook/react'
import App from './App'
import { ApprovalCenterMobile } from './ApprovalCenterMobileV2'

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

export const Mobile: Story = {
  name: 'Mobile',
  parameters: {
    viewport: {
      viewports: {
        iphone15: { name: 'iPhone 15', styles: { width: '393px', height: '852px' } },
      },
      defaultViewport: 'iphone15',
    },
  },
  render: () => (
    <div className="w-full h-screen">
      <ApprovalCenterMobile selectAllPlacement="header" searchPlacement="subfilter" />
    </div>
  ),
}
