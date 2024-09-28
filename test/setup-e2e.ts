import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import { randomUUID } from 'crypto';
import 'dotenv'

const prisma = new PrismaClient();



function generateUniqueDatabaseUrl(schemaID: string){
    if (!process.env.DATABASE_URL){
        throw new Error('Missing DATABASE_URL environment variable.')
    }

    const url = new URL(process.env.DATABASE_URL)

    url.searchParams.set('schema', schemaID)

    return url.toString()
}

const schemaId = randomUUID();

beforeAll(() =>{
    const databseUrl = generateUniqueDatabaseUrl(schemaId)

    process.env.DATABASE_URL = databseUrl

    execSync('npm prisma migrate deploy')
})

afterAll(async () => {
    await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schemaId}" CASCADE`)
    await prisma.$disconnect()
})