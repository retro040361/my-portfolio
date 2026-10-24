import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FaGithub } from 'react-icons/fa';
import { LuLock } from 'react-icons/lu';
import { projectsData } from './data/projects';
import RetroModal from './shared/RetroModal';

// 動畫變量保持組件獨立性
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const Projects = () => {
  const [selectedProject, setSelectedProject] = useState(null);
  const closeModal = useCallback(() => setSelectedProject(null), []);

  return (
    <motion.div
      className="projects-container page"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div className="projects-header" variants={itemVariants}>
        <span className="path-label">~/projects</span>
        <h1 className="glitch" data-text="My Projects">My Projects</h1>
        <p className="projects-subtitle">無聊亂做＠＠</p>
      </motion.div>

      <div className="projects-grid">
        {projectsData.map(project => (
          <motion.button
            type="button"
            key={project.slug}
            className="project-card-wrapper card-button"
            variants={itemVariants}
            whileHover={{ y: -6, transition: { duration: 0.15, ease: 'easeOut' } }}
            onClick={() => setSelectedProject(project)}
          >
            <div className="project-card-glass">
              {/* 卡片橫幅 */}
              <div className="project-banner" style={{ background: project.gradient }}>
                <span className="code-banner">{project.slug}</span>
              </div>

              {/* 卡片內容 */}
              <div className="project-content">
                <h2 className="project-title">{project.title}</h2>
                <p className="project-desc line-clamp-3">{project.desc}</p>

                {/* 簡單特徵列（卡片只做預覽） */}
                <div className="project-tech-tags">
                  {project.tech.slice(0, 4).map(t => (
                    <span key={t} className="project-tech-tag">{t}</span>
                  ))}
                  {project.tech.length > 4 && <span className="project-tech-tag">+{project.tech.length - 4}</span>}
                </div>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {selectedProject && (
          <RetroModal title={`~/projects/${selectedProject.slug}`} onClose={closeModal}>
            {/* 頂部橫幅 */}
            <div className="modal-banner" style={{ background: selectedProject.gradient }}>
              <span className="code-banner code-banner-lg">{selectedProject.slug}</span>
            </div>

            {/* 內文主體 */}
            <div className="modal-body">
              <h2 className="modal-title">{selectedProject.title}</h2>
              <p className="modal-lead">{selectedProject.desc}</p>

              {/* 核心特色 */}
              <section className="modal-section">
                <h3 className="modal-section-heading">{'// key features'}</h3>
                <ul className="project-features-list">
                  {selectedProject.features.map(feat => (
                    <li key={feat}>{feat}</li>
                  ))}
                </ul>
              </section>

              {/* 技術棧 */}
              <section className="modal-section">
                <h3 className="modal-section-heading">{'// tech stack'}</h3>
                <div className="project-tech-tags">
                  {selectedProject.tech.map(t => (
                    <span key={t} className="project-tech-tag">{t}</span>
                  ))}
                </div>
              </section>

              <div className="modal-divider" />

              {/* 原始碼連結 */}
              {selectedProject.github ? (
                <a href={selectedProject.github} target="_blank" rel="noreferrer" className="project-repo-btn">
                  <FaGithub aria-hidden="true" /> 查看原始碼
                </a>
              ) : (
                <span className="project-private-badge">
                  <LuLock aria-hidden="true" /> 私人專案，原始碼未公開
                </span>
              )}
            </div>
          </RetroModal>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Projects;
