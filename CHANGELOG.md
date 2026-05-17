# Changelog

All notable changes to this project will be documented in this file.
## [0.5.0-alpha.0] - 2026-05-17

### Bug Fixes
- **sqs:** Address requeue verify warnings — validation key, parity test, tight assertions (058e810)
- **tests:** Fix pre-existing TS type cast errors in terminal and nav-links tests (d093b7f)
- **lint:** Resolve ESLint errors to pass pnpm lint (e61ef98)
- **tests:** Update type casting in AWS config tests to resolve TypeScript errors (1722663)
- **ci:** Run lint, test, and build without pnpm workspace filter (6bfc68f)

### Features
- **s3:** Expose headObject metadata and add metadata API route (9f98f95)
- **s3:** Add ObjectMetadataDialog and wire metadata to row actions (22ebd80)
- **sqs:** Add i18n keys and error mapping for requeue (4a5f7de)
- **sqs:** Add requeue-message use-case (62dd658)
- **sqs:** Extract MessageRow with per-row requeue action (6779428)
- **sqs:** Add i18n keys for JSON message editor (b59e8af)
- **sqs:** Add JSON validation and format button to send dialog (9934142)
- **sqs:** Add message attributes viewer to receive panel (a5630e3)
- **dynamodb:** Add seedItemsAction with BatchWriteCommand chunking and i18n (4d5a3eb)
- **dynamodb:** Add SeedDialog component and wire to scan-table toolbar (595beb0)
- **dynamodb:** Show selected filename and item count in SeedDialog (29413b3)
- **dynamodb:** Add JSON editor to put/edit item dialogs (0d22d1b)
- **config:** Add @aws-sdk/credential-providers dependency (33d77c2)
- **config:** Add createAwsConfig helper and maskSecret utility (aabb83f)
- **config:** Add i18n keys for config settings sections (4502039)
- **config:** Refactor DynamoDB client to per-request async factory (c187267)
- **config:** Refactor SQS client to per-request async factory (e6b2bb2)
- **config:** Refactor SNS client to per-request async factory (84b07c8)
- **config:** Refactor Lambda client to per-request async factory (6b262f3)
- **config:** Refactor S3 client to per-request async factory (69b2b9f)
- **config:** Add update-endpoint Server Action (7354138)
- **config:** Add EndpointForm client component (ecd743a)
- **config:** Add config read-only display sections (1a8199f)
- **config:** Wire settings page with config sections (1318917)
- **config:** Extract resolveCredentialSource to dedicated server-only module (33e570c)

### Refactor
- **dynamodb:** Move parseCSV to features/shared/utils/parse-csv (a8c3114)
- **dynamodb:** Move chunk to features/shared/utils/chunk, make it sync (ff5dddd)
- **config:** Use local AwsCredentials type instead of @aws-sdk/types (77719a4)
## [0.4.0-alpha.0] - 2026-05-16

### Bug Fixes
- **s3:** Add back link on bucket detail page (35d4090)
- **terminal:** Import tools inside NavLinks to avoid RSC serialization error (68770a5)
- **terminal:** Send command as argv array to match route contract; disable xterm stdin (5c36c19)
- **terminal:** Resolve CSS vars for xterm theme at runtime; echo command before run (d1d473c)

### Chore
- Release v0.4.0-alpha.0 (44adbfa)

### Features
- **shared:** Add route breadcrumbs to dashboard header (e0d1f39)
- **shared:** Rebrand to Loopback (1265a27)
- **terminal:** Add ToolEntry registry, sidebar Tools section, and SSE execute API (19b6633)
- **terminal:** Add xterm.js UI components and terminal page (8f68b48)
- **terminal:** Add experimental PageNotice banner (7fac20b)
- **dashboard:** Add health probe and i18n foundation (9d7f1bc)
- **dashboard:** Add landing page, service grid, and nav home link (22dc273)

### Refactor
- **dashboard:** Rename health API to endpoint-neutral names (bc7693b)
- **dashboard:** Use getEndpointHealth on dashboard page (cd1cc1c)

### Testing
- **dashboard:** Cover health UI, service grid, crumbs, and nav (9bcb336)
## [0.3.0-alpha.0] - 2026-05-16

### Bug Fixes
- **s3:** Add missing confirm key in ObjectRowActions test mock (bb391aa)
- **s3:** Address verify warnings — AbortSignal, key rename, toast severity (8eaa6a3)
- **s3:** Restore missing previewDict prop on ObjectTable (89606ea)

