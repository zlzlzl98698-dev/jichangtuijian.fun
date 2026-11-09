import { AIRPORT_BRANDS } from "./brands";

export const AFF_DISCLAIMER =
  "「合规声明与透明度声明」：本站所列部分注册链接为推广邀请链接（Affiliate Links）。当您通过本站链接注册并购买服务时，本站可能会获得一定比例的推荐佣金。该佣金由服务商系统自动清算，绝不会增加您的实际支付金额，且本站评测始终保持中立客观与实测数据优先。";

export function getAffLink(slug: string): string {
  const brand = AIRPORT_BRANDS.find((b) => b.slug === slug);
  return brand ? brand.affLink : "#";
}

export function getAffButtonHtml(slug: string, customText?: string): string {
  const brand = AIRPORT_BRANDS.find((b) => b.slug === slug);
  if (!brand) return "";
  const text = customText || `直达 ${brand.name} 官网（优惠注册）`;
  return `<a href="${brand.affLink}" target="_blank" rel="nofollow sponsored noopener" class="aff-btn aff-btn-primary">${text} →</a>`;
}
