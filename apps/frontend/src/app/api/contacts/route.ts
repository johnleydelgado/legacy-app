import { ContactsResponse } from '@/types/customer';
import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:5001';

export async function GET(req: NextRequest) {
    const page = req.nextUrl.searchParams.get('page') ?? '1';

    const upstream = `${BACKEND}/api/v1/contacts?page=${page}`;

    const res = await fetch(upstream, {
        // headers: { Authorization: `Bearer ${process.env.API_TOKEN}` },
        next: { revalidate: 30 }, // ⟵ ISR / SWR in one line
    });

    if (!res.ok) {
        return NextResponse.json(
            { message: 'Failed to load contacts' },
            { status: res.status },
        );
    }

    const data: ContactsResponse = await res.json();
    return NextResponse.json(data);
}