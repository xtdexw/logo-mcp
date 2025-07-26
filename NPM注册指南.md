# NPM账户注册和发布指南

## 1. 创建NPM账户

### 方式1: 在线注册（推荐）
1. 访问 https://www.npmjs.com/signup
2. 填写注册信息：
   - Username: 选择一个唯一的用户名（建议使用 xtdexw 或类似）
   - Email: 您的邮箱地址
   - Password: 安全密码
3. 验证邮箱
4. 完成注册

### 方式2: 命令行注册
```bash
npm adduser
# 按提示输入用户名、密码、邮箱
```

## 2. 登录NPM

注册完成后，在项目目录中登录：
```bash
npm login
# 输入用户名、密码、邮箱
```

验证登录状态：
```bash
npm whoami
# 应该显示您的用户名
```

## 3. 发布包

### 方式1: 使用我们的一键部署脚本
```bash
npm run deploy
```

### 方式2: 手动发布
```bash
# 确保构建完成
npm run build

# 发布到NPM
npm publish --access public
```

## 4. 验证发布

发布成功后：
1. 访问 https://www.npmjs.com/package/logo-mcp
2. 测试安装：`npx logo-mcp`

## 5. 包名说明

当前包名是 `logo-mcp`，发布后用户可以通过以下方式使用：
- `npx logo-mcp` - 直接运行
- `npm install -g logo-mcp` - 全局安装
- 在MCP客户端中配置使用

## 6. 如果包名被占用

如果 `logo-mcp` 被占用，可以使用：
- `@xtdexw/logo-mcp` - 使用您的用户名作为scope
- `logo-mcp-extractor` - 添加描述性后缀
- `website-logo-mcp` - 更具体的名称

需要修改包名时，更新 `package.json` 中的 `name` 字段即可。