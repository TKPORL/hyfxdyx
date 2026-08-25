# -*- coding: utf-8 -*-
"""每日爬取 Tsinho黄油站 所有帖子里的游戏卡片，生成 data/games.json（图片直接引用原站地址）"""
import datetime
import html as htmllib
import json
import os
import re
import sys
import time
import urllib.request

BASE = 'https://tkporl.github.io/mrhyfx/'
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data')
OUT_FILE = os.path.join(DATA_DIR, 'games.json')
OVERRIDE_FILE = os.path.join(DATA_DIR, 'games.override.json')
UA = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'}


def fetch(url, binary=True, tries=3):
    last = None
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers=UA)
            with urllib.request.urlopen(req, timeout=40) as r:
                data = r.read()
            return data if binary else data.decode('utf-8', 'replace')
        except Exception as e:
            last = e
            time.sleep(2 * (i + 1))
    raise RuntimeError('抓取失败: %s -> %s' % (url, last))


TAG_RE = re.compile(r'<[^>]+>')
WS_RE = re.compile(r'\s+')


def clean(s):
    s = TAG_RE.sub('', s or '')
    s = htmllib.unescape(s)
    return WS_RE.sub(' ', s).strip()


def parse_posts(index_html):
    """逐块解析首页帖子列表，提取发帖日期用于新→旧排序（无日期的置顶贴排最后）"""
    now = datetime.date.today()
    chunks = re.split(r'<a class="post"', index_html)[1:]
    posts, seen = [], set()
    for chunk in chunks:
        chunk = chunk.split('</a>')[0]
        hm = re.search(r'href="([^"]+\.html)"', chunk)
        if not hm:
            continue
        slug = hm.group(1).strip()
        if not slug or slug in seen or slug.startswith(('http', 'search.', 'index.')):
            continue
        seen.add(slug)
        tm = re.search(r'class="ptitle">(.*?)</div>', chunk, re.S)
        title = clean(re.sub(r'<span class="pinb">.*?</span>', '', tm.group(1))) if tm else slug
        dm = re.search(r'<div class="date">.*?<b[^>]*>([^<]*)</b>(?:\s*<span>([^<]*)</span>)?', chunk, re.S)
        day = month = None
        if dm:
            dnum = re.sub(r'\D', '', dm.group(1))
            mnum = re.sub(r'\D', '', dm.group(2) or '')
            try:
                day = int(dnum)
                month = int(mnum) if mnum else None
            except ValueError:
                day = month = None
        # 月份大于当前月视为去年发的（如1月看到12月的帖子）
        year = now.year
        if month and month > now.month:
            year -= 1
        date_key = (year, month, day) if day and month else None
        posts.append({'slug': slug, 'title': title, 'date': date_key})
    # 新→旧排序；无日期的排最后，同日帖子保持首页相对顺序
    dated = [p for p in posts if p['date']]
    undated = [p for p in posts if not p['date']]
    dated.sort(key=lambda p: p['date'], reverse=True)
    return dated + undated


def parse_cards(post_html):
    """解析详情页里所有 node.heading3 游戏卡片"""
    cards = []
    blocks = re.split(r'<li class="node heading3">', post_html)[1:]
    for blk in blocks:
        m = re.search(r'<div class="content[^"]*"\s*>\s*<span>(.*?)</span>', blk, re.S)
        if not m:
            continue
        name_inner = m.group(1)
        plat = ''
        pm = re.match(r'(.*?)<em class="mrhx-plat">([^<]*)</em>', name_inner, re.S)
        if pm:
            name_inner, plat = pm.group(1), pm.group(2).strip()
        name = clean(name_inner)
        if not name:
            continue

        imgs = []
        im_seg = re.search(r'<ul class="image-list">(.*?)</ul>', blk, re.S)
        if im_seg:
            imgs = [u.strip() for u in re.findall(r'<img[^>]*src="([^"]+)"', im_seg.group(1))]

        links = []
        dl = re.search(r'<div class="mrhx-dl">(.*?)</div>', blk, re.S)
        if dl:
            for hm in re.finditer(r'<a[^>]*href="([^"]+)"[^>]*>(.*?)</a>', dl.group(1), re.S):
                url = hm.group(1).strip()
                if url.startswith('http'):
                    links.append({'label': clean(hm.group(2)) or '下载链接', 'url': url})

        desc_m = re.search(r'<div class="note[^"]*"[^>]*>(.*?)</div>', blk, re.S)
        desc = clean(desc_m.group(1)) if desc_m else ''

        if not imgs and not links:
            continue
        cards.append({'name': name, 'platform': plat, 'desc': desc,
                      'images': imgs, 'links': links})
    return cards


