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
import { ParticipationsService } from './services/participations.service';
import { CreateParticipationDto } from './dto/create-participation.dto';
import { UpdateParticipationDto } from './dto/update-participation.dto';
import { PaginatedResponse } from 'src/shared/entities/paginated-response.entity';
import { getFullURL } from 'src/shared/util/getFullURL';
import { Request } from 'express';
import { DeleteParticipationFromEpisodeDto } from './dto/delete-participation-from-episode.dto';

@Controller('participations')
export class ParticipationsController {
  constructor(private readonly participationsService: ParticipationsService) {}

  @Post()
  create(@Body() createParticipationDto: CreateParticipationDto) {
    return this.participationsService.create(createParticipationDto);
  }

  @Get()
  async findAll(
    @Req() req: Request,
    @Query('page') rawPage: string,
    @Query('season') season: string,
    @Query('characterStatus') characterStatus: string,
    @Query('episodeStatus') episodeStatus: string,
    @Query('episodeId') episodeId: string,
    @Query('characterId') characterId: string,
  ) {
    const page = parseInt(rawPage) || 1;
    const { count, results } = await this.participationsService.findAll(
      page,
      season,
      characterStatus,
      episodeStatus,
      episodeId,
      characterId,
    );

    return PaginatedResponse.fromData(count, page, getFullURL(req), results);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.participationsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateParticipationDto: UpdateParticipationDto,
  ) {
    return this.participationsService.update(id, updateParticipationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.participationsService.remove(id);
  }

  @Delete()
  removeCharacterFromEpisode(
    @Body()
    deleteParticipationFromEpisodeDto: DeleteParticipationFromEpisodeDto,
  ) {
    return this.participationsService.removeByCharacterFromEpisode(
      deleteParticipationFromEpisodeDto,
    );
  }
}
