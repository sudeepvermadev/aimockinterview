"use client";

import React from "react";
import { ShieldCheck } from "lucide-react";

const companies = [
  { name: "Google", domain: "google.com" },
  { name: "Microsoft", domain: "microsoft.com" },
  { name: "Amazon", domain: "amazon.com" },
  { name: "Meta", domain: "meta.com" },
  { name: "Apple", domain: "apple.com" },
  { name: "Netflix", domain: "netflix.com" },
  { name: "Uber", domain: "uber.com" },
  { name: "Airbnb", domain: "airbnb.com" },
  { name: "Stripe", domain: "stripe.com" },
  { name: "Coinbase", domain: "coinbase.com" },
  { name: "Spotify", domain: "spotify.com" },
  { name: "Adobe", domain: "adobe.com" },
  { name: "Salesforce", domain: "salesforce.com" },
  { name: "Oracle", domain: "oracle.com" },
  { name: "IBM", domain: "ibm.com" },
  { name: "Intel", domain: "intel.com" },
  { name: "NVIDIA", domain: "nvidia.com" },
  { name: "Tesla", domain: "tesla.com" },
  { name: "LinkedIn", domain: "linkedin.com" },
  { name: "SpaceX", domain: "spacex.com" },
  { name: "Samsung", domain: "samsung.com" },
  { name: "Sony", domain: "sony.com" },
  { name: "TikTok", domain: "tiktok.com" },
  { name: "Shopee", domain: "shopee.com" },
  { name: "Grab", domain: "grab.com" },
  { name: "Nokia", domain: "nokia.com" },
  { name: "Toyota", domain: "toyota.com" },
  { name: "BMW", domain: "bmw.com" },
  { name: "AMD", domain: "amd.com" },
  { name: "Unity", domain: "unity.com" },
  { name: "Zoom", domain: "zoom.us" },
  { name: "Slack", domain: "slack.com" },
  { name: "Discord", domain: "discord.com" },
  { name: "Pinterest", domain: "pinterest.com" },
  { name: "Reddit", domain: "reddit.com" },
  { name: "PayPal", domain: "paypal.com" },
  { name: "Visa", domain: "visa.com" },
  { name: "Mastercard", domain: "mastercard.com" },
  { name: "GitHub", domain: "github.com" },
  { name: "GitLab", domain: "gitlab.com" },
  { name: "Atlassian", domain: "atlassian.com" },
  { name: "Notion", domain: "notion.so" },
  { name: "Figma", domain: "figma.com" },
  { name: "Canva", domain: "canva.com" },
  { name: "Shopify", domain: "shopify.com" },
  { name: "Wix", domain: "wix.com" },
  { name: "Squarespace", domain: "squarespace.com" },
  { name: "Robinhood", domain: "robinhood.com" },
  { name: "Revolut", domain: "revolut.com" },
  { name: "Klarna", domain: "klarna.com" },
  { name: "HubSpot", domain: "hubspot.com" },
  { name: "Zendesk", domain: "zendesk.com" },
  { name: "Twitter", domain: "x.com" },
  { name: "Trello", domain: "trello.com" },
  { name: "Asana", domain: "asana.com" },
];

const technologies = [
  { name: "TypeScript", slug: "typescript" },
  { name: "JavaScript", slug: "javascript" },
  { name: "Python", slug: "python" },
  { name: "Java", slug: "openjdk" },
  { name: "C++", slug: "cplusplus" },
  { name: "C#", slug: "csharp" },
  { name: "React", slug: "react" },
  { name: "Next.js", slug: "nextdotjs" },
  { name: "Node.js", slug: "nodedotjs" },
  { name: "Go", slug: "go" },
  { name: "Rust", slug: "rust" },
  { name: "Docker", slug: "docker" },
  { name: "Kubernetes", slug: "kubernetes" },
  { name: "AWS", slug: "amazonaws" },
  { name: "Firebase", slug: "firebase" },
  { name: "Flutter", slug: "flutter" },
  { name: "Vue.js", slug: "vuedotjs" },
  { name: "Angular", slug: "angular" },
  { name: "GraphQL", slug: "graphql" },
  { name: "TensorFlow", slug: "tensorflow" },
  { name: "PyTorch", slug: "pytorch" },
  { name: "OpenAI", slug: "openai" },
  { name: "Sass", slug: "sass" },
  { name: "Tailwind CSS", slug: "tailwindcss" },
  { name: "PostgreSQL", slug: "postgresql" },
  { name: "MongoDB", slug: "mongodb" },
  { name: "Redis", slug: "redis" },
  { name: "Elasticsearch", slug: "elasticsearch" },
  { name: "Vite", slug: "vite" },
  { name: "Git", slug: "git" },
  { name: "Swift", slug: "swift" },
  { name: "Kotlin", slug: "kotlin" },
  { name: "Ruby", slug: "ruby" },
  { name: "PHP", slug: "php" },
  { name: "SQL", slug: "mysql" },
  { name: "HTML5", slug: "html5" },
  { name: "CSS3", slug: "css3" },
  { name: "R", slug: "r" },
  { name: "Scala", slug: "scala" },
  { name: "Haskell", slug: "haskell" },
  { name: "Elixir", slug: "elixir" },
  { name: "Terraform", slug: "terraform" },
  { name: "Ansible", slug: "ansible" },
  { name: "Jenkins", slug: "jenkins" },
  { name: "Azure", slug: "microsoftazure" },
  { name: "GCP", slug: "googlecloud" },
  { name: "Heroku", slug: "heroku" },
  { name: "Vercel", slug: "vercel" },
  { name: "Netlify", slug: "netlify" },
  { name: "Supabase", slug: "supabase" },
  { name: "Prisma", slug: "prisma" },
  { name: "Redux", slug: "redux" },
  { name: "Django", slug: "django" },
  { name: "Laravel", slug: "laravel" },
];

