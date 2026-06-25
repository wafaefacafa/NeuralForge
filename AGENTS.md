# NeuralForge - 需求拆解文档

## 产品概述

- **产品类型**: 企业级AI模型训练与部署MLOps平台
- **场景类型**: <scene_type>prototype-app</scene_type>
- **目标用户**: AI开发者和数据科学家
- **核心价值**: 提供从数据准备、模型训练、版本管理到部署上线的全流程MLOps解决方案
- **界面语言**: zh-CN
- **主题偏好**: dark（深色主题，深灰/深蓝背景，主色调靛蓝#4F46E5 + 青色#06B6D4点缀）
- **导航模式**: 路径导航
- **导航布局**: Sidebar（左侧导航栏 + 顶部工具栏 + 主内容区，经典B端布局）

---

## 页面结构总览

> **说明**：此表为页面生成的唯一数据源，包含所有页面（一级+二级）

| 页面名称 | 文件名 | 路由 | 页面类型 | 入口来源 |
|---------|-------|------|---------|---------|
| 登录页 | `LoginPage.tsx` | `/login` | 一级 | 直接访问（未登录默认页） |
| 控制台/仪表盘 | `DashboardPage.tsx` | `/` | 一级 | 导航 |
| 项目列表页 | `ProjectsPage.tsx` | `/projects` | 一级 | 导航 |
| 创建项目页 | `CreateProjectPage.tsx` | `/projects/new` | 二级 | 项目列表页 → "创建项目"按钮 |
| 数据集管理页 | `DatasetsPage.tsx` | `/datasets` | 一级 | 导航 |
| 模型训练配置页 | `TrainingConfigPage.tsx` | `/training/config/:projectId` | 二级 | 项目列表页 → 项目卡片"训练"操作 |
| 训练过程监控页 | `TrainingMonitorPage.tsx` | `/training/monitor/:jobId` | 二级 | 训练配置页 → "开始训练"按钮 |
| 模型版本管理页 | `ModelVersionsPage.tsx` | `/models` | 一级 | 导航 |
| 模型评估页 | `ModelEvalPage.tsx` | `/models/eval/:versionId` | 二级 | 模型版本管理页 → 版本行"评估"操作 |
| 模型部署配置页 | `DeployConfigPage.tsx` | `/deploy/config/:versionId` | 二级 | 模型版本管理页 → 版本行"部署"操作 |
| 部署实例管理页 | `DeployInstancesPage.tsx` | `/deploy/instances` | 一级 | 导航 |
| API接口文档页 | `ApiDocsPage.tsx` | `/api-docs` | 一级 | 导航 |
| 资源监控页 | `ResourceMonitorPage.tsx` | `/resources` | 一级 | 导航 |
| 团队协作页 | `TeamPage.tsx` | `/team` | 一级 | 导航 |
| 个人设置页 | `SettingsPage.tsx` | `/settings` | 一级 | 导航（顶部工具栏用户头像下拉） |

> **页面类型说明**：
> - **一级页面**：出现在导航中，用户可直接访问
> - **二级页面**：不在导航中，从一级页面跳转进入

---

## 页面布局建议

> **说明**：工具类、生成类、上传解析类、搜索列表类必须填写。用 1-3 行说明页面骨架，避免只规划输入框和按钮；生成类工具不要默认使用“上方输入、下方结果”。输入材料需要持续参照时，必须写源材料承载区与结果区的对照关系。

