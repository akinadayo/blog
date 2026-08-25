import React from 'react';
import { motion } from 'motion/react';

const skills = ['iOS / SWIFTUI', 'AI-ASSISTED DEV', 'INDIE APP DEV', 'ASTRO / WEB', 'ELECTRON', 'DATA / ANALYSIS'];
const interests = [
  ['01', 'つくる', 'iOSアプリやWebツールを、アイデアから公開まで。'],
  ['02', '考える', '身近な疑問を、データと仮説で掘り下げる。'],
  ['03', '書く', 'うまくいったことも失敗も、再現できる形で残す。'],
];

export function AboutView() {
  return (
    <div className="about-page">
      <section className="about-hero">
        <motion.div className="about-hero__copy" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
          <span className="eyebrow">プロフィール / 01</span>
          <h1>HELLO,<br /><em>I'M NeU.</em></h1>
          <p>iOSアプリとWebツールをつくる個人開発者。生成AIを相棒に、アイデアを動くものへ変えています。</p>
          <a className="pixel-button pixel-button--cyan" href="mailto:yukak367@gmail.com">メッセージを送る ↗</a>
        </motion.div>
        <motion.div className="profile-card" initial={{ opacity: 0, rotate: 3, y: 30 }} animate={{ opacity: 1, rotate: -2, y: 0 }}>
          <div className="profile-card__top"><span>プロフィールカード</span><span>ACTIVE</span></div>
          <div className="profile-card__avatar"><img src="/icon.JPG" alt="NeU" /></div>
          <div className="profile-card__data">
            <b>NeU / 個人開発者</b>
            <span>拠点：愛知</span>
            <span>状態：制作中 ●</span>
          </div>
        </motion.div>
      </section>

      <section className="about-story">
        <div className="section-kicker"><span>この人について</span><b>わたしについて</b></div>
        <div className="about-story__grid">
          <div className="about-copy">
            <p>愛知を拠点に、iOSアプリやWebツールを個人開発しています。生成AIは、企画・仕様づくり・実装を一緒に進める相棒です。小さくつくり、実際に動かし、リリースまで持っていくのが好きです。</p>
            <p>このブログでは、開発の試行錯誤やUI・体験づくりに加えて、身近な疑問をデータや計算で掘り下げた記録を書いています。完成品だけでなく、迷ったことや失敗まで、次に試せる形で残します。</p>
          </div>
          <div className="skill-board">
            <span className="skill-board__title">いまの領域</span>
            {skills.map((skill, index) => <span key={skill} style={{ '--level': `${94 - index * 7}%` } as React.CSSProperties}>{skill}<i /></span>)}
          </div>
        </div>
      </section>

      <section className="interest-section">
        <div className="section-kicker"><span>いま夢中なこと</span><b>つくっているもの</b></div>
        <div className="interest-grid">
          {interests.map(([number, title, text], index) => (
            <motion.article key={title} whileHover={{ y: -8, rotate: index % 2 ? 1 : -1 }}>
              <span>{number}</span><h2>{title}</h2><p>{text}</p>
            </motion.article>
          ))}
        </div>
      </section>
    </div>
  );
}
