import PaystackPop from '@paystack/inline-js';

export interface PaystackTransaction {
  email: string;
  amount: number; // Amount in kobo (multiply by 100)
  currency?: string;
  reference?: string;
  callback_url?: string;
  metadata?: {
    event_id: string;
    event_title: string;
    attendee_name?: string;
    custom_fields?: any[];
  };
}

export interface PaystackResponse {
  status: boolean;
  message: string;
  data?: {
    access_code: string;
    authorization_url: string;
    reference: string;
  };
}

export class PaystackService {
  // Get public key from environment variables - set in your .env file
  private static readonly PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_b74e3c9ac6c374dc1d3be81ae2bc3ab50ad85c3e';
  private static readonly API_URL = 'https://api.paystack.co';

  /**
   * Initialize a transaction (this would normally be done on your backend)
   * For demo purposes, we're using a mock implementation
   */
  static async initializeTransaction(transactionData: PaystackTransaction): Promise<PaystackResponse> {
    try {
      // In a real application, this would be an API call to your backend
      // which would then call Paystack's API with your secret key
      
      // For demo purposes, we'll simulate a successful initialization
      const mockResponse: PaystackResponse = {
        status: true,
        message: 'Authorization URL created',
        data: {
          access_code: 'demo_access_code_' + Date.now(),
          authorization_url: 'https://checkout.paystack.com/demo',
          reference: transactionData.reference || 'REF_' + Date.now()
        }
      };

      console.log('🚀 Demo: Transaction initialized', mockResponse);
      return mockResponse;
    } catch (error) {
      console.error('❌ Transaction initialization failed:', error);
      return {
        status: false,
        message: 'Failed to initialize transaction'
      };
    }
  }

  /**
   * Complete payment using Paystack Popup
   */
  static async processPayment(
    transactionData: PaystackTransaction,
    onSuccess: (response: any) => void,
    onClose: () => void
  ): Promise<void> {
    try {
      // Initialize transaction first
      const initResponse = await this.initializeTransaction(transactionData);
      
      if (!initResponse.status || !initResponse.data) {
        throw new Error(initResponse.message);
      }

      // Create Paystack popup instance
      const popup = new PaystackPop();
      
      // Configure payment
      popup.newTransaction({        key: this.PUBLIC_KEY,
        email: transactionData.email,
        amount: transactionData.amount,
        currency: transactionData.currency || 'GHS', // Changed default to Cedis
        ref: initResponse.data.reference,
        metadata: transactionData.metadata,
        onSuccess: (transaction: any) => {
          console.log('🎉 Payment successful!', transaction);
          onSuccess(transaction);
        },
        onCancel: () => {
          console.log('❌ Payment cancelled');
          onClose();
        }
      });

    } catch (error) {
      console.error('❌ Payment processing failed:', error);
      alert('Payment initialization failed. Please try again.');
      onClose();
    }
  }

  /**
   * Verify transaction (would normally be done on backend)
   * For demo purposes, we'll simulate verification
   */
  static async verifyTransaction(reference: string): Promise<{
    status: boolean;
    data?: {
      status: string;
      amount: number;
      currency: string;
      customer: any;
      metadata: any;
    };
    message: string;
  }> {
    try {
      // In a real application, this would be an API call to your backend
      // which would verify the transaction with Paystack
      
      console.log('🔍 Demo: Verifying transaction', reference);
      
      // Simulate verification delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock successful verification
      return {
        status: true,
        message: 'Verification successful',
        data: {
          status: 'success',          amount: 10000, // Amount in pesewas (100 pesewas = 1 cedi)
          currency: 'GHS',
          customer: {
            email: 'customer@example.com'
          },
          metadata: {
            event_id: 'demo_event_id'
          }
        }
      };
    } catch (error) {
      console.error('❌ Transaction verification failed:', error);
      return {
        status: false,
        message: 'Verification failed'
      };
    }
  }
  /**
   * Format amount to pesewas (multiply by 100 for Cedis)
   */
  static formatAmountToPesewas(amount: number): number {
    return Math.round(amount * 100);
  }

  /**
   * Format amount from pesewas to cedis (divide by 100)
   */
  static formatAmountFromPesewas(amount: number): number {
    return amount / 100;
  }

  /**
   * Generate unique transaction reference
   */
  static generateReference(prefix: string = 'HS'): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `${prefix}_${timestamp}_${random}`;
  }
}
