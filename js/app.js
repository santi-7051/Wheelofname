/**
 * Classroom Wheel of Names - Core App Controller
 * Orchestrates Wheel, Sound, Confetti, Storage, Modals, and Classroom Activities.
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const wheelCanvas = document.getElementById('wheelCanvas');
  const spinBtn = document.getElementById('spinBtn');
  const namesTextarea = document.getElementById('namesTextarea');
  const studentCountBadge = document.getElementById('studentCountBadge');
  const classSelect = document.getElementById('classSelect');
  const newClassBtn = document.getElementById('newClassBtn');
  const renameClassBtn = document.getElementById('renameClassBtn');
  const deleteClassBtn = document.getElementById('deleteClassBtn');
  const shuffleBtn = document.getElementById('shuffleBtn');
  const sortBtn = document.getElementById('sortBtn');
  const clearListBtn = document.getElementById('clearListBtn');
  const fullscreenBtn = document.getElementById('fullscreenBtn');
  const soundToggleBtn = document.getElementById('soundToggleBtn');
  const soundIcon = document.getElementById('soundIcon');
  const groupMakerBtn = document.getElementById('groupMakerBtn');
  const quickPickBtn = document.getElementById('quickPickBtn');

  // Tabs
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');
  const historyList = document.getElementById('historyList');
  const historyBadge = document.getElementById('historyBadge');
  const clearHistoryBtn = document.getElementById('clearHistoryBtn');
  const exportHistoryBtn = document.getElementById('exportHistoryBtn');

  // Winner Modal
  const winnerModal = document.getElementById('winnerModal');
  const winnerNameDisplay = document.getElementById('winnerNameDisplay');
  const removeWinnerBtn = document.getElementById('removeWinnerBtn');
  const keepWinnerBtn = document.getElementById('keepWinnerBtn');
  const spinAgainBtn = document.getElementById('spinAgainBtn');

  // Group Maker Modal
  const groupModal = document.getElementById('groupModal');
  const closeGroupModalBtn = document.getElementById('closeGroupModalBtn');
  const numGroupsSelect = document.getElementById('numGroupsSelect');
  const generateGroupsBtn = document.getElementById('generateGroupsBtn');
  const groupsResultContainer = document.getElementById('groupsResultContainer');
  const copyGroupsBtn = document.getElementById('copyGroupsBtn');

  // Quick Pick Modal
  const quickPickModal = document.getElementById('quickPickModal');
  const closeQuickPickModalBtn = document.getElementById('closeQuickPickModalBtn');
  const quickPickDisplay = document.getElementById('quickPickDisplay');
  const pickAnotherBtn = document.getElementById('pickAnotherBtn');

  // Settings Controls
  const spinDurationInput = document.getElementById('spinDurationInput');
  const spinDurationValue = document.getElementById('spinDurationValue');
  const soundSettingToggle = document.getElementById('soundSettingToggle');
  const confettiSettingToggle = document.getElementById('confettiSettingToggle');
  const paletteSelect = document.getElementById('paletteSelect');

  let currentWinnerName = '';
  let currentWinnerIndex = -1;

  // Initialize Wheel Engine
  const wheel = new WheelEngine(wheelCanvas, {
    onSpinStart: () => {
      spinBtn.disabled = true;
      spinBtn.innerHTML = '<span>🌀</span> กำลังสุ่ม...';
    },
    onSpinEnd: (winnerName, winnerIndex) => {
      spinBtn.disabled = false;
      spinBtn.innerHTML = '<span>🎯</span> หมุนสุ่มชื่อ (SPIN)';
      currentWinnerName = winnerName;
      currentWinnerIndex = winnerIndex;
      handleWinnerAnnouncement(winnerName);
    },
    onTick: (speedFactor) => {
      window.soundEngine.playTick(speedFactor);
    }
  });

  // Load and apply settings
  function applySettings() {
    const settings = window.storageManager.settings;
    wheel.setSpinDuration(settings.spinDuration);
    wheel.setPalette(settings.palette);

    if (spinDurationInput) {
      spinDurationInput.value = settings.spinDuration;
      spinDurationValue.textContent = `${settings.spinDuration} วินาที`;
    }
    if (soundSettingToggle) soundSettingToggle.checked = settings.soundEnabled;
    if (confettiSettingToggle) confettiSettingToggle.checked = settings.showConfetti;
    if (paletteSelect) paletteSelect.value = settings.palette;

    window.soundEngine.setMuted(!settings.soundEnabled);
    updateSoundIconButton(settings.soundEnabled);
  }

  function updateSoundIconButton(enabled) {
    if (soundIcon) {
      soundIcon.textContent = enabled ? '🔊' : '🔇';
    }
  }

  // Populate Classes Dropdown
  function refreshClassDropdown() {
    const classes = window.storageManager.classes;
    const active = window.storageManager.activeClassName;
    classSelect.innerHTML = '';

    Object.keys(classes).forEach(className => {
      const opt = document.createElement('option');
      opt.value = className;
      opt.textContent = `🏫 ${className} (${classes[className].length} คน)`;
      if (className === active) opt.selected = true;
      classSelect.appendChild(opt);
    });

    loadCurrentClassData();
  }

  function loadCurrentClassData() {
    const names = window.storageManager.getActiveNames();
    namesTextarea.value = names.join('\n');
    updateStudentCount(names.length);
    wheel.setNames(names);
  }

  function updateStudentCount(count) {
    if (studentCountBadge) {
      studentCountBadge.textContent = `${count} คน`;
    }
  }

  // Save Textarea changes to current class
  function saveCurrentNamesFromTextarea() {
    const raw = namesTextarea.value;
    const names = raw.split(/\r?\n/).map(n => n.trim()).filter(n => n.length > 0);
    window.storageManager.saveActiveNames(names);
    updateStudentCount(names.length);
    wheel.setNames(names);
    refreshClassDropdown();
  }

  // Winner Celebration Handler
  function handleWinnerAnnouncement(name) {
    window.storageManager.addWinner(name);
    renderHistory();

    if (window.storageManager.settings.soundEnabled) {
      window.soundEngine.playWinner();
    }

    if (window.storageManager.settings.showConfetti) {
      window.confettiEngine.burst(4000);
    }

    winnerNameDisplay.textContent = name;
    winnerModal.classList.add('open');
  }

  // History Render
  function renderHistory() {
    const history = window.storageManager.history;
    if (historyBadge) historyBadge.textContent = history.length;

    if (!historyList) return;
    if (history.length === 0) {
      historyList.innerHTML = '<div class="history-empty">ยังไม่มีประวัติการสุ่ม</div>';
      return;
    }

    historyList.innerHTML = history.map((item, idx) => `
      <div class="history-item">
        <div class="history-winner-name">#${history.length - idx}. ${escapeHtml(item.name)}</div>
        <div class="history-meta">
          <span>🏫 ${escapeHtml(item.className || '')}</span>
          <span>⏰ ${item.time}</span>
        </div>
      </div>
    `).join('');
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // Event Listeners - Spinning
  spinBtn.addEventListener('click', () => {
    window.soundEngine.init();
    wheel.spin();
  });

  wheelCanvas.addEventListener('click', () => {
    window.soundEngine.init();
    wheel.spin();
  });

  // Textarea input
  let textareaDebounceTimer = null;
  namesTextarea.addEventListener('input', () => {
    clearTimeout(textareaDebounceTimer);
    textareaDebounceTimer = setTimeout(() => {
      saveCurrentNamesFromTextarea();
    }, 300);
  });

  // Class Selection
  classSelect.addEventListener('change', (e) => {
    window.soundEngine.playClick();
    window.storageManager.setActiveClassName(e.target.value);
    loadCurrentClassData();
  });

  // Add Class
  newClassBtn.addEventListener('click', () => {
    window.soundEngine.playClick();
    const name = prompt('กรุณาตั้งชื่อห้องเรียนใหม่ (เช่น ม.3/2, ห้องดนตรี):');
    if (name && name.trim()) {
      if (window.storageManager.createClass(name.trim())) {
        refreshClassDropdown();
      } else {
        alert('มีห้องเรียนชื่อนี้อยู่แล้ว');
      }
    }
  });

  // Rename Class
  renameClassBtn.addEventListener('click', () => {
    window.soundEngine.playClick();
    const current = window.storageManager.activeClassName;
    const newName = prompt(`เปลี่ยนชื่อห้องเรียน "${current}" เป็น:`, current);
    if (newName && newName.trim() && newName.trim() !== current) {
      if (window.storageManager.renameClass(current, newName.trim())) {
        refreshClassDropdown();
      } else {
        alert('ชื่อห้องเรียนซ้ำ หรือไม่ถูกต้อง');
      }
    }
  });

  // Delete Class
  deleteClassBtn.addEventListener('click', () => {
    window.soundEngine.playClick();
    const current = window.storageManager.activeClassName;
    if (Object.keys(window.storageManager.classes).length <= 1) {
      alert('ไม่สามารถลบห้องเรียนสุดท้ายได้');
      return;
    }
    if (confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบห้องเรียน "${current}"?`)) {
      window.storageManager.deleteClass(current);
      refreshClassDropdown();
    }
  });

  // Shuffle Names
  shuffleBtn.addEventListener('click', () => {
    window.soundEngine.playShuffle();
    const names = window.storageManager.getActiveNames();
    for (let i = names.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [names[i], names[j]] = [names[j], names[i]];
    }
    window.storageManager.saveActiveNames(names);
    loadCurrentClassData();
  });

  // Sort Names A-Z / Thai
  sortBtn.addEventListener('click', () => {
    window.soundEngine.playClick();
    const names = window.storageManager.getActiveNames();
    names.sort((a, b) => a.localeCompare(b, 'th'));
    window.storageManager.saveActiveNames(names);
    loadCurrentClassData();
  });

  // Clear List
  clearListBtn.addEventListener('click', () => {
    window.soundEngine.playClick();
    if (confirm('คุณต้องการล้างรายชื่อทั้งหมดในห้องนี้ใช่หรือไม่?')) {
      window.storageManager.saveActiveNames([]);
      loadCurrentClassData();
    }
  });

  // Sound Toggle Button
  soundToggleBtn.addEventListener('click', () => {
    const current = window.storageManager.settings.soundEnabled;
    const newState = !current;
    window.storageManager.saveSettings({ soundEnabled: newState });
    window.soundEngine.setMuted(!newState);
    if (soundSettingToggle) soundSettingToggle.checked = newState;
    updateSoundIconButton(newState);
    if (newState) window.soundEngine.playClick();
  });

  // Fullscreen Mode
  fullscreenBtn.addEventListener('click', () => {
    window.soundEngine.playClick();
    toggleFullScreen();
  });

  function toggleFullScreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      document.body.classList.add('is-fullscreen');
      fullscreenBtn.innerHTML = '<span>🗗</span> ย่อหน้าจอ';
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      document.body.classList.remove('is-fullscreen');
      fullscreenBtn.innerHTML = '<span>⛶</span> เต็มจอ (TV/โปรเจกเตอร์)';
    }
  }

  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) {
      document.body.classList.remove('is-fullscreen');
      fullscreenBtn.innerHTML = '<span>⛶</span> เต็มจอ (TV/โปรเจกเตอร์)';
    } else {
      document.body.classList.add('is-fullscreen');
      fullscreenBtn.innerHTML = '<span>🗗</span> ย่อหน้าจอ';
    }
    setTimeout(() => wheel.handleResize(), 150);
  });

  // Winner Actions
  removeWinnerBtn.addEventListener('click', () => {
    window.soundEngine.playRemove();
    const names = window.storageManager.getActiveNames();
    const idx = names.indexOf(currentWinnerName);
    if (idx !== -1) {
      names.splice(idx, 1);
    } else if (currentWinnerIndex >= 0 && currentWinnerIndex < names.length) {
      names.splice(currentWinnerIndex, 1);
    }
    window.storageManager.saveActiveNames(names);
    loadCurrentClassData();
    winnerModal.classList.remove('open');
  });

  keepWinnerBtn.addEventListener('click', () => {
    window.soundEngine.playClick();
    winnerModal.classList.remove('open');
  });

  spinAgainBtn.addEventListener('click', () => {
    window.soundEngine.playClick();
    winnerModal.classList.remove('open');
    setTimeout(() => {
      wheel.spin();
    }, 200);
  });

  // Tabs Switching
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      window.soundEngine.playClick();
      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetId = btn.getAttribute('data-tab');
      const targetPane = document.getElementById(targetId);
      if (targetPane) targetPane.classList.add('active');
    });
  });

  // Clear History
  clearHistoryBtn.addEventListener('click', () => {
    window.soundEngine.playClick();
    if (confirm('คุณต้องการลบประวัติการสุ่มทั้งหมดใช่หรือไม่?')) {
      window.storageManager.clearHistory();
      renderHistory();
    }
  });

  // Export History
  exportHistoryBtn.addEventListener('click', () => {
    window.soundEngine.playClick();
    const history = window.storageManager.history;
    if (history.length === 0) {
      alert('ยังไม่มีข้อมูลประวัติให้ส่งออก');
      return;
    }
    const textContent = history.map(h => `${h.date} ${h.time} | ห้อง: ${h.className} | ผู้โชคดี: ${h.name}`).join('\n');
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `รายชื่อผู้โชคดี_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  });

  // Group Maker
  groupMakerBtn.addEventListener('click', () => {
    window.soundEngine.playClick();
    groupModal.classList.add('open');
    generateClassroomGroups();
  });

  closeGroupModalBtn.addEventListener('click', () => {
    groupModal.classList.remove('open');
  });

  generateGroupsBtn.addEventListener('click', () => {
    window.soundEngine.playShuffle();
    generateClassroomGroups();
  });

  function generateClassroomGroups() {
    const numGroups = parseInt(numGroupsSelect.value, 10) || 2;
    const names = [...window.storageManager.getActiveNames()];

    if (names.length === 0) {
      groupsResultContainer.innerHTML = '<div style="color:red; text-align:center; padding:1rem;">ไม่มีรายชื่อนักเรียนสำหรับแบ่งกลุ่ม</div>';
      return;
    }

    // Shuffle names randomly
    for (let i = names.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [names[i], names[j]] = [names[j], names[i]];
    }

    // Distribute into buckets
    const groups = Array.from({ length: numGroups }, () => []);
    names.forEach((name, i) => {
      groups[i % numGroups].push(name);
    });

    const groupColors = ['#0284c7', '#059669', '#d97706', '#dc2626', '#7c3aed', '#db2777', '#0891b2', '#4f46e5'];

    groupsResultContainer.innerHTML = groups.map((grp, idx) => `
      <div class="group-card" style="border-top: 4px solid ${groupColors[idx % groupColors.length]}">
        <div class="group-card-header" style="color: ${groupColors[idx % groupColors.length]}">
          👥 กลุ่มที่ ${idx + 1} (${grp.length} คน)
        </div>
        <ol class="group-members-list">
          ${grp.map(m => `<li>${escapeHtml(m)}</li>`).join('')}
        </ol>
      </div>
    `).join('');
  }

  copyGroupsBtn.addEventListener('click', () => {
    window.soundEngine.playClick();
    const groupCards = groupsResultContainer.querySelectorAll('.group-card');
    if (groupCards.length === 0) return;

    let text = `📋 ผลการสุ่มแบ่งกลุ่มห้อง ${window.storageManager.activeClassName}\n\n`;
    groupCards.forEach(card => {
      const header = card.querySelector('.group-card-header').textContent.trim();
      const items = Array.from(card.querySelectorAll('li')).map((li, i) => `${i + 1}. ${li.textContent.trim()}`).join('\n');
      text += `=== ${header} ===\n${items}\n\n`;
    });

    navigator.clipboard.writeText(text).then(() => {
      alert('คัดลอกผลการแบ่งกลุ่มเรียบร้อยแล้ว!');
    });
  });

  // Quick Pick Modal
  quickPickBtn.addEventListener('click', () => {
    window.soundEngine.playClick();
    quickPickModal.classList.add('open');
    performQuickPick();
  });

  closeQuickPickModalBtn.addEventListener('click', () => {
    quickPickModal.classList.remove('open');
  });

  pickAnotherBtn.addEventListener('click', () => {
    performQuickPick();
  });

  function performQuickPick() {
    window.soundEngine.playShuffle();
    const names = window.storageManager.getActiveNames();
    if (names.length === 0) {
      quickPickDisplay.textContent = 'ไม่มีรายชื่อนักเรียน';
      return;
    }

    quickPickDisplay.textContent = 'กำลังสุ่ม...';
    let counter = 0;
    const interval = setInterval(() => {
      const randomIdx = Math.floor(Math.random() * names.length);
      quickPickDisplay.textContent = names[randomIdx];
      window.soundEngine.playTick(1.2);
      counter++;
      if (counter > 15) {
        clearInterval(interval);
        const finalWinner = names[Math.floor(Math.random() * names.length)];
        quickPickDisplay.textContent = finalWinner;
        window.soundEngine.playWinner();
        window.confettiEngine.burst(2500);
        window.storageManager.addWinner(finalWinner);
        renderHistory();
      }
    }, 70);
  }

  // Settings Events
  spinDurationInput.addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10);
    spinDurationValue.textContent = `${val} วินาที`;
    wheel.setSpinDuration(val);
    window.storageManager.saveSettings({ spinDuration: val });
  });

  soundSettingToggle.addEventListener('change', (e) => {
    const enabled = e.target.checked;
    window.storageManager.saveSettings({ soundEnabled: enabled });
    window.soundEngine.setMuted(!enabled);
    updateSoundIconButton(enabled);
    if (enabled) window.soundEngine.playClick();
  });

  confettiSettingToggle.addEventListener('change', (e) => {
    window.storageManager.saveSettings({ showConfetti: e.target.checked });
  });

  paletteSelect.addEventListener('change', (e) => {
    window.soundEngine.playClick();
    const pal = e.target.value;
    wheel.setPalette(pal);
    window.storageManager.saveSettings({ palette: pal });
  });

  // Keyboard Shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;

    if (e.code === 'Space' || e.code === 'Enter') {
      e.preventDefault();
      if (!wheel.isSpinning) {
        if (winnerModal.classList.contains('open')) {
          winnerModal.classList.remove('open');
        }
        window.soundEngine.init();
        wheel.spin();
      }
    } else if (e.code === 'KeyF') {
      toggleFullScreen();
    } else if (e.code === 'Escape') {
      winnerModal.classList.remove('open');
      groupModal.classList.remove('open');
      quickPickModal.classList.remove('open');
    }
  });

  // Initial Load
  applySettings();
  refreshClassDropdown();
  renderHistory();
});
