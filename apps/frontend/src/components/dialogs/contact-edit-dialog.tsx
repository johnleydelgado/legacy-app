import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandInput,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { US_STATES } from "@/constants/states";

export interface ContactFormData {
  first_name: string;
  last_name: string;
  email: string;
  position_title: string;
  phone_number: string;
  mobile_number: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

interface ContactEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData: ContactFormData;
  onSave: (data: ContactFormData) => void | Promise<void>;
  loading?: boolean;
  title?: string;
}

export const ContactEditDialog: React.FC<ContactEditDialogProps> = ({
  open,
  onOpenChange,
  initialData,
  onSave,
  loading,
  title = "Edit Contact",
}) => {
  const [formState, setFormState] =
    React.useState<ContactFormData>(initialData);
  const [openState, setOpenState] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  React.useEffect(() => {
    if (open) setFormState(initialData);
  }, [open, initialData]);

  const handleChange =
    (field: keyof ContactFormData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormState((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSubmit = async () => {
    await onSave(formState);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Update contact and address information.
          </DialogDescription>
        </DialogHeader>

        {/* Personal Information */}
        <div className="space-y-4">
          <p className="font-semibold">Personal Information</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs mb-1">First Name</label>
              <Input
                value={formState.first_name}
                onChange={handleChange("first_name")}
              />
            </div>
            <div>
              <label className="block text-xs mb-1">Last Name</label>
              <Input
                value={formState.last_name}
                onChange={handleChange("last_name")}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs mb-1">Email</label>
              <Input value={formState.email} onChange={handleChange("email")} />
            </div>
            <div className="col-span-2">
              <label className="block text-xs mb-1">Position</label>
              <Input
                value={formState.position_title}
                onChange={handleChange("position_title")}
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-4 mt-6">
          <p className="font-semibold">Contact Information</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs mb-1">Phone</label>
              <Input
                value={formState.phone_number}
                onChange={handleChange("phone_number")}
              />
            </div>
            <div>
              <label className="block text-xs mb-1">Mobile</label>
              <Input
                value={formState.mobile_number}
                onChange={handleChange("mobile_number")}
              />
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="space-y-4 mt-6">
          <p className="font-semibold">Address Information</p>
          <div>
            <label className="block text-xs mb-1">Street Address</label>
            <Input
              value={formState.address1}
              onChange={handleChange("address1")}
            />
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-xs mb-1">City</label>
              <Input value={formState.city} onChange={handleChange("city")} />
            </div>
            <div>
              {/* State dropdown (custom) */}
              <div className="relative">
                <label className="block text-xs mb-1">State</label>

                {/* trigger */}
                <div
                  onClick={() => setOpenState((o) => !o)}
                  className="flex h-10 w-full cursor-pointer items-center justify-between rounded-md border px-3 py-2 text-sm"
                >
                  <span>
                    {formState.state
                      ? US_STATES.find((s) => s.value === formState.state)
                          ?.label
                      : "Select state"}
                  </span>
                  <span className="ml-2">▼</span>
                </div>

                {openState && (
                  <div className="absolute left-0 top-full z-50 mt-1 w-full rounded-md border bg-popover shadow-md">
                    <Command className="overflow-visible">
                      <CommandInput
                        placeholder="Search states…"
                        value={searchQuery}
                        onValueChange={setSearchQuery}
                        className="h-9"
                        autoFocus
                      />
                      <CommandEmpty>No state found.</CommandEmpty>
                      <CommandGroup className="max-h-52 overflow-auto">
                        {US_STATES.filter(
                          (s) =>
                            s.label
                              .toLowerCase()
                              .includes(searchQuery.toLowerCase()) ||
                            s.value
                              .toLowerCase()
                              .includes(searchQuery.toLowerCase())
                        ).map((s) => (
                          <CommandItem
                            key={s.value}
                            onSelect={() => {
                              setFormState((prev) => ({
                                ...prev,
                                state: s.value,
                              }));
                              setSearchQuery("");
                              setOpenState(false);
                            }}
                          >
                            {s.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-xs mb-1">Zip Code</label>
              <Input value={formState.zip} onChange={handleChange("zip")} />
            </div>
            <div>
              <label className="block text-xs mb-1">Country</label>
              <Input
                value={formState.country}
                onChange={handleChange("country")}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
          <DialogClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
