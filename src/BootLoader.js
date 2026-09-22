import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

// 系統開機 Initial 跑馬燈資訊
const BOOT_LOGS = [
  '  ____       _roOS  v1.0.0',
  ' |  _ \\ ___| |_ _ __ ___   ___  ___ ',
  ' | |_) / _ \\ __| \'__/ _ \\ / _ \\/ __|',
  ' |  _ <  __/ |_| | | (_) | (_) \\__ \\',
  ' |_| \\_\\___|\\__|_|  \\___/ \\___/|___/',
  '',
  '[   0.000000] Booting Linux kernel on CPU0...',
  '[   0.048201] CPU0: Intel(R) Core(TM) i9-14900K @ 3.20GHz',
  '[   0.124093] Memory: 32768MB system RAM initialized.',
  '[   0.312948] ACPI: Core revision 20260719',
  '[   0.589204] SCSI subsystem initialized.',
  '[   0.720930] usbcore: registered new interface driver usbfs',
  '[   1.020491] Serial: 8250/16550 driver, 4 ports, IRQ sharing enabled',
  '[   1.218943] EXT4-fs (sda1): mounted filesystem with ordered data mode.',
  '[   1.450912] Initializing RetroOS kernel modules...',
  '[   1.680204] Loading network drivers: e1000e [ OK ]',
  '[   1.890938] Checking filesystem disk integrity: 100% [ OK ]',
  '[   2.100912] Mounting local filesystems... [ OK ]',
  '[   2.340129] Starting system services...',
  '[   2.560203] Starting Network Service Manager... [ OK ]',
  '[   2.780912] Starting Synopsys Workstation Service Client... [ OK ]',
  '[   3.020129] Loading graphics display server (Xorg)... [ OK ]',
  '[   4.023462] Flying to the biundary of the known universe ... [ OK ]',
  '[   5.495872] Loading graphics display server (Xorg)... [ OK ]',
  '[   6.038054] Welcome to Retro\'s Workspace terminal login.',
  '[   6.326883] Launching RetroOS Desktop login manager...'
];

const BootLoader = ({ onComplete }) => {
  const [visibleLines, setVisibleLines] = useState([]);
  const [phase, setPhase] = useState('boot'); // 'boot' | 'login' | 'auth'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const terminalEndRef = useRef(null);

  // 1. 跑開機馬燈
  useEffect(() => {
    let timerId;
    let currentLineIdx = 0;
    
    const printLine = () => {
      if (currentLineIdx < BOOT_LOGS.length) {
        setVisibleLines(prev => [...prev, BOOT_LOGS[currentLineIdx]]);
        currentLineIdx++;
        // 模擬隨機載入延遲，有些行跑比較快，有些比較慢
        const delay = Math.random() * 120 + 40;
        timerId = setTimeout(printLine, delay);
      } else {
        // 開機日誌跑完，1秒後進入登入階段
        timerId = setTimeout(() => {
          setPhase('login');
        }, 800);
      }
    };
    
    printLine();

    return () => {
      clearTimeout(timerId);
    };
  }, []);

  // 當日誌更新時，自動滾動到底部
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [visibleLines]);

  // 2. 自動輸入帳號與密碼
  useEffect(() => {
    if (phase !== 'login') return;

    let timerId;
    const targetUser = 'Retr0';
    const targetPass = '******';
    let userIndex = 0;
    let passIndex = 0;

    // 清空殘留輸入，防止 Strict Mode 殘留
    setUsername('');
    setPassword('');

    // 自動打字帳號
    const typeUsername = () => {
      if (userIndex < targetUser.length) {
        const char = targetUser[userIndex];
        setUsername(prev => prev + char);
        userIndex++;
        timerId = setTimeout(typeUsername, 150); // 每個字元間隔 150ms
      } else {
        // 帳號打完後，等 500ms 開始打密碼
        timerId = setTimeout(typePassword, 500);
      }
    };

    // 自動打字密碼
    const typePassword = () => {
      if (passIndex < targetPass.length) {
        const char = targetPass[passIndex];
        setPassword(prev => prev + char);
        passIndex++;
        timerId = setTimeout(typePassword, 150);
      } else {
        // 密碼打完後，等 600ms 點擊登入
        timerId = setTimeout(submitLogin, 600);
      }
    };

    const submitLogin = () => {
      setIsSubmitting(true);
      // 顯示驗證中動畫，1秒後切換至驗證成功階段
      timerId = setTimeout(() => {
        setPhase('auth');
      }, 1000);
    };

    // 啟動打字序列
    timerId = setTimeout(typeUsername, 600);

    return () => {
      clearTimeout(timerId);
    };
  }, [phase]);

  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // 3. 當驗證成功 (phase === 'auth') 時，延遲 800ms 呼叫 onComplete 完成登入跳轉
  useEffect(() => {
    if (phase !== 'auth') return;

    const timerId = setTimeout(() => {
      onCompleteRef.current?.();
    }, 800);

    return () => {
      clearTimeout(timerId);
    };
  }, [phase]);

  return (
    <div className="boot-loader-overlay">
      {/* CRT 螢幕掃描線特效 */}
      <div className="crt-overlay"></div>

      <div className="boot-terminal-container">
        {/* 開機日誌顯示區 */}
        <div className="terminal-body">
          {visibleLines.map((line, idx) => (
            <div key={idx} className="terminal-line">
              {line}
            </div>
          ))}
          {phase === 'boot' && (
            <span className="terminal-cursor"></span>
          )}
          <div ref={terminalEndRef} />
        </div>

        {/* 登入視窗 */}
        <AnimatePresence>
          {phase !== 'boot' && (
            <div className="login-window-wrapper">
              <motion.div 
                className="retro-login-window"
                style={{ pointerEvents: 'auto' }}
                initial={{ scale: 0.8, opacity: 0, y: -20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0, y: 20 }}
                transition={{ type: 'spring', damping: 20, stiffness: 200 }}
              >
                {/* 視窗標題欄 */}
                <div className="login-window-header">
                  <span className="window-title">🔑 RetroOS Login Manager</span>
                  <div className="window-controls">
                    <span className="control-dot red"></span>
                    <span className="control-dot yellow"></span>
                    <span className="control-dot green"></span>
                  </div>
                </div>

                {/* 視窗內文 */}
                <div className="login-window-body">
                  {phase === 'login' ? (
                    <>
                      <div className="login-form-group">
                        <label className="login-label">USERNAME:</label>
                        <input 
                          type="text" 
                          value={username} 
                          readOnly 
                          className="login-input" 
                          placeholder="Enter username"
                        />
                      </div>
                      <div className="login-form-group">
                        <label className="login-label">PASSWORD:</label>
                        <input 
                          type="password" 
                          value={password} 
                          readOnly 
                          className="login-input" 
                          placeholder="••••••"
                        />
                      </div>
                      <button 
                        className={`login-submit-btn ${isSubmitting ? 'active' : ''}`}
                        disabled
                      >
                        {isSubmitting ? 'CONNECTING...' : 'LOGIN'}
                      </button>
                    </>
                  ) : (
                    <motion.div 
                      className="auth-status-container"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <div className="auth-success-icon">🟢</div>
                      <h3 className="auth-success-title">ACCESS GRANTED</h3>
                      <p className="auth-success-subtitle">Redirecting to Retro's Space...</p>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default BootLoader;
