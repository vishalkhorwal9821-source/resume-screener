import { useState } from "react";
import Login from "./components/Login";
import Screener from "./components/Screener";
import History from "./components/History";
import Navbar from "./components/Navbar";

export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("screener");

  if (!user) return <Login onLogin={setUser} />;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#dbeafe,_#e0f2fe_35%,_#f8fafc_70%)]">
      <Navbar user={user} page={page} setPage={setPage} onLogout={() => setUser(null)} />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {page === "screener" && <Screener token={user.access_token} />}
        {page === "history" && <History token={user.access_token} />}
      </main>
    </div>
  );
}
