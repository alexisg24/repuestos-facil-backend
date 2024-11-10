import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { envs } from 'src/config/envs';
import { InternalJwtService } from './internal-jwt.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, InternalJwtService],
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      global: true,
      secret: envs.JWT_SECRET,
      signOptions: { expiresIn: '10m' },
    }),
  ],
})
export class AuthModule {}
