import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Home, ArrowLeft, Search } from "lucide-react";
import Button from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <Card>
          <CardContent className="p-8 text-center">
            {/* 404 Illustration */}
            <div className="mb-6">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Search className="w-12 h-12 text-gray-400" />
              </div>
              <div className="text-6xl font-bold text-gray-300 mb-2">404</div>
            </div>

            {/* Error Message */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-3">
                Halaman Tidak Ditemukan
              </h1>
              <p className="text-gray-600 leading-relaxed">
                Maaf, halaman yang Anda cari tidak dapat ditemukan. Mungkin
                halaman tersebut telah dipindahkan, dihapus, atau URL yang Anda
                masukkan salah.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={() => navigate(-1)}
                variant="outline"
                className="w-full"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali ke halaman sebelumnya
              </Button>

              <Link to="/">
                <Button className="w-full">
                  <Home className="mr-2 h-4 w-4" />
                  Kembali ke Beranda
                </Button>
              </Link>
            </div>

            {/* Help Text */}
            <div className="mt-6 text-xs text-gray-400">
              Jika masalah terus berlanjut, silakan hubungi admin RT
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotFoundPage;
