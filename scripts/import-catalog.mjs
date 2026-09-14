#!/usr/bin/env node
/** Deterministic, insert-only legacy import. Generates SQL; never connects to a database. */
import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export function stableId(key) {
  const bytes = createHash('sha256').update(`gcet-catalog-v1:${key}`).digest().subarray(0, 16);
  bytes[6] = (bytes[6] & 0x0f) | 0x50; bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const h = bytes.toString('hex');
  return `${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20)}`;
}
const quote = value => value == null ? 'NULL' : typeof value === 'number' ? String(value) : `'${String(value).replaceAll("'", "''")}'`;
const insert = (table, row) => `INSERT INTO public.${table} (${Object.keys(row).join(',')}) VALUES (${Object.values(row).map(quote).join(',')}) ON CONFLICT DO NOTHING;`;
export async function buildImport(dataDirectory = resolve(root, 'frontend/src/data')) {
  const subjectsByYear = JSON.parse(await readFile(resolve(dataDirectory, 'subjects.json'), 'utf8'));
  const rows = [], subjectIds = new Map(), resourceIds = new Set();
  const report = { sourceSubjects: 0, sourceGroups: 0, sourceChapters: 0, sourceNonemptyUrls: 0, subjects: 0, resources: 0, published: 0, drafts: 0, quarantinedGroups: 0, quarantinedChapters: 0, duplicateChapterIds: 0, coursesAssigned: 0, quarantine: [] };
  for (const [year, subjects] of Object.entries(subjectsByYear)) {
    for (const subject of subjects) {
      report.sourceSubjects++;
      const key = `${year}/${subject.id}`;
      if (subjectIds.has(key)) throw new Error(`Duplicate subject ${key}; resolve before import`);
      const id = stableId(`subject:${key}`); subjectIds.set(key, id);
      rows.push(insert('subjects', { id, legacy_code: subject.id, year, title: subject.title, description: subject.description ?? '', color: subject.color ?? '', bg_color: subject.bgColor ?? '', course_id: null })); report.subjects++;
    }
  }
  for (const year of ['1st','2nd','3rd','4th']) {
    const groups = JSON.parse(await readFile(resolve(dataDirectory, `pdfMappings/${year}.json`), 'utf8'));
    const groupOccurrences = new Map();
    for (const group of groups) {
      report.sourceGroups++;
      const chapters = Array.isArray(group.chapters) ? group.chapters : [];
      report.sourceChapters += chapters.length;
      report.sourceNonemptyUrls += chapters.filter(c => typeof c.fileUrl === 'string' && c.fileUrl.trim()).length;
      const groupBase = `${year}/${group.subjectId}/${group.resourceType}`;
      const occurrence = groupOccurrences.get(groupBase) ?? 0; groupOccurrences.set(groupBase, occurrence + 1);
      const sourceKey = `${groupBase}/${occurrence}`;
      const subjectId = subjectIds.get(`${year}/${group.subjectId}`);
      const quarantine = (reason, payload, count, suffix = '') => {
        const source_key = `${sourceKey}${suffix}`;
        rows.push(insert('import_quarantine', { id: stableId(`quarantine:${source_key}`), source_key, reason, payload: JSON.stringify(payload) }));
        report.quarantinedChapters += count;
        report.quarantine.push({ sourceKey: source_key, reason, chapterCount: count });
      };
      if (!subjectId || group.year !== year) {
        quarantine(!subjectId ? 'unknown_subject' : 'year_mismatch', group, chapters.length); report.quarantinedGroups++; continue;
      }
      if (!chapters.length) { quarantine('empty_group', group, 0); report.quarantinedGroups++; continue; }
      const chapterOccurrences = new Map();
      for (const [index, chapter] of chapters.entries()) {
        const legacyId = typeof chapter.id === 'string' ? chapter.id : String(chapter.id ?? 'missing');
        const duplicate = chapterOccurrences.get(legacyId) ?? 0; chapterOccurrences.set(legacyId, duplicate + 1);
        if (duplicate) report.duplicateChapterIds++;
        const chapterKey = `${sourceKey}/${legacyId}/${duplicate}`;
        const sourceUrl = typeof chapter.fileUrl === 'string' ? chapter.fileUrl : '';
        let url = null;
        if (sourceUrl.trim()) {
          try { url = new URL(sourceUrl); if (!['http:','https:'].includes(url.protocol) || /\s/.test(sourceUrl)) throw new Error('Unsupported source'); }
          catch { quarantine('invalid_source_url', chapter, 1, `/${legacyId}/${duplicate}`); continue; }
        }
        if (typeof chapter.title !== 'string' || !chapter.title.trim()) { quarantine('missing_title', chapter, 1, `/${legacyId}/${duplicate}`); continue; }
        const id = stableId(`resource:${chapterKey}`);
        if (resourceIds.has(id)) throw new Error(`Resource ID collision ${chapterKey}`); resourceIds.add(id);
        const provider = url?.hostname === 'drive.google.com' ? 'drive' : url?.pathname.toLowerCase().endsWith('.pdf') ? 'pdf' : 'external';
        const status = url ? 'published' : 'draft';
        rows.push(insert('resources', { id, subject_id: subjectId, resource_type: group.resourceType, legacy_id: legacyId, title: chapter.title, description: chapter.description ?? '', source_url: sourceUrl || null, storage_path: null, provider, status, sort_order: index, created_by: null }));
        report.resources++; report[status === 'published' ? 'published' : 'drafts']++;
      }
    }
  }
  if (report.sourceChapters !== report.resources + report.quarantinedChapters) throw new Error('Chapter import reconciliation failed');
  const sql = `-- Generated by scripts/import-catalog.mjs. Insert-only; existing edits remain unchanged.\n-- Apply only after reviewed migrations. Courses remain NULL; orphan data is quarantined.\nBEGIN;\n${rows.join('\n')}\nCOMMIT;\n`;
  return { sql, report };
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const outputArg = args.indexOf('--output');
  if (args.includes('--help')) { console.log('node scripts/import-catalog.mjs [--output supabase/catalog-import.sql] [--check]'); process.exit(0); }
  const { sql, report } = await buildImport();
  if (!args.includes('--check')) {
    const output = resolve(root, outputArg >= 0 ? args[outputArg + 1] : 'supabase/catalog-import.sql');
    await mkdir(dirname(output), { recursive: true }); await writeFile(output, sql);
    await writeFile(output.replace(/\.sql$/, '') + '.report.json', JSON.stringify(report, null, 2) + '\n');
  }
  console.log(JSON.stringify(report, null, 2));
}
