import { useMutation } from "@tanstack/react-query";
import { easyPostService } from "@/services/easypost";

export const useEasyPostBuyLabel = () => {
  return useMutation({
    mutationFn: ({
      shipmentId,
      rateId,
    }: {
      shipmentId: string;
      rateId: string;
    }) => easyPostService.buyLabel(shipmentId, rateId),
  });
};
