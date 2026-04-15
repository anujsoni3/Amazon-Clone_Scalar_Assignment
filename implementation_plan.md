# Amazon Clone Peak Detailing UI/UX Plan

This plan aims to dramatically boost the visual fidelity of the clone to match Amazon.com's desktop design closely.

## User Review Required

> [!IMPORTANT]
> Please review the proposed list of enhancements below. Are there any specific Amazon features or pages you want me to prioritize? (For example, should I add real checkout accordions instead of a flat list? Should I add the "Amazon Choice" and "Prime" badges?)

## Proposed Changes

### Component: Global Layout & Navbar
- Add "Prime" and "Language Selector" elements to the Navbar.
- Use explicit Amazon SVG logos for the Navbar and Footer instead of text.
- Match exact box-shadows and hover `outline: 1px solid white` effects on Navbar items.
- Ensure the secondary nav bar (All, Today's Deals, Customer Service, Registry, Gift Cards, Sell) looks exactly like Amazon's `#232f3e` strip.
- Add Amazon's typical footer layout: "Back to top", 4 deep columns of links, the centralized logo, language selector, currency, and country selection on a dark navy background.

### Component: Home Page (`Home.jsx` & `Home.css`)
- Replace simple category cards with Amazon-style "Quad-Cards" (4 smaller images in a 2x2 grid) or large single image cards with blue "See more" links at the bottom.
- Ensure the hero slider has the exact gradient overlay at the bottom that blends seamlessly with the page background (`#eaeded`).
- Add a sign-in card prompt specifically for non-logged-in views (or just hardcode it to mimic the "Sign in for your best experience" box).

### Component: Product Listing page (`ProductListing.jsx`)
- Overhaul the left sidebar: convert simple links to checkbox styles for Brand and other mock filters.
- Add prime logo toggles in the sidebar.
- Style the product card in the listing to show the "Amazon's Choice" badge and the exact rating stars, delivery dates ("FREE delivery Tomorrow, Sept 22"), and Prime logo.

### Component: Product Detail Page (`ProductDetail.jsx`)
- Tweak the title font to mimic Amazon Ember more accurately (using system-ui fallbacks with specific weights).
- Add the Prime logo next to pricing.
- Enhance the Right-hand Buy Box: Add the green "In Stock" text, "Ships from Amazon", "Sold by Amazon" table layout, and a "Add to Wish List" grey button.
- Format the discount percentages dynamically (e.g., "-20%").

### Component: Cart Page (`Cart.jsx` & `CartItem.jsx`)
- Structure the cart to look exactly like Amazon's wide layout.
- Include a "Part of your FREE delivery" progress bar or text.
- Add the "Customers who bought items in your cart also bought" sliding section below the cart.
- Add the yellow "Proceed to Buy" button on point.

### Component: Checkout (`Checkout.jsx`)
- Remove the main Navbar for the checkout step (Amazon uses a simplified header during checkout with only the logo and lock icon).
- Convert the flat checkout page into an "Accordion" style format (1. Delivery Address, 2. Payment Method, 3. Items and Delivery).

## Verification Plan
1. **Automated compilation**: Run `npm run lint` and `npm run build` on the client.
2. **Visual Inspection**: Start a `browser_subagent` and capture screenshots of each modified page (Home, Search, PDP, Cart) to ensure "peak detailing" is achieved.
