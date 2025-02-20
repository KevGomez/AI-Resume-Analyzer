import { useState, useEffect } from "react";
import { Popover } from "@headlessui/react";
import { BellIcon } from "@heroicons/react/24/outline";
import {
  notificationService,
  Notification,
} from "../../services/notificationService";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

export const NotificationsPopover = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // Subscribe to notifications
    const unsubscribe = notificationService.subscribe(
      (updatedNotifications) => {
        setNotifications(updatedNotifications);
        setUnreadCount(notificationService.getUnreadCount());
      }
    );

    // Initial load
    setNotifications(notificationService.getNotifications());
    setUnreadCount(notificationService.getUnreadCount());

    return unsubscribe;
  }, []);

  const handleNotificationClick = (notification: Notification) => {
    notificationService.markAsRead(notification.id);
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return (
          <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
            <svg
              className="w-4 h-4 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        );
      case "warning":
        return (
          <div className="w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center">
            <svg
              className="w-4 h-4 text-yellow-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        );
      case "alert":
        return (
          <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center">
            <svg
              className="w-4 h-4 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-primary-500/10 flex items-center justify-center">
            <svg
              className="w-4 h-4 text-primary-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        );
    }
  };

  return (
    <Popover className="relative">
      <Popover.Button className="relative p-2 rounded-lg bg-tertiary hover:bg-dark-200/50 transition-colors">
        <BellIcon className="w-5 h-5 text-primary-400" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </Popover.Button>

      <Popover.Panel className="absolute right-0 mt-2 w-96 max-h-[80vh] overflow-y-auto bg-dark-200/40 backdrop-blur-sm border border-white/10 rounded-xl shadow-lg">
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Notifications</h3>
            {notifications.length > 0 && (
              <button
                onClick={() => notificationService.markAllAsRead()}
                className="text-sm text-primary-400 hover:text-primary-500"
              >
                Mark all as read
              </button>
            )}
          </div>
        </div>

        <div className="divide-y divide-white/10">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-white/70">
              No notifications
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`p-4 flex gap-4 cursor-pointer transition-colors ${
                  notification.read ? "bg-transparent" : "bg-dark-300/30"
                } hover:bg-dark-300/50`}
              >
                {getNotificationIcon(notification.type)}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-white">
                    {notification.title}
                  </h4>
                  <p className="text-sm text-white/70 mt-1">
                    {notification.message}
                  </p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs text-white/50">
                      {format(notification.timestamp, "MMM d, yyyy h:mm a")}
                    </span>
                    {notification.actionLabel && (
                      <span className="text-xs font-medium text-primary-400">
                        {notification.actionLabel} →
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Popover.Panel>
    </Popover>
  );
};
