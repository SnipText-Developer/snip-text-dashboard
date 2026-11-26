export const appBasePath = new URL(process.env.PUBLIC_URL || "/", "https://sniptext.kr").pathname.replace(/\/+$/, "");
export const errorRedirectUrl = `${appBasePath}/error-page/error.html`;
export const apiBaseUrl = "https://api.sniptext.kr/api/v1/";
