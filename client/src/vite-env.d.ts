/// <reference types="vite/client" />

declare module '*.geojson?url' {
  const value: string
  export default value
}
