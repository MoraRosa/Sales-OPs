/**
 * Real reference data carried over from the original V2 draft workbook.
 * Used by init-sheet.ts to seed the catalog tabs on first setup. These
 * are genuinely Peak's product catalog, plan tiers, target industries,
 * common objections, and scoring weights -- not placeholder content.
 */
import { TABS, type TabName } from "../packages/sheets-client/src/schema.js";

export const SEED_DATA: Partial<Record<TabName, (string | number)[][]>> = {
  [TABS.FEATURE_CATALOG]: [
    ["F001", "Storefront", "Branded Storefront", "Public merchant storefront with themes", "Starter", "High", "All", "Outdated/no website", "Give customers a professional branded home base."],
    ["F002", "Commerce", "Products", "Physical and digital products, variants and inventory", "Free", "High", "Retail, creators, wholesale", "Manual catalog", "Manage products and inventory in one place."],
    ["F003", "Scheduling", "Scheduling", "Availability, slots, guest booking, intake and policies", "Free", "Very High", "Service businesses", "No booking/manual booking", "Let customers book without the back-and-forth."],
    ["F004", "Reviews", "Reviews", "Merchant-moderated customer reviews", "Free", "Medium", "Service businesses", "No social proof", "Showcase customer feedback directly on your storefront."],
    ["F005", "CRM", "Messages", "Customer inquiries and messages", "Free", "High", "All", "Scattered inquiries", "Keep customer conversations organized."],
    ["F006", "Marketing", "Emails", "Merchant email tools", "Free", "High", "All", "Manual communication", "Centralize customer communication."],
    ["F007", "Marketing", "Newsletter", "Newsletter signup/content", "Free", "Medium", "All", "No lead capture", "Turn visitors into an owned audience."],
    ["F008", "Content", "Blog", "Merchant blog", "Free", "Medium", "All", "Weak SEO/content", "Publish useful content and build authority."],
    ["F009", "Website", "Themes", "Theme system/customization", "Starter", "High", "All", "Weak branding", "Make the storefront look like your business."],
    ["F010", "Operations", "Admin", "Merchant admin and operational controls", "Free", "Very High", "All", "Too many tools", "Run the business from one admin."],
    ["F011", "Operations", "Automations", "Active automations subject to tier limits", "Starter", "Very High", "Growing service businesses", "Manual follow-up", "Automate repeatable work as you grow."],
    ["F012", "Analytics", "Advanced Reporting", "Advanced reporting on Grow+", "Grow", "High", "Growing businesses", "No visibility", "See what is happening across the business."],
    ["F013", "Operations", "Multi-location Inventory", "Inventory across multiple locations", "Grow", "Very High", "Multi-location", "Disconnected inventory", "Manage multiple locations from one platform."],
    ["F014", "Platform", "Custom Domain", "Custom merchant domain", "Starter", "Very High", "All", "Unprofessional URL", "Use your own domain."],
  ],
  [TABS.PLAN_CATALOG]: [
    ["Free", 0, "5 MB", 1, 25, 100, 1, 1, "Community", "Entry"],
    ["Starter", 30, "1 GB", 3, 500, 5000, 2, 1, "Email", "Small business"],
    ["Grow", 46, "10 GB", 10, 5000, 50000, 5, 3, "Email", "Growing business"],
    ["Pro", 90, "100 GB", "Unlimited", "Unlimited", "Unlimited", "Unlimited", 10, "Priority", "Advanced"],
    ["Enterprise", "Custom", "1 TB", "Unlimited", "Unlimited", "Unlimited", "Unlimited", "Unlimited", "Dedicated", "Enterprise"],
  ],
  [TABS.INDUSTRY_CATALOG]: [
    ["Home Services", "Landscaping", "high", 95, "Lead -> Quote -> Schedule -> Service -> Invoice", "Phone scheduling; manual follow-up; weak website", "Storefront; Scheduling; Messages; Emails; Automations", "Strong cold-call target"],
    ["Home Services", "Snow Removal", "high", 93, "Lead -> Quote -> Schedule -> Service -> Invoice", "Seasonal demand; scheduling; repeat customers", "Storefront; Scheduling; Messages; Automations", "Seasonality matters"],
    ["Transportation", "Towing", "high", 90, "Call -> Dispatch -> Service -> Invoice", "Phone-heavy intake; customer records; invoicing", "Storefront; Messages; Admin; Scheduling", "Urgent service"],
    ["Transportation", "Trucking / Freight", "high", 88, "Lead -> Quote -> Dispatch -> Invoice", "Multiple systems; customer records; B2B communication", "Messages; Admin; Analytics; API", "May need integrations"],
    ["Home Services", "Junk Removal", "high", 92, "Lead -> Quote -> Schedule -> Service -> Invoice", "Manual estimates; phone booking", "Storefront; Scheduling; Messages; Automations", "Strong fit"],
    ["Home Services", "Pressure Washing", "high", 94, "Lead -> Quote -> Schedule -> Service -> Invoice", "No booking; weak website; manual follow-up", "Storefront; Scheduling; Messages; Reviews", "Visual before/after opportunity"],
    ["Beauty", "Lash / Brow", "high", 96, "Lead -> Book -> Intake -> Service -> Review", "Instagram DMs; no website; manual booking", "Storefront; Scheduling; Reviews; Messages; Emails", "Excellent fit"],
    ["Creative", "Photography", "high", 97, "Inquiry -> Consultation -> Booking -> Invoice -> Delivery", "Scattered tools; deposits; portfolio", "Storefront; Scheduling; Products; Messages", "Excellent demo"],
    ["Events", "Wedding Vendor", "high", 95, "Inquiry -> Consultation -> Booking -> Deposit -> Delivery", "Manual follow-up; scattered systems", "Storefront; Scheduling; Messages; Emails; Admin", "High-value clients"],
    ["Wholesale", "B2B / Wholesale", "high", 90, "Inquiry -> Approval -> Quote/PO -> Invoice", "Manual wholesale management", "Products; Customer Profiles; Admin; Analytics", "B2B sleeper market"],
    ["Professional Services", "Consultant / Coach", "high", 94, "Lead -> Discovery -> Booking -> Invoice", "Calendars; forms; scattered client info", "Storefront; Scheduling; Messages; Emails; Admin", "Strong fit"],
  ],
  [TABS.LEAD_SOURCES]: [
    ["Google Maps", "Organic", "Manual / scraper", "Excellent", "Business, phone, website, reviews"],
    ["Google Search", "Organic", "Search / scraper", "Good", "Niche discovery"],
    ["Instagram", "Social", "Manual / scraper", "Excellent", "Strong for beauty/creative"],
    ["Facebook", "Social", "Manual / scraper", "Good", "Local services"],
    ["LinkedIn", "Social", "Manual / scraper", "Good", "B2B/professional"],
    ["Yelp", "Directory", "Directory", "Fair", "Enrichment"],
    ["Referral", "Referral", "Existing network", "Excellent", "Track referral source"],
    ["Cold List", "Outbound", "Scraper / list", "Unknown", "Validate before calling"],
  ],
  [TABS.OBJECTIONS]: [
    ["Too expensive", "Price", "Compare Peak's platform cost to multiple tools.", "Ask current monthly software spend.", "Avoid discounting immediately."],
    ["Happy with current software", "Competition", "Ask what they like and where gaps remain.", "Research their stack.", "Position consolidation."],
    ["Not right now", "Timing", "Ask when the problem becomes relevant.", "Create nurture follow-up.", "Capture timing."],
    ["Need online payments", "Feature", "Qualify their payment workflow and explain processor fees are direct where supported.", "Track feature gap.", "Never overpromise."],
    ["Need shipping", "Feature", "Qualify whether shipping is core.", "Nurture/disqualify if critical.", "Prioritize service businesses."],
  ],
  [TABS.SCORING_RULES]: [
    ["Fit Score", 0.25, "0-100", "Industry, business model, size, workflow", "How well Peak fits"],
    ["Engagement Score", 0.25, "0-100", "Responses, activity, meetings, recency", "Interest"],
    ["Buying Potential", 0.25, "0-100", "Size, revenue, locations, pain severity", "Commercial potential"],
    ["Accessibility", 0.25, "0-100", "Decision-maker and valid contacts", "Reachability"],
  ],
};
