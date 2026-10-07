import React from 'react';
import { Plus, ShieldAlert, Trash2, Pencil, CheckCircle2, Users, FileCheck } from 'lucide-react';
import { Avatar } from '../../components/ui/avatar';
import { swissUser as swiss, SectionHeadUser as SectionHead } from '../../components/ui/swiss';
import { useLanguage } from '../../i18n/LanguageContext';

const FOCUS =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500';

export function MembersPanel({
  members,
  editingIndex,
  rowErrors,
  updateMember,
  setEditingIndex,
  removeMember,
  addMember,
}) {
  const { t } = useLanguage();
  return (
    <section className={swiss.panel}>
      <div className="border-b border-slate-100 dark:border-slate-800 p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0" aria-hidden="true">
            <Users size={15} />
          </span>
          <SectionHead title={t('profile.members.title', { count: members.length })} />
        </div>
        <button type="button" onClick={addMember} className={swiss.btnSecondary}>
          <Plus size={14} /> {t('profile.members.add')}
        </button>
      </div>
      <div className="p-4">
        {members.length === 0 ? (
          <div className="text-sm text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 text-center">
            {t('profile.members.empty')}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                <th scope="col" className="py-2 pr-3 font-bold text-left">{t('profile.members.name')}</th>
                <th scope="col" className="py-2 pr-3 font-bold text-right">{t('profile.members.age')}</th>
                <th scope="col" className="py-2 w-16 text-center"><span className="sr-only">{t('profile.members.actions')}</span></th>
              </tr>
            </thead>
            <tbody>
              {members.map((m, i) => {
                const isEditing = editingIndex === i;
                return (
                  <React.Fragment key={i}>
                    <tr className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                      {isEditing ? (
                        <>
                          <td className="py-2 pr-3">
                            <input className={swiss.input} value={m.name} onChange={(e) => updateMember(i, 'name', e.target.value)} placeholder={t('profile.members.namePh')} aria-label={t('profile.members.nameAria', { n: i + 1 })} />
                          </td>
                          <td className="py-2 pr-3">
                            <input className={swiss.input} type="number" min="0" value={m.age} onChange={(e) => updateMember(i, 'age', e.target.value)} placeholder={t('profile.members.agePh')} aria-label={t('profile.members.ageAria', { n: i + 1 })} />
                          </td>
                          <td className="py-2 text-right">
                            <button type="button" onClick={() => setEditingIndex(null)} title={t('profile.members.done')} className={`text-[#198754] dark:text-emerald-400 hover:bg-[#198754]/10 p-2 cursor-pointer ${FOCUS}`} aria-label={t('profile.members.done')}>
                              <CheckCircle2 size={16} />
                            </button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="py-2.5 pr-3">
                            <div className="flex items-center gap-2.5">
                              <Avatar name={m.name || t('profile.members.memberFallback', { n: i + 1 })} size={28} />
                              <span className="font-medium text-slate-800 dark:text-slate-200">{m.name || <span className="text-slate-500 dark:text-slate-400 italic">{t('profile.members.unnamed')}</span>}</span>
                            </div>
                          </td>
                          <td className="py-2.5 pr-3 tabular-nums text-slate-600 dark:text-slate-300 text-right">{m.age || '—'}</td>
                          <td className="py-2.5 text-right whitespace-nowrap">
                            <button type="button" onClick={() => setEditingIndex(i)} title={t('profile.members.edit', { n: i + 1 })} aria-label={t('profile.members.edit', { n: i + 1 })} className={`text-slate-500 dark:text-slate-400 hover:text-[#0D6EFD] p-1.5 hover:bg-[#0D6EFD]/10 cursor-pointer transition-colors ${FOCUS}`}>
                              <Pencil size={15} />
                            </button>
                            <button type="button" onClick={() => removeMember(i)} title={t('profile.members.remove', { n: i + 1 })} aria-label={t('profile.members.remove', { n: i + 1 })} className={`text-slate-500 dark:text-slate-400 hover:text-[#DC3545] p-1.5 hover:bg-[#DC3545]/10 cursor-pointer transition-colors ${FOCUS}`}>
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                    {rowErrors[i] && (
                      <tr>
                        <td colSpan={3} className="pb-2">
                          <p className="text-[11px] text-[#DC3545] dark:text-red-400 font-medium">{rowErrors[i]}</p>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}

export function QuotaPanel({ totalMembers, estimatedGrainsKg }) {
  const { t } = useLanguage();
  return (
    <section className={swiss.panel}>
      <div className="border-b border-slate-100 dark:border-slate-800 p-4">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 border border-[#198754]/30 bg-[#198754]/10 text-[#198754] dark:text-emerald-400 flex items-center justify-center shrink-0" aria-hidden="true">
            <FileCheck size={15} />
          </span>
          <SectionHead title={t('profile.quota.title', { count: totalMembers })} />
        </div>
      </div>
      <div className="p-4">
        <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4">
          <p className={swiss.micro}>{t('profile.quota.grains')}</p>
          <p className="mt-2 text-4xl font-extrabold tracking-tight tabular-nums text-slate-900 dark:text-slate-100">
            {estimatedGrainsKg}
            <span className="text-lg font-bold text-slate-500 dark:text-slate-400 ml-1">kg</span>
          </p>
        </div>
      </div>
    </section>
  );
}

export function DangerZonePanel({ onDelete }) {
  const { t } = useLanguage();
  return (
      <section className="bg-white dark:bg-slate-900 border border-[#DC3545]/40">
      <div className="border-b border-[#DC3545]/20 p-4">
        <div className="flex items-center gap-2.5">
          <ShieldAlert size={18} className="text-[#DC3545] dark:text-red-400" />
          <h2 className="text-sm font-bold uppercase tracking-[0.1em] text-[#DC3545] dark:text-red-400">{t('profile.danger.title')}</h2>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
          {t('profile.danger.body')}
        </p>
      </div>
      <div className="p-4">
        <button
          type="button"
          onClick={onDelete}
          className={`inline-flex items-center justify-center gap-2 bg-[#DC3545] hover:bg-[#B02A37] text-white text-xs font-semibold tracking-wide px-4 py-2.5 transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500`}
        >
          <Trash2 size={14} />
          {t('profile.danger.delete')}
        </button>
      </div>
    </section>
  );
}
