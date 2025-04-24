import { v4 as uuidv4 } from 'uuid';

type MessageType = 'success' | 'warning' | 'error';
type MessageIn = { title?: string; message: string; type: MessageType };
export type Message = MessageIn & { id: string; created: string };

type Action =
  | { type: 'ADD_MESSAGE'; payload: MessageIn }
  | { type: 'REMOVE_MESSAGE'; payload: { id: string } }
  | { type: 'CLEAR_ALL' };

const getInitValues = (): Pick<Message, 'id' | 'created'> => ({ id: uuidv4(), created: new Date().toLocaleString() });

const messageReducer = (state: Message[], action: Action): Message[] => {
  switch (action.type) {
    case 'ADD_MESSAGE':
      return [{ ...getInitValues(), ...action.payload }, ...state];
    case 'REMOVE_MESSAGE':
      return state.filter((message) => message.id !== action.payload.id);
    case 'CLEAR_ALL':
      return [];
    default:
      return state;
  }
};

export default messageReducer;
