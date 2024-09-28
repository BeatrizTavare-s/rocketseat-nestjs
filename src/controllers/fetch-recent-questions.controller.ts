import { Body, Controller, Get, Post, Query, Req, UseGuards } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { JwtAuthGuard } from "@/auth/jwt-auth.guard";
import { PrismaService } from "@/prisma/prisma.service";
import { CurrentUser } from "@/auth/current-user-decorator";
import { UserPayload } from "@/auth/jwt.strategy";
import { z } from "zod";
import { ZodValidationPipe } from "@/pipes/zod-validation-pipe";

const pageQueryParamsShema = z.string().optional().default('1').transform(Number).pipe(z.number().min(1))
const queryValidationPipe = new ZodValidationPipe(
    pageQueryParamsShema
)
type PageQueryParamsSchema = z.infer<typeof pageQueryParamsShema>

@Controller('/questions')
@UseGuards(JwtAuthGuard)
export class FetchRecentQuestionsController {
    constructor(
        private prisma: PrismaService,
    ) { }
    @Get()
    async handle(
        @Query('page', queryValidationPipe) page: PageQueryParamsSchema
    ) {
        const perPage = 1
        const questions = await this.prisma.question.findMany(
            {
                take: perPage,
                skip: (page - 1) * perPage,
                orderBy: {
                    createdAt: 'desc',
                }
            })

            return { questions }
    }
}