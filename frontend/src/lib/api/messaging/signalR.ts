import * as signalR from '@microsoft/signalr';
import { BACKEND_URL } from '../constants';

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
    return true;
  } catch (err) {
    console.error('SignalR connection error:', err);
    return false;
  }
};

export const setupMessageHandler = (
  connection: signalR.HubConnection,
  handler: (message: any) => void
) => {
  connection.on('ReceiveMessage', handler);
  return () => {
    connection.off('ReceiveMessage', handler);
  };
};

export const sendMessageViaSignalR = async (
  connection: signalR.HubConnection,
  receiverId: number,
  message: string,
  tempId: string
) => {
  try {
    await connection.invoke('SendMessage', receiverId, message, tempId)
  } catch (error) {
    console.error('Error sending message via SignalR:', error)
    throw error
  }
}