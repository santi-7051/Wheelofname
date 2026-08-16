/**
 * Classroom Wheel of Names - Storage & State Manager
 * Handles multi-classroom lists, history, and user settings with localStorage.
 */

const STORAGE_KEYS = {
  CLASSES: 'won_classroom_presets_v1',
  ACTIVE_CLASS: 'won_active_class_v1',
  HISTORY: 'won_winner_history_v1',
  SETTINGS: 'won_app_settings_v1'
};

const DEFAULT_PRESETS = {
  'ม.1/1': [
    'เด็กชายกิตติศักดิ์ มีชัย',
    'เด็กชายจิรภัทร สุขสมบูรณ์',
    'เด็กหญิงชลธิชา แก้วมณี',
    'เด็กหญิงณิชากร พงษ์สวัสดิ์',
    'เด็กชายธนากร แสงสุวรรณ',
    'เด็กหญิงนภัสสร รัตนโชติ',
    'เด็กชายปิติพัฒน์ เจริญพร',
    'เด็กหญิงภัทรวดี ทวีทรัพย์',
    'เด็กชายวรพล บุญประเสริฐ',
    'เด็กหญิงศิริพร บุญรักษา',
    'เด็กชายสิทธิโชค ยิ้มแย้ม',
    'เด็กหญิงอภิชญา ชัยชนะ',
    'เด็กชายอดิศร สมหมาย',
    'เด็กหญิงอรัญญา ทิพย์เกษร',
    'เด็กชายเอกรินทร์ เจริญสุข'
  ],
  'ม.2/3': [
    '1. ภัทรพล วัฒนกุล',
    '2. ธิษณามดี จิตเกษม',
    '3. วรเมธ กิตติพงศ์',
    '4. พิมพ์มาดา อัครเดช',
    '5. ชานนท์ สว่างอารมณ์',
    '6. ธนัชชา วงศ์สุวรรณ',
    '7. ศุภกร ประชาสุข',
    '8. กัญญาณัฐ พิพัฒนกิจ',
    '9. ภูริพัฒน์ โรจนวิทย์',
    '10. ณัฐธิดา เจริญรัตน์'
  ],
  'กลุ่มกิจกรรม (1-8)': [
    'กลุ่มที่ 1 - ทีมสิงโตทอง',
    'กลุ่มที่ 2 - ทีมนกอินทรี',
    'กลุ่มที่ 3 - ทีมหมีขาว',
    'กลุ่มที่ 4 - ทีมเสือดาว',
    'กลุ่มที่ 5 - ทีมโลมาสีคราม',
    'กลุ่มที่ 6 - ทีมมังกรไฟ',
    'กลุ่มที่ 7 - ทีมฟีนิกซ์',
    'กลุ่มที่ 8 - ทีมพญาอินทรีย์'
  ]
};

const DEFAULT_SETTINGS = {
  spinDuration: 6, // seconds
  soundEnabled: true,
  volume: 0.8,
  palette: 'sky_vibrant', // sky_vibrant, pastel, rainbow, neon, warm
  autoRemoveWinner: false,
  showConfetti: true
};

class StorageManager {
  constructor() {
    this.classes = this.loadClasses();
    this.activeClassName = this.loadActiveClassName();
    this.history = this.loadHistory();
    this.settings = this.loadSettings();
  }

  loadClasses() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CLASSES);
      if (data) {
        const parsed = JSON.parse(data);
        if (Object.keys(parsed).length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load classes from storage', e);
    }
    this.saveClasses(DEFAULT_PRESETS);
    return JSON.parse(JSON.stringify(DEFAULT_PRESETS));
  }

  saveClasses(classes) {
    try {
      localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(classes));
      this.classes = classes;
    } catch (e) {
      console.error('Failed to save classes to storage', e);
    }
  }

  loadActiveClassName() {
    try {
      const name = localStorage.getItem(STORAGE_KEYS.ACTIVE_CLASS);
      if (name && this.classes && this.classes[name]) return name;
    } catch (e) {}
    const keys = Object.keys(this.classes || DEFAULT_PRESETS);
    return keys[0] || 'ม.1/1';
  }

  setActiveClassName(name) {
    this.activeClassName = name;
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_CLASS, name);
    } catch (e) {}
  }

  getActiveNames() {
    if (this.classes && this.classes[this.activeClassName]) {
      return [...this.classes[this.activeClassName]];
    }
    return [...DEFAULT_PRESETS['ม.1/1']];
  }

  saveActiveNames(names) {
    if (!this.activeClassName) this.activeClassName = 'ห้องเรียนของฉัน';
    this.classes[this.activeClassName] = names.filter(n => n && n.trim() !== '');
    this.saveClasses(this.classes);
  }

  createClass(name, names = []) {
    if (!name || !name.trim()) return false;
    const cleanName = name.trim();
    this.classes[cleanName] = names.length > 0 ? names : ['นักเรียนคนที่ 1', 'นักเรียนคนที่ 2', 'นักเรียนคนที่ 3', 'นักเรียนคนที่ 4'];
    this.saveClasses(this.classes);
    this.setActiveClassName(cleanName);
    return true;
  }

  deleteClass(name) {
    if (Object.keys(this.classes).length <= 1) {
      return false; // Don't delete the only remaining class
    }
    delete this.classes[name];
    this.saveClasses(this.classes);
    const remaining = Object.keys(this.classes);
    this.setActiveClassName(remaining[0]);
    return true;
  }

  renameClass(oldName, newName) {
    if (!newName || !newName.trim() || oldName === newName) return false;
    const cleanNew = newName.trim();
    if (this.classes[cleanNew]) return false; // Already exists
    this.classes[cleanNew] = this.classes[oldName] || [];
    delete this.classes[oldName];
    this.saveClasses(this.classes);
    this.setActiveClassName(cleanNew);
    return true;
  }

  // History Management
  loadHistory() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
      if (data) return JSON.parse(data);
    } catch (e) {}
    return [];
  }

  saveHistory(history) {
    try {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
      this.history = history;
    } catch (e) {}
  }

  addWinner(name, className) {
    const item = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
      name,
      className: className || this.activeClassName,
      time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      date: new Date().toLocaleDateString('th-TH')
    };
    this.history.unshift(item);
    if (this.history.length > 200) this.history.pop();
    this.saveHistory(this.history);
    return item;
  }

  clearHistory() {
    this.history = [];
    this.saveHistory(this.history);
  }

  // Settings
  loadSettings() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (data) {
        return Object.assign({}, DEFAULT_SETTINGS, JSON.parse(data));
      }
    } catch (e) {}
    return Object.assign({}, DEFAULT_SETTINGS);
  }

  saveSettings(settings) {
    try {
      this.settings = Object.assign({}, this.settings, settings);
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(this.settings));
    } catch (e) {}
  }
}

window.storageManager = new StorageManager();
