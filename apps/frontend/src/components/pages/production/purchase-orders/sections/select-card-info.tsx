'use client';

import { Button } from '@/components/ui/button';
import { Plus, SquarePen } from 'lucide-react';
import * as React from 'react';

interface SelectCardInfoProps {
    cardTitle: string;
}

const SelectCardInfo = ({ cardTitle }: SelectCardInfoProps) => {
    return (
        <div className="size-[30%] bg-gray-100 rounded-md p-4 grow">
            <div className="flex p-1 border-b border-b-gray-300 items-center">
                <p className="text-sm font-semibold text-gray-600">{`${cardTitle} Details`}</p>
                <Button variant="ghost" size="icon" className="ml-auto hover:bg-gray-200 cursor-pointer">
                    <SquarePen className="h-4 w-4 text-gray-600" />
                </Button>
            </div>
        </div>
    )
}

export default SelectCardInfo;
