import { useState, useCallback, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Github } from 'lucide-react';
import { toast } from 'sonner';
import { logger } from '@lark-apaas/client-toolkit-lite';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

export default function LoginFormSection() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!email.trim() || !password.trim()) {
        toast.error('请输入邮箱和密码');
        return;
      }
      setSubmitting(true);
      try {
        await new Promise((r) => setTimeout(r, 1200));
        logger.info('Login attempt:', email);
        toast.success('登录成功，欢迎回来！');
        navigate('/dashboard');
      } catch {
        toast.error('登录失败，请重试');
      } finally {
        setSubmitting(false);
      }
    },
    [email, password, navigate],
  );

  const handleSSOLogin = useCallback((provider: string) => {
    toast.info(`${provider} SSO 登录（演示模式）`);
    logger.info('SSO login:', provider);
  }, []);

  return (
    <div className="w-full max-w-sm mx-auto space-y-8">
      {/* 标题 */}
      <div className="text-center space-y-2">
        <h1 className="heading-bold text-4xl leading-[0.9] tracking-tighter">
          欢迎回来
        </h1>
        <p className="text-sm font-medium text-muted-foreground">
          登录您的 NeuralForge 账号
        </p>
      </div>

      {/* 登录表单 */}
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* 邮箱 */}
        <div className="space-y-2">
          <Label htmlFor="login-email" className="text-xs uppercase font-bold tracking-widest text-muted-foreground">
            邮箱地址
          </Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="bg-background pl-9 border-black"
              autoComplete="email"
              disabled={submitting}
            />
          </div>
        </div>

        {/* 密码 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="login-password" className="text-xs uppercase font-bold tracking-widest text-muted-foreground">
              密码
            </Label>
            <button
              type="button"
              className="text-xs font-bold hover:underline transition-colors"
              onClick={() => toast.info('重置密码功能（演示模式）')}
            >
              忘记密码？
            </button>
          </div>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="bg-background pl-9 pr-9 border-black"
              autoComplete="current-password"
              disabled={submitting}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setShowPassword((v) => !v)}
              tabIndex={-1}
              aria-label={showPassword ? '隐藏密码' : '显示密码'}
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
        </div>

        {/* 记住我 */}
        <div className="flex items-center gap-2">
          <Checkbox
            id="remember-me"
            checked={rememberMe}
            onCheckedChange={(v) => setRememberMe(!!v)}
            disabled={submitting}
            className="border-black data-[state=checked]:bg-black data-[state=checked]:text-background"
          />
          <Label htmlFor="remember-me" className="text-xs font-medium text-muted-foreground cursor-pointer">
            记住我
          </Label>
        </div>

        {/* 登录按钮 - 黑白反转 */}
        <Button
          type="submit"
          className="w-full h-12 text-sm font-bold bg-black text-background hover:bg-foreground/90 transition-colors border border-black"
          disabled={submitting}
        >
          {submitting ? '登录中...' : '登录'}
        </Button>
      </form>

      {/* 分隔线 */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-black" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-background px-3 text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
            或使用 SSO 登录
          </span>
        </div>
      </div>

      {/* SSO 按钮 - 方角黑白反转 */}
      <div className="grid grid-cols-3 gap-3">
        <button
          type="button"
          className="flex items-center justify-center gap-1.5 h-10 text-xs font-bold border border-black hover:bg-black hover:text-background transition-colors"
          onClick={() => handleSSOLogin('Google')}
          disabled={submitting}
        >
          <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Google
        </button>
        <button
          type="button"
          className="flex items-center justify-center gap-1.5 h-10 text-xs font-bold border border-black hover:bg-black hover:text-background transition-colors"
          onClick={() => handleSSOLogin('GitHub')}
          disabled={submitting}
        >
          <Github className="size-4" />
          GitHub
        </button>
        <button
          type="button"
          className="flex items-center justify-center gap-1.5 h-10 text-xs font-bold border border-black hover:bg-black hover:text-background transition-colors"
          onClick={() => handleSSOLogin('Microsoft')}
          disabled={submitting}
        >
          <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z" fill="#00A4EF"/>
          </svg>
          Microsoft
        </button>
      </div>

      {/* 注册入口 */}
      <p className="text-center text-xs font-medium text-muted-foreground">
        还没有账号？{' '}
        <button
          type="button"
          className="font-bold hover:underline transition-colors"
          onClick={() => toast.info('注册功能（演示模式）')}
        >
          注册账号
        </button>
      </p>
    </div>
  );
}
