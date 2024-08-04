import { HttpException, HttpStatus } from '@nestjs/common';

interface Info {
  count: number;
  next: string | null;
  pages: number;
  prev: string | null;
}

export class PaginatedResponse {
  info: Info;
  results: any[];

  private constructor(info, results) {
    this.info = info;
    this.results = results;
  }

  static fromData(
    count: number,
    pageNumber: number,
    rawUrl: string,
    data: any[],
  ) {
    const pageSize = 5;
    const pages = Math.ceil(count / pageSize);
    if (pageNumber > pages) {
      throw new HttpException('There is nothing here', HttpStatus.NOT_FOUND);
    }

    const info: Info = {
      count,
      pages,
      next:
        pageNumber < pageSize
          ? this.generatePageURL(rawUrl, pageNumber + 1 + '')
          : null,
      prev:
        pageNumber > 1
          ? this.generatePageURL(rawUrl, pageNumber - 1 + '')
          : null,
    };

    return new PaginatedResponse(info, data);
  }

  private static generatePageURL(rawUrl: string, pageNumber: string) {
    const url = new URL(rawUrl);
    url.searchParams.set('page', pageNumber);

    return url.toString();
  }
}
