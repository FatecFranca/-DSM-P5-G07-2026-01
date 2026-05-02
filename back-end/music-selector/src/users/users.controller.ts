import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthService } from '../auth/auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CompleteOnboardingDto } from './dto/complete-onboarding.dto';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Post('register')
  @HttpCode(201)
  async register(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() credentials: { email: string; password: string }) {
    return this.authService.signIn(credentials.email, credentials.password);
  }

  @Post('forgot-password')
  @HttpCode(200)
  async forgotPassword(@Body() { email }: { email: string }) {
    return this.usersService.requestPasswordReset(email);
  }

  @Post('reset-password')
  @HttpCode(200)
  async resetPassword(@Body() body: { token: string; password: string; passwordConfirmation: string }) {
    return this.usersService.resetPassword(body.token, body.password, body.passwordConfirmation);
  }

  @Post(':id/onboarding')
  @HttpCode(200)
  async completeOnboarding(
    @Param('id') userId: string,
    @Body() body: CompleteOnboardingDto,
  ) {
    return this.usersService.completeOnboarding(
      userId,
      body.favoriteGenres,
      body.audioPreference,
    );
  }

  @Patch(':id')
  @HttpCode(200)
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @HttpCode(200)
  async deleteAccount(@Param('id') id: string) {
    return this.usersService.deleteAccount(id);
  }

  @Post('logout')
  @HttpCode(200)
  async logout() {
    return this.usersService.logout();
  }

  @Get()
  @HttpCode(200)
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @HttpCode(200)
  async findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Delete(':id/hard')
  @HttpCode(200)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
