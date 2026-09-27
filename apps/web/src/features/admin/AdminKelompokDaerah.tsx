import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../ui/basic/Button';
import { Icon } from '../../ui/basic/Icon';
import { Toast } from '../../ui/basic/Toast';

export function AdminKelompokDaerah() {
  const [groups, setGroups] = useState<any[]>([]);
  const [regions, setRegions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  
  const [form, setForm] = useState({ id: '', name: '', slug: '' });
  const [selectedGroup, setSelectedGroup] = useState<any>(null);

  const fetchData = async () => {
    setLoading(true);
    const [gRes, rRes] = await Promise.all([
      supabase.from('region_groups').select('*').order('name'),
      supabase.from('regions').select('id, name, region_group_id').order('name')
    ]);
    
    if (gRes.data) setGroups(gRes.data);
    if (rRes.data) setRegions(rRes.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveGroup = async () => {
    if (!form.name || !form.slug) return setToast('Nama dan slug harus diisi.');
    setLoading(true);
    try {
      if (form.id) {
        await supabase.from('region_groups').update({ name: form.name, slug: form.slug }).eq('id', form.id);
        setToast('Kelompok daerah berhasil diperbarui.');
      } else {
        await supabase.from('region_groups').insert([{ name: form.name, slug: form.slug }]);
        setToast('Kelompok daerah berhasil ditambahkan.');
      }
      setForm({ id: '', name: '', slug: '' });
      await fetchData();
    } catch (e) {
      setToast('Gagal menyimpan.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGroup = async (id: string) => {
    if (!window.confirm('Yakin ingin menghapus kelompok ini? Semua region yang terhubung akan kehilangan kelompoknya.')) return;
    setLoading(true);
    await supabase.from('region_groups').delete().eq('id', id);
    setToast('Kelompok dihapus.');
    if (selectedGroup?.id === id) setSelectedGroup(null);
    await fetchData();
  };

  const handleToggleRegion = async (regionId: string, isAssigned: boolean) => {
    if (!selectedGroup) return;
    const newGroupId = isAssigned ? null : selectedGroup.id;
    
    setRegions(prev => prev.map(r => r.id === regionId ? { ...r, region_group_id: newGroupId } : r));
    
    await supabase.from('regions').update({ region_group_id: newGroupId }).eq('id', regionId);
  };

  return (
    <div className="font-nunito max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-fredoka text-stone-800">Kelompok Daerah</h1>
        <p className="text-stone-500 text-sm mt-1">Kelola daftar kelompok daerah dan hubungkan dengan provinsi.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 mb-6">
            <h3 className="text-xl font-fredoka font-bold text-stone-800 mb-4">{form.id ? 'Edit Kelompok' : 'Tambah Kelompok'}</h3>
            <div className="flex flex-col gap-3">
              <input className="px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none" placeholder="Nama Kelompok (contoh: Jawa)" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              <input className="px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none" placeholder="Slug (contoh: jawa)" value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} />
              <div className="flex justify-end gap-2 mt-2">
                {form.id && <Button variant="secondary" onClick={() => setForm({id:'', name:'', slug:''})}>Batal</Button>}
                <Button onClick={handleSaveGroup} disabled={loading}>{loading ? 'Menyimpan...' : 'Simpan'}</Button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-stone-100 font-bold text-stone-700 bg-stone-50">Daftar Kelompok</div>
            <div className="divide-y divide-stone-100">
              {loading && groups.length === 0 ? <div className="p-4 text-sm text-stone-500">Memuat...</div> : null}
              {groups.map(g => (
                <div key={g.id} className={"p-4 flex justify-between items-center transition-colors cursor-pointer " + (selectedGroup?.id === g.id ? 'bg-teal-50' : 'hover:bg-stone-50')} onClick={() => setSelectedGroup(g)}>
                  <div>
                    <div className="font-bold text-stone-800">{g.name}</div>
                    <div className="text-xs text-stone-500">{g.slug}</div>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-1.5 text-stone-400 hover:text-teal-600" onClick={(e) => { e.stopPropagation(); setForm(g); }}><Icon name="Edit2" size={14} /></button>
                    <button className="p-1.5 text-stone-400 hover:text-red-500" onClick={(e) => { e.stopPropagation(); handleDeleteGroup(g.id); }}><Icon name="Trash" size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6">
            <h3 className="text-xl font-fredoka font-bold text-stone-800 mb-2">Anggota Daerah</h3>
            {selectedGroup ? (
              <>
                <p className="text-sm text-stone-500 mb-4">Pilih daerah yang termasuk ke dalam <strong>{selectedGroup.name}</strong>.</p>
                <div className="border border-stone-200 rounded-xl max-h-[500px] overflow-y-auto bg-stone-50 p-2">
                  {regions.map(r => {
                    const isAssigned = r.region_group_id === selectedGroup.id;
                    const isOtherAssigned = r.region_group_id && !isAssigned;
                    return (
                      <label key={r.id} className="flex items-center gap-3 p-2 hover:bg-white rounded-lg cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={isAssigned} 
                          onChange={() => handleToggleRegion(r.id, isAssigned)}
                          className="w-4 h-4 text-teal border-stone-300 rounded focus:ring-teal"
                        />
                        <span className={"text-sm " + (isAssigned ? 'font-bold text-stone-800' : 'text-stone-600')}>{r.name}</span>
                        {isOtherAssigned && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-200 text-stone-500 ml-auto uppercase">Pindah ke sini</span>
                        )}
                      </label>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="text-center py-10 text-stone-400 text-sm">
                <Icon name="Map" size={32} className="mx-auto mb-3 opacity-50" />
                Pilih kelompok di samping untuk<br/>mengatur anggotanya.
              </div>
            )}
          </div>
        </div>
      </div>

      <Toast visible={!!toast} message={toast} onClose={() => setToast('')} />
    </div>
  );
}