- **全局布局模式**: Sidebar（左侧固定导航） + Topbar（顶部工具栏） + 主内容区（右侧滚动区）—— 经典B端中后台布局，适合多模块切换
- **登录页布局**: 居中单栏卡片式 —— 品牌展示 + 登录表单，视觉重心在登录表单
- **仪表盘布局**: 控制台布局（KPI卡片行 + 图表网格 + 活动时间线）—— 视觉重心在KPI指标卡片和训练任务统计
- **列表页布局**（项目/数据集/模型版本/部署实例）: 顶部操作栏（搜索/筛选/新建按钮） + 卡片/表格列表区 —— 视觉重心在列表数据
- **表单配置页布局**（创建项目/训练配置/部署配置）: 左右分栏（左侧配置表单，右侧实时预览/摘要）—— 输入参数较多，需要对照配置与预览
- **监控页布局**（训练监控/资源监控）: 上下分区（顶部实时指标卡片，中部图表区，底部日志/详情）—— 视觉重心在实时曲线和GPU利用率
- **评估页布局**: 上下分区（顶部模型指标摘要，中部可视化图表网格）—— 视觉重心在混淆矩阵和PR曲线
- **API文档页布局**: 左右分栏（左侧API端点列表导航，右侧请求/响应详情）—— 源材料（端点列表）需持续参照
- **团队/设置页布局**: 单栏表单/列表式 —— 视觉重心在成员列表和配置表单

---

## 导航配置

- **导航布局**: Sidebar（左侧固定，深色背景，宽度约240px）
- **导航项**（仅一级页面）:

| 导航文字 | 路由 | 图标(可选) |
|---------|------|-----------|
| 控制台 | `/` | Dashboard/Home |
| 项目 | `/projects` | Folder |
| 数据集 | `/datasets` | Database |
| 模型 | `/models` | Box/Model |
| 部署实例 | `/deploy/instances` | Server/Cloud |
| API文档 | `/api-docs` | Code/FileText |
| 资源监控 | `/resources` | Activity/BarChart |
| 团队 | `/team` | Users |
| 设置 | `/settings` | Settings |

> **说明**：登录页不放入导航，作为独立入口页面

---

## 数据来源声明

| 数据/操作 | 来源类型 | 实现要求 | mock 兜底 |
|---|---|---|---|
| 仪表盘 - 项目概览/训练任务统计/资源使用率/最近活动 | demo-mock | src/data/dashboard.ts 提供静态mock数据（项目数、运行中任务数、GPU利用率、最近活动列表） | ✅ 本身就是mock |
| 项目列表 - 项目卡片数据 | demo-mock | src/data/projects.ts 提供静态mock项目数组（含名称、框架、状态、更新时间） | ✅ 本身就是mock |
| 创建项目 - 项目配置提交 | demo-mock | 表单提交后本地state更新，toast提示成功，不持久化 | ✅ 本身就是mock |
| 数据集列表 - 数据集信息 | demo-mock | src/data/datasets.ts 提供静态mock数据集数组（含名称、大小、样本数、版本） | ✅ 本身就是mock |
| 数据集上传 | demo-mock | 模拟上传交互，toast提示成功，本地state追加记录 | ✅ 本身就是mock |
| 训练配置 - 超参数/网络结构/优化器选项 | demo-mock | src/data/trainingOptions.ts 提供静态配置选项（框架列表、优化器列表、网络结构模板） | ✅ 本身就是mock |
| 训练监控 - 实时训练曲线(loss/accuracy)/GPU利用率/Epoch进度 | demo-mock | 使用setInterval模拟实时数据更新，src/data/trainingMetrics.ts 提供初始mock数据 | ✅ 本身就是mock |
| 训练监控 - 训练日志 | demo-mock | 使用setInterval模拟日志追加，src/data/trainingLogs.ts 提供初始mock日志 | ✅ 本身就是mock |
| 模型版本列表 - 版本数据 | demo-mock | src/data/modelVersions.ts 提供静态mock版本数组（含版本号、指标、状态、创建时间） | ✅ 本身就是mock |
| 模型评估 - 评估结果/混淆矩阵/PR曲线/分类报告 | demo-mock | src/data/modelEval.ts 提供静态mock评估数据（含混淆矩阵二维数组、PR曲线点集、分类报告指标） | ✅ 本身就是mock |
| 部署配置 - 环境选项/实例规格/扩缩容配置 | demo-mock | src/data/deployOptions.ts 提供静态配置选项（环境列表、规格列表） | ✅ 本身就是mock |
| 部署实例列表 - 实例数据 | demo-mock | src/data/deployInstances.ts 提供静态mock实例数组（含状态、规格、端点、运行时间） | ✅ 本身就是mock |
| 部署实例 - 运行状态监控/日志 | demo-mock | 使用setInterval模拟状态更新和日志追加 | ✅ 本身就是mock |
| API文档 - 端点列表/请求响应示例/SDK示例 | demo-mock | src/data/apiDocs.ts 提供静态mock API文档数据（含端点、方法、参数、响应示例、代码片段） | ✅ 本身就是mock |
| API文档 - 调用测试 | demo-mock | 模拟API调用，返回mock响应数据，toast提示结果 | ✅ 本身就是mock |
| 资源监控 - CPU/GPU/内存/存储使用率/费用统计 | demo-mock | 使用setInterval模拟实时数据更新，src/data/resourceMetrics.ts 提供初始mock数据 | ✅ 本身就是mock |
| 资源监控 - 资源告警 | demo-mock | src/data/resourceAlerts.ts 提供静态mock告警列表 | ✅ 本身就是mock |
| 团队协作 - 成员列表/角色权限/团队统计 | demo-mock | src/data/teamMembers.ts 提供静态mock成员数组（含角色、权限、加入时间） | ✅ 本身就是mock |
| 团队协作 - 邀请成员 | demo-mock | 模拟邀请交互，toast提示邀请已发送，本地state追加记录 | ✅ 本身就是mock |
| 个人设置 - 个人信息/API密钥/通知设置/安全设置 | demo-mock | src/data/userSettings.ts 提供静态mock用户设置数据 | ✅ 本身就是mock |
| 个人设置 - 设置保存 | local-persist | localStorage key=`__neuralforge_userSettings`，保存用户修改的设置项 | 初始使用mock数据填充 |
| 登录 - 邮箱/密码登录 | demo-mock | 模拟登录验证，toast提示成功并跳转至仪表盘 | ✅ 本身就是mock |

