import { CustomerForm } from "./customer/types"

export type Updater = (
    key: keyof CustomerForm,
) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void

export function Select(props: React.ComponentProps<"select">) {
    return (
        <div className="relative w-full"> {/* Optional: wrapper for custom arrow */}
            <select
                className="w-full appearance-none rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                {...props}
            />
        </div>
    );
}

export function Textarea(props: React.ComponentProps<"textarea">) {
    return (
        <textarea
            className="placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm"
            {...props}
        />
    )
}