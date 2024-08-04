import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Query,
} from '@nestjs/common';
import { EpisodesService } from './services/episodes.service';
import { CreateEpisodeDto } from './dto/create-episode.dto';
import { UpdateEpisodeDto } from './dto/update-episode.dto';
import { PaginatedResponse } from 'src/shared/entities/paginated-response.entity';
import { Request } from 'express';
import { getFullURL } from 'src/shared/util/getFullURL';

@Controller('episodes')
export class EpisodesController {
  constructor(private readonly episodesService: EpisodesService) {}

  @Post()
  create(@Body() createEpisodeDto: CreateEpisodeDto) {
    return this.episodesService.create(createEpisodeDto);
  }

  @Get()
  async findAll(
    @Req() req: Request,
    @Query('page') rawPage: string,
    @Query('season') season: string,
  ) {
    const page = parseInt(rawPage) || 1;
    const { count, results } = await this.episodesService.findAll(page, season);

    return PaginatedResponse.fromData(count, page, getFullURL(req), results);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.episodesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEpisodeDto: UpdateEpisodeDto) {
    return this.episodesService.update(id, updateEpisodeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.episodesService.remove(id);
  }

  @Get(':id/participations')
  findParticipationsByEpisode(@Param('id') id: string) {
    return this.episodesService.findOne(id);
  }
}
