import { MessageSquare, Plus } from "lucide-react";
import { Conversation } from "../api";

interface SidebarProps {
  conversations: Conversation[];
  activeId: number | null;
  onNewChat: () => void;
  onSelect: (id: number) => void;
}

export default function Sidebar({
  conversations,
  activeId,
  onNewChat,
  onSelect,
}: SidebarProps) {
  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="p-3">
        <button
          onClick={onNewChat}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus size={16} /> New report
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-3">
        {conversations.map((c) => (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            className={`mb-1 flex w-full items-center gap-2 truncate rounded-lg px-3 py-2 text-left text-sm ${
              activeId === c.id
                ? "bg-blue-50 text-blue-700"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <MessageSquare size={15} className="shrink-0 text-slate-400" />
            <span className="truncate">{c.title}</span>
          </button>
        ))}
      </div>

      <div className="border-t border-slate-200 p-3 text-xs text-slate-400">
        People / Insight
      </div>
    </aside>
  );
}
