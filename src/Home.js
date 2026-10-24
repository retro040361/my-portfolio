import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import HomeIntro from './HomeIntro';

// 定義首頁的動畫效果
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // 每個子元件動畫延遲 0.1 秒
    },
  },
};

const itemVariants = {
  hidden: { y: -20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
    },
  },
};

// 開場動畫每個 session 只自動播放一次（sessionStorage 在隱私模式可能無法存取）
const INTRO_KEY = 'introPlayed';

const hasPlayedIntro = () => {
  try {
    return sessionStorage.getItem(INTRO_KEY) === 'true';
  } catch {
    return false;
  }
};

const Home = () => {
  const [showIntro, setShowIntro] = useState(() => !hasPlayedIntro());

  const handleIntroComplete = useCallback(() => {
    try {
      sessionStorage.setItem(INTRO_KEY, 'true');
    } catch {
      // 無法儲存時下次仍會播放開場動畫
    }
    setShowIntro(false);
  }, []);

  return (
    <>
      <AnimatePresence>
        {showIntro && <HomeIntro onComplete={handleIntroComplete} />}
      </AnimatePresence>

      {!showIntro && (
        <motion.div
          className="home-container"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <div className="hero-section">
            <motion.span className="path-label" variants={itemVariants}>retro@space:~$ whoami</motion.span>
            <motion.h1 className="glitch" data-text="RETRO//SPACE" variants={itemVariants}>RETRO//SPACE</motion.h1>
            <motion.p className="hero-intro" variants={itemVariants}>
              Work · Life · No Balance
            </motion.p>
            <motion.button
              type="button"
              className="hero-reboot"
              variants={itemVariants}
              onClick={() => setShowIntro(true)}
            >
              $ sudo reboot
            </motion.button>
          </div>
        </motion.div>
      )}
    </>
  );
};

export default Home;
