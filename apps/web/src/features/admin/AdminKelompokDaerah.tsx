import { useState, useEffect, useMemo } from "react";
import { supabase } from "../../lib/supabase";
import { Button } from "../../ui/basic/Button";
import { Icon } from "../../ui/basic/Icon";
import { Toast } from "../../ui/basic/Toast";

const ISLAND_ORDER = ["Sumatera","Jawa","Bali & Nusa Tenggara","Kalimantan","Sulawesi","Maluku","Papua","Lainnya"];

// Map from ID to string fallback just for sorting if we can't find a group
const ISLAND_PROV_ORDER: Record<string, string[]> = {
  "Sumatera": ["ACEH","SUMATERA_UTARA","SUMATERA_BARAT","RIAU","KEPULAUAN_RIAU","JAMBI","KEPULAUAN_BANGKA_BELITUNG","SUMATERA_SELATAN","BENGKULU","LAMPUNG"],
  "Jawa": ["BANTEN","DKI_JAKARTA","JAWA_BARAT","JAWA_TENGAH","DI_YOGYAKARTA","JAWA_TIMUR"],
  "Bali & Nusa Tenggara": ["BALI","NUSA_TENGGARA_BARAT","NUSA_TENGGARA_TIMUR"],
  "Kalimantan": ["KALIMANTAN_BARAT","KALIMANTAN_TENGAH","KALIMANTAN_SELATAN","KALIMANTAN_TIMUR","KALIMANTAN_UTARA"],
  "Sulawesi": ["SULAWESI_BARAT","SULAWESI_SELATAN","SULAWESI_TENGAH","SULAWESI_TENGGARA","GORONTALO","SULAWESI_UTARA"],
  "Maluku": ["MALUKU","MALUKU_UTARA"],
  "Papua": ["PAPUA_BARAT_DAYA","PAPUA_BARAT","PAPUA","PAPUA_TENGAH","PAPUA_SELATAN","PAPUA_PEGUNUNGAN"],
};

function sortProvincesByIsland(provs: any[], island: string) {
  const order = ISLAND_PROV_ORDER[island] || [];
  return [...provs].sort((a, b) => {
    const ia = order.indexOf(a.code), ib = order.indexOf(b.code);
    if (ia === -1 && ib === -1) return a.name.localeCompare(b.name);
    if (ia === -1) return 1; if (ib === -1) return -1;
    return ia - ib;
  });
}

function getFallbackIsland(code: string) {
  for (const [island, codes] of Object.entries(ISLAND_PROV_ORDER)) {
    if (codes.includes(code)) return island;
  }
  return "Lainnya";
}

