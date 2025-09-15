/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as aiAssistant from "../aiAssistant.js";
import type * as dashboard from "../dashboard.js";
import type * as demandPlanner from "../demandPlanner.js";
import type * as files from "../files.js";
import type * as http from "../http.js";
import type * as pdpAnalyzer from "../pdpAnalyzer.js";
import type * as reports from "../reports.js";
import type * as specGenerator from "../specGenerator.js";
import type * as stripe from "../stripe.js";
import type * as suiteAnalyzer from "../suiteAnalyzer.js";
import type * as suiteAnalyzerBackend from "../suiteAnalyzerBackend.js";
import type * as suiteAnalyzerSimple from "../suiteAnalyzerSimple.js";
import type * as users from "../users.js";
import type * as webhooks from "../webhooks.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  aiAssistant: typeof aiAssistant;
  dashboard: typeof dashboard;
  demandPlanner: typeof demandPlanner;
  files: typeof files;
  http: typeof http;
  pdpAnalyzer: typeof pdpAnalyzer;
  reports: typeof reports;
  specGenerator: typeof specGenerator;
  stripe: typeof stripe;
  suiteAnalyzer: typeof suiteAnalyzer;
  suiteAnalyzerBackend: typeof suiteAnalyzerBackend;
  suiteAnalyzerSimple: typeof suiteAnalyzerSimple;
  users: typeof users;
  webhooks: typeof webhooks;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
