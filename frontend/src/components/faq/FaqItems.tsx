import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import Accordion from "../ui/Accordion";
import AccordionItem from "../ui/AccordionItem";

const faqItems = [
  {
    question: "Apa itu SiLaporRT?",
    answer:
      "SiLaporRT adalah aplikasi pelaporan masalah lingkungan di tingkat RT berbasis lokasi, yang memungkinkan warga menyampaikan keluhan seperti jalan rusak, sampah menumpuk, atau lampu mati kepada pengurus RT secara cepat, transparan, dan terdokumentasi.",
  },
  {
    question: "Bagaimana cara membuat laporan di SiLaporRT?",
    answer:
      "Untuk membuat laporan, Anda perlu login terlebih dahulu. Setelah itu, Anda akan mengikuti 4 langkah mudah: (1) Detail Laporan – isi judul dan deskripsi masalah, (2) Lokasi – tentukan titik lokasi kejadian, (3) Lampiran – unggah foto pendukung (opsional), (4) Review – periksa kembali dan kirim laporan.",
  },
  {
    question: "Apa perbedaan laporan publik dan privat?",
    answer:
      "Laporan publik akan ditampilkan di forum transparansi dan bisa dilihat oleh warga lain, sedangkan laporan privat hanya bisa diakses oleh pengurus RT. Anda dapat memilih jenis laporan saat mengisi formulir.",
  },
  {
    question: "Apa itu opsi laporan anonim?",
    answer:
      "Opsi anonim menyembunyikan identitas Anda dari warga lain, namun laporan tetap tampil di forum publik. Pengurus RT tetap dapat melihat identitas pelapor untuk proses tindak lanjut.",
  },
  {
    question: "Bagaimana tindak lanjut terhadap laporan saya?",
    answer:
      "Setelah laporan dikirim, pengurus RT akan mendapatkan notifikasi dan dapat memberikan respons resmi. Status laporan akan terus diperbarui mulai dari diterima, diproses, hingga selesai.",
  },
];

const FaqItems = () => {
  return (
    <Card>
      <CardHeader>
        <div className="text-center">
          <CardTitle className="text-2xl lg:text-3xl font-bold leading-tight mb-3">
            Pertanyaan yang Sering Diajukan
          </CardTitle>
          <p className="text-gray-600 leading-relaxed">
            Temukan jawaban atas pertanyaan paling umum tentang SiLaporRT.
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <Accordion className="space-y-4">
          {faqItems.map((item, index) => (
            <AccordionItem
              key={index}
              question={item.question}
              answer={item.answer}
            />
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default FaqItems;