> **说明**：本需求为纯UI界面展示，所有数据均为demo-mock类型。个人设置页的"保存"操作为local-persist，提供基本的设置持久化体验。

---

## 功能列表

> **说明**：每个页面/区块的功能点，供页面生成使用

- **页面**: 登录页 (`/login`)
  - **页面目标**: 提供简洁专业的登录入口，展示品牌形象
  - **功能点**:
    - **品牌展示**: 展示NeuralForge Logo和平台名称，科技感动画背景
    - **邮箱/密码登录**: 邮箱输入框 + 密码输入框 + "登录"按钮，表单验证
    - **SSO选项**: "使用SSO登录"按钮，支持Google/GitHub/Microsoft SSO图标入口
    - **辅助链接**: "忘记密码？"和"注册账号"链接

- **页面**: 控制台/仪表盘 (`/`)
  - **页面目标**: 提供项目概览、训练任务统计、资源使用率、最近活动的一站式视图
  - **功能点**:
    - **KPI指标卡片行**: 展示4个核心指标卡片（活跃项目数、运行中训练任务数、已部署模型数、GPU总利用率），每个卡片含数值+环比变化趋势
    - **训练任务统计图表**: 折线图展示近7天训练任务提交数/完成数趋势
    - **资源使用率仪表盘**: 环形图展示GPU/CPU/内存使用率，带百分比和颜色阈值
    - **最近活动时间线**: 列表展示最近10条操作记录（创建项目、训练完成、模型部署等），含时间戳和操作类型图标
    - **快速操作入口**: 4个快捷按钮卡片（新建项目、上传数据集、开始训练、部署模型），点击跳转对应页面

- **页面**: 项目列表页 (`/projects`)
  - **页面目标**: 展示所有项目，支持搜索筛选和快速创建
  - **功能点**:
    - **视图切换**: 卡片视图/列表视图切换按钮
    - **搜索与筛选**: 顶部搜索框（按项目名称搜索）+ 下拉筛选（按框架PyTorch/TensorFlow、按状态）
    - **项目卡片列表**: 每个卡片展示项目名称、框架图标、状态标签、最近更新时间、模型数量，点击进入项目详情
    - **创建项目按钮**: 右上角醒目"创建项目"按钮，点击跳转`/projects/new`
    - **项目操作菜单**: 每个项目卡片右上角下拉菜单（训练、部署、设置、删除）

