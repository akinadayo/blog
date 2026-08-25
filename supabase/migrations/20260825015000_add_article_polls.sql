create table if not exists public.neulog_poll_votes (
  article_slug text not null check (char_length(article_slug) between 1 and 240),
  poll_id text not null check (poll_id ~ '^[a-zA-Z0-9_-]{1,64}$'),
  option_index smallint not null check (option_index between 0 and 5),
  visitor_hash text not null check (char_length(visitor_hash) = 64),
  created_at timestamptz not null default now(),
  primary key (article_slug, poll_id, visitor_hash)
);

alter table public.neulog_poll_votes enable row level security;
revoke all on table public.neulog_poll_votes from anon, authenticated;
grant select, insert on table public.neulog_poll_votes to service_role;

alter table public.neulog_rate_limits
  drop constraint if exists neulog_rate_limits_action_check;

alter table public.neulog_rate_limits
  add constraint neulog_rate_limits_action_check
  check (action = any (array[
    'reaction'::text,
    'start_game'::text,
    'submit_score'::text,
    'visit'::text,
    'poll_vote'::text
  ]));
