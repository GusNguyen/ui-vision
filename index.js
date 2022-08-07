const child_process = require("child_process");
const fs = require("fs");
const fsPromises = fs.promises;
const path = require("path");
const solveCaptcha = require("./solve_capcha");

const timeoutSeconds = 50,
      repeatIntervalSeconds = 2,
      downloadDirPath = "C:\\Users\\starfruit\\Downloads\\",
      autorunHtmlPath = "D:\\Thai\\RPA\\ui.vision.html",
      browserPath = "c:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
      closeRPA = true,
      closeBrowser = true,
      macro = "test-captcha/capmonster",
      cmdVar1 = "-";

run().catch((reason) => {
  console.error(reason);
  process.exit(1);
});

async function run() {
    for (let i = 1; true; i++) {
        try {
            const res = await playAndWait(macro, [cmdVar1], { timeoutSeconds, downloadDirPath, autorunHtmlPath, browserPath, closeRPA, closeBrowser });
            console.log(`[#${i}] Macro run successful.\nExecution time: ${ res.executionTimeMs / 1000 } secs.\nStatus: ${res.statusText}\n`);
        } catch (e) {
            console.error(e);
        }
        await new Promise((resolve) => {
            setTimeout(resolve, repeatIntervalSeconds * 1000);
        });
    }
}

