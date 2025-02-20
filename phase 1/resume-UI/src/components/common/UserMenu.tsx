import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../../config/firebase";
import { signOut } from "firebase/auth";

export const UserMenu = () => {
  const navigate = useNavigate();
  const user = auth.currentUser;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (!user) return null;

  return (
    <Menu as="div" className="relative">
      <Menu.Button className="flex items-center space-x-3 p-2 rounded-lg hover:bg-dark-200/50 transition-colors">
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-medium ring-2 ring-white/10">
          {user.displayName
            ? user.displayName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
            : user.email?.[0].toUpperCase()}
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
        <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl bg-dark-200/40 backdrop-blur-sm border border-white/10 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none divide-y divide-white/10">
          <div className="px-1 py-1">
            <div className="px-4 py-2">
              <p className="text-sm font-medium text-white">
                {user.displayName || "User"}
              </p>
              <p className="text-xs text-white/70 truncate">{user.email}</p>
            </div>
          </div>

          <div className="px-1 py-1">
            <Menu.Item>
              {({ active }) => (
                <Link
                  to="/profile"
                  className={`${
                    active ? "bg-dark-300/50" : ""
                  } group flex items-center px-4 py-2 text-sm text-white rounded-lg transition-colors`}
                >
                  <svg
                    className="mr-3 h-5 w-5 text-white/70"
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
                    active ? "bg-dark-300/50" : ""
                  } group flex items-center px-4 py-2 text-sm text-white rounded-lg transition-colors`}
                >
                  <svg
                    className="mr-3 h-5 w-5 text-white/70"
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
                    active ? "bg-dark-300/50" : ""
                  } group flex w-full items-center px-4 py-2 text-sm text-white/70 hover:text-white rounded-lg transition-colors`}
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
  );
};
