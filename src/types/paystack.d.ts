declare module '@paystack/inline-js' {
  interface PaystackPopupOptions {
    key: string;
    email: string;
    amount: number;
    currency?: string;
    ref?: string;
    metadata?: any;
    onSuccess: (response: any) => void;
    onCancel: () => void;
    onError?: (error: any) => void;
  }

  class PaystackPop {
    constructor();
    newTransaction(options: PaystackPopupOptions): void;
  }

  export default PaystackPop;
}
