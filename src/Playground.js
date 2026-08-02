import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

// Stagger 容器動畫
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

// 子卡片滑入動畫
const itemVariants = {
  hidden: { y: 20, opacity: 0 },
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

// 進度條動畫
const progressVariants = (percent) => ({
  hidden: { width: 0 },
  visible: { 
    width: `${percent}%`,
    transition: { duration: 1, ease: 'easeOut', delay: 0.2 }
  }
});

const Playground = () => {
  const [activeTab, setActiveTab] = useState('games'); // 'games' | 'travels' | 'concerts'
  const [selectedItem, setSelectedItem] = useState(null);
  const [isMaximized, setIsMaximized] = useState(false);

  // 遊戲庫資料
  const games = [
    {
      type: 'game',
      title: 'Elden Ring 艾爾登法環',
      status: '10% Playing',
      rating: '⭐⭐⭐⭐⭐',
      platform: 'PC',
      emoji: '⚔️',
      percent: 10,
      image: '/image/elden-ring-a.webp', 
      gradient: 'linear-gradient(135deg, #ffe066 0%, #d9480f 100%)',
      comment: '誒抱歉不要打我 大哥我錯ㄌ',
      detailedThoughts: '這款遊戲是我心目中的神作。法環結合了魂系列硬核的戰鬥機制與極度自由的開放世界。第一次擊敗女武神瑪蓮妮亞的時候手都在抖，那是幾十個小時受苦與練習的成果。它的地圖設計極具垂直深度（像是地底的希芙拉河），每一次探索都是新的驚喜！全成就白金是對這部偉大作品的最佳致敬。'
    },
    {
      type: 'game',
      title: '薩爾達傳說：王國之淚',
      status: 'Main Story Cleared (90%)',
      rating: '⭐⭐⭐⭐⭐',
      platform: 'Switch',
      emoji: '🛡️',
      image: '/image/zelda_totk.jpg',
      percent: 90,
      gradient: 'linear-gradient(135deg, #20c997 0%, #0b7285 100%)',
      comment: '無與倫比的建造自由度，把空島與地底探索體驗推向了全新的高度！',
      detailedThoughts: '王國之淚把沙盒遊玩推到了極致。藉由「究極手」和「餘料建造」，你可以做出飛空艇、鋼彈甚至全自動割草機。天空、陸地、地底三層世界的無縫銜接非常震撼。雖然地底的探索感後期稍微重複，但主線的感人結局與大氣磅礡的配樂，絕對配得上滿分評價！'
    },
    {
      type: 'game',
      title: '薩爾達傳說：曠野之息',
      status: 'Main Story Cleared',
      rating: '⭐⭐⭐⭐⭐',
      platform: 'Switch',
      emoji: '🛡️',
      percent: 100,
      image: '/image/zelda_botw.avif',
      gradient: 'linear-gradient(135deg, #20c997 0%, #0b7285 100%)',
      comment: '無與倫比的建造自由度，把空島與地底探索體驗推向了全新的高度！',
      detailedThoughts: '王國之淚把沙盒遊玩推到了極致。藉由「究極手」和「餘料建造」，你可以做出飛空艇、鋼彈甚至全自動割草機。天空、陸地、地底三層世界的無縫銜接非常震撼。雖然地底的探索感後期稍微重複，但主線的感人結局與大氣磅礡的配樂，絕對配得上滿分評價！'
    },
    {
      type: 'game',
      title: 'Cyberpunk 2077 電馭叛客2077',
      status: 'Playing (50% completed)',
      rating: '⭐⭐⭐⭐',
      platform: 'PC',
      emoji: '🦾',
      image: '/image/2077.jpg',
      percent: 50,
      gradient: 'linear-gradient(135deg, #ffde03 0%, #e60067 100%)',
      comment: '夜城的霓虹美學極具魅力，DLC 往日之影的劇情演出非常張力十足。',
      detailedThoughts: '雖然剛發售時有很多 bug，但經過多次改版與《往日之影》DLC 後，它已經是一部神作。夜城的街景霓虹非常漂亮，賽博龐克題材的社會探討、階級衝突也發人深省。很喜歡主角 V 與強尼銀手之間的化學反應，以及遊戲中對人性的細緻刻劃。'
    },
    {
      type: 'game',
      title: 'Watch Dogs 看門狗',
      status: 'Main Story Cleared',
      rating: '⭐⭐⭐⭐⭐',
      platform: 'PC',
      emoji: '🔫',
      percent: 100,
      image: '/image/watch_dogs.jpg',
      gradient: 'linear-gradient(135deg, #ffde03 0%, #e60067 100%)',
      comment: '艾登為了調查密謀殺害他導致姪女身亡的兇手而成為了司法制裁者。',
      detailedThoughts: '算是第一個接觸到的3A大作，好像也是Ubi免費送的吧，但一玩就愛上了，雖然當時電腦不好只能用接近馬賽克的畫質硬跑，但仍然給了我很多的震撼。時隔多年終於在2025把它破完，雖然說玩過2代再來玩會覺得少了蠻多東西，但艾登的各種戰鬥技能確實是很有爽感，加上不差的劇情，讓整個遊戲立體了很多，推推'
    },
    {
      type: 'game',
      title: 'Watch Dogs 2 看門狗 2',
      status: 'Main Story Cleared',
      rating: '⭐⭐⭐⭐⭐',
      platform: 'PC',
      emoji: '🔫',
      percent: 100,
      image: '/image/watch_dogs_2.jpg',
      gradient: 'linear-gradient(135deg, #ffde03 0%, #e60067 100%)',
      comment: '為了阻止Ctos對於人們隱私的侵犯，馬可仕與DedSec在舊金山展開行動。',
      detailedThoughts: '一生推的遊戲，我可以玩100年。好啦認真說真的是一款好遊戲，雖然劇情算是他的缺陷之一，相對支離破碎而且其實動機蠻不足的，但是探討的內容的確是現代社會會發生/即將發生的議題，而遊戲性上更是比一代更加的多樣化，更多的駭客技能以及與場景的互動，再加上生動的舊金山開放世界，就算單純買來當旅遊模擬器也值得'
    },
    {
      type: 'game',
      title: 'Watch Dogs : Legion 看門狗：自由軍團',
      status: 'Main Story Cleared',
      rating: '⭐⭐⭐⭐',
      platform: 'PC',
      emoji: '🔫',
      percent: 100,
      image: '/image/watch_dogs_legion.jpg',
      gradient: 'linear-gradient(135deg, #ffde03 0%, #e60067 100%)',
      comment: '在一次爆炸後，DedSec被當成了犯罪組織，需要號召倫敦市民展開反抗。',
      detailedThoughts: '只能說期待越高摔得越慘，想當初等了這一代等了好久，終於等到他放預告片的那一天，我還記得是大一的微積分課看到的，當時看到隱隱約約就覺得不太妙了，但還是選擇＃相信這個IP，直到後來出了之後看評價才知道沒救了。大概是2023的時候吧，好像是因為剛好有xbox pass還是啥的就載來玩看看，其實覺得不錯，後來就趁特價買來玩。必須得說真的砍了很多東西，駭客能力、武器、載具全都因為要做多人團隊的關係被切開，整個體驗明顯有落差，還好我是用終極版送的艾登破關，相對來說減去了沒有主角這個缺點。而倫敦這個城市雖然說是做得還不錯，但整體髒髒破破的也許是近未來的概念吧不知道，再加上沒什麼自然環境，比較沒有前兩代那麼適合觀光。唯一的優點是DLC把艾登的故事收尾的還算不錯，也許拿DLC作為原本的故事可以賣得更好吧，可惜了一個IP'
    },
    {
      type: 'game',
      title: 'Hogwarts Legacy 霍格華茲的傳承',
      status: 'Main Story Cleared',
      rating: '⭐⭐⭐⭐⭐',
      platform: 'PC',
      emoji: '✨',
      percent: 100,
      image: '/image/hogwarts_legacy.jpg',
      gradient: 'linear-gradient(135deg, #ffde03 0%, #e60067 100%)',
      comment: '作為古代魔法天賦的五年級插班生，逐步調查古代魔法痕跡並阻止反派。',
      detailedThoughts: '非常讚的粉絲向作品，最重要的一點就是城堡還原得非常精緻，不只是各種教室都還原的很好，就連密室密道等都有製作出來，配上背景音樂整個哈利波特的味道都出來了。戰鬥系統也出乎意料地有趣，各種咒語的連招搭配與解謎相得益彰，非常推薦給哈利波特書迷！'
    }
  ];

  // 旅行足跡資料
  const travels = [
    {
      type: 'travel',
      country: '🇯🇵 Japan / 白馬、東京 @ 日本',
      period: '2026.02',
      tag: '滑雪',
      emoji: '🍣',
      image: '/image/snow_2026.jpg', 
      gradient: 'linear-gradient(135deg, #ffc9c9 0%, #e03131 100%)',
      memory: '跟龍蝦實驗室同學出國滑雪！也是偶第一次滑雪。',
      detailedThoughts: '這是我人生中第一次滑雪，在白馬翠綠與銀白交織的山谷間，體驗從雪道滑下的速度與激情。雖然摔倒了無數次，但當學會控板的那一刻，滿足感無可替代！晚上回到東京，和同學在居酒屋乾杯、探索秋葉原的二次元文化，充滿了溫馨與歡笑。'
    },
    {
      type: 'travel',
      country: '🇯🇵 Japan / 京都、大阪 @ 日本',
      period: '2025.11',
      tag: '楓葉',
      emoji: '🍁',
      image: '/image/IMG_3062.JPG', 
      gradient: 'linear-gradient(135deg, #ffc9c9 0%, #e03131 100%)',
      memory: '第一次帶家人出國玩！',
      detailedThoughts: '京都與關西的秋季賞楓之旅！我們去的時候剛好碰上楓葉見頃，嵐山與東福寺兩側的紅葉林美不勝收。在清水寺體驗了夜間參拜，看著古老寺廟在紅葉與射燈下的神聖氛圍。家人玩得非常開心，雖然每天走路步數破兩萬，但能一起創造這樣的回憶，一切都無比值得！'
    },
    {
      type: 'travel',
      country: '🇯🇵 Japan / 京都、大阪 @ 日本',
      period: '2024.12',
      tag: '獨旅',
      emoji: '🍣',
      image: '/image/IMG_0324.JPG', 
      gradient: 'linear-gradient(135deg, #ffc9c9 0%, #e03131 100%)',
      memory: '第一次出國，而且還是自己出國！',
      detailedThoughts: '看了看自己剛好有假可以請，趁著進成功嶺之前感覺出國最後一舞，也算是人生中第一次出國ㄅ。獨自一人背著相機漫步在冬日的京都街頭，雖然天氣寒冷，但心境非常自由與放鬆。在小巷弄內尋找美味的拉麵店、走過伏見稻荷千本鳥居，這場獨旅讓我學會了和自己對話。'
    }
  ];

  // 演唱會足跡資料
  const concerts = [
    {
      type: 'concert',
      artist: 'TWICE : THIS IS FOR',
      period: '2025.11.22',
      venue: '高雄世運',
      emoji: '🎤',
      image: '/image/twice_kh_2025.webp',
      gradient: 'linear-gradient(135deg, #fa5252 0%, #be4bdb 100%)',
      memory: '在南台灣感受九兔的超強魅力！現場完全陷入瘋狂狀態。',
      detailedThoughts: '高雄世運場地巨大，當九兔登台那一刻，全場五萬人的萬花筒手環同步亮起，粉紅與杏色的燈海美到令人屏息！成員們的刀群舞與實力開麥，配合一連串熱門金曲聯唱，全場氣氛燃到最高點。能在家鄉看到她們的專場，真的是圓夢的夜晚！'
    },
    {
      type: 'concert',
      artist: 'YUURI ASIA TOUR 2025 in TAIPEI',
      period: '2025.10.12',
      venue: '台北小巨蛋',
      emoji: '🎤',
      image: '/image/yuuri_2025.jpg',
      gradient: 'linear-gradient(135deg, #fa5252 0%, #be4bdb 100%)',
      memory: '你說得對，這就是乾燥花。優里獨特的沙啞嗓音真的太有渲染力！',
      detailedThoughts: '優里（Yuuri）的台北專場簡直是大型催淚現場。現場唱功比錄音室版本還要狂暴，那種帶著撕裂感的唱腔在《乾燥花》、《Betelgeuse》響起時，讓全小巨蛋都起雞皮疙瘩。他的互動也非常親切，用中文和台下歌迷對話，整場演唱會真誠度滿分！'
    },
    {
      type: 'concert',
      artist: 'JJ 林俊傑JJ20 FINAL LAP 世界巡迴',
      period: '2025.06.07-08',
      venue: '台北大巨蛋',
      emoji: '🪐',
      image: '/image/jj20_finalLap.jpg',
      gradient: 'linear-gradient(135deg, #1098ad 0%, #7048e8 100%)',
      memory: '老林大巨蛋巡演，兩天全勤發瘋！行走CD不是浪得虛名。',
      detailedThoughts: 'JJ林俊傑重回台北開唱，這一次更是挑戰全新的台北大巨蛋。這兩天我全勤參與，大巨蛋的音響在老林的高音穿透下表現十分震撼。一首首經典的「林氏情歌」大合唱，配合 final lap 的科幻舞台視效，不管是《江南》、《修煉愛情》還是新歌，都完美證明了他華語樂壇頂尖唱將的地位。'
    },
    {
      type: 'concert',
      artist: 'AIMYON TOUR 2025 “Dolphin Apartment”',
      period: '2025.04.13',
      venue: '台北流行音樂中心',
      emoji: '🎸',
      image: '/image/aimyon_dolapt.jpeg',
      gradient: 'linear-gradient(135deg, #495057 0%, #1c7ed6 100%)',
      memory: '第一次聽Aimyon現場，甚至從沒想過有這個機會！',
      detailedThoughts: '愛繆（Aimyon）的北流舞台極具個人色彩。抱著吉他在微光中自彈自唱，聲音純粹且富有爆發力。唱到《曾經活著啊》與《金盞花》時，全場的情緒被完全調動起來，她純真大方的台風與極佳的Live功力，讓這晚的北流變成了最溫暖的海豚公寓。'
    },
    {
      type: 'concert',
      artist: 'JJ20 世界巡迴演唱會',
      period: '2022.12.04',
      venue: '桃園棒球場',
      emoji: '🎸',
      image: '/image/jj20.png',
      gradient: 'linear-gradient(135deg, #495057 0%, #1c7ed6 100%)',
      memory: '冷雨中的棒球場，周杰倫驚喜現身當嘉賓，世紀同台！',
      detailedThoughts: '那是個下著冷雨的冬夜，JJ20巡演桃園站。雖然天氣極冷還飄著細雨，但大家熱情不減。中途周杰倫突然走上台，兩大天王合唱《雙截棍》與《說好不哭》，全場瞬間陷入瘋狂的尖叫聲中。冷雨配上世紀同台，成為回憶中最特別、最不可思議的演唱會。'
    },
    {
      type: 'concert',
      artist: 'JJ Sanctuary 聖所 世界巡迴演唱會',
      period: '2019.02.15',
      venue: '台北小巨蛋',
      emoji: '🎸',
      image: '/image/jj_sanctuary.jpg',
      gradient: 'linear-gradient(135deg, #495057 0%, #1c7ed6 100%)',
      memory: '人生第一次進小巨蛋看演唱會！聖所舞台神級呈現。',
      detailedThoughts: '這是我人生中看的第一場小巨蛋演唱會，意義非凡。聖所的開場《一千年以後》配合宏大的舞台編排直接震撼了我。林俊傑的現場穩定度讓人驚嘆，在小巨蛋極佳的包覆感音效下，這場精雕細琢的視覺與聽覺饗宴，正式開啟了我後續的追專場演唱會之路。'
    },
    {
      type: 'concert',
      artist: 'JJ TimeLine 時線：新地球 世界巡迴',
      period: '2015.12.19',
      venue: '高雄巨蛋',
      emoji: '🎸',
      image: '/image/jj_timeline.jpg',
      gradient: 'linear-gradient(135deg, #495057 0%, #1c7ed6 100%)',
      memory: '人生第一場演唱會！高雄巨蛋的感動啟蒙。',
      detailedThoughts: '2015年的時線新地球是我人生看的第一場演唱會，那時還只是個學生，攢了很久的票錢坐在看台區。看著舞台上的燈光與全場揮舞的螢光棒，第一次體會到演唱會現場的宏大與震撼。聽著《修煉愛情》與《新地球》，音樂的種子在那一刻深深埋入了心底。'
    }
  ];

  // 根據 activeTab 選擇顯示資料
  const getActiveData = () => {
    switch (activeTab) {
      case 'games':
        return games;
      case 'travels':
        return travels;
      case 'concerts':
        return concerts;
      default:
        return games;
    }
  };

  const activeItems = getActiveData();

  return (
    <motion.div
      className="playground-container page"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* 頁面標題 */}
      <motion.div className="playground-header" variants={itemVariants}>
        <h1>Playground</h1>
        <p className="playground-subtitle">「工作寫扣，生活玩樂」── 這裡記錄了我在代碼之外的生活足跡與冒險紀錄。點擊卡片看詳細內容！</p>
      </motion.div>

      {/* 分類切換 Tab 按鈕列 (Option 1) */}
      <motion.div className="blog-filter-buttons playground-tabs" variants={itemVariants}>
        <button 
          className={`filter-btn ${activeTab === 'games' ? 'active' : ''}`}
          onClick={() => setActiveTab('games')}
        >
          🎮 Game
        </button>
        <button 
          className={`filter-btn ${activeTab === 'travels' ? 'active' : ''}`}
          onClick={() => setActiveTab('travels')}
        >
          ✈️ Travel
        </button>
        <button 
          className={`filter-btn ${activeTab === 'concerts' ? 'active' : ''}`}
          onClick={() => setActiveTab('concerts')}
        >
          🎵 Concerts
        </button>
      </motion.div>

      {/* 網格卡片佈局 (Option 1 - 統一為 3-column Grid) */}
      <motion.div 
        key={activeTab}
        className="projects-grid playground-grid-layout" 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {activeItems.map((item, index) => (
          <motion.div
            key={item.title || item.country || item.artist}
            className="project-card-wrapper"
            variants={itemVariants}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            onClick={() => setSelectedItem(item)}
          >
              <div className="project-card-glass playground-interactive-card">
                {/* 卡片頂部封面 */}
                <div className="project-banner" style={{ background: item.gradient }}>
                  {item.image ? (
                    <img src={item.image} alt={item.title || item.country || item.artist} className="card-banner-img" />
                  ) : (
                    <span className="project-emoji">{item.emoji}</span>
                  )}
                  {item.platform && <span className="card-platform-tag">{item.platform}</span>}
                  {item.period && !item.platform && <span className="card-date-tag">{item.period}</span>}
                </div>
                
                <div className="project-content" style={{ padding: '24px' }}>
                  <h2 className="project-title" style={{ fontSize: '1.25rem', marginBottom: '8px' }}>
                    {item.title || item.country || item.artist}
                  </h2>
                  
                  {/* 特色元資料 (評分/進度/標籤) */}
                  <div className="card-meta" style={{ marginBottom: '12px' }}>
                    {item.rating ? (
                      <div className="card-rating">{item.rating}</div>
                    ) : item.tag ? (
                      <span className="travel-tag-pill">{item.tag}</span>
                    ) : item.venue ? (
                      <span className="travel-tag-pill" style={{ backgroundColor: 'rgba(168, 85, 247, 0.15)', color: '#a855f7', border: '1px solid rgba(168, 85, 247, 0.25)' }}>
                        📍 {item.venue}
                      </span>
                    ) : null}
                    
                    {item.status && <div className="card-status">{item.status}</div>}
                  </div>

                  {/* 遊戲進度條 */}
                  {item.type === 'game' && (
                    <div className="progress-bar-wrapper">
                      <motion.div 
                        className="progress-bar-fill" 
                        variants={progressVariants(item.percent)}
                        initial="hidden"
                        animate="visible"
                        style={{ background: item.gradient }}
                      />
                    </div>
                  )}

                  <p className="project-desc" style={{ fontSize: '0.88rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', minHeight: '2.8em' }}>
                    {item.comment || item.memory}
                  </p>
                </div>
              </div>
          </motion.div>
        ))}
      </motion.div>

      {/* 彈出式視窗 (Option 1 與 Option 2 混合風格的視窗) */}
      <AnimatePresence>
        {selectedItem && (
          <div className="modal-overlay" onClick={() => { setSelectedItem(null); setIsMaximized(false); }}>
            <motion.div 
              layout
              className={`modal-box retro-window ${isMaximized ? 'is-maximized' : ''}`}
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ 
                type: 'spring', 
                damping: 25, 
                stiffness: 300,
                layout: { duration: 0.38, ease: [0.16, 1, 0.3, 1] }
              }}
              onClick={(e) => e.stopPropagation()} // 阻止事件冒泡
              style={{ maxWidth: isMaximized ? '95vw' : '600px', width: '95%' }}
            >
              {/* Option 2 風格：macOS/Linux 交通燈視窗標題列 */}
              <div className="login-window-header" style={{ padding: '10px 16px', background: 'var(--navbar-bg)', borderBottom: '1px solid var(--card-border)' }}>
                <div className="window-controls">
                  <span className="control-dot red" title="關閉 (Close)" onClick={() => { setSelectedItem(null); setIsMaximized(false); }}>
                    <span className="dot-icon">✕</span>
                  </span>
                  <span className="control-dot yellow" title="縮小 (Minimize)" onClick={() => { setSelectedItem(null); setIsMaximized(false); }}>
                    <span className="dot-icon">−</span>
                  </span>
                  <span className="control-dot green" title={isMaximized ? "還原 (Restore)" : "放大 (Maximize)"} onClick={() => setIsMaximized(!isMaximized)}>
                    <span className="dot-icon">{isMaximized ? '⤡' : '⤢'}</span>
                  </span>
                </div>
                <div className="window-title" style={{ color: 'var(--text-primary)', fontFamily: 'monospace', fontSize: '0.82rem' }}>
                  Console - {selectedItem.title || selectedItem.country || selectedItem.artist}
                </div>
                <div className="window-spacer" style={{ width: '30px' }}></div>
              </div>

              {/* 滾動內容包裝容器（讓 Cover Banner 隨捲動往上滑動消失） */}
              <div className="modal-scroll-body">
                {/* 頂部橫幅 */}
                <div className="modal-banner" style={{ height: '180px', minHeight: '180px', background: selectedItem.gradient }}>
                  {selectedItem.image ? (
                    <img src={selectedItem.image} alt={selectedItem.title || selectedItem.country} className="modal-banner-img" />
                  ) : (
                    <span className="modal-emoji" style={{ fontSize: '5rem' }}>{selectedItem.emoji}</span>
                  )}
                </div>

                {/* 內文主體 */}
                <div className="modal-body" style={{ padding: '24px' }}>
                  <span className="modal-meta-label" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {selectedItem.platform 
                      ? `🎮 ${selectedItem.platform}` 
                      : selectedItem.venue 
                        ? `🎤 ${selectedItem.venue}` 
                        : `✈️ ${selectedItem.period}`}
                  </span>
                  <h2 className="modal-title" style={{ fontSize: '1.4rem', marginTop: '4px', marginBottom: '8px' }}>
                    {selectedItem.title || selectedItem.country || selectedItem.artist}
                  </h2>
                  
                  <div className="modal-info-row" style={{ marginBottom: '16px' }}>
                    {selectedItem.rating && <span className="modal-rating">{selectedItem.rating}</span>}
                    <span className="modal-status-badge">
                      {selectedItem.status || selectedItem.tag || `📅 ${selectedItem.period}`}
                    </span>
                  </div>

                  <div className="modal-divider" style={{ margin: '15px 0' }} />
                  
                  <h4 className="modal-section-title" style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '8px' }}>💭 我的心得與回顧</h4>
                  <p className="modal-detailed-thoughts" style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                    {selectedItem.detailedThoughts}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Playground;
