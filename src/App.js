import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { LuSun, LuMoon, LuMenu, LuX } from 'react-icons/lu';
import Home from './Home';
import Blog from './Blog';
import BlogPost from './BlogPost';
import About from './About';
import Playground from './Playground';
import Projects from './Projects';
import { socialLinks } from './data/profile';
import './App.css';
import './styles/ui.css';
import './styles/dedsec.css';

const NAV_ITEMS = [
  { to: '/', label: 'Home', end: true },
  { to: '/about', label: 'About' },
  { to: '/projects', label: 'Projects' },
  { to: '/blog', label: 'Blog' },
  { to: '/playground', label: 'Playground' },
];

// 讀取初始主題：使用者上次的選擇 > 系統偏好（index.html 已先套用到 <html>）
const getInitialTheme = () => {
  const attr = document.documentElement.getAttribute('data-theme');
  return attr === 'light' || attr === 'dark' ? attr : 'dark';
};

const Navbar = ({ theme, onToggleTheme }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  // 換頁時自動收起手機選單並回到頁首
  useEffect(() => {
    setMenuOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <nav className="navbar">
      <NavLink to="/" className="logo">
        <span className="logo-prompt">~/</span>retro<span className="logo-cursor" />
      </NavLink>

      <div className="nav-actions">
        <ul className={`nav-links ${menuOpen ? 'is-open' : ''}`}>
          {NAV_ITEMS.map(item => (
            <li key={item.to}>
              <NavLink to={item.to} end={item.end} className={({ isActive }) => (isActive ? 'active' : '')}>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <motion.button
          onClick={onToggleTheme}
          className="theme-toggle-btn"
          title={theme === 'dark' ? '切換為淺色模式' : '切換為深色模式'}
          aria-label={theme === 'dark' ? '切換為淺色模式' : '切換為深色模式'}
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.1 }}
        >
          {theme === 'dark' ? <LuSun /> : <LuMoon />}
        </motion.button>

        <button
          type="button"
          className="nav-menu-btn"
          aria-label={menuOpen ? '關閉選單' : '開啟選單'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(open => !open)}
        >
          {menuOpen ? <LuX /> : <LuMenu />}
        </button>
      </div>
    </nav>
  );
};

const Footer = () => (
  <footer className="site-footer">
    <div className="footer-socials">
      {socialLinks.map(({ key, label, href, Icon }) => (
        <a key={key} href={href} target="_blank" rel="noreferrer" aria-label={label} title={label}>
          <Icon />
        </a>
      ))}
    </div>
    <p className="footer-terminal">
      <span className="footer-prompt">retro@space:~$</span> logout
    </p>
    <p className="footer-copy">© {new Date().getFullYear()} Retro · Built with React</p>
  </footer>
);

function App() {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('theme', next);
      } catch {
        // 無法儲存時只套用在本次瀏覽
      }
      return next;
    });
  };

  return (
    <Router>
      <div className="App">
        <Navbar theme={theme} onToggleTheme={toggleTheme} />

        {/* 頁面內容 */}
        <main className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:id" element={<BlogPost />} />
            <Route path="/playground" element={<Playground />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
