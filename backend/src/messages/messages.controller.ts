import { Controller, Post, Get, Patch, Body, Param } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { SendMessageDto } from './dto/send-message.dto';

@Controller('messages')
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  // POST /api/messages — send a message
  @Post()
  sendMessage(@Body() body: SendMessageDto) {
    return this.messagesService.sendMessage(body);
  }

  // GET /api/messages/conversation/:userId1/:userId2
  @Get('conversation/:userId1/:userId2')
  getConversation(
    @Param('userId1') userId1: string,
    @Param('userId2') userId2: string,
  ) {
    return this.messagesService.getConversation(Number(userId1), Number(userId2));
  }

  // GET /api/messages/user/:userId — all conversations
  @Get('user/:userId')
  getUserConversations(@Param('userId') userId: string) {
    return this.messagesService.getUserConversations(Number(userId));
  }

  // GET /api/messages/unread/:userId — unread count
  @Get('unread/:userId')
  getUnreadCount(@Param('userId') userId: string) {
    return this.messagesService.getUnreadCount(Number(userId));
  }

  // PATCH /api/messages/read/:senderId/:receiverId — mark as read
  @Patch('read/:senderId/:receiverId')
  markAsRead(
    @Param('senderId') senderId: string,
    @Param('receiverId') receiverId: string,
  ) {
    return this.messagesService.markAsRead(Number(senderId), Number(receiverId));
  }
}