const TrustedBy = () => {
  const duplicatedCompanies = [...companies, ...companies];
  const duplicatedTech = [...technologies, ...technologies];

  return (
    <section className="py-24 border-t border-[var(--border-subtle)] relative overflow-hidden bg-[var(--surface-base)]">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
      
      <div className="w-full max-w-7xl mx-auto px-6 text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-extrabold text-[var(--text-primary)] tracking-tight mb-6">
          Bridge the Gap to Your <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-500 bg-clip-text text-transparent">Dream Role</span>
        </h2>
        <p className="text-[var(--text-secondary)] text-base md:text-lg font-medium max-w-3xl mx-auto leading-relaxed opacity-90">
          Our simulations are engineered to meet the technical benchmarks of the world&apos;s most innovative engineering teams. 
          Master the same interview patterns used by global leaders.
        </p>
      </div>

      {/* Featured Badge Decoration - Using Lucide for perfect transparency and quality */}
      <div className="flex justify-center mb-12">
        <div className="relative group cursor-pointer active:scale-95 transition-transform duration-300">
          <div className="absolute -inset-6 bg-blue-500/30 blur-2xl rounded-full animate-pulse group-hover:bg-blue-400/50 transition-colors" />
          <div className="relative z-20 w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center border-2 border-white/20 shadow-2xl overflow-hidden group-hover:rotate-6 transition-transform">
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <ShieldCheck className="w-12 h-12 md:w-16 md:h-16 text-white drop-shadow-lg" />
          </div>
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-[10px] font-bold px-3 py-1 rounded-full whitespace-nowrap shadow-xl border border-white/20 scale-0 group-hover:scale-100 transition-transform">
            AI READY STANDARD
          </div>
        </div>
      </div>

      {/* Companies Slider (Forward) */}
      <div className="space-y-12">
        <div className="relative flex overflow-x-hidden group">
          {/* Fading Edges */}
          <div className="absolute inset-y-0 left-0 w-24 md:w-48 bg-gradient-to-r from-[var(--surface-base)] to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-24 md:w-48 bg-gradient-to-l from-[var(--surface-base)] to-transparent z-10 pointer-events-none" />

          <div className="animate-marquee whitespace-nowrap flex items-center gap-16 md:gap-24 py-6">
            {duplicatedCompanies.map((company, index) => (
              <div 
                key={index}
                className="flex items-center gap-4 group/logo transition-all duration-300"
              >
                <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-xl bg-white p-1.5 shadow-sm border border-gray-100 group-hover/logo:scale-110 transition-transform dark:bg-gray-100">
                  <img
                    src={`https://www.google.com/s2/favicons?domain=${company.domain}&sz=128`}
                    alt={company.name}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <span className="text-lg md:text-2xl font-bold tracking-tight text-[var(--text-primary)] opacity-60 group-hover/logo:opacity-100 transition-opacity whitespace-nowrap">
                  {company.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Tech Slider (Reverse) */}
        <div className="relative flex overflow-x-hidden group">
          {/* Fading Edges */}
          <div className="absolute inset-y-0 left-0 w-24 md:w-48 bg-gradient-to-r from-[var(--surface-base)] to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-24 md:w-48 bg-gradient-to-l from-[var(--surface-base)] to-transparent z-10 pointer-events-none" />

          <div className="animate-marquee-reverse whitespace-nowrap flex items-center gap-10 md:gap-14 py-6 opacity-80 hover:opacity-100 transition-opacity duration-500">
            {duplicatedTech.map((tech, index) => (
              <div 
                key={index}
                className="flex items-center gap-3 bg-[var(--surface-card-alt)] px-5 py-3 rounded-full border border-[var(--border-subtle)] hover:border-blue-500/50 transition-colors shadow-sm group/tech"
              >
                <img
                  src={`https://cdn.simpleicons.org/${tech.slug}`}
                  alt={tech.name}
                  className="w-5 h-5 md:w-6 md:h-6 object-contain group-hover/tech:scale-110 transition-transform"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = `https://www.google.com/s2/favicons?domain=${tech.name.toLowerCase()}.com&sz=64`;
                  }}
                />
                <span className="text-sm md:text-base font-semibold text-[var(--text-primary)]">
                  {tech.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Subtle Disclaimer for Fair Use / Professionalism */}
      <div className="mt-16 text-center opacity-20 hover:opacity-50 transition-opacity duration-500">
        <p className="text-[10px] uppercase tracking-[0.2em] font-medium text-[var(--text-secondary)]">
          Logos are trademarks of their respective owners • For representational purposes only
        </p>
      </div>
    </section>
  );
};

export default TrustedBy;
