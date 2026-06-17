import {
  type RouteConfig,
  route,
  } from "@react-router/dev/routes";

export default [
  route("/caselaw", "./routeModules/CaseLawWithProvider.tsx"),
  route("/statistic", "./routeModules/Statistic.tsx",[
    route("AsylumApplicationsInEurope", "./pages/StatisticsPage/AsylumApplicationsInEuropePage.tsx"),
    route("AsylumApplicationsInEuropeanUnion", "./pages/StatisticsPage/AsylumApplicationsInEuropeanUnionPage.tsx"),
    route("ArrivalsInGreece", "./pages/StatisticsPage/ArrivalsInGreecePage.tsx"),
    route("AsylumApplicationsEvolutionInGreece", "./pages/StatisticsPage/AsylumApplicationsEvolutionInGreecePage.tsx"),
    route("ProtectionGrantedVsRejected", "./pages/StatisticsPage/ProtectionGrantedVsRejectedPage.tsx"),
  ]),
  // * matches all URLs, the ? makes it optional so it will match / as well
  route("*?", "./routeModules/catchall.tsx"),
] satisfies RouteConfig;