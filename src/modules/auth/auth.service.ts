import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthDto } from './dto/auth.dto';
import { InjectModel } from 'nestjs-typegoose';
import { UserModel } from './user.model';
import { ModelType } from '@typegoose/typegoose/lib/types';
import { compare, genSalt, hash } from 'bcryptjs';
import { USER_NOT_FOUND, WRONG_PASSWORD } from './auth.constants';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
	@InjectModel(UserModel) private readonly userModel: ModelType<UserModel>,
	private readonly jwtService: JwtService,
  ) {}

  async createUser(dto: AuthDto) {
	const newUser = new this.userModel({
		email: dto.login,
		passwordHash: await hash(dto.password, await genSalt(10)),
	});

	return newUser.save();
  }

  findUser(email: string) {
	return this.userModel.findOne({ email }).exec();
  }

  async validateUser(
	email: string,
	password: string,
  ): Promise<Pick<UserModel, 'email'>> {
	const user = await this.findUser(email);
	if (!user) {
		throw new UnauthorizedException(USER_NOT_FOUND);
	}
	const isValidPassword = await compare(password, user.passwordHash);
	if (!isValidPassword) {
		throw new UnauthorizedException(WRONG_PASSWORD);
	}
	return { email: user.email };
  }

  async login(email: string) {
	const payload = { email };
	return {
		access_token: await this.jwtService.signAsync(payload),
	};
  }
}