async function playAndWait(macro, cmdVars, { timeoutSeconds, downloadDirPath, autorunHtmlPath, browserPath, closeRPA, closeBrowser }) {
  if (macro === undefined) {
    console.error("Macro must be defined");
    process.exit(2);
  }

  let captcha = false;

  if (captcha) {
    const iframeLink = '03ANYolqvgPQ2joNrfSsv60U4LRLjShAwW0HFNKimz9MtgDy80B3MOTiljgU6bqblah_-Lb3XsyNBwckIQeJ_TA7jhdswh2PiaRWJWZNGSTcVpa1qX-oxEJJO8spLi2_YyIwQyJmtG1tE6FsBBVHQDctDt7z41-SWBAU_NNfZ4rPuGQs7tKyfjk29UKVZCd6kydRbIpbytjbIEzxStXBmBD8f0V_0Jl9ZdlDuwVXSCpVMIz77g1_lKtt6bk-rA0zg4Hln5nCjuX9r2XkXVMvFXHeFMmiUhjE2K_-dex84_N1Xauk8itKpW8hVYVL_4pxmceGJ2c_CzGK5aCjW1_TLMkx4i950M4zUdN4WCAyuYzQyopE1WJ17Wl0YWnyNYVlFehvF-jXWzOas6Wx5BaYmd584eQ0SBfS8HsOI-joL805JzCsW05jG658X60HJ5UAbqJlAbu0WzAYLQwls3Kp5a9FFIHX3yFhvgmRtfxmI7CdUt2QCuL_FzYzeWZZSQgSvl5FDknwQN1lnSFD9tdMiqsljnbDTs4VXQpiONwPrUk42NEAba-LpOXWV4FSvIMWkn299pGa1J0K8i-H7vVA3LlK762B7MlmnlrgaCfkZr681NCnUXpEtmgjd2p9g_9aGxe9oM79AFnh2AUmOv3I1E4hAUcWF1n9URuF4cJk9VJ0KaAehK7tw96YqklK2BB0YVg4SKpv-HYMnd-zMl0AmJDn6COWI3Xhsy1JE6xEsfY6tnRCPEIpghOQI_M69t9J7IcEqqD20fB5tNRIJyw0EJVVIRNAZoyNVR0vAbh1qxVaxNpEa1PTONkYjBsKxMuYn1YJdl3zEBQypMAw7kzf2Md0xeOr49RUUJyOjK-TkLh5mG5E2TFZud5FooqrJEypiCtjenxQopMVmTh-6epefDW3r-Hy5ttNo88gE6JltNV61sqkVHJag19vbZ5FsuOVO83mVwOL2yhAIizK8F1ogLinc9Ub-EQj71D1vr4c1glNBsAoncBSQkmhREMzGkIn3fiHwPPzeRPDsu3RQaIDn6NGi_-V9nLYpIKIlZpXsQAwHdm-jKo4sDCUOruUuZi6QH_FjvI0irjkGMleG_9K0jA0_7ncdrG0jwgVhz-XUjciMBbryfNxmKeRHElujXeAYKUCHLOWQtEfxa',
          // replace iframeLink
          baseURL = 'https://www.google.com/recaptcha/api2/reload',  // replace pageURL
          pageURL = 'https://www.google.com/recaptcha/api2/demo', // replace pageURL
          cookies = '';

    /*
        + iframeLink: get value of captcha input 
            (ex: const iframeLink = await page.evaluate('document.querySelector("input[name=_token]").value');)
        + baseURL: url endpoint receipt response key
        + pageURL: current url
        + cookies: current cookies
    */

    await solveCaptcha({ iframeLink, baseURL, pageURL, cookies });
  }

  const cmd_var1 = cmdVars[0] || "-";
  closeRPA = closeRPA ? 1 : 0;
  closeBrowser = closeBrowser ? 1 : 0;
  const processTimeoutSeconds = timeoutSeconds || 10;
  
  try {
    await Promise.all([
      fsPromises.access(downloadDirPath, fs.constants.F_OK),
      fsPromises.access(autorunHtmlPath, fs.constants.F_OK),
      fsPromises.access(browserPath, fs.constants.F_OK)
    ]);
  } catch (e) {
    console.error(e);
    process.exit(2);
  }

  const date = new Date().toISOString().replace(/:/g, "-").slice(0, -5);
  const logFile = `logRPA_${date}.txt`;
  const logPath = path.join(downloadDirPath, logFile);

  const startDate = new Date();

  const args = `file:///${autorunHtmlPath}?macro=${macro}&cmd_var1=${cmd_var1}&closeRPA=${closeRPA}&closeBrowser=${closeBrowser}&direct=1&savelog=${logFile}`;

  const browserProcess = child_process.spawn(browserPath, [args]);

  let timeElapsedTimeout;
  const timeElapsedFunc = (timeElapsed) => {
    timeElapsed = timeElapsed || 0;
    console.log("Waiting for macro to finish, seconds =", timeElapsed);
    timeElapsedTimeout = setTimeout(timeElapsedFunc, 1000, timeElapsed + 1);
  };
  timeElapsedTimeout = setTimeout(timeElapsedFunc, 0);

  return new Promise((resolve, reject) => {
    browserProcess.on("error", reject);

    const processTimeout = setTimeout(() => {
      clearTimeout(timeElapsedTimeout);
      browserProcess.kill()
        ? console.log("Killed the browser process")
        : console.error("Couldn't kill the browser process");
      reject(
        new Error(
          `Macro did not complete withing the time given: ${processTimeoutSeconds} seconds`
        )
      );
    }, processTimeoutSeconds * 1000);

    fs.watchFile(
      logPath,
      { persistent: false, interval: 1000 },
      async (curr, prev) => {
        if (curr.mtimeMs !== 0 && prev.mtimeMs === 0) {
          clearTimeout(processTimeout);
          clearTimeout(timeElapsedTimeout);

          const line = await readFirstLine(logPath);

          const result = {
            statusText: line,
            executionTimeMs: new Date() - startDate,
          };

          if (line.search("Status=OK") === -1) {
            reject(result);
          } else {
            resolve(result);
          }
        }
      }
    );
  });
}

function readFirstLine(filePath, options) {
  const { encoding, lineEnding } = {
    ...options,
    encoding: "utf8",
    lineEnding: "\n",
  };

  return new Promise((resolve, reject) => {
    const readStream = fs.createReadStream(filePath, { encoding: encoding });
    let readData = "";
    let pos = 0;
    let index;
    readStream
      .on("data", (chunk) => {
        index = chunk.indexOf(lineEnding);
        readData += chunk;
        if (index === -1) {
          pos += chunk.length;
        } else {
          pos += index;
          readStream.close();
        }
      })
      .on("close", () =>
        resolve(readData.slice(readData.charCodeAt(0) === 0xfeff ? 1 : 0, pos))
      )
      .on("error", (err) => reject(err));
  });
}
