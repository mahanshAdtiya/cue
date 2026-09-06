import { NextResponse, type NextRequest } from "next/server";

import {
  SESSION_COOKIE_NAME,
  SESSION_COOKIE_PATH,
  SIGN_IN_PATH,
} from "@/lib/constants";

export function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL(SIGN_IN_PATH, request.url));

  response.cookies.delete({
    name: SESSION_COOKIE_NAME,
    path: SESSION_COOKIE_PATH,
  });

  return response;
}
