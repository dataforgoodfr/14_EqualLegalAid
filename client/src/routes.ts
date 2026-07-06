import {
  type RouteConfig,
  route, index
  } from "@react-router/dev/routes";

export default [
  // index("./routeModules/CaseLawWithProvider.tsx"),
  route("/advocacy", "./pages/StatisticPage.tsx", 
    [
      index("./pages/StatisticsPage/AsylumApplicationsInEuropePage.tsx",),
      //   route("AsylumApplicationsInEuropeanUnion", "./pages/StatisticsPage/AsylumApplicationsInEuropeanUnionPage.tsx"),
      //   route("ArrivalsInGreece", "./pages/StatisticsPage/ArrivalsInGreecePage.tsx"),
      //   route("AsylumApplicationsEvolutionInGreece", "./pages/StatisticsPage/AsylumApplicationsEvolutionInGreecePage.tsx"),
      //   route("ProtectionGrantedVsRejected", "./pages/StatisticsPage/ProtectionGrantedVsRejectedPage.tsx"),
    ]
  ),
  // * matches all URLs, the ? makes it optional so it will match / as well
  route("*?", "./pages/WrongRoutePage.tsx"), // we can keep this during debug, to catch wrong routes
] satisfies RouteConfig;