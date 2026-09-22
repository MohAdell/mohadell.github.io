import { useEffect, useMemo, useState } from 'react';
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react';
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Code2,
  Database,
  Download,
  Github,
  Globe2,
  Linkedin,
  Mail,
  Menu,
  MessageCircle,
  Search,
  Settings2,
  Sparkles,
  Target,
  Workflow,
  X,
  Zap,
} from 'lucide-react';

const CONTACT = {
  email: 'info.moadel@gmail.com',
  whatsapp: 'https://wa.me/971562988714',
  linkedin: 'https://www.linkedin.com/in/mohamedadel-seo/',
  github: 'https://github.com/MohAdell',
  resume: '/resume.pdf',
};

const stats = [
  ['5+ years', 'Digital marketing experience'],
  ['Paid media', 'Campaign ownership & optimization'],
  ['Lead quality', 'Qualification tracked beyond raw volume'],
  ['High-ticket', 'UAE real-estate acquisition'],
];

const capabilities = [
  {
    icon: Target,
    title: 'Performance Marketing',
    text: 'Meta Ads and Google Ads for high-ticket lead generation, including budget management, audience and placement strategy, creatives, landing pages, CPL review and lead-quality analysis.',
  },
  {
    icon: Database,
    title: 'CRM & Lead Operations',
    text: 'Custom CRM workflows, Meta lead integration, lead routing, WhatsApp and SMS communication, SLA-based follow-up and sales-process automation.',
  },
  {
    icon: BarChart3,
    title: 'Analytics & Tracking',
    text: 'GA4, GTM and Meta Pixel with UTM structure, conversion events, attribution checks and custom reporting across the acquisition-to-sales funnel.',
  },
  {
    icon: Search,
    title: 'SEO & Organic Growth',
    text: 'Technical SEO, on-page optimization, keyword strategy, Search Console analysis and content operations that support organic growth.',
  },
  {
    icon: Code2,
    title: 'Web Development',
    text: 'Hands-on WordPress development, custom functionality, landing pages, site-speed work, APIs, HTML/CSS and technical troubleshooting.',
  },
  {
    icon: Workflow,
    title: 'Automation & AI Workflows',
    text: 'n8n, Make, webhooks, scheduled scripts and API-based automation for repetitive marketing, reporting and publishing work.',
  },
];

const projects = [
  {
    tag: 'REAL ESTATE · PERFORMANCE',
    title: 'High-ticket real-estate lead generation',
    challenge: 'Generate volume for high-value property offers without treating every lead as equally useful.',
    points: [
      'Meta Ads + Google Ads across active property campaigns',
      'Audience and placement strategy, creatives, lead forms and landing pages',
      'CPL, lead quality and downstream CRM status tracked together',
    ],
    result:
      'Campaign reporting tracked qualification and meeting progression, with qualified prospects moving into online and in-person meetings.',
  },
  {
    tag: 'REAL ESTATE · CRM',
    title: 'Custom lead-management system',
    challenge: 'Bring lead capture, distribution, communication and follow-up into one operational flow.',
    points: [
      'Custom CRM built around the sales process',
      'Meta lead sources connected directly to the CRM',
      'WhatsApp + SMS flows, lead routing and SLA follow-up logic',
    ],
    result:
      'Lead capture, assignment, communication and follow-up now run through one connected operational flow.',
  },
  {
    tag: 'REPORTING · AUTOMATION',
    title: 'Dashboards, APIs and scheduled utilities',
    challenge: 'Reduce repetitive reporting and data-processing work without turning reporting into a separate full-time process.',
    points: [
      'Custom reporting views from ad-platform exports',
      'API integrations where direct data access made sense',
      'Scripts that run locally or on a server on scheduled intervals',
    ],
    result:
      'Recurring reporting and data-processing tasks became easier to repeat without unnecessary manual steps.',
  },
  {
    tag: 'SEO · CONTENT OPERATIONS',
    title: 'SEO content and publishing automation',
    challenge: 'Create a repeatable publishing workflow without losing the checks needed for useful search content.',
    points: [
      'Workflow for research, drafting, optimization and publishing',
      'Automated source collection, enrichment and validation for two news properties',
      'Routine publishing with minimal manual intervention',
    ],
    result:
      'Supported consistent publishing and stronger search visibility while reducing repetitive production work.',
  },
];

