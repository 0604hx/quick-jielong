# 接龙后端程序

## 二次开发

## 部署
> 此处以`pm2`为例

```shell
# 在项目根目录下运行打包
pnpm serve:build

# 初始化（程序运行目录为 /app/jielong )
node server.js --init

# 启动
pm2 start server.js --name jielong --cwd /app/jielong

# 配置nginx（可选）
## 刷新证书
certbot certonly --nginx
```