### Chore
- Release v0.3.0-alpha.0 (32c2756)

### Features
- **s3:** Add in-app file preview for objects (2e1053b)
- **s3:** Add drag-drop multi-file upload (PR 1/2 — Phases 1-3) (573027d)
- **s3:** Add DropZoneWrapper full-page drop zone and redesign upload dialog (88b1ec0)
## [0.2.0-alpha.0] - 2026-05-15

### Chore
- Release v0.2.0-alpha.0 (e4f60d4)

### Documentation
- **changelog:** Seed initial changelog from git history (378d65a)

### Features
- **changelog:** Add git-cliff config and local preview scripts (38b50e5)
## [0.1.0-alpha.0] - 2026-05-15

### Bug Fixes
- **tokens:** Wire Geist fonts and narrow primitive transitions (94b7ac7)
- **sns:** Wire shared dict for closeLabel on topic detail page (0a38473)

### Chore
- **test:** Add Vitest jsdom harness for UI specs (7330fd5)
- Remove unused dependencies from pnpm-lock.yaml (9a8ee9c)
- Release v0.1.0-alpha.0 (51f2b03)

### Documentation
- Sync design-system with shipped tokens, nav, and primitives (136bdf3)

### Features
- **ui:** Add Card and Textarea primitives (27e25a0)
- **ui:** Require localized closeLabel on DialogContent (858c9f0)
- **nav:** Highlight active route with sidebar-primary pill (817b169)
- **dialogs:** Pass closeLabel through all DialogContent sites (f104cc2)
- **s3:** Meet mobile touch targets on bucket and upload dialogs (a5e8b70)
- **sqs:** Align create-queue dialog and migrate send body to Textarea (f7fe2f6)
- **sns:** Align topic/subscribe dialogs and migrate publish body to Textarea (5ff1787)
- **dynamodb:** Align table dialogs with design tokens and Textarea primitive (5953833)
- **lambda:** Migrate invoke dialog payload to Textarea primitive (a30159c)

### Testing
- **s3:** Enforce rename success punctuation and placeholder keys (aaf3d3e)
- **s3:** Cover mobile touch targets and Spanish i18n punctuation (586d9e8)
- **sqs:** Cover touch targets, Textarea primitive, and Spanish i18n (2e6cd32)
## [0.0.1-alpha.0] - 2026-05-15

### Bug Fixes
- Add packageManager field for pnpm version in CI (d6ff588)
- Avoid S3 calls during static generation (f3a10dd)
- **sns:** Annotate ListTopicsCommandOutput to resolve TS7022 in do/while loop (adda38c)
- **s3:** Minimize upload progress modal by default on narrow viewports (37f7784)
- **sns:** Remove dead nameFifoSuffix i18n key and add server-only guard (5955682)
- **sns:** Upgrade revalidatePath scope, add server-only guard, disable subscribe submit when endpoint empty (29921fd)
- **sns:** Improve LAN endpoint hints and topic error UX (b3bb333)
- **ui:** Use onClick for Base UI dropdown menu items (65b103a)
- **sqs:** Map QueueNameExists to friendly error (9edcdd4)
- **sqs:** I18n create-queue validation and unit tests (28beccd)
- **dynamodb:** Fix TS cast in scan-table test for ScanCommandInput (2243f4f)
- **dynamodb:** Redirect to new table scan page after creation (8b8a62f)
- **dynamodb:** Show item CRUD on empty table detail pages (6d3d622)
- **api:** Use explicit route params instead of RouteContext (b92aa4f)
- **api:** Use explicit route params instead of RouteContext (e40bd7c)

### CI
- **release:** Add workflow_dispatch Docker release consumer (a725221)
- **docker:** Add PR smoke build and Docker usage docs (d324a79)
- Run build workflows only on pull_request (6d800b3)
- Run on pull_request and push to main only (f33836a)

### Chore
- First commit (6c47d2e)
- Add husky pre-commit/pre-push hooks and CI workflow (7bcd761)
- Add skills (7134871)
- **deps:** Add SQS SDK and Vitest for unit tests (bf98d7b)
- Update package version to 0.0.0 in package.json (04a2220)
- Release v0.0.1-alpha.0 (f0ced7f)

