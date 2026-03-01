import { useState } from "react";
import DNABackground from "./components/DNABackground";
import TopBar from "./components/TopBar";
import LeftNav from "./components/LeftNav";
import Dashboard from "./screens/Dashboard";
import Companies from "./screens/Companies";
import ChicagoMap from "./screens/ChicagoMap";
import Indices from "./screens/Indices";
import News from "./screens/News";
import AIAssistant from "./screens/AIAssistant";
import Risk from "./screens/Risk";

export default function App() {
  const [screen, setScreen] = useState("dashboard");
  const [selectedCompany, setSelectedCompany] = useState("BA");

  const renderScreen = () => {
    switch (screen) {
      case "dashboard":   return <Dashboard setScreen={setScreen} setSelectedCompany={setSelectedCompany} />;
      case "companies":   return <Companies selectedCompany={selectedCompany} setSelectedCompany={setSelectedCompany} />;
      case "map":         return <ChicagoMap setScreen={setScreen} setSelectedCompany={setSelectedCompany} />;
      case "indices":     return <Indices />;
      case "news":        return <News />;
      case "aiAssistant": return <AIAssistant />;
      case "risk":        return <Risk />;
      default:            return <Dashboard setScreen={setScreen} setSelectedCompany={setSelectedCompany} />;
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "#080808" }}>
      <DNABackground />
      <TopBar />
      <LeftNav screen={screen} setScreen={setScreen} />
      <main
        className="ml-16 pt-12 relative z-10"
        id="main-content"
        role="main"
        aria-label={`${screen} view`}
      >
        <div className="max-w-[1400px] mx-auto px-6 py-6" key={screen}>
          {renderScreen()}
        </div>
      </main>
    </div>
  );
}
