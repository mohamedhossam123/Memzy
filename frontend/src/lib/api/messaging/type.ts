export interface Message {
  messageId: number;
  content: string;
  timestamp: string;
  senderId: number;
  receiverId: number;
  formattedTime?: string;
}

export interface PendingMessage extends Message {
  isPending: true;
  tempId: string;
}

export type ExtendedMessage = Message | PendingMessage;

export type MessageAction = 
  | { type: 'add'; payload: Message[] }
  | { type: 'prepend'; payload: Message[] }
  | { type: 'set'; payload: Message[] }
  | { type: 'remove'; payload: number };

export const messageReducer = (state: Message[], action: MessageAction): Message[] => {
  switch (action.type) {
    case 'remove':
      return state.filter(msg => msg.messageId !== action.payload);
    case 'add':
      return [...state, ...action.payload];
    case 'prepend':
      return [...action.payload, ...state];
    case 'set':  
      return action.payload;
    default:
      return state;
  }
};

export const formatTime = (timestamp: string) =>
  new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });