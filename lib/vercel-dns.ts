import { env } from "@/env";

console.log("Initializing Vercel DNS client...");
console.log("Using Vercel API Token:", env.VERCEL_API_TOKEN);
console.log("Using Vercel Team ID:", env.VERCEL_TEAM_ID);

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
    console.log("Starting DNS record creation process...");
    console.log("Creating DNS record for domain:", domain);
    console.log("DNS Record Payload:", dnsRecordPayload);

    const token = env.VERCEL_API_TOKEN;
    const teamId = env.VERCEL_TEAM_ID;
    const baseUrl = "https://api.vercel.com";
    const domainUrl = `${baseUrl}/v5/domains/${domain}?teamId=${teamId}`;

    console.log("Checking domain existence at:", domainUrl);
    const domainCheck = await fetch(domainUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Domain check response status:", domainCheck.status);
    if (!domainCheck.ok) {
      if (domainCheck.status === 403) {
        console.error("403 Forbidden: Token may not have the correct scope or permissions");
        throw new Error(
          "Not authorized: Ensure your Vercel API token has the correct scope and permissions."
        );
      }
      const error = await domainCheck.json();
      console.error("Error checking domain:", error);
      throw new Error(error.error?.message || "Failed to check domain");
    }

    const dnsRecordUrl = `${baseUrl}/v2/domains/${domain}/records?teamId=${teamId}`;
    console.log("Creating DNS record at:", dnsRecordUrl);
    const dnsResponse = await fetch(dnsRecordUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dnsRecordPayload),
    });

    console.log("DNS record creation response status:", dnsResponse.status);
    if (!dnsResponse.ok) {
      const error = await dnsResponse.json();
      console.error("Failed to create DNS record:", error);
      throw new Error(error.error?.message || "Failed to create DNS record");
    }

    console.log("DNS record created successfully");
    return { success: true, message: "DNS record created successfully" };
  } catch (error) {
    console.error("Error in createDnsRecordForDomain:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
} 