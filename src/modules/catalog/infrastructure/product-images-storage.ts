import "server-only";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/service-role";

export const PRODUCT_IMAGES_BUCKET = "product-images" as const;

export function getProductImagePublicUrl(storagePath: string): string {
  const supabase = createServerSupabaseClient();
  const { data } = supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .getPublicUrl(storagePath);
  return data.publicUrl;
}

export async function uploadProductImageObject(params: {
  storagePath: string;
  bytes: Buffer;
  contentType: string;
}): Promise<void> {
  const supabase = createServiceRoleSupabaseClient();
  const result = await supabase.storage.from(PRODUCT_IMAGES_BUCKET).upload(params.storagePath, params.bytes, {
    contentType: params.contentType,
    upsert: false,
  });
  if (result.error) {
    throw new Error(result.error.message);
  }
}

export async function removeProductImageObject(storagePath: string): Promise<void> {
  const supabase = createServiceRoleSupabaseClient();
  const result = await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove([storagePath]);
  if (result.error) {
    throw new Error(result.error.message);
  }
}

export async function removeProductImageObjects(storagePaths: readonly string[]): Promise<void> {
  if (storagePaths.length === 0) {
    return;
  }
  const supabase = createServiceRoleSupabaseClient();
  const result = await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove([...storagePaths]);
  if (result.error) {
    throw new Error(result.error.message);
  }
}
