import { Module } from '@nestjs/common';
import { BarangModule } from './folder/folder.module';

@Module({
  imports: [BarangModule],
})
export class ServiceModule {}
