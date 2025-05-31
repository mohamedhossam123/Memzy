import axios from 'axios';
import { Message } from './type';
import { BACKEND_URL } from '../constants';

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
    const reversedMessages = [...res.data.messages].reverse();
    return {
      messages: reversedMessages,
      hasMore: res.data.messages.length === pageSize
    };
  } catch (err) {
    console.error('Error fetching messages:', err);
    throw err;
  }
};

export const deleteMessage = async (token: string, messageId: number) => {
  try {
    const response = await axios.delete(`${BACKEND_URL}/api/Messaging/DeleteMessage`, {
      params: { messageId },
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      console.error('Error deleting message:', err.response?.data || err.message);
      throw new Error(err.response?.data?.message || 'Failed to delete message');
    }
    console.error('Unexpected error:', err);
    throw new Error('Unexpected error occurred');
  }
};