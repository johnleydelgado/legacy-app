import * as React from 'react';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import {PAGE_LOGIN_URL} from "../constants/pageUrls_old";


export default async function Home() {
  const headersData = await headers();
  const origin = headersData.get("host");

  redirect(`http://${origin}${PAGE_LOGIN_URL}`);

  return null;
}
