const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function signup(userData: any) {
  const res = await fetch(`${BACKEND}/api/Auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Signup failed');
  }

  return data;
}
