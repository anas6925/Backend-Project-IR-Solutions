// src/auth/auth.service.ts
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(loginDto: LoginDto) {
    try {
      const user = await this.usersService.findOneUserByEmail(loginDto.EMAIL);
      if (user && (await bcrypt.compare(loginDto.PASSWORD, user.PASSWORD))) {
        const responseData = {
          _id: user._id,
          USERNAME: user.USERNAME,
          EMAIL: user.EMAIL,
          ROLE: user.ROLE,
        };

        return {
          status: 'SUCCESS',
          message: 'Login successful',
          data: {
            ...responseData,
            token: this.jwtService.sign({ id: user._id, email: user.EMAIL }),
          },
        };
      }

      return {
        status: 'FAILURE',
        message: 'Invalid credentials',
        data: null,
      };
    } catch (error) {
      console.error('Error during user validation:', error);
      return {
        status: 'FAILURE',
        message: 'An error occurred during login',
        data: null,
      };
    }
  }
}
