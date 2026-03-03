/**
 * 国际化翻译和日期格式配置
 */

export type Language = 'zh' | 'en';

// UI 标签翻译
export const translations = {
  zh: {
    // 控制面板标签
    'fontSize': '数字大小',
    'animationSpeed': '动画速度',
    'letterSpacing': '数字间距',
    'timezone': '时区',
    'fontFamily': '字体',
    'fontColor': '字体颜色',
    'bgColor': '背景颜色',
    'displayOptions': '显示选项',
    'hideSeconds': '隐藏秒',
    'showDate': '显示日期',
    'showDateCountdown': '显示日期倒计时',
    'dateCountdownSettings': '日期倒计时',
    'countdownLabel': '标签',
    'countdownLabelPlaceholder': '例：新年',
    'countdownDate': '目标日期',
    'actions': '操作',
    'fullscreen': '全屏显示',
    'exitFullscreen': '退出全屏',
    'calibration': '时间校准',
    'alarmCountdown': '闹钟/倒计时',
    'themes': '主题预设',
    'cyberpunk': '赛博朋克',
    'minimal': '极简白',
    'retro': '复古绿屏',
    'config': '配置',
    'exportConfig': '导出配置',
    'importConfig': '导入配置',
    'language': '语言',
    'collapse': '收起',
    'settings': '设置',
    
    // 时区
    'shanghai': '上海',
    'tokyo': '东京',
    'newyork': '纽约',
    'losangeles': '洛杉矶',
    'london': '伦敦',
    'paris': '巴黎',
    'sydney': '悉尼',
    
    // 快捷键提示
    'shortcutsFullscreen': '快捷键: F(全屏) C(校准) S(隐藏秒)',
    'shortcutsExit': '按 ESC 退出全屏 | F 全屏 | C 校准 | S 隐藏秒',
  },
  en: {
    // 控制面板标签
    'fontSize': 'Font Size',
    'animationSpeed': 'Animation Speed',
    'letterSpacing': 'Letter Spacing',
    'timezone': 'Timezone',
    'fontFamily': 'Font',
    'fontColor': 'Font Color',
    'bgColor': 'Background Color',
    'displayOptions': 'Display Options',
    'hideSeconds': 'Hide Seconds',
    'showDate': 'Show Date',
    'showDateCountdown': 'Show Date Countdown',
    'dateCountdownSettings': 'Date Countdown',
    'countdownLabel': 'Label',
    'countdownLabelPlaceholder': 'e.g., New Year',
    'countdownDate': 'Target Date',
    'actions': 'Actions',
    'fullscreen': 'Fullscreen',
    'exitFullscreen': 'Exit Fullscreen',
    'calibration': 'Time Calibration',
    'alarmCountdown': 'Alarm/Countdown',
    'themes': 'Themes',
    'cyberpunk': 'Cyberpunk',
    'minimal': 'Minimal',
    'retro': 'Retro',
    'config': 'Config',
    'exportConfig': 'Export Config',
    'importConfig': 'Import Config',
    'language': 'Language',
    'collapse': 'Collapse',
    'settings': 'Settings',
    
    // 时区
    'shanghai': 'Shanghai',
    'tokyo': 'Tokyo',
    'newyork': 'New York',
    'losangeles': 'Los Angeles',
    'london': 'London',
    'paris': 'Paris',
    'sydney': 'Sydney',
    
    // 快捷键提示
    'shortcutsFullscreen': 'Shortcuts: F(fullscreen) C(calibrate) S(hide seconds)',
    'shortcutsExit': 'Press ESC to exit fullscreen | F fullscreen | C calibrate | S hide seconds',
  },
};

// 日期格式配置
export const dateFormats = {
  zh: {
    // 中文格式: 2026年3月3日 星期二
    format: (year: number, month: number, day: number, weekday: number) => {
      const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
      return `${year}年${String(month).padStart(2, '0')}月${String(day).padStart(2, '0')}日 星期${weekdays[weekday]}`;
    },
  },
  en: {
    // 英文格式: Mar 03, 2026 Tue
    format: (year: number, month: number, day: number, weekday: number) => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return `${months[month - 1]} ${String(day).padStart(2, '0')}, ${year} ${weekdays[weekday]}`;
    },
  },
};

// 倒计时文本格式
export const countdownFormats = {
  zh: (days: number, label: string) => `距离${label}还有${days}天`,
  en: (days: number, label: string) => `${days} days until ${label}`,
};

// 获取翻译文本
export function t(language: Language, key: string): string {
  return translations[language][key as keyof typeof translations['zh']] || key;
}

// 获取格式化日期
export function formatDate(language: Language, year: number, month: number, day: number, weekday: number): string {
  return dateFormats[language].format(year, month, day, weekday);
}

// 获取倒计时文本
export function formatCountdown(language: Language, days: number, label: string): string {
  return countdownFormats[language](days, label);
}
