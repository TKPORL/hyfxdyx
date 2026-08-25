# 黄油分享 · 单游戏

每天自动爬取 [Tsinho黄油站](https://tkporl.github.io/mrhyfx/) 所有帖子里的游戏卡片（游戏名称 / 介绍 / 封面图 / 网盘下载链接），生成静态页面部署在 GitHub Pages 上，风格与原站一致。

## 工作原理

```
GitHub Actions（每15分钟自动检测）
        │
        ▼
scripts/crawl.py
  1. 抓取原站首页 → 解析全部帖子列表
  2. 逐个抓取帖子详情页 → 解析每张游戏卡片
  3. 图片直接引用原站图床地址，不做下载
  4. 与本地 data/games.json 全量比对：
     无变化 → 跳过；有新增/修改/删除 → 重新生成
        │
        ▼
数据有变化时：git 自动 commit + push → GitHub Pages 自动发布
        │
        ▼
首页读取 data/games.json 渲染所有游戏卡片（支持搜索、分页、按新旧排序）
```

> 同步机制说明：源站新增帖子/游戏会自动爬取收录；源站删除帖子/游戏后，
> 下一次检测（最多约15分钟）也会自动从本站移除，保持完全同步。

## 首次部署步骤

1. 在 GitHub 上创建空仓库 `TKPORL/hyfxdyx`（不要勾选初始化 README）
2. 推送本仓库：
   ```bash
   git push -u origin main
   ```
3. 打开仓库 **Settings → Pages → Source** 选择 **GitHub Actions**（工作流也会自动尝试开启）
4. 手动触发一次验证：仓库 **Actions → Daily Crawl → Run workflow**
5. 运行成功后访问：`https://tkporl.github.io/hyfxdyx/`

## 后台管理（tsinhoht.html）

访问 `https://tkporl.github.io/hyfxdyx/tsinhoht.html` 进入后台（默认密码 `tsinho123`，登录后可在「设置」修改）。

功能：仪表盘统计（含本站总访问量 PV / 独立访客 UV）、游戏增删改查（搜索 / 筛选 / 排序 / 批量删除 / 复制）、数据导入导出、操作日志、修改密码。

访客统计由前台页脚的 [VerCount](https://www.vercount.one/) 计数（不蒜子替代方案），前台每次被访问会自动把最新数值缓存到浏览器，后台仪表盘读取展示。

改动生效流程：

1. 后台编辑 → 「保存并应用」→ 打开首页立即预览（仅本浏览器可见）
2. 确认无误 → 「导出 games.override.json」→ 提交到仓库 `data/games.override.json`
3. 爬虫每次自动同步时会合并该文件：同 ID 覆盖、新 ID 追加到最前、`remove_ids` 中的条目被移除，因此后台改动不会被自动同步覆盖

## 本地运行爬虫

```bash
python scripts/crawl.py
```

只需 Python 3 标准库，无需安装依赖。

## 自定义

| 内容 | 位置 |
| --- | --- |
| 检测频率 | `.github/workflows/crawl.yml` 里的 `cron`（当前每15分钟） |
| 站点导航链接 | `index.html` 头部 `<nav>` |
| 每页显示数量 | `index.html` 里 `PAGE_SIZE` |

## 目录结构

```
├── .github/workflows/crawl.yml   # 定时爬取 + 发布工作流
├── scripts/crawl.py              # 爬虫脚本（自动合并后台覆盖数据）
├── index.html                    # 首页（渲染游戏卡片）
├── tsinhoht.html                 # 后台管理页
└── data/games.json               # 爬取生成的数据
```
