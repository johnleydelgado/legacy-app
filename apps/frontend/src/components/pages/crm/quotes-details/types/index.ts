export interface TableQuotesItems {
  quotesItemsID: number;
  quotesID: number;
  productID: number;
  categoryID: number;
  categoryName: string;
  // addressID: number;
  // address1: string;
  // city: string;
  // state: string;
  // zip: string;
  // country: string;
  trimsID: number;
  trimsName: string;
  packagingID: number;
  packagingName: string;
  yarnID: number;
  yarnName: string;
  artworkURL: string | File;
  item_name: string;
  item_description: string;
  quantity: number;
  unit_price: number;
  total: number;
  actionEdit: boolean;
  actionDelete: boolean;
}
