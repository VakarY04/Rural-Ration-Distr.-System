import { Camera, CheckCircle2, Mail, Phone } from 'lucide-react';
import { Avatar } from '../../components/ui/avatar';
import { swiss, SectionHead } from '../../components/ui/swiss';
import { useLanguage } from '../../i18n/LanguageContext';

export function AccountPanel({
  fileInputRef,
  avatar,
  accountName,
  onNameChange,
  phone,
  onPhoneChange,
  email,
  onAvatarPick,
}) {
  const { t } = useLanguage();
  return (
    <section className={swiss.panel}>
      <div className="border-b border-slate-100 p-5">
        <SectionHead title={t('profile.account.title')} />
      </div>
      <div className="p-5 space-y-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="relative group cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
            title={t('profile.account.changePic')}
            aria-label={t('profile.account.changePic')}
          >
            <Avatar src={avatar} name={accountName} size={56} />
            <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center border-2 border-white">
              <Camera size={12} />
            </span>
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onAvatarPick} />
          <p className="text-xs text-slate-500">{t('profile.account.uploadHint')}</p>
        </div>

        <div>
          <label htmlFor="accountName" className={swiss.label}>{t('profile.account.fullName')}</label>
          <input
            id="accountName"
            className={swiss.input}
            value={accountName}
            onChange={onNameChange}
            placeholder={t('profile.account.fullNamePh')}
            required
          />
        </div>
        <div>
          <label htmlFor="accountPhone" className={swiss.label}>
            <span className="flex items-center gap-1.5"><Phone size={12} /> {t('profile.account.phone')}</span>
          </label>
          <input
            id="accountPhone"
            className={swiss.input}
            type="tel"
            maxLength={12}
            value={phone}
            onChange={onPhoneChange}
            placeholder={t('profile.account.phonePh')}
          />
          <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1">
            <CheckCircle2 size={11} /> {t('profile.account.phoneHint')}
          </p>
        </div>
        <div>
          <span className={swiss.label}>
            <span className="flex items-center gap-1.5"><Mail size={12} /> {t('profile.account.email')}</span>
          </span>
          <input className={`${swiss.input} disabled:bg-slate-100 disabled:text-slate-500`} value={email || t('profile.account.notSet')} disabled />
          <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1">
            <CheckCircle2 size={11} /> {t('profile.account.emailHint')}
          </p>
        </div>
      </div>
    </section>
  );
}

export function RationCardPanel({ card, onCardChange, head, onHeadChange }) {
  const { t } = useLanguage();
  return (
    <section className={swiss.panel}>
      <div className="border-b border-slate-100 p-5">
        <SectionHead title={t('profile.card.title')} />
      </div>
      <div className="p-5 space-y-4">
        <div>
          <label htmlFor="card" className={swiss.label}>{t('profile.card.id')}</label>
          <input id="card" className={swiss.input} value={card} onChange={onCardChange} placeholder={t('profile.card.idPh')} required />
        </div>
        <div>
          <label htmlFor="head" className={swiss.label}>{t('profile.card.head')}</label>
          <input id="head" className={swiss.input} value={head} onChange={onHeadChange} placeholder={t('profile.card.headPh')} required />
        </div>
      </div>
    </section>
  );
}

export function AddressPanel({ address, setAddress }) {
  const { t } = useLanguage();
  const field = (key) => ({
    value: address[key],
    onChange: (e) => setAddress({ ...address, [key]: e.target.value }),
  });

  return (
    <section className={swiss.panel}>
      <div className="border-b border-slate-100 p-5">
        <SectionHead title={t('profile.address.title')} />
        <p className="text-[11px] text-slate-500 mt-1">{t('profile.address.hint')}</p>
      </div>
      <div className="p-5 grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label htmlFor="village" className={swiss.label}>{t('profile.address.village')}</label>
          <input id="village" className={swiss.input} {...field('village')} required />
        </div>
        <div>
          <label htmlFor="block" className={swiss.label}>{t('profile.address.tehsil')}</label>
          <input id="block" className={swiss.input} {...field('block')} />
        </div>
        <div>
          <label htmlFor="district" className={swiss.label}>{t('profile.address.district')}</label>
          <input id="district" className={swiss.input} {...field('district')} required />
        </div>
        <div>
          <label htmlFor="state" className={swiss.label}>{t('profile.address.state')}</label>
          <input id="state" className={swiss.input} {...field('state')} required />
        </div>
        <div>
          <label htmlFor="pincode" className={swiss.label}>{t('profile.address.pin')}</label>
          <input id="pincode" className={swiss.input} {...field('pincode')} />
        </div>
      </div>
    </section>
  );
}
