/* -------------------------------------------------------------------------- */
/*  ContactCard.tsx  (generic)                                                */
/* -------------------------------------------------------------------------- */
import * as React from "react";
import {
  Mail,
  Phone,
  TabletSmartphone,
  MapPin,
  Building2,
  Globe,
  SquarePen,
  X,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Contact } from "@/services/contacts/types";
import { Address } from "@/services/addresses/types";

/* ────────────────  Generic Types  ──────────────── */
interface ContactInfo {
  first_name?: string;
  last_name?: string;
  position_title?: string;
  email?: string;
  phone_number?: string;
  mobile_number?: string;
}

interface AddressInfo {
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

interface ContactCardProps {
  /** The person's contact details (billing, shipping, etc.) */
  // contact: ContactInfo;
  contact: Contact;
  /** Address associated with the contact */
  address: Address;
  /** Show spinner over edit icon */
  loading: boolean;
  /** Whether the card is currently in "edit" mode */
  editing: boolean;
  /** Triggered when the edit icon is clicked */
  onToggleEdit: () => void;
}

/* ───────────────  Tailwind helpers  ─────────────── */
const labelStyle =
  "text-xs sm:text-sm text-gray-500 leading-none tracking-wide";
const lineStyle = "flex items-start gap-1.5 sm:gap-2 break-words";
// Font style for displayed values
const valueStyle =
  "text-sm sm:text-base text-xs sm:text-sm font-light text-gray-900 whitespace-normal break-all";

/* ─────────────────────  Component  ───────────────────── */
export const ContactCard: React.FC<ContactCardProps> = ({
  contact,
  address,
  loading,
  editing,
  onToggleEdit,
}) => {
  if (!contact.first_name && !contact.last_name) {
    return <p className="text-sm text-gray-500 italic">No contact available</p>;
  }

  return (
    <div className="grid w-full gap-x-4 gap-y-2 grid-cols-[auto_1fr_auto] md:items-start">
      {/* Avatar */}
      <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
        <span className="font-medium text-primary">
          {`${contact.first_name?.[0] || ""}${
            contact.last_name?.[0] || ""
          }`.toUpperCase() || "?"}
        </span>
      </div>

      {/* Name & title */}
      <div>
        <p className="font-semibold text-sm">
          {contact.first_name} {contact.last_name}
        </p>
        <p className={labelStyle}>{contact.position_title}</p>
      </div>

      {/* Edit / Cancel */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={onToggleEdit}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : !editing ? (
              <SquarePen size={16} />
            ) : (
              <X size={16} />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {loading ? <p>Loading…</p> : !editing ? <p>Edit</p> : <p>Cancel</p>}
        </TooltipContent>
      </Tooltip>

      {/* Info grid */}
      <div className="col-span-3 grid w-full grid-cols-1 lg:grid-cols-2 gap-x-6 xl:gap-x-8 gap-y-4 pt-2">
        {/* Contact Methods */}
        <section className="flex flex-col gap-2">
          <p className="uppercase text-xs sm:text-sm text-gray-500 font-semibold tracking-wider mb-2 pb-1 border-b border-gray-200">
            Contact Methods
          </p>

          {contact.email && (
            <div className={lineStyle}>
              <Mail size={14} className="text-gray-400" />
              <div className="flex flex-col">
                <span className={labelStyle}>Email</span>
                <span className={[valueStyle, ""].join(" ")}>
                  {contact.email}
                </span>
              </div>
            </div>
          )}

          {contact.phone_number && (
            <div className={lineStyle}>
              <Phone size={14} className="text-gray-400" />
              <div className="flex flex-col">
                <span className={labelStyle}>Phone</span>
                <span className={valueStyle}>{contact.phone_number}</span>
              </div>
            </div>
          )}

          {contact.mobile_number && (
            <div className={lineStyle}>
              <TabletSmartphone size={14} className="text-gray-400" />
              <div className="flex flex-col">
                <span className={labelStyle}>Mobile</span>
                <span className={valueStyle}>{contact.mobile_number}</span>
              </div>
            </div>
          )}
        </section>

        {/* Address Information */}
        <section className="flex flex-col gap-2">
          <p className="uppercase text-xs sm:text-sm text-gray-500 font-semibold tracking-wider mb-2 pb-1 border-b border-gray-200">
            Address Information
          </p>

          {(address.address1 || address.address2) && (
            <div className={lineStyle}>
              <MapPin size={14} className="text-gray-400" />
              <div className="flex flex-col ">
                <span className={labelStyle}>Street Address</span>
                <span className={valueStyle}>
                  {address.address1}
                  {address.address2 && `, ${address.address2}`}
                </span>
              </div>
            </div>
          )}

          {(address.city || address.state) && (
            <div className={lineStyle}>
              <Building2 size={14} className="text-gray-400" />
              <div className="flex flex-col">
                <span className={labelStyle}>City, State</span>
                <span className={valueStyle}>
                  {[address.city, address.state].filter(Boolean).join(", ")}
                </span>
              </div>
            </div>
          )}

          {(address.zip || address.country) && (
            <div className={lineStyle}>
              <Globe size={14} className="text-gray-400" />
              <div className="flex flex-col">
                <span className={labelStyle}>Zip Code, Country</span>
                <span className={valueStyle}>
                  {[address.zip, address.country].filter(Boolean).join(", ")}
                </span>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
