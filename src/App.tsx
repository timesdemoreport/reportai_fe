import { useEffect, useState } from "react";
import { API_URL } from "./config";

function App() {
  const [status, setStatus] = useState("checking…");
  useEffect(() => {
    fetch(`${API_URL}/api/health`)
      .then((r) => r.json())
      .then((d) => setStatus(`backend ${d.status} · db ${d.db} · ${d.time}`))
      .catch(() => setStatus("backend unreachable"));
  }, []);
  return (
    <main className="p-10">
      <h1 className="text-2xl font-medium">AI Report Writer</h1>
      <p className="mt-2 text-gray-600">Backend health: {status}</p>
    </main>
  );
}

export default App;
