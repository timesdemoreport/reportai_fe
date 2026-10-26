import { useEffect, useRef, useState } from "react";
import { Menu } from "lucide-react";
import {
  Conversation,
  Message,
  createConversation,
  getConversations,
  getMessages,
  sendMessage,
} from "./api";
import Sidebar from "./components/Sidebar";
import MessageItem from "./components/MessageItem";
import Composer from "./components/Composer";

const QUICK_STARTS = [
  "Headcount by department 2025",
  "Turnover by department, 2024 vs 2025",
  "Retention rate by department 2025",
  "Leave utilization by department 2025",
];

function App() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);

  async function loadConversations() {
    try {
      setConversations(await getConversations());
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleNewChat() {
    const c = await createConversation();
    setConversations((prev) => [c, ...prev]);
    setActiveId(c.id);
    setMessages([]);
  }

  async function handleSelect(id: number) {
    setActiveId(id);
    setMessages(await getMessages(id));
  }

  async function submit(raw: string) {
    const text = raw.trim();
    if (!text || sending) return;

    let id = activeId;
    if (!id) {
      const c = await createConversation();
      setConversations((prev) => [c, ...prev]);
      id = c.id;
      setActiveId(id);
    }

    setInput("");
    setSending(true);

    const optimistic: Message = {
      id: Date.now(),
      role: "user",
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      const { userMessage, assistantMessage } = await sendMessage(id, text);
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== optimistic.id),
        userMessage,
        assistantMessage,
      ]);
      loadConversations();
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit(input);
    }
  }

  const isEmpty = messages.length === 0;

  return (
    <div className="flex h-screen bg-white text-slate-800">
      {sidebarOpen && (
        <Sidebar
          conversations={conversations}
          activeId={activeId}
          onNewChat={handleNewChat}
          onSelect={handleSelect}
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="flex items-center justify-between bg-slate-900 px-4 py-3 text-white">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen((o) => !o)}
              className="rounded p-1 hover:bg-white/10"
              aria-label="Toggle menu"
            >
              <Menu size={18} />
            </button>
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold">
                P
              </div>
              <span className="text-sm font-medium">
                People <span className="text-white/50">/ insight</span>
              </span>
            </div>
          </div>
          <span className="rounded-full border border-white/20 px-3 py-1 text-[11px] tracking-wide text-white/70">
            ILLUSTRATIVE DATA · DEMO
          </span>
        </header>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-4xl px-6 py-8">
            {isEmpty ? (
              <>
                {/* Hero */}
                <div className="mb-6">
                  <div className="mb-2 text-xs font-medium uppercase tracking-widest text-blue-600">
                    HR Analytics / Report Builder
                  </div>
                  <h1 className="mb-2 font-serif text-4xl text-slate-900">
                    A clearer picture of your people.
                  </h1>
                  <p className="max-w-lg text-slate-500">
                    Ask a workforce question. Explore a chart, review the figures,
                    and take the report with you.
                  </p>
                </div>

                {/* Question card (only on the empty state) */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-3 text-base font-medium text-slate-900">
                    What would you like to know?
                  </div>
                  <div className="mb-1 text-xs font-medium text-slate-500">
                    Your question
                  </div>
                  <div className="flex items-stretch gap-3">
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={onKeyDown}
                      rows={2}
                      placeholder="e.g. How is headcount distributed across departments?"
                      className="flex-1 resize-none rounded-lg border border-slate-200 bg-blue-50/40 px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-400"
                    />
                    <button
                      onClick={() => submit(input)}
                      disabled={sending || !input.trim()}
                      className="shrink-0 rounded-lg bg-blue-600 px-5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      Generate report ↗
                    </button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {QUICK_STARTS.map((q) => (
                      <button
                        key={q}
                        onClick={() => submit(q)}
                        disabled={sending}
                        className="rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:bg-blue-50 disabled:opacity-50"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              /* Thread */
              <div className="space-y-8">
                {messages.map((m) => (
                  <MessageItem key={m.id} message={m} />
                ))}
                {sending && (
                  <div className="text-sm text-slate-400">Working…</div>
                )}
                <div ref={endRef} />
              </div>
            )}
          </div>
        </div>

        {/* Bottom composer — only once the chat has started */}
        {!isEmpty && (
          <div className="border-t border-slate-200 bg-white px-6 py-3">
            <div className="mx-auto max-w-4xl">
              <Composer
                input={input}
                setInput={setInput}
                onSend={() => submit(input)}
                onKeyDown={onKeyDown}
                sending={sending}
              />
              <p className="mt-2 text-center text-[11px] text-slate-400">
                Ask a follow-up, change the period, or switch the chart — e.g. “show
                as a pie chart”.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
