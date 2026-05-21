// authentication.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config'; // Optional: If you are using ConfigService
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({}),
    ConfigModule, // imported so ConfigService is available to your strategy
  ],
  controllers: [AuthenticationController],
  providers: [AuthenticationService, JwtStrategy], // JwtStrategy added here so Nest can instantiate it
  exports: [AuthenticationService, JwtModule],
})
export class AuthenticationModule {}
