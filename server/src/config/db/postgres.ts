import { prisma } from "../../core/lib/prisma";

export async function connectPostgres() {
  await prisma.$connect();
}

export async function disconnectPostgres() {
  await prisma.$disconnect();
}