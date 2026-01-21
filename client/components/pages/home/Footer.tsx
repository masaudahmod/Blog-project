"use client";

import Link from "next/link";
import { Terminal, Twitter, Globe } from "lucide-react";

interface FooterLink {
  label: string;
  href: string;
}

interface FooterProps { // Define footer props
  brandName?: string; // Optional brand name
  brandDescription?: string; // Optional brand description
} // End FooterProps

const categories: FooterLink[] = [
  { label: "Machine Learning", href: "/categories?cat=machine-learning" },
  { label: "Robotics", href: "/categories?cat=robotics" },
  { label: "Ethics", href: "/categories?cat=ethics" },
  { label: "Hardware", href: "/categories?cat=hardware" },
];

const companyLinks: FooterLink[] = [
  { label: "About Us", href: "/about" },
  { label: "Careers", href: "/careers" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

export default function Footer({ brandName, brandDescription }: FooterProps) { // Render footer component
  const currentYear = new Date().getFullYear(); // Read current year
  const displayBrandName = brandName || "AI News"; // Resolve brand name
  const displayBrandDescription = // Resolve brand description
    brandDescription || "The leading source for artificial intelligence news, research, and tutorials."; // Provide fallback description

  return (
    <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Left Column - Logo and Description */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20 transition-transform group-hover:scale-110">
                <Terminal size={20} />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                {displayBrandName}
              </span>{/* Brand name */}
            </Link>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xs">
              {displayBrandDescription}
            </p>{/* Brand description */}
          </div>

          {/* Middle Column - Categories */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
              Categories
            </h4>
            <ul className="space-y-2">
              {categories.map((category) => (
                <li key={category.href}>
                  <Link
                    href={category.href}
                    className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
                  >
                    {category.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Column - Company */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
              Company
            </h4>
            <ul className="space-y-2">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Row - Copyright and Social Icons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-slate-200 dark:border-slate-800">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            © {currentYear} AI News Inc. All rights reserved.
          </p>

          {/* Social Icons */}
          <div className="flex items-center gap-4">
            <Link
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
              aria-label="Twitter"
            >
              <Twitter size={20} />
            </Link>
            <Link
              href="#"
              className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
              aria-label="Website"
            >
              <Globe size={20} />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
