-- Supabase SQL Editor에서 이 파일 전체를 실행하세요.

create table if not exists public.wrong_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  image_path text not null,
  subject text,
  question_text text not null,
  user_answer text,
  correct_answer text not null,
  is_correct boolean not null default false,
  explanation text,
  created_at timestamptz not null default now()
);

alter table public.wrong_notes enable row level security;

create policy "Users can view their own notes"
  on public.wrong_notes for select
  using (auth.uid() = user_id);

create policy "Users can insert their own notes"
  on public.wrong_notes for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own notes"
  on public.wrong_notes for delete
  using (auth.uid() = user_id);

-- Storage bucket for problem photos
insert into storage.buckets (id, name, public)
values ('problem-images', 'problem-images', false)
on conflict (id) do nothing;

create policy "Users can upload their own images"
  on storage.objects for insert
  with check (
    bucket_id = 'problem-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can view their own images"
  on storage.objects for select
  using (
    bucket_id = 'problem-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete their own images"
  on storage.objects for delete
  using (
    bucket_id = 'problem-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
