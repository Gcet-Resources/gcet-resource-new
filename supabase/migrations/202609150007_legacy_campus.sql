-- Preserve the legacy campus records for administrator review, without publishing
-- historical activity or assigning an invented author. Source archives remain in
-- frontend/src/data/notices.json and frontend/src/data/exam-calendar.json.
-- Stable IDs and DO NOTHING make this insert-only even when run independently;
-- subsequent edits, publication decisions and deletions are not overwritten by
-- the guarded deployment bundle. All original local timestamps are IST (+05:30).
insert into public.notices (
 id,title,body,category,scope,status,important,published_at,created_by,created_at,updated_at
) values
 (
  '90fc573d-0354-42d2-8e1c-83bb393fca01',
  'End Sem Exam Schedule for 1st to 4th Year',
  E'The end semester examination for Odd Semester 2025-26 will commence from 23 Dec 2025 to 31 Jan 2026. All students are requested to check the detailed schedule on the university portal.\n\nLegacy source date: Dec 20, 2025, 5:30 PM IST (+05:30).\nLegacy source link: http://fms.aktu.ac.in/Resources/Attachments/Circular/209357b4dcddwd.pdf\nImported as a draft for review from legacy notice 1.',
  'examination','campus','draft',true,
  '2025-12-20T17:30:00+05:30'::timestamptz,null,
  '2025-12-20T17:30:00+05:30'::timestamptz,'2025-12-20T17:30:00+05:30'::timestamptz
 ),
 (
  '90fc573d-0354-42d2-8e1c-83bb393fca02',
  'AKTU Result Portal Open',
  E'Results for previous semester examinations are now available on the AKTU result portal. Check your grades using your roll number.\n\nLegacy source date: Jan 15, 2026, 10:00 AM IST (+05:30).\nLegacy source link: https://aktu.ac.in\nImported as a draft for review from legacy notice 2.',
  'announcement','campus','draft',false,
  '2026-01-15T10:00:00+05:30'::timestamptz,null,
  '2026-01-15T10:00:00+05:30'::timestamptz,'2026-01-15T10:00:00+05:30'::timestamptz
 ),
 (
  '90fc573d-0354-42d2-8e1c-83bb393fca03',
  'New PYQs Added — 3rd Year CS Subjects',
  E'We''ve added 2024-25 AKTU PYQs for BCS501, BCS502, and BCS503. Browse 3rd year resources to access them.\n\nLegacy source date: Jun 1, 2026, 2:00 PM IST (+05:30).\nLegacy source link: /year-selection\nImported as a draft for review from legacy notice 3.',
  'resources','campus','draft',false,
  '2026-06-01T14:00:00+05:30'::timestamptz,null,
  '2026-06-01T14:00:00+05:30'::timestamptz,'2026-06-01T14:00:00+05:30'::timestamptz
 )
on conflict (id) do nothing;

insert into public.exam_events (
 id,title,description,starts_at,ends_at,status,created_by
) values
 (
  '7e2c2288-9eb9-4505-880a-a2826dbaea01',
  'End Semester Examination (Odd 2025-26)',
  E'AKTU end semester exams for Odd Semester 2025-26\n\nLegacy schedule: Dec 23, 2025, 9:00 AM to Jan 31, 2026, 5:00 PM IST (+05:30).\nLegacy source link: http://fms.aktu.ac.in/Resources/Attachments/Circular/209357b4dcddwd.pdf\nImported as a draft for review from legacy exam end-sem-odd-2025-26.',
  '2025-12-23T09:00:00+05:30'::timestamptz,'2026-01-31T17:00:00+05:30'::timestamptz,
  'draft',null
 ),
 (
  '7e2c2288-9eb9-4505-880a-a2826dbaea02',
  'CAE / Mid Sem (Odd 2025-26)',
  E'Continuous assessment examinations\n\nLegacy schedule: Oct 15, 2025, 9:00 AM to Oct 25, 2025, 5:00 PM IST (+05:30).\nNo source link was supplied in the legacy record.\nImported as a draft for review from legacy exam cae-odd-2025-26.',
  '2025-10-15T09:00:00+05:30'::timestamptz,'2025-10-25T17:00:00+05:30'::timestamptz,
  'draft',null
 )
on conflict (id) do nothing;
