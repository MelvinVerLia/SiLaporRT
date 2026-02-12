import React, { useState } from "react";
import { AlertTriangle } from "lucide-react";
import Button from "../../../components/ui/Button";
import Dialog from "../../../components/ui/Dialog";

interface DangerZoneProps {
  onDeleteAccount: () => void;
  isDeleting: boolean;
}

const DangerZone: React.FC<DangerZoneProps> = ({
  onDeleteAccount,
  isDeleting,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleConfirmDelete = () => {
    onDeleteAccount();
    setIsDialogOpen(false);
  };

  return (
    <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/60 rounded-lg shadow-sm dark:shadow-none">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-red-900 dark:text-red-400 mb-1">
              Zona Berbahaya
            </h4>
            <p className="text-sm text-red-800 dark:text-red-300 mb-4">
              Tindakan ini bersifat permanen dan tidak dapat dibatalkan. Semua
              data akun Anda akan hilang secara permanen.
            </p>

            <Dialog
              isOpen={isDialogOpen}
              onClose={() => setIsDialogOpen(false)}
              title="Apakah anda yakin ingin menghapus akun ini?"
            >
              <div className="text-center">
                <p className="text-gray-500 dark:text-gray-400 mb-8 text-lg leading-relaxed font-medium">
                  Tindakan ini tidak dapat dibatalkan. Semua data akun akan
                  hilang secara permanen.
                </p>

                <div className="flex justify-center gap-10">
                  <Button
                    variant="primary"
                    size="md"
                    className="flex-1"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Tidak, Batal
                  </Button>
                  <Button
                    variant="danger"
                    size="md"
                    className="flex-1"
                    onClick={handleConfirmDelete}
                    loading={isDeleting}
                  >
                    Ya, Hapus Akun
                  </Button>
                </div>
              </div>
            </Dialog>

            <Button
              variant="danger"
              onClick={() => setIsDialogOpen(true)}
              className="w-full sm:w-auto"
              loading={isDeleting}
            >
              Hapus Akun Permanen
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DangerZone;
