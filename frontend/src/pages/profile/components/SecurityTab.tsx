import React from "react";
import PasswordChangeForm from "./PasswordChangeForm";
import DangerZone from "./DangerZone";

interface SecurityTabProps {
  onChangePassword: (newPassword: string) => Promise<void>;
  isChangingPassword: boolean;
  onDeleteAccount: () => void;
  isDeletingAccount: boolean;
}

const SecurityTab: React.FC<SecurityTabProps> = ({
  onChangePassword,
  isChangingPassword,
  onDeleteAccount,
  isDeletingAccount,
}) => {
  return (
    <div className="space-y-6">
      {/* Password Change Section */}
      <PasswordChangeForm
        onChangePassword={onChangePassword}
        isChanging={isChangingPassword}
      />

      {/* Danger Zone Section */}
      <DangerZone
        onDeleteAccount={onDeleteAccount}
        isDeleting={isDeletingAccount}
      />
    </div>
  );
};

export default SecurityTab;
