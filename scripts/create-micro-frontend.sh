#!/bin/bash

# 微前端应用创建脚本
# 使用方法: ./create-micro-frontend.sh <应用名称> <端口号> "<应用标题>"
# 示例: ./create-micro-frontend.sh inventory 3004 "库存管理系统"

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查参数
if [ $# -ne 3 ]; then
    echo -e "${RED}错误: 参数数量不正确${NC}"
    echo "使用方法: $0 <应用名称> <端口号> \"<应用标题>\""
    echo "示例: $0 inventory 3004 \"库存管理系统\""
    exit 1
fi

MODULE_NAME=$1
PORT=$2
TITLE=$3
TEMPLATE_DIR="mf-template"
NEW_MODULE_DIR="mf-${MODULE_NAME}"

echo -e "${BLUE}开始创建微前端应用: ${MODULE_NAME}${NC}"
echo -e "${BLUE}端口: ${PORT}${NC}"
echo -e "${BLUE}标题: ${TITLE}${NC}"

# 检查模板目录是否存在
if [ ! -d "$TEMPLATE_DIR" ]; then
    echo -e "${RED}错误: 模板目录 ${TEMPLATE_DIR} 不存在${NC}"
    exit 1
fi

# 检查目标目录是否已存在
if [ -d "$NEW_MODULE_DIR" ]; then
    echo -e "${RED}错误: 目标目录 ${NEW_MODULE_DIR} 已存在${NC}"
    exit 1
fi

# 复制模板
echo -e "${YELLOW}复制模板目录...${NC}"
cp -r "$TEMPLATE_DIR" "$NEW_MODULE_DIR"

# 进入新目录
cd "$NEW_MODULE_DIR"

# 批量替换配置
echo -e "${YELLOW}替换配置文件...${NC}"

# 替换 package.json
sed -i '' "s/mf-template/mf-${MODULE_NAME}/g" package.json
sed -i '' "s/微前端模板系统/${TITLE}/g" package.json

# 替换 rsbuild.config.ts
sed -i '' "s/3003/${PORT}/g" rsbuild.config.ts
sed -i '' "s/微前端模板系统/${TITLE}/g" rsbuild.config.ts

# 替换 module-federation.config.ts
sed -i '' "s/template/${MODULE_NAME}/g" module-federation.config.ts

# 替换 deployment.ts
sed -i '' "s/template/${MODULE_NAME}/g" src/config/deployment.ts
sed -i '' "s/3003/${PORT}/g" src/config/deployment.ts
sed -i '' "s/微前端模板系统/${TITLE}/g" src/config/deployment.ts

# 替换 routes/index.ts
sed -i '' "s/template/${MODULE_NAME}/g" src/routes/index.ts
sed -i '' "s/模板系统/${TITLE}/g" src/routes/index.ts

# 替换 App.tsx
sed -i '' "s/template/${MODULE_NAME}/g" src/App.tsx
sed -i '' "s/模板系统/${TITLE}/g" src/App.tsx
sed -i '' "s/TemplateApp/${MODULE_NAME^}App/g" src/App.tsx

# 替换 ErrorBoundary.tsx
sed -i '' "s/模板系统/${TITLE}/g" src/components/ErrorBoundary.tsx
sed -i '' "s/\/template\/dashboard/\/${MODULE_NAME}\/dashboard/g" src/components/ErrorBoundary.tsx

# 替换 README.md
sed -i '' "s/mf-template/mf-${MODULE_NAME}/g" README.md
sed -i '' "s/微前端模板系统/${TITLE}/g" README.md
sed -i '' "s/3003/${PORT}/g" README.md

# 替换 .github/workflows/deploy.yml
if [ -f ".github/workflows/deploy.yml" ]; then
    sed -i '' "s/mf-template/mf-${MODULE_NAME}/g" .github/workflows/deploy.yml
fi

# 替换 public/404.html
sed -i '' "s/mf-template/mf-${MODULE_NAME}/g" public/404.html

# 替换 public/index.html
sed -i '' "s/微前端模板系统/${TITLE}/g" public/index.html

# 清理 .git 目录（如果存在）
if [ -d ".git" ]; then
    rm -rf .git
fi

# 安装依赖
echo -e "${YELLOW}安装依赖...${NC}"
npm install

# 创建 .gitignore（如果不存在）
if [ ! -f ".gitignore" ]; then
    cat > .gitignore << EOF
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Production
dist/
build/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
logs
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# nyc test coverage
.nyc_output

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env
EOF
fi

# 创建启动脚本
cat > start-dev.sh << EOF
#!/bin/bash
echo "启动 ${TITLE} 开发服务器..."
npm run dev
EOF

chmod +x start-dev.sh

# 创建构建脚本
cat > build.sh << EOF
#!/bin/bash
echo "构建 ${TITLE}..."
npm run build
EOF

chmod +x build.sh

echo -e "${GREEN}✅ 微前端应用创建成功！${NC}"
echo -e "${BLUE}📁 目录: ${NEW_MODULE_DIR}${NC}"
echo -e "${BLUE}🚀 启动开发服务器:${NC}"
echo -e "${YELLOW}  cd ${NEW_MODULE_DIR}${NC}"
echo -e "${YELLOW}  npm run dev${NC}"
echo -e "${BLUE}📦 构建应用:${NC}"
echo -e "${YELLOW}  npm run build${NC}"
echo -e "${BLUE}🔧 下一步操作:${NC}"
echo -e "${YELLOW}  1. 修改 src/pages/ 目录下的页面内容${NC}"
echo -e "${YELLOW}  2. 更新 src/routes/index.ts 中的路由配置${NC}"
echo -e "${YELLOW}  3. 在主应用中注册新应用${NC}"
echo -e "${YELLOW}  4. 测试微前端集成${NC}"

# 返回上级目录
cd ..

echo -e "${GREEN}🎉 应用创建完成！${NC}" 