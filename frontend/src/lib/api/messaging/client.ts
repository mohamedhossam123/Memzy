import axios from 'axios';
import { Message } from './type';
import { BACKEND_URL } from '../constants';

export interface GroupMember {
  userId: number;
  userName?: string;
  name?: string;
  profilePictureUrl?: string;
}

export const fetchMessages = async (
  token: string,
  contactId: number,
  pageNum: number = 1,
  pageSize: number = 50
): Promise<{ messages: Message[]; hasMore: boolean }> => {
  try {
    const res = await axios.get(`${BACKEND_URL}/api/Messaging/GetMessages`, {
      params: { contactId, page: pageNum, pageSize },
      headers: { Authorization: `Bearer ${token}` }
    });
    const messages = res.data.messages || [];
    const reversedMessages = [...messages].reverse();
    return {
      messages: reversedMessages,
      hasMore: messages.length === pageSize
    };
  } catch (err) {
    throw err;
  }
};

export const fetchGroupMessages = async (
  token: string,
  groupId: number,
  pageNum: number = 1,
  pageSize: number = 50
): Promise<{ messages: Message[]; hasMore: boolean }> => {
  try {
    const res = await axios.get(`${BACKEND_URL}/api/Groups/${groupId}/Getmessages`, {
      params: { page: pageNum, pageSize },
      headers: { Authorization: `Bearer ${token}` }
    });
    const messages = res.data.messages || [];
    const reversedMessages = [...messages].reverse();
    return {
      messages: reversedMessages,
      hasMore: messages.length === pageSize
    };
  } catch (err) {
    throw err;
  }
};

export const deleteGroupMessage = async (token: string, messageId: number): Promise<void> => {
  const url = `${BACKEND_URL}/api/Groups/Deletemessages/${messageId}`;

  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to delete group message: ${response.statusText}`);
    }
  } catch (error) {
    throw error;
  }
};


export const fetchGroupMembers = async (
  token: string,
  groupId: number
): Promise<GroupMember[]> => {
  try {
    const res = await axios.get(`${BACKEND_URL}/api/Groups/GetGroupMembers/${groupId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const fetchedMembers = res.data as GroupMember[];
    return fetchedMembers;
  } catch (err) {
    throw err;
  }
};

export const leaveGroup = async (token: string, groupId: number): Promise<void> => {
  const url = `${BACKEND_URL}/api/Groups/${groupId}/leave`;

  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to leave group: ${response.statusText}`);
    }
  } catch (error) {
    throw error;
  }
};