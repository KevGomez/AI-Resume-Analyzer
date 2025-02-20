import { Outlet, useLocation } from "react-router-dom";
import { useState } from "react";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import MainContent from "../components/layout/MainContent";
import { MainSidebar } from "../components/layout/MainSidebar";
import { ChatPanel } from "../components/chat/ChatPanel";
import "../styles/common.css";

const MainLayout = () => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-bg-primary via-bg-secondary to-bg-secondary text-primary">
      <Header
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      <div className="flex-1 flex overflow-hidden">
        {/* Main Sidebar */}
        <div
          className={`fixed top-20 left-0 h-[calc(100vh-5rem)] z-40 transition-transform duration-300 ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <MainSidebar />
        </div>

        {/* Main Content */}
        <div
          className={`flex-1 overflow-hidden transition-all duration-300 ${
            isSidebarOpen ? "ml-64" : "ml-0"
          }`}
        >
          <Outlet />
        </div>

        {/* Chat Panel */}
        <ChatPanel />
      </div>
      <Footer />
    </div>
  );
};

export default MainLayout;
