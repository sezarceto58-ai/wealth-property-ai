import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Camera, Loader2, Save } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function Profile() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { profile, isLoading, saveProfile, isSaving, uploadAvatar, isUploading } = useProfile();

  const [displayName, setDisplayName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    if (!profile) return;
    setDisplayName(profile.display_name ?? "");
    setPhoneNumber(profile.phone_number ?? "");
    setBio(profile.bio ?? "");
  }, [profile]);

  const initials = (displayName || user?.email || "TV").slice(0, 2).toUpperCase();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveProfile({
        display_name: displayName,
        phone_number: phoneNumber,
        bio,
      });
      toast({ title: t("common.success"), description: "Your profile details were saved." });
    } catch (error: any) {
      toast({
        title: t("common.error"),
        description: error.message || "Could not save profile.",
        variant: "destructive",
      });
    }
  };

  const onPickAvatar = () => {
    fileInputRef.current?.click();
  };

  const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await uploadAvatar(file);
      toast({ title: "Avatar uploaded", description: "Your profile picture has been updated." });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Could not upload avatar.",
        variant: "destructive",
      });
    } finally {
      e.target.value = "";
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-7 h-7 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-display font-bold text-foreground mb-1">Your Profile</h1>
      <p className="text-sm text-muted-foreground mb-8">Manage your avatar, display name, phone number, and bio.</p>

      <form onSubmit={onSubmit} className="rounded-2xl border border-border bg-card p-6 lg:p-8 space-y-6">
        <div className="flex items-center gap-4">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="Profile avatar" className="w-16 h-16 rounded-full object-cover border border-border" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-sm font-semibold border border-border">
              {initials}
            </div>
          )}
          <div className="space-y-2">
            <Button type="button" variant="secondary" onClick={onPickAvatar} disabled={isUploading}>
              {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />} Upload Avatar
            </Button>
            <p className="text-xs text-muted-foreground">Use JPG or PNG. Stored in your profile record.</p>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onAvatarChange} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="displayName">Display Name</Label>
          <Input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your public display name" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Phone Number</Label>
          <Input id="phoneNumber" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="+964 ..." />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell buyers or sellers a bit about yourself"
            rows={5}
          />
        </div>

        <Button type="submit" disabled={isSaving}>
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Profile
        </Button>
      </form>
    </div>
  );
}
