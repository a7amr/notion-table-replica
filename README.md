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
Used component-first scaffolding + Tailwind token extraction + iterative UI tweaks, verifying layout changes with quick in-app checks.  
AI-assisted refactors for memoization, drag-and-drop handling, and inline documentation/comment pass.