- **页面**: 创建项目页 (`/projects/new`)
  - **页面目标**: 配置新项目的基本信息、框架和硬件资源
  - **功能点**:
    - **基本信息表单**: 项目名称输入框、描述文本域、标签输入
    - **框架选择**: 单选卡片组（PyTorch / TensorFlow / JAX），每个卡片展示框架Logo和简介
    - **硬件资源配置**: 下拉选择GPU类型（A100/V100/T4）、GPU数量滑块（1-8）、内存规格选择
    - **实时预览摘要**: 右侧面板实时显示已选配置摘要（框架、GPU、内存、预估费用）
    - **创建提交**: "创建项目"按钮，提交后toast提示成功，跳转至项目列表页

- **页面**: 数据集管理页 (`/datasets`)
  - **页面目标**: 管理数据集，支持上传、预览、版本管理和数据标注入口
  - **功能点**:
    - **数据集列表表格**: 列（名称、样本数、大小、版本号、状态、更新时间），支持排序
    - **上传数据集**: "上传数据集"按钮，弹出上传对话框（拖拽区域 + 文件选择 + 数据集名称/描述输入）
    - **数据预览**: 点击数据集行"预览"按钮，弹出抽屉展示前20条数据样本（表格形式）
    - **版本管理**: 每个数据集行展示版本号，点击可查看版本历史列表
    - **数据标注入口**: "数据标注"按钮，跳转至标注工具（外部链接或新页面）

- **页面**: 模型训练配置页 (`/training/config/:projectId`)
  - **页面目标**: 配置训练超参数、网络结构和数据划分
  - **功能点**:
    - **超参数配置表单**: 学习率、Batch Size、Epochs、优化器选择（Adam/SGD/AdamW）下拉框，权重衰减输入
    - **网络结构选择**: 预置网络模板卡片（ResNet-50、VGG-16、EfficientNet、自定义），点击选中高亮
    - **训练集/验证集划分**: 数据集下拉选择 + 训练/验证比例滑块（默认80/20）
    - **高级配置折叠面板**: 学习率调度器、早停策略、数据增强选项
    - **配置摘要预览**: 右侧面板实时显示配置摘要
    - **开始训练按钮**: 提交配置，toast提示训练任务已创建，跳转至训练监控页

- **页面**: 训练过程监控页 (`/training/monitor/:jobId`)
  - **页面目标**: 实时展示训练过程中的loss/accuracy曲线、GPU利用率和训练日志
  - **功能点**:
    - **实时训练曲线**: 双Y轴折线图（Loss下降曲线 + Accuracy上升曲线），X轴为Epoch/Step，数据每秒更新
    - **GPU利用率仪表盘**: 实时GPU利用率百分比环形图 + 显存使用量进度条
    - **Epoch进度条**: 当前Epoch/总Epochs进度条，含已用时间/预计剩余时间
    - **训练日志流**: 底部终端风格日志区域，实时追加日志行（含时间戳和日志级别颜色），自动滚动到底部
    - **控制按钮**: 暂停训练/恢复训练/停止训练按钮，含确认对话框

- **页面**: 模型版本管理页 (`/models`)
  - **页面目标**: 管理所有模型版本，支持版本对比和详情查看
  - **功能点**:
    - **版本列表表格**: 列（版本号、模型名称、框架、Accuracy、F1-Score、大小、状态、创建时间），支持排序和筛选
    - **版本对比**: 勾选2个版本行，点击"对比"按钮，弹出对比抽屉展示指标并排对比（表格+柱状图）
    - **模型指标展示**: 每个版本行内展示关键指标徽章（Accuracy、F1、Precision、Recall）
    - **模型详情**: 点击版本行，弹出详情抽屉（模型结构图、超参数记录、训练环境信息）
    - **操作菜单**: 每行操作列（部署、评估、下载、删除）

