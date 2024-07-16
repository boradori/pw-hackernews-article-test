const { chromium, expect } = require("@playwright/test")

async function validatePageDates(page, startIndex, endIndex) {
  const ageLocator = page.locator("span.age")
  const titles = await ageLocator.evaluateAll((elements) =>
    elements.map((element) => element.getAttribute("title"))
  )
  const dates = titles.slice(startIndex, endIndex).map((title) => new Date(title))

  for (let i = 1; i < dates.length; i++) {
    const currentDate = dates[i]
    const previousDate = dates[i - 1]

    console.log(`Comparing articles ${i} and ${i + 1}:`)
    console.log(`  Previous article: ${previousDate.toLocaleString()}`)
    console.log(`   Current article: ${currentDate.toLocaleString()}`)

    expect(previousDate.getTime()).toBeGreaterThanOrEqual(currentDate.getTime())
  }

  console.log(`Validated ${dates.length} articles on the current page.`)
  return dates
}

async function navigateAndValidateDates(page, numberOfArticles) {
  const articleLocator = page.locator(".athing") 
  const moreLinkLocator = page.locator(".morelink")

  let previousPageLastDate = null
  let processedArticles = 0
  
  // currentPage count is only for logging purpose
  let currentPage = 1

  while (processedArticles < numberOfArticles) {
    const remainingArticles = numberOfArticles - processedArticles
    const articlesToValidate = Math.min(remainingArticles, 30)

    console.log(`Processing page ${currentPage}...`);
    const dates = await validatePageDates(page, 0, articlesToValidate)

    if (previousPageLastDate !== null) {
      // check if the first date of the current page is older than the previousPageLastDate
      expect(previousPageLastDate.getTime()).toBeGreaterThanOrEqual(dates[0].getTime())
      console.log(`Page ${currentPage} is correctly ordered after page ${currentPage - 1}.`)
    }
    
    // update previousPageLastDate
    previousPageLastDate = dates[dates.length - 1]
    // increment processedArticles
    processedArticles += dates.length
    console.log(`Processed ${processedArticles} articles in total.`)

    if (processedArticles < numberOfArticles) {
      console.log(`Navigating to page ${currentPage + 1}...`)
      await Promise.all([
        page.waitForNavigation(),
        moreLinkLocator.click()
      ])

      // check if 30 articles are displayed
      await expect(articleLocator).toHaveCount(30)
      currentPage++
    }
  }
}

async function saveHackerNewsArticles(numberOfArticlesToCheck) {
  const browser = await chromium.launch({ headless: false })
  const context = await browser.newContext()
  const page = await context.newPage()
  await page.goto("https://news.ycombinator.com/newest")

  console.log(`Validating the first ${numberOfArticlesToCheck} articles on Hacker News...`)
  await navigateAndValidateDates(page, numberOfArticlesToCheck)

  await browser.close()
  console.log("Validation completed. The dates are sorted from newest to oldest.")
}

(async () => {
  const numberOfArticlesToCheck = 100
  await saveHackerNewsArticles(numberOfArticlesToCheck)
})()