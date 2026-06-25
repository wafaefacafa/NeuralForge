import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderOpen,
  Database,
  Box,
  Server,
  Code2,
  BarChart3,
  Users,
  Settings,
  BrainCircuit,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

const NAV_ITEMS = [
  { path: '/dashboard', label: '控制台', icon: LayoutDashboard },
  { path: '/projects', label: '项目', icon: FolderOpen },
  { path: '/datasets', label: '数据集', icon: Database },
  { path: '/models', label: '模型', icon: Box },
  { path: '/deploy/instances', label: '部署实例', icon: Server },
  { path: '/api-docs', label: 'API 文档', icon: Code2 },
  { path: '/resources', label: '资源监控', icon: BarChart3 },
  { path: '/team', label: '团队', icon: Users },
  { path: '/settings', label: '设置', icon: Settings },
];

export default function AppSidebar() {
  const { pathname } = useLocation();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-black">
        <div className="flex items-center gap-2 px-2 py-3 group-data-[state=collapsed]:px-0 group-data-[state=collapsed]:justify-center">
          <div className="size-8 shrink-0 bg-black flex items-center justify-center">
            <BrainCircuit className="size-5 text-background" />
          </div>
          <div className="flex-1 min-w-0 group-data-[state=collapsed]:hidden">
            <div className="heading-bold text-sm truncate">
              NeuralForge
            </div>
            <div className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground truncate">
              MLOps Platform
            </div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="p-2">
          <SidebarMenu>
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.path === '/dashboard'
                  ? pathname === '/dashboard'
                  : pathname === item.path ||
                    pathname.startsWith(`${item.path}/`);

              return (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.label}
                    isActive={isActive}
                  >
                    <NavLink
                      to={item.path}
                      end={item.path === '/dashboard'}
                      className="flex items-center gap-2"
                    >
                      <Icon className="size-4 shrink-0" />
                      <span className="group-data-[state=collapsed]:hidden">
                        {item.label}
                      </span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-black">
        <div className="flex items-center gap-2 px-2 py-3 group-data-[state=collapsed]:px-0 group-data-[state=collapsed]:justify-center">
          <div className="size-7 shrink-0 bg-black flex items-center justify-center text-xs font-bold text-background">
            JB
          </div>
          <div className="flex-1 min-w-0 group-data-[state=collapsed]:hidden">
            <div className="text-xs font-bold truncate">James Bond</div>
            <div className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground truncate">
              管理员
            </div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