def load_override():
    """读取后台管理页导出的 data/games.override.json（不存在或格式错误时返回 None）"""
    if not os.path.exists(OVERRIDE_FILE):
        return None
    try:
        with open(OVERRIDE_FILE, encoding='utf-8') as f:
            d = json.load(f)
    except Exception:
        print('警告: %s 解析失败，忽略后台覆盖数据' % OVERRIDE_FILE)
        return None
    return d if isinstance(d, dict) else None


def merge_override(games, override):
    """合并后台改动：同 id 覆盖、新 id 追加到最前、remove_ids 移除"""
    ovgames = [g for g in (override.get('games') or []) if isinstance(g, dict) and g.get('id')]
    remove_ids = set(i for i in (override.get('remove_ids') or []) if isinstance(i, str))
    if not ovgames and not remove_ids:
        return games
    by_id = {g['id']: g for g in ovgames}
    kept = []
    for g in games:
        gid = g.get('id')
        if gid in remove_ids and gid not in by_id:
            continue
        kept.append(by_id[gid] if gid in by_id else g)
    existing = set(g.get('id') for g in kept)
    additions = [g for g in ovgames if g['id'] not in existing]
    merged = additions + kept
    print('后台覆盖: 覆盖/新增 %d 条, 标记移除 %d 条' % (len(ovgames), len(remove_ids & set(g.get('id') for g in games))))
    return merged


def main():
    t0 = time.time()
    print('抓取首页: %s' % BASE)
    index_html = fetch(BASE + 'index.html', binary=False)
    posts = parse_posts(index_html)
    print('发现 %d 个帖子' % len(posts))
    if not posts:
        print('未解析到任何帖子，中止（不改动现有数据）')
        sys.exit(1)

    games = []

    for p in posts:
        url = BASE + p['slug']
        print('帖子: %s (%s)' % (p['title'], p['slug']))
        try:
            post_html = fetch(url, binary=False)
        except Exception as e:
            print('  [跳过] 抓取失败: %s' % e)
            continue
        slug_core = p['slug'][:-5] if p['slug'].lower().endswith('.html') else p['slug']
        cards = parse_cards(post_html)
        print('  卡片 x%d' % len(cards))
        for idx, c in enumerate(cards):
            games.append({
                'id': '%s-%d' % (slug_core, idx),
                'name': c['name'],
                'platform': c['platform'],
                'desc': c['desc'],
                'cover': c['images'][0] if c['images'] else '',
                'images': c['images'],
                'links': c['links'],
                'post': p['title'],
                'post_url': url,
            })

    # 应用后台管理页的覆盖数据（新增/修改/删除在自动同步时保留）
    override = load_override()
    if override:
        games = merge_override(games, override)

    # 后台编辑的首页公告随覆盖文件一并生效
    announce = None
    ov_announce = (override or {}).get('announce')
    if isinstance(ov_announce, dict) and ov_announce.get('lines'):
        announce = {
            'title': str(ov_announce.get('title') or '【公告】'),
            'lines': [str(x) for x in ov_announce['lines']],
        }

    os.makedirs(DATA_DIR, exist_ok=True)
    payload = {
        'site': 'Tsinho黄油站',
        'source': BASE,
        'updated_at': datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        'total': len(games),
        'games': games,
    }
    if announce:
        payload['announce'] = announce
    old_data = None
    if os.path.exists(OUT_FILE):
        try:
            with open(OUT_FILE, encoding='utf-8') as f:
                old_data = json.load(f)
        except Exception:
            old_data = None
    old_games = old_data.get('games') if isinstance(old_data, dict) else None
    old_announce = old_data.get('announce') if isinstance(old_data, dict) else None
    if old_games == payload['games'] and old_announce == payload.get('announce'):
        print('数据无变化（源站没有新增/修改/删除），跳过写入')
        return
    with open(OUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(payload, f, ensure_ascii=False, indent=1)
    diff = len(games) - (len(old_games) if isinstance(old_games, list) else 0)
    print('检测到变化（卡片数 %+d），已更新 data/games.json' % diff)
    print('完成: %d 帖子 / %d 张卡片, 用时 %.1fs' % (len(posts), len(games), time.time() - t0))


if __name__ == '__main__':
    main()
