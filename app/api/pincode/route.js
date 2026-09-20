import { NextResponse } from 'next/server';
import { lookupPincode, STATE_CITIES } from '@/lib/locations';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const pincode = searchParams.get('pincode');
    const state = searchParams.get('state');

    // If state is passed, return popular cities for this state
    if (state && !pincode) {
      const cities = STATE_CITIES[state] || [];
      return NextResponse.json({ state, cities });
    }

    if (!pincode) {
      return NextResponse.json({ error: 'Pincode is required' }, { status: 400 });
    }

    const result = await lookupPincode(pincode);
    if (!result) {
      return NextResponse.json({ error: 'Invalid 6-digit pincode' }, { status: 400 });
    }

    // Include suggested cities for the detected or provided state
    const detectedState = result.state;
    const suggestedCities = detectedState && STATE_CITIES[detectedState] ? STATE_CITIES[detectedState] : [];

    return NextResponse.json({
      ...result,
      suggestedCities,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to lookup pincode' }, { status: 500 });
  }
}
