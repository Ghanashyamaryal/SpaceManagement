import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Textarea,
} from "@/components";
import { useAuth } from "@/context/authcontext";
import { useFetch } from "@/hooks/queryFn";
import { Camera, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { data, isLoading, refetch } = useFetch({
    path: "/api/auth/me",
    queryKey: "me",
  });

  const me = data?.user;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Hydrate the form once /api/auth/me resolves.
  useEffect(() => {
    if (me) {
      setName(me.name || "");
      setPhone(me.phone || "");
      setBio(me.bio || "");
      setAvatarUrl(me.avatarUrl || "");
    }
  }, [me]);

  const branchName =
    me?.branch && typeof me.branch === "object" ? me.branch.name : null;

  const handleAvatarSelect = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const token = localStorage.getItem("token");
      const res = await fetch("/api/upload/avatar", {
        method: "POST",
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: formData,
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Upload failed");
      setAvatarUrl(result.url);
      toast.success("Picture uploaded. Click Save to apply.");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload picture");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    if (!me?._id) return;
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/users/${me._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ name, phone, bio, avatarUrl }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Update failed");

      // Keep the global user (header avatar, name) in sync.
      updateUser({ ...user, name, phone, bio, avatarUrl });
      refetch();
      toast.success("Profile updated successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const initial = (name || me?.name || "U").trim().charAt(0).toUpperCase();

  return (
    <div className="mx-auto w-full max-w-3xl p-4 sm:p-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">My Profile</h1>
        <p className="text-sm text-muted-foreground">
          Manage your personal information and profile picture.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Avatar + read-only identity */}
          <Card>
            <CardContent className="flex flex-col sm:flex-row items-center gap-6 pt-6">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={avatarUrl} alt={name} />
                  <AvatarFallback className="text-2xl font-semibold">
                    {initial}
                  </AvatarFallback>
                </Avatar>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/90 transition-colors disabled:opacity-60"
                  aria-label="Change profile picture"
                >
                  {isUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarSelect}
                />
              </div>

              <div className="text-center sm:text-left space-y-1">
                <p className="text-lg font-semibold">{me?.name}</p>
                <p className="text-sm text-muted-foreground">{me?.email}</p>
                <div className="flex flex-wrap justify-center sm:justify-start gap-2 pt-1">
                  <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium uppercase">
                    {me?.role}
                  </span>
                  {branchName && (
                    <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">
                      {branchName}
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Editable personal info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1234567890"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={me?.email || ""} disabled />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="branch">Branch</Label>
                  <Input id="branch" value={branchName || "—"} disabled />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="bio">Bio / About</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us a little about yourself..."
                  className="min-h-[100px] resize-y"
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button onClick={handleSave} disabled={isSaving || isUploading}>
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
