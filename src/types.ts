export interface Chat {
  from: string;
  to: string;
  message: string;
  chatId: string;
}

export interface ChatMeta {
  name: string;
  lastMessage: string;
  chatId: string;
}

export interface UserInfo {
  username: string;
  password: string;
  chats: ChatMeta[];
}

export interface Conversations {
  id: number;
  conversation: Chat[];
}

export interface message {
  from: string;
  to: string;
  message: string;
}
