# Document Preview Approach for Gibiverse

> Research for [Choose a document preview approach for the browser (#4)](https://github.com/Panda-SGH/gibiverse/issues/4)

## Summary & Recommendation

**Use `react-pdf` for PDFs, `mammoth` for DOCX, native `<img>` for images, and degrade gracefully (download-only) for PPTX in the MVP.**

| Format | MVP Approach | Rationale |
|--------|-------------|-----------|
| **PDF** | `react-pdf` (v11) | Most popular React PDF viewer (~9M weekly downloads, 11k+ GitHub stars), actively maintained, built on Mozilla pdf.js, excellent Next.js support with `'use client'` components |
| **DOCX** | `mammoth` (v1.13) | Converts DOCX → clean semantic HTML client-side (~9.5M weekly downloads), actively maintained, ~90 KB gzipped — good enough for preview |
| **PPTX** | Download-only (MVP) | No mature, widely-adopted React library exists. The available options (`@extend-ai/react-pptx`, `pptx-react-viewer`) are new/niche with minimal adoption. Defer to post-MVP |
| **Images** | Native `<img>` / `<picture>` | Trivial — Next.js `Image` component handles optimization out of the box |

### Why not Google Docs Viewer / Microsoft Office Online?

Both require **publicly accessible URLs** (no localhost, no auth-gated files), have **file size caps** (~25 MB), offer **no UI customization**, and depend on **third-party uptime with no SLA**. They also leak document URLs to Google/Microsoft servers, which is undesirable for a resource-sharing platform. These are non-starters for an MVP where files live behind auth.

### Why not `@react-pdf-viewer/core`?

The `react-pdf-viewer` project by Nguyen Huu Phuoc has been **archived** (read-only since early 2026). With ~2.6k GitHub stars versus react-pdf's ~11k, and no active maintenance, it's a dead end. Its plugin architecture was nice but isn't worth the risk.

---

## Comparison Table

| Criterion | `react-pdf` | `@react-pdf-viewer/core` | `pdfjs-dist` (raw) | Google Docs Viewer | MS Office Online | `mammoth` | `@extend-ai/react-pptx` |
|-----------|------------|-------------------------|--------------------|--------------------|-----------------|-----------|------------------------|
| **PDF support** | ✅ Excellent | ✅ Excellent | ✅ Excellent | ✅ Good (25MB cap) | ⚠️ Limited | ❌ N/A | ❌ N/A |
| **DOCX support** | ❌ N/A | ❌ N/A | ❌ N/A | ✅ Good | ✅ Excellent | ✅ Good (semantic HTML) | ❌ N/A |
| **PPTX support** | ❌ N/A | ❌ N/A | ❌ N/A | ✅ Good | ✅ Excellent | ❌ N/A | ⚠️ New/niche |
| **Bundle size (min+gz)** | ~192 KB | ~similar (pdf.js core) | ~130 KB | 0 (iframe) | 0 (iframe) | ~90 KB | Unknown |
| **Mobile support** | ✅ Good | ✅ Good | ⚠️ DIY | ⚠️ Poor (scroll issues) | ⚠️ Poor | ✅ Good (just HTML) | ⚠️ Unknown |
| **Next.js compat** | ✅ `'use client'` | ✅ `dynamic({ ssr: false })` | ⚠️ Manual setup | ✅ iframe | ✅ iframe | ✅ Works | ⚠️ Unknown |
| **Implementation complexity** | Low | Medium (plugins) | High (build viewer from scratch) | Trivial (but limited) | Trivial (but limited) | Low | Medium |
| **License** | MIT | Apache-2.0 | Apache-2.0 | N/A (service) | N/A (service) | BSD-2-Clause | MIT |
| **Maintenance** | ✅ Active (v11, React 19) | ❌ Archived (2026) | ✅ Active (Mozilla) | N/A (undocumented) | N/A (no SLA) | ✅ Active (v1.13) | ⚠️ New |
| **Weekly downloads** | ~9M | declining | ~20M+ | N/A | N/A | ~9.5M | minimal |
| **GitHub stars** | ~11k | ~2.6k (archived) | ~50k+ (pdf.js) | N/A | N/A | ~5k+ | minimal |
| **Requires public URL** | ❌ No | ❌ No | ❌ No | ✅ Yes | ✅ Yes | ❌ No | ❌ No |

---

## Detailed Findings

### 1. `react-pdf` (by wojtekmaj)

- **Source**: [npm](https://www.npmjs.com/package/react-pdf) · [GitHub](https://github.com/wojtekmaj/react-pdf)
- **What it is**: React component library for displaying PDF documents, built on Mozilla's pdf.js
- **Latest version**: v11.0.0 (supports React 19, pdf.js v6, native Suspense)
- **Weekly downloads**: ~9M
- **GitHub stars**: ~11k+
- **Bundle size**: ~192 KB min+gz (includes pdf.js core; worker loaded separately)
- **License**: MIT

**Next.js integration**:
- Must be used as a Client Component (`'use client'`)
- Worker configured via `new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url)` — works with Webpack/Turbopack
- CSS imports needed for text selection and annotation layers

**Strengths**: Massively popular, actively maintained, straightforward API (`<Document>` + `<Page>`), text selection, annotations, print support.

**Weaknesses**: Only does PDFs. Bundle includes pdf.js (~130 KB gz for the core, plus ~200 KB for the worker script loaded async). No built-in toolbar/pagination UI (you build your own, which is fine for MVP customization).

### 2. `@react-pdf-viewer/core` (by Nguyen Huu Phuoc)

- **Source**: [npm](https://www.npmjs.com/package/@react-pdf-viewer/core) · [GitHub](https://github.com/react-pdf-viewer/react-pdf-viewer)
- **Status**: **Archived / read-only since early 2026**
- **GitHub stars**: ~2.6k

**Verdict**: **Do not use.** Project is archived. No React 19 support. Plugin architecture was powerful but the project is dead. Community is migrating to `react-pdf` or forks.

### 3. `pdfjs-dist` (Mozilla pdf.js directly)

- **Source**: [npm](https://www.npmjs.com/package/pdfjs-dist) · [GitHub](https://github.com/nicolo-ribaudo/pdfjs-dist) (mirror of Mozilla's pdf.js)
- **Bundle size**: ~130 KB min+gz (core only) + worker
- **License**: Apache-2.0

**Verdict**: Overkill for MVP. `react-pdf` wraps this with a clean React API. Going raw means building your own pagination, zoom, text selection, etc. Only worth it if you need extreme customization.

### 4. Google Docs Viewer Embed

- **URL format**: `https://docs.google.com/gview?url=<PUBLIC_URL>&embedded=true`
- **Formats**: PDF, DOC, DOCX, PPTX, XLSX, and more
- **File size limit**: ~25 MB soft cap
- **Requires**: Publicly accessible URL (no auth, no localhost)

**Verdict**: **Not suitable.** Gibiverse files are behind auth. The viewer is an undocumented, unofficial utility with no SLA, no UI customization, poor mobile experience, and leaks document URLs to Google. Cannot track user interactions due to cross-origin iframe restrictions.

### 5. Microsoft Office Online Viewer

- **URL format**: `https://view.officeapps.live.com/op/embed.aspx?src=<PUBLIC_URL>`
- **Formats**: DOC, DOCX, PPT, PPTX, XLS, XLSX
- **File size limit**: 5–25 MB depending on format; 60-second download timeout
- **Requires**: Publicly accessible URL

**Verdict**: Same problems as Google Docs Viewer — requires public URLs, no SLA, no customization. **Not suitable.**

### 6. `mammoth` (mammoth.js)

- **Source**: [npm](https://www.npmjs.com/package/mammoth) · [GitHub](https://github.com/mwilliamson/mammoth)
- **What it is**: Converts DOCX files to clean semantic HTML (or Markdown) in the browser or Node.js
- **Latest version**: v1.13.0
- **Weekly downloads**: ~9.5M
- **Bundle size**: ~90 KB min+gz
- **License**: BSD-2-Clause
- **Dependencies**: jszip, underscore, xmldom, xmlbuilder

**Strengths**: Excellent semantic HTML output (headings, lists, tables, bold/italic preserved). Widely used, actively maintained. Works client-side — pass an `ArrayBuffer` and get HTML back. The output HTML can be styled with Tailwind/CSS to match the app's design system.

**Weaknesses**: Doesn't preserve exact visual layout (margins, fonts, page breaks). Complex formatting (text boxes, columns, advanced styles) degrades. This is acceptable for academic documents (notes, handouts) where content matters more than pixel-perfect layout.

### 7. PPTX Viewer Libraries

Several options exist but none are mature:

| Library | Stars | Downloads | Notes |
|---------|-------|-----------|-------|
| `@extend-ai/react-pptx` | minimal | minimal | Uses WASM, React component, very new |
| `pptx-react-viewer` | minimal | minimal | Part of `ooxml` ecosystem, TypeScript-based |
| `pptx-viewer` | minimal | minimal | Vanilla JS, includes fullscreen mode |
| `PPTXjs` | ~300 | minimal | jQuery-based, legacy |

**Verdict**: No mature, battle-tested option exists for PPTX preview in React. For MVP, **degrade to download-only** for PPTX files. Show the file name, size, and a download button. Consider adding PPTX preview post-MVP once libraries mature, or via server-side conversion (LibreOffice → PDF → react-pdf).

---

## Recommended Architecture for MVP

```
┌──────────────────────────────────────────┐
│              Resource Preview             │
│                                          │
│  ┌─ file.type ────────────────────────┐  │
│  │                                    │  │
│  │  PDF  → <PdfPreview>               │  │
│  │         uses react-pdf             │  │
│  │         'use client' component     │  │
│  │         pagination + zoom          │  │
│  │                                    │  │
│  │  DOCX → <DocxPreview>              │  │
│  │         uses mammoth               │  │
│  │         converts to HTML           │  │
│  │         renders in styled <div>    │  │
│  │                                    │  │
│  │  IMG  → <ImagePreview>             │  │
│  │         uses next/image            │  │
│  │         lightbox on click          │  │
│  │                                    │  │
│  │  PPTX → <DownloadFallback>         │  │
│  │  other  shows filename + download  │  │
│  │                                    │  │
│  └────────────────────────────────────┘  │
│                                          │
│  All previews wrapped in a               │
│  <PreviewContainer> that handles         │
│  loading states, errors, and the         │
│  download button (always available)      │
└──────────────────────────────────────────┘
```

### Component structure (apps/web)

```
components/
  resource-preview/
    preview-container.tsx    # Loading/error states, download button
    pdf-preview.tsx          # 'use client', react-pdf Document+Page
    docx-preview.tsx         # 'use client', mammoth → dangerouslySetInnerHTML
    image-preview.tsx        # next/image with lightbox
    download-fallback.tsx    # File icon + download button for unsupported types
    index.tsx                # Switch on MIME type → correct preview
```

### Dependencies to install

```bash
pnpm add react-pdf mammoth --filter @gibiverse/web
```

### Key implementation notes

1. **PDF preview** (`react-pdf`):
   - Use `'use client'` directive
   - Configure pdf.js worker with `new URL(...)` pattern
   - Import CSS for text/annotation layers
   - Build custom pagination UI with shadcn `Button`, `Badge` for page count

2. **DOCX preview** (`mammoth`):
   - Load file as `ArrayBuffer` (fetch from API)
   - Call `mammoth.convertToHtml({ arrayBuffer })` client-side
   - Render output HTML in a styled container with `prose` Tailwind class (from `@tailwindcss/typography`)
   - Sanitize HTML with DOMPurify before rendering via `dangerouslySetInnerHTML`

3. **Image preview**:
   - Use `next/image` with `fill` prop for responsive sizing
   - Add lightbox behavior (click to expand, escape to close)

4. **Download fallback**:
   - Show file icon (lucide-react), filename, file size
   - shadcn `Button` with download link
   - Used for PPTX, XLS, and any other unsupported format

### Security considerations

- **DOCX → HTML**: Sanitize mammoth's HTML output with `DOMPurify` to prevent XSS from malicious DOCX files
- **PDF**: react-pdf/pdf.js sandboxes PDF JavaScript — no additional sanitization needed
- **Images**: Standard `<img>` CSP rules apply; serve from same domain or configure `next.config.js` image domains

---

## Sources

All claims above cite their primary source inline. Key primary sources:

- react-pdf: https://github.com/wojtekmaj/react-pdf · https://www.npmjs.com/package/react-pdf
- mammoth: https://github.com/mwilliamson/mammoth · https://www.npmjs.com/package/mammoth
- pdfjs-dist: https://www.npmjs.com/package/pdfjs-dist · https://mozilla.github.io/pdf.js/
- Bundle sizes: https://bundlephobia.com/package/react-pdf · https://bundlephobia.com/package/mammoth
- @react-pdf-viewer: https://github.com/react-pdf-viewer/react-pdf-viewer (archived)
- Google Docs Viewer: undocumented; limitations sourced from Stack Overflow and community reports
- MS Office Online Viewer: https://learn.microsoft.com/en-us/microsoft-365/troubleshoot/
