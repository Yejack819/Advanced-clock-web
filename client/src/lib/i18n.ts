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
    'fontCategoryMonospace': '等宽字体',
    'fontCategorySansSerif': '无衬线字体',
    'fontCategorySerif': '衬线字体',
    'fontCategoryChinese': '中文字体',
    'hideSeconds': '隐藏秒',
    'showDate': '显示日期',
    'showDateCountdown': '显示日期倒计时',
    'dateFontRatio': '日期字体比例',
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
    'themesCyberpunk': '赛博朋克',
    'themesMinimal': '极简白',
    'themesRetro': '复古绿屏',
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
    
    // 校准面板
    'calibrationTitle': '时间校准',
    'calibrationDirection': '校准方向',
    'calibrationFast': '调快（超前）',
    'calibrationSlow': '调慢（滞后）',
    'calibrationAmount': '校准量（秒）',
    'calibrationStandardTime': '标准时间（系统）',
    'calibrationCalibratedTime': '校准后时间',
    'calibrationOffset': '偏移量',
    'calibrationReset': '重置',
    'calibrationApply': '应用校准',
    
    // 闹钟和倒计时面板
    'alarmCountdownTitle': '闹钟 & 倒计时',
    'alarmTab': '闹钟',
    'countdownTab': '倒计时',
    'alarmEnable': '启用闹钟',
    'alarmTime': '闹钟时间',
    'alarmWillRing': '闹钟将在 {time} 响起',
    'countdownHours': '时',
    'countdownMinutes': '分',
    'countdownSeconds': '秒',
    'countdownStart': '开始',
    'countdownContinue': '继续',
    'countdownPause': '暂停',
    'countdownReset': '重置',
    'countdownPaused': '已暂停',
    'countdownFinished': '倒计时结束！',
    
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
    'fontCategoryMonospace': 'Monospace',
    'fontCategorySansSerif': 'Sans-serif',
    'fontCategorySerif': 'Serif',
    'fontCategoryChinese': 'Chinese',
    'hideSeconds': 'Hide Seconds',
    'showDate': 'Show Date',
    'showDateCountdown': 'Show Date Countdown',
    'dateFontRatio': 'Date Font Ratio',
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
    'themesCyberpunk': 'Cyberpunk',
    'themesMinimal': 'Minimal',
    'themesRetro': 'Retro',
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
    
    // 校准面板
    'calibrationTitle': 'Time Calibration',
    'calibrationDirection': 'Calibration Direction',
    'calibrationFast': 'Speed Up (Ahead)',
    'calibrationSlow': 'Slow Down (Behind)',
    'calibrationAmount': 'Calibration Amount (seconds)',
    'calibrationStandardTime': 'Standard Time (System)',
    'calibrationCalibratedTime': 'Calibrated Time',
    'calibrationOffset': 'Offset',
    'calibrationReset': 'Reset',
    'calibrationApply': 'Apply Calibration',
    
    // 闹钟和倒计时面板
    'alarmCountdownTitle': 'Alarm & Countdown',
    'alarmTab': 'Alarm',
    'countdownTab': 'Countdown',
    'alarmEnable': 'Enable Alarm',
    'alarmTime': 'Alarm Time',
    'alarmWillRing': 'Alarm will ring at {time}',
    'countdownHours': 'Hours',
    'countdownMinutes': 'Minutes',
    'countdownSeconds': 'Seconds',
    'countdownStart': 'Start',
    'countdownContinue': 'Continue',
    'countdownPause': 'Pause',
    'countdownReset': 'Reset',
    'countdownPaused': 'Paused',
    'countdownFinished': 'Countdown finished!',
    
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

// 获取主题名称翻译
export function getThemeName(language: Language, themeId: string): string {
  const themeMap: Record<string, string> = {
    'cyberpunk': t(language, 'themesCyberpunk'),
    'minimal': t(language, 'themesMinimal'),
    'retro': t(language, 'themesRetro'),
  };
  return themeMap[themeId] || themeId;
}
