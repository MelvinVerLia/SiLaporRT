import React, { useEffect, useRef } from "react";
import { Navigation } from "lucide-react";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import { Location } from "../../../types/report.types";
import {
  GoogleMap,
  LoadScript,
  Marker,
  Autocomplete,
  Libraries,
} from "@react-google-maps/api";

interface LocationPickerProps {
  selectedLocation: Location | null;
  onLocationSelect: (location: Location) => void;
  error?: string;
  // Form data props from parent
  address: string;
  rt: string;
  rw: string;
  kelurahan: string;
  kecamatan: string;
  latitude: number;
  longitude: number;
  // Form handlers from parent
  onAddressChange: (address: string) => void;
  onRtChange: (rt: string) => void;
  onRwChange: (rw: string) => void;
  onKelurahanChange: (kelurahan: string) => void;
  onKecamatanChange: (kecamatan: string) => void;
  onCoordinatesChange: (lat: number, lng: number) => void;
  // Error props from parent
  addressError?: string;
  rtError?: string;
  rwError?: string;
  kelurahanError?: string;
  kecamatanError?: string;
}

const containerStyle = { width: "100%", height: "400px" };
const center = { lat: -6.2, lng: 106.816666 }; // Jakarta

const LocationPicker: React.FC<LocationPickerProps> = ({
  selectedLocation,
  onLocationSelect,
  error,
  address,
  rt,
  rw,
  kelurahan,
  kecamatan,
  latitude,
  longitude,
  onAddressChange,
  onRtChange,
  onRwChange,
  onKelurahanChange,
  onKecamatanChange,
  onCoordinatesChange,
  addressError,
  rtError,
  rwError,
  kelurahanError,
  kecamatanError,
}) => {
  const [isSelectingLocation, setIsSelectingLocation] = React.useState(false);
  const [geocoder, setGeocoder] = React.useState<google.maps.Geocoder | null>(
    null,
  );

  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const libraries: Libraries = ["places"];

  // Determine if location data is from map (has coordinates)
  const isFromMap = !!(latitude && longitude);

  // Get current marker position; prefer explicit coords, then selectedLocation, else default center
  const markerPosition =
    latitude && longitude
      ? { lat: latitude, lng: longitude }
      : selectedLocation
        ? { lat: selectedLocation.latitude, lng: selectedLocation.longitude }
        : center;

  const autocompleteInputRef = useRef<HTMLInputElement | null>(null);

  // Hydrate form fields from selectedLocation when provided (once) without overriding user input
  useEffect(() => {
    if (!selectedLocation) return;

    const needsCoords = !latitude || !longitude;
    const needsAddress = !address;
    const needsRT = !rt;
    const needsRW = !rw;
    const needsKel = !kelurahan;
    const needsKec = !kecamatan;

    if (needsCoords) {
      onCoordinatesChange(
        selectedLocation.latitude,
        selectedLocation.longitude,
      );
    }
    if (needsAddress && selectedLocation.address) {
      onAddressChange(selectedLocation.address);
    }
    if (needsRT && typeof selectedLocation.rt !== "undefined") {
      onRtChange(selectedLocation.rt);
    }
    if (needsRW && typeof selectedLocation.rw !== "undefined") {
      onRwChange(selectedLocation.rw);
    }
    if (needsKel && selectedLocation.kelurahan) {
      onKelurahanChange(selectedLocation.kelurahan);
    }
    if (needsKec && selectedLocation.kecamatan) {
      onKecamatanChange(selectedLocation.kecamatan);
    }
    // Intentionally exclude handler deps to avoid re-running when user edits fields
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLocation]);

  function getAddressComponent(
    components: google.maps.GeocoderAddressComponent[],
    type: string,
  ) {
    const comp = components.find((c) => c.types.includes(type));
    return comp ? comp.long_name : "";
  }

  const updateLocationData = (
    lat: number,
    lng: number,
    addressComponents: google.maps.GeocoderAddressComponent[],
    formattedAddress: string,
  ) => {
    const kecamatan = getAddressComponent(
      addressComponents,
      "administrative_area_level_3",
    );
    const kelurahan =
      getAddressComponent(addressComponents, "administrative_area_level_4") ||
      getAddressComponent(addressComponents, "sublocality");

    const rtComp = addressComponents.find((c) => c.long_name.startsWith("RT"));
    const rwComp = addressComponents.find((c) => c.long_name.startsWith("RW"));

    // Update coordinates
    onCoordinatesChange(lat, lng);

    // Update address fields
    onAddressChange(formattedAddress);
    onKelurahanChange(kelurahan);
    onKecamatanChange(kecamatan);
    onRtChange(rtComp?.long_name.replace("RT ", "") || "");
    onRwChange(rwComp?.long_name.replace("RW ", "") || "");

    // Create location object and notify parent
    const location: Location = {
      address: formattedAddress,
      latitude: lat,
      longitude: lng,
      rt: rtComp?.long_name.replace("RT ", "") || "",
      rw: rwComp?.long_name.replace("RW ", "") || "",
    };

    onLocationSelect(location);
  };

  // Handle autocomplete place selection
  const handlePlaceChanged = () => {
    const place = autocompleteRef.current?.getPlace();
    if (place?.geometry?.location) {
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      const components = place.address_components || [];
      const formattedAddress = place.formatted_address || "";

      updateLocationData(lat, lng, components, formattedAddress);
    }
  };

  // Handle map click
  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng && geocoder) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();

      // Update coordinates immediately
      onCoordinatesChange(lat, lng);

      // Auto geocoding
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === "OK" && results![0]) {
          const components = results![0].address_components;
          const formattedAddress = results![0].formatted_address || "";

          // Update all location data
          updateLocationData(lat, lng, components, formattedAddress);

          // Sync search bar
          if (autocompleteInputRef.current) {
            autocompleteInputRef.current.value = formattedAddress;
          }
        }
      });
    }
  };

  // Use current location
  const handleUseCurrentLocation = async () => {
    setIsSelectingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        onCoordinatesChange(lat, lng);

        if (geocoder) {
          geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            if (status === "OK" && results![0]) {
              const components = results![0].address_components;
              const formattedAddress = results![0].formatted_address || "";

              updateLocationData(lat, lng, components, formattedAddress);

              // Sync search bar
              if (autocompleteInputRef.current) {
                autocompleteInputRef.current.value = formattedAddress;
              }
            } else {
              // Still update coordinates even if geocoding fails
              const location: Location = {
                address: `${lat}, ${lng}`,
                latitude: lat,
                longitude: lng,
                rt: "",
                rw: "",
              };
              onLocationSelect(location);
            }
            setIsSelectingLocation(false);
          });
        } else {
          setIsSelectingLocation(false);
        }
      },
      (error) => {
        console.error("Error getting location:", error);
        alert("Gagal mendapatkan lokasi saat ini");
        setIsSelectingLocation(false);
      },
    );
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
          Pilih Lokasi Kejadian
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Gunakan pencarian, klik pada peta, atau tombol lokasi saat ini
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-600 dark:text-red-400 text-sm">{error} hehe</p>
        </div>
      )}

      <LoadScript
        googleMapsApiKey={import.meta.env.VITE_API_GOOGLE_MAP}
        libraries={libraries}
      >
        <Autocomplete
          onLoad={(ref) => (autocompleteRef.current = ref)}
          onPlaceChanged={handlePlaceChanged}
        >
          <input
            ref={autocompleteInputRef}
            type="text"
            placeholder="Cari lokasi..."
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg mb-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </Autocomplete>

        <GoogleMap
          mapContainerStyle={containerStyle}
          center={markerPosition}
          zoom={13}
          onClick={handleMapClick}
          onLoad={() => setGeocoder(new google.maps.Geocoder())}
        >
          <Marker position={markerPosition} />
        </GoogleMap>
      </LoadScript>

      {/* Action Buttons */}
      <div className="space-y-4">
        {!isFromMap && (
          <div className="p-4 bg-primary-50 dark:bg-gray-800 border border-primary-100 dark:border-gray-700 rounded-lg">
            <p className="text-sm text-primary-700 dark:text-gray-300">
              💡 Pilih lokasi dari peta untuk melanjutkan
            </p>
          </div>
        )}

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

        {/* Location Details - Only shown when coordinates exist */}
        {isFromMap && (
          <div className="space-y-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900 dark:text-gray-100">
                Detail Lokasi
              </h4>
              <span className="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded">
                Dari Google Maps
              </span>
            </div>

            <Input
              label="Alamat Lengkap"
              value={address}
              placeholder="Masukkan detail Alamat"
              error={addressError}
              onChange={(e) => onAddressChange(e.target.value)}
              disabled={true}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Kelurahan"
                value={kelurahan}
                placeholder="Masukkan nama Kelurahan"
                error={kelurahanError}
                onChange={(e) => onKelurahanChange(e.target.value)}
                // disabled={true}
              />
              <Input
                label="Kecamatan"
                value={kecamatan}
                placeholder="Masukkan nama Kecamatan"
                error={kecamatanError}
                onChange={(e) => onKecamatanChange(e.target.value)}
                // disabled={true}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="RT"
                value={rt}
                placeholder="Contoh: 01"
                error={rtError}
                onChange={(e) => onRtChange(e.target.value)}
              />
              <Input
                label="RW"
                value={rw}
                placeholder="Contoh: 01"
                error={rwError}
                onChange={(e) => onRwChange(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationPicker;
