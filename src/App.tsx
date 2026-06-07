import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import Dashboard from "@/pages/Dashboard";
import CityMap from "@/pages/CityMap";
import Battle from "@/pages/Battle";
import BattleResult from "@/pages/BattleResult";
import HeroCreate from "@/pages/HeroCreate";
import HeroManage from "@/pages/HeroManage";
import Market from "@/pages/Market";
import Report from "@/pages/Report";
import Rankings from "@/pages/Rankings";
import Guild from "@/pages/Guild";

export default function App() {
  return (
    <Router>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/city-map" element={<CityMap />} />
          <Route path="/battle" element={<Battle />} />
          <Route path="/battle-result" element={<BattleResult />} />
          <Route path="/hero-create" element={<HeroCreate />} />
          <Route path="/hero-manage" element={<HeroManage />} />
          <Route path="/market" element={<Market />} />
          <Route path="/security" element={<Report />} />
          <Route path="/rankings" element={<Rankings />} />
          <Route path="/guild" element={<Guild />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
    </Router>
  );
}
