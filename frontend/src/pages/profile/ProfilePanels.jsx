import { Camera, CheckCircle2, Mail, Phone } from 'lucide-react';
import { Avatar } from '../../components/ui/avatar';
import { swiss, SectionHead } from '../../components/ui/swiss';

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
  return (
    <section className={swiss.panel}>
      <div className="border-b border-slate-100 p-5">
        <SectionHead title="Account Details" />
      </div>
      <div className="p-5 space-y-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="relative group cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
            title="Change profile picture"
            aria-label="Change profile picture"
          >
            <Avatar src={avatar} name={accountName} size={56} />
            <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center border-2 border-white">
              <Camera size={12} />
            </span>
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onAvatarPick} />
          <p className="text-xs text-slate-400">Click to upload a profile picture (max 1.5MB).</p>
        </div>

        <div>
          <label htmlFor="accountName" className={swiss.label}>Full Name</label>
          <input
            id="accountName"
            className={swiss.input}
            value={accountName}
            onChange={onNameChange}
            placeholder="Full name"
            required
          />
        </div>
        <div>
          <label htmlFor="accountPhone" className={swiss.label}>
            <span className="flex items-center gap-1.5"><Phone size={12} /> Phone Number</span>
          </label>
          <input
            id="accountPhone"
            className={swiss.input}
            type="tel"
            maxLength={12}
            value={phone}
            onChange={onPhoneChange}
            placeholder="e.g. 98765 43210"
          />
          <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
            <CheckCircle2 size={11} /> Link your mobile number to enable OTP login for this account.
          </p>
        </div>
        <div>
          <span className={swiss.label}>
            <span className="flex items-center gap-1.5"><Mail size={12} /> Registered Email</span>
          </span>
          <input className={`${swiss.input} disabled:bg-slate-100 disabled:text-slate-500`} value={email || 'Not set'} disabled />
          <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
            <CheckCircle2 size={11} /> This is tied to how you log in and can't be changed here.
          </p>
        </div>
      </div>
    </section>
  );
}

export function RationCardPanel({ card, onCardChange, head, onHeadChange }) {
  return (
    <section className={swiss.panel}>
      <div className="border-b border-slate-100 p-5">
        <SectionHead title="Ration Card Details" />
      </div>
      <div className="p-5 space-y-4">
        <div>
          <label htmlFor="card" className={swiss.label}>Ration Card ID</label>
          <input id="card" className={swiss.input} value={card} onChange={onCardChange} placeholder="e.g. 122341" required />
        </div>
        <div>
          <label htmlFor="head" className={swiss.label}>Head of Family</label>
          <input id="head" className={swiss.input} value={head} onChange={onHeadChange} placeholder="Full name" required />
        </div>
      </div>
    </section>
  );
}

export function AddressPanel({ address, setAddress }) {
  const field = (key) => ({
    value: address[key],
    onChange: (e) => setAddress({ ...address, [key]: e.target.value }),
  });

  return (
    <section className={swiss.panel}>
      <div className="border-b border-slate-100 p-5">
        <SectionHead title="Address / Location" />
        <p className="text-[11px] text-slate-400 mt-1">This determines your local distributor.</p>
      </div>
      <div className="p-5 grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label htmlFor="village" className={swiss.label}>Village / Town</label>
          <input id="village" className={swiss.input} {...field('village')} required />
        </div>
        <div>
          <label htmlFor="block" className={swiss.label}>Tehsil</label>
          <input id="block" className={swiss.input} {...field('block')} />
        </div>
        <div>
          <label htmlFor="district" className={swiss.label}>District</label>
          <input id="district" className={swiss.input} {...field('district')} required />
        </div>
        <div>
          <label htmlFor="state" className={swiss.label}>State</label>
          <input id="state" className={swiss.input} {...field('state')} required />
        </div>
        <div>
          <label htmlFor="pincode" className={swiss.label}>PIN Code</label>
          <input id="pincode" className={swiss.input} {...field('pincode')} />
        </div>
      </div>
    </section>
  );
}
