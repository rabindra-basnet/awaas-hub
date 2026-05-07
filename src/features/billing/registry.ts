import { esewaProvider } from "./providers/esewa.provider";
import { khaltiProvider } from "./providers/khalti.provider";
import type { PaymentProvider } from "./providers/types";

const providers: Record<string, PaymentProvider> = {
  esewa: esewaProvider,
  khalti: khaltiProvider,
};

export function getPaymentProvider(name: string): PaymentProvider {
  const provider = providers[name];
  if (!provider) throw new Error(`Unknown payment provider: ${name}`);
  return provider;
}
