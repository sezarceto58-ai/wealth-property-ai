import { useState } from "react";

interface JsonDiffViewerProps {
  before: Record<string, any> | null;
  after: Record<string, any> | null;
}

export function JsonDiffViewer({ before, after }: JsonDiffViewerProps) {
  const [expanded, setExpanded] = useState(false);
  if (!before && !after) return <span className="text-[#6b7280] text-xs">—</span>;

  return (
    <div>
      <button onClick={() => setExpanded(!expanded)} className="text-xs text-[#6366f1] hover:underline">
        {expanded ? "Hide" : "Show"} diff
      </button>
      {expanded && (
        <div className="grid grid-cols-2 gap-2 mt-2">
          <div>
            <div className="text-xs text-[#6b7280] mb-1">Before</div>
            <pre className="text-xs font-mono bg-[#0f1117] p-2 rounded text-[#ef4444]/70 overflow-auto max-h-40">{before ? JSON.stringify(before, null, 2) : "null"}</pre>
          </div>
          <div>
            <div className="text-xs text-[#6b7280] mb-1">After</div>
            <pre className="text-xs font-mono bg-[#0f1117] p-2 rounded text-[#10b981]/70 overflow-auto max-h-40">{after ? JSON.stringify(after, null, 2) : "null"}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