### Features
- Add foundation — deps, shadcn, types, client factory, shell layout (slice 1) (438476e)
- Add S3 read layer — list buckets, list objects, bucket/object tables (slice 2) (fc2a0af)
- **s3:** Add S3 write operations (Slice 3) (16d7799)
- **i18n:** Locale routing, proxy, and per-feature dictionaries (244de6e)
- Add Docker image, Next standalone output, and CI workflow (c4eefd8)
- **dashboard:** Mobile layout, zustand nav, and responsive S3 (139719c)
- **dashboard:** Add settings page for locale and endpoint (e35ed97)
- **sns:** Add SNS SDK dependency (2dc7e29)
- **sns:** Add per-feature client and error mapper (4639cae)
- **sns:** Add listTopics service (aa0587c)
- **sns:** Add createTopic and deleteTopic server actions (b25a1ed)
- **sns:** Add en/es i18n and register AppDict slice (b239f35)
- **sns:** Add TopicRowActions component (6760828)
- **sns:** Add TopicTable component (aff8aca)
- **sns:** Add CreateTopicDialog component (8915801)
- **sns:** Add SNS dashboard route and error boundary (a03559a)
- **sns:** Activate SNS in services registry (2bc8bd4)
- **s3:** Add rename object — server action, dialog, and i18n (162eff5)
- **s3:** Add upload progress modal with XHR tracking (fd223b0)
- Add claude design skills and files (2236189)
- Add new styles in globals.css (385f997)
- **sns:** Add FIFO topic creation support (895d2df)
- **sns:** Add topic detail page and ARN routing (d8f2fd0)
- **sns:** Add publish message dialog (e500999)
- **sns:** Add subscription management (list, subscribe, unsubscribe) (7e37ba3)
- **sqs:** List queues UI, routes, and i18n (slice 1) (0c395a6)
- **sqs:** Add create and delete queue actions (PR2) (ac331ba)
- **sqs:** Queue detail, attributes, send/receive/purge (PR3) (2b99362)
- **lambda:** Add Lambda foundation and localize server action strings (392ae33)
- **lambda:** Add Lambda UI — list, detail, invoke dialog, dashboard tile (d009dc2)
- **lambda:** Add foundation — validation lib, runtimes, stub-zip, error codes (a59ee9f)
- **lambda:** Add Create Function flow — dialog, server action, i18n, page refactor (c8b01e7)
- **lambda:** Add code upload flow — XHR helper, API route, dialog, wiring (c22a6bf)
- **dynamodb:** Install SDK packages and flip registry (67bd20b)
- **dynamodb:** Add i18n en+es, domain types, and extend AppDict (a2b6a03)
- **dynamodb:** Add dual client, errors helper, and route-codec with tests (062d79f)
- **dynamodb:** Implement list-tables service with TDD (eb798bf)
- **dynamodb:** Implement scan-table and get-item services with TDD (caa021b)
- **dynamodb:** Implement use-cases (create, delete, put, delete-item) with TDD (a144727)
- **dynamodb:** Add TableList and CreateTableDialog components (d67c19e)
- **dynamodb:** Add DeleteTableDialog component (d95c0f6)
- **dynamodb:** Add ScanTable, ItemViewDialog, PutItemDialog components (7bc1d65)
- **dynamodb:** Add DeleteItemButton and DynamoDBErrorPanel components (9e187c3)
- **dynamodb:** Add RSC pages for list and detail routes (6704129)
- **dynamodb:** Add error boundaries for list and detail routes (109d782)
- **dynamodb:** Map creationDateTime, billingMode, gsiCount in list-tables service (ad2470c)
- **dynamodb:** Add TableDetailPanel component, i18n keys, and wire to detail page (cb354af)
- **dynamodb:** Add updateItemAction server action with dynamic SET aliasing and i18n keys (6be4212)
- **dynamodb:** Add EditItemDialog component and Edit button to ScanTable row actions (1ce03bf)
- **dynamodb:** Add query mode with queryTable service and ScanTable refactor (b581fc5)
- **dynamodb:** S-03 table detail, update item, and query mode (58f59ae)

### Refactor
- Reorganize to screaming architecture by feature (a7b6369)
- Remove barrel index.ts files, use direct imports (c20af5f)
- Split actions and services into one file per function (6db2137)
- Folder-per-file for actions/services, extract ConfirmDialog to shared (aa8088c)
- Move types to feature-scoped and shared locations (36bfe2c)
- Rename actions/ to use-cases/ (ce3021e)
- **sqs:** Move lib modules into per-module folders (9e5cc17)

### Style
- **sqs:** Use wrap-break-word on list and stub headings (43019e5)

### Testing
- **dynamodb:** Add list-tables test cases for creationDateTime, billingMode, gsiCount (7aa245c)
- **dynamodb:** Add updateItemAction test suite (RED phase) (c3bbf60)

