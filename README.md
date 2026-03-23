# Vue3 12天重学计划 - 电商实战平台

> 🌍 **在线体验地址:** [点击访问 (待替换为你的 Vercel 链接)](#)

这是一个基于 Vue3 Composition API + Vite 构建的现代化前端电商项目。项目旨在通过一个完整的业务闭环，深入实践 Vue 核心生态，完成从基础语法到工程化交付的全链路落地。

## 🛠 技术栈

- **核心框架:** Vue 3.x (`<script setup>` 语法糖)
- **路由管理:** Vue Router 4 (带全局前置路由守卫)
- **状态管理:** Pinia (支持 LocalStorage 数据持久化)
- **网络请求:** Axios (请求拦截、Token 注入、统一错误处理)
- **构建工具:** Vite
- **API 支持:** Fake Store API (RESTful)

## ✨ 核心功能清单

- **用户鉴权:** 基于 Token 的登录与拦截体系，受保护的路由自动重定向。
- **商品中心:** 商品列表获取、Skeleton 骨架屏加载、空状态处理。
- **复杂交互:** \* 支持按分类筛选商品。
  - 支持按名称实时模糊搜索。
  - 支持价格、名称的多维度升降序排序。
- **购物车与结算流程:** \* 跨组件通信实现加入购物车功能。
  - 动态库存上限拦截与校验。
  - 基于**状态机 (State Machine)** 设计的结算弹窗（包含确认、提交中防抖、成功回显、失败重试机制）。

## 📁 核心目录结构

```text
src/
├── api/            # 接口请求层 (Axios 封装与 modules 分块)
├── assets/         # 静态资源与全局 CSS
├── composables/    # 组合式函数 (如 useProducts 抽离业务逻辑)
├── router/         # Vue Router 配置与权限守卫
├── stores/         # Pinia 状态管理 (user, cart, learning)
├── utils/          # 工具函数 (格式化价格、持久化存储等)
├── views/          # 页面级视图组件
├── App.vue         # 根组件 (包含顶层 Layout 与 导航状态)
└── main.js         # 全局应用挂载入口
```

🚀 本地运行步骤
克隆项目并安装依赖

Bash
npm install
配置环境变量
参考项目根目录下的 .env.example 文件，按需配置本地环境变量（默认已配置兜底 URL）。

启动开发服务器

Bash
npm run dev
生产环境构建与预览

Bash
npm run build
npm run preview
(注：本地构建已通过，无报错)

🔐 测试账号说明
本项目接入了 Fake Store API 的鉴权接口，访问“练习”、“任务”、“我的”等受保护页面需先进行登录。

用户名: johnd

密码: m38rmF$

⚠️ 已知限制与特殊说明
库存模拟: 由于 Fake Store API 未提供商品库存数据，前端在数据清洗层拦截并利用 Math.random() 随机生成了静态的模拟库存值。

结算闭环: 结算接口使用了 setTimeout 配合随机概率模拟网络超时、服务报错与业务库存不足等异常场景，未真实对接支付网关。
