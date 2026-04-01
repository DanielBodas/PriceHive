import asyncio
from playwright.async_api import async_playwright
import os

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={'width': 1280, 'height': 800})

        # Base URL
        base_url = "http://localhost:3000"

        try:
            # Landing Page
            print("Capturing Landing Page...")
            await page.goto(base_url)
            await page.wait_for_timeout(2000)
            await page.screenshot(path="frontend/verification/final_landing.png")

            # Dashboard (if accessible or just check layout)
            print("Capturing Dashboard...")
            await page.goto(f"{base_url}/dashboard")
            await page.wait_for_timeout(2000)
            await page.screenshot(path="frontend/verification/final_dashboard.png")

            # Analytics
            print("Capturing Analytics...")
            await page.goto(f"{base_url}/analytics")
            await page.wait_for_timeout(2000)
            await page.screenshot(path="frontend/verification/final_analytics.png")

        except Exception as e:
            print(f"Error: {e}")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
