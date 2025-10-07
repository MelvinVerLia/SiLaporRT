import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileText,
  MapPin,
  Upload,
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
import Select from "../../components/ui/Select";
import Badge from "../../components/ui/Badge";
import Breadcrumb from "../../components/ui/Breadcrumb";
import LocationPicker from "../../components/features/maps/LocationPicker";
import CloudinaryUpload from "../../components/upload/CloudinaryUpload";
import { useCreateReport } from "../../hooks/useCreateReport";
import { CreateReportFormData, ReportCategory } from "../../types/report.types";
import { CloudinaryFile } from "../../types/announcement.types";
import { useToast } from "../../hooks/useToast";
import { useAuthContext } from "../../contexts/AuthContext";
import { Role } from "../../types/auth.types";

// Extended CloudinaryFile untuk keperluan form data
interface ExtendedCloudinaryFile extends CloudinaryFile {
  fileType?: "image" | "video" | "document";
}

// Form validation errors interface
interface FormErrors {
  title?: string;
  description?: string;
  category?: string;
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
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthContext();
  const toast = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isUploading, setIsUploading] = useState(false);

  const isAdmin = user?.role === Role.RT_ADMIN;

  // Detect where user came from based on location state or current URL context
  const isFromAdmin =
    location.state?.from === "admin" ||
    location.pathname.includes("/admin") ||
    document.referrer.includes("/admin/reports");

  const [formData, setFormData] = useState<CreateReportFormData>({
    title: "",
    description: "",
    category: "",
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
      title: "Review",
      description: "Periksa dan kirim",
      icon: Check,
    },
  ];

  const categoryOptions = [
    { value: "", label: "Pilih Kategori" },
    { value: ReportCategory.INFRASTRUCTURE, label: "Infrastruktur" },
    { value: ReportCategory.CLEANLINESS, label: "Kebersihan" },
    { value: ReportCategory.LIGHTING, label: "Penerangan" },
    { value: ReportCategory.SECURITY, label: "Keamanan" },
    { value: ReportCategory.UTILITIES, label: "Utilitas" },
    { value: ReportCategory.ENVIRONMENT, label: "Lingkungan" },
    { value: ReportCategory.SUGGESTION, label: "Saran" },
    { value: ReportCategory.OTHER, label: "Lainnya" },
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
        if (!formData.category) {
          newErrors.category = "Kategori wajib dipilih";
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

  const handleLocationSelect = (location: any) => {
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

  const getCategoryLabel = (category: string) => {
    const option = categoryOptions.find((opt) => opt.value === category);
    return option?.label || category;
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
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Detail Laporan
              </h2>
              <p className="text-gray-600">
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

            <Select
              label="Kategori"
              options={categoryOptions}
              value={formData.category}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  category: e.target.value as ReportCategory,
                }))
              }
              error={errors.category}
            />

            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Pengaturan Privasi</h3>

              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.isAnonymous}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        isAnonymous: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    Laporkan secara anonim (nama tidak ditampilkan)
                  </span>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.isPublic}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        isPublic: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    Tampilkan di laporan publik (dapat dilihat semua warga)
                  </span>
                </label>
              </div>
            </div>
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
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Lampiran (Opsional)
              </h3>
              <p className="text-gray-600 text-sm">
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
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Review Laporan
              </h2>
              <p className="text-gray-600">
                Periksa kembali laporan Anda sebelum mengirim
              </p>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Detail Laporan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600 ">
                      Judul
                    </label>
                    <p className="text-gray-900 whitespace-pre-wrap break-words">
                      {formData.title}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600 ">
                      Kategori
                    </label>
                    <div className="mt-1">
                      <Badge variant="default">
                        {getCategoryLabel(formData.category)}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Deskripsi
                    </label>
                    <p className="text-gray-900 text-sm whitespace-pre-wrap break-words">
                      {formData.description}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {formData.isAnonymous && (
                      <Badge variant="default" size="sm">
                        Anonim
                      </Badge>
                    )}
                    {formData.isPublic && (
                      <Badge variant="info" size="sm">
                        Publik
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Lokasi</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-gray-900">{locationForm.address}</p>
                    <p className="text-sm text-gray-600">
                      RT {locationForm.rt} RW {locationForm.rw}
                    </p>
                    <p className="text-sm text-gray-600">
                      {locationForm.kelurahan}, {locationForm.kecamatan}
                    </p>
                    <p className="text-xs text-gray-500">
                      {locationForm.latitude.toFixed(6)},{" "}
                      {locationForm.longitude.toFixed(6)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {formData.attachments.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Lampiran</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-900">
                      {formData.attachments.length} file terlampir
                    </p>
                    <div className="mt-2 space-y-1">
                      {formData.attachments.map((file, index) => {
                        const fileType =
                          (file as ExtendedCloudinaryFile).fileType ||
                          classifyFile(file);
                        const icon =
                          fileType === "image"
                            ? "🖼️"
                            : fileType === "video"
                            ? "🎥"
                            : "📄";
                        return (
                          <p key={index} className="text-sm text-gray-600">
                            {icon} {file.original_filename || "file"} (
                            {fileType})
                          </p>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const handleCancel = () => {
    // Navigate back based on where user came from
    if (isFromAdmin) {
      navigate("/admin/reports");
    } else {
      navigate("/reports");
    }
  };

  // Dynamic breadcrumb based on user role and origin
  const breadcrumbItems =
    isAdmin && isFromAdmin
      ? [
          { label: "Kelola Laporan", href: "/admin/reports" },
          { label: "Buat Laporan" },
        ]
      : [];

  return (
    <div className="space-y-6">
      {/* Breadcrumb - only show for admin */}
      {isAdmin && isFromAdmin && <Breadcrumb items={breadcrumbItems} />}

      {/* Header */}
      <div>
        <div className="flex items-center space-x-3 mb-2">
          {isAdmin && isFromAdmin && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <h1 className="text-3xl font-bold text-gray-900">Buat Laporan</h1>
        </div>
        <p className="text-gray-600">Laporkan masalah di lingkungan RT Anda</p>
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

      {/* Form Content */}
      <Card>
        <CardContent className="p-8">
          {/* Mutation Error Display */}
          {createReportMutation.isError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
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
            currentStep === 1 || isUploading || createReportMutation.isPending
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
  );
};

export default CreateReportPage;
