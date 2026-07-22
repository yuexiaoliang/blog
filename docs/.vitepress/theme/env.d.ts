/// <reference types="vitepress/client" />

declare module '@localSearchIndex' {
  const src: Record<string, () => Promise<{ default: string }>>
  export default src
}
