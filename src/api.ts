import { API_URL } from "./config";

export interface Conversation {
  id: number;
  title: string;
  created_at: string;
}

export interface ReportSeries {
  label: string;
  value: number;
  compareValue?: number;
  highlight?: boolean;
}

export interface ReportData {
  spec?: unknown;
  chart_type?: string;
  title?: string;
  unit?: string;
  badge?: string;
  y_label?: string;
  period_label?: string;
  compare_label?: string;
  series?: ReportSeries[];
  kpis?: { label: string; value: string; trend?: string }[];
  narrative?: string;
  prediction?: string;
  advice?: string[];
}

export interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  report_data?: ReportData | null;
  model?: string | null;
  prompt_tokens?: number | null;
  completion_tokens?: number | null;
  total_tokens?: number | null;
  created_at: string;
}

export async function getConversations(): Promise<Conversation[]> {
  const res = await fetch(`${API_URL}/api/conversations`);
  if (!res.ok) throw new Error("Failed to load conversations");
  return res.json();
}

export async function createConversation(): Promise<Conversation> {
  const res = await fetch(`${API_URL}/api/conversations`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to create conversation");
  return res.json();
}

export async function getMessages(id: number): Promise<Message[]> {
  const res = await fetch(`${API_URL}/api/conversations/${id}/messages`);
  if (!res.ok) throw new Error("Failed to load messages");
  return res.json();
}

export async function sendMessage(
  id: number,
  content: string,
): Promise<{ userMessage: Message; assistantMessage: Message }> {
  const res = await fetch(`${API_URL}/api/conversations/${id}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) throw new Error("Failed to send message");
  return res.json();
}
