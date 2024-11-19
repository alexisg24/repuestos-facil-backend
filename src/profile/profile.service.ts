/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AuthService } from 'src/auth/auth.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class ProfileService {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  async find() {
    const reqUser = this.authService.getUserFromRequest();
    const { password: _, ...validatedUser } = await this.usersService.findOne(
      reqUser.sub,
    );
    return validatedUser;
  }

  async update(updateProfileDto: UpdateProfileDto) {
    const reqUser = this.authService.getUserFromRequest();
    const { password: _, ...updatedUser } = await this.usersService.update(
      reqUser.sub,
      updateProfileDto,
    );
    return updatedUser;
  }
}
