import { useLocation, Link } from "react-router-dom";
import {
  HomeIcon,
  DocumentPlusIcon,
  BriefcaseIcon,
  ChartBarIcon,
  UsersIcon,
  BookmarkIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

const navItems = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: <HomeIcon className="w-5 h-5" />,
  },
  {
    label: "Upload Resume",
    path: "/upload",
    icon: <DocumentPlusIcon className="w-5 h-5" />,
  },
  {
    label: "Job Matching",
    path: "/job-matching",
    icon: <BriefcaseIcon className="w-5 h-5" />,
  },
  {
    label: "LinkedIn Insights",
    path: "/linkedin-insights",
    icon: <ChartBarIcon className="w-5 h-5" />,
  },
  {
    label: "HR Dashboard",
    path: "/hr-dashboard",
    icon: <UsersIcon className="w-5 h-5" />,
  },
  {
    label: "Saved Items",
    path: "/saved",
    icon: <BookmarkIcon className="w-5 h-5" />,
  },
  {
    label: "Settings",
    path: "/settings",
    icon: <Cog6ToothIcon className="w-5 h-5" />,
  },
];

export const MainSidebar = () => {
  const location = useLocation();

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="h-[calc(100vh-5rem)] w-64 bg-dark-300/30 backdrop-blur-sm border-r border-white/10">
      <div className="h-full flex flex-col">
        <div className="flex-1 py-6 overflow-y-auto">
          <nav className="px-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-2.5 rounded-lg transition-colors duration-200 ${
                  isActivePath(item.path)
                    ? "bg-primary-500/20 text-white"
                    : "text-white/70 hover:text-white hover:bg-dark-200"
                }`}
              >
                <span
                  className={`flex-shrink-0 ${
                    isActivePath(item.path) ? "text-primary-400" : ""
                  }`}
                >
                  {item.icon}
                </span>
                <span className="ml-3 font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
};
