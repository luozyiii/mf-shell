#!/bin/bash

# 微前端应用开发规范检查脚本
# 检查所有应用是否符合统一的开发规范

set -e

echo "🔍 开始检查微前端应用开发规范..."

# 应用列表
APPS=("mf-shell" "mf-finance" "mf-marketing" "mf-template")

# 检查结果统计
TOTAL_APPS=${#APPS[@]}
PASSED_APPS=0
FAILED_APPS=0

# 检查函数
check_app_standards() {
    local app=$1
    local app_passed=true
    
    echo ""
    echo "📦 检查 $app 开发规范..."
    echo "=================================="
    
    cd "$app"
    
    # 1. 检查必要文件是否存在
    echo "🔍 检查配置文件..."
    
    local required_files=(
        ".eslintrc.js"
        ".prettierrc"
        ".prettierignore"
        ".commitlintrc.js"
        ".eslintignore"
        "tsconfig.json"
    )
    
    for file in "${required_files[@]}"; do
        if [[ -f "$file" ]]; then
            echo "✅ $file 存在"
        else
            echo "❌ $file 缺失"
            app_passed=false
        fi
    done
    
    # 2. 检查 package.json 脚本
    echo ""
    echo "📋 检查 package.json 脚本..."
    
    local required_scripts=(
        "lint"
        "lint:fix"
        "format"
        "format:check"
        "type-check"
        "code-quality"
    )
    
    for script in "${required_scripts[@]}"; do
        if npm run --silent "$script" >/dev/null 2>&1; then
            echo "✅ $script 脚本存在"
        else
            echo "❌ $script 脚本缺失"
            app_passed=false
        fi
    done
    
    # 3. 检查 lint-staged 配置
    echo ""
    echo "🔧 检查 lint-staged 配置..."
    if node -e "
    const fs = require('fs');
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    if (pkg['lint-staged']) {
        console.log('✅ lint-staged 配置存在');
        process.exit(0);
    } else {
        console.log('❌ lint-staged 配置缺失');
        process.exit(1);
    }
    " 2>/dev/null; then
        echo "✅ lint-staged 配置正确"
    else
        echo "❌ lint-staged 配置缺失或错误"
        app_passed=false
    fi
    
    # 4. 检查 Husky 配置
    echo ""
    echo "🐕 检查 Husky 配置..."
    if [[ -d ".husky" ]] && [[ -f ".husky/pre-commit" ]] && [[ -f ".husky/commit-msg" ]]; then
        echo "✅ Husky 配置存在"
    else
        echo "❌ Husky 配置缺失"
        app_passed=false
    fi
    
    # 5. 检查 TypeScript 严格模式
    echo ""
    echo "🔧 检查 TypeScript 配置..."
    if node -e "
    const fs = require('fs');
    const tsconfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
    const strict = tsconfig.compilerOptions?.strict;
    const noImplicitAny = tsconfig.compilerOptions?.noImplicitAny;
    const noUnusedLocals = tsconfig.compilerOptions?.noUnusedLocals;
    
    if (strict && noImplicitAny && noUnusedLocals) {
        console.log('✅ TypeScript 严格模式已启用');
        process.exit(0);
    } else {
        console.log('❌ TypeScript 严格模式未完全启用');
        process.exit(1);
    }
    " 2>/dev/null; then
        echo "✅ TypeScript 严格模式配置正确"
    else
        echo "❌ TypeScript 严格模式配置不正确"
        app_passed=false
    fi
    
    # 6. 检查依赖版本一致性
    echo ""
    echo "📦 检查依赖版本..."
    
    # 检查核心依赖版本
    local core_deps=("react" "react-dom" "antd" "typescript")
    for dep in "${core_deps[@]}"; do
        local version=$(node -e "
        const fs = require('fs');
        const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        const deps = { ...pkg.dependencies, ...pkg.devDependencies };
        console.log(deps['$dep'] || 'not-found');
        " 2>/dev/null)
        
        if [[ "$version" != "not-found" ]]; then
            echo "✅ $dep: $version"
        else
            echo "❌ $dep 版本未找到"
            app_passed=false
        fi
    done
    
    # 7. 运行代码质量检查
    echo ""
    echo "🔍 运行代码质量检查..."
    
    # 检查 ESLint
    if npm run lint >/dev/null 2>&1; then
        echo "✅ ESLint 检查通过"
    else
        echo "⚠️ ESLint 检查发现问题"
        npm run lint 2>&1 | head -10
    fi
    
    # 检查 Prettier
    if npm run format:check >/dev/null 2>&1; then
        echo "✅ Prettier 检查通过"
    else
        echo "⚠️ Prettier 检查发现问题"
    fi
    
    # 检查 TypeScript
    if npm run type-check >/dev/null 2>&1; then
        echo "✅ TypeScript 类型检查通过"
    else
        echo "⚠️ TypeScript 类型检查发现问题"
        npm run type-check 2>&1 | head -10
    fi
    
    cd ..
    
    # 返回检查结果
    if [[ "$app_passed" == "true" ]]; then
        echo ""
        echo "✅ $app 开发规范检查通过！"
        ((PASSED_APPS++))
    else
        echo ""
        echo "❌ $app 开发规范检查失败！"
        ((FAILED_APPS++))
    fi
}

# 执行检查
for app in "${APPS[@]}"; do
    if [[ -d "$app" ]]; then
        check_app_standards "$app"
    else
        echo "❌ 应用 $app 目录不存在"
        ((FAILED_APPS++))
    fi
done

# 输出总结
echo ""
echo "=================================="
echo "📊 开发规范检查总结"
echo "=================================="
echo "总应用数: $TOTAL_APPS"
echo "通过检查: $PASSED_APPS"
echo "未通过检查: $FAILED_APPS"
echo ""

if [[ $FAILED_APPS -eq 0 ]]; then
    echo "🎉 所有应用都符合开发规范！"
    exit 0
else
    echo "⚠️ 有 $FAILED_APPS 个应用需要修复开发规范问题"
    echo ""
    echo "🔧 修复建议："
    echo "1. 运行 ./scripts/setup-dev-standards.sh 重新设置规范"
    echo "2. 在每个应用目录中运行: npm install"
    echo "3. 运行: npm run lint:fix 修复 ESLint 问题"
    echo "4. 运行: npm run format 格式化代码"
    exit 1
fi 