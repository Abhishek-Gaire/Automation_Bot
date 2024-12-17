---
# Puppeteer Quote & Image Generation Bot

This project is a **Node.js** script that automates generating random quotes, using quotes to create prompt for image generation and using this prompt to create AI-generated images, and saving the output locally. It leverages the **Puppeteer** library for browser automation.

---
## Features
- **Random Quote Generation**: Fetches quotes from a random quote generator website.
- **AI Prompt Generation**: Generates detailed prompts for AI images based on generated quote.
- **AI Image Creation**: Uses a prompt to generate images on [Leonardo.AI](https://app.leonardo.ai).
- **File Management**: Saves the generated quotes and images in dynamically created folders with unique timestamps.
- **Automation**: Fully automated process from quote extraction to image saving.

---
## Prerequisites
Ensure you have the following installed:

- **Node.js** (v14 or higher)
- **npm** (Node Package Manager)
- **Puppeteer** (Headless browser automation)
- **Leonardo.AI Account** (To use the AI image generation platform)

### Required Files
1. **`leonardoAICookies.json`**
   - Exported cookies for Leonardo.AI authentication.
   - Save this file in the project root directory.
2. **`promptGenerator.js`**
   - This file generates a detailed prompt for AI image creation.

---
## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <project-directory>
   ```
2. Install the required dependencies:
   ```bash
   npm install puppeteer fs path
   ```

---
## Project Structure

```
|-- screenshots/              # Generated images & quotes are saved here
|-- leonardoAICookies.json    # Authentication cookies for Leonardo.AI
|-- promptGenerator.js        # Custom prompt generator function
|-- index.js                    # Main automation script
|-- README.mdx                # Documentation
```

---
## How to Run
1. Generate `leonardoAICookies.json` by exporting cookies from Leonardo.AI.

2. Run the script:
   ```bash
   node index.js
   ```

3. Upon successful execution, the script will:
   - Fetch a random quote.
   - Use the quote to generate a detailed AI prompt.
   - Use the prompt to generate AI images on Leonardo.AI.
   - Save the images and quote in a **timestamped subfolder** inside the `screenshots/` directory.

---
## Code Walkthrough

### Step 1: Generate a Quote
- Uses Puppeteer to visit `https://artofpoets.com/random-quote-generator/`.
- Clicks the **Generate** button and fetches the generated quote.

### Step 2: Generate a Prompt
- Implements `promptGenerator.js` to automate generating an AI prompt.
- Visits `https://labs.writingmate.ai/share/WLPW` and interacts with the form inside an iframe to generate a prompt.
- Replaces unnecessary text like *"Widescreen (16:9)"* or *"digital art."* for cleaner prompts.

### Step 3: Generate Images
- Reads **`leonardoAICookies.json`** to authenticate with Leonardo.AI.
- Navigates to the AI generation page, pastes the generated prompt, and triggers image generation.
- Waits for images to load and downloads the first four images.

### Step 4: Save Output
- Saves the quote as a text file.
- Creates a uniquely named subfolder (e.g., `ImageDirectory_YYYY-MM-DD_1`).
- Downloads images into this folder.

---
## Example Output
The generated folder structure will look like this:

```
|-- screenshots/
    |-- ImageDirectory_2024-06-17_1/
        |-- quote.txt             # Contains the extracted quote
        |-- image_1.jpg           # First generated image
        |-- image_2.jpg           # Second generated image
        |-- image_3.jpg           # Third generated image
        |-- image_4.jpg           # Fourth generated image
```

---
## Troubleshooting

1. **Cookies Error**:
   - Ensure the `leonardoAICookies.json` file is valid and up-to-date.
   - Use browser tools like EditThisCookie to export cookies.

2. **Network Issues**:
   - Increase `timeout` values in the `page.goto()` function.
   - Verify your internet connection.

3. **Missing Selectors**:
   - Check if Leonardo.AI or the prompt generator has updated their DOM structure.
   - Update the `waitForSelector` and `querySelector` statements accordingly.

---
## Dependencies
- [Puppeteer](https://pptr.dev/): Headless browser automation.
- [fs](https://nodejs.org/api/fs.html): File system operations.
- [path](https://nodejs.org/api/path.html): Path utilities.

---
## License
This project is licensed under the MIT License.

---
## Author
***Abhishek Gaire***

Feel free to contribute, submit PRs, or raise issues!

---
