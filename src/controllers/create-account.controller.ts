import { ConflictException } from "@nestjs/common";
import { Body, Controller, HttpCode, Post } from "@nestjs/common";
import { hash } from "bcryptjs";
import { PrismaService } from "src/prisma/prisma.service";
import { z } from 'zod'

const createAccountBodySchema = z.object({
    name: z.string().min(3).max(50),
    email: z.string().email(),
    password: z.string().min(8).max(255),
})

type CreateAccountBodySchema = z.infer<typeof createAccountBodySchema>

@Controller('/accounts')
export  class CreateAccountController {
    constructor(private prisma: PrismaService){}
    @Post()
    @HttpCode(201)
    async handle(@Body() body: CreateAccountBodySchema) {
       const { name, email, password } = createAccountBodySchema.parse(body);

       const userWithSameEmail = await this.prisma.user.findUnique({
        where: { email }
       })

       if(userWithSameEmail){
        throw new ConflictException('User with the same email already exists.')
       }

       const hashedPassword = await hash(password, 8);

        await this.prisma.user.create({
            data: {
                name,
                email,
                password,
            }
        })
    }

}