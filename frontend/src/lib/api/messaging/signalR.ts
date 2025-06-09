// lib/api/messaging/signalR.ts 
import * as signalR from '@microsoft/signalr';
import { BACKEND_URL } from '../constants';
import { Message } from '@/lib/api/types'; 

export const createConnection = (token: string) => {
  return new signalR.HubConnectionBuilder()
    .withUrl(`${BACKEND_URL}/hub/chat`, {
      accessTokenFactory: () => token
    })
    .withAutomaticReconnect()
    .build();
};

export const startConnection = async (connection: signalR.HubConnection) => {
  try {
    await connection.start();
    console.log('SignalR connection started.');
    return true;
  } catch (err) {
    console.error('SignalR connection error:', err);
    return false;
  }
};

export const setupMessageHandler = (
  connection: signalR.HubConnection,
  individualMessageHandler: (message: Message & { tempId?: string }) => void,
  groupMessageHandler: (message: Message & { tempId?: string }) => void 
) => {
  connection.on('ReceiveMessage', individualMessageHandler);
  connection.on('ReceiveGroupMessage', groupMessageHandler); 

  return () => {
    connection.off('ReceiveMessage', individualMessageHandler);
    connection.off('ReceiveGroupMessage', groupMessageHandler);
  };
};

export const sendMessageViaSignalR = async (
  connection: signalR.HubConnection,
  receiverId: number,
  message: string,
  tempId: string
) => {
  try {
    await connection.invoke('SendMessage', receiverId, message, tempId);
    console.log('Individual message sent successfully via SignalR');
  } catch (error) {
    console.error('Error sending individual message via SignalR:', error);
    throw error;
  }
};

export const sendGroupMessageViaSignalR = async ( 
  connection: signalR.HubConnection,
  groupId: number,
  message: string,
  tempId: string
) => {
  try {
    await connection.invoke('SendGroupMessage', groupId, message, tempId);
    console.log('Group message sent successfully via SignalR');
  } catch (error) {
    console.error('Error sending group message via SignalR:', error);
    throw error;
  }
};