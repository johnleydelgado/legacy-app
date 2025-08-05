interface ShippingInfoProps {
  requestedInHandDate?: string;
  carrierAccountType?: string;
  carrierAccountNumber?: string;
}

const ShippingInfo = ({
  requestedInHandDate = "15 Aug 2025",
  carrierAccountType = "UPS",
  carrierAccountNumber = "123-456-XYZ",
}: ShippingInfoProps) => {
  return (
    <div className="border rounded-lg p-4 text-sm space-y-3">
      <h4 className="font-semibold">Shipping Information</h4>
      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <p className="text-xs font-medium">Requested In-Hand Date</p>
          <p className="mt-1">{requestedInHandDate}</p>
        </div>
        <div>
          <p className="text-xs font-medium">Carrier Account Type</p>
          <p className="mt-1">{carrierAccountType}</p>
        </div>
        <div>
          <p className="text-xs font-medium">Carrier Account #</p>
          <p className="mt-1">{carrierAccountNumber}</p>
        </div>
      </div>
    </div>
  );
};

export default ShippingInfo;
