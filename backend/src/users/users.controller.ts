import { Controller, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) { }

  @Get('students')
  getAllStudents() {
    return this.usersService.findAllStudents();
  }

  @Get(':id')
  getUserById(@Param('id') id: string) {
    return this.usersService.findById(Number(id));
  }

}

