import { useState, useEffect, useMemo } from "react";
import { supabase } from "../../lib/supabase";
import { Button } from "../../ui/basic/Button";
import { Icon } from "../../ui/basic/Icon";
import { Toast } from "../../ui/basic/Toast";

const SUMATERA = new Set(["ACEH","SUMATERA_UTARA","SUMATERA_BARAT","RIAU","JAMBI","SUMATERA_SELATAN","BENGKULU","LAMPUNG","KEPULAUAN_BANGKA_BELITUNG","KEPULAUAN_RIAU"]);
const JAWA = new Set(["DKI_JAKARTA","JAWA_BARAT","JAWA_TENGAH","DI_YOGYAKARTA","JAWA_TIMUR","BANTEN"]);
const BALI_NUSRA = new Set(["BALI","NUSA_TENGGARA_BARAT","NUSA_TENGGARA_TIMUR"]);
const KALIMANTAN = new Set(["KALIMANTAN_BARAT","KALIMANTAN_TENGAH","KALIMANTAN_SELATAN","KALIMANTAN_TIMUR","KALIMANTAN_UTARA"]);
const SULAWESI = new Set(["SULAWESI_UTARA","SULAWESI_TENGAH","SULAWESI_SELATAN","SULAWESI_TENGGARA","GORONTALO","SULAWESI_BARAT"]);
const MALUKU = new Set(["MALUKU","MALUKU_UTARA"]);
const PAPUA = new Set(["PAPUA_BARAT","PAPUA","PAPUA_SELATAN","PAPUA_TENGAH","PAPUA_PEGUNUNGAN","PAPUA_BARAT_DAYA"]);

const ISLAND_ORDER = ["Sumatera","Jawa","Bali & Nusa Tenggara","Kalimantan","Sulawesi","Maluku","Papua","Lainnya"];

function getIslandGroup(code: string) {
  if (SUMATERA.has(code)) return "Sumatera";
  if (JAWA.has(code)) return "Jawa";
  if (BALI_NUSRA.has(code)) return "Bali & Nusa Tenggara";
  if (KALIMANTAN.has(code)) return "Kalimantan";
  if (SULAWESI.has(code)) return "Sulawesi";
  if (MALUKU.has(code)) return "Maluku";
  if (PAPUA.has(code)) return "Papua";
  return "Lainnya";
}

// Order within each island group (by geographic position west to east)
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
    const ia = order.indexOf(a.code);
    const ib = order.indexOf(b.code);
    if (ia === -1 && ib === -1) return a.name.localeCompare(b.name);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
}

