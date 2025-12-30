"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  Menu,
  X,
  Search,
  Moon,
  Sun,
  Terminal,
  ChevronDown,
  Code,
  Database,
  Brush,
  Rocket,
  ArrowRight,
} from "lucide-react";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  children: React.ReactNode;
  active?: boolean;
}

const NavLink = ({ href, children, active = false }: NavItem) => (
  <Link
    href={href}
    className={`group relative px-1 py-2 text-sm font-medium transition-colors ${
      active
        ? "text-primary"
        : "text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-white"
    }`}
  >
    {children}
    <span
      className={`absolute -bottom-5.5 left-0 h-0.75 rounded-t-full bg-primary transition-all duration-300 ${
        active ? "w-full" : "w-0 group-hover:w-full"
      }`}
    ></span>
  </Link>
);

export default function Navbar() {
  const pathName = usePathname();
  const [mounted, setMounted] = useState(false);
  const { setTheme, resolvedTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Hydration error prevent korar jonno
  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const isDark = resolvedTheme === "dark";

  if (!mounted) return null;

  // Then, in your component, you can use NavLink like this:
  // ...
  <NavLink href="/" active>
    Home
  </NavLink>;
  // ...

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-white/10 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md transition-all duration-300">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20 transition-transform group-hover:scale-110">
              <Terminal size={20} />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              DevLog
            </span>
          </Link>
        </div>

        {/* Center: Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <NavLink href="/" active={pathName === "/" ? true : false}>
            Home
          </NavLink>
          <NavLink href="/blog" active={pathName === "/blog" ? true : false}>Blog / Articles</NavLink>

          {/* Mega Menu Trigger */}
          <div className="group relative flex h-20 items-center cursor-pointer">
            <button className="flex items-center gap-1 text-sm font-medium text-slate-600 dark:text-slate-300 group-hover:text-primary dark:group-hover:text-white outline-none">
              Categories
              <ChevronDown
                size={18}
                className="transition-transform duration-300 group-hover:rotate-180"
              />
            </button>

            {/* Mega Menu Dropdown */}
            <div className="absolute left-1/2 top-full w-137.5 -translate-x-1/2 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top -translate-y-2 group-hover:translate-y-0">
              <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900 p-6 shadow-2xl">
                <div className="grid grid-cols-2 gap-6">
                  {/* Category Items */}
                  <CategoryItem
                    icon={<Code className="text-blue-500" />}
                    title="Frontend"
                    desc="React, Vue, & Tailwind CSS"
                    bgColor="bg-blue-50 dark:bg-blue-500/10"
                  />
                  <CategoryItem
                    icon={<Database className="text-emerald-500" />}
                    title="Backend"
                    desc="Node, Python & PostgreSQL"
                    bgColor="bg-emerald-50 dark:bg-emerald-500/10"
                  />
                  <CategoryItem
                    icon={<Brush className="text-purple-500" />}
                    title="UI/UX Design"
                    desc="Figma & Design Systems"
                    bgColor="bg-purple-50 dark:bg-purple-500/10"
                  />
                  <CategoryItem
                    icon={<Rocket className="text-orange-500" />}
                    title="Productivity"
                    desc="Agile & Modern Workflows"
                    bgColor="bg-orange-50 dark:bg-orange-500/10"
                  />
                </div>
                <div className="mt-6 border-t border-gray-100 dark:border-white/5 pt-4">
                  <Link
                    href="/categories"
                    className="flex items-center justify-between rounded-lg bg-slate-50 dark:bg-white/5 px-4 py-3 text-sm font-medium text-primary hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                  >
                    <span>Explore all topics</span>
                    <ArrowRight size={18} />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <NavLink href="/about" active={pathName === "/about" ? true : false}>About</NavLink>
        </div>

        {/* Right: Utilities */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Search Bar */}
          <div className="relative hidden sm:block">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search..."
              className="h-10 w-32 lg:w-48 rounded-full bg-slate-100 dark:bg-white/5 pl-10 pr-4 text-sm outline-none focus:w-64 focus:ring-2 focus:ring-primary/20 transition-all duration-300 dark:text-white"
            />
          </div>

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:text-primary transition-colors"
          >
            {isDark ? (
              <Sun size={20} className="text-yellow-400" />
            ) : (
              <Moon size={20} />
            )}
          </button>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-slate-600 dark:text-slate-300"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-950 border-b border-gray-200 dark:border-white/10 p-4 space-y-4 animate-in slide-in-from-top-5">
          <Link href="/" className="block px-4 py-2 text-primary font-medium">
            Home
          </Link>
          <Link
            href="/blog"
            className="block px-4 py-2 text-slate-600 dark:text-slate-300"
          >
            Articles
          </Link>
          <Link
            href="/categories"
            className="block px-4 py-2 text-slate-600 dark:text-slate-300"
          >
            Categories
          </Link>
          <div className="pt-4 border-t border-gray-100 dark:border-white/5">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                className="w-full bg-slate-100 dark:bg-white/5 rounded-xl py-3 pl-10 text-sm outline-none"
                placeholder="Search articles..."
              />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

interface CategoryItemProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
  bgColor: string;
}

function CategoryItem({ icon, title, desc, bgColor }: CategoryItemProps) {
  return (
    <Link
      href="#"
      className="flex items-start gap-4 rounded-xl p-3 transition-colors hover:bg-slate-50 dark:hover:bg-white/5 group/item"
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${bgColor} group-hover/item:scale-110 transition-transform`}
      >
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-900 dark:text-white">
          {title}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {desc}
        </p>
      </div>
    </Link>
  );
}
