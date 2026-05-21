import { NextRequest, NextResponse } from 'next/server';
import { isAuthPayload, requireAuth } from '@/lib/auth/requireAuth';
import { prismaErrorResponse } from '@/lib/apiErrors';
import { getUserStats } from '@/services/statsService';

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if (!isAuthPayload(authResult)) {
      return authResult;
    }

    const stats = await getUserStats(authResult.userId);
    return NextResponse.json(stats);
  } catch (error) {
    return prismaErrorResponse(error);
  }
}
