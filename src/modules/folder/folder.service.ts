import { Injectable } from '@nestjs/common';
import { Folder } from '@prisma/client';
import { QueryParams } from 'src/dto';

import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FolderService {
  constructor(private readonly prisma: PrismaService) {}

  async get(params: QueryParams) {
    const skip = params.page ? (params.page - 1) * params.per_page : 0;

    const [total_data, data] = await this.prisma.$transaction([
      this.prisma.folder.count({}),
      this.prisma.folder.findMany({
        skip: params.is_all_data ? undefined : skip,
        take: params.is_all_data ? undefined : params.per_page,
        orderBy: {
          [params.order_by]: params.sort,
        },
      }),
    ]);

    return { total_data, data };
  }

  async getSubfolders(parentId: number): Promise<Folder[]> {
    return this.prisma.folder.findMany({
      where: { parentId },
      include: {
        children: true,
        files: true,
        parent: {
          select: {
            files: true,
          },
        },
      },
    });
  }

  // async addFileToFolder(
  //   folderId: number,
  //   fileData: { name: string; type: string },
  // ) {
  //   return this.prisma.file.create({
  //     data: {
  //       name: fileData.name,
  //       type: fileData.type,
  //       folder: { connect: { id: folderId } },
  //       // folderId : folderId
  //     },
  //   });
  // }
}
