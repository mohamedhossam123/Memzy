const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function login(email: string, password: string) {
  if (!email?.trim() || !password?.trim()) {
    throw new Error('Email and password are required');
  }

  const res = await fetch(`${BACKEND}/api/Auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || 'Authentication failed');
  }

  const data = await res.json();

  if (!data.token || !data.user?.userId) {
    throw new Error('Invalid server response format');
  }

  return {
    token: data.token,
    user: {
      userId: data.user.userId,
      name: data.user.name,
      email: data.user.email,
      userName: data.user.userName,
      profilePictureUrl: data.user.profilePictureUrl ?? null,
      bio: data.user.bio ?? null,
      status: data.user.status ?? null,
    },
  };
}
