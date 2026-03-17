/**
 * 声音管理模块
 * 提供多种倒计时结束声音选择
 */

export type SoundType = 'beep' | 'bell' | 'chime' | 'digital' | 'alarm' | 'mute';

export interface SoundOption {
  id: SoundType;
  label: string; // 中文标签
  labelEn: string; // 英文标签
  description: string; // 中文描述
  descriptionEn: string; // 英文描述
}

export const SOUND_OPTIONS: SoundOption[] = [
  {
    id: 'beep',
    label: '电子提示音',
    labelEn: 'Beep',
    description: '简单的电子提示音',
    descriptionEn: 'Simple electronic beep',
  },
  {
    id: 'bell',
    label: '钟声',
    labelEn: 'Bell',
    description: '清脆的钟声',
    descriptionEn: 'Clear bell sound',
  },
  {
    id: 'chime',
    label: '风铃',
    labelEn: 'Chime',
    description: '柔和的风铃声',
    descriptionEn: 'Gentle chime sound',
  },
  {
    id: 'digital',
    label: '数字警报',
    labelEn: 'Digital',
    description: '现代数字警报声',
    descriptionEn: 'Modern digital alarm',
  },
  {
    id: 'alarm',
    label: '传统闹钟',
    labelEn: 'Alarm',
    description: '传统闹钟铃声',
    descriptionEn: 'Traditional alarm bell',
  },
  {
    id: 'mute',
    label: '静音',
    labelEn: 'Mute',
    description: '无声提醒',
    descriptionEn: 'Silent reminder',
  },
];

/**
 * 生成不同类型的声音
 */
export function playSound(soundType: SoundType, duration: number = 1.5): void {
  if (soundType === 'mute') return;

  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    switch (soundType) {
      case 'beep':
        playBeep(audioContext, duration);
        break;
      case 'bell':
        playBell(audioContext, duration);
        break;
      case 'chime':
        playChime(audioContext, duration);
        break;
      case 'digital':
        playDigital(audioContext, duration);
        break;
      case 'alarm':
        playAlarm(audioContext, duration);
        break;
    }
  } catch (error) {
    console.error('Failed to play sound:', error);
  }
}

/**
 * 简单电子提示音
 */
function playBeep(audioContext: AudioContext, duration: number): void {
  const now = audioContext.currentTime;
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.value = 800;
  oscillator.type = 'sine';
  
  gainNode.gain.setValueAtTime(0.3, now);
  gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);
  
  oscillator.start(now);
  oscillator.stop(now + duration);
}

/**
 * 钟声
 */
function playBell(audioContext: AudioContext, duration: number): void {
  const now = audioContext.currentTime;
  
  // 创建多个频率的钟声
  const frequencies = [800, 1200, 1600];
  
  frequencies.forEach((freq, index) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = freq;
    oscillator.type = 'sine';
    
    const delay = index * 0.1;
    gainNode.gain.setValueAtTime(0.2, now + delay);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + delay + duration);
    
    oscillator.start(now + delay);
    oscillator.stop(now + delay + duration);
  });
}

/**
 * 风铃声
 */
function playChime(audioContext: AudioContext, duration: number): void {
  const now = audioContext.currentTime;
  
  // 和弦：C E G
  const frequencies = [262, 330, 392];
  
  frequencies.forEach((freq, index) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = freq;
    oscillator.type = 'triangle';
    
    const delay = index * 0.05;
    gainNode.gain.setValueAtTime(0.15, now + delay);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + delay + duration * 0.8);
    
    oscillator.start(now + delay);
    oscillator.stop(now + delay + duration * 0.8);
  });
}

/**
 * 现代数字警报声
 */
function playDigital(audioContext: AudioContext, duration: number): void {
  const now = audioContext.currentTime;
  const beepDuration = 0.2;
  const pauseDuration = 0.1;
  const pattern = [600, 800, 600, 800];
  
  let currentTime = now;
  pattern.forEach(freq => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = freq;
    oscillator.type = 'square';
    
    gainNode.gain.setValueAtTime(0.25, currentTime);
    gainNode.gain.setValueAtTime(0, currentTime + beepDuration);
    
    oscillator.start(currentTime);
    oscillator.stop(currentTime + beepDuration);
    
    currentTime += beepDuration + pauseDuration;
  });
}

/**
 * 传统闹钟铃声
 */
function playAlarm(audioContext: AudioContext, duration: number): void {
  const now = audioContext.currentTime;
  const beepDuration = 0.15;
  const pauseDuration = 0.1;
  
  let currentTime = now;
  const endTime = now + duration;
  
  // 交替的两个频率
  const frequencies = [1000, 800];
  let freqIndex = 0;
  
  while (currentTime < endTime) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequencies[freqIndex % 2];
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, currentTime);
    gainNode.gain.setValueAtTime(0, currentTime + beepDuration);
    
    oscillator.start(currentTime);
    oscillator.stop(currentTime + beepDuration);
    
    currentTime += beepDuration + pauseDuration;
    freqIndex++;
  }
}

/**
 * 屏幕闪烁效果
 */
export function screenFlash(bgColor: string, duration: number = 1.5, flashCount: number = 5): void {
  // 创建一个全屏闪烁覆盖层
  const flashOverlay = document.createElement('div');
  flashOverlay.id = 'screen-flash-overlay';
  flashOverlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 9999;
    pointer-events: none;
    mix-blend-mode: screen;
  `;
  
  document.body.appendChild(flashOverlay);
  
  // 检测背景颜色亮度
  const r = parseInt(bgColor.slice(1, 3), 16);
  const g = parseInt(bgColor.slice(3, 5), 16);
  const b = parseInt(bgColor.slice(5, 7), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  
  // 亮色背景闪烁为深色，深色背景闪烁为亮色
  const flashColor = brightness > 128 ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)';
  const flashInterval = (duration * 1000) / (flashCount * 2);
  
  let flashIndex = 0;
  const flashTimer = setInterval(() => {
    if (flashIndex >= flashCount * 2) {
      clearInterval(flashTimer);
      flashOverlay.remove();
      return;
    }
    
    flashOverlay.style.backgroundColor = flashIndex % 2 === 0 ? flashColor : 'transparent';
    flashIndex++;
  }, flashInterval);
}

/**
 * 获取声音标签
 */
export function getSoundLabel(soundType: SoundType, language: 'zh' | 'en' = 'zh'): string {
  const option = SOUND_OPTIONS.find(opt => opt.id === soundType);
  return option ? (language === 'zh' ? option.label : option.labelEn) : soundType;
}

/**
 * 获取声音描述
 */
export function getSoundDescription(soundType: SoundType, language: 'zh' | 'en' = 'zh'): string {
  const option = SOUND_OPTIONS.find(opt => opt.id === soundType);
  return option ? (language === 'zh' ? option.description : option.descriptionEn) : '';
}
