import { Message } from "../api";
import ReportCard from "./ReportCard";

export default function MessageItem({ message }: { message: Message }) {
  if (message.role === "user") {
    return (
      <div className="text-sm font-medium text-slate-400">“{message.content}”</div>
    );
  }

  if (message.report_data) {
    return (
      <div>
        <ReportCard data={message.report_data} />
        {message.total_tokens ? (
          <div className="mt-1 text-xs text-slate-300">
            {message.total_tokens.toLocaleString()} tokens
            {message.model ? ` · ${message.model}` : ""}
          </div>
        ) : null}
      </div>
    );
  }

  // assistant text (chat / clarify)
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
      {message.content}
    </div>
  );
}
