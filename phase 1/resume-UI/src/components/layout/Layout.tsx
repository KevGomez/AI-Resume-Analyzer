import { useEffect } from "react";
import { useTheme } from "../../hooks/useTheme";
import Sidebar from "./Sidebar";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isDark } = useTheme();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    document.documentElement.classList.toggle("light", !isDark);
  }, [isDark]);

  return (
    <div className="min-h-screen transition-colors duration-200">
      <Sidebar />
      <main className="pl-64 p-8">{children}</main>
    </div>
  );
};

export default Layout;
