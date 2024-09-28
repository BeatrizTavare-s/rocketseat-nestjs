import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { JwtAuthGuard } from "@/auth/jwt-auth.guard";
import { PrismaService } from "@/prisma/prisma.service";
import { CurrentUser } from "@/auth/current-user-decorator";
import { UserPayload } from "@/auth/jwt.strategy";
import { z } from "zod";
import { ZodValidationPipe } from "@/pipes/zod-validation-pipe";


const createQuestioneBodySchema = z.object({
    title: z.string(),
    content: z.string()
})

const bodyValidationBody = new ZodValidationPipe(createQuestioneBodySchema)
type CreateQuestionBodySchema = z.infer<typeof createQuestioneBodySchema>

@Controller('/questions')
@UseGuards(JwtAuthGuard)
export class CreateQuestionController {
    constructor(
        private jwt: JwtService,
        private prisma: PrismaService,
    ) { }
    @Post()
    // @HttpCode(201)
    async handle(
        @CurrentUser() user: UserPayload,
        @Body(bodyValidationBody) body: CreateQuestionBodySchema
    ) {
        const { title, content } = body
        const { sub: userId } = user
        const slug = this.convertioStug(title)
        await this.prisma.question.create({
            data: {
                authorId: userId,
                title,
                content,
                slug
            }
        })
    }

    private convertioStug(title: string): string {
        return title
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u836f]/g, '')
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
    }

}