import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { env } from "@webbriks-technical-assessment/env/server";

import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: env.CORS_ORIGIN,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  });

  // Swagger OpenAPI Specification configuration
  const config = new DocumentBuilder()
    .setTitle("Mini Kanban Board API")
    .setDescription(
      "REST API documentation for the Webbriks Mini Kanban Board technical assessment application. Includes authentication, board management, column workflows, and task reordering.",
    )
    .setVersion("1.0.0")
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        name: "JWT",
        description: "Enter your JWT token to authorize requests",
        in: "header",
      },
      "JWT-auth",
    )
    .addTag("Authentication", "User registration, authentication, and profile endpoints")
    .addTag("Health & System", "Server health and status checks")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customSiteTitle: "Mini Kanban Board API Docs",
  });

  await app.listen(3000);
  console.log("Server is running on http://localhost:3000");
  console.log("Swagger API documentation available at http://localhost:3000/api");
}

bootstrap();
