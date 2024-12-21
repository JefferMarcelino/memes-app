import * as bcrypt from 'bcryptjs';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from 'src/infrastructure/database.service';
import { JwtService } from '@nestjs/jwt';
import { AdminLoginDto } from './dtos/admin-login.dto';
import { ROLE, User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private databaseService: DatabaseService,
    private jwtService: JwtService,
  ) {}

  async adminLogin(dto: AdminLoginDto) {
    const user = await this.databaseService.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Credênciais inválidas');
    }

    return this.generateToken(user.id, user.email, user.role, user.name);
  }

  async validateUser(user: User) {
    if (!user) {
      throw new UnauthorizedException('Token inválido');
    }

    return user;
  }

  private generateToken(
    userId: string,
    email: string | null,
    role: ROLE,
    name: string,
  ) {
    const payload = { sub: userId, email, role, name };

    return {
      access_token: this.jwtService.sign(payload),
      userId,
      email,
      name,
      role,
    };
  }
}
