import { AppModule } from "@/app.module";
import { PrismaService } from "@/prisma/prisma.service";
import { INestApplication } from "@nestjs/common";
import { Test } from '@nestjs/testing';
import request from 'supertest'

describe('Create account (E2E)', () => {
    let app: INestApplication;
    let prisma: PrismaService

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
          imports: [AppModule],
        })
          .compile();
    
        app = moduleRef.createNestApplication();

        prisma = moduleRef.get(PrismaService)

        await app.init();
      });

    test('[POST] /account', async () => {
        // Arrange
        const name = 'John Doe'
        const email = 'john.doe@example.com'
        const password = 'Password123#'

        const response = await request(app.getHttpServer()).post('/accounts').send({
            name,
            email,
            password,
        })

        expect(response.statusCode).toBe(200);

        const userOnDatabase = await prisma.user.findUnique({
            where: { email },
        })

        expect(userOnDatabase).toBeTruthy();
    })
})