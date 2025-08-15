import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import LocationPicker from "../../components/features/maps/LocationPicker";
import ImageUpload from "../../components/features/media/ImageUpload";
import {
  CreateReportFormData,
  ReportCategory,
  Location,
} from "../../types/report.types";

const CreateReportPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<CreateReportFormData>({
    title: "",
    description: "",
    category: "",
    isAnonymous: false,
    isPublic: true,
    location: null,
    attachments: [],
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
      description: "Upload foto (opsional)",
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
    const newErrors: Record<string, string> = {};

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
        if (!formData.location) {
          newErrors.location = "Lokasi kejadian wajib ditentukan";
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

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock success - in real app, call actual API
      console.log("Form data to submit:", formData);

      alert("Laporan berhasil dibuat!");
      navigate("/my-reports");
    } catch (error) {
      alert("Gagal membuat laporan. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryLabel = (category: string) => {
    const option = categoryOptions.find((opt) => opt.value === category);
    return option?.label || category;
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
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              error={errors.title}
            />

            <Textarea
              label="Deskripsi Laporan"
              placeholder="Jelaskan detail masalah yang ingin dilaporkan..."
              value={formData.description}
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
            onLocationSelect={(location) =>
              setFormData((prev) => ({ ...prev, location }))
            }
            error={errors.location}
          />
        );

      case 3:
        return (
          <ImageUpload
            files={formData.attachments}
            onFilesChange={(files) =>
              setFormData((prev) => ({ ...prev, attachments: files }))
            }
            maxFiles={5}
          />
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
                    <label className="text-sm font-medium text-gray-600">
                      Judul
                    </label>
                    <p className="text-gray-900">{formData.title}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">
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
                    <p className="text-gray-900 text-sm whitespace-pre-wrap">
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

              {formData.location && (
                <Card>
                  <CardHeader>
                    <CardTitle>Lokasi</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-gray-900">
                        {formData.location.address}
                      </p>
                      <p className="text-sm text-gray-600">
                        RT {formData.location.rt} RW {formData.location.rw}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formData.location.latitude.toFixed(6)},{" "}
                        {formData.location.longitude.toFixed(6)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

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
                      {formData.attachments.map((file, index) => (
                        <p key={index} className="text-sm text-gray-600">
                          • {file.name}
                        </p>
                      ))}
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

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Buat Laporan</h1>
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
        <CardContent className="p-8">{renderStepContent()}</CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 1}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Sebelumnya
        </Button>

        {currentStep < steps.length ? (
          <Button onClick={handleNext}>
            Selanjutnya
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} loading={isSubmitting}>
            <Check className="mr-2 h-4 w-4" />
            {isSubmitting ? "Mengirim..." : "Kirim Laporan"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default CreateReportPage;
