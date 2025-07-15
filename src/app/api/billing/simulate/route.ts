import { NextRequest, NextResponse } from 'next/server';

// POST - Simulate AI token usage for testing
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userEmail, action, tokensUsed, context } = body;

    if (!userEmail || !action || !tokensUsed) {
      return NextResponse.json({ error: 'Missing required fields: userEmail, action, tokensUsed' }, { status: 400 });
    }

    // Mock user data for testing
    const mockUsers: { [key: string]: any } = {
      'ahmad.fauzi@student.ac.id': {
        id: 'user1-test-basic',
        name: 'Ahmad Fauzi',
        email: 'ahmad.fauzi@student.ac.id',
        tier: 'basic',
        token_balance: 750,
        monthly_token_limit: 1000,
      },
      'siti.nurhaliza@student.ac.id': {
        id: 'user2-test-pro',
        name: 'Siti Nurhaliza',
        email: 'siti.nurhaliza@student.ac.id',
        tier: 'pro',
        token_balance: 8500,
        monthly_token_limit: 10000,
      },
      'budi.santoso@student.ac.id': {
        id: 'user3-test-enterprise',
        name: 'Budi Santoso',
        email: 'budi.santoso@student.ac.id',
        tier: 'enterprise',
        token_balance: 95000,
        monthly_token_limit: 100000,
      },
    };

    const mockUser = mockUsers[userEmail];
    if (!mockUser) {
      return NextResponse.json({ error: 'Mock user not found' }, { status: 404 });
    }

    // Check balance
    if (mockUser.token_balance < tokensUsed) {
      return NextResponse.json(
        {
          error: 'Insufficient token balance',
          required: tokensUsed,
          available: mockUser.token_balance,
        },
        { status: 400 },
      );
    }

    // Calculate cost
    const tierPricing: { [key: string]: number } = {
      basic: 0.000002,
      pro: 0.0000015,
      enterprise: 0.000001,
    };

    const costPerToken = tierPricing[mockUser.tier];
    const totalCost = tokensUsed * costPerToken;

    // Simulate balance update
    mockUser.token_balance -= tokensUsed;

    return NextResponse.json({
      success: true,
      message: 'Token usage simulated successfully',
      simulation_data: {
        user: mockUser,
        usage_record: {
          id: `usage-${Date.now()}`,
          userId: mockUser.id,
          action,
          tokens_used: tokensUsed,
          cost_per_token: costPerToken,
          total_cost: totalCost,
          context: context || null,
          timestamp: new Date().toISOString(),
        },
        remaining_balance: mockUser.token_balance,
        cost_breakdown: {
          tokens_used: tokensUsed,
          cost_per_token: costPerToken,
          total_cost: totalCost,
          tier: mockUser.tier,
        },
      },
    });
  } catch (error) {
    console.error('Error in billing simulation POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
