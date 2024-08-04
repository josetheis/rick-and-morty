import { PartialType } from '@nestjs/mapped-types';
import { CreateCharacterDto } from './create-character.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateCharacterDto extends PartialType(CreateCharacterDto) {
  @IsString()
  @IsOptional()
  status?: string;
}
