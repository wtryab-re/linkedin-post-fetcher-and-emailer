require("dotenv").config();
const { ApifyClient } = require("apify-client");
const express = require("express");
const { Resend } = require("resend");
const colors = require("colors");

/**

* Create the following environment variables in a .env file:
 * PORT,
 * API_KEY_APIFY, 
 * API_KEY_APIFY_2, 
 * RESEND_API_KEY,
**/

const PORT = process.env.PORT || 3000;
const resend_client = new Resend(process.env.RESEND_API_KEY);

const app = express();
app.use(express.json());

/**

free apify gives only $5 per month for free
so we have to limit the number of runs and items we fetch to
run every 2 hours. This way $1/1000 post fetches gives us 5000 post fetches /month. 
We fetch 120 post fetches per day, which is 3600 post fetches per month, which is within the free tier limit. 

**/

const apify_client = new ApifyClient({
  token: process.env.API_KEY_APIFY,
});

const linkedin_search_data = {
  location: "United%20Arab%20Emirates",
  timeRange: "r7200", //7200
  keywords: "data%20science",
  level: "",
};

const input = {
  urls: [
    "https://www.linkedin.com/jobs/search/?position=1&pageNum=0&keywords=" +
      linkedin_search_data.keywords +
      "&location=" +
      linkedin_search_data.location +
      "&f_TPR=" +
      linkedin_search_data.timeRange,
  ],
  scrapeCompany: true,
  count: 10,
  splitByLocation: false,
  splitCountry: "AE",
};

const fetchData = async () => {
  // Run the Actor and wait for it to finish
  try {
    const run = await apify_client
      .actor(process.env.API_KEY_APIFY_2)
      .call(input);

    //response from linkedin is stored in dataset, we need to fetch it and send it via email
    const { items } = await apify_client
      .dataset(run.defaultDatasetId)
      .listItems();

    console.log("Fetched Items: ".green.bold, items.length);
    return items;
  } catch (error) {
    console.error("Error running Actor:", error);
  }
};

const formatEmailContent = (unformatted_items) => {
  let content = "";
  for (const item of unformatted_items) {
    content += `<p><strong>Title:</strong> ${item.title}</p>\n
    <p><strong>Company:</strong> ${item.companyName}</p>\n
    <a href="${item.link}">${item.link}</a>\n
    <hr>\n\n`;
  }
  return content;
};

const sendEmail = async (unformatted_items) => {
  const formattedContent = formatEmailContent(unformatted_items);
  console.log("Email formatted".cyan.bold);

  try {
    await resend_client.emails.send({
      from: process.env.RESEND_EMAIL,
      to: process.env.RESEND_TO_EMAIL,
      subject: "LinkedIn Job Postings",
      html: `<p>${formattedContent}</p>`,
    });
    console.log("Email sent successfully".green.bold);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

const main = async () => {
  const unformatted_items = await fetchData();
  try {
    console.log("Sending email...".yellow.bold);
    await sendEmail(unformatted_items);
  } catch (error) {
    console.error("Error in main function:", error);
  }
};

main();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
