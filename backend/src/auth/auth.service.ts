// import { Injectable } from '@nestjs/common';

// @Injectable()
// export class AuthService {}

import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from 'src/users/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email already registered');

    const hashed = await bcrypt.hash(dto.password, 10);

    const user = await this.usersService.createUser({
      ...dto,
      password: hashed,
    });

    return { message: 'Account created successfully', role: user.role };
  }

  async login(dto: LoginDto) {
    // ✅ Tell TypeScript it can be a User or null
let user: User | null = null;

    if (dto.role === 'student') {
      user = await this.usersService.findByRegNumber(dto.identifier);
    } else {
      user = await this.usersService.findByStaffId(dto.identifier);
    }

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const passwordMatch = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatch) throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: user.id, role: user.role, name: user.fullName };
    const token = this.jwtService.sign(payload);

    return { token, role: user.role, name: user.fullName, id: user.id };
  }
}