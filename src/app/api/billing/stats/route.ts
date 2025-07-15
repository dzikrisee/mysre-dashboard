import { NextRequest, NextResponse } from 'next/server';
import { BillingService } from '@/lib/services/billing-service';

// GET - Get billing statistics (Admin only)
export async function GET(request: NextRequest) {
  try {
    const billingStats = await BillingService.getBillingStats();

    return NextResponse.json({
      success: true,
      data: billingStats,
    });
  } catch (error) {
    console.error('Error in billing stats GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
