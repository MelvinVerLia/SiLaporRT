import React from "react";
import {
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
  FileArchive,
  FileSpreadsheet,
  File,
} from "lucide-react";

interface FileTypeIconProps {
  fileType: "image" | "video" | "audio" | "document";
  format?: string;
  filename?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const FileTypeIcon: React.FC<FileTypeIconProps> = ({
  fileType,
  format,
  filename,
  size = "md",
  className = "",
}) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  const iconSize = sizeClasses[size];

  // Get specific icon based on file type and format
  const getIcon = () => {
    if (fileType === "image") {
      return <FileImage className={`${iconSize} text-green-500`} />;
    }

    if (fileType === "video") {
      return <FileVideo className={`${iconSize} text-red-500`} />;
    }

    if (fileType === "audio") {
      return <FileAudio className={`${iconSize} text-purple-500`} />;
    }

    // Document types
    const fmt = (format || "").toLowerCase();
    const name = (filename || "").toLowerCase();

    // PDF
    if (fmt === "pdf" || name.endsWith(".pdf")) {
      return <FileText className={`${iconSize} text-red-600`} />;
    }

    // Spreadsheet files
    if (
      ["xls", "xlsx", "csv"].includes(fmt) ||
      name.match(/\.(xls|xlsx|csv)$/)
    ) {
      return <FileSpreadsheet className={`${iconSize} text-green-600`} />;
    }

    // Presentation files
    if (["ppt", "pptx"].includes(fmt) || name.match(/\.(ppt|pptx)$/)) {
      return <FileText className={`${iconSize} text-orange-600`} />;
    }

    // Word documents
    if (["doc", "docx"].includes(fmt) || name.match(/\.(doc|docx)$/)) {
      return <FileText className={`${iconSize} text-primary-600`} />;
    }

    // Archive files
    if (
      ["zip", "rar", "7z", "tar", "gz"].includes(fmt) ||
      name.match(/\.(zip|rar|7z|tar|gz)$/)
    ) {
      return <FileArchive className={`${iconSize} text-purple-600`} />;
    }

    // Default document icon
    return <File className={`${iconSize} text-gray-500`} />;
  };

  return <div className={className}>{getIcon()}</div>;
};

export default FileTypeIcon;
