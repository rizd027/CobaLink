const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dlnd3fzty";
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export const uploadImage = async (file: File, folder: string = "orderflow_general"): Promise<string> => {
  if (!UPLOAD_PRESET) {
    throw new Error("Cloudinary Upload Preset is not configured in .env.local");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("folder", folder);
  formData.append("public_id", `${folder}_${Date.now()}_${Math.random().toString(36).substring(7)}`);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Cloudinary upload failed");
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error: any) {
    console.error("Cloudinary Upload Error:", error);
    throw error;
  }
};

export const uploadPaymentProof = async (file: File, orderId: string): Promise<string> => {
  return uploadImage(file, "orderflow_payments");
};