- **页面**: 模型评估页 (`/models/eval/:versionId`)
  - **页面目标**: 可视化展示模型评估结果，包括混淆矩阵、PR曲线和分类报告
  - **功能点**:
    - **评估指标摘要卡片**: 顶部4个指标卡片（Accuracy、Precision、Recall、F1-Score），含数值和进度环
    - **混淆矩阵热力图**: 矩阵热力图可视化，单元格颜色深浅表示数值大小，hover显示具体数值
    - **PR曲线图**: Precision-Recall曲线折线图，含AUC值标注
    - **分类报告表格**: 每类Precision/Recall/F1-Support详细表格，支持按指标排序
    - **模型性能分析**: 文字摘要区域，自动生成性能分析洞察（如"类别X的召回率较低，建议增加训练样本"）

- **页面**: 模型部署配置页 (`/deploy/config/:versionId`)
  - **页面目标**: 配置模型部署环境、实例规格和扩缩容策略
  - **功能点**:
    - **部署环境选择**: 单选卡片组（生产环境/预发布环境/测试环境），每个卡片展示环境说明
    - **实例规格配置**: 下拉选择实例类型（CPU/GPU）、规格（vCPU数、内存、GPU型号）、实例数量
    - **自动扩缩容设置**: 开关启用自动扩缩容，配置最小/最大实例数、CPU利用率触发阈值
    - **流量分配**: 如有多个版本，配置流量分配比例（滑块或输入百分比）
    - **配置摘要与费用预估**: 右侧面板实时显示配置摘要和预估月费用
    - **部署按钮**: 提交配置，toast提示部署任务已创建，跳转至部署实例管理页

- **页面**: 部署实例管理页 (`/deploy/instances`)
  - **页面目标**: 管理所有部署实例，监控运行状态和日志
  - **功能点**:
    - **实例列表表格**: 列（实例名称、模型版本、状态指示灯、端点URL、规格、运行时长、QPS），状态用颜色区分（运行中绿色、异常红色、停止灰色）
    - **运行状态监控**: 每个实例行内展示迷你折线图（请求量/QPS趋势）
    - **日志查看**: 点击"日志"按钮，弹出抽屉展示实时日志流（终端风格）
    - **版本回滚**: 点击"回滚"按钮，弹出确认对话框选择回滚目标版本，toast提示回滚成功
    - **操作菜单**: 每行操作列（启动/停止、扩容、日志、回滚、删除）

- **页面**: API接口文档页 (`/api-docs`)
  - **页面目标**: 提供完整的API端点文档、请求响应示例和SDK代码示例
  - **功能点**:
    - **API端点列表导航**: 左侧分组折叠列表（推理API、模型管理API、数据集API、部署API），点击端点切换右侧内容
    - **请求/响应示例**: 右侧展示选中端点的详细信息（HTTP方法、路径、请求参数表格、请求体JSON示例、响应体JSON示例）
    - **SDK代码示例**: 每个端点下方展示Python/JavaScript SDK调用代码片段，带语法高亮和复制按钮
    - **调用测试**: "Try it"按钮，弹出测试面板（参数输入表单 + "发送请求"按钮），展示模拟响应结果
    - **搜索端点**: 顶部搜索框，快速定位API端点

- **页面**: 资源监控页 (`/resources`)
  - **页面目标**: 监控CPU/GPU/内存/存储使用率，展示资源配额和费用统计
  - **功能点**:
    - **实时资源使用率图表**: 4个折线图并排（CPU使用率、GPU使用率、内存使用率、存储使用率），时间范围选择器（1h/6h/24h/7d）
    - **资源配额概览**: 进度条卡片展示各项资源配额使用情况（已用/总量），超阈值红色警告
    - **费用统计**: 环形图展示本月费用构成（计算/存储/网络/其他），累计费用数字和环比变化
    - **资源告警列表**: 表格展示最近告警记录（告警时间、资源类型、告警级别、描述、状态），支持确认/忽略操作
    - **导出报告**: "导出报告"按钮，模拟导出CSV操作

