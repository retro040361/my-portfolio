import { FaGithub, FaLinkedin, FaInstagram, FaFacebook, FaEnvelope } from 'react-icons/fa';

// 社群連結（About 頁與 Footer 共用）
// email 留空時不顯示 Email 按鈕
export const EMAIL = '';

export const socialLinks = [
  { key: 'github', label: 'GitHub', href: 'https://github.com/retro040361', Icon: FaGithub },
  ...(EMAIL ? [{ key: 'email', label: 'Email', href: `mailto:${EMAIL}`, Icon: FaEnvelope }] : []),
  { key: 'linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/in/chen-hao-chang-91b3b0227', Icon: FaLinkedin },
  { key: 'instagram', label: 'Instagram', href: 'https://www.instagram.com/retr0_tatsuhiro/', Icon: FaInstagram },
  { key: 'facebook', label: 'Facebook', href: 'https://www.facebook.com/zhang.chen.hao.600966/', Icon: FaFacebook },
];

// 文章分類設定（Blog / BlogPost / Home 共用）
export const CATEGORY_META = {
  tech: { label: '技術', longLabel: '技術分享', fallbackCode: '<tech/>', gradient: 'linear-gradient(135deg, #04111a 0%, #003b4d 100%)' },
  life: { label: '生活', longLabel: '生活隨筆', fallbackCode: 'life.log', gradient: 'linear-gradient(135deg, #1a0412 0%, #4d0030 100%)' },
};
