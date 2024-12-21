import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from './features/auth/auth.module';
import { MemeImageModule } from './features/meme-image/meme-image.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'node:path';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    InfrastructureModule,
    AuthModule,
    MemeImageModule,
  ],
  providers: [],
})
export class AppModule {}
