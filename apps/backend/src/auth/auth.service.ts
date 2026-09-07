import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@/prisma/prisma.service';
import { AdminLoginDto, AdminRegisterDto, AdminAuthResponseDto } from './dto/admin-auth.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async adminLogin(loginDto: AdminLoginDto): Promise<AdminAuthResponseDto> {
    const { email, password } = loginDto;

    const adminUser = await this.prisma.adminUser.findUnique({
      where: { email },
    });

    if (!adminUser) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!adminUser.active) {
      throw new UnauthorizedException('Admin account is inactive');
    }

    const isPasswordValid = await bcrypt.compare(password, adminUser.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = this.jwtService.sign({
      sub: adminUser.id,
      email: adminUser.email,
      role: adminUser.role,
    });

    return {
      id: adminUser.id,
      email: adminUser.email,
      name: adminUser.name,
      role: adminUser.role,
      accessToken,
    };
  }

  async adminRegister(registerDto: AdminRegisterDto): Promise<AdminAuthResponseDto> {
    const { email, password, name } = registerDto;

    const existing = await this.prisma.adminUser.findUnique({
      where: { email },
    });

    if (existing) {
      throw new BadRequestException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const adminUser = await this.prisma.adminUser.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'ADMIN',
        active: true,
      },
    });

    const accessToken = this.jwtService.sign({
      sub: adminUser.id,
      email: adminUser.email,
      role: adminUser.role,
    });

    return {
      id: adminUser.id,
      email: adminUser.email,
      name: adminUser.name,
      role: adminUser.role,
      accessToken,
    };
  }

  async validateAdminUser(email: string): Promise<any> {
    return this.prisma.adminUser.findUnique({
      where: { email },
    });
  }

  async getAdminById(id: string) {
    return this.prisma.adminUser.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true,
        createdAt: true,
      },
    });
  }
}

