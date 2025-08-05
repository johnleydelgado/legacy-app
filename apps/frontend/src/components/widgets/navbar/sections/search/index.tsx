"use client";

import * as React from "react";

import { SearchIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const Search = () => {
  const [open, setOpen] = React.useState(false);

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false);
    command();
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          <SearchIcon className="mr-2 h-4 w-4" />
          <span className="text-sm text-muted-foreground">Search...</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Suggestions">
              <CommandItem
                onSelect={() => runCommand(() => console.log("customers"))}
              >
                <span>Customers</span>
              </CommandItem>
              <CommandItem
                onSelect={() => runCommand(() => console.log("sales"))}
              >
                <span>Sales</span>
              </CommandItem>
              <CommandItem
                onSelect={() => runCommand(() => console.log("invoices"))}
              >
                <span>Invoices</span>
              </CommandItem>
              <CommandItem
                onSelect={() => runCommand(() => console.log("settings"))}
              >
                <span>Settings</span>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default Search;
