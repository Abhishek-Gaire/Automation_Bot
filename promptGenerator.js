const puppeteer = require("puppeteer");

async function generatePrompt(quote) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto("https://labs.writingmate.ai/share/WLPW", {
    waitUntil: "networkidle2",
    timeout: "120000",
  });

  try {
    // Wait for the iframe to appear on the page
    await page.waitForSelector("iframe", { visible: true });

    // Access the iframe's content frame
    const iframeElement = await page.$("iframe");
    const frame = await iframeElement.contentFrame();

    const promptForm = await frame.waitForSelector("#promptForm");

    const imageModel = await promptForm.waitForSelector("#model");
    await imageModel.select("Midjourney");

    const ratioModel = await promptForm.waitForSelector("#ratio");
    await ratioModel.select("widescreen (16:9)");

    const styleModel = await promptForm.waitForSelector("#style");
    await styleModel.select("digital art");

    const descriptionPrompt = await promptForm.waitForSelector("#description");
    await descriptionPrompt.type(`Describe this "${quote}" as an image`, {
      delay: 100,
    });

    const submitBtn = await promptForm.waitForSelector("#submitBtn");
    await submitBtn.click();

    await frame.waitForSelector("li.bg-light-gray");

    // Extract text from span
    const spanText = await frame.evaluate(() => {
      const span = document.querySelector("li.bg-light-gray span");
      return span ? span.textContent.trim() : null;
    });

    const generatedPrompt = replaceIfExists(
      spanText,
      "Widescreen (16:9)",
      "digital art."
    );

    return generatedPrompt;
  } catch (error) {
    console.error(error);
  } finally {
    // Close the browser
    await browser.close();
  }
}
function replaceIfExists(text, toReplace1, toReplace2) {
  // Check and replace the first text if it exists
  if (text.includes(toReplace1)) {
    return text.replace(toReplace1, "").trim();
  }
  // Check and replace the second text if it exists
  if (text.includes(toReplace2)) {
    return text.replace(toReplace2, "").trim();
  }
  // If neither is found, return the original text
  return text;
}
module.exports = generatePrompt;
