import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { INVALID_ID } from './id-validation.constants';

@Injectable()
export class IdValidationPipe implements PipeTransform {
  transform(value: string, metadata: ArgumentMetadata) {
	if (metadata.type != 'param') {
		return value;
	}
	if (!Types.ObjectId.isValid(value)) {
		throw new BadRequestException(INVALID_ID);
	}
	return value;
  }
}
