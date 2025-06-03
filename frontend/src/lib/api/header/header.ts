// lib/api/profile.ts

interface UpdateProfilePictureResponse {
  Url?: string;
}

export async function uploadProfilePicture(file: File): Promise<UpdateProfilePictureResponse> {
  const formData = new FormData();
  formData.append('ProfilePicture', file);

  const response = await fetch('/api/UpdateProfilePicture', {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Upload failed');
  }

  return response.json();
}