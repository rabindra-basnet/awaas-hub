export interface CheckoutParams {
  userId: string;
  propertyId: string;
  amount: number;
  credits: number;
  transactionUuid: string;
  successUrl: string;
  failureUrl: string;
}

export interface VerifyResult {
  success: boolean;
  transactionId: string;
  amount: number;
  status: string;
}

export interface PaymentProvider {
  name: string;
  createCheckout(params: CheckoutParams): Promise<{ formAction: string; fields: Record<string, string> }>;
  verifyPayment(query: Record<string, string>): Promise<VerifyResult>;
  generateSignature(message: string, secret: string): string;
}
