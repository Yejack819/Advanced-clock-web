/**
 * alarmHistory - 闹钟历史记录管理
 * 
 * 功能：
 * - 记录用户设置的闹钟时间
 * - 统计使用频率
 * - 自动推荐最常用的时间
 */

const ALARM_HISTORY_KEY = 'advanced-clock-alarm-history';
const MAX_HISTORY_SIZE = 20;

export interface AlarmHistoryItem {
  id: string;
  time: string; // HH:mm 格式
  usageCount: number;
  lastUsed: number; // timestamp
}

// 获取闹钟历史记录
export function getAlarmHistory(): AlarmHistoryItem[] {
  try {
    const saved = localStorage.getItem(ALARM_HISTORY_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {}
  return [];
}

// 保存闹钟历史记录
function saveAlarmHistory(history: AlarmHistoryItem[]): void {
  try {
    localStorage.setItem(ALARM_HISTORY_KEY, JSON.stringify(history));
  } catch {}
}

// 添加或更新闹钟历史
export function addAlarmHistory(time: string): AlarmHistoryItem[] {
  let history = getAlarmHistory();
  
  // 查找是否已存在
  const existingIndex = history.findIndex(item => item.time === time);
  
  if (existingIndex >= 0) {
    // 已存在，增加使用次数
    history[existingIndex].usageCount++;
    history[existingIndex].lastUsed = Date.now();
  } else {
    // 不存在，添加新记录
    history.push({
      id: Date.now().toString(),
      time,
      usageCount: 1,
      lastUsed: Date.now(),
    });
  }
  
  // 按使用次数排序，次数相同按最近使用排序
  history.sort((a, b) => {
    if (b.usageCount !== a.usageCount) {
      return b.usageCount - a.usageCount;
    }
    return b.lastUsed - a.lastUsed;
  });
  
  // 限制大小
  if (history.length > MAX_HISTORY_SIZE) {
    history = history.slice(0, MAX_HISTORY_SIZE);
  }
  
  saveAlarmHistory(history);
  return history;
}

// 删除历史记录
export function removeAlarmHistory(id: string): AlarmHistoryItem[] {
  let history = getAlarmHistory();
  history = history.filter(item => item.id !== id);
  saveAlarmHistory(history);
  return history;
}

// 获取最常用的闹钟时间
export function getMostFrequentAlarm(): { time: string } | null {
  const history = getAlarmHistory();
  if (history.length === 0) return null;
  
  // 返回使用次数最多的
  return { time: history[0].time };
}
