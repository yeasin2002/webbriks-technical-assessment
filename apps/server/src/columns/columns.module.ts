import { Module } from "@nestjs/common";
import { BoardsModule } from "../boards/boards.module";
import { ColumnsService } from "./columns.service";
import { ColumnsController } from "./columns.controller";

@Module({
  imports: [BoardsModule],
  controllers: [ColumnsController],
  providers: [ColumnsService],
  exports: [ColumnsService],
})
export class ColumnsModule {}
