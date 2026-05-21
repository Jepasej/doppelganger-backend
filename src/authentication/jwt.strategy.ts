// jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // Make sure this matches the access token secret used in your AuthenticationService
      secretOrKey:
        config.get<string>('JWT_SECRET') || 'ACCESS_TOKEN_SECRET_KEY',
    });
  }

  async validate(payload: any) {
    // This return value becomes request.user in your endpoints
    return payload;
  }
}
