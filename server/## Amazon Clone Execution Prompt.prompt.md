## Amazon Clone Execution Prompt

Execute a high-fidelity Amazon.com commerce clone inside this repository, excluding real payment processing. Build with assignment-first correctness, then push visual and interaction parity to peak detail.

### Objective
Ship a production-ready fullstack e-commerce app that:
1. Meets all core assignment requirements end to end.
2. Feels and behaves like Amazon on key commerce surfaces.
3. Includes static payment UX, wishlist, and purchased-product-only reviews.
4. Is delivered via small validated commits with phase-wise pushes.

### Scope Lock
1. Include: Home, Product Listing, Product Detail, Cart, Checkout, Order Confirmation, Order History, wishlist flow, review flow, Amazon Basics merchandising detail.
2. Include: static payment step only (Card, UPI, Netbanking, COD tabs), no real payment gateway integration.
3. Exclude: full Amazon ecosystem beyond commerce surfaces in this repo.
4. Enforce: no placeholder-only outputs where working flows are required.

### Non-Negotiable Constraints
1. Keep implementation modular with clean separation between UI, state, API, and DB logic.
2. Preserve existing working flows while upgrading parity and features.
3. Validate each phase before commit and push.
4. Ensure responsive behavior on mobile, tablet, and desktop.
5. Be able to explain every implementation decision and line of code.

### Phase Plan
1. Phase 0: Baseline and guardrails.
Goal: establish reliable baseline and acceptance checklist.
Tasks: run client/server lint-build checks; capture baseline screenshots for Home, PLP, PDP, Cart, Checkout, Orders; freeze parity checklist from amazon.com patterns.
Gate: zero startup failures and a written parity checklist.

2. Phase 1: Global shell parity.
Goal: align global navigation and layout primitives.
Tasks: Amazon-style primary header; secondary nav strip; hover/focus details; logo assets; route-aware layout variants including simplified checkout header; footer parity.
Gate: shell parity validated on desktop and mobile nav states.

3. Phase 2: Home and Listing parity.
Goal: improve discovery and merchandising fidelity.
Tasks: Amazon-like home sections; hero blend treatment; deals/category rails; robust listing facets (category, brand, price, rating, Prime), sorting and pagination behavior.
Gate: listing filters and sorting are functional, not decorative.

4. Phase 3: PDP conversion parity.
Goal: strengthen purchase confidence and information density.
Tasks: breadcrumb; image gallery and zoom behavior; offer/price stack; delivery promise; stock visibility; ships-from/sold-by table; Prime/Amazon's Choice/Basics indicators; related rails.
Gate: PDP supports complete add-to-cart and buy-now paths with clear state handling.

5. Phase 4: Cart and Checkout parity.
Goal: reduce friction and mirror Amazon checkout rhythm.
Tasks: cart layout parity; subtotal and free-delivery progress; save-for-later and wishlist hooks; accordion checkout structure; static payment tabs and order placement continuation.
Gate: full cart-to-order flow works with static payment step and confirmation page.

6. Phase 5: Backend completion.
Goal: complete APIs and data rules required by frontend parity.
Tasks: wishlist CRUD API; reviews API with purchased-product eligibility guard; order status transitions; request validation hardening; minimal-risk schema migrations and indexes.
Gate: API smoke tests pass for products, cart, orders, wishlist, reviews.

7. Phase 6: Frontend integration of wishlist/reviews/orders.
Goal: close feature loop in UI.
Tasks: integrate new APIs; allow review writing only when purchase eligibility exists; display review aggregates on PLP/PDP; improve order history status and detail timeline.
Gate: eligibility is enforced both backend and frontend.

8. Phase 7: Amazon Basics detailing.
Goal: improve merchandising realism.
Tasks: expand seed/catalog treatment for Basics-like products; add coherent badge/render logic from backend data.
Gate: Basics treatment appears consistently across listing and PDP.

9. Phase 8: Hardening and performance.
Goal: resilience and perceived speed.
Tasks: error boundaries/fallbacks; skeleton loaders; optimistic cart updates with reconciliation; image fallbacks; API failure toasts; stock race-condition safeguards and query/index tuning.
Gate: no critical regressions under repeated cart/order interactions.

10. Phase 9: Submission readiness.
Goal: reviewer-ready documentation and deploy clarity.
Tasks: rewrite root/client/server docs; API and env setup guidance; architecture and schema rationale; deployment instructions; assumptions and limitations.
Gate: clean-machine setup and run instructions are reproducible.

### Verification Contract (Run Every Phase)
1. Frontend: lint/build green and route smoke checks for Home, Listing, PDP, Cart, Checkout, Confirmation, Order History, Wishlist.
2. Backend: Prisma validate/migrate/seed and endpoint smoke checks.
3. Data integrity: stock decrement correctness, cart clear on order, review creation rejected when product not purchased.
4. UX parity: manual checklist against Amazon for shell, cards, PDP buy-box, cart summary, checkout structure.

### Git Delivery Contract
1. Create small, reviewable commits for each completed sub-phase.
2. Push after each green gate.
3. Use milestone tags: shell parity, PLP/PDP parity, checkout static payment, wishlist/reviews, submission-ready.
4. Never skip verification before push.

### Definition of Done
1. All assignment core features function end to end.
2. Bonus scope implemented: wishlist, order-history polish, static payment UX, purchased-product reviews.
3. Visual and interaction parity is materially closer to Amazon across targeted surfaces.
4. Documentation is complete for setup, architecture, API usage, and deployment.
5. Repository history shows phase-wise, validated progress.

### Working Set
Use these as primary implementation targets:
1. client/src/App.jsx
2. client/src/components/Navbar/Navbar.jsx
3. client/src/components/Navbar/Navbar.css
4. client/src/components/Footer/Footer.jsx
5. client/src/components/Footer/Footer.css
6. client/src/pages/Home/Home.jsx
7. client/src/pages/Home/Home.css
8. client/src/pages/ProductListing/ProductListing.jsx
9. client/src/pages/ProductListing/ProductListing.css
10. client/src/components/ProductCard/ProductCard.jsx
11. client/src/components/ProductCard/ProductCard.css
12. client/src/pages/ProductDetail/ProductDetail.jsx
13. client/src/pages/ProductDetail/ProductDetail.css
14. client/src/pages/Cart/Cart.jsx
15. client/src/pages/Cart/Cart.css
16. client/src/components/CartItem/CartItem.jsx
17. client/src/pages/Checkout/Checkout.jsx
18. client/src/pages/Checkout/Checkout.css
19. client/src/pages/OrderHistory/OrderHistory.jsx
20. client/src/context/CartContext.jsx
21. client/src/services/api.js
22. server/prisma/schema.prisma
23. server/prisma/seed.js
24. server/src/controllers/productController.js
25. server/src/controllers/cartController.js
26. server/src/controllers/orderController.js
27. server/src/controllers/wishlistController.js
28. server/src/controllers/reviewController.js
29. server/src/routes/wishlist.js
30. server/src/routes/reviews.js
31. server/src/app.js
32. README.md
33. client/README.md
34. server/README.md

### Execution Start
Begin with Phase 0 immediately. Do not ask for reconfirmation unless blocked by missing access or a hard technical dependency.