import { env } from "@/env";

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
  const token = env.VERCEL_API_TOKEN;
  const baseUrl = "https://api.vercel.com";
  
  const domainUrl = `${baseUrl}/v5/domains/${domain}`;
  const dnsRecordUrl = `${baseUrl}/v2/domains/${domain}/records`;

  try {
    // Step 1: Check if the domain exists
    const domainCheck = await fetch(domainUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!domainCheck.ok) {
      if (domainCheck.status === 404) {
        // Domain doesn't exist, create it
        const createResponse = await fetch(`${baseUrl}/v5/domains`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: domain }),
        });

        if (!createResponse.ok) {
          const error = await createResponse.json();
          return {
            success: false,
            message: `Error creating domain: ${error.error?.message || "Unknown error"}`,
          };
        }
      } else {
        const error = await domainCheck.json();
        return {
          success: false,
          message: `Error checking domain: ${error.error?.message || "Unknown error"}`,
        };
      }
    }

    // Step 2: Create the DNS record
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
      return {
        success: false,
        message: `Failed to create DNS record: ${error.error?.message || "Unknown error"}`,
      };
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