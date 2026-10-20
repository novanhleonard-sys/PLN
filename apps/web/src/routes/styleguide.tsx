import { useState } from 'react';
import { Button } from '../ui/basic/Button';
import { Chip } from '../ui/basic/Chip';
import { Badge, Card } from '../ui/basic/BadgeCard';
import { Input } from '../ui/basic/Input';

import { Stepper } from '../ui/basic/Stepper';
import { SegmentedControl } from '../ui/basic/SegmentedControl';
import { ProgressBar, AvatarButton, MapStyleToggle, MapPin } from '../ui/basic/Misc';
import { Toast } from '../ui/basic/Toast';
import { Sheet } from '../ui/layers/Sheet';
import { Modal } from '../ui/layers/Modal';
import { SidePanel } from '../ui/layers/SidePanel';
import { Icon } from '../ui/basic/Icon';

export default function Styleguide() {
  const [stepperVal, setStepperVal] = useState(6);
  const [segVal, setSegVal] = useState('Baca');
  const [mapStyle, setMapStyle] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);

  return (
    <div className="min-h-screen bg-cream font-nunito text-text-main pb-32">
      <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-12">
        <header>
          <h1 className="text-3xl font-fredoka text-teal mb-2">Design System / Styleguide</h1>
          <p className="text-text-muted">Peta Legenda Nusantara (B0.5 - Gabungan)</p>
        </header>

        {/* Form & Controls */}
        <section className="space-y-6">
          <h2 className="text-xl font-fredoka">Form & Kontrol</h2>
          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* Kiri: Inputs (Dari Revisi 1) */}
            <div className="space-y-4">
              <Input label="Nama Tampilan" placeholder="Masukkan nama..." leftIcon="User" />
              <Input label="Kata Sandi" type="password" rightIcon="Eye" defaultValue="rahasia" />
              <Input label="Error State" error="Email tidak valid" defaultValue="salah@email" />
            </div>
            {/* Kanan: Toggles & Steppers (Dari Revisi 2) */}
            <div className="space-y-6 w-full max-w-sm">
              <SegmentedControl 
                options={['Baca', 'Dongeng']} 
                value={segVal} 
                onChange={setSegVal} 
              />
              <Stepper 
                value={stepperVal} 
                onChange={setStepperVal} 
                label="tahun"
                min={1} max={12}
              />
              <ProgressBar progress={40} label="Halaman 4 dari 10" />
            </div>
          </div>
        </section>

        {/* Map Pins */}
        <section className="space-y-4">
          <h2 className="text-xl font-fredoka">Pin Lokasi Peta</h2>
          <div className="flex flex-wrap gap-8 items-end p-6 bg-ocean/20 rounded-2xl border border-teal/20">
            <MapPin type="legenda" title="Malin Kundang" />
            <MapPin type="mite" title="Nyi Roro Kidul" imageUrl="https://picsum.photos/id/1018/150/150" />
            <MapPin type="fabel" title="Kancil" imageUrl="https://picsum.photos/id/237/150/150" />
            <MapPin type="dongeng" title="Timun Mas" />
          </div>
        </section>

        {/* Cards & Misc */}
        <section className="space-y-4">
          <h2 className="text-xl font-fredoka">Cards & Lainnya</h2>
          <div className="flex flex-wrap gap-6 items-start">
            <Card className="w-64 p-4 space-y-3">
              <div className="w-full h-32 bg-ocean rounded-xl flex items-center justify-center text-teal">
                <Icon name="Image" size={32} />
              </div>
              <h3 className="font-fredoka text-lg">Sangkuriang</h3>
              <ProgressBar progress={100} label="Selesai" />
            </Card>

            <div className="flex gap-4">
              <AvatarButton initials="BR" />
              <MapStyleToggle isPainting={mapStyle} onChange={setMapStyle} />
            </div>
          </div>
        </section>

        {/* Lapisan */}
        <section className="space-y-4">
          <h2 className="text-xl font-fredoka">Lapisan (Overlays)</h2>
          <div className="flex flex-wrap gap-4">
            <Button onClick={() => setToastVisible(true)}>Tampilkan Toast</Button>
            <Button onClick={() => setSheetOpen(true)}>Buka Bottom Sheet</Button>
            <Button onClick={() => setModalOpen(true)}>Buka Modal</Button>
          </div>
        </section>
      </div>

      {/* Demo SidePanel & Map View (Desktop) */}
      <div className="mt-12 border-t border-border-light pt-8">
        <div className="max-w-7xl mx-auto px-4 md:px-8 mb-4 flex justify-between items-center">
          <h2 className="text-xl font-fredoka">Demo Interaksi Peta & Panel (Desktop)</h2>
          <Button variant="secondary" onClick={() => setPanelOpen(!panelOpen)}>
            {panelOpen ? 'Tutup Panel' : 'Pilih Cerita (Buka Panel)'}
          </Button>
        </div>
        
        {/* Mock Map Container */}
        <div className="h-[650px] w-full bg-ocean/30 border-y border-border-light flex overflow-hidden relative">
          
          <SidePanel isOpen={panelOpen}>
            <div className="flex flex-col h-full bg-cream">
              {/* Header Image as Storybook cover */}
              <div className="h-56 w-full bg-ocean relative shrink-0">
                <img src="https://picsum.photos/id/1018/800/400" alt="Cover" className="w-full h-full object-cover" />
                <button onClick={() => setPanelOpen(false)} className="absolute top-4 right-4 p-2 bg-white/80 hover:bg-white rounded-full text-text-main shadow-sm md:hidden">
                  <Icon name="X" size={20} />
                </button>
              </div>
              
              {/* Content area: like a book snippet */}
              <div className="p-6 flex flex-col bg-white rounded-t-3xl -mt-6 relative z-10 flex-1 border-t border-border-light">
                <div className="flex items-center gap-2 mb-3">
                  <Chip label="Mite" type="mite" />
                  <Badge>Jawa Barat</Badge>
                </div>
                
                <h3 className="text-3xl font-fredoka text-teal mb-3 leading-tight">Nyi Roro Kidul</h3>
                
                <p className="text-text-main text-read-mobile mb-5">
                  Kisah penguasa laut selatan Jawa yang penuh misteri. Sang putri berparas cantik yang menyingkir ke samudra karena fitnah, hingga akhirnya menjadi ratu gaib.
                </p>

                {/* S04 Metadata specs */}
                <div className="bg-cream/50 rounded-2xl p-4 border border-border-light/50 mb-6 space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-text-muted flex items-center gap-1"><Icon name="MapPin" size={16} /> Versi</span>
                    <span className="font-semibold">Sunda / Mataram</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-text-muted flex items-center gap-1"><Icon name="Clock" size={16} /> Durasi</span>
                    <span className="font-semibold">10 menit baca</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-text-muted flex items-center gap-1"><Icon name="Book" size={16} /> Sumber</span>
                    <span className="font-semibold text-teal">Babad Tanah Jawi</span>
                  </div>
                </div>
                
                {/* Actions: Side by side */}
                <div className="grid grid-cols-5 gap-3 pt-2">
                  <Button className="col-span-3" leftIcon="BookOpen">Lanjut Baca</Button>
                  <Button variant="secondary" className="col-span-2" leftIcon="Bookmark">Simpan</Button>
                </div>
              </div>
            </div>
          </SidePanel>

          {/* Map Area */}
          <div className="flex-1 relative">
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <div className="text-center">
                <Icon name="Map" size={64} className="mx-auto text-teal/40 mb-4" />
                <p className="text-teal font-fredoka text-xl">Area Peta Interaktif</p>
                <p className="text-text-muted mt-2">Di desktop, panel muncul di sebelah kiri tanpa menutupi seluruh peta.</p>
              </div>
              
              {/* Floating map pins */}
              <div className="absolute top-1/3 left-1/3">
                <MapPin type="mite" title="Nyi Roro Kidul" imageUrl="https://picsum.photos/id/1018/150/150" onClick={() => setPanelOpen(true)} className={panelOpen ? "scale-110" : ""} />
              </div>
              <div className="absolute top-1/2 right-1/4">
                <MapPin type="legenda" title="Malin Kundang" onClick={() => setPanelOpen(false)} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Toast 
        visible={toastVisible} 
        message="Cerita berhasil disimpan!" 
        type="success"
        onClose={() => setToastVisible(false)} 
      />

      <Sheet isOpen={sheetOpen} onClose={() => setSheetOpen(false)}>
        <h2 className="text-2xl font-fredoka mb-4">Bottom Sheet</h2>
        <p className="text-text-muted mb-6">Ini adalah contoh bottom sheet di mobile.</p>
        <Button className="w-full" onClick={() => setSheetOpen(false)}>Tutup Sheet</Button>
      </Sheet>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <h2 className="text-2xl font-fredoka mb-4 text-center">Modal Tengah</h2>
        <p className="text-text-muted mb-6 text-center">Ini adalah modal desktop.</p>
        <Button className="w-full" onClick={() => setModalOpen(false)}>Mengerti</Button>
      </Modal>
    </div>
  );
}

