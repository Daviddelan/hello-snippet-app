import { SUPPORTED_CURRENCIES, CurrencyInfo } from './settingsService';

export interface ExchangeRate {
  code: string;
  rate: number;
  timestamp: number;
}

export class CurrencyService {
  private static cacheKey = 'currency_exchange_rates';
  private static cacheTimestamp = 'currency_cache_timestamp';
  private static cacheExpiry = 3600000; // 1 hour in milliseconds

  static async getLiveExchangeRates(
    baseCurrency: string = 'USD'
  ): Promise<{
    success: boolean;
    rates?: { [key: string]: number };
    error?: string;
  }> {
    try {
      // Check cache first
      const cached = this.getCachedRates();
      if (cached && cached.base === baseCurrency) {
        return { success: true, rates: cached.rates };
      }

      // Fetch from API
      const response = await fetch(
        `https://api.exchangerate-api.com/v4/latest/${baseCurrency}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch exchange rates');
      }

      const data = await response.json();

      // Cache the rates
      this.cacheRates(baseCurrency, data.rates);

      return {
        success: true,
        rates: data.rates,
      };
    } catch (error) {
      console.error('Error fetching exchange rates:', error);

      // Try to return cached rates even if expired
      const cached = this.getCachedRates();
      if (cached) {
        console.warn('Using expired cache due to API error');
        return { success: true, rates: cached.rates };
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private static getCachedRates(): { base: string; rates: { [key: string]: number } } | null {
    try {
      const timestamp = localStorage.getItem(this.cacheTimestamp);
      const cachedData = localStorage.getItem(this.cacheKey);

      if (!timestamp || !cachedData) {
        return null;
      }

      const age = Date.now() - parseInt(timestamp);
      if (age > this.cacheExpiry) {
        return null;
      }

      return JSON.parse(cachedData);
    } catch {
      return null;
    }
  }

  private static cacheRates(base: string, rates: { [key: string]: number }): void {
    try {
      localStorage.setItem(
        this.cacheKey,
        JSON.stringify({ base, rates })
      );
      localStorage.setItem(this.cacheTimestamp, Date.now().toString());
    } catch (error) {
      console.error('Failed to cache exchange rates:', error);
    }
  }

  static convertAmount(
    amount: number,
    fromCurrency: string,
    toCurrency: string,
    rates: { [key: string]: number }
  ): number {
    if (fromCurrency === toCurrency) return amount;

    // Convert to USD first (base currency)
    const amountInUSD = fromCurrency === 'USD'
      ? amount
      : amount / rates[fromCurrency];

    // Convert from USD to target currency
    const convertedAmount = toCurrency === 'USD'
      ? amountInUSD
      : amountInUSD * rates[toCurrency];

    return Math.round(convertedAmount * 100) / 100;
  }

  static formatCurrency(
    amount: number,
    currencyCode: string,
    showSymbol: boolean = true
  ): string {
    const currency = SUPPORTED_CURRENCIES.find(c => c.code === currencyCode);

    if (!currency) {
      return amount.toFixed(2);
    }

    const formatted = amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    return showSymbol ? `${currency.symbol}${formatted}` : formatted;
  }

  static getCurrencyInfo(code: string): CurrencyInfo | undefined {
    return SUPPORTED_CURRENCIES.find(c => c.code === code);
  }

  static getAllCurrencies(): CurrencyInfo[] {
    return SUPPORTED_CURRENCIES;
  }

  static clearCache(): void {
    try {
      localStorage.removeItem(this.cacheKey);
      localStorage.removeItem(this.cacheTimestamp);
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }
}
