const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

const generatePrompt = require("./promptGenerator");

// 1. Generate a Quote
async function generateQuote() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Visits the Random Quote Generator
  await page.goto("https://artofpoets.com/random-quote-generator/");

  // Simulates the click of a button on a className(btn)
  await page.click(".btn");

  await page.waitForSelector("#quote"); // Waits for the quote to be generated

  //NOTE - Captures the generated quote from selector #quote
  const text = await page.$eval("#quote", (element) => element.textContent);

  // closes the browser
  await browser.close();

  //ANCHOR - Returns the captured text
  return text;
}

// 2. Generate an Image Using Puppeteer (Browser Automation)
async function generateImageWithQuote(quote) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Set the viewport size to full-screen (e.g., 1920x1080)
  await page.setViewport({ width: 1556, height: 960 });

  // Maximize the window (non-headless mode only)
  const [browserWindow] = await browser.pages();
  await browserWindow.setViewport({ width: 1920, height: 1080 });

  // Read cookies from a file (assuming cookies are stored in 'cookies.json')
  const cookies = JSON.parse(fs.readFileSync("leonardoAICookies.json", "utf8"));

  // Validate cookies
  cookies.forEach((cookie) => {
    // Ensure the sameSite value is a valid string, default to "Lax" if invalid
    if (
      cookie.sameSite &&
      !["Strict", "Lax", "None"].includes(cookie.sameSite)
    ) {
      // console.error(
      //   `Invalid sameSite value for cookie ${cookie.name}. Expected "Strict", "Lax", or "None".`
      // );
      cookie.sameSite = "Lax"; // Set to default valid value
    }

    // If sameSite is missing, set a default value
    if (!cookie.sameSite) {
      cookie.sameSite = "Lax"; // Default value for sameSite
    }

    // Optional: You can also sanitize other attributes here (like path, domain, etc.)
  });

  // Set the cookies on the page
  await page.setCookie(...cookies);

  // Visit the AI image generator page
  await page.goto("https://app.leonardo.ai/ai-generations", {
    waitUntil: "networkidle2",
    timeout: "120000",
  });

  // Wait for the button to be visible
  const closeButton = await page.waitForSelector('button[aria-label="Close"]');
  await closeButton.click();

  const promptTextArea = await page.waitForSelector(".css-1fzldm9");
  await promptTextArea.type(quote, { delay: 10 });

  const generateImageButton = await page.$(".css-1ql8y1r");
  await generateImageButton.click();

  // Wait for 20 seconds before proceeding
  await new Promise((resolve) => setTimeout(resolve, 30000)); // 30-second delay

  const groupOfFourImages = await page.$(
    "body > main > div.css-xx431o > div.css-1hudg79 > div:nth-child(2) > div.css-pmagi6 > div.css-1eiwtsh > div:nth-child(3) > div > div.css-19r0ukm"
  );

  if (!groupOfFourImages) {
    throw new Error("Parent div for images not found.");
  }

  // Extract the image sources from the first 4 child divs
  const images = await groupOfFourImages.evaluate((parentDiv) => {
    const sources = [];
    const children = parentDiv.children; // Get all children of the parent div

    // Iterate over the first 4 children
    for (let i = 0; i < 4; i++) {
      const childDiv = children[i];
      if (childDiv) {
        const imgTag = childDiv.querySelector("img");
        if (!imgTag) {
          console.log("Images tag not found");
        }
        if (imgTag && imgTag.src) {
          sources.push(imgTag.src); // Add the image source to the array
        }
      }
    }
    return sources;
  });

  // Ensure the `screenshots` folder exists
  const screenshotsDir = path.join(__dirname, "screenshots");
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir);
  }

  // Get the current date in YYYY-MM-DD format
  const date = new Date();
  const formattedDate = date.toISOString().split("T")[0]; // "YYYY-MM-DD"

  // Find the next available subfolder by checking existing folders
  let subfolderIndex = 1;
  let imageDir = path.join(
    screenshotsDir,
    `ImageDirectory_${formattedDate}_${subfolderIndex}`
  );

  // Keep incrementing the subfolder index if a folder with the same name already exists
  while (fs.existsSync(imageDir)) {
    subfolderIndex++;
    imageDir = path.join(
      screenshotsDir,
      `ImageDirectory_${formattedDate}_${subfolderIndex}`
    );
  }

  // Create the new folder
  fs.mkdirSync(imageDir);

  // Save the quote as a text file
  const quoteFilePath = path.join(imageDir, "quote.txt");
  fs.writeFileSync(quoteFilePath, quote);

  // Download each image
  for (let i = 0; i < images.length; i++) {
    const response = await page.goto(images[i]);
    const buffer = await response.buffer();
    const fileName = `image_${i + 1}.jpg`;
    const filePath = path.join(imageDir, fileName);

    // Save the image file
    fs.writeFileSync(filePath, buffer);
  }

  await page.close();
  await browser.close();
  return true;
}

// Main function to run the bot
(async () => {
  let modifiedPrompt;

  const quote = await generateQuote();

  const modifiedQuote = quote.split(".")[0];
  console.log("Generated Quote:", modifiedQuote);

  const generatedPromt = await generatePrompt(modifiedQuote);

  if (generatedPromt.includes("Widescreen (16:9)")) {
    modifiedPrompt = generatedPromt.replace("Widescreen (16:9)", "").trim();
  } else if (generatedPromt.includes("digital art.")) {
    modifiedPrompt = generatedPromt.replace("digital art.", "").trim();
  } else if (generatedPromt.includes("widescreen (16:9)")) {
    modifiedPrompt = generatedPromt.replace("widescreen (16:9)", "").trim();
  } else if (generatedPromt.includes("digital art:")) {
    modifiedPrompt = generatedPromt.replace("digital art:", "").trim();
  } else {
    modifiedPrompt = generatedPromt;
  }

  const imagePath = await generateImageWithQuote(modifiedPrompt);
  console.log("Image generated at:", imagePath);
})();
