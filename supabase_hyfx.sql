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
