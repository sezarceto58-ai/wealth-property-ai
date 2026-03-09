import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface ProfileFormValues {
  display_name: string;
  phone_number: string;
  bio: string;
}

export interface UserProfile extends ProfileFormValues {
  id?: string;
  user_id: string;
  avatar_url: string | null;
  created_at?: string;
  updated_at?: string;
}

export function useProfile() {
  const qc = useQueryClient();
  const { user, loading } = useAuth();

  const profileQuery = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !loading && !!user,
    queryFn: async (): Promise<UserProfile> => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();

      if (error) throw error;

      return {
        user_id: user!.id,
        display_name: data?.display_name ?? "",
        phone_number: data?.phone_number ?? "",
        bio: data?.bio ?? "",
        avatar_url: data?.avatar_url ?? null,
        id: data?.id,
        created_at: data?.created_at,
        updated_at: data?.updated_at,
      };
    },
  });

  const saveProfile = useMutation({
    mutationFn: async (values: ProfileFormValues) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("profiles")
        .upsert(
          {
            user_id: user.id,
            display_name: values.display_name,
            phone_number: values.phone_number,
            bio: values.bio,
          },
          { onConflict: "user_id" },
        )
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile", user?.id] });
    },
  });

  const uploadAvatar = useMutation({
    mutationFn: async (file: File) => {
      if (!user) throw new Error("Not authenticated");

      const extension = file.name.split(".").pop() || "jpg";
      const safeName = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9.-]/g, "-").toLowerCase();
      const path = `${user.id}/${Date.now()}-${safeName}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from("avatars").getPublicUrl(path);

      const avatarUrl = publicUrlData.publicUrl;

      const { error: profileError } = await supabase
        .from("profiles")
        .upsert(
          {
            user_id: user.id,
            avatar_url: avatarUrl,
          },
          { onConflict: "user_id" },
        );

      if (profileError) throw profileError;

      return avatarUrl;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile", user?.id] });
    },
  });

  return {
    profile: profileQuery.data,
    isLoading: profileQuery.isLoading,
    saveProfile: saveProfile.mutateAsync,
    isSaving: saveProfile.isPending,
    uploadAvatar: uploadAvatar.mutateAsync,
    isUploading: uploadAvatar.isPending,
  };
}
