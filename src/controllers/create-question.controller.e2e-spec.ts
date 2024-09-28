import { AppModule } from "@/app.module";
import { PrismaService } from "@/prisma/prisma.service";
import { INestApplication } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test } from '@nestjs/testing';
import { hash } from "bcryptjs";
import request from 'supertest'

describe('Create questions (E2E)', () => {
    let app: INestApplication;
    let prisma: PrismaService
    let jwt: JwtService

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
          imports: [AppModule],
        })
          .compile();
    
        app = moduleRef.createNestApplication();

        prisma = moduleRef.get(PrismaService)
        jwt = moduleRef.get(JwtService)

        await app.init();
      });

    test('[POST] /questions', async () => {
        const passwordHash = await hash('123456', 8)
        // Arrange
        const name = 'John Doe'
        const email = 'john.doe@example.com'
        const password = '123456'

       const user = await prisma.user.create({
            data: {
                name,
                email,
                password: passwordHash,
            },
        })

        const accessToken = jwt.sign({sub: user.id})

        // Arrange
        const title = 'new Question'
        const content = 'new content'

        const response = await request(app.getHttpServer())
        .post('/questions')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
            title,
            content,
        })

        expect(response.statusCode).toBe(200);

        const questionsOnDatabase = await prisma.question.findFirst({
          where:{
            title: 'new Question',
          }
        })

        expect(questionsOnDatabase).toBeTruthy();
    })
})