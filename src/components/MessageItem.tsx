import { Message } from "../api";
import ReportCard from "./ReportCard";

export default function MessageItem({ message }: { message: Message }) {
  // User question → right side
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl bg-blue-600 px-4 py-2 text-sm text-white">
          {message.content}
        </div>
      </div>
    );
  }

  // Assistant report → left side
  if (message.report_data) {
    return (
      <div className="flex justify-start">
        <div className="w-full">
          <ReportCard data={message.report_data} />
          {message.total_tokens ? (
            <div className="mt-1 text-xs text-slate-300">
              {message.total_tokens.toLocaleString()} tokens
              {message.model ? ` · ${message.model}` : ""}
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  // Assistant text (chat / clarify) → left side
  return (
    <div className="flex justify-start">
      <div className="max-w-[80%] rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700">
        {message.content}
      </div>
    </div>
  );
}