export function AdminKelompokDaerah() {
  const [groups, setGroups] = useState<any[]>([]); // Both parent and child groups
  const [regions, setRegions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");

  const [form, setForm] = useState({ id: "", name: "", slug: "", parent_id: "" });
  // selectedGroup = kelompok yg sedang aktif
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  
  // pendingIds = set region_id yang dipilih saat mode baru
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");
  const [expandedProv, setExpandedProv] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const isNewMode = !selectedGroup && !form.id;

  const fetchData = async () => {
    setLoading(true);
    const [gRes, rRes] = await Promise.all([
      supabase.from("region_groups").select("*").order("name"),
      supabase.from("regions").select("id, name, level, parent_id, lng, code, region_group_id"),
    ]);
    if (gRes.data) {
      setGroups(gRes.data);
      // Auto expand all parents by default
      const parents = new Set(gRes.data.filter(g => !g.parent_id).map(g => g.id));
      setExpandedGroups(parents);
    }
    if (rRes.data) setRegions(rRes.data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const startNew = () => {
    setForm({ id: "", name: "", slug: "", parent_id: "" });
    setSelectedGroup(null);
    setPendingIds(new Set());
    setExpandedProv(null);
  };

  const handleSaveGroup = async () => {
    if (!form.name || !form.slug) return setToast("Nama dan slug harus diisi.");
    setLoading(true);
    const payload = {
      name: form.name,
      slug: form.slug,
      parent_id: form.parent_id || null
    };

    try {
      if (form.id) {
        await supabase.from("region_groups").update(payload).eq("id", form.id);
        setToast("Kelompok daerah berhasil diperbarui.");
        setForm({ id: "", name: "", slug: "", parent_id: "" });
        setSelectedGroup(null);
      } else {
        const { data: newGroup, error } = await supabase.from("region_groups").insert([payload]).select().single();
        if (error || !newGroup) throw error;
        
        if (pendingIds.size > 0 && newGroup.parent_id) {
          await supabase.from("regions").update({ region_group_id: newGroup.id }).in("id", [...pendingIds]);
        }
        setToast("Kelompok daerah berhasil ditambahkan.");
        setPendingIds(new Set());
        setForm({ id: "", name: "", slug: "", parent_id: "" });
        setSelectedGroup(newGroup);
      }
      await fetchData();
    } catch {
      setToast("Gagal menyimpan. Pastikan slug unik.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGroup = async (id: string) => {
    if (!window.confirm("Yakin ingin menghapus kelompok ini? Semua subkelompok di dalamnya juga akan terhapus.")) return;
    setLoading(true);
    await supabase.from("region_groups").delete().eq("id", id);
    setToast("Kelompok dihapus.");
    if (selectedGroup?.id === id || selectedGroup?.parent_id === id) { 
      setSelectedGroup(null); setPendingIds(new Set()); 
    }
    await fetchData();
  };

  const childrenMap = useMemo(() => {
    const map: Record<string, any[]> = {};
    regions.forEach(r => {
      if (r.parent_id) {
        if (!map[r.parent_id]) map[r.parent_id] = [];
        map[r.parent_id].push(r);
      }
    });
    Object.values(map).forEach(arr => arr.sort((a, b) => a.name.localeCompare(b.name)));
    return map;
  }, [regions]);

  const parents = useMemo(() => groups.filter(g => !g.parent_id).sort((a,b) => ISLAND_ORDER.indexOf(a.name) - ISLAND_ORDER.indexOf(b.name)), [groups]);
  const subgroupsByParent = useMemo(() => {
    const map: Record<string, any[]> = {};
    groups.forEach(g => {
      if (g.parent_id) {
        if (!map[g.parent_id]) map[g.parent_id] = [];
        map[g.parent_id].push(g);
      }
    });
    return map;
  }, [groups]);

  // isGroupSelectable limits assigning regions only to sub-groups.
  const isTargetGroup = selectedGroup && selectedGroup.parent_id;

  const getProvStatus = (p: any): "full" | "partial" | "none" => {
    const gid = selectedGroup?.id;
    const children = childrenMap[p.id] || [];

    if (isNewMode) {
      if (!form.parent_id) return "none"; // Cannot map to Kelompok Besar
      if (children.length === 0) return pendingIds.has(p.id) ? "full" : "none";
      const sel = children.filter(c => pendingIds.has(c.id)).length;
      const provSel = pendingIds.has(p.id);
      if (sel === children.length && provSel) return "full";
      if (sel === 0 && !provSel) return "none";
      return "partial";
    }

    if (!isTargetGroup) return "none";
    if (children.length === 0) return p.region_group_id === gid ? "full" : "none";
    const sel = children.filter(c => c.region_group_id === gid).length;
    if (sel === children.length && p.region_group_id === gid) return "full";
    if (sel === 0 && p.region_group_id !== gid) return "none";
    return "partial";
  };

  const getChildStatus = (child: any): boolean => {
    if (isNewMode && form.parent_id) return pendingIds.has(child.id);
    if (isTargetGroup) return child.region_group_id === selectedGroup?.id;
    return false;
  };

  const groupedProvinces = useMemo(() => {
    const terpilih: any[] = [];
    const islands: Record<string, any[]> = Object.fromEntries(ISLAND_ORDER.map(k => [k, []]));
    let provs = regions.filter(r => r.level === "provinsi");
    if (query.trim()) {
      const q = query.toLowerCase();
      provs = provs.filter(p => p.name.toLowerCase().includes(q));
    }
    provs.forEach(p => {
      const status = getProvStatus(p);
      if (status !== "none") terpilih.push(p);
      else { 
        // We put them in islands based on fallback code
        const island = getFallbackIsland(p.code); 
        if (islands[island]) islands[island].push(p); 
      }
    });
    Object.keys(islands).forEach(island => { islands[island] = sortProvincesByIsland(islands[island], island); });
    return { terpilih, islands };
  }, [regions, query, selectedGroup, childrenMap, pendingIds, isNewMode, form.parent_id]);

  const handleToggleProvince = async (prov: any) => {
    if (!isNewMode && !isTargetGroup) return;
    if (isNewMode && !form.parent_id) { setToast("Pilih Induk Kelompok Besar terlebih dahulu."); return; }
    
    const status = getProvStatus(prov);
    const children = childrenMap[prov.id] || [];
    const allIds = [prov.id, ...children.map((c: any) => c.id)];
    const add = status !== "full";

    if (isNewMode) {
      setPendingIds(prev => {
        const next = new Set(prev);
        if (add) allIds.forEach(id => next.add(id));
        else allIds.forEach(id => next.delete(id));
        return next;
      });
      return;
    }
    const newGroupId = add ? selectedGroup.id : null;
    setRegions(prev => prev.map(r => allIds.includes(r.id) ? { ...r, region_group_id: newGroupId } : r));
    await supabase.from("regions").update({ region_group_id: newGroupId }).in("id", allIds);
  };

  const handleToggleChild = async (child: any) => {
    if (!isNewMode && !isTargetGroup) return;
    if (isNewMode && !form.parent_id) { setToast("Pilih Induk Kelompok Besar terlebih dahulu."); return; }

    const isAssigned = getChildStatus(child);

    if (isNewMode) {
      setPendingIds(prev => {
        const next = new Set(prev);
        if (isAssigned) next.delete(child.id); else next.add(child.id);
        return next;
      });
      return;
    }
    const newGroupId = isAssigned ? null : selectedGroup.id;
    setRegions(prev => prev.map(r => r.id === child.id ? { ...r, region_group_id: newGroupId } : r));
    await supabase.from("regions").update({ region_group_id: newGroupId }).eq("id", child.id);
  };

  const toggleParentGroup = (id: string, e: any) => {
    e.stopPropagation();
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  const renderProvince = (prov: any) => {
    const status = getProvStatus(prov);
    const isOtherAssigned = !isNewMode && prov.region_group_id && prov.region_group_id !== selectedGroup?.id;
    const children = childrenMap[prov.id] || [];
    const hasChildren = children.length > 0;
    const isExpanded = expandedProv === prov.id;
    const isSelected = status !== "none";

    // Subkelompok lookup for isOtherAssigned
    const assignedGroup = groups.find(g => g.id === prov.region_group_id);

    return (
      <div key={prov.id} className={"mb-1 rounded-xl shadow-sm border overflow-hidden transition-colors " + (isSelected ? "bg-teal-50 border-teal-200" : "bg-white border-stone-200")}>
        <div className="flex items-center p-3 hover:bg-opacity-80 transition-colors">
          <div className={"flex items-center gap-3 flex-1 cursor-pointer select-none"} onClick={() => handleToggleProvince(prov)}>
            <div className={"w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors " + (isSelected ? "border-teal bg-teal" : "border-stone-300 bg-white")}>
              {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
            </div>
            <div className="flex items-center gap-2">
              <span className={"text-sm " + (isSelected ? "font-bold text-stone-800" : "text-stone-600")}>{prov.name}</span>
              {status === "partial" && <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-bold uppercase tracking-wider">Sebagian</span>}
              {isOtherAssigned && !isSelected && assignedGroup && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 text-stone-400 uppercase">{assignedGroup.name}</span>
              )}
            </div>
          </div>
          {hasChildren && (
            <button className={"px-3 py-1.5 text-xs rounded-lg border font-medium transition-colors " + (isExpanded ? "bg-teal text-white border-teal" : "bg-white text-stone-600 border-stone-300 hover:border-stone-400")}
              onClick={(e) => { e.stopPropagation(); setExpandedProv(isExpanded ? null : prov.id); }}>
              Pilih Sebagian
            </button>
          )}
        </div>
        {isExpanded && hasChildren && (
          <div className="px-3 pb-3 pt-1 border-t border-stone-100 bg-white/60">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
              {children.map((child: any) => {
                const isChildSelected = getChildStatus(child);
                const isChildOther = (!isNewMode || form.parent_id) && child.region_group_id && !isChildSelected;
                const assignedChildGroup = groups.find(g => g.id === child.region_group_id);
                return (
                  <div key={child.id} onClick={() => handleToggleChild(child)} className={"flex items-start gap-2 p-2 rounded-lg cursor-pointer border transition-colors " + (isChildSelected ? "bg-teal-50 border-teal-200" : "bg-white border-stone-200 hover:border-stone-300")}>
                    <div className={"mt-0.5 w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors " + (isChildSelected ? "border-teal bg-teal" : "border-stone-300 bg-white")}>
                      {isChildSelected && <div className="w-1 h-1 rounded-full bg-white" />}
                    </div>
                    <div className="flex flex-col">
                      <span className={"text-xs leading-tight " + (isChildSelected ? "font-bold text-teal-900" : "text-stone-600")}>{child.name}</span>
                      {isChildOther && assignedChildGroup && <span className="text-[9px] text-stone-400 mt-0.5">{assignedChildGroup.name}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="font-nunito max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-fredoka text-stone-800">Kelompok Daerah</h1>
        <p className="text-stone-500 text-sm mt-1">Kelola Kelompok Besar dan Subkelompok Budaya.</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-fredoka font-bold text-stone-800">{form.id ? "Edit Kelompok" : "Tambah Kelompok"}</h3>
              {form.id && (
                <button onClick={startNew} className="text-xs text-teal-600 hover:underline font-bold">+ Buat Kelompok Baru</button>
              )}
            </div>
            {form.id && (
              <div className="text-xs bg-amber-50 text-amber-700 p-2 rounded-lg border border-amber-200 mb-3">
                <span className="font-bold">Mode Edit:</span> Anda sedang mengubah kelompok yang sudah ada. Menyimpan form ini akan menimpa data kelompok ini.
              </div>
            )}
            <div className="flex flex-col gap-3">
              <select 
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:border-teal font-bold"
                value={form.parent_id}
                onChange={e => {
                  setForm({...form, parent_id: e.target.value});
                  if (!e.target.value) setPendingIds(new Set()); // Clear pending if switching to Kelompok Besar
                }}
              >
                <option value="">[ Kelompok Besar Utama ]</option>
                {parents
                  .filter(p => p.id !== form.id)
                  .map(p => (
                  <option key={p.id} value={p.id}>Subkelompok dari {p.name}</option>
                ))}
              </select>
              <input
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:border-teal"
                placeholder={form.parent_id ? "Nama Subkelompok Budaya" : "Nama Kelompok Besar"}
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
              />
              <input
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:border-teal"
                placeholder="Slug unik (contoh: aceh-pesisir)"
                value={form.slug}
                onChange={e => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
              />
              <div className="flex justify-end gap-2 mt-2">
                {(form.id || selectedGroup) && (
                  <Button variant="secondary" onClick={startNew}>Batal</Button>
                )}
                <Button onClick={handleSaveGroup} disabled={loading}>{loading ? "Menyimpan..." : "Simpan"}</Button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
            <div className="p-4 border-b border-stone-100 font-bold text-stone-700 bg-stone-50 shrink-0">Pohon Kelompok</div>
            <div className="divide-y divide-stone-100 overflow-y-auto grow">
              {loading && groups.length === 0 && <div className="p-4 text-sm text-stone-500">Memuat...</div>}
              {parents.map(p => {
                const subs = subgroupsByParent[p.id] || [];
                const isExpanded = expandedGroups.has(p.id);
                return (
                  <div key={p.id}>
                    <div 
                      className={"p-3 flex justify-between items-center transition-colors cursor-pointer border-l-4 " + (selectedGroup?.id === p.id ? "bg-stone-100 border-stone-400" : "hover:bg-stone-50 border-transparent")}
                      onClick={() => { setSelectedGroup(p); setForm({ id: p.id, name: p.name, slug: p.slug, parent_id: "" }); setPendingIds(new Set()); }}
                    >
                      <div className="flex items-center gap-2">
                        <button onClick={(e) => toggleParentGroup(p.id, e)} className="text-stone-400 hover:text-stone-600">
                          <Icon name={isExpanded ? "ChevronDown" : "ChevronRight"} size={16} />
                        </button>
                        <div className={"font-bold text-sm " + (selectedGroup?.id === p.id ? "text-stone-800" : "text-stone-700")}>{p.name}</div>
                      </div>
                      <div className="flex gap-1">
                        <button className="p-1.5 text-stone-400 hover:text-teal-600 bg-white rounded-md border border-stone-200" onClick={(e) => { e.stopPropagation(); setForm({id: p.id, name: p.name, slug: p.slug, parent_id: ""}); setSelectedGroup(p); }}><Icon name="Pencil" size={12} /></button>
                        <button className="p-1.5 text-stone-400 hover:text-red-500 bg-white rounded-md border border-stone-200" onClick={(e) => { e.stopPropagation(); handleDeleteGroup(p.id); }}><Icon name="Trash" size={12} /></button>
                      </div>
                    </div>
                    {isExpanded && (
                       <div className="bg-stone-50/50">
                         {subs.map(sub => (
                            <div 
                              key={sub.id}
                              className={"p-2 pl-9 flex justify-between items-center transition-colors cursor-pointer border-l-4 " + (selectedGroup?.id === sub.id ? "bg-teal-50 border-teal" : "hover:bg-teal-50/50 border-transparent")}
                              onClick={() => { setSelectedGroup(sub); setForm({ id: sub.id, name: sub.name, slug: sub.slug, parent_id: p.id }); setPendingIds(new Set()); }}
                            >
                              <div>
                                <div className={"text-sm font-bold " + (selectedGroup?.id === sub.id ? "text-teal-800" : "text-stone-600")}>{sub.name}</div>
                                <div className="text-[10px] text-stone-400">{sub.slug}</div>
                              </div>
                              <div className="flex gap-1">
                                <button className="p-1.5 text-stone-400 hover:text-teal-600 bg-white rounded-md border border-stone-200" onClick={(e) => { e.stopPropagation(); setForm({id: sub.id, name: sub.name, slug: sub.slug, parent_id: p.id}); setSelectedGroup(sub); }}><Icon name="Pencil" size={12} /></button>
                                <button className="p-1.5 text-stone-400 hover:text-red-500 bg-white rounded-md border border-stone-200" onClick={(e) => { e.stopPropagation(); handleDeleteGroup(sub.id); }}><Icon name="Trash" size={12} /></button>
                              </div>
                            </div>
                         ))}
                         {subs.length === 0 && <div className="p-2 pl-9 text-xs text-stone-400 italic">Tidak ada subkelompok</div>}
                       </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 h-[930px] flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-fredoka font-bold text-stone-800">Anggota Daerah</h3>
              {isNewMode && form.parent_id && pendingIds.size > 0 && (
                <span className="text-xs bg-teal-100 text-teal-700 px-3 py-1 rounded-full font-bold">{pendingIds.size} dipilih</span>
              )}
            </div>

            {isNewMode && !form.parent_id ? (
              <div className="bg-amber-50 border border-amber-200 text-amber-700 p-3 rounded-xl text-sm mb-4">
                Daerah hanya bisa dipetakan ke <strong>Subkelompok Budaya</strong>. Silakan pilih "Subkelompok dari..." pada form sebelah kiri.
              </div>
            ) : (!isNewMode && !isTargetGroup) ? (
              <div className="bg-amber-50 border border-amber-200 text-amber-700 p-3 rounded-xl text-sm mb-4">
                <strong>{selectedGroup?.name}</strong> adalah Kelompok Besar. Daerah hanya dipetakan ke Subkelompok Budaya.
              </div>
            ) : (
              <p className="text-sm text-stone-500 mb-4">
                Pilih daerah yang termasuk ke dalam <strong>{form.name || "Subkelompok Baru"}</strong>. 
                {!isNewMode && " Perubahan langsung disimpan."}
              </p>
            )}

            <div className="relative mb-4 shrink-0">
              <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Cari provinsi..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:border-teal"
              />
            </div>

            <div className={`border rounded-xl overflow-y-auto p-2 grow transition-colors ${(!isTargetGroup && !(isNewMode && form.parent_id)) ? "opacity-50 pointer-events-none bg-stone-100 border-stone-200" : "bg-stone-50 border-stone-200"}`}>
              {loading && regions.length === 0 && <div className="text-center py-8 text-stone-400 text-sm">Memuat provinsi...</div>}

              {groupedProvinces.terpilih.length > 0 && (
                <div className="mb-6">
                  <div className="text-xs font-bold text-teal-700 uppercase tracking-wider mb-2 px-1">Daerah Terpilih</div>
                  {groupedProvinces.terpilih.map(renderProvince)}
                </div>
              )}

              {ISLAND_ORDER.map(islandName => {
                const provs = groupedProvinces.islands[islandName];
                if (!provs || provs.length === 0) return null;
                return (
                  <div key={islandName} className="mb-6">
                    <div className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 px-1">{islandName}</div>
                    {provs.map(renderProvince)}
                  </div>
                );
              })}

              {!loading && regions.filter(r => r.level === "provinsi").length === 0 && (
                <div className="text-center py-8 text-stone-400 text-sm">Tidak ada data provinsi.</div>
              )}
              {query && groupedProvinces.terpilih.length === 0 && Object.values(groupedProvinces.islands).every(arr => arr.length === 0) && (
                <div className="text-center py-8 text-stone-400 text-sm">Tidak ada daerah yang cocok.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Toast visible={!!toast} message={toast} onClose={() => setToast("")} />
    </div>
  );
}
