# Notion Table Replica

## Reference UI chosen
Notion Database Table View (dark). Focused on the compact toolbar, column header treatment, and row hover/selection affordances.

## Scope replicated
Toolbar + table header + row interactions (selection state, inline edits, column controls, and contextual actions).

## Features implemented
selection (incl. indeterminate), hover OPEN, inline rename, sort, filter, add property, drag reorder (if kept), comments (if kept), persistence (localStorage).  
Also includes column-specific menus (move/duplicate/delete), row-level comment threads, and a drag handle for reordering.

## Run locally
```bash
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.

## Libraries/tools used
Next.js (App Router), TypeScript, Tailwind CSS, Radix Popover, AI tool (OpenAI Codex).

## Workflow Efficiency Report (short)
Component-first decomposition (Toolbar, header, rows, cells, popovers) to isolate behavior and styling changes so complex interactions could be tuned without cross-impact.  
State-driven UI for selection, sorting, filtering, column management, and comments to avoid DOM workarounds and keep interactions predictable.  
Layout iteration followed a quick feedback loop: adjust Tailwind tokens, verify spacing/hover states in-app, then refine until the Notion-like density and alignment matched.  
Column/menu behaviors were built as small, composable handlers, which reduced rework when adding move/duplicate/delete and selection-based actions.  
AI-assisted refactors were used to tighten memoization, drag-and-drop handling, and an inline documentation/comment pass without altering visual output.
