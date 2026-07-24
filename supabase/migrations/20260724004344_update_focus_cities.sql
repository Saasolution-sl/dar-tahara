-- Owner correction: current focus cities are Tetouan, Tangier, Meknes and Casablanca.

update public.knowledge_builder_questions
set
  question = 'What exact service boundaries and launch status apply in Tetouan, Tangier, Meknes, and Casablanca?',
  current_knowledge = 'Dar Tahara currently focuses on Tetouan, Tangier, Meknes, and Casablanca, with coverage expanding over time.',
  missing_information = 'Exact neighborhood boundaries, current launch availability, any travel surcharges, and areas not served within or around each focus city.',
  internal_notes = concat_ws(E'\n', nullif(internal_notes, ''), 'Focus-city list corrected by the owner on 24 July 2026.'),
  updated_at = now()
where question_key = 'supported-cities-boundaries';

update public.knowledge_entries
set
  content = replace(content, 'Tangier, Casablanca, Rabat and Marrakech', 'Tetouan, Tangier, Meknes, and Casablanca'),
  updated_at = now(),
  reviewed_at = now()
where content like '%Tangier, Casablanca, Rabat and Marrakech%';

update public.knowledge_entries
set
  content = replace(content, 'Tanger, Casablanca, Rabat en Marrakesh', 'Tetouan, Tanger, Meknes en Casablanca'),
  updated_at = now(),
  reviewed_at = now()
where content like '%Tanger, Casablanca, Rabat en Marrakesh%';

update public.knowledge_entries
set
  content = replace(content, 'Tanger, Casablanca, Rabat et Marrakech', 'Tétouan, Tanger, Meknès et Casablanca'),
  updated_at = now(),
  reviewed_at = now()
where content like '%Tanger, Casablanca, Rabat et Marrakech%';

update public.knowledge_entries
set
  content = replace(content, 'Tánger, Casablanca, Rabat y Marrakech', 'Tetuán, Tánger, Mequinez y Casablanca'),
  updated_at = now(),
  reviewed_at = now()
where content like '%Tánger, Casablanca, Rabat y Marrakech%';

update public.knowledge_entries
set
  content = replace(content, 'Tanger, Casablanca, Rabat und Marrakesch', 'Tétouan, Tanger, Meknès und Casablanca'),
  updated_at = now(),
  reviewed_at = now()
where content like '%Tanger, Casablanca, Rabat und Marrakesch%';

update public.knowledge_entries
set
  content = replace(content, 'Tânger, Casablanca, Rabat e Marraquexe', 'Tetuão, Tânger, Meknès e Casablanca'),
  updated_at = now(),
  reviewed_at = now()
where content like '%Tânger, Casablanca, Rabat e Marraquexe%';

update public.knowledge_entries
set
  content = replace(content, 'طنجة والدار البيضاء والرباط ومراكش', 'تطوان وطنجة ومكناس والدار البيضاء'),
  updated_at = now(),
  reviewed_at = now()
where content like '%طنجة والدار البيضاء والرباط ومراكش%';

update public.knowledge_entries
set status = 'archived', updated_at = now()
where slug = 'focus-cities' and status = 'published';

insert into public.knowledge_entries (
  slug, category, title, language, content, status, version, effective_from,
  keywords, synonyms, source, reviewed_at
) values
  ('focus-cities', 'company', 'Current focus cities', 'en', 'Dar Tahara currently focuses on Tetouan, Tangier, Meknes, and Casablanca, with coverage expanding over time. Customers should share their city so Dar Tahara can confirm current availability.', 'published', 1, now(), array['cities', 'coverage', 'tetouan', 'tangier', 'meknes', 'casablanca'], array['service area', 'locations'], 'owner_approved_policy_2026_07_24', now()),
  ('focus-cities', 'company', 'Huidige focussteden', 'nl', 'Dar Tahara richt zich momenteel op Tetouan, Tanger, Meknes en Casablanca en breidt de dekking verder uit. Deel uw stad zodat Dar Tahara de actuele beschikbaarheid kan bevestigen.', 'published', 1, now(), array['steden', 'dekking', 'tetouan', 'tanger', 'meknes', 'casablanca'], array['werkgebied', 'locaties'], 'owner_approved_policy_2026_07_24', now()),
  ('focus-cities', 'company', 'Villes actuellement prioritaires', 'fr', 'Dar Tahara intervient actuellement principalement à Tétouan, Tanger, Meknès et Casablanca, avec une couverture en expansion. Indiquez votre ville afin que Dar Tahara confirme la disponibilité actuelle.', 'published', 1, now(), array['villes', 'couverture', 'tétouan', 'tanger', 'meknès', 'casablanca'], array['zone de service', 'localités'], 'owner_approved_policy_2026_07_24', now()),
  ('focus-cities', 'company', 'المدن التي نركز عليها حالياً', 'ar', 'تركز دار طهارة حالياً على تطوان وطنجة ومكناس والدار البيضاء، مع توسع التغطية بمرور الوقت. شارك مدينتك لكي تؤكد دار طهارة توفر الخدمة حالياً.', 'published', 1, now(), array['مدن', 'تغطية', 'تطوان', 'طنجة', 'مكناس', 'الدار البيضاء'], array['منطقة الخدمة', 'مواقع'], 'owner_approved_policy_2026_07_24', now()),
  ('focus-cities', 'company', 'Ciudades prioritarias actuales', 'es', 'Dar Tahara se centra actualmente en Tetuán, Tánger, Mequinez y Casablanca, con una cobertura en expansión. Indique su ciudad para que Dar Tahara confirme la disponibilidad actual.', 'published', 1, now(), array['ciudades', 'cobertura', 'tetuán', 'tánger', 'mequinez', 'casablanca'], array['zona de servicio', 'ubicaciones'], 'owner_approved_policy_2026_07_24', now()),
  ('focus-cities', 'company', 'Aktuelle Schwerpunktstädte', 'de', 'Dar Tahara konzentriert sich derzeit auf Tétouan, Tanger, Meknès und Casablanca und erweitert die Abdeckung. Teilen Sie Ihre Stadt mit, damit Dar Tahara die aktuelle Verfügbarkeit bestätigt.', 'published', 1, now(), array['städte', 'abdeckung', 'tétouan', 'tanger', 'meknès', 'casablanca'], array['servicegebiet', 'standorte'], 'owner_approved_policy_2026_07_24', now()),
  ('focus-cities', 'company', 'Cidades atualmente prioritárias', 'pt', 'A Dar Tahara concentra-se atualmente em Tetuão, Tânger, Meknès e Casablanca, com cobertura em expansão. Indique a sua cidade para a Dar Tahara confirmar a disponibilidade atual.', 'published', 1, now(), array['cidades', 'cobertura', 'tetuão', 'tânger', 'meknès', 'casablanca'], array['área de serviço', 'localizações'], 'owner_approved_policy_2026_07_24', now())
on conflict (slug, language, version) do update set
  category = excluded.category,
  title = excluded.title,
  content = excluded.content,
  status = excluded.status,
  effective_from = excluded.effective_from,
  keywords = excluded.keywords,
  synonyms = excluded.synonyms,
  source = excluded.source,
  reviewed_at = excluded.reviewed_at,
  updated_at = now();

notify pgrst, 'reload schema';
