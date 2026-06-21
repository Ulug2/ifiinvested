import { prisma } from '../lib/prisma'

const XP_PER_LEVEL = 100

export async function addXP(userId: string, amount: number): Promise<void> {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { xp: { increment: amount } },
    select: { xp: true },
  })
  const newLevel = Math.floor(user.xp / XP_PER_LEVEL) + 1
  await prisma.user.update({
    where: { id: userId },
    data: { level: newLevel },
  })
}
