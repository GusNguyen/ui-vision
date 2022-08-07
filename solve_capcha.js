const { default: axios } = require("axios");
const capmonster = require("capmonster");

const capMonster_key = '';

const solveCaptcha = async ({ iframeLink, baseURL, pageURL, cookies }) => {
  const url = new URL(iframeLink);
  const siteKey = url.searchParams.get("sitekey");
  const captcha = new capmonster(capMonster_key);
  await captcha.decodeReCaptchaV2(pageURL, siteKey).then(async (res) => {
    if (res.data) {
      const params = new URLSearchParams();
      params.append("g-recaptcha-response", res.data);
      params.append("h-captcha-response", res.data);
      const response = await axios.post(baseURL, params, {
        headers: {
          cookie: cookies,
        },
      });
      console.log(response.data);
    }
  });
};

module.exports = solveCaptcha;
