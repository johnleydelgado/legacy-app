import type { Address, Contact, Customer } from "@/services/customers/types";

interface AddressesSectionProps {
  customer?: Customer;
  primaryContact?: Contact;
  billingAddress?: Address;
  shippingAddress?: Address;
}

const AddressesSection = ({
  customer,
  primaryContact,
  billingAddress,
  shippingAddress,
}: AddressesSectionProps) => {
  return (
    <div className="grid md:grid-cols-3 gap-10 text-sm">
      {/* Customer / Company */}
      <div>
        <h4 className="font-semibold mb-1">Customer / Company</h4>
        <p className="font-medium">{customer?.name}</p>
        {primaryContact && (
          <>
            <p>
              Attn: {primaryContact.first_name} {primaryContact.last_name}
            </p>
            <p>
              {primaryContact.email || "—"}
              {primaryContact.email &&
                (primaryContact.phone_number || primaryContact.mobile_number) &&
                " | "}
              {primaryContact.phone_number ||
                primaryContact.mobile_number ||
                "—"}
            </p>
          </>
        )}
      </div>

      {/* Bill To */}
      <div>
        <h4 className="font-semibold mb-1">Bill To</h4>
        {billingAddress ? (
          <>
            <p>{billingAddress.address1}</p>
            {billingAddress.address2 && <p>{billingAddress.address2}</p>}
            <p>
              {billingAddress.city} {billingAddress.state} {billingAddress.zip}
            </p>
          </>
        ) : (
          <p className="italic text-muted-foreground">No billing address</p>
        )}
      </div>

      {/* Ship To */}
      <div>
        <h4 className="font-semibold mb-1">Ship To</h4>
        {shippingAddress ? (
          <>
            <p>{shippingAddress.address1}</p>
            {shippingAddress.address2 && <p>{shippingAddress.address2}</p>}
            <p>
              {shippingAddress.city} {shippingAddress.state}{" "}
              {shippingAddress.zip}
            </p>
          </>
        ) : (
          <p className="italic text-muted-foreground">No shipping address</p>
        )}
      </div>
    </div>
  );
};

export default AddressesSection;
