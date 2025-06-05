import React, {lazy, Suspense } from "react";
import i18next from "i18next";
import { BrowserRouter as Router, Route, } from "react-router-dom";
import  NavbarComponent  from "./components/navbar/Navbar"
import DashboardPage from "./containers/Dashboard";
import HomePage from "./containers/HomePage";
const SchedulePageComponent = lazy(() => import("./containers/schedulePage"));
// import { schulde_page } from './containers/SchudlePage';
   // import { schulde_page } from './containers/SchudlePage';
const RubricsListComponent = lazy(() =>
    import("./containers/RubricsPage")
    );

    const RubricsCreateComponent = lazy(() =>
        import("./containers/RubricsCreate")
        );
        const ScormFileComponent = lazy(() =>
            import("./containers/ScormFile.js")
            );
    
        const RubricsListViewComponent = lazy(() =>
            import("./containers/RubricsListView")
            );
            const PlagiarismDetectionComponent = lazy(() =>
                import("./containers/PlagiarismDetection.js")
                );
                const ExternalToolPage = lazy(() =>
                    import("./containers/ExternalDetctTool.js")
                    );
    
        

export const RouterSetup = () => {
    return (
        <Suspense fallback={<div>{i18next.t("translate:LOADING")}</div>}>
            <Router basename="/lms#">
                <Route exact path='/lms'>
                    <NavbarComponent />
                    <DashboardPage />
                </Route>
                <Route path='/home-page'>
                    <NavbarComponent />
                    <HomePage />
                </Route>
                <Route path='/Schedule-page'>
                    <NavbarComponent />
                    <SchedulePageComponent />
                </Route>
                <Route exact path='/dashboard-page'>
                    <NavbarComponent />
                    <DashboardPage />
                </Route>
                <Route exact path='/Rubrics-page'>
                    <NavbarComponent />
                    <RubricsListComponent />
                </Route>
                <Route exact path='/Rubrics-create'>
                    <NavbarComponent />
                    <RubricsCreateComponent />
                </Route>
                <Route exact path='/scorm-File'>
                    <NavbarComponent />
                    <ScormFileComponent />
                </Route>
                <Route exact path='/Rubrics-listview'>
                    <NavbarComponent />
                    <RubricsListViewComponent />
                </Route>
                <Route exact path='/plagiarismdetectioncomponent-file'>
                    <NavbarComponent />
                    <PlagiarismDetectionComponent />
                </Route>
                <Route exact path='/externaltoolpage-file'>
                    <NavbarComponent />
                    <ExternalToolPage />
                </Route>

                <Route path='/home-page/content-page'>
                    <NavbarComponent />
                    {/* <HomePage /> */}
                </Route>


                {/* <Route path='/schulde_page'>
                    <NavbarComponent />
                    <HomePage />
                </Route>
                <Route path='/infocontent_page'>
                    <NavbarComponent />
                    <HomePage />
                </Route>
                <Route path='/tablelist_page'>
                    <NavbarComponent />
                    <HomePage />
                </Route>
                <Route path='/calenderlist_page'>
                    <NavbarComponent />
                    <HomePage />
                </Route>
                <Route path='/info-banner_page'>
                    <NavbarComponent />
                    <HomePage />
                </Route>
                <Route path='/message_page'>
                    <NavbarComponent />
                    <HomePage />
                </Route> */}
            </Router>
        </Suspense> 
    );
};
