import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { envs } from 'src/config/envs';

@Injectable()
export class InternalJwtService {
  constructor(private readonly jwtService: JwtService) {}

  async generateJWT(payload: any) {
    return await this.jwtService.signAsync(payload);
  }

  async generateRefreshToken(payload: any) {
    return await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
      secret: envs.JWT_REFRESH_SECRET,
    });
  }

  async verifyRefreshToken(refreshToken: string): Promise<{ sub: string }> {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: envs.JWT_REFRESH_SECRET,
      });
      return payload;
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
