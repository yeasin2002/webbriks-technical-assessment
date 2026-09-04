import { Module } from "@nestjs/common";
import { UsersModule } from "../users/users.module";
import { BoardsService } from "./boards.service";
import { BoardsController } from "./boards.controller";

@Module({
  imports: [UsersModule],
  controllers: [BoardsController],
  providers: [BoardsService],
  exports: [BoardsService],
})
export class BoardsModule {}
