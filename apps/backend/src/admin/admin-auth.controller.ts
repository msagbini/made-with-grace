import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from '@/auth/auth.service';
import { JwtAuthGuard } from '@/auth/jwt.guard';
import { AdminLoginDto, AdminRegisterDto, AdminAuthResponseDto } from '@/auth/dto/admin-auth.dto';

@ApiTags('Admin Auth')
@Controller('admin/auth')
export class AdminAuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Admin login' })
  async login(@Body() loginDto: AdminLoginDto): Promise<AdminAuthResponseDto> {
    return this.authService.adminLogin(loginDto);
  }

  @Post('register')
  @ApiOperation({ summary: 'Admin registration (first admin only)' })
  async register(@Body() registerDto: AdminRegisterDto): Promise<AdminAuthResponseDto> {
    return this.authService.adminRegister(registerDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current admin user info' })
  async getCurrentAdmin(@Request() req: any) {
    return this.authService.getAdminById(req.user.sub);
  }
}
