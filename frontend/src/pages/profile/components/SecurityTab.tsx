import React from "react";
import PasswordChangeForm from "./PasswordChangeForm";
import DangerZone from "./DangerZone";
import NotificationToggle from "./NotificationToggle";
import { User } from "../../../types/auth.types";

interface SecurityTabProps {
  onChangePassword: (newPassword: string) => Promise<void>;
  isChangingPassword: boolean;
  onDeleteAccount: () => void;
  isDeletingAccount: boolean;
  user: User;
  onClose: () => void;
}

const SecurityTab: React.FC<SecurityTabProps> = ({
  onChangePassword,
  isChangingPassword,
  onDeleteAccount,
  isDeletingAccount,
  user,
  // onClose,
}) => {
  return (
    <div className="space-y-6">
      <PasswordChangeForm
        onChangePassword={onChangePassword}
        isChanging={isChangingPassword}
      />

      <NotificationToggle userId={user.id!}  />

      <DangerZone
        onDeleteAccount={onDeleteAccount}
        isDeleting={isDeletingAccount}
      />
    </div>
  );
};

export default SecurityTab;
