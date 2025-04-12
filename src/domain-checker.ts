/**
 * Type definition for the domain check result
 */
export type DomainCheckResult = {
  domain: string;
  available: boolean;
  price?: {
    amount: number;
    period: string;
  };
  error?: string;
};

/**
 * Ensures a domain has a TLD (Top Level Domain)
 * @param domain - The domain name to check
 * @returns The domain with TLD
 */
function ensureTLD(domain: string): string {
  if (!domain.includes(".")) {
    return `${domain}.com`;
  }
  return domain;
}

/**
 * Checks if a domain is available and gets its price if available
 * @param domain - The domain name to check (with or without TLD)
 * @param apiToken - Your Vercel API token
 * @returns Promise<DomainCheckResult>
 */
export async function checkDomainAvailability(
  domain: string,
  apiToken: string
): Promise<DomainCheckResult> {
  // Ensure domain has a TLD
  const domainWithTLD = ensureTLD(domain);

  try {
    if (!apiToken) {
      throw new Error("API token is required");
    }

    // First check availability
    const availabilityRes = await fetch(
      `https://api.vercel.com/v4/domains/status?name=${domainWithTLD}`,
      {
        headers: {
          Authorization: `Bearer ${apiToken}`,
        },
      }
    );

    if (!availabilityRes.ok) {
      throw new Error(
        `Failed to check domain availability: ${availabilityRes.status} ${availabilityRes.statusText}`
      );
    }

    const availabilityData = await availabilityRes.json();

    // If domain is available, check price
    if (availabilityData.available) {
      const priceRes = await fetch(
        `https://api.vercel.com/v4/domains/price?name=${domainWithTLD}&type=new`,
        {
          headers: {
            Authorization: `Bearer ${apiToken}`,
          },
        }
      );

      if (priceRes.ok) {
        const priceData = await priceRes.json();
        return {
          domain: domainWithTLD,
          available: true,
          price: {
            amount: priceData.price,
            period: priceData.period,
          },
        };
      }
    }

    return {
      domain: domainWithTLD,
      available: availabilityData.available,
    };
  } catch (error) {
    return {
      domain: domainWithTLD,
      available: false,
      error: error instanceof Error ? error.message : "Failed to check domain",
    };
  }
}
