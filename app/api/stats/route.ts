import { NextRequest, NextResponse } from 'next/server';
import { prismaErrorResponse, validationErrorResponse } from '../../../src/lib/apiErrors';
import { statsQuerySchema } from '../../../src/lib/schemas/rideGroup';
import { getUserStats } from '../../../src/services/statsService';

export async function GET(req: NextRequest) {
  try {
    const parsed = statsQuerySchema.safeParse({
      userId: req.nextUrl.searchParams.get('userId') ?? '1',
    });

    if (!parsed.success) {
      return validationErrorResponse(parsed.error);
    }

    const stats = await getUserStats(parsed.data.userId);
    return NextResponse.json(stats);
  } catch (error) {
    return prismaErrorResponse(error);
  }
}
