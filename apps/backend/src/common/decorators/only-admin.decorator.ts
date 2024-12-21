import { SetMetadata } from '@nestjs/common';

export const OnlyAdmin = () => SetMetadata('roles', ['ADMIN']);
