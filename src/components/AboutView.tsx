import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Github, Twitter, Mail, MapPin, Code2, Palette, Cpu, Sparkles } from "lucide-react";
import { motion } from "motion/react";

export function AboutView() {
  const skills = {
    frontend: ['React Native', 'TypeScript', 'React / Next.js', 'Tailwind CSS'],
    others: ['Claude Code / AI Tools', 'Raspberry Pi', 'Arduino', 'Blender', 'Git / GitHub']
  };

  const interests = [
    { icon: Code2, label: 'Coding', color: 'text-blue-500' },
    { icon: Palette, label: '3D Modeling', color: 'text-pink-500' },
    { icon: Cpu, label: 'Electronics', color: 'text-green-500' }
  ];

  return (
    <div className="min-h-screen">
      {/* ヒーローセクション */}
      <div className="relative overflow-hidden bg-gradient-to-br from-background via-primary/5 to-purple-500/10 border-b">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        </div>

        <div className="container max-w-5xl mx-auto px-6 py-20 md:py-32 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="relative inline-block mb-8">
              <Avatar className="w-32 h-32 md:w-40 md:h-40 ring-4 ring-primary/20 ring-offset-4 ring-offset-background shadow-2xl">
                <AvatarImage src="/blog/icon.JPG" />
                <AvatarFallback>NeU</AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg">
                <Sparkles className="text-primary-foreground" size={20} />
              </div>
            </div>

            <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4">
              <span className="bg-gradient-to-r from-primary via-purple-600 to-pink-500 bg-clip-text text-transparent">
                NeU.dev
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-6">Engineer & Creator</p>

            <div className="flex flex-wrap items-center justify-center gap-6 mb-8">
              <div className="flex items-center gap-2 text-sm">
                <MapPin size={16} className="text-primary" />
                <span>Aichi, Japan</span>
              </div>
            </div>

            <div className="flex justify-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full w-12 h-12 hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-all"
                onClick={() => alert('準備中です')}
              >
                <Github size={20} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full w-12 h-12 hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-all"
                onClick={() => alert('準備中です')}
              >
                <Twitter size={20} />
              </Button>
              <a href="mailto:yukak367@gmail.com">
                <Button variant="outline" size="icon" className="rounded-full w-12 h-12 hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-all">
                  <Mail size={20} />
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </div>

      {/* コンテンツセクション */}
      <div className="container max-w-5xl mx-auto px-6 py-16 md:py-24">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* 自己紹介 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 space-y-8"
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
            <Card className="border-2 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-black">自己紹介</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  はじめまして、NeUです。愛知県のJTCでエンジニアとして働いています。
                  主にモバイルアプリ開発とAI統合を中心に、フロントエンド中心の技術スタックを使った開発に携わっています。
                  最近はClaude CodeをはじめとしたAI駆動の開発ワークフローや、React Nativeを使ったアプリケーション開発にも力を入れています。
                </p>
                <p>
                  技術面では、Raspberry PiやArduinoを使った電子工作、Blenderでの3Dモデリングなど、幅広い分野に興味を持って取り組んでいます。
                  AIを活用した効率的な開発手法の研究も継続中です。
                </p>
                <p>
                  このブログでは、日々の開発で得た技術的な知見だけではなく、趣味についても気ままに発信していきたいと思っています。
                  よろしくお願いします。
                </p>
              </CardContent>
            </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
            <Card className="border-2 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-black">スキルセット</CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="font-black text-primary">Frontend</h3>
                  <div className="flex flex-wrap gap-2">
                    {skills.frontend.map((skill) => (
                      <Badge key={skill} variant="secondary" className="px-3 py-1">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="font-black text-primary">Others</h3>
                  <div className="flex flex-wrap gap-2">
                    {skills.others.map((skill) => (
                      <Badge key={skill} variant="secondary" className="px-3 py-1">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
            </motion.div>

          </motion.div>

          {/* サイドバー */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
            <Card className="border-2 shadow-lg">
              <CardHeader>
                <CardTitle className="font-black">Interests</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {interests.map(({ icon: Icon, label, color }) => (
                  <div key={label} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                    <div className={`w-10 h-10 rounded-lg bg-background flex items-center justify-center ${color}`}>
                      <Icon size={20} />
                    </div>
                    <span className="font-semibold">{label}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
            <Card className="border-2 shadow-lg bg-gradient-to-br from-primary/10 via-purple-500/10 to-pink-500/10">
              <CardHeader>
                <CardTitle className="font-black">Let's Connect!</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  プロジェクトのご相談や、技術的な質問など、お気軽にご連絡ください。
                </p>
                <a href="mailto:yukak367@gmail.com" className="block">
                  <Button className="w-full rounded-full shadow-lg hover:shadow-xl">
                    <Mail size={16} className="mr-2" />
                    Get in Touch
                  </Button>
                </a>
              </CardContent>
            </Card>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
