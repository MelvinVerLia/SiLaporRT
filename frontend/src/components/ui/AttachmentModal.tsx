import React, { useState, useEffect } from "react";
import {
  X,
  Download,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Button from "./Button";
import FileTypeIcon from "./FileTypeIcon";

interface Attachment {
  id: string;
  filename: string;
  url: string;
  fileType: "image" | "video" | "document";
  format?: string;
  bytes?: number;
}

interface AttachmentModalProps {
  attachment: Attachment | null;
  attachments?: Attachment[];
  onClose: () => void;
  onNavigate?: (attachment: Attachment) => void;
}

const AttachmentModal: React.FC<AttachmentModalProps> = ({
  attachment,
  attachments = [],
  onClose,
  onNavigate,
}) => {
  const [imageError, setImageError] = useState(false);
  const [videoError, setVideoError] = useState(false);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (attachment) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "auto";
    };
  }, [attachment, onClose]);

  if (!attachment) return null;

  const currentIndex = attachments.findIndex((att) => att.id === attachment.id);
  const hasNavigation = attachments.length > 1;

  const handlePrevious = () => {
    if (!hasNavigation) return;
    const prevIndex =
      currentIndex > 0 ? currentIndex - 1 : attachments.length - 1;
    onNavigate?.(attachments[prevIndex]);
  };

  const handleNext = () => {
    if (!hasNavigation) return;
    const nextIndex =
      currentIndex < attachments.length - 1 ? currentIndex + 1 : 0;
    onNavigate?.(attachments[nextIndex]);
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    const kb = bytes / 1024;
    const mb = kb / 1024;

    if (mb >= 1) {
      return `${mb.toFixed(1)} MB`;
    } else {
      return `${kb.toFixed(0)} KB`;
    }
  };

  const renderContent = () => {
    if (attachment.fileType === "image" && !imageError) {
      return (
        <div className="flex justify-center items-center w-full h-full p-4">
          <img
            src={attachment.url}
            alt={attachment.filename}
            className="max-w-full max-h-full object-contain"
            onError={() => setImageError(true)}
          />
        </div>
      );
    }

    if (attachment.fileType === "video" && !videoError) {
      return (
        <div className="flex justify-center items-center w-full">
          <video
            controls
            className="w-full max-h-[70vh] rounded-lg"
            onError={() => setVideoError(true)}
          >
            <source src={attachment.url} />
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }

    // For documents or if image/video failed to load
    const isPdf =
      attachment.format?.toLowerCase() === "pdf" ||
      attachment.filename.toLowerCase().endsWith(".pdf");

    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-6">
        <FileTypeIcon
          fileType={attachment.fileType}
          format={attachment.format}
          filename={attachment.filename}
          size="lg"
          className="opacity-60"
        />

        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            {attachment.filename}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {attachment.fileType.toUpperCase()}
            {attachment.format && ` • ${attachment.format.toUpperCase()}`}
            {attachment.bytes && ` • ${formatFileSize(attachment.bytes)}`}
          </p>
        </div>

        <div className="flex gap-3">
          {isPdf && (
            <Button
              variant="outline"
              onClick={() => window.open(attachment.url, "_blank")}
              className="flex items-center"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Buka di Tab Baru
            </Button>
          )}

          <Button
            onClick={() => {
              const link = document.createElement("a");
              link.href = attachment.url;
              link.download = attachment.filename;
              link.click();
            }}
            className="flex items-center"
          >
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </div>

        {isPdf && (
          <div className="w-full max-w-4xl">
            <iframe
              src={`${attachment.url}#toolbar=0`}
              className="w-full h-96 border border-gray-200 dark:border-gray-700 rounded-lg"
              title={attachment.filename}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur bg-black/40 dark:bg-black/60 p-2 sm:p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-5xl max-h-[95vh] sm:max-h-[90vh] w-full overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
            <FileTypeIcon
              fileType={attachment.fileType}
              format={attachment.format}
              filename={attachment.filename}
              size="sm"
              className="flex-shrink-0"
            />
            <div className="min-w-0 flex-1">
              <h2 className="text-sm sm:text-lg font-medium text-gray-900 dark:text-gray-100 truncate">
                {attachment.filename}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                {attachment.fileType.toUpperCase()}
                {attachment.format && ` • ${attachment.format.toUpperCase()}`}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="p-1.5 sm:p-2 flex-shrink-0 sm:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Desktop close button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="p-2 hidden sm:flex flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation counter - separate row for mobile */}
        {hasNavigation && (
          <div className="px-3 py-2 sm:hidden border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              {currentIndex + 1} dari {attachments.length}
            </p>
          </div>
        )}

        {/* Content with Navigation Buttons */}
        <div className="relative flex-1 overflow-auto min-h-0">
          {/* Navigation Buttons - Floating on sides */}
          {hasNavigation && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevious();
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full p-2 sm:p-3 shadow-lg backdrop-blur-sm transition-all"
              >
                <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full p-2 sm:p-3 shadow-lg backdrop-blur-sm transition-all"
              >
                <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </>
          )}

          <div
            className={`h-full ${attachment.fileType !== "image" && "p-3 sm:p-4"}`}
          >
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttachmentModal;
