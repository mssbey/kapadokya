import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SITE } from '@/lib/site';
import { getLegalPage } from '@/lib/catalogApi';
import {
  DEFAULT_LOCALE,
  isLocale,
  languageAlternates,
  localePath,
  type Locale,
} from '@/lib/i18n';

type Props = { params: Promise<{ locale: string; slug: string }> };

// Content now lives in the LegalPage table and is edited from the admin
// panel, so this can no longer be statically generated at build time.
export const dynamic = 'force-dynamic';

// NOTE: the legal texts themselves are intentionally left in English — they are
// drafts pending review by Turkish counsel, and translating unreviewed legal
// wording into five languages would multiply that risk.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolved = await params;
  let page;
  try { page = await getLegalPage(resolved.slug); } catch { return {}; }
  const locale: Locale = isLocale(resolved.locale) ? resolved.locale : DEFAULT_LOCALE;
  return {
    title: page.title,
    description: page.intro,
    alternates: {
      canonical: localePath(locale, `/legal/${resolved.slug}`),
      languages: languageAlternates(`/legal/${resolved.slug}`),
    },
  };
}

export default async function LegalPage({ params }: Props) {
  const resolved = await params;
  const locale: Locale = isLocale(resolved.locale) ? resolved.locale : DEFAULT_LOCALE;
  let page;
  try { page = await getLegalPage(resolved.slug); } catch { notFound(); }

  const lastUpdated = new Date(page.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-[#f8f6f1] px-4 pb-24 pt-32 dark:bg-dark">
      <article className="mx-auto max-w-3xl rounded-3xl border border-stone-200 bg-white p-7 shadow-sm dark:border-white/10 dark:bg-white/5 sm:p-12">
        <p className="text-xs font-bold uppercase tracking-[.2em] text-emerald-700 dark:text-emerald-400">
          {SITE.legalName} · TÜRSAB No: {SITE.tursabNumber}
        </p>
        <h1 className="mt-3 font-display text-4xl font-bold sm:text-5xl">{page.title}</h1>
        <p className="mt-5 text-lg leading-8 text-stone-600 dark:text-white/60">{page.intro}</p>
        <p className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-900 dark:bg-amber-300/10 dark:text-amber-200">
          Draft for operational review. Legal language must be reviewed by qualified counsel before launch.
        </p>

        <nav className="mt-8 rounded-2xl border border-stone-200 p-5 dark:border-white/10">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-stone-400">On this page</p>
          <ol className="mt-3 space-y-1.5 text-sm">
            {page.sections.map((section, index) => (
              <li key={section.title}>
                <a href={`#s${index}`} className="text-stone-600 underline-offset-4 hover:text-emerald-700 hover:underline dark:text-white/60 dark:hover:text-emerald-400">
                  {index + 1}. {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="mt-10 space-y-10">
          {page.sections.map((section, index) => (
            <section key={section.title} id={`s${index}`} className="scroll-mt-28">
              <h2 className="font-display text-2xl font-bold">
                {index + 1}. {section.title}
              </h2>
              {section.body && <p className="mt-3 leading-7 text-stone-600 dark:text-white/60">{section.body}</p>}
              {section.list && section.list.length > 0 && (
                <ul className="mt-4 space-y-2.5">
                  {section.list.map((item) => (
                    <li key={item} className="flex gap-3 leading-7 text-stone-600 dark:text-white/60">
                      <span aria-hidden className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-600" />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
              {section.table && (
                <div className="mt-5 overflow-x-auto rounded-2xl border border-stone-200 dark:border-white/10">
                  <table className="w-full min-w-[560px] border-collapse text-left text-sm">
                    <thead>
                      <tr className="bg-stone-50 dark:bg-white/5">
                        {section.table.head.map((cell) => (
                          <th key={cell} className="p-3.5 font-bold">{cell}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {section.table.rows.map((row) => (
                        <tr key={row[0]} className="border-t border-stone-200 dark:border-white/10">
                          {row.map((cell, cellIndex) => (
                            <td
                              key={cell + cellIndex}
                              className={`p-3.5 align-top ${cellIndex === 0 ? 'font-semibold' : 'text-stone-600 dark:text-white/60'}`}
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {section.footnote && (
                <p className="mt-4 rounded-xl bg-stone-50 p-4 text-sm leading-6 text-stone-500 dark:bg-white/5 dark:text-white/50">
                  {section.footnote}
                </p>
              )}
            </section>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-stone-200 pt-6 text-xs text-stone-400 dark:border-white/10">
          <span>Last updated: {lastUpdated}</span>
          <a href={localePath(locale, '/legal/cancellation-refund')} className="font-semibold text-emerald-700 hover:underline dark:text-emerald-400">
            Cancellation &amp; Refund Policy →
          </a>
        </div>
      </article>
    </div>
  );
}
