
"use client";

import { Camera, X, Loader2, Trash2, AlertTriangle } from "lucide-react";
import React, { useRef } from "react";
import Image from "next/image";
import { useUser } from "@/hooks/useUser";
import { useApi } from "@/hooks/useApi";
import { showToast } from "@/lib/toast";

function getToastMessage(res: any, fallback: string) {
  return res?.message || fallback;
}

function getErrorMessage(err: any, fallback: string) {
  return err?.message || fallback;
}

/* ================= COMPONENT ================= */

interface Props {
  onOpenChange: (open: boolean) => void;
}

const Profile: React.FC<Props> = ({ onOpenChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { user, updateProfile, updating, refetch } = useUser();

  const [name, setName] = React.useState("");
  const [image, setImage] = React.useState("");
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);

  const [imageLoading, setImageLoading] = React.useState(false);


  const initialized = React.useRef(false);

  React.useEffect(() => {
    if (user && !initialized.current) {
      setName(user.name);
      initialized.current = true;
    }
  }, [user]);

  React.useEffect(() => {
    if (user?.isPro === undefined || user?.providers === undefined) {
      refetch?.();
    }
  }, [user, refetch]);

  const displayImage = image || user?.image || "";

  /* ================= NAME UPDATE ================= */

  const handleNameKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;

    const trimmed = name.trim();
    if (trimmed.length < 2) return;

    const formData = new FormData();
    formData.append("name", trimmed);

    try {
     await updateProfile(formData);

      showToast( "Name updated", "success");
    } catch (err: any) {
      showToast( "Update failed", "error");
    }
  };

  /* ================= IMAGE UPDATE ================= */

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const preview = URL.createObjectURL(file);
    setImage(preview);
    setImageLoading(true);

    const formData = new FormData();
    formData.append("avatar", file);

    try {
    await updateProfile(formData);

      showToast( "Image updated", "success");
    } catch (err: any) {
      setImage("");
      showToast( "Image update failed", "error");
    } finally {
      setImageLoading(false);
    }
  };

  /* ================= DELETE ================= */

  const { loading: deleting, callApi: deleteAccount } = useApi("/api/profile", {
    defaultOptions: { method: "DELETE" },
    showErrorToast: true,
  });

  const handleDeleteAccount = async () => {
    try {
      const res = await deleteAccount();

      if (!res) {
        showToast("Failed to delete account", "error");
        return;
      }

      showToast(getToastMessage(res, "Account deleted"), "success");
      window.location.href = "/";
    } catch (err) {
      showToast(getErrorMessage(err, "Delete account failed"), "error");
    }
  };

  return (
    <div className="w-full h-full bg-[#1C1C1C] rounded-r-2xl relative">

      {/* CLOSE BUTTON */}
      <button
        onClick={() => onOpenChange(false)}
        className="absolute top-4 right-4 text-[#9191a0] hover:text-[#4772FA]"
      >
        <X size={18} strokeWidth={2.5} />
      </button>

      {/* PROFILE HEADER */}
      <div className="flex flex-col items-center pt-6">

        {/* AVATAR */}
        <div
          onClick={() => !updating && fileInputRef.current?.click()}
          className="w-16 h-16 group relative cursor-pointer rounded-full"
        >
          {displayImage ? (
            <Image
              width={100}
              height={100}
              alt="avatar"
              src={displayImage}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <div className="w-full h-full rounded-full bg-gray-800" />
          )}


          <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center">
            <Camera strokeWidth={2.5} size={18} color="white" />
          </div>
          {(updating || imageLoading) && (
            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
              <Loader2 className="animate-spin text-white" size={18} />
            </div>
          )}

          <input
            type="file"
            ref={fileInputRef}
            hidden
            accept="image/*"
            onChange={handleImageChange}
            name="avatar"
          />
        </div>

        {/* NAME INPUT */}
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleNameKeyDown}
          disabled={updating}
          className="mt-4 text-[14px] font-semibold text-center bg-transparent outline-none"
        />
        <p className="mt-1 text-[13px] font-medium flex items-center gap-1">
          {user?.isPro === undefined ? (
            <span className="text-gray-400 animate-pulse text-[10px]">●</span>
          ) : user.isPro ? (
            <>
              <span className="text-[#04de66] text-[10px]">●</span>
              <span className="text-[#04de66]">Premium Account</span>
            </>
          ) : (
            <>
              <span className="text-[#DE9A04] text-[10px]">●</span>
              <span className="text-[#DE9A04]">Free</span>
            </>
          )}
        </p>

      </div>

      {/* DETAILS */}
      <div className="w-full flex flex-col gap-4 px-4 mt-6">

        {/* ACCOUNT INFO */}
        <div className="bg-[#202020] p-5 rounded-2xl flex flex-col gap-4">
          <div className="flex justify-between">
            <p className="text-[13px] font-medium">Email</p>
            <p className="text-[#9191a0] text-[13px] font-medium">{user?.email}</p>
          </div>

          <div className="flex justify-between">
            <p className="text-[13px] font-medium">Password</p>
            <button className="text-[#4772FA] text-[13px] font-medium">Set password</button>
          </div>

          <div className="flex justify-between">
            <p className="text-[13px] font-medium">2-step verification</p>
            <button className="text-[#4772FA] text-[13px] font-medium">Settings</button>
          </div>
        </div>

        {/* PROVIDERS */}
        <div className="bg-[#202020] p-5 rounded-2xl flex flex-col gap-4">
          <div className="flex justify-between">
            <p className="text-[13px] lowercase  font-medium">{user?.providers ? user?.providers : "Provider"}</p>
            <p className="text-[#9191a0] text-[13px] font-medium">{user?.name}</p>
          </div>

          <div className="flex justify-between">
            <p className="text-[13px] font-medium">Account</p>
            <button className="text-[#4772FA] text-[13px] font-medium">Link</button>
          </div>
        </div>

        {/* SETTINGS */}
        <div className="bg-[#202020] p-5 rounded-2xl flex flex-col gap-4">
          <div className="flex justify-between">
            <p className="text-[13px] font-medium">Login devices</p>
            <button className="text-[#4772FA] text-[13px] font-medium">Manage</button>
          </div>

          <div className="flex justify-between">
            <p className="text-[13px] font-medium">API Token</p>
            <button className="text-[#4772FA] text-[13px] font-medium">Manage</button>
          </div>

          <div className="flex justify-between">
            <p className="text-[13px] font-medium">Backup & Restore</p>
            <button className="text-[#4772FA] text-[13px] font-medium">Backup</button>
          </div>

          <div className="flex justify-between">
            <p className="text-[13px] font-medium">Manage Account</p>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="text-red-500 text-[13px] font-medium"
            >
              Delete Account
            </button>
          </div>
        </div>

      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-r-2xl flex items-center justify-center z-50 px-4">
          <div className="bg-[#202020] rounded-2xl p-6 w-full flex flex-col items-center gap-4">

            <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center">
              <AlertTriangle size={16} className="text-red-500" />
            </div>

            <div className="text-center">
              <p className="text-[15px] font-semibold">Delete Account</p>
              <p className="text-[12px] font-medium text-[#9191a0] mt-1 leading-relaxed">
                This action is permanent and cannot be undone. All your data will be erased.
              </p>
            </div>

            <div className="flex gap-3 w-full">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-[#2a2a2a] text-[13px] font-medium text-[#9191a0] hover:text-white transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-red-500/10 text-[13px] font-medium text-red-500 hover:bg-red-500/20 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {deleting ? (
                  <span>Deleting...</span>
                ) : (
                  <>
                    <Trash2 size={13} />
                    <span>Delete</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Profile;