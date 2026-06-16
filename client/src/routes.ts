import {
  type RouteConfig,
  route,
} from "@react-router/dev/routes";

export default [
  route("/caselaw", "./routeModules/CaseLawWithProvider.tsx"),
  route("/statistic", "./routeModules/Statistic.tsx"),
  // * matches all URLs, the ? makes it optional so it will match / as well
  route("*?", "./routeModules/catchall.tsx"),
] satisfies RouteConfig;