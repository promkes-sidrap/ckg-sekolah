// script.js

document.addEventListener('DOMContentLoaded', () => {
    const appContainer = document.getElementById('app-container'); // Container utama
    const appContent = document.getElementById('app-content');
    const navSidebar = document.getElementById('nav-sidebar');
    const menuToggle = document.getElementById('menu-toggle');
    const onlineStatusDiv = document.getElementById('online-status');
    const modal = document.getElementById('myModal');
    const modalMessage = document.getElementById('modal-message');
    const closeButton = document.getElementsByClassName('close-button')[0];
    const modalConfirmButton = document.getElementById('modal-confirm-button'); // Tombol konfirmasi baru
    const modalCancelButton = document.getElementById('modal-cancel-button');   // Tombol batal baru
    let pendingDeleteAction = null; // Untuk menyimpan aksi yang menunggu konfirmasi

    // --- Data Kuesioner (Representasi sederhana) ---
    // Dalam aplikasi nyata, Anda akan mengurai file CSV Anda ke dalam struktur ini.
    // Untuk saat ini, saya akan secara manually mendefinisikan sebagian kecil darinya untuk demonstrasi.
    // Anda perlu memperluas ini berdasarkan konten lengkap dari file CSV Anda.
    const questionnaires = {
        sd: {
            title: "FORMULIR SKRINING KESEHATAN ANAK USIA SEKOLAH DAN REMAJA (SD)",
            sections: [
                {
                    id: "identitas",
                    title: "I. IDENTITAS PESERTA DIDIK",
                    questions: [
                        { name: "nama_sekolah", label: "Nama Sekolah", type: "school_dropdown", required: true }, // Tipe baru untuk dropdown sekolah
                        { name: "alamat_sekolah", label: "Alamat Sekolah", type: "text", required: true },
                        { name: "nama", label: "Nama Siswa", type: "text", required: true },
                        { name: "nik", label: "NIK", type: "text", required: true },
                        { name: "tempat_lahir", label: "Tempat Lahir", type: "text" }, // Dipisah dari tanggal lahir
                        { name: "tanggal_lahir", label: "Tanggal Lahir", type: "date" }, // Tipe date baru
                        { name: "umur", label: "Umur", type: "number", readonly: true, placeholder: "Otomatis terisi" }, // Umur otomatis
                        { name: "golongan_darah", label: "Golongan darah", type: "select", options: ["A", "B", "AB", "O", "Tidak Tahu"] }, // Diubah menjadi select
                        { name: "nama_orangtua", label: "Nama orangtua/wali", type: "text" },
                        { name: "kelas", label: "Kelas", type: "text", required: true }, // Diubah menjadi text untuk alphanumeric
                        { name: "jenis_kelamin", label: "Jenis kelamin", type: "radio", options: ["Laki-laki (L)", "Perempuan (P)"] },
                    ]
                },
                {
                    id: "tuberkulosis_sd",
                    title: "A. Skrining Tuberkulosis",
                    questions: [
                        { name: "batuk_2_minggu_sd", label: "Apakah saat ini anak anda sedang batuk- batuk lebih dari 2 minggu?", type: "radio", options: ["Ya", "Tidak"] },
                        { name: "kontak_tbc_sd", label: "Adakah orang yang sakit Tuberkulosis (TBC) tinggal satu rumah dengan anak ?", type: "radio", options: ["Ya", "Tidak"] },
                    ]
                },
                {
                    id: "diabetes_melitus_sd",
                    title: "B. Skrining Diabetes Melitus",
                    questions: [
                        { name: "sering_buang_air_kecil_malam_sd", label: "Apakah anak bapak/ibu sering terbangun pada malam hari untuk buang air kecil atau harus ke toilet lebih dari 2x per malam?", type: "radio", options: ["Ya", "Tidak"] },
                        { name: "sering_haus_sd", label: "Apakah anak bapak/ibu sering merasa haus meskipun sudah banyak minum?", type: "radio", options: ["Ya", "Tidak"] },
                        { name: "sering_lapar_sd", label: "Apakah anak bapak/ibu sering merasa sangat lapar dan makan lebih banyak dari biasanya?", type: "radio", options: ["Ya", "Tidak"] },
                        { name: "penurunan_berat_badan_nafsu_makan_meningkat_sd", label: "Apakah anak bapak/ibu tetap mengalami penurunan berat badan meskipun nafsu makan meningkat ?", type: "radio", options: ["Ya", "Tidak"] },
                        { name: "sering_mengompol_sd", label: "Apakah anak bapak/ibu kembali sering mengompol di malam hari, meskipun sebelumnya sudah bisa mengontrol buang air kecil?", type: "radio", options: ["Ya", "Tidak"] },
                        { name: "riwayat_keluarga_dm_sd", label: "Apakah bapak/ibu atau anggota keluarga lainnya (saudara kandung) yang pernah di diagnosis Kencing Manis oleh Dokter?", type: "radio", options: ["Ya", "Tidak"] },
                    ]
                },
                {
                    id: "riwayat_imunisasi_sd",
                    title: "C. Riwayat Imunisasi (Kelas 1)",
                    filter: (formData) => parseInt(formData.kelas) === 1,
                    questions: [
                        { name: "imunisasi_hepatitis_b_sd", label: "Imunisasi Hepatitis B pada usia 0-24 jam atau < 7 hari?", type: "radio", options: ["Ya", "Tidak"], default: "Ya" },
                        { name: "imunisasi_bcg_sd", label: "Imunisasi BCG pada usia 1 bulan?", type: "radio", options: ["Ya", "Tidak"], default: "Ya" },
                        { name: "imunisasi_polio_tetes_1_sd", label: "Imunisasi Polio Tetes (OPV) dosis ke-1 pada usia 1 bulan?", type: "radio", options: ["Ya", "Tidak"], default: "Ya" },
                        { name: "imunisasi_dpt_hb_hib_1_sd", label: "Imunisasi DPT-HB-Hib dosis ke-1 pada di usia 2 bulan?", type: "radio", options: ["Ya", "Tidak"], default: "Ya" },
                        { name: "imunisasi_polio_tetes_2_sd", label: "Imunisasi Polio Tetes (OPV) dosis ke-2 pada usia 2 bulan?", type: "radio", options: ["Ya", "Tidak"], default: "Ya" },
                        { name: "imunisasi_dpt_hb_hib_2_sd", label: "Imunisasi DPT-HB-Hib dosis ke-2 pada di usia 3 bulan?", type: "radio", options: ["Ya", "Tidak"], default: "Ya" },
                        { name: "imunisasi_polio_tetes_3_sd", label: "Imunisasi Polio Tetes (OPV) dosis ke-3 pada usia 3 bulan?", type: "radio", options: ["Ya", "Tidak"], default: "Ya" },
                        { name: "imunisasi_dpt_hb_hib_3_sd", label: "Imunisasi DPT-HB-Hib dosis ke-3 pada di usia 4 bulan?", type: "radio", options: ["Ya", "Tidak"], default: "Ya" },
                        { name: "imunisasi_polio_tetes_4_sd", label: "Imunisasi Polio Tetes (OPV) dosis ke-4 pada usia 4 bulan?", type: "radio", options: ["Ya", "Tidak"], default: "Ya" },
                        { name: "imunisasi_polio_suntik_sd", label: "Imunisasi Polio suntik (IPV) pada usia 4 bulan?", type: "radio", options: ["Ya", "Tidak"], default: "Ya" },
                        { name: "imunisasi_campak_rubela_1_sd", label: "Imunisasi Campak Rubela dosis ke-1 di usia 9 bulan?", type: "radio", options: ["Ya", "Tidak"], default: "Ya" },
                        { name: "imunisasi_campak_rubela_2_sd", label: "Imunisasi Campak Rubela dosis ke-2 (booster) di usia 18-24 bulan?", type: "radio", options: ["Ya", "Tidak"], default: "Ya" },
                        { name: "imunisasi_dpt_hb_hib_4_sd", label: "Imunisasi DPT-HB-Hib dosis ke-4 di usia 18-24 bulan?", type: "radio", options: ["Ya", "Tidak"], default: "Ya" },
                    ]
                },
                {
                    id: "kesehatan_reproduksi_putri_sd",
                    title: "D. Skrining Kesehatan Reproduksi (Putri Kelas 4-6 atau >10 th)",
                    filter: (formData) => formData.jenis_kelamin === 'Perempuan (P)' && (parseInt(formData.kelas) >= 4 && parseInt(formData.kelas) <= 6 || parseInt(formData.umur) >= 10),
                    questions: [
                        { name: "menstruasi_sd_putri", label: "Apakah sudah mengalami menstruasi?", type: "radio", options: ["Ya", "Tidak"] },
                        { name: "usia_menstruasi_pertama_sd_putri", label: "Pada usia berapa anda mengalami menstruasi pertama?", type: "text", dependsOn: { name: "menstruasi_sd_putri", value: "Ya" } }, // Pertanyaan bercabang
                        { name: "keputihan_sd_putri", label: "Apakah pernah mengalami keputihan?", type: "radio", options: ["Ya", "Tidak"] },
                        { name: "gatal_kemaluan_sd_putri", label: "Apakah pernah mengalami gatal-gatal di kemaluan?", type: "radio", options: ["Ya", "Tidak"] },
                    ]
                },
                {
                    id: "kesehatan_reproduksi_putra_sd",
                    title: "D. Skrining Kesehatan Reproduksi (Putra Kelas 4-6 atau >10 th)",
                    filter: (formData) => formData.jenis_kelamin === 'Laki-laki (L)' && (parseInt(formData.kelas) >= 4 && parseInt(formData.kelas) <= 6 || parseInt(formData.umur) >= 10),
                    questions: [
                        { name: "gatal_kencing_kuning_putra_sd", label: "Apakah mengalami gatal-gatal di kemaluan (alat kelamin) atau pernah kencing berwarna kuning kental seperti susu/nanah", type: "radio", options: ["Ya", "Tidak"] },
                        { name: "nyeri_bak_bab_putra_sd", label: "Apakah mengalami nyeri/ tidak nyaman saat Buang Air Kecil (BAK) atau Buang Air Besar (BAB)?", type: "radio", options: ["Ya", "Tidak"] },
                        { name: "luka_anus_dubur_putra_sd", label: "Apakah mengalami luka di anus atau dubur?", type: "radio", options: ["Ya", "Tidak"] },
                    ]
                },
                {
                    id: "perilaku_merokok_sd",
                    title: "E. Skrining Perilaku Merokok (Kelas 4-6)",
                    filter: (formData) => parseInt(formData.kelas) >= 4 && parseInt(formData.kelas) <= 6,
                    questions: [
                        { name: "merokok_setahun_terakhir_sd", label: "Apakah Anda merokok dalam setahun terakhir ini?", type: "radio", options: ["Ya", "Tidak"] },
                        { name: "jenis_rokok_sd", label: "Jika Perokok, jenis rokok apa yang dikonsumsi?", type: "checkbox", options: ["Rokok konvesional (Rokok Konvensional (rokok putih, filter, kretek,tingwe, dll))", "Rokok elektronik (vape, iqos, dll)"], dependsOn: { name: "merokok_setahun_terakhir_sd", value: "Ya" } },
                        { name: "jumlah_batang_sd", label: "Jika Perokok (rokok konvensional), biasanya, berapa batang rokok yang Anda hisap dalam sehari?", type: "number", placeholder: ".......... batang / hari", dependsOn: { name: "merokok_setahun_terakhir_sd", value: "Ya" } },
                        { name: "tahun_merokok_sd", label: "JIka Perokok, sudah berapa tahun Anda merokok?", type: "number", placeholder: ".......... tahun", dependsOn: { name: "merokok_setahun_terakhir_sd", value: "Ya" } },
                        { name: "terpapar_asap_rokok_sd", label: "Jika Bukan Perokok, Apakah Anda terpapar asap rokok atau menghirup asap rokok dari orang lain dalam sebulan terakhir?", type: "radio", options: ["Ya", "Tidak"], dependsOn: { name: "merokok_setahun_terakhir_sd", value: "Tidak" } },
                    ]
                },
                {
                    id: "hepatitis_b_sd",
                    title: "F. Skrining Hepatitis B",
                    questions: [
                        { name: "tes_hepatitis_b_positif_sd", label: "Apakah pernah menjalani tes untuk Hepatitis B dan mendapatkan hasil positif?", type: "radio", options: ["Ya", "Tidak"] },
                        { name: "keluarga_idap_hepatitis_sd", label: "Apakah memiliki ibu kandung atau saudara sekandung yang mengidap hepatitis?", type: "radio", options: ["Ya", "Tidak"] },
                        { name: "sedang_transfusi_darah_sd", label: "Apakah saat ini sedang transfusi darah atau pernah menerima transfusi darah?", type: "radio", options: ["Ya", "Tidak"] },
                        { name: "sedang_cuci_darah_sd", label: "Apakah sedang menjalani cuci darah (hemodialisa) atau pernah memiliki Riwayat cuci darah?", type: "radio", options: ["Ya", "Tidak"] },
                    ]
                },
                {
                    id: "kebugaran_sd",
                    title: "G. Skrining Kebugaran (Kelas 4-6)",
                    filter: (formData) => parseInt(formData.kelas) >= 4 && parseInt(formData.kelas) <= 6,
                    questions: [
                        { name: "masalah_tulang_sendi_sd", label: "Apakah dokter pernah menyatakan bahwa anda memiliki masalah pada tulang dan sendi seperti radang sendi, dan hanya bisa melakukan aktivitas fisik seperti anjuran dokter?", type: "radio", options: ["Ya", "Tidak"] },
                        { name: "masalah_jantung_sd", label: "Apakah dokter pernah menyatakan bahwa anda memiliki masalah pada jantung dan bahwa anda hanya bisa melakukan aktivitas fisik sesuai anjuran dokter?", type: "radio", options: ["Ya", "Tidak"] },
                        { name: "asma_latihan_fisik_sd", label: "Apakah anda menderita asma atau pernah terserang asma saat melakukan latihan fisik?", type: "radio", options: ["Ya", "Tidak"] },
                        { name: "kehilangan_kesadaran_sakit_kepala_parah_sd", label: "Apakah anda pernah kehilangan kesadaran, sakit kepala parah atau pingsan karena aktivitas berat dalam 1 bulan terakhir?", type: "radio", options: ["Ya", "Tidak"] },
                    ]
                },
                {
                    id: "aktivitas_fisik_sd",
                    title: "H. Skrining Tingkat Aktivitas Fisik (Kelas 4-6)",
                    filter: (formData) => parseInt(formData.kelas) >= 4 && parseInt(formData.kelas) <= 6,
                    questions: [
                        { name: "hari_aktif_fisik_7_hari_sd", label: "Dalam 7 hari terakhir, berapa hari anak anda aktif secara fisik dalam waktu total selama minimal 60 menit sehari?", type: "number" },
                        { name: "hari_aktif_fisik_seminggu_biasanya_sd", label: "Biasanya dalam satu minggu, berapa hari anak anda aktif secara fisik dalam waktu total selama minimal 60 menit sehari?", type: "number" },
                    ]
                },
                {
                    id: "kesehatan_jiwa_skala_a_sd_1_3",
                    title: "I. Skrining Kesehatan Jiwa Kelas 1-3 (Usia 7-9 Tahun) - Skala A",
                    filter: (formData) => parseInt(formData.umur) >= 7 && parseInt(formData.umur) <= 9,
                    questions: [
                        { name: "khawatir_tidak_tenang_sd_1_3", label: "Dalam 2 minggu terakhir, anak sering merasa khawatir atau tidak tenang, tegang, deg-degan dan gelisah terutama terhadap hal-hal negatif atau yang belum tentu terjadi", type: "radio", options: ["Ya", "Tidak"] },
                        { name: "berpikir_berlebihan_sd_1_3", label: "Dalam 2 minggu terakhir, anak berpikir berlebihan dan tidak bisa mengendalikan diri, terutama terhadap hal-hal negatif atau yang belum tentu terjadi", type: "radio", options: ["Ya", "Tidak"] },
                        { name: "sulit_tidur_konsentrasi_sd_1_3", label: "Dalam 2 minggu terakhir, anak sulit tidur dan berkonsentrasi terutama saat memikirkan hal-hal negative yang belum tentu terjadi", type: "radio", options: ["Ya", "Tidak"] },
                    ]
                },
                {
                    id: "kesehatan_jiwa_skala_b_sd_1_3",
                    title: "I. Skrining Kesehatan Jiwa Kelas 1-3 (Usia 7-9 Tahun) - Skala B",
                    filter: (formData) => parseInt(formData.umur) >= 7 && parseInt(formData.umur) <= 9,
                    questions: [
                        { name: "sedih_tertekan_sd_1_3", label: "Dalam 2 minggu terakhir, anak sering merasa sedih atau tertekan padahal tidak ada penyebab yang jelas", type: "radio", options: ["Ya", "Tidak"] },
                        { name: "tidak_tertarik_kegiatan_sd_1_3", label: "Dalam 2 minggu terakhir, anak tidak tertarik lagi dengan kegiatan atau hal-hal yang biasanya dia suka", type: "radio", options: ["Ya", "Tidak"] },
                        { name: "capek_sulit_tidur_fokus_sd_1_3", label: "Dalam 2 minggu terakhir, anak merasa sering capek, sulit tidur, dan sulit fokus saat belajar atau melakukan kegiatan", type: "radio", options: ["Ya", "Tidak"] },
                    ]
                },
                {
                    id: "kesehatan_jiwa_skala_a_sd_7_9",
                    title: "I. Skrining Kesehatan Jiwa Kelas 7-9 (Usia 10-18 Tahun) - Skala A",
                    filter: (formData) => parseInt(formData.umur) >= 10 && parseInt(formData.umur) <= 18,
                    questions: [
                        { name: "khawatir_tidak_tenang_sd_7_9", label: "Dalam 2 minggu terakhir, Saya sering merasa khawatir atau tidak tenang, tegang, deg-degan dan gelisah terutama terhadap hal-hal negatif atau yang belum tentu terjadi", type: "radio", options: ["Ya", "Tidak"] },
                        { name: "berpikir_berlebihan_sd_7_9", label: "Dalam 2 minggu terakhir, Saya berpikir berlebihan dan tidak bisa mengendalikan diri, terutama terhadap hal-hal negatif atau yang belum tentu terjadi", type: "radio", options: ["Ya", "Tidak"] },
                        { name: "sulit_tidur_konsentrasi_sd_7_9", label: "Dalam 2 minggu terakhir, Saya sulit tidur dan berkonsentrasi terutama saat memikirkan hal-hal negatif yang belum tentu terjadi", type: "radio", options: ["Ya", "Tidak"] },
                    ]
                },
                {
                    id: "kesehatan_jiwa_skala_b_sd_7_9",
                    title: "I. Skrining Kesehatan Jiwa Kelas 7-9 (Usia 10-18 Tahun) - Skala B",
                    filter: (formData) => parseInt(formData.umur) >= 10 && parseInt(formData.umur) <= 18,
                    questions: [
                        { name: "sedih_tertekan_sd_7_9", label: "Dalam 2 minggu terakhir, Saya sering merasa sedih atau tertekan padahal tidak ada penyebab yang jelas", type: "radio", options: ["Ya", "Tidak"] },
                        { name: "tidak_tertarik_kegiatan_sd_7_9", label: "Dalam 2 minggu terakhir, Saya tidak tertarik lagi dengan kegiatan atau hal-hal yang biasanya saya suka", type: "radio", options: ["Ya", "Tidak"] },
                        { name: "capek_sulit_tidur_fokus_sd_7_9", label: "Dalam 2 minggu terakhir, Saya merasa sering capek, sulit tidur, dan sulit fokus saat belajar atau melakukan kegiatan", type: "radio", options: ["Ya", "Tidak"] },
                    ]
                },
                {
                    id: "kusta_sd",
                    title: "L. Skrining Kusta",
                    questions: [
                        { name: "bercak_kulit_putih_merah_kusta_sd", label: "Apakah ada bercak kulit putih atau merah?", type: "radio", options: ["Ya", "Tidak"] },
                        { name: "bercak_kulit_mati_rasa_kebal_sd", label: "Apakah bercak kulit itu mati rasa atau kebal?", type: "radio", options: ["Ya", "Tidak"] },
                        { name: "diagnosis_kusta_sd", label: "Bila keduanya ya, menunjukkan diagnosis kusta; Bila bercak mati rasa <5 type PB sedangkan > 5 type MB", type: "text", readonly: true, placeholder: "Diisi oleh Petugas", dependsOn: { name: "bercak_kulit_putih_merah_kusta_sd", value: "Ya" } }, // Bercabang
                    ]
                },
                {
                    id: "frambusia_sd",
                    title: "L. Skrining Frambusia",
                    questions: [
                        { name: "ada_koreng_frambusia_sd", label: "Apakah ada koreng?", type: "radio", options: ["Ya", "Tidak"] },
                        { name: "koreng_bukan_akibat_luka_sd", label: "Apakah koreng bukan akibat luka (benturan, jatuh) ?", type: "radio", options: ["Ya", "Tidak"], dependsOn: { name: "ada_koreng_frambusia_sd", value: "Ya" } }, // Bercabang
                        { name: "hasil_rdt_treponema_frambusia_sd", label: "Bila keduanya ya, di daerah endemis, dilakukan pemeriksaan RDT treponema; hasil positif menunjukkan diagnosis Frambusia", type: "text", readonly: true, placeholder: "Diisi oleh Petugas", dependsOn: { name: "koreng_bukan_akibat_luka_sd", value: "Ya" } }, // Bercabang
                    ]
                },
                {
                    id: "skabies_sd",
                    title: "L. Skrining Skabies",
                    questions: [
                        { name: "ada_koreng_skabies_sd", label: "Apakah ada koreng?", type: "radio", options: ["Ya", "Tidak"] },
                        { name: "koreng_bergerombol_gatal_sd", label: "Apakah koreng bergerombol gatal?", type: "radio", options: ["Ya", "Tidak"], dependsOn: { name: "ada_koreng_skabies_sd", value: "Ya" } }, // Bercabang
                        { name: "diagnosis_skabies_sd", label: "Bila keduanya ya, menunjukkan diagnosis Skabies; Bila teman-sepermainan/seasrama juga menunjukkan hal sama, makin memperkuat diagnosis skabies", type: "text", readonly: true, placeholder: "Diisi oleh Petugas", dependsOn: { name: "koreng_bergerombol_gatal_sd", value: "Ya" } }, // Bercabang
                    ]
                },
                {
                    id: "malaria_sd",
                    title: "M. Skrining Malaria",
                    questions: [
                        { name: "demam_sakit_kepala_menggigil_sd", label: "Apakah saat ini anak anda sedang demam , sakit kepala atau menggigil?", type: "radio", options: ["Ya", "Tidak"] },
                        { name: "pernah_sakit_malaria_sd", label: "Apakah anak anda pernah sakit malaria? Apakah obatnya diminum sampai habis ?", type: "radio", options: ["Ya", "Tidak"], dependsOn: { name: "demam_sakit_kepala_menggigil_sd", value: "Ya" } }, // Bercabang
                        { name: "orang_sakit_malaria_di_wilayah_tinggal_sd", label: "Apakah ada orang sakit malaria di wilayah tempat tinggal (di rumah, saudara/tetangga di sekitar rumah)?", type: "radio", options: ["Ya", "Tidak"], dependsOn: { name: "demam_sakit_kepala_menggigil_sd", value: "Ya" } }, // Bercabang
                    ]
                }
            ]
        },
        smp: {
            title: "FORMULIR SKRINING KESEHATAN ANAK USIA SEKOLAH DAN REMAJA (SMP)",
            sections: [
                {
                    id: "identitas",
                    title: "I. IDENTITAS PESERTA DIDIK",
                    questions: [
                        { name: "nama_sekolah", label: "Nama Sekolah", type: "school_dropdown", required: true }, // Tipe baru untuk dropdown sekolah
                        { name: "alamat_sekolah", label: "Alamat Sekolah", type: "text", required: true },
                        { name: "nama", label: "Nama Siswa", type: "text", required: true },
                        { name: "nik", label: "NIK", type: "text", required: true },
                        { name: "tempat_lahir", label: "Tempat Lahir", type: "text" }, // Dipisah dari tanggal lahir
                        { name: "tanggal_lahir", label: "Tanggal Lahir", type: "date" }, // Tipe date baru
                        { name: "umur", label: "Umur", type: "number", readonly: true, placeholder: "Otomatis terisi" }, // Umur otomatis
                        { name: "golongan_darah", label: "Golongan darah", type: "select", options: ["A", "B", "AB", "O", "Tidak Tahu"] }, // Diubah menjadi select
                        { name: "nama_orangtua", label: "Nama orangtua/wali", type: "text" },
                        { name: "kelas", label: "Kelas", type: "text", required: true }, // Diubah menjadi text untuk alphanumeric
                        { name: "jenis_kelamin", label: "Jenis kelamin", type: "radio", options: ["Laki-laki (L)", "Perempuan (P)"] },
                    ]
                },
                {
                    id: "tuberkulosis_smp",
                    title: "A. Skrining Tuberkulosis",
                    questions: [
                        { name: "batuk_2_minggu_smp", label: "Mengalami batuk >2 minggu", type: "radio", options: ["Ya", "Tidak"] },
                        { name: "kontak_tbc_smp", label: "Apakah ada riwayat kontak serumah dengan pasien/penderita Tuberkulosis (TBC)?", type: "radio", options: ["Ya", "Tidak"] },
                    ]
                },
                {
                    id: "diabetes_smp",
                    title: "B. Skrining Diabetes Melitus (Kelas 8-9)",
                    filter: (formData) => parseInt(formData.kelas) >= 8 && parseInt(formData.kelas) <= 9,
                    questions: [
                        { name: "sering_buang_air_kecil_malam", label: "Apakah anda sering terbangun pada malam hari untuk buang air kecil atau harus ke toilet lebih dari 2x per malam?", type: "radio", options: ["Ya", "Tidak"] },
                        { name: "sering_haus", label: "Apakah anda sering merasa haus meskipun sudah banyak minum?", type: "radio", options: ["Ya", "Tidak"] },
                        { name: "sering_lapar", label: "Apakah anda sering merasa sangat lapar dan makan lebih banyak dari biasanya?", type: "radio", options: ["Ya", "Tidak"] },
                        { name: "penurunan_berat_badan_nafsu_makan_meningkat", label: "Apakah anda tetap mengalami penurunan berat badan meskipun nafsu makan meningkat ?", type: "radio", options: ["Ya", "Tidak"] },
                        { name: "sering_mengompol", label: "Apakah anda sering mengompol hampir setiap malam dalam beberapa minggu terakhir ?", type: "radio", options: ["Ya", "Tidak"] },
                        { name: "riwayat_keluarga_dm", label: "Apakah anda mempunyai bapak/ibu atau anggota keluarga lainnya (saudara kandung) yang pernah di diagnosis Kencing Manis oleh Dokter?", type: "radio", options: ["Ya", "Tidak"] },
                    ]
                },
                {
                    id: "imunisasi_hpv_smp",
                    title: "C. Riwayat Imunisasi HPV (kelas 9 putri)",
                    filter: (formData) => formData.jenis_kelamin === 'Perempuan (P)' && parseInt(formData.kelas) === 9,
                    questions: [
                        { name: "imunisasi_hpv", label: "Apakah sudah pernah mendapatkan imunisasi HPV minimum 1 dosis?", type: "radio", options: ["Ya", "Tidak"], default: "Ya" },
                    ]
                },
                {
                    id: "reproduksi_putri_smp",
                    title: "D. Skrining Kesehatan Reproduksi (Putri)",
                    questions: [
                        { name: "menstruasi", label: "Apakah sudah mengalami menstruasi?", type: "radio", options: ["Ya", "Tidak"] },
                        { name: "usia_menstruasi_pertama", label: "Pada usia berapa anda mengalami menstruasi pertama?", type: "text", dependsOn: { name: "menstruasi", value: "Ya" } },
                        { name: "keputihan", label: "Apakah pernah mengalami keputihan?", type: "radio", options: ["Ya", "Tidak"] },
                        { name: "gatal_kemaluan_putri", label: "Apakah pernah mengalami gatal-gatal di kemaluan?", type: "radio", options: ["Ya", "Tidak"] },
                    ]
                },
                {
                    id: "reproduksi_putra_smp",
                    title: "D. Skrining Kesehatan Reproduksi (Putra)",
                    questions: [
                        { name: "gatal_kencing_kuning_putra", label: "Apakah mengalami gatal-gatal di kemaluan (alat kelamin) atau pernah kencing berwarna kuning kental seperti susu/nanah", type: "radio", options: ["Ya", "Tidak"] },
                        { name: "nyeri_bak_bab_putra", label: "Apakah mengalami nyeri/ tidak nyaman saat Buang Air Kecil (BAK) atau Buang Air Besar (BAB)?", type: "radio", options: ["Ya", "Tidak"] },
                        { name: "luka_anus_dubur_putra", label: "Apakah mengalami luka di anus atau dubur?", type: "radio", options: ["Ya", "Tidak"] },
                    ]
                },
                {
                    id: "perilaku_merokok_smp",
                    title: "E. Skrining Perilaku Merokok",
                    questions: [
                        { name: "merokok_setahun_terakhir", label: "Apakah Anda merokok dalam setahun terakhir ini?", type: "radio", options: ["Ya", "Tidak"] },
                        { name: "jenis_rokok", label: "Jika Perokok, jenis rokok apa yang dikonsumsi?", type: "checkbox", options: ["Rokok konvesional (Rokok Konvensional (rokok putih, filter, kretek,tingwe, dll))", "Rokok elektronik (vape, iqos, dll)"], dependsOn: { name: "merokok_setahun_terakhir", value: "Ya" } },
                        { name: "jumlah_batang", label: "Jika Perokok (rokok konvensional), biasanya, berapa batang rokok yang Anda hisap dalam sehari?", type: "number", placeholder: ".......... batang / hari", dependsOn: { name: "merokok_setahun_terakhir", value: "Ya" } },
                        { name: "tahun_merokok", label: "JIka Perokok, sudah berapa tahun Anda merokok?", type: "number", placeholder: ".......... tahun", dependsOn: { name: "merokok_setahun_terakhir", value: "Ya" } },
                        { name: "terpapar_asap_rokok", label: "Jika Bukan Perokok, Apakah Anda terpapar asap rokok atau menghirup asap rokok dari orang lain dalam sebulan terakhir?", type: "radio", options: ["Ya", "Tidak"], dependsOn: { name: "merokok_setahun_terakhir", value: "Tidak" } },
                    ]
                },
                {
                    id: "hepatitis_b_c_smp",
                    title: "F. Skrining Hepatitis B dan C",
                    questions: [
                        { name: "tes_hepatitis_b_positif", label: "Apakah pernah menjalani tes untuk Hepatitis B dan mendapatkan hasil positif?", type: "radio", options: ["Ya", "Tidak"] },
                        { name: "keluarga_idap_hepatitis", label: "Apakah memiliki ibu kandung atau saudara sekandung yang mengidap hepatitis?", type: "radio", options: ["Ya", "Tidak"] },
                        { name: "sedang_transfusi_darah", label: "Apakah saat ini sedang transfusi darah atau pernah menerima transfusi darah?", type: "radio", options: ["Ya", "Tidak"] },
                        { name: "sedang_cuci_darah", label: "Apakah sedang menjalani cuci darah (hemodialisa) atau pernah memiliki Riwayat cuci darah?", type: "radio", options: ["Ya", "Tidak"] },
                        { name: "hubungan_intim_seksual", label: "Apakah pernah melakukan hubungan intim/seksual?", type: "radio", options: ["Ya", "Tidak"] },
                        { name: "penggunaan_narkoba_suntik", label: "Apakah pernah menggunakan narkoba, obat terlarang, atau bahan adiktif lainnya dengan cara disuntik?", type: "radio", options: ["Ya", "Tidak"] },
                        { name: "tes_hiv_positif", label: "Apakah pernah menjalani tes HIV dan hasilnya positif?", type: "radio", options: ["Ya", "Tidak"] },
                        { name: "pengobatan_hepatitis_c_tidak_sembuh", label: "Apakah pernah mendapatkan pengobatan Hepatitis C dan tidak sembuh?", type: "radio", options: ["Ya", "Tidak"] },
                    ]
                },
                {
                    id: "kebugaran_smp",
                    title: "G. Skrining Kebugaran",
                    questions: [
                        { name: "masalah_tulang_sendi", label: "Apakah dokter pernah menyatakan bahwa anda memiliki masalah pada tulang dan sendi seperti radang sendi, dan hanya bisa melakukan aktivitas fisik seperti anjuran dokter?", type: "radio", options: ["Ya", "Tidak"] },
                        { name: "masalah_jantung", label: "Apakah dokter pernah menyatakan bahwa anda memiliki masalah pada jantung dan bahwa anda hanya bisa melakukan aktivitas fisik sesuai anjuran dokter?", type: "radio", options: ["Ya", "Tidak"] },
                        { name: "asma_latihan_fisik", label: "Apakah anda menderita asma atau pernah terserang asma saat melakukan latihan fisik?", type: "radio", options: ["Ya", "Tidak"] },
                        { name: "kehilangan_kesadaran_sakit_kepala_parah", label: "Apakah anda pernah kehilangan kesadaran, sakit kepala parah atau pingsan karena aktivitas berat dalam 1 bulan terakhir?", type: "radio", options: ["Ya", "Tidak"] },
                    ]
                },
                {
                    id: "aktivitas_fisik_smp",
                    title: "H. Skrining Tingkat Aktivitas Fisik",
                    questions: [
                        { name: "hari_aktif_fisik_7_hari", label: "Dalam 7 hari terakhir, berapa hari anak anda aktif secara fisik dalam waktu total selama minimal 60 menit sehari?", type: "number" },
                        { name: "hari_aktif_fisik_seminggu_biasanya", label: "Biasanya dalam satu minggu, berapa hari anak anda aktif secara fisik dalam waktu total selama minimal 60 menit sehari?", type: "number" },
                    ]
                },
                {
                    id: "kesehatan_jiwa_skala_a_smp",
                    title: "I. Skrining Kesehatan Jiwa Kelas 7-9 (Usia 10-18 Tahun) - Skala A",
                    filter: (formData) => parseInt(formData.umur) >= 10 && parseInt(formData.umur) <= 18,
                    questions: [
                        { name: "khawatir_tidak_tenang", label: "Dalam 2 minggu terakhir, Saya sering merasa khawatir atau tidak tenang, tegang, deg-degan dan gelisah terutama terhadap hal-hal negatif atau yang belum tentu terjadi", type: "radio", options: ["Ya", "Tidak"] },
                        { name: "berpikir_berlebihan", label: "Dalam 2 minggu terakhir, Saya berpikir berlebihan dan tidak bisa mengendalikan diri, terutama terhadap hal-hal negatif atau yang belum tentu terjadi", type: "radio", options: ["Ya", "Tidak"] },
                        { name: "sulit_tidur_konsentrasi", label: "Dalam 2 minggu terakhir, Saya sulit tidur dan berkonsentrasi terutama saat memikirkan hal-hal negatif yang belum tentu terjadi", type: "radio", options: ["Ya", "Tidak"] },
                    ]
                },
                {
                    id: "kesehatan_jiwa_skala_b_smp",
                    title: "I. Skrining Kesehatan Jiwa Kelas 7-9 (Usia 10-18 Tahun) - Skala B",
                    filter: (formData) => parseInt(formData.umur) >= 10 && parseInt(formData.umur) <= 18,
                    questions: [
                        { name: "sedih_tertekan", label: "Dalam 2 minggu terakhir, Saya sering merasa sedih atau tertekan padahal tidak ada penyebab yang jelas", type: "radio", options: ["Ya", "Tidak"] },
                        { name: "tidak_tertarik_kegiatan", label: "Dalam 2 minggu terakhir, Saya tidak tertarik lagi dengan kegiatan atau hal-hal yang biasanya saya suka", type: "radio", options: ["Ya", "Tidak"] },
                        { name: "capek_sulit_tidur_fokus", label: "Dalam 2 minggu terakhir, Saya merasa sering capek, sulit tidur, dan sulit fokus saat belajar atau melakukan kegiatan", type: "radio", options: ["Ya", "Tidak"] },
                    ]
                },
                {
                    id: "thalasemia_smp",
                    title: "J. Skrining Thalasemia",
                    questions: [
                        { name: "anggota_keluarga_thalasemia_transfusi_rutin", label: "Apakah ada anggota keluarga kandung Anda dinyatakan menderita Talasemia, atau kelainan darah atau pernah menjalani transfusi darah secara rutin?", type: "radio", options: ["Ya", "Tidak"] },
                        { name: "anggota_keluarga_pembawa_sifat_thalasemia", label: "Apakah ada anggota keluarga kandung Anda dinyatakan sebagai pembawa sifat talasemia (mereka yang memiliki genetik yang tidak normal sehingga berpotensi menurunkan penyakit Talasemia)?", type: "radio", options: ["Ya", "Tidak"] },
                    ]
                },
                {
                    id: "frambusia_smp",
                    title: "K. Skrining Frambusia",
                    questions: [
                        { name: "ada_koreng_frambusia", label: "Apakah ada koreng?", type: "radio", options: ["Ya", "Tidak"] },
                        { name: "koreng_bukan_akibat_luka", label: "Apakah koreng bukan akibat luka (benturan, jatuh) ?", type: "radio", options: ["Ya", "Tidak"], dependsOn: { name: "ada_koreng_frambusia", value: "Ya" } },
                        { name: "hasil_rdt_treponema_frambusia", label: "Bila keduanya ya, di daerah endemis, dilakukan pemeriksaan RDT treponema; hasil positif menunjukkan diagnosis Frambusia", type: "text", readonly: true, placeholder: "Diisi oleh Petugas", dependsOn: { name: "koreng_bukan_akibat_luka", value: "Ya" } },
                    ]
                },
                {
                    id: "kusta_smp",
                    title: "L. Skrining Kusta",
                    questions: [
                        { name: "bercak_kulit_putih_merah_kusta", label: "Apakah ada bercak kulit putih atau merah?", type: "radio", options: ["Ya", "Tidak"] },
                        { name: "bercak_kulit_mati_rasa_kebal", label: "Apakah bercak kulit itu mati rasa atau kebal?", type: "radio", options: ["Ya", "Tidak"], dependsOn: { name: "bercak_kulit_putih_merah_kusta", value: "Ya" } },
                        { name: "diagnosis_kusta", label: "Bila keduanya ya, menunjukkan diagnosis Kusta; Bila bercak mati rasa <5 type PB sedangkan > 5 type MB", type: "text", readonly: true, placeholder: "Diisi oleh Petugas", dependsOn: { name: "bercak_kulit_mati_rasa_kebal", value: "Ya" } },
                    ]
                },
                {
                    id: "skabies_smp",
                    title: "M. Skrining Skabies",
                    questions: [
                        { name: "ada_koreng_skabies", label: "Apakah ada koreng?", type: "radio", options: ["Ya", "Tidak"] },
                        { name: "koreng_bergerombol_gatal", label: "Apakah koreng bergerombol gatal?", type: "radio", options: ["Ya", "Tidak"], dependsOn: { name: "ada_koreng_skabies", value: "Ya" } },
                        { name: "diagnosis_skabies", label: "Bila keduanya ya, menunjukkan diagnosis Skabies; Bila teman-sepermainan/seasrama juga menunjukkan hal sama, makin memperkuat diagnosis skabies", type: "text", readonly: true, placeholder: "Diisi oleh Petugas", dependsOn: { name: "koreng_bergerombol_gatal", value: "Ya" } },
                    ]
                },
                {
                    id: "malaria_smp",
                    title: "N. Skrining Malaria",
                    questions: [
                        { name: "rdt_malaria", label: "tanpa kuisioner langsung pemeriksaan RDT Malaria", type: "text", readonly: true, placeholder: "Diisi oleh Petugas" },
                    ]
                }
            ]
        },
        sma: {
            title: "FORMULIR SKRINING KESEHATAN ANAK USIA SEKOLAH DAN REMAJA (SMA)",
            sections: [
                {
                    id: "identitas",
                    title: "I. IDENTITAS PESERTA DIDIK",
                    questions: [
                        { name: "nama_sekolah", label: "Nama Sekolah", type: "school_dropdown", required: true }, // Tipe baru untuk dropdown sekolah
                        { name: "alamat_sekolah", label: "Alamat Sekolah", type: "text", required: true },
                        { name: "nama", label: "Nama Siswa", type: "text", required: true },
                        { name: "nik", label: "NIK", type: "text", required: true },
                        { name: "tempat_lahir", label: "Tempat Lahir", type: "text" }, // Dipisah dari tanggal lahir
                        { name: "tanggal_lahir", label: "Tanggal Lahir", type: "date" }, // Tipe date baru
                        { name: "umur", label: "Umur", type: "number", readonly: true, placeholder: "Otomatis terisi" }, // Umur otomatis
                        { name: "golongan_darah", label: "Golongan darah", type: "select", options: ["A", "B", "AB", "O", "Tidak Tahu"] }, // Diubah menjadi select
                        { name: "nama_orangtua", label: "Nama orangtua/wali", type: "text" },
                        { name: "kelas", label: "Kelas", type: "text", required: true }, // Diubah menjadi text untuk alphanumeric
                        { name: "jenis_kelamin", label: "Jenis kelamin", type: "radio", options: ["Laki-laki (L)", "Perempuan (P)"] },
                    ]
                },
                {
                    id: "tuberkulosis_sma",
                    title: "A. Skrining Tuberkulosis",
                    questions: [
                        { name: "batuk_2_minggu_sma", label: "Mengalami batuk >2 minggu", type: "radio", options: ["Ya", "Tidak"] },
                        { name: "kontak_tbc_sma", label: "Apakah ada riwayat kontak serumah dengan pasien/penderita Tuberkulosis (TBC)?", type: "radio", options: ["Ya", "Tidak"] },
                    ]
                },
                {
                    id: "kesehatan_reproduksi_putri_sma",
                    title: "B. Skrining Kesehatan Reproduksi (Putri)",
                    questions: [
                        { name: "menstruasi_sma_putri", label: "Apakah sudah mengalami menstruasi?", type: "radio", options: ["Ya", "Tidak"] },
                        { name: "usia_menstruasi_pertama_sma_putri", label: "Pada usia berapa anda mengalami menstruasi pertama?", type: "text", dependsOn: { name: "menstruasi_sma_putri", value: "Ya" } },
                        { name: "keputihan_sma_putri", label: "Apakah pernah mengalami keputihan?", type: "radio", options: ["Ya", "Tidak"] },
                        { name: "gatal_kemaluan_sma_putri", label: "Apakah pernah mengalami gatal-gatal di kemaluan?", type: "radio", options: ["Ya", "Tidak"] },
                    ]
                },
                {
                    id: "kesehatan_reproduksi_putra_sma",
                    title: "B. Skrining Kesehatan Reproduksi (Putra)",
                    questions: [
                        { name: "gatal_kencing_kuning_putra_sma", label: "Apakah mengalami gatal-gatal di kemaluan (alat kelamin) atau pernah kencing berwarna kuning kental seperti susu/nanah", type: "radio", options: ["Ya", "Tidak"] },
                        { name: "nyeri_bak_bab_putra_sma", label: "Apakah mengalami nyeri/ tidak nyaman saat Buang Air Kecil (BAK) atau Buang Air Besar (BAB)?", type: "radio", options: ["Ya", "Tidak"] },
                        { name: "luka_anus_dubur_putra_sma", label: "Apakah mengalami luka di anus atau dubur?", type: "radio", options: ["Ya", "Tidak"] },
                    ]
                },
                {
                    id: "perilaku_merokok_sma",
                    title: "C. Skrining Perilaku Merokok",
                    questions: [
                        { name: "merokok_setahun_terakhir_sma", label: "Apakah Anda merokok dalam setahun terakhir ini?", type: "radio", options: ["Ya", "Tidak"] },
                        { name: "jenis_rokok_sma", label: "Jika Perokok, jenis rokok apa yang dikonsumsi?", type: "checkbox", options: ["Rokok konvesional (Rokok Konvensional (rokok putih, filter, kretek,tingwe, dll))", "Rokok elektronik (vape, iqos, dll)"], dependsOn: { name: "merokok_setahun_terakhir_sma", value: "Ya" } },
                        { name: "jumlah_batang_sma", label: "Jika Perokok (rokok konvensional), biasanya, berapa batang rokok yang Anda hisap dalam sehari?", type: "number", placeholder: ".......... batang / hari", dependsOn: { name: "merokok_setahun_terakhir_sma", value: "Ya" } },
                        { name: "tahun_merokok_sma", label: "JIka Perokok, sudah berapa tahun Anda merokok?", type: "number", placeholder: ".......... tahun", dependsOn: { name: "merokok_setahun_terakhir_sma", value: "Ya" } },
                        { name: "terpapar_asap_rokok_sma", label: "Jika Bukan Perokok, Apakah Anda terpapar asap rokok atau menghirup asap rokok dari orang lain dalam sebulan terakhir?", type: "radio", options: ["Ya", "Tidak"], dependsOn: { name: "merokok_setahun_terakhir_sma", value: "Tidak" } },
                    ]
                },
                {
                    id: "hepatitis_b_c_sma",
                    title: "D. Skrining Hepatitis B dan C",
                    questions: [
                        { name: "tes_hepatitis_b_positif_sma", label: "Apakah pernah menjalani tes untuk Hepatitis B dan mendapatkan hasil positif?", type: "radio", options: ["Ya", "Tidak"] },
                        { name: "keluarga_idap_hepatitis_sma", label: "Apakah memiliki ibu kandung atau saudara sekandung yang mengidap hepatitis?", type: "radio", options: ["Ya", "Tidak"] },
                        { name: "sedang_transfusi_darah_sma", label: "Apakah saat ini sedang transfusi darah atau pernah menerima transfusi darah?", type: "radio", options: ["Ya", "Tidak"] },
                        { name: "sedang_cuci_darah_sma", label: "Apakah sedang menjalani cuci darah (hemodialisa) atau pernah memiliki Riwayat cuci darah?", type: "radio", options: ["Ya", "Tidak"] },
                        { name: "hubungan_intim_seksual_sma", label: "Apakah pernah melakukan hubungan intim/seksual?", type: "radio", options: ["Ya", "Tidak"] },
                        { name: "penggunaan_narkoba_suntik_sma", label: "Apakah pernah menggunakan narkoba, obat terlarang, atau bahan adiktif lainnya dengan cara disuntik?", type: "radio", options: ["Ya", "Tidak"] },
                        { name: "tes_hiv_positif_sma", label: "Apakah pernah menjalani tes HIV dan hasilnya positif?", type: "radio", options: ["Ya", "Tidak"] },
                        { name: "pengobatan_hepatitis_c_tidak_sembuh_sma", label: "Apakah pernah mendapatkan pengobatan Hepatitis C dan tidak sembuh?", type: "radio", options: ["Ya", "Tidak"] },
                    ]
                },
                {
                    id: "kebugaran_sma",
                    title: "E. Skrining Kebugaran",
                    questions: [
                        { name: "masalah_tulang_sendi_sma", label: "Apakah dokter pernah menyatakan bahwa anda memiliki masalah pada tulang dan sendi seperti radang sendi, dan hanya bisa melakukan aktivitas fisik seperti anjuran dokter?", type: "radio", options: ["Ya", "Tidak"] },
                        { name: "masalah_jantung_sma", label: "Apakah dokter pernah menyatakan bahwa anda memiliki masalah pada jantung dan bahwa anda hanya bisa melakukan aktivitas fisik sesuai anjuran dokter?", type: "radio", options: ["Ya", "Tidak"] },
                        { name: "asma_latihan_fisik_sma", label: "Apakah anda menderita asma atau pernah terserang asma saat melakukan latihan fisik?", type: "radio", options: ["Ya", "Tidak"] },
                        { name: "kehilangan_kesadaran_sakit_kepala_parah_sma", label: "Apakah anda pernah kehilangan kesadaran, sakit kepala parah atau pingsan karena aktivitas berat dalam 1 bulan terakhir?", type: "radio", options: ["Ya", "Tidak"] },
                    ]
                },
                {
                    id: "aktivitas_fisik_sma",
                    title: "F. Skrining Tingkat Aktivitas Fisik",
                    questions: [
                        { name: "hari_aktif_fisik_7_hari_sma", label: "Dalam 7 hari terakhir, berapa hari anak anda aktif secara fisik dalam waktu total selama minimal 60 menit sehari?", type: "number" },
                        { name: "hari_aktif_fisik_seminggu_biasanya_sma", label: "Biasanya dalam satu minggu, berapa hari anak anda aktif secara fisik dalam waktu total selama minimal 60 menit sehari?", type: "number" },
                    ]
                },
                {
                    id: "kesehatan_jiwa_skala_a_sma",
                    title: "G. Skrining Kesehatan Jiwa Kelas 7-9 (Usia 10-18 Tahun) - Skala A",
                    filter: (formData) => parseInt(formData.umur) >= 10 && parseInt(formData.umur) <= 18,
                    questions: [
                        { name: "khawatir_tidak_tenang_sma", label: "Dalam 2 minggu terakhir, Saya sering merasa khawatir atau tidak tenang, tegang, deg-degan dan gelisah terutama terhadap hal-hal negatif atau yang belum tentu terjadi", type: "radio", options: ["Ya", "Tidak"] },
                        { name: "berpikir_berlebihan_sma", label: "Dalam 2 minggu terakhir, Saya berpikir berlebihan dan tidak bisa mengendalikan diri, terutama terhadap hal-hal negatif atau yang belum tentu terjadi", type: "radio", options: ["Ya", "Tidak"] },
                        { name: "sulit_tidur_konsentrasi_sma", label: "Dalam 2 minggu terakhir, Saya sulit tidur dan berkonsentrasi terutama saat memikirkan hal-hal negatif yang belum tentu terjadi", type: "radio", options: ["Ya", "Tidak"] },
                    ]
                },
                {
                    id: "kesehatan_jiwa_skala_b_sma",
                    title: "G. Skrining Kesehatan Jiwa Kelas 7-9 (Usia 10-18 Tahun) - Skala B",
                    filter: (formData) => parseInt(formData.umur) >= 10 && parseInt(formData.umur) <= 18,
                    questions: [
                        { name: "sedih_tertekan_sma", label: "Dalam 2 minggu terakhir, Saya sering merasa sedih atau tertekan padahal tidak ada penyebab yang jelas", type: "radio", options: ["Ya", "Tidak"] },
                        { name: "tidak_tertarik_kegiatan_sma", label: "Dalam 2 minggu terakhir, Saya tidak tertarik lagi dengan kegiatan atau hal-hal yang biasanya saya suka", type: "radio", options: ["Ya", "Tidak"] },
                        { name: "capek_sulit_tidur_fokus_sma", label: "Dalam 2 minggu terakhir, Saya merasa sering capek, sulit tidur, dan sulit fokus saat belajar atau melakukan kegiatan", type: "radio", options: ["Ya", "Tidak"] },
                    ]
                },
                {
                    id: "thalasemia_sma",
                    title: "H. Skrining Thalasemia",
                    questions: [
                        { name: "anggota_keluarga_thalasemia_transfusi_rutin_sma", label: "Apakah ada anggota keluarga kandung Anda dinyatakan menderita Talasemia, atau kelainan darah atau pernah menjalani transfusi darah secara rutin?", type: "radio", options: ["Ya", "Tidak"] },
                        { name: "anggota_keluarga_pembawa_sifat_thalasemia_sma", label: "Apakah ada anggota keluarga kandung Anda dinyatakan sebagai pembawa sifat talasemia (mereka yang memiliki genetik yang tidak normal sehingga berpotensi menurunkan penyakit Talasemia)?", type: "radio", options: ["Ya", "Tidak"] },
                    ]
                },
                {
                    id: "frambusia_sma",
                    title: "I. Skrining Frambusia",
                    questions: [
                        { name: "ada_koreng_frambusia_sma", label: "Apakah ada koreng?", type: "radio", options: ["Ya", "Tidak"] },
                        { name: "koreng_bukan_akibat_luka_sma", label: "Apakah koreng bukan akibat luka (benturan, jatuh) ?", type: "radio", options: ["Ya", "Tidak"], dependsOn: { name: "ada_koreng_frambusia_sma", value: "Ya" } },
                        { name: "hasil_rdt_treponema_frambusia_sma", label: "Bila keduanya ya, di daerah endemis, belum pernah berhubungan seksual, dilakukan pemeriksaan RDT treponema; hasil positif menunjukkan diagnosis Frambusia", type: "text", readonly: true, placeholder: "Diisi oleh Petugas", dependsOn: { name: "koreng_bukan_akibat_luka_sma", value: "Ya" } },
                    ]
                },
                {
                    id: "kusta_sma",
                    title: "J. Skrining Kusta",
                    questions: [
                        { name: "bercak_kulit_putih_merah_kusta_sma", label: "Apakah ada bercak kulit putih atau merah?", type: "radio", options: ["Ya", "Tidak"] },
                        { name: "bercak_kulit_mati_rasa_kebal_sma", label: "Apakah bercak kulit itu mati rasa atau kebal?", type: "radio", options: ["Ya", "Tidak"], dependsOn: { name: "bercak_kulit_putih_merah_kusta_sma", value: "Ya" } },
                        { name: "diagnosis_kusta_sma", label: "Bila keduanya ya, menunjukkan diagnosis Kusta; Bila bercak mati rasa <5 type PB sedangkan > 5 type MB", type: "text", readonly: true, placeholder: "Diisi oleh Petugas", dependsOn: { name: "bercak_kulit_mati_rasa_kebal_sma", value: "Ya" } },
                    ]
                },
                {
                    id: "skabies_sma",
                    title: "K. Skrining Skabies",
                    questions: [
                        { name: "ada_koreng_skabies_sma", label: "Apakah ada koreng?", type: "radio", options: ["Ya", "Tidak"] },
                        { name: "koreng_bergerombol_gatal_sma", label: "Apakah koreng bergerombol gatal?", type: "radio", options: ["Ya", "Tidak"], dependsOn: { name: "ada_koreng_skabies_sma", value: "Ya" } },
                        { name: "diagnosis_skabies_sma", label: "Bila keduanya ya, menunjukkan diagnosis Skabies; Bila teman-sepermainan/seasrama juga menunjukkan hal sama, makin memperkuat diagnosis skabies", type: "text", readonly: true, placeholder: "Diisi oleh Petugas", dependsOn: { name: "koreng_bergerombol_gatal_sma", value: "Ya" } },
                    ]
                },
                {
                    id: "malaria_sma",
                    title: "L. Skrining Malaria",
                    questions: [
                        { name: "rdt_malaria_sma", label: "tanpa kuisioner langsung pemeriksaan RDT Malaria", type: "text", readonly: true, placeholder: "Diisi oleh Petugas" },
                    ]
                }
            ]
        }
    };

    // --- Definisi Kondisi Abnormal ---
    // Ini adalah peta yang mendefinisikan kapan sebuah jawaban dianggap "abnormal".
    // Untuk radio button, string adalah nilai yang abnormal (misal "Ya" atau "Tidak").
    // Untuk input teks/angka, fungsi digunakan untuk menentukan abnormalitas (misal, nilai ada, atau nilai di bawah threshold).
    const abnormalConditions = {
        // Tuberkulosis
        "batuk_2_minggu_sd": "Ya",
        "kontak_tbc_sd": "Ya",
        "batuk_2_minggu_smp": "Ya",
        "kontak_tbc_smp": "Ya",
        "batuk_2_minggu_sma": "Ya",
        "kontak_tbc_sma": "Ya",

        // Diabetes Melitus
        "sering_buang_air_kecil_malam_sd": "Ya",
        "sering_haus_sd": "Ya",
        "sering_lapar_sd": "Ya",
        "penurunan_berat_badan_nafsu_makan_meningkat_sd": "Ya",
        "sering_mengompol_sd": "Ya",
        "riwayat_keluarga_dm_sd": "Ya",
        "sering_buang_air_kecil_malam": "Ya", // SMP/SMA
        "sering_haus": "Ya",
        "sering_lapar": "Ya",
        "penurunan_berat_badan_nafsu_makan_meningkat": "Ya",
        "sering_mengompol": "Ya",
        "riwayat_keluarga_dm": "Ya",

        // Riwayat Imunisasi (Abnormal jika 'Tidak')
        "imunisasi_hepatitis_b_sd": "Tidak",
        "imunisasi_bcg_sd": "Tidak",
        "imunisasi_polio_tetes_1_sd": "Tidak",
        "imunisasi_dpt_hb_hib_1_sd": "Tidak",
        "imunisasi_polio_tetes_2_sd": "Tidak",
        "imunisasi_dpt_hb_hib_2_sd": "Tidak",
        "imunisasi_polio_tetes_3_sd": "Tidak",
        "imunisasi_dpt_hb_hib_3_sd": "Tidak",
        "imunisasi_polio_tetes_4_sd": "Tidak",
        "imunisasi_polio_suntik_sd": "Tidak",
        "imunisasi_campak_rubela_1_sd": "Tidak",
        "imunisasi_campak_rubela_2_sd": "Tidak",
        "imunisasi_dpt_hb_hib_4_sd": "Tidak",
        "imunisasi_hpv": "Tidak", // SMP/SMA

        // Kesehatan Reproduksi
        "keputihan_sd_putri": "Ya",
        "gatal_kemaluan_sd_putri": "Ya",
        "gatal_kencing_kuning_putra_sd": "Ya",
        "nyeri_bak_bab_putra_sd": "Ya",
        "luka_anus_dubur_putra_sd": "Ya",
        "keputihan": "Ya", // SMP/SMA
        "gatal_kemaluan_putri": "Ya",
        "gatal_kencing_kuning_putra": "Ya",
        "nyeri_bak_bab_putra": "Ya",
        "luka_anus_dubur_putra": "Ya",
        "menstruasi_sma_putri": "Ya", // Jika menstruasi 'Ya', maka usia_menstruasi_pertama_sma_putri relevan
        "usia_menstruasi_pertama_sd_putri": (value) => value !== '', // Jika ada nilai
        "usia_menstruasi_pertama": (value) => value !== '', // Jika ada nilai
        "usia_menstruasi_pertama_sma_putri": (value) => value !== '', // Jika ada nilai
        "keputihan_sma_putri": "Ya",
        "gatal_kemaluan_sma_putri": "Ya",
        "gatal_kencing_kuning_putra_sma": "Ya",
        "nyeri_bak_bab_putra_sma": "Ya",
        "luka_anus_dubur_putra_sma": "Ya",

        // Perilaku Merokok
        "merokok_setahun_terakhir_sd": "Ya",
        "jenis_rokok_sd": (value) => value && value.length > 0, // Jika ada jenis rokok yang dipilih
        "jumlah_batang_sd": (value) => value && value > 0, // Jika jumlah batang > 0
        "tahun_merokok_sd": (value) => value && value > 0, // Jika tahun merokok > 0
        "terpapar_asap_rokok_sd": "Ya",
        "merokok_setahun_terakhir": "Ya", // SMP/SMA
        "jenis_rokok": (value) => value && value.length > 0,
        "jumlah_batang": (value) => value && value > 0,
        "tahun_merokok": (value) => value && value > 0,
        "terpapar_asap_rokok": "Ya",
        "merokok_setahun_terakhir_sma": "Ya",
        "jenis_rokok_sma": (value) => value && value.length > 0,
        "jumlah_batang_sma": (value) => value && value > 0,
        "tahun_merokok_sma": (value) => value && value > 0,
        "terpapar_asap_rokok_sma": "Ya",

        // Hepatitis B dan C
        "tes_hepatitis_b_positif_sd": "Ya",
        "keluarga_idap_hepatitis_sd": "Ya",
        "sedang_transfusi_darah_sd": "Ya",
        "sedang_cuci_darah_sd": "Ya",
        "tes_hepatitis_b_positif": "Ya", // SMP/SMA
        "keluarga_idap_hepatitis": "Ya",
        "sedang_transfusi_darah": "Ya",
        "sedang_cuci_darah": "Ya",
        "hubungan_intim_seksual": "Ya",
        "penggunaan_narkoba_suntik": "Ya",
        "tes_hiv_positif": "Ya",
        "pengobatan_hepatitis_c_tidak_sembuh": "Ya",
        "tes_hepatitis_b_positif_sma": "Ya",
        "keluarga_idap_hepatitis_sma": "Ya",
        "sedang_transfusi_darah_sma": "Ya",
        "sedang_cuci_darah_sma": "Ya",
        "hubungan_intim_seksual_sma": "Ya",
        "penggunaan_narkoba_suntik_sma": "Ya",
        "tes_hiv_positif_sma": "Ya",
        "pengobatan_hepatitis_c_tidak_sembuh_sma": "Ya",

        // Kebugaran
        "masalah_tulang_sendi_sd": "Ya",
        "masalah_jantung_sd": "Ya",
        "asma_latihan_fisik_sd": "Ya",
        "kehilangan_kesadaran_sakit_kepala_parah_sd": "Ya",
        "masalah_tulang_sendi": "Ya", // SMP/SMA
        "masalah_jantung": "Ya",
        "asma_latihan_fisik": "Ya",
        "kehilangan_kesadaran_sakit_kepala_parah": "Ya",
        "masalah_tulang_sendi_sma": "Ya",
        "masalah_jantung_sma": "Ya",
        "asma_latihan_fisik_sma": "Ya",
        "kehilangan_kesadaran_sakit_kepala_parah_sma": "Ya",

        // Tingkat Aktivitas Fisik (Dianggap abnormal jika ada nilai, karena perlu ditinjau)
        "hari_aktif_fisik_7_hari_sd": (value) => value !== '' && value !== null,
        "hari_aktif_fisik_seminggu_biasanya_sd": (value) => value !== '' && value !== null,
        "hari_aktif_fisik_7_hari": (value) => value !== '' && value !== null,
        "hari_aktif_fisik_seminggu_biasanya": (value) => value !== '' && value !== null,
        "hari_aktif_fisik_7_hari_sma": (value) => value !== '' && value !== null,
        "hari_aktif_fisik_seminggu_biasanya_sma": (value) => value !== '' && value !== null,


        // Kesehatan Jiwa
        "khawatir_tidak_tenang_sd_1_3": "Ya",
        "berpikir_berlebihan_sd_1_3": "Ya",
        "sulit_tidur_konsentrasi_sd_1_3": "Ya",
        "sedih_tertekan_sd_1_3": "Ya",
        "tidak_tertarik_kegiatan_sd_1_3": "Ya",
        "capek_sulit_tidur_fokus_sd_1_3": "Ya",
        "khawatir_tidak_tenang_sd_7_9": "Ya",
        "berpikir_berlebihan_sd_7_9": "Ya",
        "sulit_tidur_konsentrasi_sd_7_9": "Ya",
        "sedih_tertekan_sd_7_9": "Ya",
        "tidak_tertarik_kegiatan_sd_7_9": "Ya",
        "capek_sulit_tidur_fokus_sd_7_9": "Ya",
        "khawatir_tidak_tenang": "Ya", // SMP/SMA
        "berpikir_berlebihan": "Ya",
        "sulit_tidur_konsentrasi": "Ya",
        "sedih_tertekan": "Ya",
        "tidak_tertarik_kegiatan": "Ya",
        "capek_sulit_tidur_fokus": "Ya",
        "khawatir_tidak_tenang_sma": "Ya",
        "berpikir_berlebihan_sma": "Ya",
        "sulit_tidur_konsentrasi_sma": "Ya",
        "sedih_tertekan_sma": "Ya",
        "tidak_tertarik_kegiatan_sma": "Ya",
        "capek_sulit_tidur_fokus_sma": "Ya",

        // Thalasemia
        "anggota_keluarga_thalasemia_transfusi_rutin": "Ya",
        "anggota_keluarga_pembawa_sifat_thalasemia": "Ya",
        "anggota_keluarga_thalasemia_transfusi_rutin_sma": "Ya",
        "anggota_keluarga_pembawa_sifat_thalasemia_sma": "Ya",

        // Frambusia
        "ada_koreng_frambusia_sd": "Ya",
        "koreng_bukan_akibat_luka_sd": "Ya",
        "hasil_rdt_treponema_frambusia_sd": (value) => value && value.toLowerCase().includes("positif"), // Jika mengandung "positif"
        "ada_koreng_frambusia": "Ya", // SMP/SMA
        "koreng_bukan_akibat_luka": "Ya",
        "hasil_rdt_treponema_frambusia": (value) => value && value.toLowerCase().includes("positif"),
        "ada_koreng_frambusia_sma": "Ya",
        "koreng_bukan_akibat_luka_sma": "Ya",
        "hasil_rdt_treponema_frambusia_sma": (value) => value && value.toLowerCase().includes("positif"),

        // Kusta
        "bercak_kulit_putih_merah_kusta_sd": "Ya",
        "bercak_kulit_mati_rasa_kebal_sd": "Ya",
        "diagnosis_kusta_sd": (value) => value && value.toLowerCase().includes("kusta"), // Jika mengandung "kusta"
        "bercak_kulit_putih_merah_kusta": "Ya", // SMP/SMA
        "bercak_kulit_mati_rasa_kebal": "Ya",
        "diagnosis_kusta": (value) => value && value.toLowerCase().includes("kusta"),
        "bercak_kulit_putih_merah_kusta_sma": "Ya",
        "bercak_kulit_mati_rasa_kebal_sma": "Ya",
        "diagnosis_kusta_sma": (value) => value && value.toLowerCase().includes("kusta"),

        // Skabies
        "ada_koreng_skabies_sd": "Ya",
        "koreng_bergerombol_gatal_sd": "Ya",
        "diagnosis_skabies_sd": (value) => value && value.toLowerCase().includes("skabies"), // Jika mengandung "skabies"
        "ada_koreng_skabies": "Ya", // SMP/SMA
        "koreng_bergerombol_gatal": "Ya",
        "diagnosis_skabies": (value) => value && value.toLowerCase().includes("skabies"),
        "ada_koreng_skabies_sma": "Ya",
        "koreng_bergerombol_gatal_sma": "Ya",
        "diagnosis_skabies_sma": (value) => value && value.toLowerCase().includes("skabies"),

        // Malaria
        "demam_sakit_kepala_menggigil_sd": "Ya",
        "pernah_sakit_malaria_sd": "Ya",
        "orang_sakit_malaria_di_wilayah_tinggal_sd": "Ya",
        "rdt_malaria": (value) => value && value.toLowerCase().includes("positif"), // Jika mengandung "positif"
        "rdt_malaria_sma": (value) => value && value.toLowerCase().includes("positif"),
    };

    // Daftar field identitas yang selalu disimpan
    const identityFields = [
        "nama_sekolah", "alamat_sekolah", "nama", "nik", "tempat_lahir",
        "tanggal_lahir", "umur", "golongan_darah", "nama_orangtua", "kelas", "jenis_kelamin"
    ];

    // Helper function untuk mendapatkan definisi pertanyaan dari kuesioner
    function getQuestionDefinition(questionName) {
        for (const jenjangKey in questionnaires) {
            for (const section of questionnaires[jenjangKey].sections) {
                const question = section.questions.find(q => q.name === questionName);
                if (question) {
                    return question;
                }
            }
        }
        return null;
    }

    // Helper function untuk memeriksa apakah jawaban abnormal
    function isAnswerAbnormal(questionName, answerValue) {
        // Jika ini adalah field identitas, selalu anggap normal untuk tujuan filter ini
        if (identityFields.includes(questionName)) {
            return false;
        }

        const condition = abnormalConditions[questionName];

        // Jika tidak ada kondisi abnormal yang ditentukan untuk pertanyaan ini,
        // dan ini adalah input teks atau angka, anggap abnormal jika ada nilai (terisi).
        // Ini untuk menangani kasus seperti 'usia_menstruasi_pertama' atau 'rdt_malaria'
        // di mana keberadaan nilai menunjukkan sesuatu yang perlu dicatat.
        if (condition === undefined) {
            const questionDef = getQuestionDefinition(questionName);
            if (questionDef && (questionDef.type === 'text' || questionDef.type === 'number')) {
                return answerValue !== null && answerValue !== undefined && answerValue !== '' && answerValue !== 0;
            }
            // Untuk checkbox, jika tidak ada kondisi spesifik, anggap abnormal jika ada nilai terpilih
            if (questionDef && questionDef.type === 'checkbox') {
                return Array.isArray(answerValue) && answerValue.length > 0;
            }
            return false; // Default ke tidak abnormal jika tidak ada kondisi dan bukan teks/angka/checkbox
        }

        if (typeof condition === 'function') {
            return condition(answerValue);
        } else if (Array.isArray(condition)) {
            // Untuk checkbox dengan kondisi array (misal, jika salah satu opsi terpilih abnormal)
            if (Array.isArray(answerValue)) {
                return answerValue.some(val => condition.includes(val));
            }
            return condition.includes(answerValue);
        } else {
            return answerValue === condition;
        }
    }


    // --- Penyimpanan Data (Menggunakan Local Storage untuk kesederhanaan) ---
    // Struktur: { namaSekolah: { namaKelas: [{ studentData, questionnaireData }] } }
    let allSubmittedData = JSON.parse(localStorage.getItem('allSubmittedData')) || {};
    let pendingSyncData = JSON.parse(localStorage.getItem('pendingSyncData')) || [];
    let uniqueSchoolNames = JSON.parse(localStorage.getItem('uniqueSchoolNames')) || []; // Daftar nama sekolah unik
    // Menyimpan alamat sekolah berdasarkan nama sekolah
    let schoolAddresses = JSON.parse(localStorage.getItem('schoolAddresses')) || {};

    // Log status data saat aplikasi dimuat
    console.log("--- Aplikasi Dimuat ---");
    console.log("Data allSubmittedData dari localStorage saat ini:", allSubmittedData);
    console.log("Nama sekolah unik dari localStorage saat ini:", uniqueSchoolNames);
    console.log("Alamat sekolah dari localStorage saat ini:", schoolAddresses);


    // --- Fungsi Utilitas ---

    // Menampilkan pesan modal kustom
    function showModal(message, isConfirmation = false, onConfirm = null) {
        modalMessage.textContent = message;
        if (isConfirmation) {
            modalConfirmButton.classList.remove('hidden');
            modalCancelButton.classList.remove('hidden');
            // Hapus event listener lama sebelum menambahkan yang baru
            modalConfirmButton.onclick = null;
            modalCancelButton.onclick = null;

            modalConfirmButton.onclick = () => {
                modal.style.display = 'none';
                if (onConfirm) {
                    onConfirm();
                }
            };
            modalCancelButton.onclick = () => {
                modal.style.display = 'none';
                pendingDeleteAction = null; // Reset pending action
            };
        } else {
            modalConfirmButton.classList.add('hidden');
            modalCancelButton.classList.add('hidden');
            closeButton.onclick = () => {
                modal.style.display = 'none';
            };
        }
        modal.style.display = 'flex'; // Menggunakan flexbox untuk centering
    }

    // Menyembunyikan pesan modal kustom
    closeButton.onclick = function() {
        modal.style.display = 'none';
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }

    // Membuat ID unik untuk siswa jika NIK tidak tersedia
    function generateUniqueId() {
        return '_' + Math.random().toString(36).substr(2, 9);
    }

    // Fungsi untuk menghitung umur berdasarkan tanggal lahir
    function calculateAge(birthdateString) {
        if (!birthdateString) return '';
        const birthDate = new Date(birthdateString);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }

    // Memperbarui status online/offline di UI
    function updateOnlineStatus() {
        if (navigator.onLine) {
            onlineStatusDiv.classList.remove('offline');
            onlineStatusDiv.classList.add('online');
            onlineStatusDiv.textContent = 'Online';
            // synchronizeData(); // Dihapus untuk fokus pada mode offline
        } else {
            onlineStatusDiv.classList.remove('online');
            onlineStatusDiv.classList.add('offline');
            onlineStatusDiv.textContent = 'Offline';
        }
    }

    // Fungsi untuk mengatur kelas aktif pada navigasi
    function setActiveNav(activeId) {
        document.querySelectorAll('.nav-link').forEach(link => {
            // Hapus gaya aktif dari semua tautan
            link.classList.remove('bg-indigo-700', 'text-white', 'font-bold', 'shadow-lg');
            // Tambahkan gaya tidak aktif/hover ke semua tautan
            link.classList.add('text-indigo-200', 'hover:bg-indigo-700', 'hover:text-white');
        });
        const activeLink = document.getElementById(activeId);
        if (activeLink) {
            // Hapus gaya tidak aktif/hover dari tautan aktif
            activeLink.classList.remove('text-indigo-200', 'hover:bg-indigo-700', 'hover:text-white');
            // Tambahkan gaya aktif ke tautan aktif
            activeLink.classList.add('bg-indigo-700', 'text-white', 'font-bold', 'shadow-lg');
        }
    }

    // Function to update visibility of sections based on form data
    function updateQuestionnaireVisibility(jenjang) {
        const form = document.getElementById(`questionnaire-form-${jenjang}`);
        if (!form) return;

        const formData = {};
        // Collect current form data for evaluation
        form.querySelectorAll('input, select').forEach(input => {
            if (input.type === 'radio' && !input.checked) {
                return; // Skip unchecked radio buttons
            }
            if (input.type === 'checkbox') {
                if (!formData[input.name]) {
                    formData[input.name] = [];
                }
                if (input.checked) {
                    formData[input.name].push(input.value);
                }
            } else {
                formData[input.name] = input.value;
            }
        });

        // Ensure umur is calculated and available in formData
        const tanggalLahirInput = document.getElementById('tanggal_lahir');
        if (tanggalLahirInput && tanggalLahirInput.value) {
            formData.umur = calculateAge(tanggalLahirInput.value);
        } else {
            formData.umur = null; // Or some default if not filled
        }

        // Iterate through sections and apply filters
        questionnaires[jenjang].sections.forEach(sectionDef => {
            const sectionElement = document.getElementById(sectionDef.id);
            if (sectionElement) {
                // Check if this section has a filter and if it passes
                if (sectionDef.filter) {
                    const shouldShow = sectionDef.filter(formData);
                    sectionElement.style.display = shouldShow ? 'block' : 'none';

                    // If a section is hidden, clear its inputs and remove 'required'
                    if (!shouldShow) {
                        sectionElement.querySelectorAll('input, select, textarea').forEach(input => {
                            if (input.hasAttribute('required')) {
                                input.setAttribute('data-required-if-visible', 'true'); // Mark as originally required
                                input.removeAttribute('required');
                            }
                            if (input.type === 'radio' || input.type === 'checkbox') {
                                input.checked = false;
                            } else {
                                input.value = '';
                            }
                        });
                    } else {
                        // If a section is shown, restore 'required' attributes
                        sectionElement.querySelectorAll('input, select, textarea').forEach(input => {
                            if (input.hasAttribute('data-required-if-visible')) {
                                input.setAttribute('required', 'true');
                            }
                        });
                    }
                }
            }
        });

        // Re-evaluate individual question dependencies after section visibility is set
        // This is important because a question's dependency might be in a section that was just hidden.
        questionnaires[jenjang].sections.forEach(sectionDef => {
            sectionDef.questions.forEach(q => {
                const dependentItem = document.getElementById(`question-item-${q.name}`);
                if (dependentItem && q.dependsOn) {
                    const parentQuestionInput = form.querySelector(`input[name="${q.dependsOn.name}"]:checked`);
                    const parentValue = parentQuestionInput ? parentQuestionInput.value : null;

                    // Only show dependent question if its parent section is visible AND its own condition is met
                    const parentSectionElement = dependentItem.closest('.questionnaire-section');
                    const isParentSectionVisible = parentSectionElement ? parentSectionElement.style.display !== 'none' : true;

                    if (isParentSectionVisible && parentValue === q.dependsOn.value) {
                        dependentItem.style.display = 'block';
                        dependentItem.querySelectorAll('input, select, textarea').forEach(input => {
                            if (input.hasAttribute('data-required-if-visible')) {
                                input.setAttribute('required', 'true');
                            }
                        });
                    } else {
                        dependentItem.style.display = 'none';
                        dependentItem.querySelectorAll('input, select, textarea').forEach(input => {
                            if (input.hasAttribute('required')) {
                                input.setAttribute('data-required-if-visible', 'true');
                                input.removeAttribute('required');
                            }
                            if (input.type === 'radio' || input.type === 'checkbox') {
                                input.checked = false;
                            } else {
                                input.value = '';
                            }
                        });
                    }
                }
            });
        });
    }


    // Merender formulir kuesioner berdasarkan jenjang
    function renderQuestionnaire(jenjang) {
        setActiveNav(`nav-${jenjang}`); // Set active nav for questionnaire
        const data = questionnaires[jenjang];
        if (!data) {
            appContent.innerHTML = "<p class='text-red-500'>Kuesioner tidak ditemukan.</p>";
            return;
        }

        let html = `<h2 class="text-2xl font-bold mb-6 text-center text-gray-800">${data.title}</h2>
                    <form id="questionnaire-form-${jenjang}" class="space-y-6">`;

        data.sections.forEach(section => {
            // Add a data-section-id to the HTML element for easy targeting
            html += `<div class="questionnaire-section bg-white p-6 rounded-lg shadow-md" id="${section.id}">
                        <h3 class="text-xl font-semibold mb-4 text-gray-700">${section.title}</h3>`;
            section.questions.forEach(q => {
                // Menentukan apakah pertanyaan harus disembunyikan secara default (jika bercabang)
                // Initial state for dependent questions: hidden
                const isDependent = q.dependsOn ? 'style="display: none;"' : '';
                html += `<div class="question-item" id="question-item-${q.name}" ${isDependent}>
                            <label for="${q.name}" class="block text-gray-700 text-sm font-medium mb-2">${q.label}${q.required ? ' <span class="text-red-500">*</span>' : ''}</label>`;

                if (q.type === 'school_dropdown') {
                    html += `<select id="${q.name}" name="${q.name}" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">`;
                    html += `<option value="">Pilih atau Tambah Sekolah</option>`;
                    uniqueSchoolNames.sort().forEach(school => {
                        html += `<option value="${school}">${school}</option>`;
                    });
                    html += `<option value="tambah_baru">-- Tambah Sekolah Baru --</option>`;
                    html += `</select>`;
                    html += `<input type="text" id="${q.name}_new" name="${q.name}_new" class="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm hidden" placeholder="Masukkan Nama Sekolah Baru">`;
                } else if (q.type === 'text' || q.type === 'number') {
                    html += `<input type="${q.type}" id="${q.name}" name="${q.name}" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" ${q.required ? 'required' : ''} ${q.placeholder ? `placeholder="${q.placeholder}"` : ''} ${q.readonly ? 'readonly' : ''}>`;
                } else if (q.type === 'date') {
                    html += `<input type="date" id="${q.name}" name="${q.name}" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" ${q.required ? 'required' : ''}>`;
                } else if (q.type === 'radio') {
                    q.options.forEach(option => {
                        const isChecked = (q.default === option) ? 'checked' : '';
                        html += `<div class="flex items-center mt-2">
                                    <input type="radio" id="${q.name}-${option.replace(/\s/g, '_')}" name="${q.name}" value="${option}" class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300" ${q.required ? 'required' : ''} ${isChecked}>
                                    <label for="${q.name}-${option.replace(/\s/g, '_')}" class="ml-2 block text-sm text-gray-900">${option}</label>
                                 </div>`;
                    });
                } else if (q.type === 'checkbox') {
                    q.options.forEach(option => {
                        html += `<div class="flex items-center mt-2">
                                    <input type="checkbox" id="${q.name}-${option.replace(/\s/g, '_')}" name="${q.name}" value="${option}" class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded">
                                    <label for="${q.name}-${option.replace(/\s/g, '_')}" class="ml-2 block text-sm text-gray-900">${option}</label>
                                 </div>`;
                    });
                } else if (q.type === 'select') {
                    html += `<select id="${q.name}" name="${q.name}" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" ${q.required ? 'required' : ''}>`;
                    html += `<option value="">Pilih ${q.label}</option>`;
                    q.options.forEach(option => {
                        html += `<option value="${option}">${option}</option>`;
                    });
                    html += `</select>`;
                }
                html += `</div>`;
            });
            html += `</div>`;
        });

        html += `<button type="submit" class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Submit Kuesioner</button>
                </form>`;
        appContent.innerHTML = html;

        // --- Logika untuk Dropdown Sekolah dan Alamat Otomatis ---
        const schoolDropdown = document.getElementById('nama_sekolah');
        const newSchoolInput = document.getElementById('nama_sekolah_new');
        const alamatSekolahInput = document.getElementById('alamat_sekolah');
        const kelasInput = document.getElementById('kelas');

        if (schoolDropdown && newSchoolInput && alamatSekolahInput) {
            schoolDropdown.addEventListener('change', () => {
                const selectedSchool = schoolDropdown.value;
                if (selectedSchool === 'tambah_baru') {
                    newSchoolInput.classList.remove('hidden');
                    newSchoolInput.setAttribute('required', 'true');
                    alamatSekolahInput.value = '';
                    alamatSekolahInput.removeAttribute('readonly');
                } else if (selectedSchool) {
                    newSchoolInput.classList.add('hidden');
                    newSchoolInput.removeAttribute('required');
                    alamatSekolahInput.value = schoolAddresses[selectedSchool] || '';
                    alamatSekolahInput.setAttribute('readonly', 'true');
                } else {
                    newSchoolInput.classList.add('hidden');
                    newSchoolInput.removeAttribute('required');
                    alamatSekolahInput.value = '';
                    alamatSekolahInput.removeAttribute('readonly');
                }
            });
        }

        // --- Logika untuk Perhitungan Umur Otomatis ---
        const tanggalLahirInput = document.getElementById('tanggal_lahir');
        const umurInput = document.getElementById('umur');

        if (tanggalLahirInput && umurInput) {
            tanggalLahirInput.addEventListener('change', () => {
                const age = calculateAge(tanggalLahirInput.value);
                umurInput.value = age;
                updateQuestionnaireVisibility(jenjang); // Recalculate visibility based on new age
            });
        }

        // --- Validasi Input Kelas (alphanumeric saja) ---
        if (kelasInput) {
            kelasInput.addEventListener('input', (event) => {
                event.target.value = event.target.value.replace(/[^a-zA-Z0-9]/g, '');
                updateQuestionnaireVisibility(jenjang); // Recalculate visibility based on new class
            });
        }

        // --- Logika untuk Jenis Kelamin (radio) ---
        const jenisKelaminRadios = document.querySelectorAll(`input[name="jenis_kelamin"]`);
        jenisKelaminRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                updateQuestionnaireVisibility(jenjang); // Recalculate visibility based on new gender
            });
        });

        // --- Logika untuk Pertanyaan Bercabang dan Default Radio Button ---
        data.sections.forEach(section => {
            section.questions.forEach(q => {
                if (q.type === 'radio') {
                    // Set default for radio buttons
                    const defaultOption = q.default || (q.options.includes("Tidak") ? "Tidak" : null);
                    if (defaultOption) {
                        const defaultRadio = document.getElementById(`${q.name}-${defaultOption.replace(/\s/g, '_')}`);
                        if (defaultRadio) {
                            defaultRadio.checked = true;
                        }
                    }

                    // Add event listener for conditional questions
                    const radioButtons = document.querySelectorAll(`input[name="${q.name}"]`);
                    radioButtons.forEach(radio => {
                        radio.addEventListener('change', () => {
                            // Iterate through all questions to check for dependencies
                            data.sections.forEach(s => {
                                s.questions.forEach(dependentQ => {
                                    if (dependentQ.dependsOn && dependentQ.dependsOn.name === q.name) {
                                        const dependentItem = document.getElementById(`question-item-${dependentQ.name}`);
                                        if (dependentItem) {
                                            const parentSectionElement = dependentItem.closest('.questionnaire-section');
                                            const isParentSectionVisible = parentSectionElement ? parentSectionElement.style.display !== 'none' : true;

                                            if (isParentSectionVisible && radio.value === dependentQ.dependsOn.value) {
                                                dependentItem.style.display = 'block';
                                                dependentItem.querySelectorAll('input, select, textarea').forEach(input => {
                                                    if (input.hasAttribute('data-required-if-visible')) {
                                                        input.setAttribute('required', 'true');
                                                    }
                                                });
                                            } else {
                                                dependentItem.style.display = 'none';
                                                dependentItem.querySelectorAll('input, select, textarea').forEach(input => {
                                                    if (input.hasAttribute('required')) {
                                                        input.setAttribute('data-required-if-visible', 'true');
                                                        input.removeAttribute('required');
                                                    }
                                                    if (input.type === 'radio' || input.type === 'checkbox') {
                                                        input.checked = false;
                                                    } else {
                                                        input.value = '';
                                                    }
                                                });
                                            }
                                        }
                                    }
                                });
                            });
                        });
                    });
                }
            });
        });

        // Initial visibility update when the form is rendered
        updateQuestionnaireVisibility(jenjang);

        // Menambahkan event listener untuk submit formulir
        document.getElementById(`questionnaire-form-${jenjang}`).addEventListener('submit', (event) => {
            event.preventDefault();
            const formData = new FormData(event.target);
            const data = {};
            for (let [key, value] of formData.entries()) {
                // Untuk checkbox, kelompokkan nilai ke dalam array
                if (event.target.querySelectorAll(`input[name="${key}"][type="checkbox"]`).length > 0) {
                    if (!data[key]) {
                        data[key] = [];
                    }
                    data[key].push(value);
                } else {
                    data[key] = value;
                }
            }

            // Handle nama_sekolah dari dropdown atau input baru
            let finalSchoolName = schoolDropdown ? schoolDropdown.value : '';
            let finalSchoolAddress = alamatSekolahInput ? alamatSekolahInput.value : '';

            if (schoolDropdown && schoolDropdown.value === 'tambah_baru' && newSchoolInput) {
                finalSchoolName = newSchoolInput.value;
                // Simpan alamat sekolah baru
                schoolAddresses[finalSchoolName] = finalSchoolAddress;
                localStorage.setItem('schoolAddresses', JSON.stringify(schoolAddresses));
            } else if (schoolDropdown && schoolDropdown.value && schoolAddresses[schoolDropdown.value]) {
                // Jika sekolah lama dipilih, gunakan alamat yang tersimpan
                finalSchoolAddress = schoolAddresses[schoolDropdown.value];
            } else if (schoolDropdown && schoolDropdown.value && !schoolAddresses[schoolDropdown.value]) {
                // Jika sekolah lama dipilih tetapi tidak ada alamat tersimpan (kasus migrasi data lama), simpan alamat yang diinput
                schoolAddresses[schoolDropdown.value] = finalSchoolAddress;
                localStorage.setItem('schoolAddresses', JSON.stringify(schoolAddresses));
            }
            data.nama_sekolah = finalSchoolName;
            data.alamat_sekolah = finalSchoolAddress;


            // Pastikan umur diambil dari input yang dihitung otomatis
            data.umur = umurInput ? umurInput.value : '';

            // Validasi nama sekolah, kelas, dan nama siswa
            if (!data.nama_sekolah || !data.kelas || !data.nama || !data.nik) {
                showModal('Nama Sekolah, Kelas, Nama Siswa, dan NIK wajib diisi.');
                return;
            }

            saveQuestionnaireData(jenjang, data);
            showModal('Kuesioner berhasil disimpan (offline).'); // Pesan diubah
            event.target.reset(); // Mengosongkan formulir setelah submit
            renderRecapView('jenjang_menu'); // Beralih ke tampilan rekap setelah submit
        });
    }

    // Menyimpan data kuesioner ke Local Storage
    function saveQuestionnaireData(jenjang, data) {
        const schoolName = data.nama_sekolah;
        const className = data.kelas;
        // FIX 1: Selalu buat ID unik baru untuk setiap pengiriman, tidak menimpa berdasarkan NIK.
        const studentId = generateUniqueId(); // Selalu gunakan ID unik baru untuk setiap entri

        console.log("--- saveQuestionnaireData called ---");
        console.log("Initial allSubmittedData (before modification):", JSON.parse(localStorage.getItem('allSubmittedData')));
        console.log("Saving for studentId:", studentId, "School:", schoolName, "Class:", className);

        // Store all answers to preserve complete submission history
        const allAnswers = {};
        for (const key in data) {
            allAnswers[key] = data[key];
        }

        // Cek apakah ada setidaknya satu jawaban abnormal
        const hasAnyAbnormalAnswer = Object.keys(data).some(key => !identityFields.includes(key) && isAnswerAbnormal(key, data[key]));
        const hasCompleteIdentity = identityFields.every(field => allAnswers[field] !== undefined && allAnswers[field] !== '');

        // FIX 2: Hanya simpan jika ada jawaban abnormal DAN identitas lengkap
        if (!hasCompleteIdentity || !hasAnyAbnormalAnswer) {
            showModal('Data tidak lengkap atau tidak ada jawaban abnormal yang terdeteksi. Data tidak disimpan.');
            return;
        }

        if (!allSubmittedData[schoolName]) {
            allSubmittedData[schoolName] = {};
        }
        if (!allSubmittedData[schoolName][className]) {
            allSubmittedData[schoolName][className] = [];
        }

        const newStudentRecord = {
            id: studentId, // ID unik baru
            name: data.nama, // Nama siswa tetap disimpan di level atas untuk kemudahan akses
            jenjang: jenjang,
            timestamp: new Date().toISOString(),
            answers: allAnswers, // Simpan SEMUA jawaban di sini
            synced: false // Tetap ada properti ini untuk kemungkinan sinkronisasi di masa depan
        };

        // FIX 1: Selalu tambahkan sebagai entri baru
        allSubmittedData[schoolName][className].push(newStudentRecord);
        console.log('Data siswa baru disimpan secara lokal:', allSubmittedData);


        // Update unique school names and addresses
        if (schoolName && !uniqueSchoolNames.includes(schoolName)) {
            uniqueSchoolNames.push(schoolName);
            localStorage.setItem('uniqueSchoolNames', JSON.stringify(uniqueSchoolNames));
        }
        if (schoolName && data.alamat_sekolah && !schoolAddresses[schoolName]) {
            schoolAddresses[schoolName] = data.alamat_sekolah;
            localStorage.setItem('schoolAddresses', JSON.stringify(schoolAddresses));
        }


        localStorage.setItem('allSubmittedData', JSON.stringify(allSubmittedData));
        localStorage.setItem('pendingSyncData', JSON.stringify(pendingSyncData)); // Keep this for future sync capability
        console.log('Data disimpan ke localStorage:', JSON.parse(localStorage.getItem('allSubmittedData')));
        console.log("--- saveQuestionnaireData finished ---");
    }

    // Fungsi untuk mensinkronkan data ke server (TIDAK DIGUNAKAN DALAM MODE INI)
    // async function synchronizeData() { ... }

    // Merender tampilan rekap data (Jenjang -> Sekolah -> Kelas -> Siswa)
    function renderRecapView(level = 'jenjang_menu', selectedJenjang = null, selectedSchool = null, selectedClass = null) {
        setActiveNav('nav-rekap'); // Set active nav for recap
        console.log(`renderRecapView called: level=${level}, selectedJenjang=${selectedJenjang}, selectedSchool=${selectedSchool}, selectedClass=${selectedClass}`);
        let html = `<h2 class="text-2xl font-bold mb-6 text-center text-gray-800">Rekap Data Kuesioner</h2>`;

        // Tambahkan tampilan jalur navigasi (breadcrumb)
        let pathDisplay = '';
        if (level === 'schools_by_jenjang' && selectedJenjang) {
            pathDisplay = `<p class="text-lg text-gray-600 mb-4 text-center">Jenjang: <span class="font-semibold">${selectedJenjang.toUpperCase()}</span></p>`;
        } else if (level === 'classes_by_school_jenjang' && selectedJenjang && selectedSchool) {
            pathDisplay = `<p class="text-lg text-gray-600 mb-4 text-center">Jenjang: <span class="font-semibold">${selectedJenjang.toUpperCase()}</span> &gt; Sekolah: <span class="font-semibold">${selectedSchool}</span></p>`;
        } else if (level === 'students_by_class_school_jenjang' && selectedJenjang && selectedSchool && selectedClass) {
            pathDisplay = `<p class="text-lg text-gray-600 mb-4 text-center">Jenjang: <span class="font-semibold">${selectedJenjang.toUpperCase()}</span> &gt; Sekolah: <span class="font-semibold">${selectedSchool}</span> &gt; Kelas: <span class="font-semibold">${selectedClass}</span></p>`;
        }
        html += pathDisplay; // Tambahkan tampilan jalur ke HTML

        // Tombol kembali dan tombol aksi (download/delete)
        html += `<div class="flex items-center mb-4 space-x-2">`; // Flex container for buttons
        if (level === 'schools_by_jenjang') {
            html += `<button class="back-button px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200" onclick="renderRecapView('jenjang_menu')"><i class="fas fa-arrow-left mr-2"></i>Kembali</button>`;
        } else if (level === 'classes_by_school_jenjang') {
            html += `<button class="back-button px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200" onclick="renderRecapView('schools_by_jenjang', '${selectedJenjang}')"><i class="fas fa-arrow-left mr-2"></i>Kembali</button>`;
            // Tombol Unduh dan Hapus (dipindahkan ke sini)
            html += `<button class="download-button px-4 py-2 ml-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200" onclick="downloadSchoolDataAsCsv('${selectedSchool}', '${selectedJenjang}')"><i class="fas fa-download mr-2"></i>Unduh</button>`;
            html += `<button class="delete-school-button px-4 py-2 ml-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200" onclick="showDeleteConfirmation('${selectedSchool}', '${selectedJenjang}')"><i class="fas fa-trash mr-2"></i>Hapus</button>`;
        } else if (level === 'students_by_class_school_jenjang') {
            html += `<button class="back-button px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200" onclick="renderRecapView('classes_by_school_jenjang', '${selectedJenjang}', '${selectedSchool}')"><i class="fas fa-arrow-left mr-2"></i>Kembali</button>`;
        }
        html += `</div>`; // Close flex container

        html += '<div class="recap-list mt-4"><ul>';

        if (level === 'jenjang_menu') {
            const jenjangs = ['sd', 'smp', 'sma'];
            let hasData = false;
            jenjangs.forEach(jenjang => {
                let count = 0;
                // Hitung total siswa untuk jenjang ini
                for (const school in allSubmittedData) {
                    for (const className in allSubmittedData[school]) {
                        count += allSubmittedData[school][className].filter(s => s.jenjang === jenjang).length;
                    }
                }
                if (count > 0) { // Hanya tampilkan jenjang yang memiliki data
                    hasData = true;
                    html += `<li class="p-3 bg-blue-100 border border-blue-200 rounded-lg mb-2 cursor-pointer hover:bg-blue-200 transition-colors duration-200 flex justify-between items-center">
                                <span onclick="renderRecapView('schools_by_jenjang', '${jenjang}')">Jenjang ${jenjang.toUpperCase()} (${count})</span>
                            </li>`;
                }
            });
            if (!hasData) {
                html += '<p class="text-gray-600">Belum ada data kuesioner yang tersimpan.</p>';
            }
        } else if (level === 'schools_by_jenjang' && selectedJenjang) {
            console.log(`Rendering schools for jenjang: ${selectedJenjang}`);
            console.log('allSubmittedData:', allSubmittedData);
            const schools = Object.keys(allSubmittedData).sort();
            let hasData = false;
            schools.forEach(school => {
                let count = 0;
                if (allSubmittedData[school]) {
                    for (const className in allSubmittedData[school]) {
                        // Hitung siswa untuk sekolah ini di jenjang yang dipilih
                        count += allSubmittedData[school][className].filter(s => s.jenjang === selectedJenjang).length;
                    }
                }
                if (count > 0) { // Hanya tampilkan sekolah yang memiliki data untuk jenjang ini
                    hasData = true;
                    html += `<li class="p-3 bg-green-100 border border-green-200 rounded-lg mb-2 cursor-pointer hover:bg-green-200 transition-colors duration-200 flex justify-between items-center">
                                <span onclick="renderRecapView('classes_by_school_jenjang', '${selectedJenjang}', '${school}')">${school} (${count})</span>
                            </li>`;
                }
            });
            if (!hasData) {
                html += `<p class="text-gray-600">Belum ada data sekolah untuk jenjang ${selectedJenjang.toUpperCase()}.</p>`;
            }
        } else if (level === 'classes_by_school_jenjang' && selectedJenjang && selectedSchool) {
            console.log(`Rendering classes for jenjang: ${selectedJenjang}, school: ${selectedSchool}`);
            const classes = allSubmittedData[selectedSchool] ? Object.keys(allSubmittedData[selectedSchool]).sort((a, b) => parseInt(a) - parseInt(b)) : [];
            let hasData = false;
            classes.forEach(className => {
                // Filter siswa berdasarkan jenjang dan hitung
                const studentsInClass = allSubmittedData[selectedSchool][className].filter(s => s.jenjang === selectedJenjang);
                const count = studentsInClass.length;
                if (count > 0) { // Hanya tampilkan kelas yang memiliki data untuk sekolah dan jenjang ini
                    hasData = true;
                    html += `<li class="p-3 bg-purple-100 border border-purple-200 rounded-lg mb-2 cursor-pointer hover:bg-purple-200 transition-colors duration-200" onclick="renderRecapView('students_by_class_school_jenjang', '${selectedJenjang}', '${selectedSchool}', '${className}')">Kelas ${className} (${count})</li>`;
                }
            });
            if (!hasData) {
                html += `<p class="text-gray-600">Belum ada data kelas untuk sekolah ${selectedSchool} di jenjang ${selectedJenjang.toUpperCase()}.</p>`;
            }
        } else if (level === 'students_by_class_school_jenjang' && selectedJenjang && selectedSchool && selectedClass) {
            console.log(`Rendering students for jenjang: ${selectedJenjang}, school: ${selectedSchool}, class: ${selectedClass}`);
            // Filter siswa berdasarkan jenjang, sekolah, dan kelas
            const students = allSubmittedData[selectedSchool] && allSubmittedData[selectedSchool][selectedClass] ? allSubmittedData[selectedSchool][selectedClass].filter(s => s.jenjang === selectedJenjang).sort((a, b) => a.name.localeCompare(b.name)) : [];
            if (students.length === 0) {
                html += '<p class="text-gray-600">Belum ada siswa di kelas ini.</p>';
            } else {
                students.forEach(student => {
                    // Cek apakah siswa memiliki jawaban abnormal selain identitas
                    const hasAbnormal = Object.keys(student.answers).some(key => !identityFields.includes(key) && isAnswerAbnormal(key, student.answers[key]));
                    const abnormalIndicator = hasAbnormal ? '<span class="ml-2 text-red-500 font-bold">(Abnormal)</span>' : '';
                    const syncStatus = student.synced ? '<span class="text-green-600">(Sudah Sinkron)</span>' : '<span class="text-red-600">(Menunggu Sinkronisasi)</span>';
                    // Mengirim semua parameter yang diperlukan untuk kembali ke level yang benar
                    html += `<li class="p-3 bg-yellow-100 border border-yellow-200 rounded-lg mb-2 cursor-pointer hover:bg-yellow-200 transition-colors duration-200" onclick="displayStudentData('${student.id}', '${selectedSchool}', '${selectedClass}', '${selectedJenjang}')">${student.name || 'Siswa Tanpa Nama'} - NIK: ${student.id} ${abnormalIndicator} ${syncStatus}</li>`;
                });
            }
        }
        html += '</ul></div>';
        appContent.innerHTML = html;
    }

    // Fungsi untuk navigasi kembali di tampilan rekap
    function goBackRecap(currentLevel, selectedJenjang, selectedSchool, selectedClass) {
        if (currentLevel === 'students_by_class_school_jenjang') {
            renderRecapView('classes_by_school_jenjang', selectedJenjang, selectedSchool);
        } else if (currentLevel === 'classes_by_school_jenjang') {
            renderRecapView('schools_by_jenjang', selectedJenjang);
        } else if (currentLevel === 'schools_by_jenjang') {
            renderRecapView('jenjang_menu');
        }
    }
    // Jadikan goBackRecap dapat diakses secara global untuk onclick inline
    window.goBackRecap = goBackRecap;
    // Jadikan renderRecapView dapat diakses secara global untuk onclick inline
    window.renderRecapView = renderRecapView;

    // Fungsi baru untuk menampilkan konfirmasi hapus data sekolah
    function showDeleteConfirmation(schoolName, jenjang) {
        showModal(`Apakah Anda yakin ingin menghapus semua data kuesioner untuk sekolah "${schoolName}" (Jenjang ${jenjang.toUpperCase()})? Aksi ini tidak dapat dibatalkan.`, true, () => {
            deleteSchoolData(schoolName, jenjang);
        });
    }
    // Jadikan showDeleteConfirmation dapat diakses secara global
    window.showDeleteConfirmation = showDeleteConfirmation;


    // Fungsi baru untuk mengunduh data sekolah sebagai CSV
    function downloadSchoolDataAsCsv(schoolName, jenjang) {
        console.log(`Attempting to download data for school: ${schoolName}, jenjang: ${jenjang}`);
        const schoolData = allSubmittedData[schoolName];
        if (!schoolData) {
            showModal(`Tidak ada data ditemukan untuk sekolah: ${schoolName}.`);
            return;
        }

        let studentsToDownload = [];
        // Kumpulkan semua siswa dari semua kelas di sekolah yang dipilih, filter berdasarkan jenjang
        for (const className in schoolData) {
            if (schoolData[className]) {
                studentsToDownload = studentsToDownload.concat(
                    schoolData[className].filter(s => s.jenjang === jenjang)
                );
            }
        }

        if (studentsToDownload.length === 0) {
            showModal(`Tidak ada data siswa ditemukan untuk sekolah ${schoolName} di jenjang ${jenjang.toUpperCase()}.`);
            return;
        }

        // Kumpulkan semua header unik dari semua jawaban kuesioner yang disimpan (yang kini hanya abnormal)
        // Tambahkan juga header identitas
        const allHeadersSet = new Set(identityFields);
        allHeadersSet.add('Waktu Pengisian'); // Tambahkan waktu pengisian sebagai header dasar
        allHeadersSet.add('Status Abnormal'); // Tambahkan kolom status abnormal

        studentsToDownload.forEach(student => {
            for (const key in student.answers) {
                allHeadersSet.add(key);
            }
        });

        const allHeaders = Array.from(allHeadersSet).sort((a, b) => {
            // Prioritaskan header identitas di awal
            const aIsIdentity = identityFields.includes(a);
            const bIsIdentity = identityFields.includes(b);

            if (aIsIdentity && !bIsIdentity) return -1;
            if (!aIsIdentity && bIsIdentity) return 1;

            // Untuk sisanya, urutkan secara alfabetis
            return a.localeCompare(b);
        });


        // Buat baris header CSV
        const csvRows = [];
        csvRows.push(allHeaders.map(header => `"${header}"`).join(','));

        // Isi baris data CSV
        studentsToDownload.forEach(student => {
            const row = [];
            const hasAbnormal = Object.keys(student.answers).some(key => !identityFields.includes(key) && isAnswerAbnormal(key, student.answers[key]));

            allHeaders.forEach(header => {
                let value = '';
                if (header === 'Waktu Pengisian') {
                    value = new Date(student.timestamp).toLocaleString() || '';
                } else if (header === 'Status Abnormal') {
                    value = hasAbnormal ? 'Ya' : 'Tidak';
                }
                else if (student.answers[header] !== undefined) {
                    let answerValue = student.answers[header];
                    if (Array.isArray(answerValue)) {
                        value = answerValue.join('; '); // Gabungkan array dengan semicolon
                    } else if (answerValue !== null && answerValue !== undefined) {
                        value = String(answerValue);
                    }
                }
                // Escape koma dan kutip ganda dalam nilai CSV
                value = value.replace(/"/g, '""'); // Ganti kutip ganda dengan dua kutip ganda
                if (value.includes(',') || value.includes('\n') || value.includes('"')) {
                    value = `"${value}"`; // Bungkus dengan kutip ganda jika mengandung koma, baris baru, atau kutip ganda
                }
                row.push(value);
            });
            csvRows.push(row.join(','));
        });

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `data_skrining_${schoolName.replace(/\s/g, '_')}_${jenjang.toUpperCase()}.csv`;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);

        showModal(`Data untuk sekolah ${schoolName} (Jenjang ${jenjang.toUpperCase()}) berhasil diunduh.`);
    }
    // Jadikan downloadSchoolDataAsCsv dapat diakses secara global
    window.downloadSchoolDataAsCsv = downloadSchoolDataAsCsv;

    // Fungsi untuk menghapus data sekolah berdasarkan jenjang
    function deleteSchoolData(schoolName, jenjangToDelete) {
        console.log(`Attempting to delete data for school: ${schoolName}, jenjang: ${jenjangToDelete}`);

        if (!allSubmittedData[schoolName]) {
            showModal(`Tidak ada data ditemukan untuk sekolah: ${schoolName}.`);
            return;
        }

        let dataChanged = false;
        let classesToRemove = [];

        // Iterasi melalui setiap kelas di sekolah tersebut
        for (const className in allSubmittedData[schoolName]) {
            if (allSubmittedData[schoolName].hasOwnProperty(className)) {
                const initialStudentCount = allSubmittedData[schoolName][className].length;
                // Filter siswa yang jenjangnya tidak sesuai dengan yang akan dihapus
                allSubmittedData[schoolName][className] = allSubmittedData[schoolName][className].filter(student => {
                    return student.jenjang !== jenjangToDelete;
                });

                if (allSubmittedData[schoolName][className].length < initialStudentCount) {
                    dataChanged = true;
                }

                // Jika kelas menjadi kosong setelah filtering, tandai untuk dihapus
                if (allSubmittedData[schoolName][className].length === 0) {
                    classesToRemove.push(className);
                }
            }
        }

        // Hapus kelas yang kosong
        classesToRemove.forEach(className => {
            delete allSubmittedData[schoolName][className];
        });

        // Cek apakah sekolah menjadi kosong sepenuhnya (tidak ada kelas tersisa)
        if (Object.keys(allSubmittedData[schoolName]).length === 0) {
            delete allSubmittedData[schoolName];
            // Hapus juga dari uniqueSchoolNames dan schoolAddresses
            const index = uniqueSchoolNames.indexOf(schoolName);
            if (index > -1) {
                uniqueSchoolNames.splice(index, 1);
                localStorage.setItem('uniqueSchoolNames', JSON.stringify(uniqueSchoolNames));
            }
            delete schoolAddresses[schoolName];
            localStorage.setItem('schoolAddresses', JSON.stringify(schoolAddresses));
            dataChanged = true;
        }

        if (dataChanged) {
            localStorage.setItem('allSubmittedData', JSON.stringify(allSubmittedData));
            showModal(`Data untuk sekolah "${schoolName}" (Jenjang ${jenjangToDelete.toUpperCase()}) berhasil dihapus.`);
            renderRecapView('schools_by_jenjang', jenjangToDelete); // Kembali ke tampilan sekolah setelah hapus
        } else {
            showModal(`Tidak ada data yang dihapus untuk sekolah "${schoolName}" (Jenjang ${jenjangToDelete.toUpperCase()}).`);
        }
    }
    // Jadikan deleteSchoolData dapat diakses secara global
    window.deleteSchoolData = deleteSchoolData;


    // Menampilkan detail data siswa
    function displayStudentData(studentId, school, className, jenjang) {
        const studentsInClass = allSubmittedData[school] && allSubmittedData[school][className] ? allSubmittedData[school][className].filter(s => s.jenjang === jenjang) : [];
        const student = studentsInClass.find(s => s.id === studentId);

        if (!student) {
            appContent.innerHTML = '<p class="text-red-500">Data siswa tidak ditemukan.</p>';
            return;
        }

        let html = `<h2 class="text-2xl font-bold mb-6 text-center text-gray-800">Detail Kuesioner - ${student.name}</h2>
                    <button class="back-button px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200" onclick="renderRecapView('students_by_class_school_jenjang', '${jenjang}', '${school}', '${className}')"><i class="fas fa-arrow-left mr-2"></i>Kembali</button>
                    <div class="bg-white p-6 rounded-lg shadow-md mt-4">
                        <h3 class="text-xl font-semibold mb-4 text-gray-700">Informasi Umum</h3>
                        <p class="mb-2"><strong>Jenjang:</strong> ${student.jenjang.toUpperCase()}</p>
                        <p class="mb-2"><strong>Sekolah:</strong> ${student.answers.nama_sekolah || 'N/A'}</p>
                        <p class="mb-2"><strong>Alamat Sekolah:</strong> ${student.answers.alamat_sekolah || 'N/A'}</p>
                        <p class="mb-2"><strong>Kelas:</strong> ${student.answers.kelas || 'N/A'}</p>
                        <p class="mb-2"><strong>Nama Siswa:</strong> ${student.answers.nama || 'N/A'}</p>
                        <p class="mb-2"><strong>NIK:</strong> ${student.answers.nik || 'N/A'}</p>
                        <p class="mb-2"><strong>Tempat Lahir:</strong> ${student.answers.tempat_lahir || 'N/A'}</p>
                        <p class="mb-2"><strong>Tanggal Lahir:</strong> ${student.answers.tanggal_lahir || 'N/A'}</p>
                        <p class="mb-2"><strong>Umur:</strong> ${student.answers.umur || 'N/A'} THN</p>
                        <p class="mb-2"><strong>Golongan Darah:</strong> ${student.answers.golongan_darah || 'N/A'}</p>
                        <p class="mb-2"><strong>Nama Orang Tua/Wali:</strong> ${student.answers.nama_orangtua || 'N/A'}</p>
                        <p class="mb-2"><strong>Jenis Kelamin:</strong> ${student.answers.jenis_kelamin || 'N/A'}</p>
                        <p class="mb-2"><strong>Disinkronkan:</strong> ${student.synced ? '<span class="text-green-600">Ya</span>' : '<span class="text-red-600">Tidak</span>'}</p>
                        <p class="mb-2"><strong>Waktu Pengisian:</strong> ${new Date(student.timestamp).toLocaleString()}</p>
                    </div>
                    <div class="bg-white p-6 rounded-lg shadow-md mt-6">
                        <h3 class="text-xl font-semibold mb-4 text-gray-700">Jawaban Kuesioner</h3>`;

        const jenjangData = questionnaires[student.jenjang];
        let anyAbnormalQuestionDisplayed = false;

        if (jenjangData) {
            jenjangData.sections.forEach(section => {
                let sectionQuestionsHtml = '';
                let isSectionVisible = false; // Flag to check if any question in this section is displayed

                section.questions.forEach(q => {
                    const key = q.name;
                    // Only display if the question was answered in this submission AND is not an identity field
                    if (student.answers.hasOwnProperty(key) && !identityFields.includes(key)) {
                        const answerValue = student.answers[key];
                        const isAbnormal = isAnswerAbnormal(key, answerValue);
                        const textColorClass = isAbnormal ? 'text-red-600' : '';

                        let displayValue = answerValue;
                        if (Array.isArray(displayValue)) {
                            displayValue = displayValue.join(', ');
                        } else if (displayValue === "") {
                            displayValue = "Tidak diisi";
                        }

                        sectionQuestionsHtml += `<p class="mb-2 ${textColorClass}"><strong>${q.label}:</strong> ${displayValue}</p>`;
                        isSectionVisible = true; // Mark section as visible if it has an answered question
                        if (isAbnormal) {
                            anyAbnormalQuestionDisplayed = true;
                        }
                    }
                });

                // Display section title only if it contains answered questions
                if (isSectionVisible) {
                    html += `<div class="mt-4">
                                <h4 class="text-lg font-semibold mb-2 text-gray-700">${section.title}</h4>
                                ${sectionQuestionsHtml}
                            </div>`;
                }
            });
        }

        if (!anyAbnormalQuestionDisplayed) {
            html += `<p class="text-gray-600">Tidak ada jawaban abnormal atau penyimpangan yang tercatat untuk siswa ini dalam kuesioner.</p>`;
        }

        html += `</div>`;
        appContent.innerHTML = html;
    }
    // Jadikan displayStudentData dapat diakses secara global
    window.displayStudentData = displayStudentData;


    // --- Event Listeners ---
    document.getElementById('nav-sd').addEventListener('click', () => renderQuestionnaire('sd'));
    document.getElementById('nav-smp').addEventListener('click', () => renderQuestionnaire('smp'));
    document.getElementById('nav-sma').addEventListener('click', () => renderQuestionnaire('sma'));
    document.getElementById('nav-rekap').addEventListener('click', () => renderRecapView('jenjang_menu')); // Ubah ini untuk memulai dari menu jenjang

    // Toggle sidebar visibility
    menuToggle.addEventListener('click', () => {
        navSidebar.classList.toggle('-translate-x-full');
        appContent.classList.toggle('md:ml-64'); // Adjust margin for main content
        appContent.classList.toggle('ml-0'); // Reset margin for main content
    });

    // Close sidebar if main content is clicked (on small screens)
    appContent.addEventListener('click', () => {
        if (!navSidebar.classList.contains('-translate-x-full') && window.innerWidth < 768) { // 768px is md breakpoint
            navSidebar.classList.add('-translate-x-full');
            appContent.classList.remove('md:ml-64');
            appContent.classList.add('ml-0');
        }
    });

    // Inisialisasi saat memuat halaman
    updateOnlineStatus();
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Muat tampilan default saat startup (misal, kuesioner SMP)
    renderQuestionnaire('smp');
});
