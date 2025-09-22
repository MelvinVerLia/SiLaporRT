import React, { useState } from "react";
import { X, Download, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
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

  if (!attachment) return null;

  const currentIndex = attachments.findIndex((att) => att.id === attachment.id);
  const hasNavigation = attachments.length > 1;

  const handlePrevious = () => {
    if (!hasNavigation) return;
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : attachments.length - 1;
    onNavigate?.(attachments[prevIndex]);
  };

  const handleNext = () => {
    if (!hasNavigation) return;
    const nextIndex = currentIndex < attachments.length - 1 ? currentIndex + 1 : 0;
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
        <div className="flex justify-center items-center max-h-[70vh] overflow-hidden">
          <img
            src={attachment.url}
            alt={attachment.filename}
            className="max-w-full max-h-full object-contain rounded-lg"
            onError={() => setImageError(true)}
          />
        </div>
      );
    }

    if (attachment.fileType === "video" && !videoError) {
      return (
        <div className="flex justify-center items-center">
          <video
            controls
            className="max-w-full max-h-[70vh] rounded-lg"
            onError={() => setVideoError(true)}
          >
            <source src={attachment.url} />
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }

    // For documents or if image/video failed to load
    const isPdf = attachment.format?.toLowerCase() === "pdf" || 
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {attachment.filename}
          </h3>
          <p className="text-sm text-gray-500 mb-4">
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
              className="w-full h-96 border border-gray-200 rounded-lg"
              title={attachment.filename}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur ">
      <div className="relative bg-white rounded-lg shadow-xl max-w-5xl max-h-[90vh] w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <FileTypeIcon
              fileType={attachment.fileType}
              format={attachment.format}
              filename={attachment.filename}
              size="sm"
            />
            <div>
              <h2 className="text-lg font-medium text-gray-900 truncate">
                {attachment.filename}
              </h2>
              <p className="text-sm text-gray-500">
                {attachment.fileType.toUpperCase()}
                {attachment.format && ` • ${attachment.format.toUpperCase()}`}
                {hasNavigation && ` • ${currentIndex + 1} dari ${attachments.length}`}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {hasNavigation && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevious}
                  className="p-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNext}
                  className="p-2"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="p-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 overflow-auto max-h-[calc(90vh-120px)]">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AttachmentModal;