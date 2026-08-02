import React from 'react';
import { motion } from 'framer-motion';
import './App.css';

// 定義 stagger 容器動畫
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
    },
  },
};

// 定義子項目動畫 (從下方滑入並帶有彈性)
const itemVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
    },
  },
};

const About = () => {
  // 工作經歷資料
  const workExperience = [
    {
      period: '2024.09 - Present',
      role: 'Software R&D Engineer',
      company: 'Synopsys',
      desc: [
        'L2 engineer.',
        'Working on the DRC rule creation/maintainance for Legalizer in Fusion Compiler.'
      ],
      active: true
    },
    {
      period: '2022.07 - 2023.07',
      role: 'AI Intern',
      company: 'Avalanche computing Inc.',
      desc: [
        'Built simple AI applications.',
        'Successfully deployed models on edge devices.'
      ],
      active: false
    },
    {
      period: '2022.09 - 2024.06',
      role: 'Teaching Assistant',
      company: 'NTHU',
      desc: [
        '[CS235101] Data Structure',
        '[CS235101] Data Science'
      ],
      active: false
    },
    {
      period: '2021.07 - 2021.12',
      role: '資訊實習生',
      company: '國家衛生研究院 (NHRI)',
      desc: [
        'Analyzed human genome sequencing data detected in Taiwan.',
        'Applied statistical methods to interpret data meanings and establish a risk prediction model for senility.',
        'Assisted in writing automation data processing modules using Perl and R.'
      ],
      active: false
    }
  ];

  // 教育學歷資料
  const education = [
    {
      period: '2022.09 - 2024.07',
      degree: '資訊工程學系 碩士',
      school: '國立清華大學 (NTHU)',
      desc: [
        'Lab of Big Data and Social Network Analysis for Emerging Technology Research',
        'Research Topic : Maching Learning, Graph Neural Network, Contrastive Learning'
      ],
      thesis: {
        title: 'Enhancing Contrastive Link Prediction With Edge Balancing Augmentation',
        venue: 'ACM CIKM 2025',
        link: 'https://arxiv.org/abs/2508.14808'
      },
      tags: ['Python', 'PyTorch', 'Graph Neural Network (GNN)', 'Contrastive Learning', 'Machine Learning'],
      active: false
    },
    {
      period: '2019.06 - 2022.06',
      degree: '理學院學士班',
      school: '國立清華大學 (NTHU)',
      desc: [
        'First major: Data Science',
        'Second major: Computer Science'
      ],
      tags: ['C / C++', 'Python', 'Data Structures & Algorithms', 'Operating Systems', 'Data Science'],
      active: false
    },
    {
      period: '2018.09 - 2019.06',
      degree: '化學系',
      school: '國立清華大學 (NTHU)',
      desc: 'Basic courses for College of Science',
      tags: ['Calculus', 'General Chemistry', 'General Physics', 'Lab Techniques'],
      active: false
    }
  ];

  // 技術列表與分類
  const skills = [
    { name: 'React', category: 'frontend' },
    { name: 'JavaScript (ES6+)', category: 'frontend' },
    { name: 'CSS Flexbox / Grid', category: 'frontend' },
    { name: 'Framer Motion', category: 'frontend' },
    { name: 'HTML5 & Semantic UI', category: 'frontend' },
    { name: 'Git & GitHub', category: 'tools' },
    { name: 'NPM / Node.js', category: 'tools' },
    { name: 'Responsive Web Design', category: 'frontend' },
    { name: 'User Experience (UX)', category: 'design' },
  ];

  return (
    <motion.div
      className="about-container page"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="about-grid">
        {/* 左側：個人 Profile 卡片 */}
        <motion.div className="about-profile-card" variants={itemVariants}>
          <div className="about-avatar-wrapper">
            <img src="/Retr0Man.png" alt="Retro" className="about-avatar" />
          </div>
          <h2>Retro</h2>
          <p className="about-title">Software Engineer @ Synopsys</p>
          <hr className="profile-divider" />
          
          <div className="about-socials">
            <a 
              href="https://github.com/dashboard" 
              target="_blank" 
              rel="noreferrer" 
              className="social-btn github"
            >
              <span className="social-icon">💻</span> GitHub
            </a>
            <a 
              href="mailto:retro@example.com" 
              className="social-btn email"
            >
              <span className="social-icon">✉️</span> Email
            </a>
            <a 
              href="www.linkedin.com/in/chen-hao-chang-91b3b0227" 
              target="_blank" 
              rel="noreferrer" 
              className="social-btn linkedin"
            >
              <span className="social-icon">🔗</span> LinkedIn
            </a>
            <a 
              href="https://www.instagram.com/retr0_tatsuhiro/?hl=zh-tw" 
              target="_blank" 
              rel="noreferrer" 
              className="social-btn instagram"
            >
              <span className="social-icon">📸</span> Instagram
            </a>
            <a 
              href="https://www.facebook.com/zhang.chen.hao.600966/" 
              target="_blank" 
              rel="noreferrer" 
              className="social-btn facebook"
            >
              <span className="social-icon">👥</span> Facebook
            </a>
          </div>
        </motion.div>

        {/* 右側：主體內容 */}
        <div className="about-main-content">
          {/* 我的故事 */}
          <motion.section className="about-section-card" variants={itemVariants}>
            <h3 className="section-title">📖 From Me To Myself</h3>
            <div className="section-content">
              <p>
                Hi, I'm Retro. The nickname comes from the charater "Marcus Holloway" in Watch Dogs 2. He is a powerful hacker which inspire me to become a programmer.
              </p>
              <p>
                My focus in Master period is AI, especially in Graph Neural Network (GNN) and contrastive learning. But now I work in EDA industry and write algorithm for foundry design rule. Ya.. it is totally different area huh. That's life I guess :) 
              </p>
              <p className="retro-quote">
                💬 <i>"Run, don't walk. Either you're running for food, or you are running from being food.”</i> - Jensen Huang
              </p>
            </div>
          </motion.section>

          {/* 工作經歷 */}
          <motion.section className="about-section-card" variants={itemVariants}>
            <h3 className="section-title">💼 Experience </h3>
            <div className="section-content">
              <div className="about-timeline">
                {workExperience.map((exp, index) => (
                  <div key={index} className={`timeline-item ${exp.active ? 'active' : ''}`}>
                    <div className="timeline-dot-wrapper">
                      <div className="timeline-dot"></div>
                    </div>
                    <div className="timeline-info">
                      <span className="timeline-period">{exp.period}</span>
                      <h4 className="timeline-role">
                        {exp.role} <span className="timeline-at">@</span> <span className="timeline-company-highlight">{exp.company}</span>
                      </h4>
                      {Array.isArray(exp.desc) ? (
                        <ul className="timeline-desc-list">
                          {exp.desc.map((item, idx) => (
                            <li key={idx} className="timeline-desc-item">{item}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="timeline-desc">{exp.desc}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.section>

          {/* 教育學歷 */}
          <motion.section className="about-section-card" variants={itemVariants}>
            <h3 className="section-title">🎓 Education </h3>
            <div className="section-content">
              <div className="about-timeline">
                {education.map((edu, index) => (
                  <div key={index} className={`timeline-item ${edu.active ? 'active' : ''}`}>
                    <div className="timeline-dot-wrapper">
                      <div className="timeline-dot"></div>
                    </div>
                    <div className="timeline-info">
                      <span className="timeline-period">{edu.period}</span>
                      <h4 className="timeline-role">{edu.degree}</h4>
                      <h5 className="timeline-company">{edu.school}</h5>
                      {Array.isArray(edu.desc) ? (
                        <ul className="timeline-desc-list">
                          {edu.desc.map((item, idx) => (
                            <li key={idx} className="timeline-desc-item">{item}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="timeline-desc">{edu.desc}</p>
                      )}

                      {/* 學習技術標籤 */}
                      {edu.tags && edu.tags.length > 0 && (
                        <div className="timeline-tags">
                          {edu.tags.map((tag, idx) => (
                            <span key={idx} className="timeline-tag-badge">{tag}</span>
                          ))}
                        </div>
                      )}
                      
                      {/* 碩士論文與發表 */}
                      {edu.thesis && (
                        <div className="thesis-box">
                          <span className="thesis-tag">🏆 Master's Thesis / 碩士論文</span>
                          {edu.thesis.link ? (
                            <a 
                              href={edu.thesis.link} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="thesis-title-link"
                            >
                              <p className="thesis-title">
                                "{edu.thesis.title}" <span className="thesis-link-icon">🔗</span>
                              </p>
                            </a>
                          ) : (
                            <p className="thesis-title">"{edu.thesis.title}"</p>
                          )}
                          <span className="thesis-venue">Accepted by <b>{edu.thesis.venue}</b></span>
                        </div>
                      )}
                    </div>
                    
                  </div>
                ))}
              </div>
            </div>
          </motion.section>

          {/* 技術堆疊 */}
          <motion.section className="about-section-card" variants={itemVariants}>
            <h3 className="section-title">💻 Skills & Tools / 技術工具</h3>
            <div className="section-content">
              <div className="skills-grid">
                {skills.map((skill, index) => (
                  <motion.div
                    key={index}
                    className={`skill-tag-card ${skill.category}`}
                    whileHover={{ 
                      scale: 1.05, 
                      y: -3, 
                      boxShadow: '0 8px 15px rgba(0,0,0,0.1)' 
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="skill-dot"></span>
                    <span className="skill-name">{skill.name}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>

          {/* 興趣與好玩的事 */}
          <motion.section className="about-section-card" variants={itemVariants}>
            <h3 className="section-title">🎨 Fun Facts / 趣味雜項</h3>
            <div className="section-content">
              <ul className="about-fun-list">
                <li>
                  🎵 <strong>有考慮當歌手嗎？</strong>
                  <p>雖然主要的工作是寫扣，但私底下對唱歌與音樂也有相當濃厚的興趣。</p>
                </li>
                <li>
                  🍲 <strong>麻辣鍋狂熱粉</strong>
                  <p>鼎王麻辣鍋是我的精神食糧，沒有什麼是一頓麻辣鍋解決不了的。如果有，那就兩頓！</p>
                </li>
                <li>
                  👾 <strong>復古與像素美學</strong>
                  <p>熱愛 Pixel Art、復古電玩與 80 年代 Synthwave 的電子風格，對老派而浪漫的視覺情有獨鍾。</p>
                </li>
              </ul>
            </div>
          </motion.section>
        </div>
      </div>
    </motion.div>
  );
};

export default About;
