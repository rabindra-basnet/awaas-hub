"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Info, InfoIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

interface Props {
  propertyId: string;
}

interface EsewaConfig {
  amount: string;
  tax_amount: string;
  total_amount: string;
  transaction_uuid: string;
  product_code: string;
  product_service_charge: string;
  product_delivery_charge: string;
  success_url: string;
  failure_url: string;
  signed_field_names: string;
  signature: string;
}

export default function EsewaPaymentButton({ propertyId }: Props) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async () => {
    try {
      setIsLoading(true);

      const response = await fetch("/api/payment/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ propertyId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Payment initiation failed");
      }

      const config: EsewaConfig = data.esewaConfig;

      const form = document.createElement("form");
      form.method = "POST";
      form.action = "https://rc-epay.esewa.com.np/api/epay/main/v2/form";

      Object.entries(config).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = String(value);
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } catch (error) {
      console.error(error);
      toast.error("Unable to start payment");
      setIsLoading(false);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={handlePayment}
            variant="secondary"
            disabled={isLoading}
            className="w-full h-12 rounded-xl font-bold text-sm border-2 flex items-center gap-2"
          >
            {isLoading ? "Processing..." : "Unlock Contact Details"}
            <InfoIcon size={16} />
          </Button>
        </TooltipTrigger>

        <TooltipContent>
          <p>Pay to unlock seller contact details</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
