import React from 'react';
import { Info, Plus, ShieldAlert, Trash2, Pencil, CheckCircle2, Users, FileCheck } from 'lucide-react';
import { Avatar } from '../../components/ui/avatar';
import { colorForText } from '../../components/ui/badge';
import { swiss, SectionHead } from '../../components/ui/swiss';

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
  return (
    <section className={swiss.panel}>
      <div className="border-b border-slate-100 p-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 border border-slate-200 bg-slate-50 text-slate-600 flex items-center justify-center shrink-0" aria-hidden="true">
            <Users size={15} />
          </span>
          <SectionHead title={`Family Members (${members.length})`} />
        </div>
        <button type="button" onClick={addMember} className={swiss.btnSecondary}>
          <Plus size={14} /> Add Member
        </button>
      </div>
      <div className="p-5">
        {members.length === 0 ? (
          <div className="text-sm text-slate-500 bg-slate-50 border border-slate-200 p-5 text-center">
            No additional members added yet. Only the head of family will be on record.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 border-b border-slate-200">
                <th scope="col" className="py-2 pr-3 font-bold text-left">Name</th>
                <th scope="col" className="py-2 pr-3 font-bold text-right">Age</th>
                <th scope="col" className="py-2 pr-3 font-bold text-left">Relation</th>
                <th scope="col" className="py-2 w-16 text-center"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {members.map((m, i) => {
                const isEditing = editingIndex === i;
                return (
                  <React.Fragment key={i}>
                    <tr className="border-b border-slate-100 last:border-0">
                      {isEditing ? (
                        <>
                          <td className="py-2 pr-3">
                            <input className={swiss.input} value={m.name} onChange={(e) => updateMember(i, 'name', e.target.value)} placeholder="Full name" aria-label={`Name of member ${i + 1}`} />
                          </td>
                          <td className="py-2 pr-3">
                            <input className={swiss.input} type="number" min="0" value={m.age} onChange={(e) => updateMember(i, 'age', e.target.value)} placeholder="Age" aria-label={`Age of member ${i + 1}`} />
                          </td>
                          <td className="py-2 pr-3">
                            <input className={swiss.input} value={m.relation} onChange={(e) => updateMember(i, 'relation', e.target.value)} placeholder="e.g. Mother" aria-label={`Relation to head of family for member ${i + 1}`} />
                          </td>
                          <td className="py-2 text-right">
                            <button type="button" onClick={() => setEditingIndex(null)} title="Done editing" className={`text-[#198754] hover:bg-[#198754]/10 p-2 cursor-pointer ${FOCUS}`} aria-label="Done editing">
                              <CheckCircle2 size={16} />
                            </button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="py-2.5 pr-3">
                            <div className="flex items-center gap-2.5">
                              <Avatar name={m.name || `Member ${i + 1}`} size={28} />
                              <span className="font-medium text-slate-800">{m.name || <span className="text-slate-500 italic">Unnamed</span>}</span>
                            </div>
                          </td>
                          <td className="py-2.5 pr-3 tabular-nums text-slate-600 text-right">{m.age || '—'}</td>
                          <td className="py-2.5 pr-3">
                            {m.relation ? (
                              <span className={`inline-flex items-center border border-current px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${colorForText(m.relation)}`}>
                                {m.relation}
                              </span>
                            ) : (
                              <span className="text-slate-500 text-xs italic">Not set</span>
                            )}
                          </td>
                          <td className="py-2.5 text-right whitespace-nowrap">
                            <button type="button" onClick={() => setEditingIndex(i)} title={`Edit member ${i + 1}`} aria-label={`Edit member ${i + 1}`} className={`text-slate-500 hover:text-[#0D6EFD] p-1.5 hover:bg-[#0D6EFD]/10 cursor-pointer transition-colors ${FOCUS}`}>
                              <Pencil size={15} />
                            </button>
                            <button type="button" onClick={() => removeMember(i)} title={`Remove member ${i + 1}`} aria-label={`Remove member ${i + 1}`} className={`text-slate-500 hover:text-[#DC3545] p-1.5 hover:bg-[#DC3545]/10 cursor-pointer transition-colors ${FOCUS}`}>
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                    {rowErrors[i] && (
                      <tr>
                        <td colSpan={4} className="pb-2">
                          <p className="text-[11px] text-[#DC3545] font-medium">{rowErrors[i]}</p>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        )}

        <button
          type="button"
          onClick={addMember}
          className={`w-full mt-4 flex items-center justify-center gap-2 border border-dashed border-slate-300 hover:border-slate-900 hover:bg-slate-50 text-slate-500 hover:text-slate-900 text-xs font-semibold tracking-wide py-3 transition-colors cursor-pointer ${FOCUS}`}
        >
          <Plus size={16} />
          Add Another Family Member
        </button>
      </div>
    </section>
  );
}

export function QuotaPanel({ totalMembers, estimatedGrainsKg }) {
  return (
    <section className={swiss.panel}>
      <div className="border-b border-slate-100 p-5">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 border border-[#198754]/30 bg-[#198754]/10 text-[#198754] flex items-center justify-center shrink-0" aria-hidden="true">
            <FileCheck size={15} />
          </span>
          <SectionHead title={`Estimated Monthly Ration (${totalMembers} Members)`} />
        </div>
      </div>
      <div className="p-5">
        <div className="bg-slate-50 border border-slate-200 p-4">
          <p className={swiss.micro}>Food grains (rice / wheat / coarse grains)</p>
          <p className="mt-2 text-4xl font-extrabold tracking-tight tabular-nums text-slate-900">
            {estimatedGrainsKg}
            <span className="text-lg font-bold text-slate-500 ml-1">kg</span>
          </p>
        </div>
        <p className="text-[11px] text-slate-500 mt-3 flex items-start gap-1.5">
          <Info size={12} className="shrink-0 mt-0.5" />
          <span>This is an estimate based on household size. Your official quota is confirmed on the Terminal Hub.</span>
        </p>
      </div>
    </section>
  );
}

export function DangerZonePanel({ onDelete }) {
  return (
      <section className="bg-white border border-[#DC3545]/40">
      <div className="border-b border-[#DC3545]/20 p-5">
        <div className="flex items-center gap-2.5">
          <ShieldAlert size={18} className="text-[#DC3545]" />
          <h2 className="text-sm font-bold uppercase tracking-[0.1em] text-[#DC3545]">Danger Zone</h2>
        </div>
        <p className="text-[11px] text-slate-500 mt-1">
          Deleting your account removes your login and profile permanently. This cannot be undone.
        </p>
      </div>
      <div className="p-5">
        <button
          type="button"
          onClick={onDelete}
          className={`inline-flex items-center justify-center gap-2 bg-[#DC3545] hover:bg-[#B02A37] text-white text-xs font-semibold tracking-wide px-4 py-2.5 transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500`}
        >
          <Trash2 size={14} />
          Delete My Account
        </button>
      </div>
    </section>
  );
}
