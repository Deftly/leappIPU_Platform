const ES_DB = import.meta.env.VITE_ES_DB_URL;

export async function queryElasticsearch(options) {
  const { endpoint, method = "GET", query = {}, body = null } = options;

  const queryString = new URLSearchParams(query).toString();
  const url = `${ES_DB}${endpoint}${queryString ? `?${queryString}` : ""}`;

  const requestOptions = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (body && (method === "POST" || method === "PUT")) {
    requestOptions.body = JSON.stringify(body);
  }

  const response = await fetch(url, requestOptions);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `Elasticsearch Request Failed: ${url}. Error: ${JSON.stringify(errorData)}`,
    );
  }
  return response.json();
}
