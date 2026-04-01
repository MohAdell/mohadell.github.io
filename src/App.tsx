/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue, useMotionTemplate } from 'motion/react';
import { 
  ArrowRight, Target, TrendingUp, Settings, Zap, 
  CheckCircle2, Mail, Linkedin, BarChart3, Search, 
  LineChart, Cpu, Sparkles, ChevronRight, Loader2,
  Image, Mic, Layers, Video, Bot, Download, MessageCircle, Code
} from 'lucide-react';

// --- 3D Tilt Card Component ---
const TiltCard = ({ children, className = "" }: { children: React.ReactNode, className?: string, key?: React.Key }) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["12deg", "-12deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-12deg", "12deg"]);
  
  const glareX = useTransform(mouseXSpring, [-0.5, 0.5], [100, 0]);
  const glareY = useTransform(mouseYSpring, [-0.5, 0.5], [100, 0]);
  const background = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(34, 211, 238, 0.15) 0%, transparent 60%)`;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateY, rotateX }}
      className={`perspective-1000 relative group ${className}`}
    >
      <motion.div 
        style={{ transform: "translateZ(20px)" }} 
        className="h-full w-full preserve-3d"
      >
        <motion.div 
          className="absolute inset-0 z-50 pointer-events-none rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ background }}
        />
        {children}
      </motion.div>
    </motion.div>
  );
};

// --- Magnetic Button Component ---
const MagneticButton = ({ children, className = "", href, onClick, target, rel, "aria-label": ariaLabel }: { children: React.ReactNode, className?: string, href?: string, onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void, target?: string, rel?: string, "aria-label"?: string }) => {
  const ref = useRef<HTMLAnchorElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.2, y: middleY * 0.2 });
  };

  const reset = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.a
      href={href}
      onClick={onClick}
      target={target}
      rel={rel}
      aria-label={ariaLabel}
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      className={`${className} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950`}
    >
      {children}
    </motion.a>
  );
};

// --- Data ---
const caseStudies = [
  {
    title: "Improving Lead Quality in High-Volume Campaigns",
    problem: "High lead volume but low quality, resulting in wasted sales effort and low conversion rates.",
    solution: [
      "Refined audience targeting to reach higher-intent users",
      "Adjusted creatives to clearly communicate value and pricing",
      "Optimized the funnel with better qualification questions",
      "Implemented advanced tracking to monitor lead progression"
    ],
    result: [
      "Significantly improved lead relevance",
      "Better alignment between marketing and sales teams",
      "More efficient campaign spend with higher ROI"
    ]
  },
  {
    title: "Building a Scalable Lead Generation Funnel",
    problem: "Campaigns were unstructured and fragmented, making it difficult to scale lead generation predictably.",
    solution: [
      "Completely restructured the acquisition funnel",
      "Implemented strict audience segmentation",
      "Established a clear campaign hierarchy for testing and scaling"
    ],
    result: [
      "Created a stable, predictable lead flow",
      "Improved overall campaign efficiency",
      "Enabled clear, actionable performance tracking"
    ]
  },
  {
    title: "Technical SEO & Website Performance Optimization",
    problem: "The website suffered from slow loading times and weak technical SEO, hindering organic growth.",
    solution: [
      "Executed deep code optimization to reduce bloat",
      "Implemented aggressive speed improvements (caching, asset optimization)",
      "Resolved critical on-page SEO and structural issues"
    ],
    result: [
      "Improved search engine indexing and crawlability",
      "Delivered a significantly better user experience",
      "Increased organic search performance and visibility"
    ]
  },
  {
    title: "CRM & Marketing Automation Integration",
    problem: "Delayed lead response times and manual data entry processes were causing lead leakage.",
    solution: [
      "Deployed and configured a centralized CRM system",
      "Built WhatsApp automation for immediate lead engagement",
      "Developed API integrations to connect marketing sources with the CRM"
    ],
    result: [
      "Drastically faster lead response times",
      "Better, more organized lead handling and follow-up",
      "Massively improved operational efficiency for the sales team"
    ]
  }
];

const expertise = [
  {
    icon: BarChart3,
    title: "Performance Marketing",
    desc: "End-to-end management of Meta & Google Ads focused strictly on lead generation through rigorous targeting and bid optimization."
  },
  {
    icon: Search,
    title: "Technical SEO",
    desc: "Comprehensive search engine optimization bridging technical health, site architecture, and content relevance."
  },
  {
    icon: LineChart,
    title: "Analytics & Tracking",
    desc: "Implementation of advanced data collection using GA4, GTM, Meta Pixel, and server-side tracking solutions."
  },
  {
    icon: Cpu,
    title: "Automation & AI",
    desc: "Streamlining operations via CRM integrations, WhatsApp API workflows, and leveraging AI tools for scalable growth."
  }
];

const stackCategories = [
  {
    title: "Ads Platforms",
    icon: Target,
    tools: ["Meta Ads", "Google Ads", "TikTok Ads", "LinkedIn Ads", "Snapchat Ads"]
  },
  {
    title: "Analytics",
    icon: BarChart3,
    tools: ["Google Analytics 4", "Google Tag Manager", "Looker Studio", "Mixpanel", "Server-Side Tracking"]
  },
  {
    title: "SEO Tools",
    icon: Search,
    tools: ["Ahrefs", "SEMrush", "Screaming Frog", "Google Search Console", "Technical Audits"]
  },
  {
    title: "Development",
    icon: Code,
    tools: ["HTML/CSS", "JavaScript", "React", "APIs", "Webhooks"]
  },
  {
    title: "Automation/AI",
    icon: Bot,
    tools: ["Zapier", "Make (Integromat)", "ChatGPT", "Claude", "CRM Integrations"]
  }
];

const aiSystems = [
  {
    title: "Creative Generation System",
    icon: Image,
    challenge: "Limited creative production slows campaign testing.",
    solution: "Built an AI-powered system that generates multiple creative variations from a single reference design.",
    capabilities: ["Generate multiple visual variations", "Create matching ad copy and CTAs", "Produce structured campaign-ready assets"],
    impact: ["Accelerated creative production", "Enabled faster A/B testing", "Reduced dependency on manual design"]
  },
  {
    title: "AI Voice Over Engine",
    icon: Mic,
    challenge: "Voice-over production is slow and costly.",
    solution: "Developed a custom AI voice-over system supporting multiple Arabic dialects and tones.",
    capabilities: ["Different accents (Gulf, Egyptian, etc.)", "Tone control (professional, emotional, sales)", "Integration with image/video creatives"],
    impact: ["Rapid video production", "Flexible ad localization", "Reduced production time significantly"]
  },
  {
    title: "Creative Scaling Engine",
    icon: Layers,
    challenge: "Scaling creatives across campaigns is inefficient.",
    solution: "Built an internal tool that transforms a single creative into multiple variations with aligned messaging.",
    capabilities: ["Generate 6–9 creatives per input", "Auto-generate captions & CTAs", "Maintain brand consistency"],
    impact: ["Increased testing capacity", "Faster campaign scaling", "Improved creative diversity"]
  },
  {
    title: "AI Storyboard Generator",
    icon: Video,
    challenge: "Video ideation and scripting takes too long.",
    solution: "Created a system that generates full storyboard concepts from images or inputs.",
    capabilities: ["Scene structure", "Script suggestions", "Visual direction"],
    impact: ["Faster content production", "Better creative planning", "Improved campaign storytelling"]
  }
];

// --- Hero Particles ---
const HeroParticles = () => {
  const particles = React.useMemo(() => {
    return Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      size: Math.random() * 4 + 1,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      duration: Math.random() * 20 + 20,
      delay: Math.random() * -30,
      xOffset: (Math.random() - 0.5) * 150,
      yOffset: (Math.random() - 0.5) * 150,
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-cyan-400/30 blur-[1px]"
          style={{
            width: p.size,
            height: p.size,
            left: p.left,
            top: p.top,
          }}
          animate={{
            x: [0, p.xOffset, 0],
            y: [0, p.yOffset, 0],
            opacity: [0.1, 0.6, 0.1],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "linear",
            delay: p.delay,
          }}
        />
      ))}
    </div>
  );
};

// --- Hero 3D Element ---
const Hero3DElement = () => {
  return (
    <div className="absolute right-[-30%] md:right-[-10%] lg:right-0 top-[20%] md:top-[30%] lg:top-1/2 -translate-y-1/2 w-[400px] md:w-[500px] h-[400px] md:h-[500px] pointer-events-none flex items-center justify-center perspective-1000 opacity-20 md:opacity-40 lg:opacity-60 z-0" aria-hidden="true">
      <motion.div
        animate={{ rotateX: [0, 360], rotateY: [0, 360] }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        className="w-full h-full preserve-3d relative flex items-center justify-center"
      >
        {/* Ring 1 */}
        <div className="absolute w-full h-full border border-emerald-500/30 rounded-full" style={{ transform: 'rotateX(75deg)' }}>
          <div className="absolute top-0 left-1/2 w-3 h-3 bg-emerald-400 rounded-full shadow-[0_0_15px_#34d399] -translate-x-1/2 -translate-y-1/2"></div>
        </div>
        {/* Ring 2 */}
        <div className="absolute w-full h-full border border-cyan-500/30 rounded-full" style={{ transform: 'rotateY(75deg)' }}>
          <div className="absolute top-1/2 left-0 w-3 h-3 bg-cyan-400 rounded-full shadow-[0_0_15px_#22d3ee] -translate-x-1/2 -translate-y-1/2"></div>
        </div>
        {/* Ring 3 */}
        <div className="absolute w-full h-full border border-blue-500/30 rounded-full" style={{ transform: 'rotateX(45deg) rotateY(45deg)' }}>
          <div className="absolute bottom-0 left-1/2 w-3 h-3 bg-blue-400 rounded-full shadow-[0_0_15px_#60a5fa] -translate-x-1/2 translate-y-1/2"></div>
        </div>
        {/* Ring 4 */}
        <div className="absolute w-full h-full border border-emerald-400/20 rounded-full" style={{ transform: 'rotateX(-45deg) rotateY(-45deg)' }}>
          <div className="absolute top-1/2 right-0 w-3 h-3 bg-emerald-300 rounded-full shadow-[0_0_15px_#6ee7b7] translate-x-1/2 -translate-y-1/2"></div>
        </div>
        
        {/* Core Glow */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-48 h-48 bg-gradient-to-tr from-emerald-500/20 to-cyan-500/20 blur-3xl rounded-full" 
        />
      </motion.div>
    </div>
  );
};

// --- Main App Component ---
export default function App() {
  const { scrollYProgress } = useScroll();
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleEmailClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (isEmailLoading) return;
    setIsEmailLoading(true);
    setTimeout(() => {
      setIsEmailLoading(false);
      window.location.href = "mailto:info.moadel@gmail.com";
    }, 2000);
  };

  const yBackground = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacityHero = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scaleHero = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-emerald-500/30 selection:text-emerald-200 overflow-hidden relative">
      
      {/* Global Spotlight */}
      <div 
        className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300 hidden md:block"
        style={{
          background: `radial-gradient(800px circle at ${mousePos.x}px ${mousePos.y}px, rgba(34, 211, 238, 0.03), transparent 40%)`
        }}
      />
      
      {/* Noise Overlay */}
      <div className="pointer-events-none fixed inset-0 z-40 bg-noise opacity-[0.02] mix-blend-overlay"></div>

      {/* Animated Background */}
      <motion.div 
        style={{ y: yBackground }}
        className="fixed inset-0 z-0 pointer-events-none flex justify-center"
      >
        <div className="absolute top-[-20%] w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[100px] mix-blend-screen animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
      </motion.div>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-panel border-b-0 border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <motion.a 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            href="#home" 
            className="font-display font-bold text-xl tracking-tight flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 rounded-lg"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-slate-950">
              <Sparkles className="w-4 h-4" aria-hidden="true" />
            </div>
            Mohamed Adel Attia
          </motion.a>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden md:flex items-center gap-8"
          >
            {['About', 'Expertise', 'Case Studies'].map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} className="text-sm font-medium text-slate-400 hover:text-white transition-colors relative group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 rounded-sm">
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-400 transition-all group-hover:w-full"></span>
              </a>
            ))}
            <MagneticButton href="#contact" className="px-5 py-2.5 bg-white text-slate-950 text-sm font-bold rounded-lg hover:bg-emerald-400 transition-colors shadow-[0_0_20px_rgba(52,211,153,0.2)] hover:shadow-[0_0_30px_rgba(52,211,153,0.4)]">
              Let's Talk
            </MagneticButton>
          </motion.div>
        </div>
      </nav>
      
      <main className="relative z-10 pt-20">
        {/* Hero Section */}
        <section id="home" className="min-h-[calc(100vh-80px)] flex items-center py-20 px-6 max-w-7xl mx-auto relative">
          <HeroParticles />
          <Hero3DElement />
          <motion.div 
            style={{ opacity: opacityHero, scale: scaleHero }}
            className="max-w-5xl relative z-10"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel text-emerald-300 text-sm font-medium mb-8 border border-emerald-500/20 shadow-[0_0_20px_rgba(52,211,153,0.1)]"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Available for new opportunities in UAE
            </motion.div>
            
            <motion.h1 
              className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8 font-display leading-[1.05]"
            >
              {["Performance", "Marketing"].map((word, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 40, rotateX: -90 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  transition={{ duration: 0.8, delay: 0.1 + i * 0.1, type: "spring", bounce: 0.4 }}
                  className="inline-block mr-4"
                  style={{ transformOrigin: "bottom" }}
                >
                  {word}
                </motion.span>
              ))}
              <br className="hidden md:block"/>
              <motion.span 
                initial={{ opacity: 0, y: 40, rotateX: -90 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ duration: 0.8, delay: 0.3, type: "spring", bounce: 0.4 }}
                className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500"
                style={{ transformOrigin: "bottom" }}
              >
                & SEO Specialist
              </motion.span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-xl md:text-2xl text-slate-400 mb-12 max-w-3xl leading-relaxed font-light"
            >
              I help businesses improve lead quality, conversion efficiency, and marketing execution through <strong className="text-white font-medium">performance strategy</strong>, <strong className="text-white font-medium">technical SEO</strong>, and <strong className="text-white font-medium">AI-powered automation</strong>.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-wrap items-center gap-4 mb-20"
            >
              <MagneticButton href="#case-studies" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-slate-950 rounded-xl font-bold hover:bg-emerald-400 transition-colors shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_40px_rgba(52,211,153,0.3)] text-lg">
                View Case Studies
                <ArrowRight className="w-5 h-5" aria-hidden="true" />
              </MagneticButton>
              <MagneticButton href="/resume.pdf" target="_blank" className="inline-flex items-center justify-center gap-2 px-8 py-4 glass-panel text-white rounded-xl font-bold hover:bg-white/10 transition-colors text-lg">
                <Download className="w-5 h-5" aria-hidden="true" />
                Download Resume
              </MagneticButton>
              <MagneticButton href="https://wa.me/201000000000" target="_blank" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/20 rounded-xl font-bold hover:bg-[#25D366]/20 transition-colors text-lg shadow-[0_0_20px_rgba(37,211,102,0.1)] hover:shadow-[0_0_30px_rgba(37,211,102,0.2)]">
                <MessageCircle className="w-5 h-5" aria-hidden="true" />
                WhatsApp
              </MagneticButton>
            </motion.div>
            
            <motion.div 
              initial="initial"
              animate="animate"
              variants={{
                initial: { opacity: 0 },
                animate: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.5 } }
              }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-10 border-t border-white/10"
            >
              {[
                { label: "Experience", value: "4+ Years" },
                { label: "Core Focus", value: "Performance Marketing" },
                { label: "Specialty", value: "Technical SEO" },
                { label: "Advantage", value: "Automation & AI" },
              ].map((badge, i) => (
                <motion.div 
                  key={i} 
                  variants={{
                    initial: { opacity: 0, y: 20 },
                    animate: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
                  }}
                  className="flex flex-col group"
                >
                  <span className="text-white font-bold text-2xl md:text-3xl font-display group-hover:text-emerald-400 transition-colors">{badge.value}</span>
                  <span className="text-slate-400 text-sm mt-2 uppercase tracking-wider font-medium">{badge.label}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* About Section */}
        <section id="about" className="min-h-screen flex items-center py-32 relative">
          <div className="absolute inset-0 bg-slate-900/50 skew-y-3 origin-top-left z-[-1]"></div>
          <div className="max-w-7xl mx-auto px-6 w-full">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7 }}
              >
                <div className="inline-flex items-center gap-2 text-emerald-400 font-bold tracking-widest uppercase text-sm mb-6">
                  <span className="w-8 h-px bg-emerald-400"></span>
                  The Technical Marketer
                </div>
                <h2 className="text-4xl md:text-5xl font-bold font-display mb-8 leading-tight">Bridging the gap between <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">marketing and technology.</span></h2>
                <div className="space-y-6 text-lg text-slate-400 leading-relaxed font-light">
                  <p>
                    I am a Performance Marketing and SEO Specialist with a strong technical foundation. Over the past 4+ years, I've specialized in managing high-value customer acquisition funnels and aligning marketing strategies with sales processes.
                  </p>
                  <p>
                    Unlike traditional marketers, I don't just run campaigns. I build the tracking systems, automate the workflows, and optimize the technical infrastructure that makes those campaigns successful.
                  </p>
                </div>
              </motion.div>
              
              <div className="grid grid-cols-2 gap-6">
                {[
                  { icon: Target, title: "Lead Gen", desc: "High-intent prospects" },
                  { icon: TrendingUp, title: "Funnels", desc: "Maximized conversion" },
                  { icon: Settings, title: "Technical", desc: "APIs & Analytics" },
                  { icon: Zap, title: "High-Value", desc: "High-Value Funnels & Lead-driven business models" }
                ].map((item, i) => (
                  <TiltCard key={i} className={i % 2 !== 0 ? "lg:mt-12" : ""}>
                    <div className="glass-panel p-8 rounded-3xl h-full border-white/10 hover:border-emerald-500/30 transition-colors group">
                      <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:bg-emerald-500/20 transition-colors">
                        <item.icon className="w-7 h-7 text-emerald-400" />
                      </div>
                      <h3 className="font-bold text-xl text-white mb-2 font-display">{item.title}</h3>
                      <p className="text-slate-400 text-sm">{item.desc}</p>
                    </div>
                  </TiltCard>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Expertise Section */}
        <section id="expertise" className="min-h-screen flex flex-col justify-center py-32 px-6 max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-20 md:text-center max-w-3xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-bold font-display mb-6">Core Expertise</h2>
            <p className="text-xl text-slate-400 font-light">A comprehensive approach to digital growth, combining strategic marketing with technical execution.</p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {expertise.map((item, index) => (
              <TiltCard key={index} className="h-full">
                <div className="glass-panel rounded-3xl p-8 h-full hover:bg-white/5 transition-all group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(52,211,153,0.4)] group-hover:border-emerald-500/50 transition-all duration-500 relative">
                    <div className="absolute inset-0 bg-emerald-400/20 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse"></div>
                    <item.icon className="w-6 h-6 text-emerald-400 relative z-10" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4 font-display">{item.title}</h3>
                  <p className="text-slate-400 leading-relaxed text-sm">{item.desc}</p>
                </div>
              </TiltCard>
            ))}
          </div>
        </section>

        {/* Case Studies Section */}
        <section id="case-studies" className="min-h-screen flex items-center py-32 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 z-[-1]"></div>
          <div className="max-w-7xl mx-auto px-6 w-full">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-8"
            >
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 text-cyan-400 font-bold tracking-widest uppercase text-sm mb-6">
                  <span className="w-8 h-px bg-cyan-400"></span>
                  Proven Results
                </div>
                <h2 className="text-4xl md:text-6xl font-bold font-display">Featured Case Studies</h2>
              </div>
              <p className="text-lg text-slate-400 max-w-md font-light">Real business challenges solved through data-driven marketing and technical optimization.</p>
            </motion.div>
            
            <div className="space-y-12">
              {caseStudies.map((study, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  className="group"
                >
                  <TiltCard className="w-full">
                    <div className="glass-panel rounded-[2.5rem] p-8 md:p-12 border-white/10 hover:border-cyan-500/30 transition-colors relative overflow-hidden">
                      {/* Decorative Number */}
                      <div className="absolute -top-10 -right-10 text-[15rem] font-display font-bold text-white/[0.02] leading-none pointer-events-none group-hover:text-cyan-500/[0.05] transition-colors">
                        0{index + 1}
                      </div>

                      <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-8">
                          <span className="px-4 py-1.5 rounded-full bg-cyan-500/10 text-cyan-400 text-sm font-bold tracking-wider uppercase border border-cyan-500/20">
                            Case Study 0{index + 1}
                          </span>
                        </div>
                        
                        <h3 className="text-3xl md:text-4xl font-bold text-white font-display mb-12 max-w-3xl leading-tight transition-all duration-300 hover:text-cyan-300 hover:scale-[1.02] origin-left cursor-default">
                          {study.title}
                        </h3>
                        
                        <div className="grid md:grid-cols-3 gap-12">
                          <div className="md:col-span-1">
                            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                              The Challenge
                            </h4>
                            <p className="text-slate-300 leading-relaxed text-lg font-light">{study.problem}</p>
                          </div>
                          
                          <div className="md:col-span-1">
                            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                              The Solution
                            </h4>
                            <ul className="space-y-4">
                              {study.solution.map((item, i) => (
                                <li key={i} className="flex items-start gap-3 text-slate-300 font-light">
                                  <ChevronRight className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" aria-hidden="true" />
                                  <span className="leading-relaxed">{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="md:col-span-1">
                            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                              The Result
                            </h4>
                            <ul className="space-y-4">
                              {study.result.map((item, i) => (
                                <li key={i} className="flex items-start gap-3 text-white font-medium">
                                  <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" aria-hidden="true" />
                                  <span className="leading-relaxed">{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TiltCard>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* AI & Marketing Automation Systems Section */}
        <section id="ai-systems" className="min-h-screen flex items-center py-32 px-6 relative z-10 bg-slate-950/50">
          <div className="max-w-7xl mx-auto w-full">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-20"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-sm font-bold tracking-widest uppercase mb-6">
                <Bot className="w-4 h-4" />
                Proprietary Tech
              </div>
              <h2 className="text-4xl md:text-5xl font-bold font-display mb-6">AI & Marketing Automation Systems</h2>
              <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                Custom-built engines designed to solve production bottlenecks, scale creative output, and accelerate campaign testing.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {aiSystems.map((system, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="group"
                >
                  <TiltCard className="h-full">
                    <div className="glass-panel p-8 rounded-2xl h-full border border-white/5 relative overflow-hidden">
                      {/* Background Glow */}
                      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-cyan-500/10 transition-colors duration-500" />
                      
                      <div className="flex items-center gap-4 mb-8 relative z-10">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 flex items-center justify-center text-cyan-400 shadow-lg group-hover:scale-110 transition-transform duration-300">
                          <system.icon className="w-7 h-7" />
                        </div>
                        <h3 className="text-2xl font-bold text-white font-display leading-tight">{system.title}</h3>
                      </div>

                      <div className="space-y-6 relative z-10">
                        {/* Challenge & Solution */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-5">
                            <h4 className="text-red-400 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                              <Target className="w-4 h-4" aria-hidden="true" /> Challenge
                            </h4>
                            <p className="text-slate-300 text-sm leading-relaxed">{system.challenge}</p>
                          </div>
                          <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-5">
                            <h4 className="text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                              <Sparkles className="w-4 h-4" aria-hidden="true" /> Solution
                            </h4>
                            <p className="text-slate-300 text-sm leading-relaxed">{system.solution}</p>
                          </div>
                        </div>

                        {/* Capabilities & Impact */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-white/5">
                          <div>
                            <h4 className="text-white font-semibold mb-4 flex items-center gap-2 text-sm">
                              <Settings className="w-4 h-4 text-cyan-400" aria-hidden="true" /> Capabilities
                            </h4>
                            <ul className="space-y-3">
                              {system.capabilities.map((cap, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm text-slate-400">
                                  <CheckCircle2 className="w-4 h-4 text-cyan-500/70 shrink-0 mt-0.5" aria-hidden="true" />
                                  <span className="leading-snug">{cap}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="text-white font-semibold mb-4 flex items-center gap-2 text-sm">
                              <TrendingUp className="w-4 h-4 text-emerald-400" aria-hidden="true" /> Impact
                            </h4>
                            <ul className="space-y-3">
                              {system.impact.map((imp, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm text-slate-400">
                                  <Zap className="w-4 h-4 text-emerald-500/70 shrink-0 mt-0.5" aria-hidden="true" />
                                  <span className="leading-snug">{imp}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TiltCard>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Experience Timeline Section */}
        <section id="experience" className="min-h-screen flex items-center py-32 relative z-10">
          <div className="max-w-4xl mx-auto px-6 w-full">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-20"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-bold tracking-widest uppercase mb-6">
                <Layers className="w-4 h-4" />
                Career Journey
              </div>
              <h2 className="text-4xl md:text-5xl font-bold font-display mb-6">Experience Timeline</h2>
              <p className="text-slate-400 text-lg">My professional background combining marketing strategy with technical execution.</p>
            </motion.div>

            <div className="relative border-l-2 border-slate-800 ml-4 md:ml-0 md:left-1/2 md:-translate-x-1/2 space-y-16">
              
              {/* Oplus Realty Experience */}
              <div className="relative group md:w-1/2 md:pr-12 md:ml-0 ml-8">
                <div className="absolute w-5 h-5 bg-emerald-500 rounded-full -left-[41px] md:-right-[11px] md:left-auto top-1.5 border-4 border-slate-950 shadow-[0_0_15px_rgba(52,211,153,0.5)] z-10"></div>
                
                <motion.div 
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5 }}
                  className="glass-panel p-8 rounded-2xl border border-white/5 hover:border-emerald-500/30 transition-colors relative"
                >
                  <div className="flex flex-col mb-4">
                    <span className="text-emerald-400 font-bold text-sm tracking-wider uppercase mb-1">Apr 2025 – Present</span>
                    <h3 className="text-2xl font-bold text-white font-display">Digital Marketing Specialist</h3>
                    <span className="text-slate-400 font-medium">Oplus Realty | Abu Dhabi, UAE</span>
                  </div>
                  
                  <ul className="space-y-3 mt-6">
                    <li className="flex items-start gap-3 text-slate-300 text-sm leading-relaxed">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-1" aria-hidden="true" />
                      <span>Managed and optimized Meta and Google Ads campaigns focused on lead generation across competitive markets.</span>
                    </li>
                    <li className="flex items-start gap-3 text-slate-300 text-sm leading-relaxed">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-1" aria-hidden="true" />
                      <span>Handled mid to high 5-figure monthly budgets while maintaining efficient cost structures.</span>
                    </li>
                    <li className="flex items-start gap-3 text-slate-300 text-sm leading-relaxed">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-1" aria-hidden="true" />
                      <span>Built and optimized tracking infrastructure using GA4, GTM, and Meta Pixel.</span>
                    </li>
                    <li className="flex items-start gap-3 text-slate-300 text-sm leading-relaxed">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-1" aria-hidden="true" />
                      <span>Developed CRM integrations with WhatsApp API to automate lead distribution.</span>
                    </li>
                  </ul>

                  <div className="mt-6 pt-6 border-t border-white/5">
                    <h4 className="text-cyan-400 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Bot className="w-4 h-4" /> AI & Automation Impact
                    </h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2 text-slate-400 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-500/50 mt-1.5 shrink-0"></div>
                        <span>Built AI-driven marketing systems to automate creative production and content workflows.</span>
                      </li>
                      <li className="flex items-start gap-2 text-slate-400 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-500/50 mt-1.5 shrink-0"></div>
                        <span>Created AI-powered voice-over system supporting multiple Arabic dialects.</span>
                      </li>
                    </ul>
                  </div>
                </motion.div>
              </div>

              {/* Freelance Experience */}
              <div className="relative group md:w-1/2 md:pl-12 md:ml-auto ml-8">
                <div className="absolute w-5 h-5 bg-cyan-500 rounded-full -left-[41px] md:-left-[11px] top-1.5 border-4 border-slate-950 shadow-[0_0_15px_rgba(34,211,238,0.5)] z-10"></div>
                
                <motion.div 
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="glass-panel p-8 rounded-2xl border border-white/5 hover:border-cyan-500/30 transition-colors relative"
                >
                  <div className="flex flex-col mb-4">
                    <span className="text-cyan-400 font-bold text-sm tracking-wider uppercase mb-1">Jan 2021 – Mar 2025</span>
                    <h3 className="text-2xl font-bold text-white font-display">Freelance Digital Marketer</h3>
                    <span className="text-slate-400 font-medium">& Website Manager</span>
                  </div>
                  
                  <ul className="space-y-3 mt-6">
                    <li className="flex items-start gap-3 text-slate-300 text-sm leading-relaxed">
                      <CheckCircle2 className="w-4 h-4 text-cyan-500 shrink-0 mt-1" aria-hidden="true" />
                      <span>Designed and managed websites using WordPress, Shopify, Joomla, and Drupal.</span>
                    </li>
                    <li className="flex items-start gap-3 text-slate-300 text-sm leading-relaxed">
                      <CheckCircle2 className="w-4 h-4 text-cyan-500 shrink-0 mt-1" aria-hidden="true" />
                      <span>Implemented SEO strategies including technical SEO and content optimization.</span>
                    </li>
                    <li className="flex items-start gap-3 text-slate-300 text-sm leading-relaxed">
                      <CheckCircle2 className="w-4 h-4 text-cyan-500 shrink-0 mt-1" aria-hidden="true" />
                      <span>Built high-converting landing pages with optimized UX and performance.</span>
                    </li>
                    <li className="flex items-start gap-3 text-slate-300 text-sm leading-relaxed">
                      <CheckCircle2 className="w-4 h-4 text-cyan-500 shrink-0 mt-1" aria-hidden="true" />
                      <span>Managed paid campaigns and improved engagement and conversion performance.</span>
                    </li>
                  </ul>
                </motion.div>
              </div>

            </div>
          </div>
        </section>

        {/* Tools & Stack Section */}
        <section className="min-h-screen flex items-center py-32 border-y border-white/5 relative bg-slate-900/30 overflow-hidden">
          <div className="absolute inset-0 bg-emerald-900/5 z-[-1]"></div>
          
          <div className="max-w-7xl mx-auto px-6 w-full">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-20"
            >
              <h2 className="text-4xl md:text-6xl font-bold font-display mb-6">Tools & Stack</h2>
              <p className="text-emerald-200/70 text-xl max-w-2xl mx-auto font-light">A comprehensive suite of platforms and technologies I use to drive performance and scale operations.</p>
            </motion.div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stackCategories.map((category, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-panel rounded-3xl p-8 border-white/5 hover:border-emerald-500/30 transition-colors group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[50px] rounded-full group-hover:bg-emerald-500/20 transition-colors pointer-events-none"></div>
                  
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-white/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(52,211,153,0.1)]">
                      <category.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold font-display text-white">{category.title}</h3>
                  </div>
                  
                  <ul className="space-y-3">
                    {category.tools.map((tool, j) => (
                      <li key={j} className="flex items-center gap-3 text-slate-300">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50"></div>
                        <span className="font-medium">{tool}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Me Section */}
        <section className="min-h-screen flex items-center py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-emerald-900/20 z-[-1]"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none"></div>
          
          <div className="max-w-7xl mx-auto px-6 w-full">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-20"
            >
              <h2 className="text-4xl md:text-6xl font-bold font-display mb-6">Why Work With Me?</h2>
              <p className="text-emerald-200/70 text-xl max-w-2xl mx-auto font-light">I bring a unique combination of strategic marketing vision and technical execution capabilities.</p>
            </motion.div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { title: "Marketing + Technical", desc: "I don't just plan campaigns; I execute the technical setup required to track, attribute, and automate them effectively." },
                { title: "Full-Funnel Understanding", desc: "From the first ad impression to the final CRM status update, I optimize the entire customer journey to reduce friction." },
                { title: "Business Results First", desc: "I focus on metrics that matter—lead quality, sales alignment, and ROI—not just vanity metrics like clicks and impressions." }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-panel rounded-3xl p-10 border-emerald-500/20 hover:bg-emerald-500/10 transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold font-display mb-6">
                    0{i + 1}
                  </div>
                  <h3 className="text-2xl font-bold mb-4 font-display text-white">{item.title}</h3>
                  <p className="text-emerald-100/70 leading-relaxed font-light">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="min-h-[calc(100vh-80px)] flex items-center justify-center py-20 px-6 max-w-4xl mx-auto text-center relative w-full">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-5xl md:text-7xl font-bold font-display mb-8 text-white leading-tight">Ready to scale your <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">marketing growth?</span></h2>
            <p className="text-2xl text-slate-400 mb-8 font-light">Let's discuss how my blend of performance marketing, SEO, and technical expertise can contribute to your business.</p>
            
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-lg md:text-xl font-medium mb-16">
              <span className="relative flex h-3 w-3 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              Available for full-time opportunities & selected freelance projects
            </div>
            
            <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-6">
              <MagneticButton href="mailto:info.moadel@gmail.com" onClick={handleEmailClick} className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-white text-slate-950 rounded-2xl font-bold hover:bg-emerald-400 transition-colors w-full sm:w-auto text-xl shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_40px_rgba(52,211,153,0.4)]">
                {isEmailLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin" aria-hidden="true" />
                ) : (
                  <Mail className="w-6 h-6" aria-hidden="true" />
                )}
                {isEmailLoading ? "Opening Mail..." : "Let's Work Together"}
              </MagneticButton>
              <MagneticButton href="/resume.pdf" target="_blank" rel="noopener noreferrer" className="group inline-flex items-center justify-center gap-3 px-10 py-5 glass-panel text-white border border-white/20 rounded-2xl font-bold hover:bg-white/10 hover:scale-105 transition-all duration-300 w-full sm:w-auto text-xl">
                <Download className="w-6 h-6 group-hover:animate-subtle-bounce" aria-hidden="true" />
                Download Resume
              </MagneticButton>
              <MagneticButton href="https://wa.me/201000000000" target="_blank" className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/20 rounded-2xl font-bold hover:bg-[#25D366]/20 transition-colors w-full sm:w-auto text-xl shadow-[0_0_20px_rgba(37,211,102,0.1)] hover:shadow-[0_0_30px_rgba(37,211,102,0.2)]">
                <MessageCircle className="w-6 h-6" aria-hidden="true" />
                WhatsApp
              </MagneticButton>
              <MagneticButton href="https://linkedin.com/in/mohameddev" target="_blank" className="inline-flex items-center justify-center gap-3 px-10 py-5 glass-panel text-white border border-white/20 rounded-2xl font-bold hover:bg-white/10 transition-colors w-full sm:w-auto text-xl">
                <Linkedin className="w-6 h-6 text-cyan-400" aria-hidden="true" />
                LinkedIn
              </MagneticButton>
            </div>
          </motion.div>
        </section>
      </main>

      <footer className="py-10 text-center text-slate-400 text-sm border-t border-white/5 relative z-10">
        <p>© {new Date().getFullYear()} Mohamed Adel Attia. All rights reserved.</p>
      </footer>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        @keyframes subtle-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20%); }
        }
        .animate-subtle-bounce {
          animation: subtle-bounce 1.5s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}
