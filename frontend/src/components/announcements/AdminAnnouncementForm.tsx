import React, { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Save,
  X,
  Calendar,
  Settings,
  AlertTriangle,
  Paperclip,
} from "lucide-react";
import Input from "../ui/Input";
import Textarea from "../ui/Textarea";
import Select from "../ui/Select";
import Button from "../ui/Button";
import { Card, CardContent } from "../ui/Card";
import {
  Announcement,
  AnnouncementType,
  Priority,
  CloudinaryFile,
} from "../../types/announcement.types";
import {
  createAnnouncement,
  updateAnnouncement,
  UpsertAnnouncementPayload,
} from "../../services/announcementAdminService";
import CloudinaryUpload from "../upload/CloudinaryUpload";

type Props = {
  initial?: Announcement | null;
  onSuccess?: (a: Announcement) => void;
  onCancel?: () => void;
};

const typeOptions = [
  { value: AnnouncementType.GENERAL, label: "Umum" },
  { value: AnnouncementType.URGENT, label: "Mendesak" },
  { value: AnnouncementType.EVENT, label: "Acara" },
  { value: AnnouncementType.MAINTENANCE, label: "Pemeliharaan" },
  { value: AnnouncementType.REGULATION, label: "Peraturan" },
];

const priorityOptions = [
  { value: Priority.LOW, label: "Rendah" },
  { value: Priority.NORMAL, label: "Normal" },
  { value: Priority.HIGH, label: "Tinggi" },
  { value: Priority.URGENT, label: "Urgent" },
];

function toLocalInput(dt?: string | null) {
  if (!dt) return "";
  const d = new Date(dt);
  const off = d.getTimezoneOffset();
  const local = new Date(d.getTime() - off * 60000);
  return local.toISOString().slice(0, 16);
}

