import React, { useState, useEffect } from "react";
import { MapPin, Navigation, Check } from "lucide-react";
import Button from "../../ui/Button";
import Input from "../../ui/Input";
import { Location } from "../../../types/report.types";

interface LocationPickerProps {
  selectedLocation: Location | null;
  onLocationSelect: (location: Location) => void;
  error?: string;
}

const LocationPicker: React.FC<LocationPickerProps> = ({
  selectedLocation,
  onLocationSelect,
  error,
}) => {
  const [isSelectingLocation, setIsSelectingLocation] = useState(false);
  const [address, setAddress] = useState("");
  const [rt, setRt] = useState("");
  const [rw, setRw] = useState("");

  useEffect(() => {
    if (selectedLocation) {
      setAddress(selectedLocation.address);
      setRt(selectedLocation.rt);
      setRw(selectedLocation.rw);
    }
  }, [selectedLocation]);

  const handleUseCurrentLocation = () => {
    setIsSelectingLocation(true);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;

          // Mock reverse geocoding - in real app, use proper geocoding service
          const mockLocation: Location = {
            latitude,
            longitude,
            address: "Jl. Contoh No. 123",
            rt: "05",
            rw: "02",
            kelurahan: "Kelurahan Contoh",
            kecamatan: "Kecamatan Contoh",
          };

          onLocationSelect(mockLocation);
          setIsSelectingLocation(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setIsSelectingLocation(false);
          alert(
            "Gagal mendapatkan lokasi. Pastikan GPS aktif dan berikan izin lokasi."
          );
        }
      );
    } else {
      alert("Browser tidak mendukung geolocation");
      setIsSelectingLocation(false);
    }
  };

  const handleManualLocation = () => {
    if (!address || !rt || !rw) {
      alert("Mohon lengkapi alamat, RT, dan RW");
      return;
    }

    // Mock coordinates for manual input
    const mockLocation: Location = {
      latitude: -6.2088 + (Math.random() - 0.5) * 0.01,
      longitude: 106.8456 + (Math.random() - 0.5) * 0.01,
      address,
      rt,
      rw,
      kelurahan: "Kelurahan Contoh",
      kecamatan: "Kecamatan Contoh",
    };

    onLocationSelect(mockLocation);
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Pilih Lokasi Kejadian
        </h3>
        <p className="text-gray-600 text-sm">
          Tentukan lokasi kejadian yang akan dilaporkan
        </p>
      </div>

      {/* Current Location Button */}
      <div className="space-y-4">
        <Button
          type="button"
          onClick={handleUseCurrentLocation}
          loading={isSelectingLocation}
          className="w-full"
          disabled={isSelectingLocation}
        >
          <Navigation className="mr-2 h-4 w-4" />
          {isSelectingLocation
            ? "Mendapatkan Lokasi..."
            : "Gunakan Lokasi Saat Ini"}
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">atau</span>
          </div>
        </div>

        {/* Manual Location Input */}
        <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h4 className="font-medium text-gray-900">Input Manual</h4>

          <Input
            label="Alamat Lengkap"
            placeholder="Contoh: Jl. Mawar No. 45"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="RT"
              placeholder="05"
              value={rt}
              onChange={(e) => setRt(e.target.value)}
            />
            <Input
              label="RW"
              placeholder="02"
              value={rw}
              onChange={(e) => setRw(e.target.value)}
            />
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleManualLocation}
            className="w-full"
          >
            <MapPin className="mr-2 h-4 w-4" />
            Gunakan Alamat Ini
          </Button>
        </div>
      </div>

      {/* Selected Location Display */}
      {selectedLocation && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start">
            <Check className="h-5 w-5 text-green-600 mr-3 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-green-900 mb-1">
                Lokasi Terpilih
              </h4>
              <p className="text-sm text-green-800">
                {selectedLocation.address}
              </p>
              <p className="text-sm text-green-700">
                RT {selectedLocation.rt} RW {selectedLocation.rw}
              </p>
              <p className="text-xs text-green-600 mt-1">
                Koordinat: {selectedLocation.latitude.toFixed(6)},{" "}
                {selectedLocation.longitude.toFixed(6)}
              </p>
            </div>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </div>
  );
};

export default LocationPicker;
