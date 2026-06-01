import type { StorybookConfig } from '@storybook/react-vite'

// Consumer 套用 DS shared addons preset(含 essentials + a11y + docs + links + ds-devmode)
const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx|js|jsx|mdx)'],
  addons: ['@qijenchen/storybook-config/preset'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
}

export default config
