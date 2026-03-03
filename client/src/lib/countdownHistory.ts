/**
 * 倒计时历史记录模块
 * 记录最近使用过的倒计时时长，方便快速重复使用
 */

export interface CountdownHistoryItem {
  id: string;
  hours: number;
  minutes: number;
  seconds: number;
  timestamp: number; // 最后使用时间
  usageCount: number; // 使用次数
}

const STORAGE_KEY = 'countdown-history';
const MAX_HISTORY_ITEMS = 10;

/**
 * 获取倒计时历史记录
 */
export function getCountdownHistory(): CountdownHistoryItem[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const items = JSON.parse(saved) as CountdownHistoryItem[];
      // 按最后使用时间排序（最新的在前）
      return items.sort((a, b) => b.timestamp - a.timestamp);
    }
  } catch (error) {
    console.error('Failed to load countdown history:', error);
  }
  return [];
}

/**
 * 添加或更新历史记录项
 */
export function addCountdownHistory(hours: number, minutes: number, seconds: number): void {
  try {
    const history = getCountdownHistory();
    
    // 查找是否已存在相同的时长
    const existingIndex = history.findIndex(
      item => item.hours === hours && item.minutes === minutes && item.seconds === seconds
    );

    if (existingIndex >= 0) {
      // 更新现有项
      history[existingIndex].timestamp = Date.now();
      history[existingIndex].usageCount += 1;
    } else {
      // 添加新项
      const newItem: CountdownHistoryItem = {
        id: `countdown-${Date.now()}`,
        hours,
        minutes,
        seconds,
        timestamp: Date.now(),
        usageCount: 1,
      };
      history.push(newItem);
    }

    // 保持历史记录数量不超过限制
    if (history.length > MAX_HISTORY_ITEMS) {
      history.pop();
    }

    // 按最后使用时间排序
    history.sort((a, b) => b.timestamp - a.timestamp);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Failed to save countdown history:', error);
  }
}

/**
 * 删除历史记录项
 */
export function removeCountdownHistory(id: string): void {
  try {
    const history = getCountdownHistory();
    const filtered = history.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to remove countdown history:', error);
  }
}

/**
 * 清空所有历史记录
 */
export function clearCountdownHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear countdown history:', error);
  }
}

/**
 * 格式化倒计时时长为字符串
 */
export function formatCountdownDuration(hours: number, minutes: number, seconds: number): string {
  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0) parts.push(`${seconds}s`);
  return parts.length > 0 ? parts.join(' ') : '0s';
}

/**
 * 将秒数转换为小时、分钟、秒
 */
export function secondsToHMS(totalSeconds: number): { hours: number; minutes: number; seconds: number } {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { hours, minutes, seconds };
}

/**
 * 将小时、分钟、秒转换为总秒数
 */
export function hmsToSeconds(hours: number, minutes: number, seconds: number): number {
  return hours * 3600 + minutes * 60 + seconds;
}
