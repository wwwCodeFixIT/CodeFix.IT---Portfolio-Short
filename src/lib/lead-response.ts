type LeadResponse = { error?: string; duplicate?: boolean; leadId?: string }

export async function readLeadResponse(response: Response): Promise<LeadResponse> {
  try {
    const result: unknown = await response.json()
    if (!result || typeof result !== 'object' || Array.isArray(result)) {
      throw new Error('Invalid lead response')
    }
    return result as LeadResponse
  } catch {
    // Browser engines use different error types for malformed response bodies.
    throw new Error('Nie udało się odczytać odpowiedzi serwera. Spróbuj ponownie za chwilę.')
  }
}
