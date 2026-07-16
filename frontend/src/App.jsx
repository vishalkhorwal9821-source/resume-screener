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
    <div className="relative min-h-screen bg-[#f1f5f9]/50 overflow-hidden selection:bg-blue-500/20">
      {/* Background Liquid Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] min-w-[300px] min-h-[300px] rounded-full bg-gradient-to-tr from-blue-300/20 to-purple-300/25 blur-[100px] pointer-events-none animate-blob" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[55vw] h-[55vw] min-w-[300px] min-h-[300px] rounded-full bg-gradient-to-br from-cyan-300/15 to-emerald-300/20 blur-[120px] pointer-events-none animate-blob-reverse delay-2000" />
      <div className="absolute top-[35%] right-[15%] w-[35vw] h-[35vw] min-w-[250px] min-h-[250px] rounded-full bg-gradient-to-tr from-indigo-300/15 to-pink-300/20 blur-[90px] pointer-events-none animate-blob delay-4000" />

      {/* Main App Content Container */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar user={user} page={page} setPage={setPage} onLogout={() => setUser(null)} />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 relative">
          {page === "screener" && <Screener token={user.access_token} />}
          {page === "history" && <History token={user.access_token} />}
        </main>
      </div>
    </div>
  );
}
