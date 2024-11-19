import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { UsersModule } from 'src/users/users.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [ProfileController],
  providers: [ProfileService],
  imports: [AuthModule, UsersModule],
})
export class ProfileModule {}
