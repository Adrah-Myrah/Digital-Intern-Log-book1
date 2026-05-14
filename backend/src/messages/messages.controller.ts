import { Controller, Post, Get, Patch, Delete, Body, Param, Query, ForbiddenException, Req, UseGuards } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { SendMessageDto } from './dto/send-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';

@Controller('messages')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  // POST /api/messages — send a message
  @Post()
  @Roles('student', 'school-supervisor', 'industry-supervisor', 'admin')
  sendMessage(@Body() body: SendMessageDto, @Req() req: any) {
    return this.messagesService.sendMessage(Number(req.user.sub), body.receiverId, body.content);
  }

  // GET /api/messages/available-users?q=... — list authorized contacts
  @Get('available-users')
  @Roles('student', 'school-supervisor', 'industry-supervisor', 'admin')
  getAvailableUsers(@Req() req: any, @Query('q') query?: string) {
    const userId = Number(req.user.sub ?? req.user.id);
    return this.messagesService.getAvailableUsers(userId, req.user.role, query);
  }

  // GET /api/messages/conversation/with/:otherUserId
  @Get('conversation/with/:otherUserId')
  @Roles('student', 'school-supervisor', 'industry-supervisor', 'admin')
  getConversationWith(
    @Param('otherUserId') otherUserId: string,
    @Req() req: any,
  ) {
    return this.messagesService.getConversation(Number(req.user.sub), Number(otherUserId));
  }

  // GET /api/messages/conversation/:userId1/:userId2
  @Get('conversation/:userId1/:userId2')
  @Roles('student', 'school-supervisor', 'industry-supervisor', 'admin')
  getConversation(
    @Param('userId1') userId1: string,
    @Param('userId2') userId2: string,
    @Req() req: any,
  ) {
    const me = Number(req.user.sub);
    if (req.user.role !== 'admin' && me !== Number(userId1) && me !== Number(userId2)) {
      throw new ForbiddenException('You can only access your own conversations');
    }
    return this.messagesService.getConversation(Number(userId1), Number(userId2));
  }

  // GET /api/messages/user/:userId — all conversations
  @Get('user/:userId')
  @Roles('student', 'school-supervisor', 'industry-supervisor', 'admin')
  getUserConversations(@Param('userId') userId: string, @Req() req: any) {
    if (req.user.role !== 'admin' && Number(req.user.sub) !== Number(userId)) {
      throw new ForbiddenException('You can only access your own conversation list');
    }
    return this.messagesService.getUserConversations(Number(userId));
  }

  // GET /api/messages/unread/:userId — unread count
  @Get('unread/:userId')
  @Roles('student', 'school-supervisor', 'industry-supervisor', 'admin')
  getUnreadCount(@Param('userId') userId: string, @Req() req: any) {
    if (req.user.role !== 'admin' && Number(req.user.sub) !== Number(userId)) {
      throw new ForbiddenException('You can only access your own unread count');
    }
    return this.messagesService.getUnreadCount(Number(userId));
  }

  // PATCH /api/messages/read/:senderId/:receiverId — mark as read
  @Patch('read/:senderId/:receiverId')
  @Roles('student', 'school-supervisor', 'industry-supervisor', 'admin')
  markAsRead(
    @Param('senderId') senderId: string,
    @Param('receiverId') receiverId: string,
    @Req() req: any,
  ) {
    if (req.user.role !== 'admin' && Number(req.user.sub) !== Number(receiverId)) {
      throw new ForbiddenException('You can only mark messages sent to you as read');
    }
    return this.messagesService.markAsRead(Number(senderId), Number(receiverId));
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @Roles('school-supervisor', 'industry-supervisor', 'admin')
  async deleteMessage(@Param('id') id: string, @Req() req: any) {
    return this.messagesService.deleteMessage(Number(id), Number(req.user.sub));
  }
}