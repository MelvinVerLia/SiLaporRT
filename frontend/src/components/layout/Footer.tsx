import React from "react";
import { MapPin, Mail, Phone, Clock } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white py-6 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div className="ml-3">
                <h3 className="text-xl font-bold">SiLaporRT</h3>
                <p className="text-sm text-gray-400">
                  Sistem Pelaporan RT Digital
                </p>
              </div>
            </div>
            <p className="text-gray-400 mb-4">
              Platform digital untuk pelaporan masalah masyarakat di tingkat RT.
              Memudahkan warga dalam menyampaikan keluhan dan meningkatkan
              transparansi penanganan.
            </p>

            <a className="text-gray-400 mb-4" href="http://www.freepik.com">
              Illustrations by vectorjuice / Freepik
            </a>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4 flex items-center">
              <Phone className="w-5 h-5 mr-2" />
              Kontak
            </h4>
            <div className="space-y-2 text-gray-400">
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                <span>info@silaporrt.id</span>
              </div>
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-2" />
                <span>0800-1234-5678</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Layanan
            </h4>
            <div className="space-y-2 text-gray-400">
              <p>Senin - Jumat: 08:00 - 17:00</p>
              <p>Sabtu: 08:00 - 12:00</p>
              <p>Minggu: Tutup</p>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-6 pt-6 text-center text-gray-400">
          <p>
            &copy; 2025 SiLaporRT. Platform Pelaporan Digital untuk Masyarakat
            Indonesia.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
