import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import TopicExplorer from "./pages/TopicExplorer";
import CompanyView from "./pages/CompanyView";
import NextBest from "./pages/NextBest";
import ProblemDetail from "./pages/ProblemDetail";

export default function App() {
  return (
    <div className="min-h-screen font-body">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-10">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/explorer" element={<TopicExplorer />} />
          <Route path="/companies" element={<CompanyView />} />
          <Route path="/next-best" element={<NextBest />} />
          <Route path="/problems/:title" element={<ProblemDetail />} />
        </Routes>
      </main>
      <footer className="max-w-6xl mx-auto px-6 py-8 contour-rule mt-10">
        <p className="font-mono text-[11px] text-muted">
          PrepGraph — a personal interview-readiness context graph, built on CognoDB.
        </p>
      </footer>
    </div>
  );
}
