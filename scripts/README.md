# 微前端自动化脚本工具

本目录包含了微前端系统的各种自动化脚本，用于简化开发、测试和部署流程。

## 📋 脚本列表

### 🚀 创建工具

#### `create-micro-frontend.sh`

**功能**: 创建新的微前端子系统

**使用方法**:

```bash
./create-micro-frontend.sh <模块名> <端口号> "<系统标题>"
```

**示例**:

```bash
# 创建库存管理系统
./create-micro-frontend.sh inventory 3004 "库存管理系统"

# 创建用户管理系统
./create-micro-frontend.sh user 3005 "用户管理系统"
```

**参数说明**:

- `模块名`: 英文名称，用于路由和配置（如：inventory, user）
- `端口号`: 开发服务器端口，范围 3000-9999
- `系统标题`: 中文显示名称（需要用引号包围）

### 🔧 开发工具

#### `start-all-apps.sh`

**功能**: 启动所有微前端应用

**使用方法**:

```bash
./start-all-apps.sh
```

**说明**:

- 自动检测项目中的所有微前端应用
- 并行启动所有应用的开发服务器
- 显示每个应用的启动状态和访问地址

#### `format-all-apps.sh`

**功能**: 格式化所有应用的代码

**使用方法**:

```bash
./format-all-apps.sh
```

**说明**:

- 使用 Prettier 格式化所有应用的代码
- 自动修复 ESLint 可修复的问题
- 确保代码风格一致性

#### `check-dev-standards.sh`

**功能**: 检查开发规范合规性

**使用方法**:

```bash
./check-dev-standards.sh
```

**检查项目**:

- 代码格式规范
- TypeScript 类型检查
- ESLint 规则检查
- 文件命名规范
- 目录结构规范

#### `check-remote-apps.sh`

**功能**: 检查远程应用状态

**使用方法**:

```bash
./check-remote-apps.sh
```

**检查内容**:

- 远程应用是否正常运行
- remoteEntry.js 文件是否可访问
- 应用健康状态检查
- 网络连接测试

## 🛠️ 脚本使用指南

### 开发流程中的使用

#### 1. 创建新子系统

```bash
# 1. 创建新应用
./create-micro-frontend.sh myapp 3006 "我的应用"

# 2. 检查创建结果
./check-dev-standards.sh

# 3. 启动所有应用测试集成
./start-all-apps.sh
```

#### 2. 日常开发

```bash
# 启动开发环境
./start-all-apps.sh

# 代码提交前检查
./format-all-apps.sh
./check-dev-standards.sh
```

#### 3. 问题排查

```bash
# 检查应用状态
./check-remote-apps.sh

# 检查代码规范
./check-dev-standards.sh
```

### 权限设置

首次使用前需要给脚本添加执行权限：

```bash
# 给所有脚本添加执行权限
chmod +x *.sh

# 或者单独设置
chmod +x create-micro-frontend.sh
chmod +x start-all-apps.sh
chmod +x format-all-apps.sh
chmod +x check-dev-standards.sh
chmod +x check-remote-apps.sh
```

## ⚙️ 配置说明

### 环境要求

- Node.js >= 16.0.0
- npm >= 8.0.0 或 pnpm >= 7.0.0
- Git >= 2.0.0

### 脚本配置

脚本会自动读取以下配置：

- `package.json` 中的项目信息
- `.env` 文件中的环境变量
- `module-federation.config.ts` 中的模块配置

### 自定义配置

可以通过环境变量自定义脚本行为：

```bash
# 设置默认端口范围
export MF_PORT_START=3000
export MF_PORT_END=9999

# 设置默认模块前缀
export MF_MODULE_PREFIX=mf-

# 设置检查超时时间
export MF_CHECK_TIMEOUT=30
```

## 🔍 故障排除

### 常见问题

#### 1. 权限错误

```bash
# 错误: Permission denied
# 解决: 添加执行权限
chmod +x script-name.sh
```

#### 2. 端口冲突

```bash
# 错误: Port already in use
# 解决: 检查端口占用
lsof -ti:3004 | xargs kill -9
```

#### 3. 模块创建失败

```bash
# 错误: Directory already exists
# 解决: 删除已存在的目录或使用不同名称
rm -rf mf-existing-name
```

#### 4. 应用启动失败

```bash
# 检查依赖安装
npm install

# 检查配置文件
./check-dev-standards.sh

# 查看详细错误日志
npm run dev 2>&1 | tee debug.log
```

### 调试模式

启用调试模式获取更多信息：

```bash
# 启用调试输出
export DEBUG=1
./script-name.sh

# 或者直接运行
DEBUG=1 ./script-name.sh
```

## 📝 脚本开发

### 添加新脚本

1. 创建脚本文件
2. 添加执行权限
3. 遵循命名规范
4. 添加使用说明
5. 更新本文档

### 脚本规范

```bash
#!/bin/bash
# 脚本描述
# 使用方法: ./script-name.sh [参数]

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 函数定义
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 主要逻辑
main() {
    log_info "脚本开始执行..."
    # 具体实现
    log_info "脚本执行完成"
}

# 执行主函数
main "$@"
```

## 📞 支持

如果您在使用脚本时遇到问题：

1. 查看本文档的故障排除部分
2. 检查脚本的使用说明
3. 联系开发团队获取支持

---

**🔧 工具版本**: v1.0.0  
**🔄 最后更新**: 2024-08-12  
**👥 维护团队**: 微前端开发组
