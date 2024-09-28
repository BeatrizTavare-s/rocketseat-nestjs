import { AppModule } from "@/app.module";
import { PrismaService } from "@/prisma/prisma.service";
import { INestApplication } from "@nestjs/common";
import { Test } from '@nestjs/testing';
import { hash } from "bcryptjs";
import request from 'supertest'

describe('Authenticate (E2E)', () => {
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

    test('[POST] /sessions', async () => {
        const passwordHash = await hash('123456', 8)
        // Arrange
        const name = 'John Doe'
        const email = 'john.doe@example.com'
        const password = '123456'

        await prisma.user.create({
            data: {
                name,
                email,
                password: passwordHash,
            },
        })

        const response = await request(app.getHttpServer()).post('/sessions').send({
            name,
            email,
            password,
        })

        expect(response.statusCode).toBe(200);

        const userOnDatabase = await prisma.user.findUnique({
            where: { email },
        })

        expect(userOnDatabase).toBeTruthy();
        expect(response.body).toEqual({
            access_token: expect.any(String),
        })
    })
})