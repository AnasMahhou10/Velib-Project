import { NextRequest, NextResponse } from 'next/server';
import { prismaErrorResponse, validationErrorResponse } from '../../../src/lib/apiErrors';
import { createRideGroupSchema } from '../../../src/lib/schemas/rideGroup';
import { createRideGroup, listRideGroups } from '../../../src/services/rideGroupService';

export async function GET() {
  try {
    const rideGroups = await listRideGroups();
    return NextResponse.json(rideGroups);
  } catch (error) {
    return prismaErrorResponse(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createRideGroupSchema.safeParse(body);

    if (!parsed.success) {
      return validationErrorResponse(parsed.error);
    }

    const rideGroup = await createRideGroup(parsed.data);
    return NextResponse.json(rideGroup, { status: 201 });
  } catch (error) {
    return prismaErrorResponse(error);
  }
}
