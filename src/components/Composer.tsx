import { Send } from "lucide-react";

interface ComposerProps {
  input: string;
  setInput: (v: string) => void;
  onSend: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  sending: boolean;
}

export default function Composer({
  input,
  setInput,
  onSend,
  onKeyDown,
  sending,
}: ComposerProps) {
  return (
    <div className="flex items-end gap-2 rounded-2xl border border-gray-300 bg-white p-2 shadow-sm">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={onKeyDown}
        rows={1}
        placeholder="Describe the report you want…"
        className="max-h-40 flex-1 resize-none border-0 bg-transparent px-2 py-1.5 text-sm outline-none focus:ring-0"
      />
      <button
        onClick={onSend}
        disabled={sending || !input.trim()}
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40"
      >
        <Send size={16} />
      </button>
    </div>
  );
}
