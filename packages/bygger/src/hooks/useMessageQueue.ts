import React, { useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";

type MessageType = "success" | "warning" | "error";
type MessageIn = { title?: string; message: string; type: MessageType };
export type Message = MessageIn & { id: string; clear: () => void };

class MessageQueue {
  setQueueState: React.Dispatch<React.SetStateAction<Message[]>>;

  constructor(setQueue: React.Dispatch<React.SetStateAction<Message[]>>) {
    this.setQueueState = setQueue;
  }

  remove(id: string) {
    this.setQueueState((prevState) => prevState.filter((m) => id !== m.id));
  }

  push(message: MessageIn) {
    const id = uuidv4();
    this.setQueueState((prevState) => [...prevState, { id, clear: () => this.remove(id), ...message }]);
  }
}

export default function useMessageQueue(): [Message[], MessageQueue] {
  const [messages, setMessages] = useState<Message[]>([]);
  const messageQueue = useMemo(() => new MessageQueue(setMessages), []);
  return [messages, messageQueue];
}
