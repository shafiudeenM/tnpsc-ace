import { Brain, MessageSquare, BookOpen, FileQuestion, History, Newspaper, ClipboardCheck, LayoutDashboard, Settings, Trophy, Flame, ChartBar as BarChart3 } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const mainNav = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Smart Quiz", url: "/quiz", icon: Brain },
  { title: "Quiz Analytics", url: "/analytics", icon: BarChart3 },
  { title: "AI Assistant", url: "/ai-assistant", icon: MessageSquare },
  { title: "Syllabus Map", url: "/syllabus", icon: BookOpen },
];

const prepNav = [
  { title: "Question Generator", url: "/question-generator", icon: FileQuestion },
  { title: "PYQ Analysis", url: "/pyq-analysis", icon: History },
  { title: "Current Affairs", url: "/current-affairs", icon: Newspaper },
  { title: "Mock Tests", url: "/mock-tests", icon: ClipboardCheck },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-gold shrink-0">
            <Flame className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="font-display text-lg font-bold text-foreground tracking-tight">
                TNPSC Master
              </h1>
              <p className="text-xs text-muted-foreground">வெற்றி உங்கள் கையில்</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground/60">
            {!collapsed && "Main"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="transition-all duration-200"
                      activeClassName="bg-sidebar-accent text-primary font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground/60">
            {!collapsed && "Preparation"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {prepNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <NavLink
                      to={item.url}
                      className="transition-all duration-200"
                      activeClassName="bg-sidebar-accent text-primary font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        {!collapsed && (
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium text-foreground">Daily Streak</span>
            </div>
            <p className="text-2xl font-display font-bold text-primary">7 Days 🔥</p>
            <p className="text-xs text-muted-foreground mt-1">Keep going! நிறுத்தாதே!</p>
          </div>
        )}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Settings">
              <NavLink to="/settings" activeClassName="bg-sidebar-accent text-primary">
                <Settings className="h-4 w-4" />
                {!collapsed && <span>Settings</span>}
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
