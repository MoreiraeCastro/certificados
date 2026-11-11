-- ============================================================================
-- 0019_certificate_attachments.sql
-- Arquivo do certificado (A1 .pfx/.p12) anexado ao certificado, na ficha do
-- cliente. Bucket privado; download só por URL assinada de curta duração
-- gerada no servidor (src/app/api/certificates/[id]/attachment/route.ts).
-- A senha do certificado NUNCA é guardada aqui.
-- ============================================================================

alter table certificates add column if not exists attachment_path text;
alter table certificates add column if not exists attachment_name text;
alter table certificates add column if not exists attachment_size int;
alter table certificates add column if not exists attachment_uploaded_at timestamptz;

insert into storage.buckets (id, name, public)
values ('certificado-anexos', 'certificado-anexos', false)
on conflict (id) do nothing;

create policy certificado_anexos_select on storage.objects
  for select using (bucket_id = 'certificado-anexos' and auth.role() = 'authenticated');
create policy certificado_anexos_insert on storage.objects
  for insert with check (bucket_id = 'certificado-anexos' and auth.role() = 'authenticated');
create policy certificado_anexos_update on storage.objects
  for update using (bucket_id = 'certificado-anexos' and auth.role() = 'authenticated');
create policy certificado_anexos_delete on storage.objects
  for delete using (bucket_id = 'certificado-anexos' and auth.role() = 'authenticated');
