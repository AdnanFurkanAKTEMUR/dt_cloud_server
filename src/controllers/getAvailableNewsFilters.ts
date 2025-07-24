import { Request, Response } from "express";
import axios from "axios";
import * as dotenv from "dotenv";
import redisClient from "../config/redis";

dotenv.config();

const NEWS_API_KEY = process.env.NEWS_API_KEY!;
const GUARDIAN_API_KEY = process.env.GUARDIAN_API_KEY!;
const CACHE_KEY = "news:filters";

export const getAvailableNewsFilters = async (req: Request, res: Response) => {
  try {

    const cachedData = await redisClient.get(CACHE_KEY);//rediste var mı kontrolü
    if (cachedData) {
      console.log("Redisten aldım");
      return res.json(JSON.parse(cachedData));
    }

    console.log("Rediste yok apiden gelecek");

    const categoriesSet = new Set<string>();
    const authorsSet = new Set<string>();
    const sourcesList: {
      id: string;
      name: string;
      sourceType: "newsapi" | "guardian";
    }[] = [];


    const newsapiResp = await axios.get("https://newsapi.org/v2/sources", {
      params: { apiKey: NEWS_API_KEY },
    });

    const newsSources = newsapiResp.data.sources;
    newsSources.forEach((s: any) => {
      if (s.category) categoriesSet.add(s.category);
      sourcesList.push({ id: s.id, name: s.name, sourceType: "newsapi" });
    });


    const newsapiArticlesResp = await axios.get(
      "https://newsapi.org/v2/everything",
      {
        params: {
          apiKey: NEWS_API_KEY,
          q: "technology",
          pageSize: 50,
        },
      }
    );

    const newsArticles = newsapiArticlesResp.data.articles || [];
    newsArticles.forEach((a: any) => {
      const author = a.author?.trim();
      if (author && author.length > 2 && author.toLowerCase() !== "null") {
        authorsSet.add(author);
      }
    });


    const guardianResp = await axios.get(
      "https://content.guardianapis.com/search",
      {
        params: {
          "api-key": GUARDIAN_API_KEY,
          "show-tags": "contributor",
          "page-size": "50",
        },
      }
    );

    const guardianArticles = guardianResp.data.response.results || [];
    guardianArticles.forEach((article: any) => {
      if (article.sectionName) categoriesSet.add(article.sectionName.trim());

      if (article.sectionId && article.sectionName) {
        sourcesList.push({
          id: article.sectionId,
          name: article.sectionName,
          sourceType: "guardian",
        });
      }

      const tags = article.tags || [];
      tags.forEach((tag: any) => {
        if (tag.type === "contributor" && tag.webTitle) {
          authorsSet.add(tag.webTitle);
        }
      });
    });

    //Aynı source iki apide de varsa birleştir
    const uniqueSources = Array.from(
      new Map(sourcesList.map((s) => [`${s.sourceType}:${s.id}`, s])).values()
    );

    const responseData = {
      categories: Array.from(categoriesSet).sort(),
      sources: uniqueSources,
      authors: Array.from(authorsSet).sort(),
    };

    // 2 saatliğine rediste tut
    await redisClient.set(CACHE_KEY, JSON.stringify(responseData), {
      EX: 7200,
    });

    return res.json(responseData);
  } catch (err: any) {
    console.error("Filter fetch error:", err.message);
    return res.status(500).json({
      message: "Failed to fetch combined news filters.",
      error: err.message,
    });
  }
};