- **页面**: 团队协作页 (`/team`)
  - **页面目标**: 管理团队成员、角色权限和团队统计
  - **功能点**:
    - **成员列表表格**: 列（头像、姓名、邮箱、角色徽章、加入时间、状态），支持搜索和按角色筛选
    - **角色权限管理**: 点击成员行"编辑"按钮，弹出对话框修改角色（管理员/开发者/观察者）和权限（项目访问、数据集访问、部署权限）
    - **邀请成员**: "邀请成员"按钮，弹出对话框输入邮箱和选择角色，toast提示邀请已发送
    - **团队统计**: 顶部统计卡片（成员总数、活跃成员数、本月训练任务数、本月部署次数）
    - **移除成员**: 每行操作列"移除"按钮，含确认对话框

- **页面**: 个人设置页 (`/settings`)
  - **页面目标**: 管理个人信息、API密钥、通知设置和安全设置
  - **功能点**:
    - **个人信息**: 头像上传区域 + 姓名/邮箱/公司/职位输入表单 + "保存"按钮
    - **API密钥管理**: API密钥列表表格（密钥名称、前缀、创建时间、最后使用时间、状态），"生成新密钥"按钮弹出对话框，支持启用/禁用/删除操作
    - **通知设置**: 开关列表（训练完成通知、部署状态通知、资源告警通知、团队邀请通知），每个开关独立控制
    - **安全设置**: 修改密码表单（当前密码、新密码、确认新密码）+ 双因素认证开关
    - **设置保存**: 所有修改通过"保存"按钮提交，localStorage持久化

---

## 数据共享配置

| 存储键名 | 数据说明 | 使用页面 |
|---------|---------|---------|
| `__global_neuralforge_currentUser` | 当前登录用户信息，类型为 `IUser` | 全局（顶部工具栏用户头像、个人设置页） |
| `__global_neuralforge_userSettings` | 用户个人设置，类型为 `IUserSettings` | 个人设置页 |

