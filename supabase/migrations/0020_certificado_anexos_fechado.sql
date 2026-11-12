-- ============================================================================
-- 0020_certificado_anexos_fechado.sql
-- O bucket certificado-anexos guarda .pfx de clientes. As políticas da 0019 deixavam qualquer usuário logado
-- listar, baixar, trocar e apagar os arquivos direto pelo storage, sem o link de 60s e sem histórico.
-- Agora nenhum usuário toca o bucket: o servidor do Certificados (e o emissor, ao cadastrar A1) usam a chave de
-- serviço depois de conferir quem pediu. Limita também tamanho e tipo do arquivo.
-- ============================================================================

drop policy if exists certificado_anexos_select on storage.objects;
drop policy if exists certificado_anexos_insert on storage.objects;
drop policy if exists certificado_anexos_update on storage.objects;
drop policy if exists certificado_anexos_delete on storage.objects;

update storage.buckets
set public = false,
    file_size_limit = 5242880,
    allowed_mime_types = array['application/x-pkcs12', 'application/octet-stream']
where id = 'certificado-anexos';
