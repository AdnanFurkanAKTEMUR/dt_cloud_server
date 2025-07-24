import { Request, Response } from "express";
import axios from "axios";
import { AppDataSource } from "../config/data-source";
import { User } from "../models/User";
import redisClient from "../config/redis";
import crypto from "crypto";
const NEWS_API_KEY = process.env.NEWS_API_KEY;

const getStringQuery = (value: unknown): string | undefined =>
  typeof value === "string" ? value : undefined;

export const searchNews = async (req: Request, res: Response) => {
  if (!req.userId)
    return res.status(401).json({ message: "Unauthorized access" });

  const q = getStringQuery(req.query.q);
  const fromParam = getStringQuery(req.query.from);
  const toParam = getStringQuery(req.query.to);
  const sources = getStringQuery(req.query.sources);
  const sortBy = getStringQuery(req.query.sortBy) || "publishedAt";
  const page = parseInt(getStringQuery(req.query.page) || "1", 10);
  const pageSize = parseInt(getStringQuery(req.query.pageSize) || "20", 10);
  const provider = getStringQuery(req.query.provider) || "both";

  const today = new Date();
  const defaultTo = today.toISOString().split("T")[0];
  const last7Days = new Date();
  last7Days.setDate(today.getDate() - 7);
  const defaultFrom = last7Days.toISOString().split("T")[0];

  const from = fromParam || defaultFrom;
  const to = toParam || defaultTo;

  const results: any[] = [];

  if (provider === "newsapi" || provider === "both") {
    try {
      const newsapiParams: Record<string, string> = {
        apiKey: NEWS_API_KEY!,
        page: page.toString(),
        pageSize: pageSize.toString(),
        from,
        to,
        sortBy,
        q: q || "technology",
      };

      if (sources) newsapiParams.sources = sources;

      const newsapiResp = await axios.get("https://newsapi.org/v2/everything", {
        params: newsapiParams,
      });

      results.push(...(newsapiResp.data.articles || []));
    } catch (err: any) {
      console.error("NewsAPI error:", err.response?.data || err.message);
    }
  }

  if (provider === "guardian" || provider === "both") {
    const guardianResults = await fetchFromGuardian({
      q,
      from,
      to,
      page,
      pageSize,
    });
    results.push(...guardianResults);
  }
  results.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  return res.status(200).json({ articles: results });
};



export const getPersonalizedNews = async (req: Request, res: Response) => {
  const provider = getStringQuery(req.query.provider) || "both";
  const { categories, sources, authors } = req;

  try {

    const filters = {
      provider,
      categories,
      sources,
      authors,
    };
    //Gelen kullanıcı filtrelerine göre key üret
    const cacheKey =
      "news:personalized:" +
      crypto.createHash("md5").update(JSON.stringify(filters)).digest("hex");

    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log("Redisten geldi");
      return res.json(JSON.parse(cachedData));
    }

    console.log("Rediste yok");

    const today = new Date();
    const to = today.toISOString().split("T")[0];
    const fromDate = new Date();
    fromDate.setDate(today.getDate() - 30);
    const from = fromDate.toISOString().split("T")[0];

    const fallbackQuery = "technology";
    const results: any[] = [];

    if (provider === "newsapi" || provider === "both") {
      const params: Record<string, string> = {
        apiKey: NEWS_API_KEY!,
        from,
        to,
        pageSize: "20",
      };

      if (sources?.length) {
        params.sources = sources.join(",");
      }

      if (authors?.length) {
        params.q = authors[0];
      } else if (categories?.length) {
        params.q = categories[0];
      } else {
        params.q = fallbackQuery;
      }

      const endpoint =
        params.sources || categories?.length || authors?.length
          ? "https://newsapi.org/v2/top-headlines"
          : "https://newsapi.org/v2/everything";

      const response = await axios.get(endpoint, { params });
      results.push(...(response.data.articles || []));
    }

    if (provider === "guardian" || provider === "both") {
      let q = fallbackQuery;
      if (authors?.length) q = authors[0];
      else if (categories?.length) q = categories[0];

      const guardianResults = await fetchFromGuardian({ q, from, to });
      results.push(...guardianResults);
    }

    // yayın tarihine göre sıraladım iki apiden veri karışık da gelmiş olur
    results.sort((a, b) => {
      const aDate = new Date(a.publishedAt || a.webPublicationDate).getTime();
      const bDate = new Date(b.publishedAt || b.webPublicationDate).getTime();
      return bDate - aDate;
    });

    const finalResult = { articles: results };


    await redisClient.set(cacheKey, JSON.stringify(finalResult), {
      EX: 7200,
    });

    return res.json(finalResult);
  } catch (err: any) {
    console.error(
      "Personalized news error:",
      err.response?.data || err.message
    );
    return res.status(500).json({
      message: "Failed to fetch personalized news.",
      error: err.response?.data || err.message,
    });
  }
};

const GUARDIAN_API_KEY = process.env.GUARDIAN_API_KEY;

const fetchFromGuardian = async (options: {
  q?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}) => {
  try {
    const { q = "technology", from, to, page = 1, pageSize = 20 } = options;

    const params: Record<string, string> = {
      "api-key": GUARDIAN_API_KEY!,
      q,
      "show-fields": "all",
      page: page.toString(),
      "page-size": pageSize.toString(),
    };

    if (from) params.from = from;
    if (to) params.to = to;

    const response = await axios.get(
      "https://content.guardianapis.com/search",
      { params }
    );
    return response.data.response.results || [];
  } catch (err: any) {
    console.error("Guardian API error:", err.response?.data || err.message);
    return [];
  }
};



export const getAllAuthors = async (req: Request, res: Response) => {
  const CACHE_KEY = "news:authors";

  try {

    const cachedAuthors = await redisClient.get(CACHE_KEY);
    if (cachedAuthors) {
      console.log("Veriler redisten");
      return res.status(200).json({ authors: JSON.parse(cachedAuthors) });
    }

    console.log("Veriler rediste yok apiden");

    const guardianAuthors = new Set<string>();
    const newsApiAuthors = new Set<string>();


    const guardianResp = await axios.get(
      "https://content.guardianapis.com/search",
      {
        params: {
          "api-key": process.env.GUARDIAN_API_KEY,
          "show-tags": "contributor",
          "page-size": "50",
        },
      }
    );

    const guardianResults = guardianResp.data.response.results || [];
    for (const article of guardianResults) {
      const tags = article.tags || [];
      tags.forEach((tag: any) => {
        if (tag.type === "contributor" && tag.webTitle) {
          guardianAuthors.add(tag.webTitle);
        }
      });
    }

    const newsApiResp = await axios.get("https://newsapi.org/v2/everything", {
      params: {
        apiKey: process.env.NEWS_API_KEY,
        q: "technology",
        pageSize: 50,
      },
    });

    const articles = newsApiResp.data.articles || [];
    for (const article of articles) {
      const author = article.author?.trim();
      if (author && author.length > 2 && author.toLowerCase() !== "null") {
        newsApiAuthors.add(author);
      }
    }

    const allAuthors = Array.from(
      new Set([...guardianAuthors, ...newsApiAuthors])
    ).sort();

    await redisClient.set(CACHE_KEY, JSON.stringify(allAuthors), {
      EX: 7200,
    });

    return res.status(200).json({ authors: allAuthors });
  } catch (err: any) {
    console.error("Author fetch error:", err.message);
    return res
      .status(500)
      .json({ message: "Yazarlar alınamadı", error: err.message });
  }
};

