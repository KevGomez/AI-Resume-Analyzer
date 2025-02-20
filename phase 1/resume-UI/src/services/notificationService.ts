import { v4 as uuidv4 } from "uuid";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "success" | "info" | "warning" | "alert";
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

class NotificationService {
  private notifications: Notification[] = [];
  private listeners: ((notifications: Notification[]) => void)[] = [];

  addNotification(
    notification: Omit<Notification, "id" | "timestamp" | "read">
  ) {
    const newNotification: Notification = {
      id: uuidv4(),
      timestamp: new Date(),
      read: false,
      ...notification,
    };

    this.notifications.unshift(newNotification);
    this.notifyListeners();
    return newNotification;
  }

  getNotifications() {
    return this.notifications;
  }

  getUnreadCount() {
    return this.notifications.filter((n) => !n.read).length;
  }

  markAsRead(notificationId: string) {
    const notification = this.notifications.find(
      (n) => n.id === notificationId
    );
    if (notification) {
      notification.read = true;
      this.notifyListeners();
    }
  }

  markAllAsRead() {
    this.notifications.forEach((n) => (n.read = true));
    this.notifyListeners();
  }

  removeNotification(notificationId: string) {
    this.notifications = this.notifications.filter(
      (n) => n.id !== notificationId
    );
    this.notifyListeners();
  }

  clearAll() {
    this.notifications = [];
    this.notifyListeners();
  }

  subscribe(listener: (notifications: Notification[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener([...this.notifications]));
  }

  // Resume upload specific notifications
  addResumeUploadNotifications(resumeId: number, filename: string) {
    // Success notification
    this.addNotification({
      title: "Resume Upload Successful",
      message: `Your resume "${filename}" has been successfully uploaded and analyzed.`,
      type: "success",
      actionUrl: `/analysis?id=${resumeId}`,
      actionLabel: "View Analysis",
    });

    // Info notifications for next steps
    this.addNotification({
      title: "Skills Extracted",
      message:
        "We've analyzed your resume and extracted key skills. Check your skills distribution in the dashboard.",
      type: "info",
      actionUrl: "/dashboard",
      actionLabel: "View Dashboard",
    });

    this.addNotification({
      title: "Job Recommendations Ready",
      message:
        "Based on your resume, we've prepared personalized job recommendations for you.",
      type: "info",
      actionUrl: "/dashboard",
      actionLabel: "View Recommendations",
    });

    this.addNotification({
      title: "Resume Tips Available",
      message:
        "Get personalized suggestions to improve your resume and increase your chances of landing your dream job.",
      type: "info",
      actionUrl: "/analysis?id=${resumeId}",
      actionLabel: "View Tips",
    });
  }
}

export const notificationService = new NotificationService();
