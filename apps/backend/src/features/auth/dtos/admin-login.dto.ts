import { IsNotEmpty, MinLength, IsEmail } from 'class-validator';

export class AdminLoginDto {
  @IsNotEmpty({
    message: 'A senha é obrigatória',
  })
  @MinLength(6, {
    message: 'A senha deve ter no mínimo 6 caracteres',
  })
  password: string;

  @IsEmail(undefined, {
    message: 'O e-mail é inválido',
  })
  email: string;
}
