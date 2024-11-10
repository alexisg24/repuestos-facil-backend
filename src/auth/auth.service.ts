/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Inject,
  Injectable,
  Scope,
  UnauthorizedException,
} from '@nestjs/common';
import { SignInDto } from './dto/sign-in.dto';
import { UsersService } from 'src/users/users.service';
import { comparePassword, encryptPassword } from './helpers';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { REQUEST } from '@nestjs/core';
import { RequestWithUser } from './guards/auth.guard';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { User } from 'src/users/entities/user.entity';
import { InternalJwtService } from './internal-jwt.service';

@Injectable({ scope: Scope.REQUEST })
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly internalJwtService: InternalJwtService,
    @Inject(REQUEST) private readonly request: Request,
  ) {}

  async signIn(signInDto: SignInDto) {
    const { email, password } = signInDto;
    const user = await this.usersService.findOneByEmail(email);
    const { password: userPassword, ...userData } = user;
    if (!(await comparePassword(password, userPassword))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = {
      sub: userData.id,
      ...userData,
    };
    return this.generateAuthResponse({ payload, user: userData });
  }

  async signUp(createUserDto: CreateUserDto) {
    const hashedPassword = await encryptPassword(createUserDto.password);
    const user = await this.usersService.create({
      ...createUserDto,
      password: hashedPassword,
    });
    const { password: _, ...newUser } = user;
    const payload = {
      sub: newUser.id,
      ...newUser,
    };
    return this.generateAuthResponse({ payload, user: newUser });
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    const { sub } = await this.internalJwtService.verifyRefreshToken(
      refreshTokenDto.refreshToken,
    );
    const user = await this.usersService.findOne(sub);
    const { password: _, id, ...newUser } = user;
    const payload = {
      sub: id,
      ...newUser,
    };

    return {
      access_token: await this.internalJwtService.generateJWT(payload),
      id,
      ...newUser,
    };
  }

  getUserFromRequest() {
    const user = (this.request as unknown as RequestWithUser).user;
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }

  private async generateAuthResponse({
    payload,
    user,
  }: {
    user: Omit<User, 'password'>;
    payload: Omit<User, 'password' | 'id'> & { sub: string };
  }) {
    return {
      access_token: await this.internalJwtService.generateJWT(payload),
      refresh_token: await this.internalJwtService.generateRefreshToken({
        sub: user.id,
      }),
      ...user,
    };
  }
}
