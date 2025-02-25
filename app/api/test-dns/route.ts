import { NextRequest, NextResponse } from 'next/server';
import { checkExistingDnsRecord } from '@/lib/subdomain-setup';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const subdomain = searchParams.get('subdomain') || 'carlist';
    
    // Check if the DNS record exists
    const exists = await checkExistingDnsRecord(subdomain);
    
    return NextResponse.json({
      success: true,
      subdomain: `${subdomain}.joelmbaka.site`,
      dnsRecordExists: exists,
      message: exists 
        ? `DNS record for ${subdomain}.joelmbaka.site exists` 
        : `No DNS record found for ${subdomain}.joelmbaka.site`
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