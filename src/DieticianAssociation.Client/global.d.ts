// Global style module declarations so TypeScript accepts side-effect CSS imports
// Fixes TS2882 for `import "./globals.css"` in `app/layout.tsx`.
// Next.js actually handles CSS; we just need ambient module declarations.

declare module "*.css" {
  const classes: { readonly [key: string]: string }
  export default classes
}

declare module "*.scss" {
  const classes: { readonly [key: string]: string }
  export default classes
}