export default function AdminAnnouncementForm({
  initial,
  onSuccess,
  onCancel,
}: Props) {
  const isEdit = !!initial?.id;
  const qc = useQueryClient();

  const [title, setTitle] = useState(initial?.title ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [type, setType] = useState<AnnouncementType>(
    (initial?.type as AnnouncementType) ?? AnnouncementType.GENERAL
  );
  const [priority, setPriority] = useState<Priority>(
    (initial?.priority as Priority) ?? Priority.NORMAL
  );
  const [isPinned, setIsPinned] = useState<boolean>(initial?.isPinned ?? false);
  const [isActive, setIsActive] = useState<boolean>(initial?.isActive ?? true);
  const [publishAt, setPublishAt] = useState<string>(
    toLocalInput(initial?.publishAt)
  );
  const [expireAt, setExpireAt] = useState<string>(
    toLocalInput(initial?.expireAt)
  );

  // Extended type for form attachments (supports both DB and new uploads)
  type FormAttachment = {
    id?: string; // Database ID for existing attachments
    filename: string;
    url: string;
    fileType: "image" | "video" | "document";
    provider?: "cloudinary";
    publicId?: string;
    resourceType?: string;
    format?: string;
    bytes?: number;
    width?: number;
    height?: number;
  };

  // Attachments
  const [attachments, setAttachments] = useState<FormAttachment[]>([]);

  // Sync state when initial changes
  useEffect(() => {
    setTitle(initial?.title ?? "");
    setContent(initial?.content ?? "");
    setType((initial?.type as AnnouncementType) ?? AnnouncementType.GENERAL);
    setPriority((initial?.priority as Priority) ?? Priority.NORMAL);
    setIsPinned(initial?.isPinned ?? false);
    setIsActive(initial?.isActive ?? true);
    setPublishAt(toLocalInput(initial?.publishAt));
    setExpireAt(toLocalInput(initial?.expireAt));

    // Only reset attachments if this is a new form (create mode) or a different announcement
    if (!initial || !initial.id) {
      // Create mode - reset to empty
      setAttachments([]);
    } else {
      // Edit mode - only set initial attachments on first load of this announcement
      setAttachments((prev) => {
        // If we don't have any attachments yet, or if it's a different announcement, use initial data
        if (!prev || prev.length === 0) {
          // Convert database Attachment[] to form's expected format
          const convertedAttachments = (initial?.attachments ?? []).map(
            (att) => {
              console.log("Converting attachment:", att);
              return {
                id: att.id, // Keep database ID
                filename: att.filename,
                url: att.url,
                fileType: att.fileType as "image" | "video" | "document",
                provider: "cloudinary" as const,
                publicId: att.id, // Still use ID as publicId for compatibility
                resourceType: "",
                format: "",
                bytes: 0,
                width: undefined,
                height: undefined,
              };
            }
          );
          console.log("Converted attachments:", convertedAttachments);
          return convertedAttachments;
        }
        // Otherwise, keep current attachments to preserve user edits
        return prev;
      });
    }
  }, [initial]);

  const scheduleError = useMemo(() => {
    if (publishAt && expireAt) {
      const start = new Date(publishAt);
      const end = new Date(expireAt);
      if (end <= start)
        return "Tanggal berakhir harus setelah tanggal mulai tayang.";
    }
    return "";
  }, [publishAt, expireAt]);

  const nowIso = new Date().toISOString();
  const willBeHidden = !!expireAt && new Date(expireAt).toISOString() < nowIso;
  const notYetLive = !!publishAt && new Date(publishAt).toISOString() > nowIso;

  const payload: UpsertAnnouncementPayload = useMemo(
    () => ({
      title,
      content,
      type,
      priority,
      isPinned,
      isActive,
      publishAt: publishAt ? new Date(publishAt).toISOString() : null,
      expireAt: expireAt ? new Date(expireAt).toISOString() : null,
      attachments: attachments.map((att) => ({
        filename: att.filename,
        url: att.url,
        fileType: att.fileType,
        provider: att.provider,
        publicId: att.publicId,
        resourceType: att.resourceType,
        format: att.format,
        bytes: att.bytes,
        width: att.width,
        height: att.height,
      })),
    }),
    [
      title,
      content,
      type,
      priority,
      isPinned,
      isActive,
      publishAt,
      expireAt,
      attachments,
    ]
  );

  const mutCreate = useMutation({
    mutationFn: () => createAnnouncement(payload),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["admin-announcements"] });
      qc.invalidateQueries({ queryKey: ["announcements"] });
      onSuccess?.(res);
      // Reset form for new creation
      setTitle("");
      setContent("");
      setType(AnnouncementType.GENERAL);
      setPriority(Priority.NORMAL);
      setIsPinned(false);
      setIsActive(true);
      setPublishAt("");
      setExpireAt("");
      setAttachments([]);
    },
  });

  const mutUpdate = useMutation({
    mutationFn: () => updateAnnouncement(initial!.id, payload),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["admin-announcements"] });
      qc.invalidateQueries({ queryKey: ["announcements"] });
      qc.invalidateQueries({ queryKey: ["announcement", initial!.id] });
      qc.invalidateQueries({ queryKey: ["admin-announcement", initial!.id] });
      onSuccess?.(res);
    },
  });

  const isSubmitting = mutCreate.isPending || mutUpdate.isPending;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !!scheduleError) return;
    if (isEdit) mutUpdate.mutate();
    else mutCreate.mutate();
  };

  const resetForm = () => {
    setTitle("");
    setContent("");
    setType(AnnouncementType.GENERAL);
    setPriority(Priority.NORMAL);
    setIsPinned(false);
    setIsActive(true);
    setPublishAt("");
    setExpireAt("");
    setAttachments([]);
  };

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

  function onUploaded(files: CloudinaryFile[]) {
    const mapped = files.map((f) => {
      const fileType = classifyFile(f);
      return {
        filename: f.original_filename || "file",
        url: f.secure_url,
        fileType, // <- hasil klasifikasi yang benar
        provider: "cloudinary" as const,
        publicId: f.public_id || "",
        resourceType: f.resource_type || "",
        format: f.format || "",
        bytes: f.bytes || 0,
        width: f.width,
        height: f.height,
        // optional kalau skema DB-mu sudah siap:
        // mimeType: mimeOf(f),
      };
    });
    setAttachments((prev) => [...(prev || []), ...mapped]);
  }

  const removeAttachment = (identifier: string) => {
    console.log("=== REMOVE ATTACHMENT ===");
    console.log("Removing attachment with identifier:", identifier);
    console.log("Current attachments before removal:", attachments);

    setAttachments((prev) => {
      const currentAttachments = prev || [];
      console.log("Previous attachments in setter:", currentAttachments);

      const filtered = currentAttachments.filter((a) => {
        // Check both id (for database attachments) and publicId (for new uploads)
        const shouldKeep = a.id !== identifier && a.publicId !== identifier;
        console.log(
          `Attachment "${a.filename}" (id: "${a.id}", publicId: "${a.publicId}") - Keep: ${shouldKeep}`
        );
        return shouldKeep;
      });

      console.log(
        "Before filter:",
        currentAttachments.length,
        "After filter:",
        filtered.length
      );
      console.log("Filtered result:", filtered);
      return filtered;
    });
  };

  const urgentBanner =
    type === AnnouncementType.URGENT || priority === Priority.URGENT;

  return (
    <form onSubmit={submit} className="space-y-6">
      {/* Warning / info banners */}
      {urgentBanner && (
        <div className="flex items-start gap-2 rounded-md border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <div className="font-medium">Mode prioritas tinggi</div>
            <div>
              Pastikan konten ringkas, jelas, dan relevan untuk semua warga.
            </div>
          </div>
        </div>
      )}
      {(willBeHidden || notYetLive) && (
        <div className="flex items-start gap-2 rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
          <Calendar className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            {notYetLive && (
              <div>
                Pengumuman akan mulai tayang pada <b>{publishAt}</b>.
              </div>
            )}
            {willBeHidden && (
              <div>
                Pengumuman akan berakhir pada <b>{expireAt}</b>.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Basic Information */}
      <div className="space-y-4">
        <Input
          label="Judul Pengumuman"
          placeholder="Masukkan judul pengumuman yang jelas..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          error={!title.trim() && isSubmitting ? "Judul harus diisi" : ""}
        />

        <Textarea
          label="Konten Pengumuman"
          placeholder="Tulis detail pengumuman untuk warga..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={5}
          required
          error={!content.trim() && isSubmitting ? "Konten harus diisi" : ""}
          helperText="Gunakan bahasa yang jelas dan mudah dipahami warga"
        />
      </div>

      {/* Type and Priority */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Jenis Pengumuman"
          options={typeOptions}
          value={type}
          onChange={(e) => setType(e.target.value as AnnouncementType)}
          helperText="Pilih jenis sesuai kategori pengumuman"
        />

        <Select
          label="Tingkat Prioritas"
          options={priorityOptions}
          value={priority}
          onChange={(e) => setPriority(e.target.value as Priority)}
          helperText="Prioritaskan sesuai urgensi pengumuman"
        />
      </div>

      {/* Scheduling */}
      <Card className="border-gray-200">
        <CardContent className="p-4">
          <div className="flex items-center mb-3">
            <Calendar className="h-4 w-4 text-gray-600 mr-2" />
            <h3 className="text-sm font-medium text-gray-900">
              Jadwal Pengumuman
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Mulai Tayang
              </label>
              <input
                type="datetime-local"
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
                value={publishAt}
                onChange={(e) => setPublishAt(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Kosongkan untuk langsung tayang
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Berakhir Pada
              </label>
              <input
                type="datetime-local"
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
                value={expireAt}
                onChange={(e) => setExpireAt(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Kosongkan jika tidak ada tanggal berakhir
              </p>
            </div>
          </div>

          {!!scheduleError && (
            <div className="mt-3 text-sm text-red-600 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              {scheduleError}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Advanced settings */}
      <Card className="border-gray-200">
        <CardContent className="p-4">
          <div className="flex items-center mb-3">
            <Settings className="h-4 w-4 text-gray-600 mr-2" />
            <h3 className="text-sm font-medium text-gray-900">
              Pengaturan Lanjutan
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-800">
              <input
                type="checkbox"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
              />
              Pin di atas
            </label>

            <label className="flex items-center gap-2 text-sm text-gray-800">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              Aktif (tampil ke pengguna)
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Attachments - Updated Section */}
      <Card className="border-gray-200">
        <CardContent className="p-4">
          <div className="flex items-center mb-3">
            <Paperclip className="h-4 w-4 text-gray-600 mr-2" />
            <h3 className="text-sm font-medium text-gray-900">Lampiran</h3>
          </div>

          <CloudinaryUpload
            folder="announcements"
            multiple
            accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
            maxFiles={5}
            attachments={attachments}
            onUploaded={onUploaded}
            onRemove={removeAttachment}
            onError={(m) => console.error(m)}
          />

          {/* Hapus bagian list attachments yang lama karena sudah terintegrasi di CloudinaryUpload */}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button
          type="submit"
          loading={isSubmitting}
          disabled={!!scheduleError || !title.trim() || !content.trim()}
        >
          <Save className="mr-2 h-4 w-4" />
          {isEdit ? "Simpan Perubahan" : "Buat Pengumuman"}
        </Button>

        {!isEdit && (
          <Button type="button" variant="secondary" onClick={resetForm}>
            Reset
          </Button>
        )}

        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            <X className="mr-2 h-4 w-4" />
            Batal
          </Button>
        )}
      </div>

      {/* Error messages from mutations */}
      {(mutCreate.isError || mutUpdate.isError) && (
        <div className="text-sm text-red-600">
          {mutCreate.error?.message ||
            mutUpdate.error?.message ||
            "Terjadi kesalahan saat menyimpan."}
        </div>
      )}
    </form>
  );
}
