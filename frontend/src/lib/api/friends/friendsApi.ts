// lib/api/friends/friendsApi.ts

import axios from 'axios';

export interface Friend {
  userId: number;
  name: string;
  username: string;
  profilePicture?: string;
  isOnline?: boolean;
  bio?: string;
}


export const fetchFriendsApi = async (token: string, backendUrl: string): Promise<Friend[]> => {
  try {
    const response = await axios.get(`${backendUrl}/api/Friends/GetFriends`, {
      headers: { Authorization: `Bearer ${token}` }
    });


    const friendsData: Friend[] = response.data.map((friend: any) => ({
      userId: friend.userId,
      name: friend.name,
      username: friend.userName,
      profilePicture: friend.profilePictureUrl,
      bio: friend.bio,
      isOnline: friend.isOnline,
    }));

    return friendsData; 
  } catch (error) {
    console.error('Error fetching friends in API:', error);
    throw new Error('Failed to load friends. Please try again.');
  }
};