export function AdminKelompokDaerah() {
  const [groups, setGroups] = useState<any[]>([]);
  const [regions, setRegions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");

  const [form, setForm] = useState({ id: "", name: "", slug: "" });
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [query, setQuery] = useState("");
  const [expandedProv, setExpandedProv] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const [gRes, rRes] = await Promise.all([
      supabase.from("region_groups").select("*").order("name"),
      supabase.from("regions").select("id, name, level, parent_id, lng, code, region_group_id"),
    ]);
    if (gRes.data) setGroups(gRes.data);
    if (rRes.data) setRegions(rRes.data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSaveGroup = async () => {
    if (!form.name || !form.slug) return setToast("Nama dan slug harus diisi.");
    setLoading(true);
    try {
      if (form.id) {
        await supabase.from("region_groups").update({ name: form.name, slug: form.slug }).eq("id", form.id);
        setToast("Kelompok daerah berhasil diperbarui.");
      } else {
        await supabase.from("region_groups").insert([{ name: form.name, slug: form.slug }]);
        setToast("Kelompok daerah berhasil ditambahkan.");
      }
      setForm({ id: "", name: "", slug: "" });
      await fetchData();
    } catch {
      setToast("Gagal menyimpan.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGroup = async (id: string) => {
    if (!window.confirm("Yakin ingin menghapus kelompok ini?")) return;
    setLoading(true);
    await supabase.from("region_groups").delete().eq("id", id);
    setToast("Kelompok dihapus.");
    if (selectedGroup?.id === id) setSelectedGroup(null);
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

  const getProvStatus = (p: any) => {
    if (!selectedGroup) return "none";
    const children = childrenMap[p.id] || [];
    if (children.length === 0) return p.region_group_id === selectedGroup.id ? "full" : "none";
    const sel = children.filter(c => c.region_group_id === selectedGroup.id).length;
    if (sel === children.length && p.region_group_id === selectedGroup.id) return "full";
    if (sel === 0 && p.region_group_id !== selectedGroup.id) return "none";
    return "partial";
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
      if (selectedGroup && status !== "none") {
        terpilih.push(p);
      } else {
        const island = getIslandGroup(p.code);
        islands[island].push(p);
      }
    });

    Object.keys(islands).forEach(island => {
      islands[island] = sortProvincesByIsland(islands[island], island);
    });
    terpilih.sort((a, b) => getIslandGroup(a.code).localeCompare(getIslandGroup(b.code)) || a.name.localeCompare(b.name));

    return { terpilih, islands };
  }, [regions, query, selectedGroup, childrenMap]);

  const handleToggleProvince = async (prov: any) => {
    if (!selectedGroup) return;
    const status = getProvStatus(prov);
    const newGroupId = status === "full" ? null : selectedGroup.id;
    const children = childrenMap[prov.id] || [];
    const ids = [prov.id, ...children.map((c: any) => c.id)];
    setRegions(prev => prev.map(r => ids.includes(r.id) ? { ...r, region_group_id: newGroupId } : r));
    await supabase.from("regions").update({ region_group_id: newGroupId }).in("id", ids);
  };

  const handleToggleChild = async (child: any) => {
    if (!selectedGroup) return;
    const isAssigned = child.region_group_id === selectedGroup.id;
    const newGroupId = isAssigned ? null : selectedGroup.id;
    setRegions(prev => prev.map(r => r.id === child.id ? { ...r, region_group_id: newGroupId } : r));
    await supabase.from("regions").update({ region_group_id: newGroupId }).eq("id", child.id);
  };

  const renderProvince = (prov: any) => {
    const status = getProvStatus(prov);
    const isOtherAssigned = prov.region_group_id && prov.region_group_id !== selectedGroup?.id;
    const children = childrenMap[prov.id] || [];
    const hasChildren = children.length > 0;
    const isExpanded = expandedProv === prov.id;
    const canSelect = !!selectedGroup;

    return (
      <div key={prov.id} className={"mb-1 bg-white rounded-xl shadow-sm border overflow-hidden " + (status !== "none" ? "border-teal-200" : "border-stone-200")}>
        <div className="flex items-center p-3 hover:bg-stone-50 transition-colors">
          <label className={"flex items-center gap-3 flex-1 select-none " + (canSelect ? "cursor-pointer" : "cursor-default opacity-60")}>
            <input
              type="radio"
              disabled={!canSelect}
              checked={status === "full" || status === "partial"}
              onClick={(e) => e.stopPropagation()}
              onChange={() => handleToggleProvince(prov)}
              className="w-4 h-4 text-teal border-stone-300 focus:ring-teal cursor-pointer"
            />
            <div className="flex items-center gap-2">
              <span className={"text-sm " + (status !== "none" ? "font-bold text-stone-800" : "text-stone-600")}>{prov.name}</span>
              {status === "partial" && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-bold uppercase tracking-wider">Sebagian</span>
              )}
              {isOtherAssigned && status === "none" && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 text-stone-400 uppercase">Grup Lain</span>
              )}
            </div>
          </label>

          {hasChildren && canSelect && (
            <Button
              variant={isExpanded ? "primary" : "secondary"}
              className="!px-3 !py-1.5 text-xs rounded-lg"
              onClick={() => setExpandedProv(isExpanded ? null : prov.id)}
            >
              Pilih Sebagian
            </Button>
          )}
        </div>

        {isExpanded && hasChildren && canSelect && (
          <div className="px-3 pb-3 pt-1 border-t border-stone-100 bg-stone-50/50">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
              {children.map((child: any) => {
                const isChildAssigned = child.region_group_id === selectedGroup?.id;
                const isChildOther = child.region_group_id && !isChildAssigned;
                return (
                  <label key={child.id} className={"flex items-start gap-2 p-2 rounded-lg cursor-pointer border transition-colors " + (isChildAssigned ? "bg-teal-50 border-teal-200" : "bg-white border-stone-200 hover:border-stone-300")}>
                    <input
                      type="radio"
                      checked={isChildAssigned}
                      onChange={() => handleToggleChild(child)}
                      className="mt-0.5 w-3.5 h-3.5 text-teal border-stone-300 focus:ring-teal cursor-pointer shrink-0"
                    />
                    <div className="flex flex-col">
                      <span className={"text-xs leading-tight " + (isChildAssigned ? "font-bold text-teal-900" : "text-stone-600")}>{child.name}</span>
                      {isChildOther && <span className="text-[9px] text-stone-400 mt-0.5">Grup Lain</span>}
                    </div>
                  </label>
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
        <p className="text-stone-500 text-sm mt-1">Kelola kelompok daerah dan hubungkan dengan provinsi atau kabupaten/kota.</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 mb-6">
            <h3 className="text-lg font-fredoka font-bold text-stone-800 mb-4">{form.id ? "Edit Kelompok" : "Tambah Kelompok"}</h3>
            <div className="flex flex-col gap-3">
              <input
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:border-teal"
                placeholder="Nama Kelompok (contoh: Jawa)"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
              />
              <input
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:border-teal"
                placeholder="Slug (contoh: jawa)"
                value={form.slug}
                onChange={e => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, "") })}
              />
              <div className="flex justify-end gap-2 mt-2">
                {form.id && <Button variant="secondary" onClick={() => setForm({ id: "", name: "", slug: "" })}>Batal</Button>}
                <Button onClick={handleSaveGroup} disabled={loading}>{loading ? "Menyimpan..." : "Simpan"}</Button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden flex flex-col h-[500px]">
            <div className="p-4 border-b border-stone-100 font-bold text-stone-700 bg-stone-50 shrink-0">Daftar Kelompok</div>
            <div className="divide-y divide-stone-100 overflow-y-auto grow">
              {loading && groups.length === 0 && <div className="p-4 text-sm text-stone-500">Memuat...</div>}
              {groups.map(g => (
                <div
                  key={g.id}
                  className={"p-4 flex justify-between items-center transition-colors cursor-pointer border-l-4 " + (selectedGroup?.id === g.id ? "bg-teal-50 border-teal" : "hover:bg-stone-50 border-transparent")}
                  onClick={() => setSelectedGroup(g)}
                >
                  <div>
                    <div className={"font-bold " + (selectedGroup?.id === g.id ? "text-teal-800" : "text-stone-800")}>{g.name}</div>
                    <div className="text-xs text-stone-500">{g.slug}</div>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 text-stone-400 hover:text-teal-600 bg-white rounded-lg border border-stone-200 shadow-sm" onClick={(e) => { e.stopPropagation(); setForm(g); setSelectedGroup(g); }}><Icon name="Pencil" size={14} /></button>
                    <button className="p-2 text-stone-400 hover:text-red-500 bg-white rounded-lg border border-stone-200 shadow-sm" onClick={(e) => { e.stopPropagation(); handleDeleteGroup(g.id); }}><Icon name="Trash" size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-8">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 h-[850px] flex flex-col">
            <h3 className="text-xl font-fredoka font-bold text-stone-800 mb-2">Anggota Daerah</h3>
            {!selectedGroup && (
              <p className="text-sm text-amber-600 bg-amber-50 rounded-xl px-4 py-2.5 mb-4 border border-amber-200">
                Pilih kelompok di sebelah kiri untuk mulai mengelola anggotanya, atau buat kelompok baru terlebih dahulu.
              </p>
            )}
            {selectedGroup && (
              <p className="text-sm text-stone-500 mb-4">
                Pilih daerah yang termasuk ke dalam <strong>{selectedGroup.name}</strong>.
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
            <div className="border border-stone-200 rounded-xl overflow-y-auto bg-stone-50 p-2 grow">
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
