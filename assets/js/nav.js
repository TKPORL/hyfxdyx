/* 全站统一顶部导航（单点维护）：样式 + 结构 + 交互都在本文件。
   来源：移植自 mrhyfx（参考站）gen.js 的 navHeaderHtml / NAV_CSS 与 assets/js/nav.js，
   形态为用户定稿的「方案 B · 贴住顶部」：导航卡片贴视口最上方、上圆角改直角。
   各页面只需在 <header> 内放 <div id="siteNav"></div> 占位并引入本脚本：
     <header><div id="siteNav"></div></header>
     ...
     <script src="assets/js/nav.js"></script>
   改菜单项 / logo / 断点只改本文件；断点改 动时 CSS 与 BREAKPOINT 两处要同步。 */
(function () {
  var LOGO = 'https://tsinho.us.ci/file/1790008578974_EAFFBCD6D2AB070B24071CFF8B189CCF.webp';
  var SITE_NAME = 'Tsinho黄油站';
  var SEARCH_URL = 'search.html';
  // 断点：≤680px 菜单收进「更多」，≥681px 平铺（与下方 CSS 中的 680/681 必须一致）
  var BREAKPOINT_MQ = '(min-width: 681px)';

  var NAV_CSS = 'header{position:sticky;top:0;z-index:20;padding:0 20px 0}' +
'.hd-bar{max-width:1320px;margin:0 auto;background:#fff;border:1px solid #ecebe9;border-radius:0 0 12px 12px;box-shadow:0 6px 18px rgba(0,0,0,.08);display:flex;align-items:center;gap:12px;padding:7px 12px;min-height:52px}' +
'.hd-bar .logo{display:flex;align-items:center;flex-shrink:0;text-decoration:none}' +
'.hd-bar .logo img{width:118px;height:auto;border-radius:8px;display:block}' +
'.hd-bar .menu{display:flex;align-items:center;justify-content:space-evenly;gap:1px;flex:1;min-width:0;flex-wrap:nowrap;overflow:hidden;max-width:1000px;transition:max-width .34s cubic-bezier(.2,.8,.2,1),transform .34s cubic-bezier(.2,.8,.2,1),visibility 0s linear 0s}' +
'.hd-bar .menu a{font-size:13px;color:#555;text-decoration:none;padding:9px 12px;border:1px solid #ecebe9;background:#fff;border-radius:10px;white-space:nowrap;transition:color .18s ease,background .18s ease,border-color .18s ease}' +
'.hd-bar .menu a:nth-child(1){transition-delay:0s,0s,0s,.12s,.12s}' +
'.hd-bar .menu a:nth-child(2){transition-delay:0s,0s,0s,.08s,.08s}' +
'.hd-bar .menu a:nth-child(3){transition-delay:0s,0s,0s,.04s,.04s}' +
'.hd-bar .menu a:nth-child(4){transition-delay:0s,0s,0s,0s,0s}' +
'.hd-bar .menu a:hover,.hd-bar .menu a.on{color:#e5484d;background:#fdf3f3;border-color:#f0b4b6}' +
'.hd-bar .back-home{display:inline-flex;align-items:center;flex-shrink:0;font-size:13px;font-weight:700;color:#fff;background:#e5484d;border-radius:10px;padding:9px 16px;text-decoration:none;transition:.18s;white-space:nowrap}' +
'.hd-bar .back-home:hover{background:#c93a3f;transform:translateY(-1px)}' +
'.hd-bar .acts{display:flex;align-items:center;gap:6px;flex-shrink:0;margin-left:auto}' +
/* 左上角悬浮「返回首页」（子页专用，不占顶栏）：固定在导航卡下方左侧 */
'.back-float{position:fixed;left:14px;top:78px;z-index:45;display:inline-flex;align-items:center;gap:6px;font-size:13px;font-weight:700;color:#fff;background:#e5484d;border-radius:99px;padding:9px 16px;text-decoration:none;box-shadow:0 4px 14px rgba(229,72,77,.35);transition:.18s}' +
'.back-float:hover{background:#c93a3f;transform:translateY(-2px)}' +
'.back-float svg{width:14px;height:14px;stroke:#fff;fill:none;stroke-width:2.2;stroke-linecap:round}' +
'@media (max-width:720px){.back-float{top:72px;left:10px;padding:8px 13px;font-size:12.5px}}' +
'.hd-bar .icon-btn{width:36px;height:36px;border-radius:50%;border:1px solid #ecebe9;background:#faf9f7;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:.18s;font:inherit;padding:0}' +
'.hd-bar .icon-btn:hover{background:#fdf3f3;border-color:#f0b4b6}' +
'.hd-bar .icon-btn svg{width:18px;height:18px;stroke:#666;fill:none;stroke-width:1.6;stroke-linecap:round}' +
'.hd-bar .icon-btn:hover svg{stroke:#e5484d}' +
'.hd-bar .icon-btn[aria-expanded="true"]{background:#e5484d;border-color:#e5484d}' +
'.hd-bar .icon-btn[aria-expanded="true"] svg{stroke:#fff}' +
'.hd-bar .icon-btn:hover .dot{fill:#e5484d}' +
'.hd-bar .more-btn[aria-expanded="true"] .dot{fill:#fff}' +
'.hd-bar .more-btn{transition:opacity .3s cubic-bezier(.2,.8,.2,1) .24s,transform .3s cubic-bezier(.2,.8,.2,1) .24s,width .3s cubic-bezier(.2,.8,.2,1) .24s,border-width .3s ease .24s,visibility 0s linear 0s}' +
'.hd-bar .dot{transform-box:fill-box;transform-origin:center;transition:transform .3s cubic-bezier(.2,.8,.2,1),opacity .2s ease}' +
'.hd-bar .more-btn[aria-expanded="true"] .dot-1{transform:translateX(5.5px) rotate(45deg) scaleX(2.8)}' +
'.hd-bar .more-btn[aria-expanded="true"] .dot-3{transform:translateX(-5.5px) rotate(-45deg) scaleX(2.8)}' +
'.hd-bar .more-btn[aria-expanded="true"] .dot-2{transform:scale(0);opacity:0}' +
'.nav-drop{display:grid;grid-template-rows:0fr;transition:grid-template-rows .3s cubic-bezier(.2,.8,.2,1)}' +
'.nav-drop.open{grid-template-rows:1fr}' +
'.nav-drop>div{overflow:hidden;min-height:0}' +
'.nav-drop .drop-inner{max-width:900px;margin:8px auto 0;background:#fff;border:1px solid #ecebe9;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,.07);padding:6px;opacity:0;transform:translateY(-6px);transition:opacity .24s ease,transform .3s cubic-bezier(.2,.8,.2,1)}' +
'.nav-drop.open .drop-inner{opacity:1;transform:translateY(0)}' +
'.nav-drop .search-row{display:flex;align-items:center;gap:8px;padding:4px 4px 4px 14px}' +
'.nav-drop .search-row input{flex:1;min-width:0;font:inherit;font-size:13.5px;border:none;outline:none;background:transparent;color:#2b2b2b;padding:9px 0}' +
'.nav-drop .search-row input::placeholder{color:#b4b2a9}' +
'.nav-drop .search-row .go{width:34px;height:34px;border-radius:9px;border:none;background:#e5484d;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;transition:.2s}' +
'.nav-drop .search-row .go:hover{background:#c93a3f}' +
'.nav-drop .search-row .go svg{width:16px;height:16px;stroke:#fff;fill:none;stroke-width:1.8;stroke-linecap:round}' +
'.nav-drop .search-row .x{width:32px;height:32px;border-radius:50%;border:1px solid #ecebe9;background:#faf9f7;cursor:pointer;color:#888;font:inherit;font-size:15px;line-height:1;flex-shrink:0;display:flex;align-items:center;justify-content:center;transition:.2s}' +
'.nav-drop .search-row .x:hover{border-color:#f0b4b6;color:#e5484d}' +
'.nav-drop .drop-menu{display:flex;flex-wrap:wrap;gap:4px;padding:4px}' +
'.nav-drop .drop-menu a{font-size:13.5px;color:#555;text-decoration:none;padding:9px 13px;border-radius:9px;background:#faf9f7;border:1px solid #f0eeec;white-space:nowrap;transition:.18s}' +
'.nav-drop .drop-menu a:hover,.nav-drop .drop-menu a.on{color:#e5484d;border-color:#f0b4b6;background:#fdf3f3}' +
'@media (min-width:681px){.hd-bar .more-btn{opacity:0;transform:scale(.88);width:0;border-width:0;pointer-events:none;visibility:hidden;transition:opacity .28s cubic-bezier(.2,.8,.2,1),transform .28s cubic-bezier(.2,.8,.2,1),width .28s cubic-bezier(.2,.8,.2,1),border-width .28s ease,visibility 0s linear .3s}}' +
'@media (max-width:680px){.hd-bar .menu{max-width:0;transform:translateX(26px);pointer-events:none;visibility:hidden;transition:max-width .34s cubic-bezier(.2,.8,.2,1),transform .34s cubic-bezier(.2,.8,.2,1),visibility 0s linear .38s}.hd-bar .menu a{opacity:0;transform:translateX(22px)}.hd-bar .menu a:nth-child(1){transition-delay:0s,0s,0s,0s}.hd-bar .menu a:nth-child(2){transition-delay:0s,0s,.03s,.03s}.hd-bar .menu a:nth-child(3){transition-delay:0s,0s,.06s,.06s}.hd-bar .menu a:nth-child(4){transition-delay:0s,0s,.09s,.09s}.nav-drop .drop-menu a{flex:1 1 auto;text-align:center}}' +
'@media (max-width:720px){header{padding:0 14px 0}.hd-bar{padding:7px 12px;gap:10px}.hd-bar .logo img{width:100px}.hd-bar .icon-btn{width:34px;height:34px}.nav-drop .drop-menu a{font-size:13px;padding:8px 10px}}' +
'@media (prefers-reduced-motion: reduce){.hd-bar .dot,.nav-drop,.nav-drop .drop-inner,.hd-bar .more-btn,.hd-bar .menu,.hd-bar .menu a{transition:none}}';

  // 菜单项：顺序固定，全部为本站内页（风格统一，不再外链主站）
  // 「首页」不进菜单：本站左上角 logo 即回首页，子页另有明显「返回首页」悬浮按钮
  var ITEMS = [
    { label: '求助贴', url: 'https://tkporl.github.io/mrhyfx/qzt.html', ext: true },
    { label: '解压教程', url: 'tutorial.html' },
    { label: '游戏工具', url: 'tools.html' },
    { label: '下载说明', url: 'download.html' },
    { label: '免责声明', url: 'mianze.html' },
    { label: '赞助', url: 'sponsor.html' }
  ];

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function linksHtml(indent, current) {
    return ITEMS.map(function (n) {
      return indent + '<a href="' + esc(n.url) + '"' + (n.ext ? ' target="_blank" rel="noreferrer"' : '') +
        (current === n.url ? ' class="on" aria-current="page"' : '') + '>' + esc(n.label) + '</a>';
    }).join('\n');
  }

  function navHtml(current) {
    // 「返回首页」不放顶部栏：由脚本单独注入为左上角悬浮按钮（见下方 backHome）
    return '<div class="hd-bar">' +
      '<a class="logo" href="index.html"><img src="' + LOGO + '" alt="' + esc(SITE_NAME) + '"></a>' +
      '<nav class="menu" aria-label="主导航">\n' + linksHtml('  ', current) + '\n' +
      '  </nav>' +
      '<div class="acts">' +
      '<button type="button" class="icon-btn search-btn" aria-label="搜索游戏" aria-expanded="false" aria-controls="mrhxSearchDrop">' +
      '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.8"/><path d="M16.2 16.2L21 21"/></svg></button>' +
      '<button type="button" class="icon-btn more-btn" aria-label="更多导航" aria-expanded="false" aria-controls="mrhxMoreDrop">' +
      '<svg viewBox="0 0 24 24" style="stroke:none">' +
      '<circle class="dot dot-1" cx="6.5" cy="12" r="1.9" fill="#666"></circle>' +
      '<circle class="dot dot-2" cx="12" cy="12" r="1.9" fill="#666"></circle>' +
      '<circle class="dot dot-3" cx="17.5" cy="12" r="1.9" fill="#666"></circle>' +
      '</svg></button>' +
      '</div>' +
      '</div>' +
      '<div class="nav-drop" id="mrhxSearchDrop"><div><div class="drop-inner">' +
      '<form class="search-row" action="' + SEARCH_URL + '" method="get" role="search">' +
      '<input type="text" name="q" placeholder="开启精彩搜索" autocomplete="off" aria-label="搜索游戏名称">' +
      '<button class="go" type="submit" aria-label="开始搜索"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.8"/><path d="M16.2 16.2L21 21"/></svg></button>' +
      '<button class="x" type="button" data-nav-close aria-label="关闭搜索">×</button>' +
      '</form></div></div></div>' +
      '<div class="nav-drop" id="mrhxMoreDrop"><div><div class="drop-inner">' +
      '<nav class="drop-menu" aria-label="站点导航">\n' + linksHtml('  ', current) + '\n' +
      '  </nav></div></div></div>';
  }

  var host = document.getElementById('siteNav');
  if (!host) return;

  // 子页左上角悬浮「返回首页」（首页不显示；不在顶部栏里，固定悬浮在导航卡下方左侧）
  if (!isHome) {
    var b = document.createElement('a');
    b.className = 'back-float';
    b.href = 'index.html';
    b.innerHTML = '<svg viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6"/></svg>返回首页';
    document.body.appendChild(b);
  }

  // 注入样式（晚于页面 <style>，同优先级后者胜，可覆盖页面遗留导航样式）
  var style = document.createElement('style');
  style.textContent = NAV_CSS;
  document.head.appendChild(style);

  // 当前页高亮：tools/tutorial/search/download/mianze/sponsor 各自高亮；首页与 game 页不高亮菜单项
  var path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  var isHome = (path === 'index.html' || path === '');
  var current = /^(tools|tutorial|search|download|mianze|sponsor)\.html$/.test(path) ? path : '';
  host.innerHTML = navHtml(current);

  // 交互：搜索/更多面板开合、Esc 与外点关闭、跨断点收起
  var searchBtn = document.querySelector('.hd-bar .search-btn');
  var moreBtn = document.querySelector('.hd-bar .more-btn');
  var searchDrop = document.getElementById('mrhxSearchDrop');
  var moreDrop = document.getElementById('mrhxMoreDrop');
  if (!searchBtn || !moreBtn || !searchDrop || !moreDrop) return;

  var searchInput = searchDrop.querySelector('input');
  var searchClose = searchDrop.querySelector('[data-nav-close]');

  function setSearch(open) {
    searchDrop.classList.toggle('open', open);
    searchBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) {
      setTimeout(function () { if (searchInput) searchInput.focus(); }, 60);
    }
  }

  function setMore(open) {
    moreDrop.classList.toggle('open', open);
    moreBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  function closeAll() { setSearch(false); setMore(false); }

  searchBtn.addEventListener('click', function () {
    var open = !searchDrop.classList.contains('open');
    closeAll();
    setSearch(open);
  });

  moreBtn.addEventListener('click', function () {
    var open = !moreDrop.classList.contains('open');
    closeAll();
    setMore(open);
  });

  if (searchClose) {
    searchClose.addEventListener('click', function () {
      setSearch(false);
      searchBtn.focus();
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      var wasSearch = searchDrop.classList.contains('open');
      closeAll();
      if (wasSearch) { searchBtn.focus(); } else { moreBtn.focus(); }
    }
  });

  document.addEventListener('click', function (e) {
    var inside = (e.target.closest && (e.target.closest('.hd-bar') || e.target.closest('.nav-drop')));
    if (!inside) { closeAll(); }
  });

  // 跨断点时收起「更多」面板，避免按钮隐藏后菜单悬空
  var mq = window.matchMedia(BREAKPOINT_MQ);
  function onBreakpoint(e) { if (e.matches) { setMore(false); } }
  if (mq.addEventListener) { mq.addEventListener('change', onBreakpoint); }
  else if (mq.addListener) { mq.addListener(onBreakpoint); }
})();
