import React from 'react';
import { motion } from 'motion/react';

const skills = ['REACT NATIVE', 'TYPESCRIPT', 'AI TOOLS', 'RASPBERRY PI', 'ARDUINO', 'BLENDER'];
const interests = [
  ['01', 'BUILD', 'モバイルアプリやWebを、アイデアから動くものへ。'],
  ['02', 'TINKER', '電子工作と3Dモデリング。手を動かして理解する。'],
  ['03', 'WRITE', '成功も失敗も、次の誰かのショートカットにする。'],
];

export function AboutView() {
  return (
    <div className="about-page">
      <section className="about-hero">
        <motion.div className="about-hero__copy" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
          <span className="eyebrow">PLAYER PROFILE / 01</span>
          <h1>HELLO,<br /><em>I'M NeU.</em></h1>
          <p>エンジニアで、つくる人。技術を試して、たまに壊して、気づきを記録しています。</p>
          <a className="pixel-button pixel-button--cyan" href="mailto:yukak367@gmail.com">SEND A MESSAGE ↗</a>
        </motion.div>
        <motion.div className="profile-card" initial={{ opacity: 0, rotate: 3, y: 30 }} animate={{ opacity: 1, rotate: -2, y: 0 }}>
          <div className="profile-card__top"><span>PLAYER CARD</span><span>LV.28</span></div>
          <div className="profile-card__avatar"><img src="/icon.JPG" alt="NeU" /></div>
          <div className="profile-card__data">
            <b>NeU / ENGINEER</b>
            <span>BASE: AICHI, JAPAN</span>
            <span>STATUS: CREATING ●</span>
          </div>
        </motion.div>
      </section>

      <section className="about-story">
        <div className="section-kicker"><span>ABOUT THIS PLAYER</span><b>WHO AM I?</b></div>
        <div className="about-story__grid">
          <div className="about-copy">
            <p>愛知県でエンジニアとして働いています。主軸はモバイルアプリ開発とAI統合。React Nativeを使ったプロダクト開発や、AIと一緒に速く・楽しくつくる方法を探っています。</p>
            <p>画面の中だけでなく、Raspberry PiやArduino、Blenderにも寄り道します。このブログは、完成品だけを並べるショーケースではなく、途中で転んだ跡まで残す実験ノートです。</p>
          </div>
          <div className="skill-board">
            <span className="skill-board__title">EQUIPPED SKILLS</span>
            {skills.map((skill, index) => <span key={skill} style={{ '--level': `${94 - index * 7}%` } as React.CSSProperties}>{skill}<i /></span>)}
          </div>
        </div>
      </section>

      <section className="interest-section">
        <div className="section-kicker"><span>CURRENT SIDE QUESTS</span><b>WHAT I DO</b></div>
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
