import { useState, useCallback, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { logger } from '@lark-apaas/client-toolkit-lite';
import { BrainCircuit, Mail, Lock, Eye, EyeOff, Github, Chrome, ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Image } from '@/components/ui/image';

const LOGIN_BG_IMAGE =
  '/spark/app/app_178vmey7j1j/runtime/api/v1/storage/object/bucket_aadkhskrgcadw_static/static%2Faadkhsfz7pgdw_ve_miaoda';

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      const trimmedEmail = email.trim();
      if (!trimmedEmail) {
        toast.error('请输入邮箱地址');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
        toast.error('请输入有效的邮箱地址');
        return;
      }
      if (!password) {
        toast.error('请输入密码');
        return;
      }
      if (password.length < 6) {
        toast.error('密码长度至少 6 位');
        return;
      }

      setSubmitting(true);
      try {
        await new Promise((r) => setTimeout(r, 1200));

        if (rememberMe) {
          localStorage.setItem('__neuralforge_remember_email', trimmedEmail);
        } else {
          localStorage.removeItem('__neuralforge_remember_email');
        }

        toast.success('登录成功，欢迎回来！');
        logger.info('User logged in:', trimmedEmail);
        navigate('/dashboard');
      } catch (err) {
        logger.error('Login failed:', String(err));
        toast.error('登录失败，请检查邮箱和密码');
      } finally {
        setSubmitting(false);
      }
    },
    [email, password, rememberMe, navigate],
  );

  const handleSSOLogin = useCallback(
    async (provider: string) => {
      toast.info(`正在跳转至 ${provider} SSO 登录...`);
      logger.info('SSO login initiated:', provider);
      try {
        await new Promise((r) => setTimeout(r, 800));
        toast.success(`${provider} 登录成功`);
        navigate('/dashboard');
      } catch {
        toast.error('SSO 登录失败，请重试');
      }
    },
    [navigate],
  );

  return (
    <div className="relative flex min-h-screen w-full bg-background">
      {/* 左侧品牌主视觉 */}
      <div className="relative hidden w-1/2 lg:flex items-center justify-center overflow-hidden border-r border-black">
        <Image
          src={LOGIN_BG_IMAGE}
          alt="NeuralForge AI 神经网络可视化背景"
          className="absolute inset-0 h-full w-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-background/60" />

        <div className="relative z-10 flex flex-col items-start gap-8 max-w-md px-12">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center bg-black">
              <BrainCircuit className="size-6 text-background" />
            </div>
            <div>
              <h1 className="heading-bold text-4xl leading-[0.9]">NeuralForge</h1>
              <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mt-1">
                MLOps Platform
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-sm font-medium leading-relaxed text-foreground/80">
              企业级 AI 模型训练与部署平台。从数据准备、模型训练、版本管理到部署上线，全流程 MLOps 解决方案。
            </p>
            <div className="flex flex-wrap gap-2">
              {['PyTorch', 'TensorFlow', 'JAX', 'ONNX', 'Kubernetes', 'Docker'].map((tag) => (
                <span
                  key={tag}
                  className="border border-black px-3 py-1 text-[10px] uppercase font-bold tracking-widest"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="border-t border-black pt-6 w-full">
            <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
              &copy; 2026 NeuralForge
            </p>
          </div>
        </div>
      </div>

      {/* 右侧登录表单 */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[400px]"
        >
          {/* 移动端品牌标识 */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="flex size-10 items-center justify-center bg-black">
              <BrainCircuit className="size-5 text-background" />
            </div>
            <div>
              <h1 className="heading-bold text-2xl leading-[0.9]">NeuralForge</h1>
              <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mt-0.5">
                MLOps Platform
              </p>
            </div>
          </div>

          {/* 标题 */}
          <div className="mb-8">
            <h2 className="heading-bold text-3xl">登录</h2>
            <p className="text-sm text-muted-foreground mt-2">
              欢迎回来，请登录您的账号
            </p>
          </div>

          {/* 登录表单 */}
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            onSubmit={handleLogin}
            className="space-y-5"
            noValidate
          >
            {/* 邮箱 */}
            <div className="space-y-2">
              <Label htmlFor="login-email" className="text-xs uppercase font-bold tracking-widest">
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
                  className="bg-background pl-10 border-black focus-visible:ring-1 focus-visible:ring-black"
                  autoComplete="email"
                  autoFocus
                />
              </div>
            </div>

            {/* 密码 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="login-password" className="text-xs uppercase font-bold tracking-widest">
                  密码
                </Label>
                <button
                  type="button"
                  className="text-xs font-bold hover:underline transition-colors"
                  onClick={() => toast.info('密码重置链接已发送至您的邮箱')}
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
                  placeholder="输入密码"
                  className="bg-background pl-10 pr-10 border-black focus-visible:ring-1 focus-visible:ring-black"
                  autoComplete="current-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="!absolute right-1 top-1/2 z-20 h-7 w-7 -translate-y-1/2 hover:bg-black hover:text-background transition-colors"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? '隐藏密码' : '显示密码'}
                >
                  {showPassword ? (
                    <EyeOff className="size-3.5" />
                  ) : (
                    <Eye className="size-3.5" />
                  )}
                </Button>
              </div>
            </div>

            {/* 记住我 */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="remember-me"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(!!checked)}
                className="border-black data-[state=checked]:bg-black data-[state=checked]:text-background"
              />
              <Label
                htmlFor="remember-me"
                className="text-sm text-muted-foreground cursor-pointer select-none"
              >
                记住我
              </Label>
            </div>

            {/* 登录按钮 */}
            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-12 bg-black text-background hover:bg-black/80 transition-colors text-sm font-bold"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="size-4 animate-spin border-2 border-background/30 border-t-background" />
                  登录中...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  登录
                  <ArrowRight className="size-4" />
                </span>
              )}
            </Button>
          </motion.form>

          {/* 分隔线 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.4 }}
            className="relative my-8"
          >
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-black" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-background px-4 text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                或
              </span>
            </div>
          </motion.div>

          {/* SSO 登录 */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="space-y-3"
          >
            <p className="text-center text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
              使用 SSO 快速登录
            </p>
            <div className="grid grid-cols-3 gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-11 border-black hover:bg-black hover:text-background transition-colors"
                onClick={() => handleSSOLogin('Google')}
              >
                <Chrome className="size-4" />
                <span className="ml-2 text-xs font-bold">Google</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-11 border-black hover:bg-black hover:text-background transition-colors"
                onClick={() => handleSSOLogin('GitHub')}
              >
                <Github className="size-4" />
                <span className="ml-2 text-xs font-bold">GitHub</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-11 border-black hover:bg-black hover:text-background transition-colors"
                onClick={() => handleSSOLogin('Microsoft')}
              >
                <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z" />
                </svg>
                <span className="ml-2 text-xs font-bold">Microsoft</span>
              </Button>
            </div>
          </motion.div>

          {/* 注册链接 */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="mt-10 text-center text-sm text-muted-foreground"
          >
            还没有账号？{' '}
            <button
              type="button"
              className="font-bold hover:underline transition-colors"
              onClick={() => toast.info('注册功能即将开放，请联系管理员')}
            >
              注册账号
            </button>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
