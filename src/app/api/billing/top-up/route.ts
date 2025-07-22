// src/app/api/billing/top-up/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, amount, method } = body;

    // Validate input
    if (!userId || !amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 });
    }

    // TODO: Implement actual top-up logic with payment gateway
    // For now, return success response

    return NextResponse.json({
      success: true,
      message: 'Top-up request processed',
      data: {
        userId,
        amount,
        method,
        transactionId: `topup_${Date.now()}`,
        status: 'pending',
      },
    });
  } catch (error) {
    console.error('Top-up error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Top-up endpoint available',
    methods: ['POST'],
  });
}
