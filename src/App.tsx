import { motion } from 'motion/react';
import { ArrowUpRight, BarChart3, CheckCircle2, Code2, Database, Download, Linkedin, Mail, MessageCircle, Search, Settings2, Target, Workflow } from 'lucide-react';

const CONTACT = {
  email: 'info.moadel@gmail.com',
  whatsapp: 'https://wa.me/971562988714',
  linkedin: 'https://www.linkedin.com/in/mohamedadel-seo/',
  resume: '/resume.pdf',
};

const stats = [
  ['5+ years', 'Digital marketing experience'],
  ['Five-figure', 'Monthly paid-media budgets'],
  ['15–40%', 'Qualified-lead share in recent campaigns'],
  ['AED 1M–6M', 'Recent property ticket range'],
];

const capabilities = [
  { icon: Target, title: 'Performance Marketing', text: 'Meta Ads and Google Ads for high-ticket lead generation, including budget management, audience and placement strategy, creatives, landing pages, CPL review and lead-quality analysis.' },
  { icon: Database, title: 'CRM & Lead Operations', text: 'Custom CRM workflows, Meta lead integration, lead routing, WhatsApp and SMS communication, SLA-based follow-up and sales-process automation.' },
  { icon: BarChart3, title: 'Analytics & Tracking', text: 'GA4, GTM and Meta Pixel with UTM structure, conversion events, attribution checks and custom reporting across the acquisition-to-sales funnel.' },
  { icon: Search, title: 'SEO & Organic Growth', text: 'Technical SEO, on-page optimization, keyword strategy, Search Console analysis and content operations that support organic growth.' },
  { icon: Code2, title: 'Web Development', text: 'Hands-on WordPress development, custom functionality, landing pages, site-speed work, APIs, HTML/CSS and technical troubleshooting.' },
  { icon: Workflow, title: 'Automation & AI Workflows', text: 'n8n, Make, webhooks, scheduled scripts and API-based automation for repetitive marketing, reporting and publishing work.' },
];

const projects = [
  {
    tag: 'REAL ESTATE · PERFORMANCE',
    title: 'High-ticket lead generation for AED 1M–6M properties',
    points: ['Meta Ads + Google Ads across five-figure monthly budgets', 'Audience and placement strategy, creatives, lead forms and landing pages', 'CPL, lead quality and downstream CRM status tracked together'],
    result: 'Across recent three-month campaigns, roughly 15%–40% of total leads were qualified, with qualified prospects progressing to online and in-person meetings.',
  },
  {
    tag: 'REAL ESTATE · CRM',
    title: 'Custom lead-management system',
    points: ['Custom CRM built around the sales process', 'Meta lead sources connected directly to the CRM', 'WhatsApp + SMS flows, lead routing and SLA follow-up logic'],
    result: 'Lead capture, assignment, communication and follow-up now run through one connected operational flow.',
  },
  {
    tag: 'REPORTING · AUTOMATION',
    title: 'Dashboards, APIs and scheduled utilities',
    points: ['Custom reporting views from ad-platform exports', 'API integrations where direct data access made sense', 'Scripts that run locally or on a server on scheduled intervals'],
    result: 'Recurring reporting and data-processing tasks became easier to repeat without unnecessary manual steps.',
  },
  {
    tag: 'SEO · CONTENT OPERATIONS',
    title: 'SEO content and publishing automation',
    points: ['Workflow for research, drafting, optimization and publishing', 'Automated source collection, enrichment and validation for two news properties', 'Routine publishing with minimal manual intervention'],
    result: 'Supported consistent publishing and stronger search visibility while reducing repetitive production work.',
  },
];

const stack = [
  ['Advertising', 'Meta Ads Manager', 'Google Ads', 'Lead Forms', 'Audience & Placement Strategy'],
  ['Measurement', 'GA4', 'Google Tag Manager', 'Meta Pixel', 'UTM Tracking', 'Conversion Events', 'Attribution Checks'],
  ['CRM & Automation', 'Custom CRM', 'n8n', 'Make', 'Webhooks', 'APIs', 'WhatsApp API', 'SMS', 'Scheduled Scripts'],
  ['SEO & Web', 'Google Search Console', 'SEMrush', 'Ahrefs', 'Moz', 'WordPress', 'WooCommerce', 'Shopify', 'Elementor'],
  ['Reporting & Creative', 'Custom Dashboards', 'API Reporting', 'Platform Exports', 'Adobe Photoshop', 'Figma', 'AI-assisted Creative Work'],
];

