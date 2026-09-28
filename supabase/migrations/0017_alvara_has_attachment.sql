-- ============================================================================
-- 0017_alvara_has_attachment.sql
-- Coluna computada "has_attachment" na alvaras_view: true quando o alvará tem
-- um anexo próprio OU (para tipos com shared_attachment_by_municipality) quando
-- algum outro alvará do mesmo tipo + município já tem anexo -- mesma regra de
-- resolveEffectiveAttachment() (src/lib/alvaras/queries.ts), só que calculada
-- em SQL para permitir filtrar a listagem por "sem anexo".
-- ============================================================================

create or replace view alvaras_view
with (security_invoker = true)
as
select
  a.id,
  a.company_id,
  a.type_id,
  a.manual_status,
  a.issued,
  a.is_permanent,
  a.valid_to,
  a.prioritario,
  a.archived,
  a.metragem_m2,
  a.municipality,
  a.uf,
  a.notes,
  a.origin,
  a.created_at,
  a.updated_at,
  a.created_by,
  a.updated_by,
  a.attachment_path,
  a.attachment_name,
  a.attachment_size,
  a.attachment_uploaded_at,
  alvara_status(a.issued, a.is_permanent, a.manual_status, a.valid_to, a.archived) as status,
  alvara_status_priority(alvara_status(a.issued, a.is_permanent, a.manual_status, a.valid_to, a.archived)) as status_priority,
  case when a.valid_to is not null then (a.valid_to - current_date) else null end as days_remaining,
  t.name as type_name,
  t.color as type_color,
  t.shared_attachment_by_municipality as type_shared_attachment,
  co.code as company_code,
  co.document as company_document,
  co.document_type as company_document_type,
  co.corporate_name as company_corporate_name,
  co.trade_name as company_trade_name,
  co.short_name as company_short_name,
  co.active as company_active,
  a.issued_at,
  (
    a.attachment_path is not null
    or (
      t.shared_attachment_by_municipality
      and a.municipality is not null
      and exists (
        select 1
        from alvaras a2
        where a2.type_id = a.type_id
          and a2.municipality ilike a.municipality
          and a2.attachment_path is not null
      )
    )
  ) as has_attachment
from alvaras a
join alvara_types t on t.id = a.type_id
join companies co on co.id = a.company_id;