const systems = [
  {
    icon: Database,
    title: 'Lead infrastructure',
    text: 'CRM, Meta lead intake, routing, WhatsApp, SMS and SLA logic designed around the sales process.',
  },
  {
    icon: Zap,
    title: 'Automation layer',
    text: 'n8n, Make, webhooks, APIs and scheduled scripts used where recurring work can be removed safely.',
  },
  {
    icon: Globe2,
    title: 'Publishing systems',
    text: 'SEO content workflows and automated news operations that collect, enrich, validate and publish content.',
  },
  {
    icon: Sparkles,
    title: 'Creative operations',
    text: 'Photoshop plus AI-assisted production workflows for ad creatives, content assets and Arabic voice-over use cases.',
  },
];

const stack = [
  ['Advertising', 'Meta Ads Manager', 'Google Ads', 'Lead Forms', 'Audience & Placement Strategy'],
  ['Measurement', 'GA4', 'Google Tag Manager', 'Meta Pixel', 'UTM Tracking', 'Conversion Events', 'Attribution Checks'],
  ['CRM & Automation', 'Custom CRM', 'n8n', 'Make', 'Webhooks', 'APIs', 'WhatsApp API', 'SMS', 'Scheduled Scripts'],
  ['SEO & Web', 'Google Search Console', 'SEMrush', 'Ahrefs', 'Moz', 'WordPress', 'WooCommerce', 'Shopify', 'Elementor'],
  ['Reporting & Creative', 'Custom Dashboards', 'API Reporting', 'Platform Exports', 'Adobe Photoshop', 'Figma', 'AI-assisted Creative Work'],
];

const journey = [
  { icon: Target, label: 'Acquisition', detail: 'Meta Ads · Google Ads' },
  { icon: BarChart3, label: 'Measurement', detail: 'UTMs · Events · Attribution' },
  { icon: Database, label: 'CRM', detail: 'Lead capture · Statuses' },
  { icon: Workflow, label: 'Operations', detail: 'Routing · SLA · Automation' },
  { icon: MessageCircle, label: 'Follow-up', detail: 'WhatsApp · SMS · Meetings' },
];

const differentiators = [
  {
    icon: Target,
    title: 'Marketing + technical ownership',
    text: 'I can manage acquisition and also implement the tracking, CRM, website or automation work the funnel needs.',
  },
  {
    icon: BarChart3,
    title: 'Lead quality over empty volume',
    text: 'Campaign decisions are connected to qualification and downstream CRM status, not only clicks or raw lead counts.',
  },
  {
    icon: Workflow,
    title: 'Automate the repeatable work',
    text: 'When a process repeats, I look for a reliable API, webhook, workflow or scheduled-script path instead of adding manual steps.',
  },
];

const reveal = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.62, ease: [0.22, 1, 0.36, 1] as const },
};

function SectionHeading({
  eyebrow,
  title,
  text,
  centered = false,
}: {
  eyebrow: string;
  title: string;
  text?: string;
  centered?: boolean;
}) {
  return (
    <motion.div
      {...reveal}
      className={`mb-14 max-w-3xl ${centered ? 'mx-auto text-center' : ''}`}
    >
      <div className="section-eyebrow">{eyebrow}</div>
      <h2 className="section-title">{title}</h2>
      {text ? <p className="section-copy">{text}</p> : null}
    </motion.div>
  );
}

