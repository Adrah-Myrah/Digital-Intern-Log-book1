import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  ForbiddenException,
  Req,
  UseGuards,
} from '@nestjs/common';
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
    if (
      req.user.role !== 'admin' &&
      Number(req.user.sub) !== Number(body.senderId)
    ) {
      throw new ForbiddenException('You can only send as your own user');
    }
    return this.messagesService.sendMessage(body);
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
    if (
      req.user.role !== 'admin' &&
      me !== Number(userId1) &&
      me !== Number(userId2)
    ) {
      throw new ForbiddenException(
        'You can only access your own conversations',
      );
    }
    return this.messagesService.getConversation(
      Number(userId1),
      Number(userId2),
    );
  }

  // GET /api/messages/user/:userId — all conversations
  @Get('user/:userId')
  @Roles('student', 'school-supervisor', 'industry-supervisor', 'admin')
  getUserConversations(@Param('userId') userId: string, @Req() req: any) {
    if (req.user.role !== 'admin' && Number(req.user.sub) !== Number(userId)) {
      throw new ForbiddenException(
        'You can only access your own conversation list',
      );
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
    if (
      req.user.role !== 'admin' &&
      Number(req.user.sub) !== Number(receiverId)
    ) {
      throw new ForbiddenException(
        'You can only mark messages sent to you as read',
      );
    }
    return this.messagesService.markAsRead(
      Number(senderId),
      Number(receiverId),
    );
  }
}
