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
  console.log("Creating DNS record for domain:", domain);
  console.log("DNS Record Payload:", dnsRecordPayload);

  const token = env.VERCEL_API_TOKEN;
  const baseUrl = "https://api.vercel.com";
  
  const domainUrl = `${baseUrl}/v5/domains/${domain}`;
  const dnsRecordUrl = `${baseUrl}/v2/domains/${domain}/records`;

  try {
    console.log("Checking domain existence at:", domainUrl);
    const domainCheck = await fetch(domainUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!domainCheck.ok) {
      console.log("Domain check response status:", domainCheck.status);
      if (domainCheck.status === 404) {
        console.log("Domain doesn't exist, creating new domain...");
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
          console.error("Error creating domain:", error);
          return {
            success: false,
            message: `Error creating domain: ${error.error?.message || "Unknown error"}`,
          };
        }
      } else {
        const error = await domainCheck.json();
        console.error("Error checking domain:", error);
        return {
          success: false,
          message: `Error checking domain: ${error.error?.message || "Unknown error"}`,
        };
      }
    }

    console.log("Creating DNS record at:", dnsRecordUrl);
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
      console.error("Failed to create DNS record:", error);
      return {
        success: false,
        message: `Failed to create DNS record: ${error.error?.message || "Unknown error"}`,
      };
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