export interface BankTransferDetails {
  title: string
  instructions: string
  accounts: { account_name: string; account_number: string; bank_name: string; sort_code: string; iban: string; bic: string }[]
}
export function mapBankTransfer(raw: unknown): BankTransferDetails | null {
  if (!raw || typeof raw !== 'object') return null
  const data = raw as Record<string, unknown>
  const text = (v: unknown) => typeof v === 'string' ? v.trim() : ''
  return {
    title: text(data.title), instructions: text(data.instructions),
    accounts: (Array.isArray(data.accounts) ? data.accounts : []).slice(0,30).flatMap(raw => {
      if (!raw || typeof raw !== 'object') return []
      const a = raw as Record<string,unknown>
      const account = {account_name:text(a.account_name), account_number:text(a.account_number), bank_name:text(a.bank_name), sort_code:text(a.sort_code), iban:text(a.iban), bic:text(a.bic)}
      return account.account_number || account.iban ? [account] : []
    }),
  }
}
