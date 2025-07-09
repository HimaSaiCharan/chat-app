export interface Chat {
  from: string;
  to: string;
  message: string;
  chatId: string | null | undefined;
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

export interface message {
  from: string;
  to: string;
  message: string;
}
export type Document = { [key: string]: any };
