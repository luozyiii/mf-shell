#!/bin/bash

# 启动所有微前端应用的脚本

set -e

echo "🚀 启动所有微前端应用..."
echo "=================================="

# 应用列表
APPS=(
  "mf-template:3003"
  "mf-shell:3000"
)

# 检查端口是否被占用
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "⚠️ 端口 $port 已被占用"
        return 1
    else
        echo "✅ 端口 $port 可用"
        return 0
    fi
}

# 启动应用
start_app() {
    local app_dir=$1
    local port=$2
    
    echo ""
    echo "📦 启动 $app_dir (端口: $port)..."
    
    # 检查应用目录是否存在
    if [[ ! -d "$app_dir" ]]; then
        echo "❌ 应用目录 $app_dir 不存在"
        return 1
    fi
    
    # 检查端口是否可用
    if ! check_port $port; then
        echo "❌ 无法启动 $app_dir，端口 $port 被占用"
        return 1
    fi
    
    # 进入应用目录并启动
    cd "$app_dir"
    
    # 检查是否有 package.json
    if [[ ! -f "package.json" ]]; then
        echo "❌ $app_dir 中没有 package.json"
        cd ..
        return 1
    fi
    
    # 检查是否有 node_modules
    if [[ ! -d "node_modules" ]]; then
        echo "📥 安装 $app_dir 依赖..."
        npm install
    fi
    
    # 启动应用
    echo "🚀 启动 $app_dir..."
    npm run dev &
    
    # 保存进程 ID
    echo $! > "../.${app_dir}_pid"
    
    cd ..
    
    # 等待应用启动
    echo "⏳ 等待 $app_dir 启动..."
    sleep 5
    
    # 检查应用是否成功启动
    if curl -s --head "http://localhost:$port" >/dev/null 2>&1; then
        echo "✅ $app_dir 启动成功 (http://localhost:$port)"
        return 0
    else
        echo "❌ $app_dir 启动失败"
        return 1
    fi
}

# 清理函数
cleanup() {
    echo ""
    echo "🧹 清理进程..."
    
    for app_config in "${APPS[@]}"; do
        app_dir=$(echo "$app_config" | cut -d: -f1)
        pid_file=".${app_dir}_pid"
        
        if [[ -f "$pid_file" ]]; then
            pid=$(cat "$pid_file")
            if kill -0 "$pid" 2>/dev/null; then
                echo "🛑 停止 $app_dir (PID: $pid)"
                kill "$pid"
            fi
            rm -f "$pid_file"
        fi
    done
}

# 设置信号处理
trap cleanup EXIT INT TERM

# 启动所有应用
total_apps=${#APPS[@]}
started_apps=0

for app_config in "${APPS[@]}"; do
    app_dir=$(echo "$app_config" | cut -d: -f1)
    port=$(echo "$app_config" | cut -d: -f2)
    
    if start_app "$app_dir" "$port"; then
        ((started_apps++))
    fi
done

echo ""
echo "=================================="
echo "📊 启动结果总结"
echo "=================================="
echo "总应用数: $total_apps"
echo "成功启动: $started_apps"
echo "启动失败: $((total_apps - started_apps))"
echo ""

if [[ $started_apps -eq $total_apps ]]; then
    echo "🎉 所有应用启动成功！"
    echo ""
    echo "📋 应用访问地址："
    echo "- 主应用 (Shell): http://localhost:3000"
    echo "- 营销系统: http://localhost:3001"
    echo "- 财务系统: http://localhost:3002"
    echo "- 模板系统: http://localhost:3003"
    echo ""
    echo "💡 提示："
    echo "1. 在浏览器中访问 http://localhost:3000"
    echo "2. 登录后可以访问各个微前端模块"
    echo "3. 按 Ctrl+C 停止所有应用"
    echo ""
    echo "⏳ 保持运行中... (按 Ctrl+C 停止)"
    
    # 保持脚本运行
    wait
else
    echo "⚠️ 有 $((total_apps - started_apps)) 个应用启动失败"
    echo ""
    echo "🔧 故障排除："
    echo "1. 检查端口是否被其他应用占用"
    echo "2. 确保所有依赖都已安装"
    echo "3. 查看应用日志获取详细错误信息"
    exit 1
fi 