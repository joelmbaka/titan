import { NextRequest, NextResponse } from 'next/server';
// The checkExistingDnsRecord function is not exported from the module
// Let's create a simplified version for testing

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const subdomain = searchParams.get('subdomain') || 'carlist';
    
    // For testing purposes, we'll just return a mock response
    // since we can't access the actual function
    return NextResponse.json({
      success: true,
      subdomain: `${subdomain}.joelmbaka.site`,
      dnsRecordExists: true, // Mock response
      message: `DNS check for ${subdomain}.joelmbaka.site (mock response)`,
      note: "This is a mock response as the actual DNS checking function is not exported"
    });
  } catch (error) {
    console.error('Error checking DNS record:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to check DNS record',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 