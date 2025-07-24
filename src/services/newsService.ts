import axios from "axios";

export const fetchNews = async ({
  q,
  from,
  to,
  category,
  sources,
}: {
  q?: string;
  from?: string;
  to?: string;
  category?: string;
  sources?: string;
}) => {
  const response = await axios.get("https://newsapi.org/v2/everything", {
    params: {
      apiKey: process.env.NEWS_API_KEY,
      q,
      from,
      to,
      category,
      sources,
      language: "en",
      pageSize: 20,
    },
  });

  return response.data.articles;
};
