import React, { useState, useEffect } from 'react';

export default function ProfilePage() {
  const [card, setCard] = useState('');
  const [head, setHead] = useState('');
  const [members, setMembers] = useState([{ name: '', age: '', relation: 'Head' }]);
  const [msg, setMsg] = useState({ error: '', success: '' });

  useEffect(() => {
    const token = localStorage.getItem('ration_user_token');
    fetch('http://localhost:5000/api/family/profile', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.rationCardNumber) setCard(data.rationCardNumber);
        if (data.headOfFamily) setHead(data.headOfFamily);
        if (data.members?.length) setMembers(data.members);
      })
      .catch(() => {});
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setMsg({ error: '', success: '' });
    try {
      const token = localStorage.getItem('ration_user_token');
      const payload = { 
        rationCardNumber: card, 
        headOfFamily: head, 
        members: members.map(m => ({ ...m, age: Number(m.age) || 0 })) 
      };

      const res = await fetch('http://localhost:5000/api/family/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Failed to save changes');
      setMsg({ success: 'Profile saved successfully!' });
    } catch (err) {
      setMsg({ error: err.message });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
        <h2 className="text-xl font-black text-slate-800">Manage Family Information</h2>
        {msg.error && <p className="text-xs font-bold text-red-500 bg-red-50 p-3 rounded-xl">{msg.error}</p>}
        {msg.success && <p className="text-xs font-bold text-emerald-600 bg-emerald-50 p-3 rounded-xl">{msg.success}</p>}

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className="bg-slate-50 border p-3 rounded-xl text-xs font-bold" value={card} onChange={e => setCard(e.target.value)} placeholder="Ration Card ID" required />
            <input className="bg-slate-50 border p-3 rounded-xl text-xs font-bold" value={head} onChange={e => setHead(e.target.value)} placeholder="Head of Family" required />
          </div>

          <div className="space-y-2">
            {members.map((m, i) => (
              <div key={i} className="flex gap-2">
                <input className="flex-1 border p-2 rounded-xl text-xs" value={m.name} onChange={e => { const u = [...members]; u[i].name = e.target.value; setMembers(u); }} placeholder="Name" required />
                <input className="w-20 border p-2 rounded-xl text-xs" type="number" value={m.age} onChange={e => { const u = [...members]; u[i].age = e.target.value; setMembers(u); }} placeholder="Age" required />
                <select className="border p-2 rounded-xl text-xs" value={m.relation} onChange={e => { const u = [...members]; u[i].relation = e.target.value; setMembers(u); }}>
                  <option>Head</option><option>Spouse</option><option>Child</option><option>Parent</option>
                </select>
              </div>
            ))}
          </div>

          <button className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider">Save Changes</button>
        </form>
      </div>
    </div>
  );
}