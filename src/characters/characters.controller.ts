import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
} from '@nestjs/common';
import { CharactersService } from './services/characters.service';
import { CreateCharacterDto } from './dto/create-character.dto';
import { UpdateCharacterDto } from './dto/update-character.dto';
import { Request } from 'express';
import { PaginatedResponse } from '../shared/entities/paginated-response.entity';
import { getFullURL } from 'src/shared/util/getFullURL';

@Controller('characters')
export class CharactersController {
  constructor(private readonly charactersService: CharactersService) {}

  @Post()
  create(@Body() createCharacterDto: CreateCharacterDto) {
    return this.charactersService.create(createCharacterDto);
  }

  @Get()
  async findAll(
    @Query('page') rawPage: string,
    @Query('species') species: string,
    @Query('status') status: string,
    @Req() req: Request,
  ) {
    const page = parseInt(rawPage) || 1;
    const { count, results } = await this.charactersService.findAll(
      page,
      species,
      status,
    );

    return PaginatedResponse.fromData(count, page, getFullURL(req), results);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.charactersService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCharacterDto: UpdateCharacterDto,
  ) {
    return this.charactersService.update(id, updateCharacterDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.charactersService.remove(id);
  }
}
