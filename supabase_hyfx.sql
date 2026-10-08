-- hyfxdyx 单游戏站接真数据：点赞表 + 浏览量匿名读
-- 在 Supabase SQL Editor 一次性运行（与主站同一项目），可重复执行

-- 1) 点赞表：每款游戏一行，count 累加
create table if not exists game_likes (
  game_id text primary key,
  count bigint not null default 0
);
alter table game_likes enable row level security;
drop policy if exists "game_likes_select" on game_likes;
create policy "game_likes_select" on game_likes for select using (true);

-- 点赞走 RPC：匿名只能 +1，不能改任意值
create or replace function inc_game_like(p_id text)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  new_count bigint;
begin
  insert into game_likes(game_id, count) values (p_id, 1)
  on conflict (game_id) do update set count = game_likes.count + 1
  returning count into new_count;
  return new_count;
end;
$$;
revoke execute on function inc_game_like(text) from public;
grant execute on function inc_game_like(text) to anon, authenticated;

-- 2) 浏览量表允许匿名读（主站已有 inc_page_view 匿名写；hyfxdyx 复用同表同 RPC）
drop policy if exists "page_views_select_anon" on page_views;
create policy "page_views_select_anon" on page_views for select using (true);
drop policy if exists "daily_page_views_select_anon" on daily_page_views;
create policy "daily_page_views_select_anon" on daily_page_views for select using (true);

-- 3) 后台评论管理（2026-10-09）：受控 RPC，匿名访客无法直接改评论表
--    用法：本文件在 SQL Editor 全量运行一遍 → 执行 select token from admin_tokens;
--    把结果里的 Token 粘贴到后台「设置 → 评论管理 Token」即可回复 / 删除 / 置顶。
create table if not exists admin_tokens (
  token text primary key,
  created_at timestamptz not null default now()
);
alter table admin_tokens enable row level security;
-- 不建任何 select/update/delete policy：该表只能由 service_role 和本文件操作
insert into admin_tokens(token)
select encode(gen_random_bytes(18), 'hex')
where not exists (select 1 from admin_tokens);

-- 站长回复：以「Tsinho · 站长」身份挂到指定父评论下
create or replace function admin_reply_comment(
  p_token text, p_url text, p_pid comments.pid%type, p_nick text, p_content text
)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  if not exists (select 1 from admin_tokens where token = p_token) then
    raise exception 'TOKEN_INVALID';
  end if;
  if coalesce(trim(p_content), '') = '' then
    raise exception '回复内容不能为空';
  end if;
  insert into comments(url, pid, nick, is_admin, content, pinned)
  values (p_url, p_pid, coalesce(nullif(trim(p_nick), ''), 'Tsinho'), true, trim(p_content), false);
end;
$$;
revoke all on function admin_reply_comment(text, text, comments.pid%type, text, text) from public;
grant execute on function admin_reply_comment(text, text, comments.pid%type, text, text) to anon, authenticated;

-- 删除评论：父评论连带删除其下所有回复
create or replace function admin_delete_comment(p_token text, p_id comments.id%type)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  if not exists (select 1 from admin_tokens where token = p_token) then
    raise exception 'TOKEN_INVALID';
  end if;
  delete from comments where id = p_id or pid = p_id;
end;
$$;
revoke all on function admin_delete_comment(text, comments.id%type) from public;
grant execute on function admin_delete_comment(text, comments.id%type) to anon, authenticated;

-- 置顶 / 取消置顶
create or replace function admin_pin_comment(p_token text, p_id comments.id%type, p_pin boolean)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  if not exists (select 1 from admin_tokens where token = p_token) then
    raise exception 'TOKEN_INVALID';
  end if;
  update comments set pinned = p_pin where id = p_id;
end;
$$;
revoke all on function admin_pin_comment(text, comments.id%type, boolean) from public;
grant execute on function admin_pin_comment(text, comments.id%type, boolean) to anon, authenticated;
