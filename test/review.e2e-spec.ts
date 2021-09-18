import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { CreateReviewDto } from '../src/modules/review/dto/create-review.dto';
import { Types, disconnect } from 'mongoose';
import { REVIEW_NOT_FOUND } from '../src/modules/review/review.constants';
import { AuthDto } from '../src/modules/auth/dto/auth.dto';

const productId = new Types.ObjectId().toHexString();

const loginDto: AuthDto = {
  login: 'test@test.com',
  password: '12345',
};

const testDto: CreateReviewDto = {
  name: 'Test',
  title: 'Test title',
  description: 'Test description',
  rating: 5,
  productId,
};

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let createdId: string;
  let jwtToken: string;

  beforeEach(async () => {
	const moduleFixture: TestingModule = await Test.createTestingModule({
		imports: [AppModule],
	}).compile();

	app = moduleFixture.createNestApplication();
	await app.init();

	const { body } = await request(app.getHttpServer())
		.post('/auth/login')
		.send(loginDto);
	jwtToken = body.access_token;
  });

  it('/review/create (POST) - proper values', async (done) => {
	return request(app.getHttpServer())
		.post('/review/create')
		.send(testDto)
		.expect(201)
		.then(({ body }: request.Response) => {
		createdId = body._id;
		expect(createdId).toBeDefined();
		done();
		});
  });

  it('/review/byProduct/:productId (GET) - improper values', async (done) => {
	return request(app.getHttpServer())
		.get(`/review/byProduct/${new Types.ObjectId().toHexString()}`)
		.set('Authorization', `Bearer ${jwtToken}`)
		.expect(200)
		.then(({ body }: request.Response) => {
		expect(body.length).toBe(0);
		done();
		});
  });

  it('/review/:id (DELETE) - success', () => {
	return request(app.getHttpServer())
		.delete(`/review/${createdId}`)
		.set('Authorization', `Bearer ${jwtToken}`)
		.expect(200);
  });

  it('/review/:id (DELETE) - fail', () => {
	return request(app.getHttpServer())
		.delete(`/review/${new Types.ObjectId().toHexString()}`)
		.set('Authorization', `Bearer ${jwtToken}`)
		.expect(404, {
		statusCode: 404,
		message: REVIEW_NOT_FOUND,
		});
  });

  afterAll(() => {
	disconnect();
  });
});
