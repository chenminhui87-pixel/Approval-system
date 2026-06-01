import type { Preview } from '@storybook/react'
import sharedPreview from '@qijenchen/storybook-config'
import { TooltipProvider } from '@qijenchen/design-system'
import '../src/globals.css'
import React from 'react'

// 套用 DS shared preview parameters + decorators(globals.css 載入 DS tokens + base)。
const preview: Preview = {
  ...sharedPreview,
  decorators: [
    ...(sharedPreview.decorators ?? []),
    (Story) => (
      <TooltipProvider delayDuration={500} skipDelayDuration={300}>
        <Story />
      </TooltipProvider>
    ),
  ],
}

export default preview
