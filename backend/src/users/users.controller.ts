import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersDto } from './users.dto';
import { JwtAuthGuard } from '../auth/auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('createUser')
  async createUser(@Body() usersDto: UsersDto) {
    return this.usersService.createUser(usersDto);
  }

  @Get('getAllUsers')
  @UseGuards(JwtAuthGuard)
  async getAllUsers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('role') role?: string,
    @Query('username') username?: string,
    @Query('email') email?: string,
  ) {
    const filter = {};
    if (role) filter['ROLE'] = role;
    if (username) filter['USERNAME'] = username;
    if (email) filter['EMAIL'] = email;

    return await this.usersService.getAllUsers(
      Number(page),
      Number(limit),
      filter,
    );
  }

  @Get('findOneUser/:id')
  @UseGuards(JwtAuthGuard)
  findOneUser(@Param('id') id: string) {
    return this.usersService.findOneUser(id);
  }

  @Put('updateUser/:id')
  @UseGuards(JwtAuthGuard)
  updateUser(@Param('id') id: string, @Body() usersDto: UsersDto) {
    return this.usersService.updateUser(id, usersDto);
  }

  @Get('getUsersWithTaskCounts')
  @UseGuards(JwtAuthGuard)
  async getUsersWithTaskCounts() {
    return this.usersService.getUsersWithTaskCounts();
  }
}
