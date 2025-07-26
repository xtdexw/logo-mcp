# NPM登录故障排除指南

## 当前问题
NPM登录失败，错误信息：`user registration disabled`

## 解决方案

### 方案1: 使用npm adduser（推荐）
```bash
npm adduser
```
按提示输入：
- Username: `pickstar-2025`
- Password: `khazix791029`
- Email: `zxworkem@163.com`

### 方案2: 浏览器登录
```bash
npm login --auth-type=web
```
这会打开浏览器进行登录

### 方案3: 手动设置认证令牌
如果您已经有NPM账户，可以：
1. 访问 https://www.npmjs.com/settings/tokens
2. 创建新的访问令牌
3. 设置令牌：
```bash
npm config set //registry.npmjs.org/:_authToken YOUR_TOKEN_HERE
```

### 方案4: 完全重置NPM配置
```bash
# 清除所有NPM配置
npm config delete registry
npm config delete //registry.npmjs.org/:_authToken
npm cache clean --force

# 重新设置官方源
npm config set registry https://registry.npmjs.org/

# 重新登录
npm adduser
```

## 验证登录成功
```bash
npm whoami
# 应该显示: pickstar-2025
```

## 如果仍然失败

### 检查网络连接
```bash
# 测试NPM连接
npm ping
```

### 使用备用包名发布
如果登录问题持续，我们可以：
1. 使用GitHub Packages发布
2. 修改包名为scoped包：`@pickstar-2025/logo-mcp`
3. 使用其他包名：`logo-mcp-extractor`

## 发布到GitHub Packages（备用方案）

### 1. 创建.npmrc文件
```bash
echo "@pickstar-2025:registry=https://npm.pkg.github.com" > .npmrc
```

### 2. 修改package.json
```json
{
  "name": "@pickstar-2025/logo-mcp",
  "publishConfig": {
    "registry": "https://npm.pkg.github.com"
  }
}
```

### 3. 使用GitHub Token登录
```bash
npm login --scope=@pickstar-2025 --registry=https://npm.pkg.github.com
```

### 4. 发布
```bash
npm publish
```

## 当前状态检查命令
```bash
# 检查当前NPM源
npm config get registry

# 检查登录状态
npm whoami

# 检查NPM配置
npm config list

# 清理缓存
npm cache clean --force
```

## 成功登录后的下一步
1. 运行 `node quick-publish.js`
2. 或手动执行：
   ```bash
   npm run build
   npm publish --access public
   ```

请按照上述方案逐一尝试，直到登录成功！