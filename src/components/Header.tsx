import { useState, useCallback, type FormEvent } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Search, Bell, User, LogOut, Settings, HelpCircle, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { logger } from '@lark-apaas/client-toolkit-lite';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { SidebarTrigger } from '@/components/ui/sidebar';

// EXPORTS: MOCK_NOTIFICATIONS
export const MOCK_NOTIFICATIONS = [
  { id: '1', title: '训练任务完成', desc: 'ResNet-50 图像分类训练已完成，Accuracy: 94.2%', time: '2 分钟前', unread: true },
  { id: '2', title: '部署状态更新', desc: '模型 v2.3.1 已成功部署至生产环境', time: '15 分钟前', unread: true },
  { id: '3', title: '资源告警', desc: 'GPU 集群 A 利用率超过 85%', time: '1 小时前', unread: true },
  { id: '4', title: '团队成员加入', desc: '张明 已接受团队邀请，角色：开发者', time: '3 小时前', unread: false },
  { id: '5', title: '数据集更新', desc: 'ImageNet-subset v3 数据集版本已更新', time: '昨天', unread: false },
];

export default function Header() {
  const navigate = useNavigate();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [notifOpen, setNotifOpen] = useState(false);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleSearch = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      const kw = searchKeyword.trim();
      if (!kw) return;
      toast.info(`搜索: ${kw}`);
      logger.info('Header search:', kw);
    },
    [searchKeyword],
  );

  const handleMarkAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    toast.success('已全部标为已读');
  }, []);

  const handleLogout = useCallback(() => {
    toast.info('已退出登录');
    navigate('/login');
  }, [navigate]);

  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-3 border-b border-black bg-background px-3 lg:px-5">
      <SidebarTrigger className="md:hidden -ml-1" />

      <NavLink to="/" className="flex items-center gap-2 md:hidden shrink-0">
        <div className="flex size-7 items-center justify-center bg-black text-xs font-bold text-background">
          NF
        </div>
        <span className="heading-bold text-sm">NeuralForge</span>
      </NavLink>

      <form onSubmit={handleSearch} className="relative flex-1 max-w-md ml-auto md:ml-0">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          placeholder="搜索项目、模型、数据集..."
          className="h-9 bg-background pl-9 pr-3 text-sm border-black focus-visible:ring-1 focus-visible:ring-black"
        />
      </form>

      <div className="flex items-center gap-1 shrink-0">
        <Button variant="ghost" size="icon" className="size-9 hover:bg-black hover:text-background transition-colors" aria-label="帮助">
          <HelpCircle className="size-4" />
        </Button>

        <DropdownMenu open={notifOpen} onOpenChange={setNotifOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative size-9 hover:bg-black hover:text-background transition-colors" aria-label="通知">
              <Bell className="size-4" />
              {unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="!absolute -right-0.5 -top-0.5 z-20 flex h-4 min-w-4 items-center justify-center px-1 text-[10px] leading-none"
                >
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 border-black">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>通知</span>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" className="h-auto px-2 py-0.5 text-xs" onClick={handleMarkAllRead}>
                  全部已读
                </Button>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-72 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-3 py-6 text-center text-sm text-muted-foreground">暂无通知</div>
              ) : (
                notifications.map((n) => (
                  <DropdownMenuItem
                    key={n.id}
                    className="flex cursor-pointer flex-col items-start gap-0.5 px-3 py-2.5"
                    onSelect={(e) => e.preventDefault()}
                  >
                    <div className="flex w-full items-center justify-between gap-2">
                      <span className={`text-sm font-bold ${n.unread ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {n.unread && <span className="mr-1.5 inline-block size-1.5 bg-black align-middle" />}
                        {n.title}
                      </span>
                      <span className="shrink-0 text-[10px] uppercase font-bold tracking-widest text-muted-foreground">{n.time}</span>
                    </div>
                    <span className="line-clamp-2 text-xs text-muted-foreground">{n.desc}</span>
                  </DropdownMenuItem>
                ))
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 h-9 px-2 ml-1 hover:bg-black hover:text-background transition-colors" aria-label="用户菜单">
              <Avatar className="size-7">
                <AvatarImage src="" alt="用户头像" />
                <AvatarFallback className="bg-black text-background text-xs font-bold">JB</AvatarFallback>
              </Avatar>
              <span className="hidden text-sm font-bold md:inline-block">James Bond</span>
              <ChevronDown className="hidden size-3.5 md:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 border-black">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-bold">James Bond</span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">james.bond@neuralforge.io</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer">
              <Settings className="mr-2 size-4" />
              个人设置
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast.info('帮助文档')} className="cursor-pointer">
              <HelpCircle className="mr-2 size-4" />
              帮助文档
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
              <LogOut className="mr-2 size-4" />
              退出登录
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
