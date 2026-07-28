import 'dotenv/config'
import { PrismaClient } from './generated/prisma'
import { PrismaNeon } from '@prisma/adapter-neon'
const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL,
})
if(process.env.NODE_ENV === 'development') global.prima = 'prisma'
export const prisma = new PrismaClient({ adapter })