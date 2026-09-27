import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiProperty,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { AdminGuard } from '../admin.guard';
import type { AdminRequest } from '../admin.guard';
import { AuthService } from './auth.service';

class GoogleLoginDto {
  @ApiProperty({
    description: 'ID token (JWT) ที่ได้จากปุ่ม Sign in with Google',
  })
  @IsString()
  @IsNotEmpty({ message: 'ไม่พบข้อมูลการล็อกอิน' })
  @MaxLength(5000)
  credential: string;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  /** ค่าที่หน้าเว็บต้องใช้เพื่อแสดงปุ่ม Sign in with Google */
  @Get('config')
  @ApiOperation({ summary: 'ค่าตั้งต้นสำหรับปุ่ม Sign in with Google' })
  config() {
    return this.auth.config();
  }

  @Post('google')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({
    summary: 'ล็อกอินด้วย Google ID token → ได้ session token (8 ชม.)',
    description: 'รับเฉพาะอีเมลในโดเมนที่อนุญาต (@kku.ac.th, @kkumail.com)',
  })
  google(@Body() body: GoogleLoginDto) {
    return this.auth.loginWithGoogle(body.credential);
  }

  @Get('me')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'ข้อมูลผู้ใช้ที่ล็อกอินอยู่' })
  me(@Req() req: AdminRequest) {
    return req.user ?? null;
  }
}