function HeroParticles() {
  const reduceMotion = useReducedMotion();
  const particles = useMemo(
    () =>
      Array.from({ length: 22 }).map((_, index) => ({
        id: index,
        size: 1 + ((index * 7) % 4),
        left: `${(index * 37) % 100}%`,
        top: `${(index * 61) % 100}%`,
        x: ((index % 5) - 2) * 26,
        y: (((index * 3) % 7) - 3) * 20,
        delay: -(index % 8),
        duration: 14 + (index % 9),
      })),
    [],
  );

  if (reduceMotion) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {particles.map((particle) => (
        <motion.span
          key={particle.id}
          className="absolute rounded-full bg-cyan-300/35 shadow-[0_0_14px_rgba(34,211,238,.45)]"
          style={{
            width: particle.size,
            height: particle.size,
            left: particle.left,
            top: particle.top,
          }}
          animate={{
            x: [0, particle.x, 0],
            y: [0, particle.y, 0],
            opacity: [0.1, 0.65, 0.1],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );
}

function OrbitVisual() {
  const reduceMotion = useReducedMotion();

  return (
    <div
      className="pointer-events-none absolute right-[-150px] top-[24%] hidden h-[540px] w-[540px] lg:block"
      aria-hidden="true"
    >
      <motion.div
        className="relative h-full w-full preserve-3d"
        animate={reduceMotion ? undefined : { rotateX: [0, 360], rotateY: [0, 360] }}
        transition={{ duration: 48, repeat: Infinity, ease: 'linear' }}
      >
        {[
          'rotateX(72deg)',
          'rotateY(72deg)',
          'rotateX(42deg) rotateY(42deg)',
          'rotateX(-42deg) rotateY(35deg)',
        ].map((transform, index) => (
          <div
            key={transform}
            className={`absolute inset-[11%] rounded-full border ${index % 2 === 0 ? 'border-emerald-300/20' : 'border-cyan-300/20'}`}
            style={{ transform }}
          >
            <span
              className={`absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full ${index % 2 === 0 ? 'bg-emerald-300' : 'bg-cyan-300'} shadow-[0_0_18px_currentColor]`}
            />
          </div>
        ))}
        <motion.div
          className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-tr from-emerald-400/20 via-cyan-400/15 to-blue-500/20 blur-3xl"
          animate={reduceMotion ? undefined : { scale: [1, 1.18, 1], opacity: [0.45, 0.8, 0.45] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>
    </div>
  );
}

export default function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 28, mass: 0.2 });
  const heroY = useTransform(scrollYProgress, [0, 0.22], [0, 85]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.18]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const nav = [
    ['About', '#about'],
    ['Capabilities', '#capabilities'],
    ['Selected Work', '#work'],
    ['Experience', '#experience'],
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#020817] text-slate-100">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <motion.div
        className="fixed left-0 top-0 z-[70] h-[2px] origin-left bg-gradient-to-r from-emerald-300 via-cyan-300 to-blue-400"
        style={{ scaleX: progress, width: '100%' }}
      />

      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -left-48 -top-40 h-[620px] w-[620px] rounded-full bg-emerald-500/[0.07] blur-[130px]" />
        <div className="absolute -right-52 top-[22%] h-[620px] w-[620px] rounded-full bg-cyan-500/[0.07] blur-[130px]" />
      </div>

      <header className="fixed inset-x-0 top-0 z-60 border-b border-white/[0.07] bg-[#020817]/75 backdrop-blur-2xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-6">
          <motion.a
            href="#home"
            initial={{ opacity: 0, x: -18 }}
            animate={{ opacity: 1, x: 0 }}
            className="group flex items-center gap-3"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-300 to-cyan-400 text-[#02101a] shadow-[0_0_26px_rgba(52,211,153,.22)] transition-transform duration-300 group-hover:rotate-6 group-hover:scale-105">
              <Sparkles aria-hidden="true" className="h-4 w-4" />
            </span>
            <span className="font-display text-[15px] font-semibold tracking-tight text-white sm:text-base">Mohamed Adel Attia</span>
          </motion.a>

          <motion.nav
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden items-center gap-7 md:flex"
            aria-label="Primary navigation"
          >
            {nav.map(([label, href]) => (
              <a key={href} href={href} className="nav-link">
                {label}
              </a>
            ))}
            <a href="#contact" className="nav-cta">Contact</a>
          </motion.nav>

          <button
            type="button"
            aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMobileOpen((value) => !value)}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white md:hidden"
          >
            {mobileOpen ? <X aria-hidden="true" className="h-5 w-5" /> : <Menu aria-hidden="true" className="h-5 w-5" />}
          </button>
        </div>

        <motion.div
          id="mobile-navigation"
          initial={false}
          animate={{ height: mobileOpen ? 'auto' : 0, opacity: mobileOpen ? 1 : 0 }}
          className="overflow-hidden border-t border-white/[0.06] bg-[#03101f]/95 md:hidden"
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-5 py-4">
            {nav.map(([label, href]) => (
              <a
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="flex min-h-11 items-center rounded-xl px-4 py-3 text-base font-medium text-slate-300 transition-colors duration-200 hover:bg-white/[0.05] hover:text-white"
              >
                {label}
              </a>
            ))}
            <a
              href="#contact"
              onClick={() => setMobileOpen(false)}
              className="mt-2 rounded-xl bg-white px-4 py-3 text-center text-sm font-bold text-slate-950"
            >
              Contact
            </a>
          </div>
        </motion.div>
      </header>

      <main id="main-content" tabIndex={-1} className="relative z-10 pt-20">
        <section id="home" className="relative isolate min-h-[calc(100svh-80px)] overflow-hidden">
          <HeroParticles />
          <OrbitVisual />
          <div className="hero-grid pointer-events-none absolute inset-0 opacity-55" aria-hidden="true" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-gradient-to-b from-transparent to-[#020817]" aria-hidden="true" />

          <motion.div
            style={reduceMotion ? undefined : { y: heroY, opacity: heroOpacity }}
            className="relative mx-auto flex min-h-[calc(100svh-80px)] max-w-7xl items-center px-5 py-16 sm:px-6 sm:py-24"
          >
            <div className="max-w-5xl">
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.55 }}
                className="availability-badge"
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-70" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-300" />
                </span>
                Abu Dhabi, UAE · Open to relevant opportunities
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08, duration: 0.5 }}
                className="mt-7 text-xs font-bold uppercase tracking-[0.24em] text-cyan-300 sm:text-sm"
              >
                Digital Marketing & MarTech Specialist
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, y: 32, rotateX: -14 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ delay: 0.12, duration: 0.72, type: 'spring', bounce: 0.16 }}
                className="hero-title mt-5 max-w-5xl font-display text-[clamp(3rem,8vw,6.6rem)] font-semibold leading-[0.98] tracking-[-0.055em] text-white"
              >
                I manage growth campaigns and build the <span className="gradient-text">systems behind them.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.34, duration: 0.55 }}
                className="mt-7 max-w-3xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8 md:text-xl"
              >
                Performance marketing, CRM, tracking, SEO, websites and automation — handled as one connected acquisition-to-sales system rather than separate tasks.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.42, duration: 0.55 }}
                className="mt-9 flex flex-wrap gap-3"
              >
                <a href="#work" className="primary-button">
                  View selected work <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </a>
                <a href={CONTACT.linkedin} target="_blank" rel="noreferrer" className="secondary-button">
                  <Linkedin aria-hidden="true" className="h-4 w-4 text-cyan-300" /> LinkedIn
                </a>
                <a href={CONTACT.github} target="_blank" rel="noreferrer" className="secondary-button">
                  <Github aria-hidden="true" className="h-4 w-4" /> GitHub
                </a>
                <a href={CONTACT.resume} target="_blank" rel="noreferrer" className="secondary-button">
                  <Download aria-hidden="true" className="h-4 w-4 text-emerald-300" /> Resume
                </a>
              </motion.div>

              <motion.div
                initial="hidden"
                animate="show"
                variants={{
                  hidden: { opacity: 0 },
                  show: { opacity: 1, transition: { delayChildren: 0.54, staggerChildren: 0.08 } },
                }}
                className="mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.08] lg:grid-cols-4"
              >
                {stats.map(([value, label]) => (
                  <motion.div
                    key={label}
                    variants={{
                      hidden: { opacity: 0, y: 18 },
                      show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 110 } },
                    }}
                    whileHover={reduceMotion ? undefined : { y: -4 }}
                    className="group bg-[#071424]/95 p-5 transition-colors hover:bg-[#0a1b2d] sm:p-6"
                  >
                    <div className="font-display text-xl font-semibold text-white transition-colors group-hover:text-emerald-300 sm:text-2xl">{value}</div>
                    <div className="mt-1.5 text-xs leading-5 text-slate-400 sm:text-sm">{label}</div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </section>

        <section id="about" className="relative overflow-hidden py-24 sm:py-28 lg:py-32">
          <div className="absolute inset-0 -skew-y-2 bg-[#071424]/72" aria-hidden="true" />
          <div className="pointer-events-none absolute -left-32 top-1/3 h-96 w-96 rounded-full bg-emerald-500/[0.07] blur-[100px]" aria-hidden="true" />
          <div className="relative mx-auto grid max-w-7xl gap-14 px-5 sm:px-6 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:gap-20">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="section-eyebrow"><span /> About</div>
              <h2 className="section-title">
                Marketing is the core.
                <span className="gradient-text block">Technical execution is the advantage.</span>
              </h2>
              <div className="mt-7 max-w-2xl space-y-5 text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
                <p>In my current role with a UAE real-estate business, I manage paid acquisition while also working on the CRM, tracking, website and follow-up workflows connected to the funnel.</p>
                <p>That includes a custom CRM with Meta, WhatsApp and SMS integrations, SLA workflows, custom WordPress functionality, UTM and conversion tracking, technical SEO, dashboards, n8n, Make, webhooks and scheduled scripts.</p>
                <p>I also support company-owned projects across e-commerce, travel and digital publishing, adapting the same marketing and technical principles to different business models.</p>
              </div>
            </motion.div>

            <div className="grid grid-cols-2 gap-4 sm:gap-5">
              {[
                [Target, 'Acquisition', 'High-ticket lead generation'],
                [Database, 'Lead Ops', 'CRM, routing and SLA'],
                [BarChart3, 'Measurement', 'Tracking and reporting'],
                [Workflow, 'Automation', 'APIs, n8n and Make'],
              ].map(([Icon, title, text], index) => {
                const Component = Icon as typeof Target;
                return (
                  <motion.div
                    key={String(title)}
                    whileHover={reduceMotion ? undefined : { y: -4 }}
                    transition={{ duration: 0.22 }}
                    className={`group surface-panel h-full rounded-2xl p-5 sm:p-6 ${index % 2 ? 'lg:translate-y-8' : ''}`}
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-emerald-300 transition-colors duration-200 group-hover:border-emerald-300/30">
                      <Component aria-hidden="true" className="h-5 w-5" />
                    </div>
                    <h3 className="mt-5 font-display text-base font-semibold text-white sm:text-lg">{String(title)}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-400">{String(text)}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="capabilities" className="relative mx-auto max-w-7xl px-5 py-24 sm:px-6 sm:py-28 lg:py-32">
          <SectionHeading
            eyebrow="Capabilities"
            title="One profile across acquisition, systems and execution."
            text="The focus is not on collecting tools. It is on knowing which part of the funnel needs work and being able to implement it."
            centered
          />

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {capabilities.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  {...reveal}
                  transition={{ duration: 0.55, delay: index * 0.055 }}
                >
                  <motion.article
                    whileHover={reduceMotion ? undefined : { y: -4 }}
                    transition={{ duration: 0.22 }}
                    className="group surface-panel relative h-full overflow-hidden rounded-3xl p-7 sm:p-8"
                  >
                    <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-slate-900/80 text-emerald-300 transition-colors duration-200 group-hover:border-emerald-300/35">
                      <Icon aria-hidden="true" className="h-5 w-5" />
                    </div>
                    <h3 className="relative mt-7 font-display text-xl font-semibold text-white">{item.title}</h3>
                    <p className="relative mt-3 text-base leading-7 text-slate-400">{item.text}</p>
                  </motion.article>
                </motion.div>
              );
            })}
          </div>
        </section>

        <section className="relative overflow-hidden border-y border-white/[0.06] bg-[#03101f]/72 py-20 sm:py-24">
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[440px] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/[0.055] blur-[100px]" aria-hidden="true" />
          <div className="relative mx-auto max-w-7xl px-5 sm:px-6">
            <SectionHeading
              eyebrow="Connected funnel"
              title="From ad click to sales follow-up, the data should stay connected."
              text="The technical work is there to support the marketing flow, not to become a separate layer the team has to fight with."
              centered
            />

            <div className="journey-shell">
              <motion.div
                aria-hidden="true"
                className="journey-line"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true, margin: '-120px' }}
                transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
              />
              <div className="relative grid gap-4 md:grid-cols-5 md:gap-3">
                {journey.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <motion.div
                      key={step.label}
                      initial={{ opacity: 0, y: 22 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-80px' }}
                      transition={{ duration: 0.5, delay: index * 0.09 }}
                      className="journey-step group"
                    >
                      <div className="journey-icon">
                        <Icon aria-hidden="true" className="h-5 w-5" />
                      </div>
                      <div className="mt-4 font-display text-base font-semibold text-white">{step.label}</div>
                      <div className="mt-1.5 text-xs leading-5 text-slate-400">{step.detail}</div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section id="work" className="relative overflow-hidden border-y border-white/[0.06] bg-[#061322]/78 py-24 sm:py-28 lg:py-32">
          <div className="pointer-events-none absolute left-1/2 top-1/3 h-[620px] w-[620px] -translate-x-1/2 rounded-full bg-cyan-500/[0.06] blur-[120px]" aria-hidden="true" />
          <div className="relative mx-auto max-w-7xl px-5 sm:px-6">
            <SectionHeading
              eyebrow="Selected work"
              title="Systems and workflows built around real business needs."
              text="Selected examples across high-ticket acquisition, CRM, reporting and publishing automation — using numbers only where they are supported."
            />

            <div className="space-y-7">
              {projects.map((project, index) => (
                <motion.article
                  key={project.title}
                  initial={{ opacity: 0, y: 34, scale: 0.985 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.62, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
                  className="group relative overflow-hidden rounded-[1.75rem] border border-white/[0.08] bg-[#04101e]/85 p-6 shadow-[0_28px_80px_rgba(0,0,0,.18)] transition duration-500 hover:border-cyan-300/25 sm:p-8 lg:p-10"
                >
                  <div className="relative grid gap-8 lg:grid-cols-[.82fr_1.18fr] lg:gap-12">
                    <div>
                      <div className="inline-flex rounded-full border border-cyan-300/15 bg-cyan-300/[0.06] px-3 py-1.5 text-xs font-bold tracking-[0.18em] text-cyan-300">
                        {project.tag}
                      </div>
                      <h3 className="mt-5 max-w-xl font-display text-2xl font-semibold leading-tight text-white transition-colors duration-300 group-hover:text-cyan-100 sm:text-3xl">
                        {project.title}
                      </h3>
                      <p className="mt-4 max-w-xl text-base leading-7 text-slate-400">{project.challenge}</p>
                    </div>
                    <div className="grid gap-5 md:grid-cols-[1fr_.92fr]">
                      <div>
                        <div className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">What I built</div>
                        <ul className="space-y-3">
                          {project.points.map((point) => (
                            <li key={point} className="flex gap-3 text-base leading-7 text-slate-300">
                              <CheckCircle2 aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-emerald-300" />
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
                        <div className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-300">Outcome</div>
                        <p className="mt-3 text-base leading-7 text-slate-400">{project.result}</p>
                      </div>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section className="relative mx-auto max-w-7xl px-5 py-24 sm:px-6 sm:py-28 lg:py-32">
          <SectionHeading
            eyebrow="Systems"
            title="The technical layer behind the marketing work."
            text="These are the recurring system types I build or maintain when the campaign needs more than an ad account."
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {systems.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  {...reveal}
                  transition={{ duration: 0.5, delay: index * 0.055 }}
                  whileHover={reduceMotion ? undefined : { y: -7 }}
                  className="group surface-panel relative overflow-hidden rounded-2xl p-6"
                >
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <Icon className="h-5 w-5 text-emerald-300" />
                  <h3 className="mt-5 font-display text-lg font-semibold text-white">{item.title}</h3>
                  <p className="mt-3 text-base leading-7 text-slate-400">{item.text}</p>
                </motion.div>
              );
            })}
          </div>
        </section>

        <section className="relative overflow-hidden border-y border-white/[0.06] bg-[#061322]/68 py-24 sm:py-28 lg:py-32">
          <div className="mx-auto max-w-7xl px-5 sm:px-6">
            <SectionHeading
              eyebrow="Tools & stack"
              title="Tools I use in day-to-day marketing and technical work."
              text="Only hands-on tools and workflows are listed here."
              centered
            />
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {stack.map(([category, ...tools], index) => (
                <motion.div
                  key={category}
                  {...reveal}
                  transition={{ duration: 0.48, delay: index * 0.04 }}
                  whileHover={reduceMotion ? undefined : { y: -5 }}
                  className="group surface-panel rounded-3xl p-6 sm:p-7"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-emerald-300 transition group-hover:border-emerald-300/30 group-hover:bg-emerald-300/[0.08]">
                      <Settings2 aria-hidden="true" className="h-4 w-4" />
                    </span>
                    <h3 className="font-display text-lg font-semibold text-white">{category}</h3>
                  </div>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {tools.map((tool) => (
                      <span key={tool} className="tool-chip">{tool}</span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="experience" className="relative mx-auto max-w-5xl px-5 py-24 sm:px-6 sm:py-28 lg:py-32">
          <SectionHeading
            eyebrow="Experience"
            title="Current role and earlier digital work."
            text="Marketing stays at the center, with technical implementation used to improve how acquisition and operations work together."
            centered
          />

          <div className="relative mx-auto max-w-4xl">
            <div className="absolute bottom-0 left-[15px] top-0 w-px bg-gradient-to-b from-emerald-300/40 via-cyan-300/20 to-transparent md:left-1/2" aria-hidden="true" />

            <div className="space-y-12 md:space-y-16">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-70px' }}
                transition={{ duration: 0.6 }}
                className="relative pl-11 md:w-1/2 md:pr-12 md:pl-0"
              >
                <span className="timeline-dot left-[8px] md:left-auto md:right-[-8px]" />
                <div className="group surface-panel rounded-3xl p-6 sm:p-8">
                  <div className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-300">Apr 2025 – Present</div>
                  <h3 className="mt-3 font-display text-2xl font-semibold text-white">Information Technology Consultant</h3>
                  <div className="mt-1 text-sm text-slate-400">Digital Marketing & Automation · Oplus Realty · Abu Dhabi</div>
                  <ul className="mt-6 space-y-3 text-base leading-7 text-slate-300">
                    <li>Manage Meta Ads and Google Ads for high-ticket real-estate lead generation, covering campaign setup, optimization, tracking and lead-quality analysis.</li>
                    <li>Built the company CRM around lead capture, routing, WhatsApp, SMS and SLA-based follow-up.</li>
                    <li>Develop and optimize the WordPress website, UTM/event tracking, landing pages, technical SEO, dashboards and automation workflows.</li>
                    <li>Create advertising assets using Photoshop and AI-assisted production workflows and build reporting or scheduled scripts when recurring work can be automated.</li>
                  </ul>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-70px' }}
                transition={{ duration: 0.6 }}
                className="relative pl-11 md:ml-auto md:w-1/2 md:pl-12"
              >
                <span className="timeline-dot left-[8px] md:left-[-8px]" />
                <div className="group surface-panel rounded-3xl p-6 sm:p-8">
                  <div className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-300">Jan 2021 – Mar 2025</div>
                  <h3 className="mt-3 font-display text-2xl font-semibold text-white">Freelance Digital Marketing Specialist & Website Manager</h3>
                  <div className="mt-1 text-sm text-slate-400">Remote</div>
                  <ul className="mt-6 space-y-3 text-base leading-7 text-slate-300">
                    <li>Managed websites using WordPress, Shopify, Joomla and Drupal.</li>
                    <li>Worked on technical SEO, on-page optimization, content, landing pages and site performance.</li>
                    <li>Managed paid campaigns, lead-generation funnels and tracking setup.</li>
                    <li>Combined marketing work with CRM, API and workflow automation where needed.</li>
                  </ul>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden py-24 sm:py-28 lg:py-32">
          <div className="pointer-events-none absolute -right-48 top-1/3 h-[520px] w-[520px] rounded-full bg-cyan-500/[0.055] blur-[120px]" aria-hidden="true" />
          <div className="relative mx-auto max-w-7xl px-5 sm:px-6">
            <SectionHeading
              eyebrow="Working style"
              title="What changes when marketing and implementation sit in the same workflow."
              text="The advantage is practical: fewer handoffs, cleaner data and faster execution when the funnel needs a technical fix."
              centered
            />
            <div className="grid gap-5 md:grid-cols-3">
              {differentiators.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.article
                    key={item.title}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.5, delay: index * 0.07 }}
                    whileHover={reduceMotion ? undefined : { y: -4 }}
                    className="group surface-panel relative overflow-hidden rounded-3xl p-7 sm:p-8"
                  >
                    <div className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-300/20 bg-emerald-300/[0.07] text-emerald-300">
                      <Icon aria-hidden="true" className="h-5 w-5" />
                    </div>
                    <h3 className="relative mt-6 font-display text-xl font-semibold text-white">{item.title}</h3>
                    <p className="relative mt-3 text-base leading-7 text-slate-400">{item.text}</p>
                  </motion.article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="contact" className="relative overflow-hidden border-t border-white/[0.06] py-24 sm:py-28 lg:py-32">
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[620px] w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/[0.09] blur-[130px]" aria-hidden="true" />
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.68 }}
            className="relative mx-auto max-w-5xl px-5 text-center sm:px-6"
          >
            <div className="section-eyebrow justify-center"><span /> Contact</div>
            <h2 className="mx-auto max-w-4xl font-display text-[clamp(2.7rem,7vw,5.8rem)] font-semibold leading-[1.02] tracking-[-0.05em] text-white">
              Connect marketing execution with
              <span className="gradient-text block">the systems behind it.</span>
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
              Based in Abu Dhabi and open to relevant digital marketing, performance marketing, MarTech and automation opportunities.
            </p>

            <div className="availability-badge mx-auto mt-8">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-300" />
              </span>
              Available for relevant opportunities
            </div>

            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
              <a href={`mailto:${CONTACT.email}`} className="primary-button justify-center">
                <Mail aria-hidden="true" className="h-4 w-4" /> Email
              </a>
              <a href={CONTACT.whatsapp} target="_blank" rel="noreferrer" className="contact-button justify-center">
                <MessageCircle aria-hidden="true" className="h-4 w-4 text-[#25D366]" /> WhatsApp
              </a>
              <a href={CONTACT.linkedin} target="_blank" rel="noreferrer" className="contact-button justify-center">
                <Linkedin aria-hidden="true" className="h-4 w-4 text-cyan-300" /> LinkedIn
              </a>
              <a href={CONTACT.github} target="_blank" rel="noreferrer" className="contact-button justify-center">
                <Github aria-hidden="true" className="h-4 w-4" /> GitHub
              </a>
              <a href={CONTACT.resume} target="_blank" rel="noreferrer" className="contact-button justify-center">
                <Download aria-hidden="true" className="h-4 w-4 text-emerald-300" /> Resume
              </a>
            </div>
          </motion.div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/[0.06] py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 text-center text-xs text-slate-400 sm:px-6 md:flex-row md:items-center md:justify-between md:text-left">
          <span>© {new Date().getFullYear()} Mohamed Adel Attia</span>
          <span>Digital Marketing · MarTech · CRM · SEO · Automation</span>
        </div>
      </footer>
    </div>
  );
}
