"use client"

import * as React from "react"
import {
  IconChartBar,
  IconDatabase,
  IconFileWord,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconMessageCircle,
  IconReport,
  IconSearch,
  IconSettings,
} from "@tabler/icons-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link"

const data = {
  navMain: [
    {
      title: "Posts",
      url: "/console/posts",
      icon: IconListDetails,
    },
    { // Add Site Content nav item
      title: "Site Content", // Set nav label
      url: "/console/site-content", // Set nav route
      icon: IconFileWord, // Set nav icon
    }, // End Site Content nav item
    {
      title: "Categories",
      url: "/console/categories",
      icon: IconChartBar,
    },
    {
      title: "Comments",
      url: "/console/comments",
      icon: IconMessageCircle,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/console/settings",
      icon: IconSettings,
    },
    {
      title: "Newsletter Subscriber List",
      url: "/console/newsletter-subscribe",
      icon: IconHelp,
    },
    {
      title: "Pending User",
      url: "/console/pending-user",
      icon: IconSearch,
    },
  ],
  documents: [
    {
      name: "Add Post",
      url: "/console/posts/add",
      icon: IconDatabase,
    },
    {
      name: "Add Category",
      url: "/console/categories/add",
      icon: IconReport,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5"
            >
              <Link href="/console/all-posts">
                <IconInnerShadowTop className="size-5" />
                <span className="text-base font-semibold">My Blog.</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
