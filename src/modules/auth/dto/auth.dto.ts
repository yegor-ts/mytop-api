import { IsEmail, IsString } from 'class-validator';

export class AuthDto {
  @IsEmail()
  @IsString()
  login: string;

  @IsString()
  password: string;
}
