import crypto from "crypto-js";
export function generateEsewaSignature(
  message: string,
  secret: string,
): string {
  const hash = crypto.HmacSHA256(message, secret);
  const hashInBase64 = crypto.enc.Base64.stringify(hash);
  return hashInBase64;
}
