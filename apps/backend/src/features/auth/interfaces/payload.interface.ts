import { ROLE } from '@prisma/client';

export interface JwtPayload {
  email: string;
  sub: string;
  name: string;
  role: ROLE;
}
