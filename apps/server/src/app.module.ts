import { Module } from "@nestjs/common";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";

import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { BoardsModule } from "./boards/boards.module";
import { ColumnsModule } from "./columns/columns.module";
import { TasksModule } from "./tasks/tasks.module";

@Module({
  imports: [AuthModule, UsersModule, BoardsModule, ColumnsModule, TasksModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
