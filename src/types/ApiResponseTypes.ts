import { Message } from "@/model/User.model";

export interface ApiResponseType {
  success: boolean;
  message: string;
  isAcceptingMessages?: boolean;
  messages?: Array<Message>;
}
