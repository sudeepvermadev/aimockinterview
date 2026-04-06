import Link from "next/link";
import Image from "next/image";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--border-subtle)] bg-[var(--surface-base)] mt-20">
      <div className="max-w-7xl mx-auto px-6 py-14 flex flex-col md:flex-row items-center justify-between gap-8">
        
        {/* Logo + Tagline */}
        <div className="flex flex-col items-center md:items-start gap-3">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="p-1 bg-white/10 rounded-xl transition-all duration-300 group-hover:bg-blue-500/20">
              <Image 
                src="/logonew.png" 
                alt="PrepEdge" 
                height={28} 
                width={24} 
                style={{ height: "auto", width: "auto" }} 
                className="p-1 bg-gray-50 rounded-xl transition-all duration-300 group-hover:bg-blue-50 group-hover:-translate-y-0.5"
              />
            </div>
            <span className="text-[var(--text-primary)] font-bold text-xl tracking-tight">
              Prep<span className="bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">Edge</span>
            </span>
          </Link>
          <p className="text-gray-600 text-sm max-w-xs text-center md:text-left">
            AI-powered mock interviews to help you land your dream job.
          </p>
        </div>

        {/* Nav Links */}
        <nav className="flex flex-wrap justify-center gap-x-8 gap-y-3">
          {[
            { label: "Dashboard", href: "/" },
            { label: "Mock Interview", href: "/interview" },
            { label: "Profile", href: "/profile" },
            { label: "Sign In", href: "/sign-in" },
          ].map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="text-[var(--text-secondary)] hover:text-white text-sm font-medium transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Copyright */}
        <p className="text-gray-700 text-xs font-medium text-center md:text-right">
          © {year} PrepEdge. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
