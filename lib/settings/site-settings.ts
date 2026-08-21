import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db/prisma";

export type SiteSettings = {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  contactEmail: string;
  contactPhone: string;
  seoDefaultTitle: string;
  seoDefaultDescription: string;
  footerText: string;
  facebookUrl: string;
  instagramUrl: string;
  linkedinUrl: string;
  xUrl: string;
  logoMediaId: string;
  faviconMediaId: string;
  designPrimaryColor: string;
  designSecondaryColor: string;
  designBackgroundColor: string;
  designTextColor: string;
  designHeadingFont: string;
  designBodyFont: string;
  designBorderRadius: string;
  designContainerWidth: string;
  layoutShowTrustStrip: string;
  layoutShowServices: string;
  layoutShowCategories: string;
  layoutShowLatestPosts: string;
  layoutShowBottomCta: string;
  layoutHeroStyle: string;
  layoutCardStyle: string;
  footerStyle: string;
  footerShowBrand: string;
  footerShowQuickLinks: string;
  footerShowSocials: string;
  footerShowOffice: string;
  footerShowEmail: string;
  footerShowCopyright: string;
  footerBrandText: string;
  footerOfficeTitle: string;
  footerOfficeAddress: string;
  footerCopyrightText: string;
  footerCreditText: string;
  footerCreditUrl: string;
  homePostsEnabled: string;
  homePostsEyebrow: string;
  homePostsTitle: string;
  homePostsSubtitle: string;
  homePostsCount: string;
  homePostsLayout: string;
  homePostsShowExcerpt: string;
  homePostsShowCategory: string;
  homePostsShowAuthor: string;
  homePostsShowDate: string;
  homePostsButtonText: string;
  homePostsExcerptSentences: string;
};

const defaults: SiteSettings = {
  siteName: "SIRA Web",
  siteDescription: "",
  siteUrl: "",
  contactEmail: "",
  contactPhone: "",
  seoDefaultTitle: "SIRA Web",
  seoDefaultDescription: "",
  footerText: "All rights reserved.",
  facebookUrl: "",
  instagramUrl: "",
  linkedinUrl: "",
  xUrl: "",
  logoMediaId: "",
  faviconMediaId: "",
  designPrimaryColor: "#09090b",
  designSecondaryColor: "#52525b",
  designBackgroundColor: "#ffffff",
  designTextColor: "#18181b",
  designHeadingFont: "Arial",
  designBodyFont: "Arial",
  designBorderRadius: "16px",
  designContainerWidth: "1280px",
  layoutShowTrustStrip: "true",
  layoutShowServices: "true",
  layoutShowCategories: "true",
  layoutShowLatestPosts: "true",
  layoutShowBottomCta: "true",
  layoutHeroStyle: "brand",
  layoutCardStyle: "elevated",
  footerStyle: "burgundy",
  footerShowBrand: "true",
  footerShowQuickLinks: "true",
  footerShowSocials: "true",
  footerShowOffice: "true",
  footerShowEmail: "true",
  footerShowCopyright: "true",
  footerBrandText: "",
  footerOfficeTitle: "Office",
  footerOfficeAddress: "",
  footerCopyrightText: "",
  footerCreditText: "",
  footerCreditUrl: "",
  homePostsEnabled: "true",
  homePostsEyebrow: "Latest Articles",
  homePostsTitle: "Fresh software news and trends",
  homePostsSubtitle: "Explore the latest insights, updates, and best practices from the world of software and technology.",
  homePostsCount: "4",
  homePostsLayout: "grid4",
  homePostsShowExcerpt: "true",
  homePostsShowCategory: "true",
  homePostsShowAuthor: "true",
  homePostsShowDate: "true",
  homePostsButtonText: "View all articles",
  homePostsExcerptSentences: "10",
};

const settingMap = {
  "site.name": "siteName",
  "site.description": "siteDescription",
  "site.url": "siteUrl",
  "contact.email": "contactEmail",
  "contact.phone": "contactPhone",
  "seo.defaultTitle": "seoDefaultTitle",
  "seo.defaultDescription": "seoDefaultDescription",
  "footer.text": "footerText",
  "social.facebook": "facebookUrl",
  "social.instagram": "instagramUrl",
  "social.linkedin": "linkedinUrl",
  "social.x": "xUrl",
  "branding.logoMediaId": "logoMediaId",
  "branding.faviconMediaId": "faviconMediaId",
  "design.primaryColor": "designPrimaryColor",
  "design.secondaryColor": "designSecondaryColor",
  "design.backgroundColor": "designBackgroundColor",
  "design.textColor": "designTextColor",
  "design.headingFont": "designHeadingFont",
  "design.bodyFont": "designBodyFont",
  "design.borderRadius": "designBorderRadius",
  "design.containerWidth": "designContainerWidth",
  "layout.showTrustStrip": "layoutShowTrustStrip",
  "layout.showServices": "layoutShowServices",
  "layout.showCategories": "layoutShowCategories",
  "layout.showLatestPosts": "layoutShowLatestPosts",
  "layout.showBottomCta": "layoutShowBottomCta",
  "layout.heroStyle": "layoutHeroStyle",
  "layout.cardStyle": "layoutCardStyle",
  "footer.style": "footerStyle",
  "footer.showBrand": "footerShowBrand",
  "footer.showQuickLinks": "footerShowQuickLinks",
  "footer.showSocials": "footerShowSocials",
  "footer.showOffice": "footerShowOffice",
  "footer.showEmail": "footerShowEmail",
  "footer.showCopyright": "footerShowCopyright",
  "footer.brandText": "footerBrandText",
  "footer.officeTitle": "footerOfficeTitle",
  "footer.officeAddress": "footerOfficeAddress",
  "footer.copyrightText": "footerCopyrightText",
  "footer.creditText": "footerCreditText",
  "footer.creditUrl": "footerCreditUrl",
  "homePosts.enabled": "homePostsEnabled",
  "homePosts.eyebrow": "homePostsEyebrow",
  "homePosts.title": "homePostsTitle",
  "homePosts.subtitle": "homePostsSubtitle",
  "homePosts.count": "homePostsCount",
  "homePosts.layout": "homePostsLayout",
  "homePosts.showExcerpt": "homePostsShowExcerpt",
  "homePosts.showCategory": "homePostsShowCategory",
  "homePosts.showAuthor": "homePostsShowAuthor",
  "homePosts.showDate": "homePostsShowDate",
  "homePosts.buttonText": "homePostsButtonText",
  "homePosts.excerptSentences": "homePostsExcerptSentences",
} as const;

async function loadSiteSettings(): Promise<SiteSettings> {
  try {
    const settings = await prisma.setting.findMany({
      where: {
        key: {
          in: Object.keys(settingMap),
        },
      },
      select: {
        key: true,
        value: true,
      },
    });

    const result: SiteSettings = { ...defaults };

    for (const setting of settings) {
      const field =
        settingMap[setting.key as keyof typeof settingMap];

      if (!field) continue;

      if (typeof setting.value === "string") {
        result[field] = setting.value;
      }
    }

    if (!result.seoDefaultTitle.trim()) {
      result.seoDefaultTitle = result.siteName;
    }

    return result;
  } catch (error) {
    console.error(
      "Could not load site settings from database; using safe defaults.",
      error,
    );

    return { ...defaults };
  }
}


export const getSiteSettings = unstable_cache(
  loadSiteSettings,
  ["sira-site-settings"],
  {
    revalidate: 60,
    tags: ["site-settings"],
  },
);
