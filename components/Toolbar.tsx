import * as Popover from "@radix-ui/react-popover";

type ToolbarProps = {
  onSearchChange: (v: string) => void;
  onNew: () => void;

  sort: "asc" | "desc" | null;
  setSort: (dir: "asc" | "desc" | null) => void;

  filterText: string;
  setFilterText: (v: string) => void;
};

export default function Toolbar({ onSearchChange, onNew,  sort, setSort, filterText, setFilterText,}: ToolbarProps) {

  return (
    <div className="flex items-center justify-between px-4 py-1.5 border-b border-[#2a2a2a] bg-[#191919]">
      {/* Left: view selector pills */}
      <div className="flex items-center gap-2 text-sm">
        <button className="inline-flex items-center gap-2 px-2 py-1 rounded-md text-[#cfcfcf] hover:bg-[#242424] cursor-pointer">
          <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#9b9b9b]" fill="none" stroke="currentColor" strokeWidth="1.6">
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <path d="M3 9h18M8 4v16M16 4v16" />
          </svg>
          <span>Table</span>
        </button>
        <button className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#2a2a2a] bg-[#1f1f1f] text-[#e6e6e6] hover:bg-[#242424] cursor-pointer">
          Table
        </button>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-1.5">
        {/* Filter (visual-only for now) */}
                  <Popover.Root>
            <Popover.Trigger asChild>
              <button className="h-8 w-8 rounded-md hover:bg-[#242424] active:bg-[#2b2b2b] flex items-center justify-center text-[#bdbdbd]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M4 5h16M7 12h10M10 19h4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </Popover.Trigger>

            <Popover.Portal>
              <Popover.Content
                sideOffset={8}
                className="w-64 rounded-md border border-[#2a2a2a] bg-[#1a1a1a] p-3 shadow-lg"
              >
                <div className="text-xs text-[#9b9b9b] mb-2">Filter</div>
                <div className="text-sm text-[#cfcfcf] mb-2">Name contains</div>

                <input
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  placeholder="Type to filter..."
                  className="w-full h-8 px-2 rounded-md bg-[#111] border border-[#2a2a2a] text-sm text-[#e6e6e6] placeholder:text-[#7d7d7d] focus:outline-none focus:ring-2 focus:ring-[#3a3a3a]"
                />

                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => setFilterText("")}
                    className="h-8 px-2 rounded-md bg-[#242424] hover:bg-[#2b2b2b] text-sm text-[#e6e6e6]"
                  >
                    Clear
                  </button>
                </div>
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>


        {/* Sort A->Z */}
        <Popover.Root>
          <Popover.Trigger asChild>
            <button className="h-8 w-8 rounded-md hover:bg-[#242424] active:bg-[#2b2b2b] flex items-center justify-center text-[#bdbdbd]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M8 6h10M8 12h7M8 18h4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </Popover.Trigger>

          <Popover.Portal>
            <Popover.Content
              sideOffset={8}
              className="w-56 rounded-md border border-[#2a2a2a] bg-[#1a1a1a] p-3 shadow-lg"
            >
              <div className="text-xs text-[#9b9b9b] mb-2">Sort</div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setSort("asc")}
                  className={`h-8 px-2 rounded-md text-left text-sm ${
                    sort === "asc" ? "bg-[#242424]" : "bg-transparent hover:bg-[#242424]"
                  } text-[#e6e6e6]`}
                >
                  Name A {"->"} Z
                </button>

                <button
                  onClick={() => setSort("desc")}
                  className={`h-8 px-2 rounded-md text-left text-sm ${
                    sort === "desc" ? "bg-[#242424]" : "bg-transparent hover:bg-[#242424]"
                  } text-[#e6e6e6]`}
                >
                  Name Z {"->"} A
                </button>

                <button
                  onClick={() => setSort(null)}
                  className="h-8 px-2 rounded-md text-left text-sm bg-transparent hover:bg-[#242424] text-[#e6e6e6]"
                >
                  Clear sort
                </button>
              </div>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>


        {/* Lightning (visual-only) */}
        <button className="h-8 w-8 rounded-md hover:bg-[#242424] active:bg-[#2b2b2b] flex items-center justify-center text-[#bdbdbd]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M13 2L3 14h7l-1 8 12-14h-8l0-6z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Search */}
        <div className="relative">
          <div className="absolute left-2 top-1/2 -translate-y-1/2 text-[#9b9b9b]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path
                d="M21 21l-4.3-4.3m1.3-5.2a7 7 0 11-14 0 7 7 0 0114 0z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <input
            placeholder="Search"
            className="h-8 w-44 pl-7 pr-2 rounded-md bg-[#1f1f1f] border border-[#2a2a2a] text-sm text-[#e6e6e6] placeholder:text-[#7d7d7d] focus:outline-none focus:ring-2 focus:ring-[#3a3a3a]"
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        {/* New */}
        <button
          onClick={onNew}
          className="h-8 px-3 rounded-md bg-[#2b6de8] hover:bg-[#2f76ff] active:bg-[#245fd0] text-white text-sm font-medium"
        >
          New
        </button>
      </div>
    </div>
  );
}

