// src/app/api/billing/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { BillingService } from '@/lib/services/billing-service';

// GET - Get all users billing analytics (Admin only)
export async function GET(request: NextRequest) {
  try {
    // TODO: Add admin authentication check here
    // const { user } = await getServerSession(request);
    // if (!user || user.role !== 'ADMIN') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const usersBilling = await BillingService.getAllUsersBilling();

    return NextResponse.json({
      success: true,
      data: usersBilling,
    });
  } catch (error) {
    console.error('Error in billing users GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
