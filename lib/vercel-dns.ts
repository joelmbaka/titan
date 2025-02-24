import { env } from "@/env";

console.log("Initializing Vercel DNS client...");
console.log("Using Vercel API Token:", env.VERCEL_API_TOKEN);

interface DnsRecordPayload {
  name: string;
  type: "A" | "CNAME" | "MX" | "TXT" | "NS" | "SRV";
  value: string;
  ttl?: number;
}

export async function createDnsRecordForDomain(
  domain: string,
  dnsRecordPayload: DnsRecordPayload
): Promise<{ success: boolean; message: string }> {
  try {
    console.log("Creating DNS record for domain:", domain);
    const token = env.VERCEL_API_TOKEN;
    const baseUrl = "https://api.vercel.com";
    const teamId = env.VERCEL_TEAM_ID;
    const domainUrl = `${baseUrl}/v5/domains/${domain}?teamId=${teamId}`;

    // Check domain existence
    const domainCheck = await fetch(domainUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!domainCheck.ok) {
      if (domainCheck.status === 403) {
        throw new Error(
          "Not authorized: Ensure your Vercel API token has the correct scope and permissions."
        );
      }
      const error = await domainCheck.json();
      throw new Error(error.error?.message || "Failed to check domain");
    }

    // Create DNS record
    const dnsRecordUrl = `${baseUrl}/v2/domains/${domain}/records?teamId=${teamId}`;
    const dnsResponse = await fetch(dnsRecordUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dnsRecordPayload),
    });

    if (!dnsResponse.ok) {
      const error = await dnsResponse.json();
      throw new Error(error.error?.message || "Failed to create DNS record");
    }

    return { success: true, message: "DNS record created successfully" };
  } catch (error) {
    console.error("Error in createDnsRecordForDomain:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
} 