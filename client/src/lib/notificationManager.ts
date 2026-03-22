/**
 * notificationManager - 桌面通知管理模块
 * 
 * 功能：
 * - 请求浏览器通知权限
 * - 发送倒计时结束通知
 * - 发送闹钟提醒通知
 */

export type NotificationType = 'countdown' | 'alarm';

// 检查浏览器是否支持通知
export function isNotificationSupported(): boolean {
  return 'Notification' in window;
}

// 获取当前通知权限状态
export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) {
    return 'denied';
  }
  return Notification.permission;
}

// 检查是否有通知权限
export function hasNotificationPermission(): boolean {
  return getNotificationPermission() === 'granted';
}

// 请求通知权限
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) {
    console.warn('This browser does not support notifications');
    return 'denied';
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return 'denied';
  }
}

// 通知选项接口
interface NotifyOptions {
  title: string;
  body: string;
  icon?: string;
  tag?: string; // 用于替换相同 tag 的通知
  requireInteraction?: boolean; // 是否需要用户交互才关闭
  silent?: boolean; // 是否静音
}

// 发送桌面通知
export function sendNotification(options: NotifyOptions, language: 'zh' | 'en' = 'zh'): Notification | null {
  if (!hasNotificationPermission()) {
    console.warn('No notification permission');
    return null;
  }

  try {
    const notification = new Notification(options.title, {
      body: options.body,
      icon: options.icon || '/favicon.ico',
      tag: options.tag,
      requireInteraction: options.requireInteraction ?? true,
      silent: options.silent ?? false,
    });

    // 点击通知时关闭它
    notification.onclick = () => {
      notification.close();
      // 尝试将窗口聚焦
      if (window.parent) {
        window.parent.focus();
      }
      window.focus();
    };

    return notification;
  } catch (error) {
    console.error('Error sending notification:', error);
    return null;
  }
}

// 发送倒计时结束通知
export function sendCountdownNotification(language: 'zh' | 'en' = 'zh'): Notification | null {
  const title = language === 'zh' ? '⏰ 倒计时结束' : '⏰ Countdown Finished';
  const body = language === 'zh' 
    ? '您设置的倒计时已完成！' 
    : 'Your countdown has finished!';

  return sendNotification({
    title,
    body,
    tag: 'countdown-finished',
    requireInteraction: true,
  }, language);
}

// 发送闹钟通知
export function sendAlarmNotification(alarmTime: string, language: 'zh' | 'en' = 'zh', label?: string): Notification | null {
  const title = language === 'zh' ? '🔔 闹钟提醒' : '🔔 Alarm';
  const body = label
    ? (language === 'zh' ? `${label}：${alarmTime}` : `${label}: ${alarmTime}`)
    : (language === 'zh' ? `闹钟时间到了：${alarmTime}` : `Alarm time: ${alarmTime}`);

  return sendNotification({
    title,
    body,
    tag: 'alarm-triggered',
    requireInteraction: true,
  }, language);
}

// 发送日期倒计时提醒通知（可选功能）
export function sendDateCountdownNotification(label: string, days: number, language: 'zh' | 'en' = 'zh'): Notification | null {
  const title = language === 'zh' ? '📅 日期提醒' : '📅 Date Reminder';
  const body = language === 'zh'
    ? `距离「${label}」还有 ${days} 天`
    : `${days} days until "${label}"`;

  return sendNotification({
    title,
    body,
    tag: 'date-countdown',
    requireInteraction: false,
    silent: true,
  }, language);
}

// 获取权限状态的友好文本
export function getPermissionStatusText(language: 'zh' | 'en' = 'zh'): string {
  const permission = getNotificationPermission();
  
  switch (permission) {
    case 'granted':
      return language === 'zh' ? '已授权' : 'Granted';
    case 'denied':
      return language === 'zh' ? '已拒绝' : 'Denied';
    case 'default':
      return language === 'zh' ? '未设置' : 'Not Set';
    default:
      return permission;
  }
}
