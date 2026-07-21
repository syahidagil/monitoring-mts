'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  ArrowLeft,
  Search,
  CheckCircle2,
  AlertCircle,
  User,
  Calendar,
  ChevronDown,
  X,
} from 'lucide-react'
import Link from 'next/link'

// ─── Types ────────────────────────────────────────────────────
type JenisSikap = 'POSITIF' | 'PELANGGARAN'

interface SiswaOption {
  id: number
  nama: string
  nis: string
  kelas: { nama: string }
}

interface FormState {
  tanggal: string
  jenisSikap: JenisSikap | ''
  siswaId: number | null
  siswaDisplay: string
  kategori: string
  keterangan: string
}

// ─── Konstanta Kategori ────────────────────────────────────────
const KATEGORI_MAP: Record<JenisSikap, string[]> = {
  POSITIF: [
    'Kedisiplinan',
    'Sosial',
    'Kebersihan',
    'Prestasi',
    'Ibadah',
    'Kreativitas',
    'Kepemimpinan',
  ],
  PELANGGARAN: [
    'Keterlambatan',
    'Atribut',
    'Gadget',
    'Kekerasan',
    'Ketidakjujuran',
    'Kebersihan',
    'Ketertiban',
  ],
}

// ─── Komponen Utama ───────────────────────────────────────────
export default function TambahSikapPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // Form state
  const [form, setForm] = useState<FormState>({
    tanggal: new Date().toISOString().split('T')[0],
    jenisSikap: '',
    siswaId: null,
    siswaDisplay: '',
    kategori: '',
    keterangan: '',
  })

  // UI state
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [submitMessage, setSubmitMessage] = useState('')
  const [showSiswaDropdown, setShowSiswaDropdown] = useState(false)
  const [siswaSearch, setSiswaSearch] = useState('')
  const [siswaOptions, setSiswaOptions] = useState<SiswaOption[]>([])
  const [isSearching, setIsSearching] = useState(false)

  // Info guru dari session
  const guruNama = session?.user?.name ?? 'Guru'
  const semesterAktif = 'Semester Ganjil 2025/2026' // ambil dari context/DB

  // ─── Search Siswa (debounce) ──────────────────────────────
  useEffect(() => {
    if (siswaSearch.length < 2) {
      setSiswaOptions([])
      return
    }
    const timeout = setTimeout(async () => {
      setIsSearching(true)
      try {
        // Panggil server action atau API
        const res = await fetch(`/api/guru/siswa-search?q=${siswaSearch}`)
        const data = await res.json()
        setSiswaOptions(data)
      } catch {
        setSiswaOptions([])
      } finally {
        setIsSearching(false)
      }
    }, 300)
    return () => clearTimeout(timeout)
  }, [siswaSearch])

  // ─── Handlers ─────────────────────────────────────────────
  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: undefined }))
  }

  function handleJenisSikap(jenis: JenisSikap) {
    setField('jenisSikap', jenis)
    setField('kategori', '') // reset kategori saat ganti jenis
  }

  function handlePilihSiswa(siswa: SiswaOption) {
    setField('siswaId', siswa.id)
    setField('siswaDisplay', `${siswa.nama} - ${siswa.nis} - ${siswa.kelas.nama}`)
    setSiswaSearch('')
    setShowSiswaDropdown(false)
  }

  function handleClearSiswa() {
    setField('siswaId', null)
    setField('siswaDisplay', '')
    setSiswaSearch('')
  }

  function validate(): boolean {
    const newErrors: typeof errors = {}
    if (!form.tanggal) newErrors.tanggal = 'Tanggal kejadian wajib diisi'
    if (!form.jenisSikap) newErrors.jenisSikap = 'Pilih kategori perilaku'
    if (!form.siswaId) newErrors.siswaId = 'Pilih siswa terlebih dahulu'
    if (!form.kategori) newErrors.kategori = 'Pilih jenis kategori'
    if (form.keterangan.trim().length < 10)
      newErrors.keterangan = 'Keterangan minimal 10 karakter'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    startTransition(async () => {
      try {
        const res = await fetch('/api/guru/sikap', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            siswaId: form.siswaId,
            tanggal: form.tanggal,
            jenisSikap: form.jenisSikap,
            kategori: form.kategori,
            keterangan: form.keterangan,
          }),
        })
        const result = await res.json()
        if (result.success) {
          setSubmitStatus('success')
          setSubmitMessage('Catatan sikap berhasil disimpan!')
          setTimeout(() => router.push('/guru/sikap'), 1500)
        } else {
          setSubmitStatus('error')
          setSubmitMessage(result.message || 'Gagal menyimpan catatan sikap')
        }
      } catch {
        setSubmitStatus('error')
        setSubmitMessage('Terjadi kesalahan. Coba lagi.')
      }
    })
  }

  // ─── Render ───────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Topbar ── */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <Search size={16} />
          <input
            type="text"
            placeholder="Cari menu atau data siswa..."
            className="bg-gray-100 rounded-lg px-3 py-1.5 text-sm w-64 outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-800">{guruNama}</p>
            <p className="text-xs text-gray-500">Guru</p>
          </div>
          <div className="w-9 h-9 bg-green-700 rounded-full flex items-center justify-center text-white font-bold text-sm">
            {guruNama.charAt(0)}
          </div>
        </div>
      </div>

      {/* ── Konten ── */}
      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Tambah Catatan Sikap Siswa
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Input pencatatan perilaku positif maupun pelanggaran siswa secara real-time.
            </p>
          </div>
          <Link
            href="/guru/sikap"
            className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg px-3 py-2 bg-white hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={15} />
            Kembali
          </Link>
        </div>

        {/* Alert sukses / error */}
        {submitStatus === 'success' && (
          <div className="mb-5 flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
            <CheckCircle2 size={18} className="text-green-600 shrink-0" />
            <p className="text-sm text-green-700 font-medium">{submitMessage}</p>
          </div>
        )}
        {submitStatus === 'error' && (
          <div className="mb-5 flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <AlertCircle size={18} className="text-red-500 shrink-0" />
            <p className="text-sm text-red-600 font-medium">{submitMessage}</p>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">

          {/* Info Bar: Pelapor & Periode */}
          <div className="grid grid-cols-2 gap-4 mb-7 p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center">
                <User size={17} className="text-green-700" />
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">
                  Pelapor
                </p>
                <p className="text-sm font-semibold text-gray-800">
                  {guruNama} (Guru)
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center">
                <Calendar size={17} className="text-blue-700" />
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">
                  Periode
                </p>
                <p className="text-sm font-semibold text-gray-800">{semesterAktif}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Baris 1: Tanggal + Kategori Perilaku */}
            <div className="grid grid-cols-2 gap-5">

              {/* Tanggal Kejadian */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Tanggal Kejadian <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={form.tanggal}
                  onChange={e => setField('tanggal', e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition-colors
                    focus:ring-2 focus:ring-green-500 focus:border-green-500
                    ${errors.tanggal ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                />
                <p className="text-xs text-gray-400 mt-1">Format: DD/MM/YYYY</p>
                {errors.tanggal && (
                  <p className="text-xs text-red-500 mt-1">{errors.tanggal}</p>
                )}
              </div>

              {/* Kategori Perilaku */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Kategori Perilaku <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {/* Tombol Positif */}
                  <button
                    type="button"
                    onClick={() => handleJenisSikap('POSITIF')}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all
                      ${form.jenisSikap === 'POSITIF'
                        ? 'border-green-700 bg-green-700 text-white shadow-sm'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-green-400 hover:bg-green-50'
                      }`}
                  >
                    <span className="text-base">＋</span> Positif
                  </button>
                  {/* Tombol Pelanggaran */}
                  <button
                    type="button"
                    onClick={() => handleJenisSikap('PELANGGARAN')}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all
                      ${form.jenisSikap === 'PELANGGARAN'
                        ? 'border-red-600 bg-red-600 text-white shadow-sm'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-red-400 hover:bg-red-50'
                      }`}
                  >
                    <AlertCircle size={15} /> Pelanggaran
                  </button>
                </div>
                {errors.jenisSikap && (
                  <p className="text-xs text-red-500 mt-1">{errors.jenisSikap}</p>
                )}
              </div>
            </div>

            {/* Nama Siswa - Kelas (searchable dropdown) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Nama Siswa - Kelas <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                {form.siswaId ? (
                  /* Siswa sudah dipilih — tampil sebagai chip */
                  <div className={`flex items-center justify-between border-2 rounded-xl px-4 py-2.5
                    ${errors.siswaId ? 'border-red-400 bg-red-50' : 'border-green-500 bg-green-50'}`}>
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-green-700" />
                      <span className="text-sm font-medium text-green-800">
                        {form.siswaDisplay}
                      </span>
                    </div>
                    <button type="button" onClick={handleClearSiswa}>
                      <X size={16} className="text-gray-400 hover:text-gray-600" />
                    </button>
                  </div>
                ) : (
                  /* Input search */}
                  <div className={`flex items-center border rounded-xl px-4 py-2.5 gap-2
                    ${errors.siswaId ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'}
                    focus-within:ring-2 focus-within:ring-green-500 focus-within:border-green-500`}>
                    <User size={16} className="text-gray-400 shrink-0" />
                    <input
                      type="text"
                      value={siswaSearch}
                      onChange={e => {
                        setSiswaSearch(e.target.value)
                        setShowSiswaDropdown(true)
                      }}
                      onFocus={() => setShowSiswaDropdown(true)}
                      placeholder="Pilih atau cari nama siswa..."
                      className="flex-1 text-sm outline-none bg-transparent"
                    />
                    <ChevronDown size={16} className="text-gray-400 shrink-0" />
                  </div>
                )}

                {/* Dropdown hasil pencarian */}
                {showSiswaDropdown && !form.siswaId && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-52 overflow-y-auto">
                    {isSearching ? (
                      <div className="px-4 py-3 text-sm text-gray-400 text-center">
                        Mencari...
                      </div>
                    ) : siswaSearch.length < 2 ? (
                      <div className="px-4 py-3 text-sm text-gray-400 text-center">
                        Ketik minimal 2 karakter untuk mencari
                      </div>
                    ) : siswaOptions.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-gray-400 text-center">
                        Siswa tidak ditemukan
                      </div>
                    ) : (
                      siswaOptions.map(siswa => (
                        <button
                          key={siswa.id}
                          type="button"
                          onClick={() => handlePilihSiswa(siswa)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-green-50 text-left transition-colors"
                        >
                          <div className="w-7 h-7 bg-green-700 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {siswa.nama.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800">{siswa.nama}</p>
                            <p className="text-xs text-gray-500">
                              {siswa.nis} · Kelas {siswa.kelas.nama}
                            </p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
              {errors.siswaId && (
                <p className="text-xs text-red-500 mt-1">{errors.siswaId}</p>
              )}

              {/* Klik di luar tutup dropdown */}
              {showSiswaDropdown && (
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowSiswaDropdown(false)}
                />
              )}
            </div>

            {/* Pilih Kategori (muncul setelah jenis dipilih) */}
            {form.jenisSikap && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Jenis Kategori <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {KATEGORI_MAP[form.jenisSikap].map(kat => (
                    <button
                      key={kat}
                      type="button"
                      onClick={() => setField('kategori', kat)}
                      className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all
                        ${form.kategori === kat
                          ? form.jenisSikap === 'POSITIF'
                            ? 'bg-green-700 text-white border-green-700'
                            : 'bg-red-600 text-white border-red-600'
                          : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                        }`}
                    >
                      {kat}
                    </button>
                  ))}
                </div>
                {errors.kategori && (
                  <p className="text-xs text-red-500 mt-1">{errors.kategori}</p>
                )}
              </div>
            )}

            {/* Keterangan Detail */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Keterangan Detail <span className="text-red-500">*</span>
              </label>
              <textarea
                value={form.keterangan}
                onChange={e => setField('keterangan', e.target.value)}
                rows={5}
                placeholder="Jelaskan secara detail kejadian atau perilaku yang diobservasi..."
                className={`w-full border rounded-xl px-4 py-3 text-sm outline-none resize-none transition-colors
                  focus:ring-2 focus:ring-green-500 focus:border-green-500
                  ${errors.keterangan ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
              />
              <div className="flex items-start justify-between mt-1">
                <p className="text-xs text-gray-400">
                  Tuliskan kronologi singkat, waktu spesifik, dan dampak perilaku tersebut.
                </p>
                <p className={`text-xs shrink-0 ${form.keterangan.length < 10 ? 'text-gray-400' : 'text-green-600'}`}>
                  {form.keterangan.length}/500
                </p>
              </div>
              {errors.keterangan && (
                <p className="text-xs text-red-500 mt-0.5">{errors.keterangan}</p>
              )}
            </div>

            {/* Tombol Aksi */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
              <Link
                href="/guru/sikap"
                className="px-5 py-2.5 text-sm font-medium text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Batal
              </Link>
              <button
                type="submit"
                disabled={isPending || submitStatus === 'success'}
                className="flex items-center gap-2 px-6 py-2.5 bg-green-800 hover:bg-green-900 disabled:bg-green-400
                  text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
              >
                {isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    Simpan Data
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}