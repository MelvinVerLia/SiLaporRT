import React, { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileText,
  MapPin,
  Upload,
  Eye,
  X,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Textarea from "../../components/ui/Textarea";
import LocationPicker from "../../components/features/maps/LocationPicker";
import CloudinaryUpload from "../../components/upload/CloudinaryUpload";
import ReportPreview from "../../components/features/reports/ReportPreview";
import { useCreateReport } from "../../hooks/useCreateReport";
import { CreateReportFormData, Location } from "../../types/report.types";
import { CloudinaryFile } from "../../types/announcement.types";
import { useToast } from "../../hooks/useToast";

// Extended CloudinaryFile untuk keperluan form data
interface ExtendedCloudinaryFile extends CloudinaryFile {
  fileType?: "image" | "video" | "document";
}

// Form validation errors interface
interface FormErrors {
  title?: string;
  description?: string;
  location?: string;
  address?: string;
  rt?: string;
  rw?: string;
  kelurahan?: string;
  kecamatan?: string;
}

// Location form data interface
interface LocationFormData {
  address: string;
  rt: string;
  rw: string;
  kelurahan: string;
  kecamatan: string;
  latitude: number;
  longitude: number;
}

const CreateReportPage: React.FC = () => {
  const createReportMutation = useCreateReport();
  const toast = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isUploading, setIsUploading] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  const [formData, setFormData] = useState<CreateReportFormData>({
    title: "",
    description: "",
    isAnonymous: false,
    isPublic: true,
    location: null,
    attachments: [] as ExtendedCloudinaryFile[],
  });

  // Separate location form state
  const [locationForm, setLocationForm] = useState<LocationFormData>({
    address: "",
    rt: "",
    rw: "",
    kelurahan: "",
    kecamatan: "",
    latitude: 0,
    longitude: 0,
  });

  const steps = [
    {
      number: 1,
      title: "Detail Laporan",
      description: "Informasi dasar laporan",
      icon: FileText,
    },
    {
      number: 2,
      title: "Lokasi",
      description: "Tentukan lokasi kejadian",
      icon: MapPin,
    },
    {
      number: 3,
      title: "Lampiran",
      description: "Upload file (opsional)",
      icon: Upload,
    },
    {
      number: 4,
      title: "Submit Laporan",
      description: "Kirim laporan Anda",
      icon: Check,
    },
  ];

  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {};

    switch (step) {
      case 1:
        if (!formData.title.trim()) {
          newErrors.title = "Judul laporan wajib diisi";
        }
        if (!formData.description.trim()) {
          newErrors.description = "Deskripsi laporan wajib diisi";
        }
        break;

      case 2:
        if (!locationForm.address.trim()) {
          newErrors.address = "Alamat harus diisi";
        }
        if (!locationForm.rt.trim()) {
          newErrors.rt = "RT harus diisi";
        }
        if (!locationForm.rw.trim()) {
          newErrors.rw = "RW harus diisi";
        }
        if (!locationForm.kelurahan.trim()) {
          newErrors.kelurahan = "Kelurahan harus diisi";
        }
        if (!locationForm.kecamatan.trim()) {
          newErrors.kecamatan = "Kecamatan harus diisi";
        }
        if (locationForm.latitude === 0 || locationForm.longitude === 0) {
          newErrors.location = "Koordinat lokasi wajib ditentukan";
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length));
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    try {
      // Create the final form data with location
      const submitData: CreateReportFormData = {
        ...formData,
        location: {
          address: locationForm.address,
          latitude: locationForm.latitude,
          longitude: locationForm.longitude,
          rt: locationForm.rt,
          rw: locationForm.rw,
          kelurahan: locationForm.kelurahan,
          kecamatan: locationForm.kecamatan,
        },
      };

      await createReportMutation.mutateAsync(submitData);
      toast.success("Laporan berhasil dibuat!", "Sukses");
      // Navigation handled by the hook on success
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat membuat laporan";
      toast.error(errorMessage, "Gagal Membuat Laporan");
      console.error("Submit error:", error);
    }
  };

  // Location form handlers
  const handleLocationFormChange = (
    field: keyof LocationFormData,
    value: string | number
  ) => {
    setLocationForm((prev) => ({ ...prev, [field]: value }));

    // Clear related errors
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleLocationSelect = (location: Location | null) => {
    setFormData((prev) => ({ ...prev, location }));
    // Clear location error when location is selected
    if (errors.location) {
      setErrors((prev) => ({ ...prev, location: undefined }));
    }
  };

  const handleCoordinatesChange = (lat: number, lng: number) => {
    setLocationForm((prev) => ({ ...prev, latitude: lat, longitude: lng }));
    // Clear location error when coordinates are set
    if (errors.location) {
      setErrors((prev) => ({ ...prev, location: undefined }));
    }
  };

  // Fungsi untuk mengklasifikasi file type seperti di announcement
  function classifyFile(f: CloudinaryFile): "image" | "video" | "document" {
    const fmt = (f.format || "").toLowerCase();
    const docFormats = [
      "pdf",
      "doc",
      "docx",
      "xls",
      "xlsx",
      "ppt",
      "pptx",
      "txt",
    ];

    if (docFormats.includes(fmt)) return "document";
    if (f.resource_type === "raw") return "document";
    if (f.resource_type === "image") return "image";
    if (f.resource_type === "video") return "video";
    return "document"; // fallback teraman
  }

  // Handler untuk file upload
  function onUploaded(files: CloudinaryFile[]) {
    const mapped: ExtendedCloudinaryFile[] = files.map((f) => {
      const fileType = classifyFile(f);
      return {
        ...f, // spread all CloudinaryFile properties
        fileType, // add the fileType classification
      };
    });
    setFormData((prev) => ({
      ...prev,
      attachments: [...prev.attachments, ...mapped],
    }));
  }

  const removeAttachment = (identifier: string) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter(
        (file) => file.public_id !== identifier
      ),
    }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Detail Laporan
              </h3>
              <p className="text-sm text-gray-600">
                Berikan informasi dasar tentang laporan Anda
              </p>
            </div>

            <Input
              label="Judul Laporan"
              placeholder="Contoh: Jalan berlubang di RT 05"
              value={formData.title}
              limit={100}
              showCounter
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              error={errors.title}
            />

            <Textarea
              label="Deskripsi Laporan"
              placeholder="Jelaskan detail masalah yang ingin dilaporkan..."
              value={formData.description}
              limit={500}
              showCounter
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              error={errors.description}
              rows={4}
            />
          </div>
        );

      case 2:
        return (
          <LocationPicker
            selectedLocation={formData.location}
            onLocationSelect={handleLocationSelect}
            error={errors.location}
            // Location form props
            address={locationForm.address}
            rt={locationForm.rt}
            rw={locationForm.rw}
            kelurahan={locationForm.kelurahan}
            kecamatan={locationForm.kecamatan}
            latitude={locationForm.latitude}
            longitude={locationForm.longitude}
            // Form handlers
            onAddressChange={(address) =>
              handleLocationFormChange("address", address)
            }
            onRtChange={(rt) => handleLocationFormChange("rt", rt)}
            onRwChange={(rw) => handleLocationFormChange("rw", rw)}
            onKelurahanChange={(kelurahan) =>
              handleLocationFormChange("kelurahan", kelurahan)
            }
            onKecamatanChange={(kecamatan) =>
              handleLocationFormChange("kecamatan", kecamatan)
            }
            onCoordinatesChange={handleCoordinatesChange}
            // Error props
            addressError={errors.address}
            rtError={errors.rt}
            rwError={errors.rw}
            kelurahanError={errors.kelurahan}
            kecamatanError={errors.kecamatan}
          />
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Lampiran (Opsional)
              </h3>
              <p className="text-sm text-gray-600">
                Tambahkan foto, video, atau dokumen sebagai bukti laporan Anda
              </p>
            </div>

            <CloudinaryUpload
              folder="reports"
              multiple={true}
              accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
              maxFiles={5}
              attachments={formData.attachments.map((file) => ({
                filename: file.original_filename || "file",
                url: file.secure_url,
                fileType:
                  (file as ExtendedCloudinaryFile).fileType ||
                  classifyFile(file), // Use already classified or classify
                provider: "cloudinary" as const,
                publicId: file.public_id,
                resourceType: file.resource_type,
                format: file.format,
                bytes: file.bytes,
                width: file.width,
                height: file.height,
              }))}
              onUploaded={onUploaded}
              onRemove={removeAttachment}
              onUploadingChange={setIsUploading}
            />
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Submit Laporan
              </h3>
              <p className="text-sm text-gray-600">
                Atur privasi dan kirim laporan Anda
              </p>
            </div>

            {/* Pengaturan Privasi */}
            <div className="space-y-4">
              <div className="pb-3 border-b border-gray-200">
                <h4 className="text-base font-medium text-gray-900 mb-1">
                  Pengaturan Privasi
                </h4>
                <p className="text-xs text-gray-500">
                  Tentukan bagaimana laporan Anda akan ditampilkan
                </p>
              </div>

              {/* Anonymous Option */}
              <div className="flex items-start justify-between py-3 border-b border-gray-200">
                <div className="flex-1 pr-3">
                  <label
                    htmlFor="isAnonymous"
                    className="block text-sm font-medium text-gray-900 mb-0.5 cursor-pointer"
                  >
                    Laporan Anonim
                  </label>
                  <p className="text-xs text-gray-600">
                    Nama Anda tidak akan ditampilkan pada laporan ini. Hanya
                    admin yang dapat melihat identitas Anda.
                  </p>
                </div>
                <div className="flex items-center h-5 mt-0.5">
                  <input
                    id="isAnonymous"
                    type="checkbox"
                    checked={formData.isAnonymous}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        isAnonymous: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Public Option */}
              <div className="flex items-start justify-between py-3 border-b border-gray-200">
                <div className="flex-1 pr-3">
                  <label
                    htmlFor="isPublic"
                    className="block text-sm font-medium text-gray-900 mb-0.5 cursor-pointer"
                  >
                    Laporan Publik
                  </label>
                  <p className="text-xs text-gray-600">
                    Laporan dapat dilihat oleh semua warga di halaman publik.
                    Jika tidak dicentang, hanya Anda dan admin yang dapat
                    melihat.
                  </p>
                </div>
                <div className="flex items-center h-5 mt-0.5">
                  <input
                    id="isPublic"
                    type="checkbox"
                    checked={formData.isPublic}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        isPublic: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Buat Laporan</h1>
        <p className="text-gray-600 mt-1">
          Laporkan masalah di lingkungan RT Anda
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = currentStep === step.number;
          const isCompleted = currentStep > step.number;

          return (
            <div key={step.number} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    isCompleted
                      ? "bg-green-600 border-green-600 text-white"
                      : isActive
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "bg-white border-gray-300 text-gray-400"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                <div className="mt-2 text-center">
                  <p
                    className={`text-sm font-medium ${
                      isActive
                        ? "text-blue-600"
                        : isCompleted
                        ? "text-green-600"
                        : "text-gray-500"
                    }`}
                  >
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-400 hidden sm:block">
                    {step.description}
                  </p>
                </div>
              </div>

              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-4 ${
                    currentStep > step.number ? "bg-green-600" : "bg-gray-300"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Main Grid Layout: Form + Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Form Section */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          {/* Mobile Preview Button - Only visible on small screens */}
          <Button
            variant="outline"
            onClick={() => setIsPreviewModalOpen(true)}
            className="w-full lg:hidden"
          >
            <Eye className="mr-2 h-4 w-4" />
            Lihat Preview
          </Button>

          {/* Form Content */}
          <Card>
            <CardContent className="p-6">
              {/* Mutation Error Display */}
              {createReportMutation.isError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 text-sm">
                    {createReportMutation.error instanceof Error
                      ? createReportMutation.error.message
                      : "Gagal membuat laporan. Silakan coba lagi."}
                  </p>
                </div>
              )}

              {renderStepContent()}
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={
                currentStep === 1 ||
                isUploading ||
                createReportMutation.isPending
              }
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Sebelumnya
            </Button>

            {currentStep < steps.length ? (
              <Button
                onClick={handleNext}
                disabled={isUploading || createReportMutation.isPending}
              >
                Selanjutnya
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                loading={createReportMutation.isPending || isUploading}
                disabled={createReportMutation.isPending || isUploading}
              >
                <Check className="mr-2 h-4 w-4" />
                {createReportMutation.isPending || isUploading
                  ? "Mengirim..."
                  : "Kirim Laporan"}
              </Button>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Live Preview Section */}
        <div className="lg:col-span-5 xl:col-span-4 hidden lg:block">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Preview Laporan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ReportPreview
                title={formData.title}
                description={formData.description}
                isAnonymous={formData.isAnonymous}
                isPublic={formData.isPublic}
                locationData={locationForm}
                attachments={formData.attachments}
                currentStep={currentStep}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Mobile Preview Modal */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setIsPreviewModalOpen(false)}
          />

          {/* Modal Content */}
          <div className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl shadow-xl max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="sticky z-10 top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Preview Laporan
              </h3>
              <button
                onClick={() => setIsPreviewModalOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="p-4">
              <ReportPreview
                title={formData.title}
                description={formData.description}
                isAnonymous={formData.isAnonymous}
                isPublic={formData.isPublic}
                locationData={locationForm}
                attachments={formData.attachments}
                currentStep={currentStep}
              />
            </div>

            <div className="sticky z-10 bottom-0 bg-white border-t border-gray-200 p-4">
              <Button
                variant="outline"
                onClick={() => setIsPreviewModalOpen(false)}
                className="w-full"
              >
                Tutup Preview
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateReportPage;