```ts
interface IUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'developer' | 'viewer';
}

interface IUserSettings {
  notifications: {
    trainingComplete: boolean;
    deployStatus: boolean;
    resourceAlert: boolean;
    teamInvite: boolean;
  };
  twoFactorEnabled: boolean;
}

-------

<scene_type>prototype-app</scene_type>

# UI 设计指南

## 1. 设计推导依据

- **参考意图**: Free Direction —— 无参考材料，按产品语义与目标情绪自主建立视觉系统
- **核心情绪 / 应用类型**: 精密仪表感 × 开发者控制台 —— AI 工程师在高密度信息中快速感知训练状态、资源水位与模型质量
- **独特记忆点**: 靛蓝主色在深色基底上形成“冷光仪表”质感，青色作为数据高亮与状态脉冲，让监控页面的曲线和指标像示波器读数一样被瞬间识别

## 2. Art Direction

- **方向名**: Terminal Dashboard
- **Design Style**: Minimal Dark + Swiss Grid —— 深色背景承载高密度数据，瑞士网格确保 15 个页面信息层级统一；终端美学赋予开发者熟悉感，网格系统防止监控页沦为视觉噪音
- **DNA 参数**: 圆角 subtle（`rounded-md`）/ 阴影 subtle（`shadow-sm`，仅卡片微抬）/ 间距 compact-to-standard（`gap-3` ~ `gap-5`）/ 字体方向 monospace accent + sans-serif body / 装饰手法：细线分隔、低透明度边框、青色脉冲点
- **应用类型**: Workflow + Dashboard —— 左侧导航固定，主内容区独立滚动，宽表格与图表使用局部 overflow

## 3. Color System

**色彩关系**: 深空基底（深灰蓝）+ 靛蓝主色 + 青色数据高亮 + 冷白文字
**配色设计理由**: 深色 bg 降低长时间监控的视觉疲劳；靛蓝 primary 承担导航激活、主按钮、品牌识别，饱和度控制在中等避免霓虹感；青色 accent 用于数据曲线、实时状态脉冲、选中高亮，与靛蓝形成 60° 色相偏移，在深色背景上可读性极强；text 使用冷白保持 4.5:1 以上对比度
**主色推导**: 用户指定靛蓝 #4F46E5 + 青色 #06B6D4，转换为 HSL 后靛蓝为 hsl(239 84% 59%)，青色为 hsl(189 94% 43%)；深色 bg 从靛蓝色相向暗部延伸，保持色温一致
**使用比例**: 65% 深色中性（bg/card/border）/ 25% 靛蓝辅助（accent/选中态/次级按钮）/ 10% 靛蓝 primary（CTA/导航激活/品牌锚点）；青色仅用于数据可视化与状态指示，不参与 UI 控件

| 角色 | CSS 变量 | Tailwind Class | HSL 值 | 设计说明 |
|---|---|---|---|---|
| bg | `--background` | `bg-background` | hsl(222 28% 8%) | 深空基底，低蓝偏移避免纯黑 |
| card | `--card` | `bg-card` | hsl(222 24% 12%) | 卡片与面板，比 bg 微亮形成层级 |
| text | `--foreground` | `text-foreground` | hsl(210 12% 92%) | 标题与正文，冷白高对比 |
| textMuted | `--muted-foreground` | `text-muted-foreground` | hsl(215 10% 55%) | 占位符、辅助信息、时间戳 |
| primary | `--primary` | `bg-primary` / `text-primary` | hsl(239 84% 59%) | 主按钮、导航激活态、品牌锚点 |
| primaryForeground | `--primary-foreground` | `text-primary-foreground` | hsl(0 0% 98%) | primary 上的文字与图标 |
| accent | `--accent` | `bg-accent` | hsl(239 30% 18%) | hover/focus 浅底、选中浅底、Skeleton |
| accentForeground | `--accent-foreground` | `text-accent-foreground` | hsl(210 12% 85%) | accent 上的文字，弱于 primary |
| border | `--border` | `border-border` | hsl(222 18% 20%) | 输入框、卡片、菜单边界，低对比融入深色环境 |

**语义色提示**:
- 成功：`hsl(142 60% 48%)` bg / `hsl(142 50% 25%)` border / `hsl(142 30% 80%)` text —— 训练完成、部署健康，饱和度与 primary 对齐
- 警告：`hsl(38 85% 52%)` bg / `hsl(38 70% 30%)` border / `hsl(38 20% 85%)` text —— 资源告警、训练中断，暖色在深色背景上醒目但不刺眼
- 错误：`hsl(0 72% 55%)` bg / `hsl(0 60% 28%)` border / `hsl(0 25% 85%)` text —— 任务失败、部署异常，红色饱和度略低于 primary 避免视觉权重失衡
- 信息/青色数据：`hsl(189 94% 43%)` —— 图表曲线、实时脉冲、API 端点高亮，仅用于数据可视化与状态指示

## 4. 字体与节奏

- **font-display**: Inter —— 现代几何无衬线，与开发者工具气质一致，数字与代码混排时字形稳定
- **font-body**: Noto Sans SC —— 中文正文清晰可读，与 Inter 的 x-height 接近，混排不跳行
- **字号**: H1 text-3xl（页面标题）；H2 text-xl（区块标题）；body text-sm ~ text-base（数据密集场景用 sm）；muted text-xs
- **圆角**: subtle（`rounded-md`，约 6px）—— 保持工具界面的锐利感，卡片与按钮不过度软化

## 5. 全局布局契约

- **Reference Layout Use**: 按需求结构推导 —— 左侧导航固定 240px，顶部工具栏 56px，主内容区独立滚动
- **Page / Section Order**: 与 15 个页面清单 1:1 对齐；登录页为独立布局（无导航），其余 14 页共享 Shell
- **Standard Content Zone**: `max-w-[1400px]` + `mx-auto`，适配 1440px+ 屏幕，内容区 padding `px-6 lg:px-8 py-6`
- **Shell / Frame Alignment**: 内容容器与左侧导航 + 顶部工具栏形成独立滚动区，不与导航同宽；内容区有自己的网格系统
- **Padding & Rhythm**: `px-6 lg:px-8 py-6`，卡片内 `p-5`，间距使用 `gap-4` ~ `gap-5`，保持 4px 倍数节奏
- **Full-bleed Zones**: 训练监控页的实时曲线图、资源监控页的用量仪表可突破卡片内边距使用 `w-full`；内部图例和标签仍受卡片 padding 约束
- **Local Narrowing**: 登录页表单 `max-w-md`；创建项目/部署配置表单 `max-w-3xl`；API 文档代码块 `max-w-4xl`
- **Overflow Strategy**: 数据集表格、模型版本列表、部署实例列表使用 `overflow-x-auto`；训练日志使用 `overflow-y-auto` 固定高度
- **Flexibility Boundary**: 允许移动端导航折叠与卡片堆叠；全局 max-w、圆角系统、主色、阴影语言保持一致

## 6. 视觉与动效

- **装饰**: 细线分隔 + 低透明度网格线（图表区）+ 青色状态脉冲点
- **阴影/边界**: 轻阴影（`shadow-sm`）仅用于卡片微抬；边框使用低对比 `border-border` 融入深色环境
- **动效**: 克制 —— hover 时边框变亮 0.15s transition；训练监控页曲线实时更新使用 0.3s ease-out；导航折叠/展开 0.2s；无大面积入场动画

## 7. 组件原则

- 按钮、表单、菜单、卡片必须有 Default / Hover / Active / Focus / Disabled 状态
- Primary 按钮使用 `bg-primary` 承担主行动（创建项目、启动训练、部署）；Secondary 使用 `border-border` + `bg-transparent`；Ghost 使用 `accent` 承接 hover/focus
- 数据可视化图表（训练曲线、混淆矩阵、资源用量）使用青色 `hsl(189 94% 43%)` 作为主数据色，靛蓝 `hsl(239 84% 59%)` 作为辅助系列色
- 加载状态使用 Skeleton（`bg-accent` + pulse 动画），空状态使用 `textMuted` + 图标居中布局

## 8. Image Direction

- **Image Role**: 登录页品牌主视觉 —— 展示 NeuralForge 平台核心意象；其余页面无强制图片需求，优先通过排版、色彩和图表建立视觉记忆点
- **Image Art Direction**: 深色背景上的抽象神经网络拓扑图，靛蓝与青色光线在节点间流动，低曝光、高对比，画面重心偏左为登录表单留出右侧空间；构图采用对角线动态，光线从左上向右下延伸；材质感接近光纤/电路板蚀刻，避免卡通化或过于具象的脑图
- **Image Prompt Keywords**: abstract neural network topology, dark background, indigo and cyan light streams, fiber optic nodes, low exposure, high contrast, diagonal composition, circuit etching texture, minimalist tech, 8k resolution
- **Image Avoidance**: 避免通用“芯片+电路板”素材图、蓝色发光大脑图标、商务人物插画、无主题渐变球体、过度发光的霓虹效果

## 9. Anti-patterns

- **Split personality**: 登录页与内页使用不同色板或圆角系统；全站共享同一套深色色板与 subtle 圆角
- **Phantom tokens**: 编造 `--chart-1` 等未定义变量；图表色直接使用语义色或 primary/accent 的 HSL 值
- **Default SaaS drift**: 回退到浅灰背景、默认蓝按钮、通用紫色渐变卡片；保持深色基底 + 靛蓝 primary + 青色数据高亮的一致性
- **Invisible interaction**: 深色背景下 hover 状态仅靠颜色变化不够明显；需配合边框亮度变化或微弱的背景提亮
- **Mono-hue tyranny**: 靛蓝铺满导航、按钮、链接、图标、图表；primary 仅用于 CTA 与导航激活态，图表数据使用青色，其余交互使用 accent 中性色
- **Status color drift**: 成功绿、警告橙、错误红在深色背景上饱和度过高产生“霓虹刺眼”感；语义色饱和度需与 primary 对齐，深色背景下适当降低 5-10% 饱和度