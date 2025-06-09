// lib/api/friends.ts

import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

export interface FriendRequestDTO {
    requestId: number;
    senderId: number;
    senderName: string;
    senderUserName: string;
    senderProfileImageUrl: string;
    receiverId: number;
    status: string; 
    createdAt: string;
    respondedAt?: string;
    message?: string; 
}

export interface Friend {
    userId: number; 
    name: string;
    username: string; 
    profilePictureUrl?: string; 
    isOnline?: boolean;
    bio?: string;
}

export interface FriendshipStatusResponse {
    isFriend: boolean;
    hasPendingRequest: boolean;
    requestType?: 'sent' | 'received'; 
    requestId?: number;
}


const getAuthHeaders = (token: string) => {
    return {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json', 
        },
    };
};

export const fetchFriendsApi = async (token: string): Promise<Friend[]> => {
    if (!API_BASE_URL) {
        throw new Error('Backend API URL is not defined.');
    }
    try {
        const response = await axios.get(`${API_BASE_URL}/api/Friends/GetFriends`, getAuthHeaders(token));

        const friendsData: Friend[] = response.data.map((friend: any) => ({
            userId: friend.userId || friend.id, 
            name: friend.name,
            username: friend.userName || friend.username, 
            profilePictureUrl: friend.profilePictureUrl || friend.profilePicture, 
            bio: friend.bio,
            isOnline: friend.isOnline,
        }));
        return friendsData;
    } catch (error) {
        console.error('Error fetching friends:', error);
        throw new Error(axios.isAxiosError(error) && error.response?.data?.message || 'Failed to load friends.');
    }
};

export const getFriendshipStatusApi = async (token: string, targetUserId: number): Promise<FriendshipStatusResponse> => {
    if (!API_BASE_URL) {
        throw new Error('Backend API URL is not defined.');
    }
    try {
        const response = await axios.get(`${API_BASE_URL}/api/Friends/GetFriendshipStatus/${targetUserId}`, getAuthHeaders(token));
        return response.data; 
    } catch (error) {
        console.error('Error fetching friendship status:', error);
        throw new Error(axios.isAxiosError(error) && error.response?.data?.message || 'Failed to fetch friendship status.');
    }
};

export const getFriendsAnotherUserApi = async (token: string, userId: number): Promise<Friend[]> => {
    if (!API_BASE_URL) {
        throw new Error('Backend API URL is not defined.');
    }
    try {
        const response = await axios.get(`${API_BASE_URL}/api/Friends/GetFriendsAnotherUser?userId=${userId}`, getAuthHeaders(token));
         const friendsData: Friend[] = response.data.map((friend: any) => ({
            userId: friend.userId || friend.id,
            name: friend.name,
            username: friend.userName || friend.username,
            profilePictureUrl: friend.profilePictureUrl || friend.profilePicture,
            bio: friend.bio,
            isOnline: friend.isOnline,
        }));
        return friendsData;
    } catch (error) {
        console.error('Error fetching another user\'s friends:', error);
        throw new Error(axios.isAxiosError(error) && error.response?.data?.message || 'Failed to fetch friends for another user.');
    }
};

export const getFriendRequestsApi = async (token: string): Promise<FriendRequestDTO[]> => {
    if (!API_BASE_URL) {
        throw new Error('Backend API URL is not defined.');
    }
    try {
        const response = await axios.get(`${API_BASE_URL}/api/Friends/GetFriendRequests`, getAuthHeaders(token));
        return response.data;
    } catch (error) {
        console.error('Error fetching friend requests:', error);
        throw new Error(axios.isAxiosError(error) && error.response?.data?.message || 'Failed to fetch friend requests.');
    }
};


export const acceptFriendRequestApi = async (token: string, requestId: number): Promise<void> => {
    if (!API_BASE_URL) {
        throw new Error('Backend API URL is not defined.');
    }
    try {
        await axios.post(`${API_BASE_URL}/api/Friends/acceptRequest/${requestId}`, {}, getAuthHeaders(token));
    } catch (error) {
        console.error('Error accepting friend request:', error);
        throw new Error(axios.isAxiosError(error) && error.response?.data?.message || 'Failed to accept request.');
    }
};

export const rejectFriendRequestApi = async (token: string, requestId: number): Promise<void> => {
    if (!API_BASE_URL) {
        throw new Error('Backend API URL is not defined.');
    }
    try {
        await axios.post(`${API_BASE_URL}/api/Friends/rejectrequest/${requestId}`, {}, getAuthHeaders(token));
    } catch (error) {
        console.error('Error rejecting friend request:', error);
        throw new Error(axios.isAxiosError(error) && error.response?.data?.message || 'Failed to reject request.');
    }
};

export const removeFriendApi = async (token: string, friendId: number): Promise<void> => {
    if (!API_BASE_URL) {
        throw new Error('Backend API URL is not defined.');
    }
    try {
        await axios.delete(`${API_BASE_URL}/api/Friends/RemoveFriend?friendId=${friendId}`, getAuthHeaders(token));
    } catch (error) {
        console.error('Error removing friend:', error);
        throw new Error(axios.isAxiosError(error) && error.response?.data?.message || 'Failed to remove friend.');
    }
};

export const sendFriendRequestApi = async (token: string, targetUserId: number): Promise<any> => {
    if (!API_BASE_URL) {
        throw new Error('Backend API URL is not defined.');
    }
    try {
        const response = await axios.post(`${API_BASE_URL}/api/Friends/SendRequest/${targetUserId}`, {}, getAuthHeaders(token));
        return response.data; 
    } catch (error) {
        console.error('Error sending friend request:', error);
        throw new Error(axios.isAxiosError(error) && error.response?.data?.message || 'Failed to send friend request.');
    }
};

export const cancelFriendRequestApi = async (token: string, requestId: number): Promise<void> => {
    if (!API_BASE_URL) {
        throw new Error('Backend API URL is not defined.');
    }
    try {
        await axios.post(`${API_BASE_URL}/api/Friends/cancelrequest/${requestId}`, {}, getAuthHeaders(token));
    } catch (error) {
        console.error('Error canceling friend request:', error);
        throw new Error(axios.isAxiosError(error) && error.response?.data?.message || 'Failed to cancel friend request.');
    }
};