const reveal = { initial: { opacity: 0, y: 18 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-70px' }, transition: { duration: 0.45 } };

function Heading({ eyebrow, title, text }: { eyebrow: string; title: string; text?: string }) {
  return <motion.div {...reveal} className="mb-12 max-w-3xl"><div className="section-eyebrow">{eyebrow}</div><h2 className="section-title">{title}</h2>{text && <p className="section-copy">{text}</p>}</motion.div>;
}

export default function App() {
  return (
    <div className="min-h-screen bg-[#07111f] text-slate-100">
      <header className="sticky top-0 z-50 border-b border-white/8 bg-[#07111f]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <a href="#home" className="font-display text-lg font-semibold text-white">Mohamed Adel Attia</a>
          <nav className="hidden items-center gap-7 md:flex" aria-label="Primary navigation">
            <a href="#about" className="nav-link">About</a><a href="#capabilities" className="nav-link">Capabilities</a><a href="#work" className="nav-link">Selected Work</a><a href="#experience" className="nav-link">Experience</a>
            <a href="#contact" className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300">Contact</a>
          </nav>
        </div>
      </header>

      <main>
        <section id="home" className="relative overflow-hidden">
          <div className="hero-grid absolute inset-0 opacity-40" aria-hidden="true" /><div className="absolute -right-20 top-16 h-96 w-96 rounded-full bg-emerald-400/10 blur-3xl" aria-hidden="true" />
          <div className="relative mx-auto max-w-7xl px-6 py-24 md:py-32 lg:py-40">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }} className="max-w-5xl">
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/7 px-4 py-2 text-sm font-medium text-emerald-200"><span className="h-2 w-2 rounded-full bg-emerald-300" />Abu Dhabi, UAE · Open to relevant opportunities</div>
              <p className="mb-5 text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300">Digital Marketing & MarTech Specialist</p>
              <h1 className="max-w-5xl font-display text-5xl font-semibold leading-[1.02] tracking-[-0.04em] text-white md:text-7xl lg:text-[5.7rem]">I manage growth campaigns and build the systems behind them.</h1>
              <p className="mt-8 max-w-3xl text-lg leading-8 text-slate-300 md:text-xl">Performance marketing, CRM, tracking, SEO, websites and automation — handled as one connected acquisition-to-sales system rather than separate tasks.</p>
              <div className="mt-10 flex flex-wrap gap-3">
                <a href="#work" className="primary-button">View selected work <ArrowUpRight className="h-4 w-4" /></a>
                <a href={CONTACT.linkedin} target="_blank" rel="noreferrer" className="secondary-button"><Linkedin className="h-4 w-4" /> LinkedIn</a>
                <a href={CONTACT.resume} target="_blank" rel="noreferrer" className="secondary-button"><Download className="h-4 w-4" /> Resume</a>
              </div>
            </motion.div>
            <div className="mt-20 grid overflow-hidden rounded-2xl border border-white/8 bg-white/[0.025] sm:grid-cols-2 lg:grid-cols-4">
              {stats.map(([value, label]) => <div key={label} className="border-b border-white/8 p-6 last:border-0 sm:border-r lg:border-b-0"><div className="font-display text-2xl font-semibold text-white">{value}</div><div className="mt-1 text-sm text-slate-400">{label}</div></div>)}
            </div>
          </div>
        </section>

        <section id="about" className="border-y border-white/8 bg-[#091625]">
          <div className="mx-auto grid max-w-7xl gap-12 px-6 py-24 lg:grid-cols-[1fr_1fr] lg:py-28">
            <Heading eyebrow="About" title="Marketing is the core. Technical execution is the advantage." text="I work across both sides of digital growth: acquiring demand and building the infrastructure that helps the business handle it properly." />
            <motion.div {...reveal} className="space-y-5 text-base leading-7 text-slate-300"><p>In my current role with a UAE real-estate business, I manage paid acquisition while also working on the CRM, tracking, website and follow-up workflows connected to the funnel.</p><p>That includes a custom CRM with Meta, WhatsApp and SMS integrations, SLA workflows, custom WordPress functionality, UTM and conversion tracking, technical SEO, dashboards, n8n, Make, webhooks and scheduled scripts.</p><p>I also support company-owned projects across e-commerce, travel and digital publishing, adapting the same marketing and technical principles to different business models.</p></motion.div>
          </div>
        </section>

        <section id="capabilities" className="mx-auto max-w-7xl px-6 py-24 lg:py-28">
          <Heading eyebrow="Capabilities" title="One profile across acquisition, systems and execution." text="The focus is not on collecting tools. It is on knowing which part of the funnel needs work and being able to implement it." />
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{capabilities.map((item, index) => { const Icon = item.icon; return <motion.article key={item.title} {...reveal} transition={{ duration: 0.45, delay: index * 0.04 }} className="card-panel p-7"><div className="mb-6 flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-300/15 bg-emerald-300/8 text-emerald-300"><Icon className="h-5 w-5" /></div><h3 className="font-display text-xl font-semibold text-white">{item.title}</h3><p className="mt-3 text-sm leading-6 text-slate-400">{item.text}</p></motion.article>; })}</div>
        </section>

        <section id="work" className="border-y border-white/8 bg-[#091625]">
          <div className="mx-auto max-w-7xl px-6 py-24 lg:py-28"><Heading eyebrow="Selected work" title="Systems and workflows built around real business needs." text="Quantitative claims are only used where they are documented." />
            <div className="grid gap-6 lg:grid-cols-2">{projects.map((item, index) => <motion.article key={item.title} {...reveal} transition={{ duration: 0.45, delay: index * 0.04 }} className="rounded-2xl border border-white/8 bg-[#07111f] p-7 md:p-8"><div className="text-xs font-semibold tracking-[0.16em] text-cyan-300">{item.tag}</div><h3 className="mt-4 font-display text-2xl font-semibold text-white">{item.title}</h3><ul className="mt-6 space-y-3">{item.points.map(point => <li key={point} className="flex gap-3 text-sm leading-6 text-slate-300"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-300" />{point}</li>)}</ul><div className="mt-6 rounded-xl border border-white/8 bg-white/[0.03] p-5"><div className="text-sm font-semibold text-white">Outcome</div><p className="mt-2 text-sm leading-6 text-slate-400">{item.result}</p></div></motion.article>)}</div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-24 lg:py-28"><Heading eyebrow="Tools & stack" title="Tools I use in day-to-day marketing and technical work." />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{stack.map(([category, ...tools], index) => <motion.div key={category} {...reveal} transition={{ duration: 0.4, delay: index * 0.03 }} className="card-panel p-6"><div className="mb-5 flex items-center gap-3"><Settings2 className="h-4 w-4 text-emerald-300" /><h3 className="font-semibold text-white">{category}</h3></div><div className="flex flex-wrap gap-2">{tools.map(tool => <span key={tool} className="rounded-lg border border-white/8 bg-white/[0.03] px-3 py-2 text-sm text-slate-300">{tool}</span>)}</div></motion.div>)}</div>
        </section>

        <section id="experience" className="border-y border-white/8 bg-[#091625]"><div className="mx-auto max-w-7xl px-6 py-24 lg:py-28"><Heading eyebrow="Experience" title="Current role and earlier digital work." />
          <div className="grid gap-6 lg:grid-cols-2">
            <motion.article {...reveal} className="rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.04] p-7 md:p-9"><div className="text-sm font-semibold text-emerald-300">Apr 2025 – Present</div><h3 className="mt-3 font-display text-2xl font-semibold text-white">Information Technology Consultant</h3><div className="mt-1 text-slate-400">Digital Marketing & Automation · Oplus Realty · Abu Dhabi</div><ul className="mt-7 space-y-4 text-sm leading-6 text-slate-300"><li>Manage Meta Ads and Google Ads for high-ticket real-estate lead generation across five-figure monthly paid-media budgets.</li><li>Built the company CRM around lead capture, routing, WhatsApp, SMS and SLA-based follow-up.</li><li>Develop and optimize the WordPress website, UTM/event tracking, landing pages, technical SEO, dashboards and automation workflows.</li><li>Create advertising assets using Photoshop and AI-assisted production workflows and build reporting or scheduled scripts when recurring work can be automated.</li></ul></motion.article>
            <motion.article {...reveal} className="card-panel p-7 md:p-9"><div className="text-sm font-semibold text-cyan-300">Jan 2021 – Mar 2025</div><h3 className="mt-3 font-display text-2xl font-semibold text-white">Freelance Digital Marketing Specialist & Website Manager</h3><div className="mt-1 text-slate-400">Remote</div><ul className="mt-7 space-y-4 text-sm leading-6 text-slate-300"><li>Managed websites using WordPress, Shopify, Joomla and Drupal.</li><li>Worked on technical SEO, on-page optimization, content, landing pages and site performance.</li><li>Managed paid campaigns, lead-generation funnels and tracking setup.</li><li>Combined marketing work with CRM, API and workflow automation where needed.</li></ul></motion.article>
          </div></div>
        </section>

        <section id="contact" className="mx-auto max-w-7xl px-6 py-24 lg:py-32"><motion.div {...reveal} className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-emerald-300/[0.05] p-8 md:p-12"><div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end"><div><div className="section-eyebrow">Contact</div><h2 className="max-w-3xl font-display text-4xl font-semibold tracking-tight text-white md:text-5xl">Connect marketing execution with the systems behind it.</h2><p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">Based in Abu Dhabi and open to relevant digital marketing, performance marketing, MarTech and automation opportunities.</p></div><div className="flex flex-wrap gap-3 lg:justify-end"><a href={'mailto:' + CONTACT.email} className="contact-button"><Mail className="h-4 w-4" />Email</a><a href={CONTACT.whatsapp} target="_blank" rel="noreferrer" className="contact-button"><MessageCircle className="h-4 w-4" />WhatsApp</a><a href={CONTACT.linkedin} target="_blank" rel="noreferrer" className="contact-button"><Linkedin className="h-4 w-4" />LinkedIn</a></div></div></motion.div></section>
      </main>
      <footer className="border-t border-white/8 py-8"><div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between"><span>© {new Date().getFullYear()} Mohamed Adel Attia</span><span>Digital Marketing · MarTech · CRM · SEO · Automation</span></div></footer>
    </div>
  );
}
