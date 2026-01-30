"use client";

import {
  IconCircleCheck,
  IconPalette,
  IconUser,
  IconMail,
  IconExternalLink,
  IconCamera,
  IconX,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { User } from "@/lib/type";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
  FieldSet,
} from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useTheme } from "next-themes";

type SettingsTab = "account" | "appearance";

const profileNav = [
  { id: "account" as const, title: "Account", icon: IconCircleCheck },
  { id: "appearance" as const, title: "Appearance", icon: IconPalette },
];

// Dummy data for now – replace with real API later
const DUMMY_USER: User = {
  id: 1,
  name: "Super Admin",
  email: "admin@example.com",
  avatar: "https://i.ibb.co/B20xhbHW/user-dummy.jpg",
  headline: "CMS administrator for My Blog.",
  role: "admin",
};

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(DUMMY_USER);
  const [activeTab, setActiveTab] = useState<SettingsTab>("account");
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(DUMMY_USER.name);
  const [email, setEmail] = useState(DUMMY_USER.email);
  const [headline, setHeadline] = useState(DUMMY_USER.headline ?? "");
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(t);
  }, []);

  const handleSaveProfile = async () => {
    setSaving(true);
    // TODO: call updateProfile when API is ready
    // const result = await updateProfile({ name, email, headline: headline || undefined });
    await new Promise((r) => setTimeout(r, 500)); // simulate save
    setSaving(false);
    setUser((prev) =>
      prev ? { ...prev, name, email, headline: headline || undefined } : null
    );
    toast.success("Profile saved");
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">
          {activeTab === "account" ? "Profile" : "Appearance"}
        </h1>
        {activeTab === "account" && (
          <Button
            onClick={handleSaveProfile}
            disabled={saving}
            className="bg-foreground text-background hover:bg-foreground/90"
          >
            {saving ? "Saving…" : "Save"}
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Left sidebar - profile nav */}
        <aside className="flex w-full shrink-0 flex-col gap-6 lg:w-56">
          <div className="flex flex-col items-start gap-3 rounded-lg border bg-card p-4">
            <Avatar className="h-14 w-14 rounded-full">
              <AvatarImage
                src={user?.avatar ?? "https://i.ibb.co/B20xhbHW/user-dummy.jpg"}
                alt={user?.name ?? "User"}
              />
              <AvatarFallback className="rounded-full text-lg">
                {(user?.name ?? "U").slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex w-full flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{user?.name ?? "User"}</span>
                <IconExternalLink className="size-3.5 text-muted-foreground" />
              </div>
              <span className="text-sm text-muted-foreground">{user?.email ?? "—"}</span>
            </div>
          </div>

          <nav className="flex flex-col gap-0.5">
            <p className="mb-2 px-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Profile details
            </p>
            {profileNav.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-medium transition-colors",
                  activeTab === item.id
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="size-4 shrink-0" />
                {item.title}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1 rounded-lg border bg-card p-6">
          {activeTab === "account" && (
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                <div className="relative shrink-0">
                  <Avatar className="h-24 w-24 rounded-full ring-2 ring-border">
                    <AvatarImage
                      src={user?.avatar ?? "https://i.ibb.co/B20xhbHW/user-dummy.jpg"}
                      alt={user?.name ?? "User"}
                    />
                    <AvatarFallback className="rounded-full text-2xl">
                      {(user?.name ?? "U").slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute bottom-0 right-0 flex gap-1 rounded-full bg-muted p-1">
                    <button
                      type="button"
                      className="rounded-full p-1.5 hover:bg-muted-foreground/20"
                      aria-label="Change photo"
                    >
                      <IconCamera className="size-4" />
                    </button>
                    <button
                      type="button"
                      className="rounded-full p-1.5 hover:bg-muted-foreground/20"
                      aria-label="Remove photo"
                    >
                      <IconX className="size-4" />
                    </button>
                  </div>
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">Profile photo</p>
                  <p className="text-sm text-muted-foreground">
                    Upload or change your avatar for the CMS dashboard.
                  </p>
                </div>
              </div>

              <FieldSet>
                <FieldGroup>
                  <Field>
                    <FieldLabel className="flex items-center gap-2">
                      <IconUser className="size-4" />
                      Name
                    </FieldLabel>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className="max-w-md"
                    />
                  </Field>
                  <Field>
                    <FieldLabel className="flex items-center gap-2">
                      <IconMail className="size-4" />
                      Email
                    </FieldLabel>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="max-w-md"
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Headline</FieldLabel>
                    <textarea
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                      placeholder="Short bio or tagline for your profile"
                      maxLength={100}
                      className="flex min-h-[80px] w-full max-w-md rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    <FieldDescription>
                      <span className="text-muted-foreground">{headline.length}/100</span>
                    </FieldDescription>
                  </Field>
                </FieldGroup>
              </FieldSet>
            </div>
          )}

          {activeTab === "appearance" && mounted && (
            <div className="flex flex-col gap-6">
              <FieldSet>
                <FieldGroup>
                  <Field>
                    <FieldLabel className="flex items-center gap-2">
                      <IconPalette className="size-4" />
                      Theme
                    </FieldLabel>
                    <FieldDescription className="mb-3">
                      Choose how the dashboard looks. System follows your device preference.
                    </FieldDescription>
                    <div className="flex flex-wrap gap-2">
                      {(["light", "dark", "system"] as const).map((t) => (
                        <Button
                          key={t}
                          type="button"
                          variant={theme === t ? "default" : "outline"}
                          size="sm"
                          onClick={() => setTheme(t)}
                          className="capitalize"
                        >
                          {t}
                        </Button>
                      ))}
                    </div>
                  </Field>
                </FieldGroup>
              </FieldSet>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
