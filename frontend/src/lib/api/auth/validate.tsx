const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function validateAuth(token: string) {
  if (!token) {
    return { authenticated: false, user: null };
  }

  const res = await fetch(`${BACKEND}/api/Auth/validate`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  

  if (!res.ok) {
    return { authenticated: false, user: null };
  }

  const data = await res.json();

    return {
    authenticated: true,
    user: data.user 
  }
}
