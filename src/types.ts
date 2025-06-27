export interface Chat {
  from: string;
  to: string;
  msg: string;
  chat_id: string;
}

export interface ChatMeta {
  name: string;
  last_message: string;
  chat_id: string;
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
