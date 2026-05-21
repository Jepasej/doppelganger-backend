// authentication.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export interface JwtPayload {
  sub: string; // User ID
  email: string;
  roles: string[]; // For RBAC
}

@Injectable()
export class AuthenticationService {
  // Hardcoded keys for demonstration; swap out with process.env variables for your exam submission!
  private readonly jwtAccessSecret = 'ACCESS_TOKEN_SECRET_KEY';
  private readonly jwtRefreshSecret = 'REFRESH_TOKEN_SECRET_KEY';

  constructor(private jwtService: JwtService) {}

  // 1. Generate both access and refresh tokens
  async generateTokens(payload: JwtPayload) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.jwtAccessSecret,
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.jwtRefreshSecret,
        expiresIn: '7d',
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  // 2. Validate a User Login
  async login(loginDto: any) {
    // Perform your DB user lookup and password verification step here
    // const user = await this.userService.validate(loginDto);

    // Mock user data matching your requirements
    const mockPayload: JwtPayload = {
      sub: 'user_uuid_12345',
      email: loginDto.email || 'student@exam.com',
      roles: ['admin'], // Populated array strings representing user roles
    };

    return this.generateTokens(mockPayload);
  }

  // 3. Refreshing the expired Access Token
  async refreshTokens(refreshToken: string) {
    try {
      // Decode and verify the incoming refresh token against the specific refresh secret
      const payload: JwtPayload = await this.jwtService.verifyAsync(
        refreshToken,
        {
          secret: this.jwtRefreshSecret,
        },
      );

      // Clear out native claim variables if jsonwebtoken adds them during signature
      const newPayload: JwtPayload = {
        sub: payload.sub,
        email: payload.email,
        roles: payload.roles,
      };

      // Optional: Check if token matches a saved hash in your database here

      return this.generateTokens(newPayload);
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }
}
