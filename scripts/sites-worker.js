async function assetResponse(request, env) {
  return env.ASSETS.fetch(request);
}

export default {
  async fetch(request, env) {
    let response = await assetResponse(request, env);
    if (response.status !== 404) return response;

    const url = new URL(request.url);
    const finalSegment = url.pathname.split("/").pop() || "";
    if (!url.pathname.endsWith("/") && !finalSegment.includes(".")) {
      url.pathname = `${url.pathname}.html`;
      response = await assetResponse(new Request(url, request), env);
      if (response.status !== 404) return response;
    }

    const notFoundUrl = new URL("/404.html", request.url);
    const notFound = await assetResponse(new Request(notFoundUrl, request), env);
    return new Response(notFound.body, {
      status: 404,
      headers: notFound.headers,
    });
  },
};
