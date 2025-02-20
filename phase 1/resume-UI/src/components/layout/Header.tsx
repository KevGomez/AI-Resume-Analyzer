import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, Transition } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import { authService } from "../../services/authService";
import { UserProfile } from "../../types";
import { SearchBar } from "../common/SearchBar";
import { DarkModeToggle } from "../common/DarkModeToggle";
import { NotificationsPopover } from "../common/NotificationsPopover";
import { Bars3Icon } from "@heroicons/react/24/outline";

interface HeaderProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

const Header = ({ isSidebarOpen, onToggleSidebar }: HeaderProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Check for current user on mount
    const initializeAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Set up auth state listener
    const unsubscribe = authService.onAuthStateChange((updatedUser) => {
      setUser(updatedUser);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // TODO: Implement search functionality
    console.log("Searching for:", query);
  };

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="sticky top-0 backdrop-blur-sm bg-dark-300/30 border-b border-white/10 z-50">
      <div className="max-w-[90rem] mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex items-center h-20">
          {/* Left section - Toggle and Branding */}
          <div className="flex items-center space-x-4">
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-lg hover:bg-dark-200/50 transition-colors"
            >
              <Bars3Icon
                className={`w-6 h-6 text-white/70 transition-transform duration-300 ${
                  isSidebarOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            <Link to="/" className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 p-2 shadow-lg ring-1 ring-white/10">
                <svg
                  className="w-full h-full text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-display font-bold text-white">
                  AI Resume Analyzer
                </span>
                <span className="text-xs text-white/60">by Kevin Gomez</span>
              </div>
            </Link>
          </div>

          {/* Center section - Search */}
          <div className="flex-1 px-12">
            <SearchBar
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search resumes, job descriptions, or candidates..."
              className="w-full max-w-3xl mx-auto"
            />
          </div>

          {/* Right section - Actions */}
          <div className="flex-shrink-0 flex items-center space-x-4">
            {!isLoading && (
              <>
                {user ? (
                  <div className="flex items-center space-x-4">
                    <NotificationsPopover />
                    <DarkModeToggle />
                    <Menu as="div" className="relative">
                      <Menu.Button className="flex items-center space-x-3 p-2 rounded-lg hover:bg-dark-200 transition-colors duration-200">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-medium ring-2 ring-white/10">
                          {user.fullName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </div>
                        <div className="hidden md:block text-left">
                          <div className="text-sm font-medium text-primary">
                            {user.fullName}
                          </div>
                          <div className="text-xs text-secondary">
                            {user.email}
                          </div>
                        </div>
                      </Menu.Button>
                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Menu.Items className="absolute right-0 mt-2 w-64 origin-top-right rounded-xl bg-dark-200/40 backdrop-blur-sm border border-white/10 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none divide-y divide-white/10">
                          <div className="px-1 py-1">
                            <Menu.Item>
                              {({ active }) => (
                                <Link
                                  to="/profile"
                                  className={`${
                                    active ? "bg-dark-300" : ""
                                  } group flex items-center px-4 py-2 text-sm text-primary rounded-lg transition-colors duration-200`}
                                >
                                  <svg
                                    className="mr-3 h-5 w-5 text-secondary"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                    />
                                  </svg>
                                  Profile
                                </Link>
                              )}
                            </Menu.Item>
                            <Menu.Item>
                              {({ active }) => (
                                <Link
                                  to="/settings"
                                  className={`${
                                    active ? "bg-dark-300" : ""
                                  } group flex items-center px-4 py-2 text-sm text-primary rounded-lg transition-colors duration-200`}
                                >
                                  <svg
                                    className="mr-3 h-5 w-5 text-secondary"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                                    />
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                  </svg>
                                  Settings
                                </Link>
                              )}
                            </Menu.Item>
                          </div>
                          <div className="px-1 py-1">
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  onClick={handleLogout}
                                  className={`${
                                    active ? "bg-dark-300" : ""
                                  } group flex w-full items-center px-4 py-2 text-sm text-secondary hover:text-primary rounded-lg transition-colors duration-200`}
                                >
                                  <svg
                                    className="mr-3 h-5 w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                    />
                                  </svg>
                                  Sign out
                                </button>
                              )}
                            </Menu.Item>
                          </div>
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm text-primary bg-primary-500/20 hover:bg-primary-500/30 rounded-lg transition-colors duration-200"
                  >
                    Sign In
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
