# Overview

Hi whoever is reading this!

This project is for those that are sick of checking LinkedIn and seeing a job that they would have liked to have applied for but they saw the post late and hundreds have people have already applied for it. Realistically no HR manager is going to read more than 20 resumes. So if you can't join em, beat em.

This script will send you an email with jobs posted in the past 2 hours, every 2 hours.

# FREE API KEYS (Required)

**You do need two accounts on RESEND and APIFY**
I used the curious_coder/linkedin-jobs-scraper to fetch the jobs.

The free tier on both sites works just fine too, as long as you aren't sending the mails to anyone other than yourself.
Feel free to get the higher tiers incase you want to fetch every few minutes too.

These are the repo secrets you need to make:

1. API_KEY_APIFY
2. APIFY_ACTOR_ID
3. RESEND_API_KEY
4. RESEND_EMAIL
5. RESEND_TO_EMAIL

# Customize your LinkedIn search

To customize your LinkedIn search, edit the linkedin_search_data variable.

## Free Tier APIFY INFO

Free APIFY gives only $5 per month for free so we have to limit the number of runs and items we fetch to run every 2 hours. This way $1/1000 post fetches gives us 5000 post fetches/month. We fetch 156 posts per day, which is 4680 posts per month, which is within the free tier limit.

# Timer Adjustment of Actions

The timer has been set to run 4am to 8pm UTC time. You can set this as you like in the linkedin.yml file

# Run it on local or on Actions or on Render

## That's it, let's get this bread!
