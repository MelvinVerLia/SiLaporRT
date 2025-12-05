import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/Card";
import Accordion from "../../../components/ui/Accordion";
import AccordionItem from "../../../components/ui/AccordionItem";

const faqItems = [
  {
    question: "Apa itu SiLaporRT?",
    answer:
      "SiLaporRT adalah aplikasi pelaporan berbasis lokasi di tingkat RT yang memudahkan warga menyampaikan keluhan lingkungan seperti jalan rusak, sampah menumpuk, atau lampu jalan mati. Semua laporan dikirim langsung ke pengurus RT secara cepat, transparan, dan terdokumentasi dengan baik.",
  },
  {
    question: "Bagaimana cara membuat laporan di SiLaporRT?",
    answer:
      "Untuk membuat laporan, pastikan Anda sudah login terlebih dahulu. Setelah itu, buka halaman Buat Laporan dan ikuti empat langkah mudah berikut: (1) Tuliskan judul dan deskripsi masalah, (2) Tandai titik lokasi kejadian di peta, (3) Unggah foto pendukung, (4) Periksa kembali detail laporan sebelum dikirim.",
  },
  {
    question: "Apa perbedaan laporan publik dan privat?",
    answer:
      "Laporan publik akan tampil di forum transparansi dan dapat dilihat oleh seluruh warga, sedangkan laporan privat hanya dapat diakses oleh pengurus RT. Anda dapat memilih jenis laporan ini saat mengisi formulir.",
  },
  {
    question: "Apa itu opsi laporan anonim?",
    answer:
      "Opsi anonim menyembunyikan identitas Anda dari warga lain, namun laporan tetap muncul di forum publik. Pengurus RT tetap dapat melihat identitas pelapor untuk keperluan tindak lanjut.",
  },
  {
    question: "Bagaimana proses tindak lanjut terhadap laporan saya?",
    answer:
      "Setelah laporan dikirim, pengurus RT akan menerima notifikasi dan meninjau laporan tersebut. Status laporan akan diperbarui secara berkala mulai dari diterima, diproses, hingga selesai.",
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
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            Temukan jawaban atas pertanyaan paling umum tentang SiLaporRT.
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <Accordion className="space-y-4">
          {faqItems.map((item, index) => (
            <AccordionItem
              key={index}
              number={index + 1}
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
