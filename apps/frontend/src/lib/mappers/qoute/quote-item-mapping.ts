import { QuoteItemForm } from "@/types/quote";

export interface CreateQuotesItemsDto {
  fkQuoteID: number;
  fkProductID: number;
  fkAddressID: number;
  fkTrimID: number;
  fkYarnID: number;
  artworkURL: string;
  itemName: string;
  itemDescription: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
}

export function mapQuoteItemFormToDto(
  item: QuoteItemForm,
  quoteId: number
): CreateQuotesItemsDto {
  return {
    fkQuoteID: quoteId,
    fkProductID: Number(item.productId),
    fkAddressID: Number(item.addresses),
    fkTrimID: Number(item.trims),
    fkYarnID: Number(item.yarn),
    artworkURL:
      (typeof item.logo === "string" ? item.logo : item.logo?.url) || "",
    itemName: item.itemNumber,
    itemDescription: item.description,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    taxRate: 0, // or your value
  };
}
