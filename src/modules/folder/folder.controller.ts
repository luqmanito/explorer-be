import { Body, Controller, Get, HttpStatus, Param, Post, Query } from '@nestjs/common';
import { QueryParams, SUCCESS_STATUS } from 'src/dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { FolderService } from './folder.service';

@Controller('folders')
@ApiTags('Folders')
export class FolderController {
  constructor(private readonly folderService: FolderService) {}

  @Get()
  @ApiOperation({
    summary: 'Get Barang',
    description: 'Get barang using query params',
  })
  async get(@Query() params: QueryParams) {
    try {
      const { total_data, data } = await this.folderService.get(params);

      const metadata = {
        total_count: total_data,
        page_count: params.is_all_data
          ? 1
          : Math.ceil(total_data / (params.per_page ?? 10)),
        page: params.is_all_data ? 1 : params.page,
        per_page: params.is_all_data ? total_data : params.per_page,
        sort: params.sort,
        order_by: params.order_by,
        keyword: params.keyword,
      };

      return {
        data: data,
        metadata: metadata ? metadata : null,
        _meta: {
          code: HttpStatus.OK,
          status: SUCCESS_STATUS,
          message: 'success get barang',
        },
      };
    } catch (error) {
      throw error;
    }
  }

  @Get(':id/subfolders')
  async getSubfolders(@Param('id') id: string) {
    return this.folderService.getSubfolders(+id);
  }

  // @Post(':id/files')
  // addFileToFolder(@Param('id') folderId: number, @Body() fileData: { name: string, type: string }) {
  //   return this.folderService.addFileToFolder(+folderId, fileData);
  // }
}
