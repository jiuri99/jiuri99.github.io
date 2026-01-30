# 公共片段说明

本站通过「公共片段 + JS 动态加载」减少各页面重复代码。

## 结构

- **partials/header.html**：顶部导航栏（含桌面/移动端菜单、GitHub 角标）
- **partials/footer.html**：页脚（版权、播放器、搜索框、回到顶部等）
- **js/load-common.js**：页面加载时请求上述两个 HTML 并注入到 `#site-header`、`#site-footer`
- **css/common.css**：原各页内联的 github-emoji、github-corner 样式，统一放到此文件
- **js/search.js**：搜索逻辑统一在此，原各页内联的搜索脚本已移除，由 load-common 在注入 footer 后动态加载

## 修改公共内容

- 改导航/页脚：只改 `partials/header.html` 或 `partials/footer.html`，全站生效。
- 改公共样式：改 `css/common.css`。

## 重新应用优化（若将来又生成了未优化的 HTML）

若从 Hexo 等重新生成了整站 HTML，可再次运行：

```bash
node scripts/apply-common.js
```

会为所有 `index.html` 添加 common.css、用占位符替换 header/footer 并引入 load-common.js。
