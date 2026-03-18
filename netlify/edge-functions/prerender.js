const BOT_UA =
  /(googlebot|bingbot|duckduckbot|yandex|baiduspider|facebookexternalhit|twitterbot|linkedinbot|slackbot|discordbot|whatsapp|applebot)/i;

function isBot(request) {
  const ua = request.headers.get("user-agent") || "";
  return BOT_UA.test(ua);
}

function isBypassPath(pathname) {
  if (!pathname) return true;
  if (pathname === "/robots.txt" || pathname === "/sitemap.xml") return true;
  if (pathname.startsWith("/api")) return true;
  if (pathname.startsWith("/admin")) return true;
  if (/\.(css|js|mjs|map|json|png|jpg|jpeg|gif|webp|svg|ico|txt|xml|woff2?|ttf|eot|pdf|zip)$/i.test(pathname)) {
    return true;
  }
  return false;
}

export default async (request, context) => {
  try {
    const url = new URL(request.url);

    // Avoid loops if the prerendered HTML itself loads resources.
    if (request.headers.get("x-prerender") === "1") {
      return context.next();
    }

    if (!isBot(request)) return context.next();
    if (isBypassPath(url.pathname)) return context.next();

    const backendBase = Deno.env.get("PRERENDER_BACKEND_URL") || "https://petrozen-ylex8.ondigitalocean.app";
    const prerenderUrl = new URL("/__prerender", backendBase);
    prerenderUrl.searchParams.set("path", url.pathname + url.search);

    const res = await fetch(prerenderUrl.toString(), {
      headers: {
        "user-agent": request.headers.get("user-agent") || "",
        "accept": "text/html,application/xhtml+xml",
      },
    });

    if (!res.ok) {
      return context.next();
    }

    // Return the prerendered HTML. Keep it cacheable at the edge for a bit.
    const headers = new Headers(res.headers);
    headers.set("Cache-Control", "public, max-age=0, s-maxage=300");
    headers.set("X-Served-By", "netlify-edge-prerender");

    return new Response(res.body, { status: 200, headers });
  } catch (_err) {
    return context.next();
  }
};

