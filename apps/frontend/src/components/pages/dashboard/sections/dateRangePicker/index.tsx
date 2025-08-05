"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type CalendarDateRangePickerProps = React.HTMLAttributes<HTMLDivElement>;

const CalendarDateRangePicker = ({ className }: CalendarDateRangePickerProps) => {
    // Keep a [startDate, endDate] tuple in state.
    const [dateRange, setDateRange] = React.useState<[Date | null, Date | null]>([
        new Date(2023, 0, 1),
        new Date(),
    ]);
    const [startDate, endDate] = dateRange;

    return (
        <div className={cn("grid gap-2", className)}>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant="outline"
                        size="sm"
                        className={cn(
                            "w-[240px] justify-start text-left font-normal",
                            !startDate && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? (
                            endDate ? (
                                <>
                                    {format(startDate, "LLL dd, y")} – {format(endDate, "LLL dd, y")}
                                </>
                            ) : (
                                format(startDate, "LLL dd, y")
                            )
                        ) : (
                            <span>Pick a date</span>
                        )}
                    </Button>
                </PopoverTrigger>

                <PopoverContent className="w-auto p-0" align="start">
                    <DatePicker
                        inline
                        selectsRange
                        startDate={startDate}
                        endDate={endDate}
                        onChange={(dates: [Date | null, Date | null]) => {
                            setDateRange(dates);
                        }}
                        monthsShown={2}
                        renderCustomHeader={({ decreaseMonth, increaseMonth, prevMonthButtonDisabled, nextMonthButtonDisabled, date }) => (
                            <div className="flex items-center justify-between px-4 py-3 bg-muted/50 border-b border-border">
                                <button
                                    onClick={decreaseMonth}
                                    disabled={prevMonthButtonDisabled}
                                    className="flex items-center justify-center h-8 w-8 rounded-md hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span className="text-lg">‹</span>
                                </button>
                                <span className="text-sm font-medium">
                                    {format(date, "MMMM yyyy")}
                                </span>
                                <button
                                    onClick={increaseMonth}
                                    disabled={nextMonthButtonDisabled}
                                    className="flex items-center justify-center h-8 w-8 rounded-md hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span className="text-lg">›</span>
                                </button>
                            </div>
                        )}
                        dayClassName={() => "py-2"}
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
};

export default CalendarDateRangePicker;
