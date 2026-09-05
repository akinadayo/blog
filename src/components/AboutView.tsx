import React from 'react';

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
        <div className="about-hero__copy">
          <span className="eyebrow">プロフィール / 01</span>
          <h1>HELLO,<br /><em>I'M NeU.</em></h1>
          <p>iOSアプリとWebツールをつくる個人開発者。生成AIを相棒に、アイデアを動くものへ変えています。</p>
          <a className="pixel-button pixel-button--cyan" href="mailto:yukak367@gmail.com">メッセージを送る ↗</a>
        </div>
        <div className="profile-card">
          <div className="profile-card__top"><span>プロフィールカード</span><span>ACTIVE</span></div>
          <div className="profile-card__avatar"><img src="/icon.JPG" alt="NeU" width={2048} height={2048} /></div>
          <div className="profile-card__data">
            <b>NeU / 個人開発者</b>
            <span>拠点：愛知</span>
            <span>状態：制作中 ●</span>
          </div>
        </div>
      </section>

      <section className="about-story">
        <div className="section-kicker"><span>この人について</span><h2>わたしについて</h2></div>
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
        <div className="section-kicker"><span>いま夢中なこと</span><h2>つくっているもの</h2></div>
        <div className="interest-grid">
          {interests.map(([number, title, text]) => (
            <article key={title}>
              <span>{number}</span><h3>{title}</h3><p>{text}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
