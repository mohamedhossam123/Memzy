// pages/api/login.ts
import type { NextApiRequest, NextApiResponse } from 'next'

type UserData = {
  name: string;
  email: string;
  profilePic: string;
  token: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UserData | { error: string }>
) {
  try {
    const response = await fetch('http://localhost:5001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
}