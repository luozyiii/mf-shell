#!/bin/bash

# 检查远程微前端应用状态的脚本

set -e

echo "🔍 检查远程微前端应用状态..."
echo "=================================="

# 应用配置
APPS=(
  "marketing:http://localhost:3001"
  "finance:http://localhost:3002"
  "template:http://localhost:3003"
)

# 检查函数
check_app() {
    local app_name=$1
    local app_url=$2
    
    echo ""
    echo "📦 检查 $app_name ($app_url)..."
    
    # 检查应用是否运行
    if curl -s --head "$app_url" >/dev/null 2>&1; then
        echo "✅ $app_name 服务器正在运行"
    else
        echo "❌ $app_name 服务器未运行"
        return 1
    fi
    
    # 检查 remoteEntry.js 是否可访问
    if curl -s --head "$app_url/remoteEntry.js" >/dev/null 2>&1; then
        echo "✅ $app_name remoteEntry.js 可访问"
    else
        echo "❌ $app_name remoteEntry.js 不可访问"
        return 1
    fi
    
    # 检查 remoteEntry.js 内容
    local remote_entry_content=$(curl -s "$app_url/remoteEntry.js" 2>/dev/null || echo "")
    if [[ -n "$remote_entry_content" ]]; then
        echo "✅ $app_name remoteEntry.js 有内容"
        
        # 检查是否包含 Module Federation 相关代码
        if echo "$remote_entry_content" | grep -q "webpack_require"; then
            echo "✅ $app_name 包含 Module Federation 代码"
        else
            echo "⚠️ $app_name 可能缺少 Module Federation 代码"
        fi
    else
        echo "❌ $app_name remoteEntry.js 为空或无法访问"
        return 1
    fi
    
    return 0
}

# 执行检查
total_apps=${#APPS[@]}
running_apps=0

for app_config in "${APPS[@]}"; do
    app_name=$(echo "$app_config" | cut -d: -f1)
    app_url=$(echo "$app_config" | cut -d: -f2)
    
    if check_app "$app_name" "$app_url"; then
        ((running_apps++))
    fi
done

echo ""
echo "=================================="
echo "📊 检查结果总结"
echo "=================================="
echo "总应用数: $total_apps"
echo "正在运行: $running_apps"
echo "未运行: $((total_apps - running_apps))"
echo ""

if [[ $running_apps -eq $total_apps ]]; then
    echo "🎉 所有远程应用都在运行！"
    echo ""
    echo "📋 下一步操作："
    echo "1. 确保主应用 (mf-shell) 正在运行"
    echo "2. 在浏览器中访问主应用"
    echo "3. 尝试加载远程模块"
    exit 0
else
    echo "⚠️ 有 $((total_apps - running_apps)) 个应用未运行"
    echo ""
    echo "🔧 启动建议："
    echo "1. 在 mf-marketing 目录中运行: npm run dev"
    echo "2. 在 mf-finance 目录中运行: npm run dev"
    echo "3. 在 mf-template 目录中运行: npm run dev"
    echo "4. 确保所有应用都在不同的终端窗口中运行"
    exit 1
fi 