import React from "react";
import { MapPin, FileText, Calendar, EyeOff, Globe, Lock } from "lucide-react";
import { CloudinaryFile } from "../../../types/announcement.types";

interface ReportPreviewProps {
  title: string;
  description: string;
  isAnonymous: boolean;
  isPublic: boolean;
  locationData: {
    address: string;
    rt: string;
    rw: string;
    kelurahan: string;
    kecamatan: string;
    latitude: number;
    longitude: number;
  };
  attachments: CloudinaryFile[];
  currentStep: number;
}

const ReportPreview: React.FC<ReportPreviewProps> = ({
  title,
  description,
  isAnonymous,
  isPublic,
  locationData,
  attachments,
  currentStep,
}) => {
  // Check if we have any data to preview
  const hasTitle = title.trim().length > 0;
  const hasDescription = description.trim().length > 0;
  const hasLocation =
    locationData.address.trim().length > 0 &&
    locationData.latitude !== 0 &&
    locationData.longitude !== 0;
  const hasAttachments = attachments.length > 0;

  // Empty state
  if (!hasTitle && !hasDescription && !hasLocation && !hasAttachments) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileText className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Preview akan muncul saat Anda mengisi form
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Title */}
      {hasTitle && (
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1 whitespace-pre-wrap break-words">
            {title}
          </h3>
          {currentStep >= 4 && (
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <Calendar className="h-3 w-3" />
              <span>{new Date().toLocaleDateString("id-ID")}</span>
            </div>
          )}
        </div>
      )}

      {/* Privacy Badges */}
      {currentStep >= 4 && (
        <div className="flex flex-wrap gap-2">
          {isAnonymous && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
              <EyeOff className="h-3 w-3" />
              <span>Anonim</span>
            </div>
          )}
          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
              isPublic
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {isPublic ? (
              <>
                <Globe className="h-3 w-3" />
                <span>Publik</span>
              </>
            ) : (
              <>
                <Lock className="h-3 w-3" />
                <span>Privat</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Description */}
      {hasDescription && (
        <div>
          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
            {description}
          </p>
        </div>
      )}

      {/* Location */}
      {hasLocation && (
        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {locationData.address}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                RT {locationData.rt} RW {locationData.rw}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-300">
                {locationData.kelurahan}, {locationData.kecamatan}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Attachments */}
      {hasAttachments && (
        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {attachments.length} Lampiran
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {attachments.slice(0, 5).map((file, index) => (
              <div
                key={index}
                className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200 dark:border-gray-700"
              >
                {file.resource_type === "image" ? (
                  <img
                    src={file.secure_url}
                    alt={file.original_filename || "attachment"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-2">
                    <FileText className="h-8 w-8 text-gray-400 dark:text-gray-500 mb-1" />
                    <span className="text-xs text-gray-600 dark:text-gray-300 text-center truncate w-full px-1">
                      {file.original_filename || "file"}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportPreview;
