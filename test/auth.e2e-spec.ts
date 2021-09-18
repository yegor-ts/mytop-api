import { NestApplication } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import * as request from 'supertest';
import { disconnect } from 'mongoose';
import { AuthDto } from '../src/modules/auth/dto/auth.dto';
import { UserModel } from '../src/modules/auth/user.model';
import {
  USER_NOT_FOUND,
  WRONG_PASSWORD,
} from '../src/modules/auth/auth.constants';

const userTestCredentials: AuthDto = {
  login: 'user@test.com',
  password: 'test',
};

const wrongEmailUserTestCredentials: AuthDto = {
  login: 'wrong@test.com',
  password: 'test',
};

const wrongPasswordUserTestCredentials: AuthDto = {
  login: 'user@test.com',
  password: 'wrong',
};

describe('AuthController (e2e)', () => {
  let app: NestApplication;
  let createdUser: UserModel;
  let jwtAccessToken: string;

  beforeEach(async () => {
	const moduleFixture: TestingModule = await Test.createTestingModule({
		imports: [AppModule],
	}).compile();

	app = moduleFixture.createNestApplication();
	await app.init();
  });

  it('/auth/register (POST) - proper values', () => {
	return request(app.getHttpServer())
		.post('/auth/register')
		.send(userTestCredentials)
		.expect(201)
		.then(({ body }: request.Response) => {
		createdUser = body;
		expect(createdUser).toBeDefined();
		});
  });

  it('/auth/login (POST) - proper  values', () => {
	return request(app.getHttpServer())
		.post('/auth/login')
		.send(userTestCredentials)
		.expect(200)
		.then(({ body }: request.Response) => {
		jwtAccessToken = body;
		expect(jwtAccessToken).toBeDefined();
		});
  });

  it('/auth/login (POST) - improper email value', () => {
	return request(app.getHttpServer())
		.post('/auth/login')
		.send(wrongEmailUserTestCredentials)
		.expect(401, {
		statusCode: 401,
		message: USER_NOT_FOUND,
		error: 'Unauthorized',
		});
  });

  it('/auth/login (POST) - improper password value', () => {
	return request(app.getHttpServer())
		.post('/auth/login')
		.send(wrongPasswordUserTestCredentials)
		.expect(401, {
		statusCode: 401,
		message: WRONG_PASSWORD,
		error: 'Unauthorized',
		});
  });
  afterAll(() => {
	disconnect();
  });
});
