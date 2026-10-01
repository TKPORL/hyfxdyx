# AGENTS.md —— 给 AI 的入口（读完这页就能开工）

## 这是什么

**黄油分享 · 单游戏（hyfxdyx）** —— 自动爬取主站 `mrhyfx` 里的所有游戏卡片（名称 / 介绍 / 封面 /
网盘链接），生成静态站部署在 GitHub Pages：`https://tkporl.github.io/hyfxdyx/`

与主站的区别：主站按"每天一期"发帖，本站把游戏**拆成单个条目**，带搜索、分页、平台筛选、随机看看。

自动化：GitHub Actions **每 15 分钟**检测一次 → `scripts/crawl.py` 抓取比对 →
有变化就 `git commit + push` → Pages 自动发布。源站删帖，本站下一次检测也会同步移除。

## 硬性规则（★必读）

- 项目根目录 = `D:\Tsinho文件夹\Tsinho黄油站\hyfxdyx`（路径**没有空格**）
- Git 远端：`TKPORL/hyfxdyx`
- 后台页 `tsinhoht.html`（默认密码 `tsinho123`，登录后可改）
- **后台改动不会被爬虫覆盖，但必须走完这个流程才生效**：
  后台编辑 →「保存并应用」→ 确认无误 →「保存并发布到 GitHub」（一键发布，需已配 Token）；
  备用：「导出 games.override.json」手动提交到仓库 `data/games.override.json`
- 动手前先说清方案等确认；改完写变更记录（含「之前 → 现在」）；只改点名要改的

## 目录

| 路径 | 作用 |
|---|---|
| `scripts/crawl.py` | 爬虫（仅 Python 3 标准库），自动合并后台覆盖数据 |
| `index.html` | 首页（卡片网格 / 平台筛选 / 随机 / 点封面图弹「游戏介绍」弹窗） |
| `search.html` | 独立搜索页（顶部搜索图标进入；模糊匹配 / 历史 / 无结果随机推荐） |
| `tools.html` / `tutorial.html` | 游戏工具页 / 解压教程页（移植自主站） |
| `assets/js/nav.js` | 全站统一导航（样式+结构+交互，四页共用单点维护） |
| `tsinhoht.html` | 后台管理页 |
| `data/games.json` | 爬取生成的数据（全量，后台用） |
| `data/games.slim.json` | 前台瘦身版数据（去 images/post_url） |
| `data/games.override.json` | 后台改动：同 ID 覆盖、新 ID 追加到最前、`remove_ids` 里的条目被移除 |
| `.github/workflows/crawl.yml` | 定时爬取 + 发布（cron 当前每 15 分钟） |
| `sitemap.xml` `robots.txt` `favicon.webp` | 站点基础文件 |

## 当前状态

- 最后更新：2026-10-01
- Git：正常（`.git/index` 已于 10-01 由用户修复，此前 09-28 诊断报告里的故障已解除）
- 本项目也是 WorkBuddy 工作目录之一（目录下存在 `.workbuddy/`）
- ⚠️ **本地与线上同步**：云端 Actions 每 15 分钟自动爬取并提交，本地不会自动同步。
  **改本项目前必须先 `git fetch origin main` 检查落后量**，否则会与云端提交冲突或覆盖后台改动
- 最新进展见 `【接力报告】20261001_导航移植与优化.md`（阶段0~5 已提交推送 `6dadbed`；
  剩余：全量 QA 三遍、优化清单其余 P1/P2）

## 要看更多

- `README.md` —— 工作原理图、首次部署步骤、后台功能全表、自定义项、目录结构
- `【优化审查】优化清单.md` —— 已知待改进点
