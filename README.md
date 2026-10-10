# Vatapex Site · 独立展示站

纬达派 Vatapex 的对外展示站，包含红人案例库、渠道案例库、产品展示、红人专属主页。

## 🌐 线上地址

- 主页：https://shop.vatapex.com
- 产品展示：https://shop.vatapex.com/products
- 红人案例库：https://shop.vatapex.com/influencers
- 渠道案例库：https://shop.vatapex.com/channels
- 合作意向：https://shop.vatapex.com/interest
- 红人主页：https://shop.vatapex.com/influencer/{handle}
- 红人登录：https://shop.vatapex.com/influencer-login

## 🛠️ 技术栈

- React 18 + TypeScript
- Vite 5
- Ant Design 5
- React Router 6

## 🚀 本地开发

```bash
npm install
npm run dev      # http://localhost:3200
📦 部署
Git push 后 Cloudflare Pages 自动部署：

bash
git add .
git commit -m "feat: xxx"
git push
🔑 环境变量
.env 文件（不提交到 Git）：

text
VITE_API_URL=https://rp-api.vatapex.com
Cloudflare Pages 环境变量里也要配 VITE_API_URL。

📁 目录结构
text
src/
├── api/          # HTTP 客户端
├── components/   # 公共组件（Nav、Footer）
├── pages/        # 页面
│   ├── Home.tsx               # 首页
│   ├── Products.tsx           # 产品展示
│   ├── ProductDetail.tsx      # 产品详情
│   ├── Influencers.tsx        # 红人案例库
│   ├── Channels.tsx           # 渠道案例库
│   ├── Interest.tsx           # 合作意向
│   ├── InfluencerHome.tsx     # 红人专属主页
│   ├── InfluencerLogin.tsx    # 红人登录
│   └── InfluencerDashboard.tsx # 红人中心
└── App.tsx       # 路由
📝 关联项目
内部后台：https://github.com/TsaiCora/vatapex-admin

后端 API：https://github.com/TsaiCora/vatapex-worker

最后更新：2026-10-10