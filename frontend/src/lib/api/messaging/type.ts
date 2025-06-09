// lib/api/messaging/type.ts
import { ExtendedMessage } from '@/lib/api/types';

export type { Message, PendingMessage, ExtendedMessage } from '@/lib/api/types';

export type MessageAction =
  | { type: 'set'; payload: ExtendedMessage[] }
  | { type: 'add'; payload: ExtendedMessage[] }
  | { type: 'prepend'; payload: ExtendedMessage[] }
  | { type: 'remove'; payload: number };

export const messageReducer = (
  state: ExtendedMessage[],
  action: MessageAction
): ExtendedMessage[] => {
  switch (action.type) {
    case 'set':
      return action.payload.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    case 'add':
      let newState = [...state];
      action.payload.forEach((newMessage) => {
        if (newMessage.messageId !== -1 && typeof newMessage.messageId === 'number') {
          const existingIndex = newState.findIndex(
            (existingMsg) => existingMsg.messageId === newMessage.messageId
          );
          if (existingIndex !== -1) {
            return; // Skip duplicate message
          }
        }
        newState.push(newMessage);
      });
      return newState.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    case 'prepend':
      const uniquePrependedMessages = action.payload.filter(
        (prependingMessage) => !state.some((existing) => existing.messageId === prependingMessage.messageId)
      );
      return [...uniquePrependedMessages, ...state].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    case 'remove':
      return state.filter((msg) => msg.messageId !== action.payload);

    default:
      return state;
  }
};

export const formatTime = (isoString: string): string => {
  const date = new Date(isoString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hr ago`;
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;

  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }) + ' ' + date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });
};