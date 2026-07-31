export interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  isRead: boolean;
  link: string | null;
  createdAt: string;
}

export interface UnreadCountResponse {
  count: number;
}
