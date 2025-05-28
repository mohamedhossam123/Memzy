const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function logout(token: string) {
  if (!token) {
    throw new Error('No token provided');
  }

  const res = await fetch(`${BACKEND}/api/Auth/logout`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error('Logout failed on backend');
  }

  return { message: 'Logged out successfully' };
}
