require("dotenv").config();
const { ApifyClient } = require("apify-client");
const { Resend } = require("resend");
const colors = require("colors");

/**

* Create the following environment variables in a .env file:
 * API_KEY_APIFY, 
 * APIFY_ACTOR_ID, 
 * RESEND_API_KEY,
**/
const resend_client = new Resend(process.env.RESEND_API_KEY);

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
  location: "United%20Arab%20Emirates", //use %20 for space
  timeRange: "r14400", //7200 means 2 hours, r14400 means 4 hours, r21600 means 6 hours, r43200 means 12 hours, r86400 means 24 hours
  keywords: "data%20science",
  level: "2", // 0: All, 1: Entry level, 2: Associate, 3: Mid-Senior, 4: Director, 5: Executive
};

const input = {
  urls: [
    "https://www.linkedin.com/jobs/search/?position=1&pageNum=0&keywords=" +
      linkedin_search_data.keywords +
      "&location=" +
      linkedin_search_data.location +
      "&f_E=" +
      linkedin_search_data.level +
      "&f_TPR=" +
      linkedin_search_data.timeRange,
  ],
  scrapeCompany: true,
  count: 13,
  splitByLocation: false,
  splitCountry: "AE",
};

const fetchData = async () => {
  // Run the Actor and wait for it to finish
  try {
    const run = await apify_client
      .actor(process.env.APIFY_ACTOR_ID)
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
      subject: "New LinkedIn Job Postings",
      html: `<p>${formattedContent}</p>`,
    });
    console.log("Email sent successfully".green.bold);
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

const main = async () => {
  const unformatted_items = await fetchData();

  if (!unformatted_items || unformatted_items.length === 0) {
    console.log("No items fetched");
    return;
  }

  console.log("Sending email...");
  try {
    await sendEmail(unformatted_items);
    console.log("Process completed successfully".green.bold);
  } catch (error) {
    console.error("Error in main function:", error);
    throw error;
  }
};

main();
