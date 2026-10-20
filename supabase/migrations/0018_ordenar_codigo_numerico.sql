begin;

-- Ordenar pelo código da empresa como número (1, 2, …, 1000), não como texto (1, 10, 100, 2…).
-- Coluna nova no fim das views; códigos não numéricos ficam sem valor (vão para o fim).
create or replace view public.certificates_view with (security_invoker = true) as
SELECT c.id,
    c.company_id,
    c.type,
    c.model,
    c.valid_from,
    c.valid_to,
    c.warning_days,
    c.archived,
    c.is_current,
    c.origin,
    c.notes,
    c.created_at,
    c.updated_at,
    c.created_by,
    certificate_status(c.valid_to, c.archived, c.warning_days) AS status,
    certificate_status_priority(certificate_status(c.valid_to, c.archived, c.warning_days)) AS status_priority,
    (c.valid_to - CURRENT_DATE) AS days_remaining,
    co.code AS company_code,
    co.document AS company_document,
    co.document_type AS company_document_type,
    co.corporate_name AS company_corporate_name,
    co.trade_name AS company_trade_name,
    co.short_name AS company_short_name,
    co.municipality AS company_municipality,
    co.uf AS company_uf,
    co.responsible AS company_responsible,
    co.active AS company_active,
    CASE WHEN co.code ~ '^[0-9]+$' THEN co.code::bigint END AS company_code_sort
   FROM (certificates c
     JOIN companies co ON ((co.id = c.company_id)));

create or replace view public.alvaras_view with (security_invoker = true) as
SELECT a.id,
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
    alvara_status(a.issued, a.is_permanent, a.manual_status, a.valid_to, a.archived) AS status,
    alvara_status_priority(alvara_status(a.issued, a.is_permanent, a.manual_status, a.valid_to, a.archived)) AS status_priority,
        CASE
            WHEN (a.valid_to IS NOT NULL) THEN (a.valid_to - CURRENT_DATE)
            ELSE NULL::integer
        END AS days_remaining,
    t.name AS type_name,
    t.color AS type_color,
    t.shared_attachment_by_municipality AS type_shared_attachment,
    co.code AS company_code,
    co.document AS company_document,
    co.document_type AS company_document_type,
    co.corporate_name AS company_corporate_name,
    co.trade_name AS company_trade_name,
    co.short_name AS company_short_name,
    co.active AS company_active,
    a.issued_at,
    ((a.attachment_path IS NOT NULL) OR (t.shared_attachment_by_municipality AND (a.municipality IS NOT NULL) AND (EXISTS ( SELECT 1
           FROM alvaras a2
          WHERE ((a2.type_id = a.type_id) AND (a2.municipality ~~* a.municipality) AND (a2.attachment_path IS NOT NULL)))))) AS has_attachment,
    CASE WHEN co.code ~ '^[0-9]+$' THEN co.code::bigint END AS company_code_sort
   FROM ((alvaras a
     JOIN alvara_types t ON ((t.id = a.type_id)))
     JOIN companies co ON ((co.id = a.company_id)));

commit;
