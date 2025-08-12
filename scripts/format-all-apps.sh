#!/bin/bash

# 微前端应用代码格式化脚本
# 为所有应用运行统一的代码格式化

set -e

echo "🎨 开始格式化所有微前端应用代码..."

# 应用列表
APPS=("mf-shell" "mf-finance" "mf-marketing" "mf-template")

# 格式化统计
TOTAL_APPS=${#APPS[@]}
SUCCESS_APPS=0
FAILED_APPS=0

# 格式化函数
format_app() {
    local app=$1
    
    echo ""
    echo "📦 格式化 $app 代码..."
    echo "=================================="
    
    if [[ ! -d "$app" ]]; then
        echo "❌ 应用 $app 目录不存在"
        ((FAILED_APPS++))
        return 1
    fi
    
    cd "$app"
    
    # 检查是否有 package.json
    if [[ ! -f "package.json" ]]; then
        echo "❌ package.json 不存在"
        ((FAILED_APPS++))
        cd ..
        return 1
    fi
    
    # 检查是否有必要的脚本
    if ! npm run --silent format >/dev/null 2>&1; then
        echo "❌ format 脚本不存在，跳过 $app"
        ((FAILED_APPS++))
        cd ..
        return 1
    fi
    
    # 运行格式化
    echo "🔧 运行 Prettier 格式化..."
    if npm run format; then
        echo "✅ Prettier 格式化完成"
    else
        echo "❌ Prettier 格式化失败"
        ((FAILED_APPS++))
        cd ..
        return 1
    fi
    
    # 运行 ESLint 修复
    echo "🔧 运行 ESLint 自动修复..."
    if npm run lint:fix; then
        echo "✅ ESLint 自动修复完成"
    else
        echo "⚠️ ESLint 自动修复发现问题"
    fi
    
    # 检查 TypeScript 类型
    echo "🔧 检查 TypeScript 类型..."
    if npm run type-check >/dev/null 2>&1; then
        echo "✅ TypeScript 类型检查通过"
    else
        echo "⚠️ TypeScript 类型检查发现问题"
        npm run type-check 2>&1 | head -10
    fi
    
    echo "✅ $app 代码格式化完成！"
    ((SUCCESS_APPS++))
    cd ..
}

# 执行格式化
for app in "${APPS[@]}"; do
    format_app "$app"
done

# 输出总结
echo ""
echo "=================================="
echo "📊 代码格式化总结"
echo "=================================="
echo "总应用数: $TOTAL_APPS"
echo "成功格式化: $SUCCESS_APPS"
echo "格式化失败: $FAILED_APPS"
echo ""

if [[ $FAILED_APPS -eq 0 ]]; then
    echo "🎉 所有应用代码格式化完成！"
    echo ""
    echo "📋 下一步建议："
    echo "1. 运行 ./scripts/check-dev-standards.sh 检查开发规范"
    echo "2. 提交格式化后的代码"
    echo "3. 运行 npm run code-quality 进行最终质量检查"
    exit 0
else
    echo "⚠️ 有 $FAILED_APPS 个应用格式化失败"
    echo ""
    echo "🔧 修复建议："
    echo "1. 检查失败应用的 package.json 配置"
    echo "2. 确保已安装所有必要的依赖"
    echo "3. 手动运行 npm run format 和 npm run lint:fix"
    exit 1
fi 