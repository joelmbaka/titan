import { env } from "@/env";

console.log("Initializing Vercel DNS client...");
console.log("Using Vercel API Token:", env.VERCEL_API_TOKEN ? "Present" : "Missing");
console.log("Using Vercel Team ID:", env.VERCEL_TEAM_ID || "Missing");

interface DnsRecordPayload {
  name: string;
  type: "A" | "CNAME" | "MX" | "TXT" | "NS" | "SRV";
  value: string;
  ttl?: number;
}

/**
 * Creates a DNS record for a domain using the Vercel API
 * @param subdomain The subdomain to create (without the base domain)
 * @returns Object with success status and message
 */
export async function createDnsRecordForDomain(
  subdomain: string
): Promise<{ success: boolean; message: string }> {
  try {
    // Check for required environment variables
    const token = env.VERCEL_API_TOKEN;
    const teamId = env.VERCEL_TEAM_ID;

    if (!token) {
      console.error("Vercel API token is missing");
      return { success: false, message: "Vercel API token is missing" };
    }

    if (!teamId) {
      console.error("Vercel team ID is missing");
      return { success: false, message: "Vercel team ID is missing" };
    }

    console.log(`Creating DNS record for subdomain: ${subdomain}`);

    // Create the DNS record
    const dnsRecordUrl = `https://api.vercel.com/v2/domains/joelmbaka.site/records?teamId=${teamId}`;
    const dnsResponse = await fetch(dnsRecordUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: subdomain,
        type: "CNAME",
        value: "cname.vercel-dns.com",
        ttl: 60,
      }),
    });

    if (!dnsResponse.ok) {
      const error = await dnsResponse.json();
      console.error("Failed to create DNS record:", error);
      
      // Handle specific error cases
      if (error.error?.code === "forbidden") {
        return { 
          success: false, 
          message: "Permission denied. Check your Vercel API token and team ID." 
        };
      }
      
      if (error.error?.code === "not_found") {
        return { 
          success: false, 
          message: "Domain not found. Make sure joelmbaka.site is added to your Vercel account." 
        };
      }
      
      return { 
        success: false, 
        message: error.error?.message || "Failed to create DNS record" 
      };
    }

    console.log(`DNS record created successfully for ${subdomain}.joelmbaka.site`);
    return {
      success: true,
      message: `Subdomain ${subdomain}.joelmbaka.site created successfully`,
    };
  } catch (error) {
    console.error("Error creating DNS record:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
} 