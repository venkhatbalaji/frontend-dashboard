import GeneralKpis from '@/views/GeneralKpis';
import Private from '@/routeGuards/PrivateRoute';
import Main from '@/layouts/Main';
import withPageLoadDelay from '@/hocs/withPageLoadDelay';

const PageWithDelayHOC = withPageLoadDelay(GeneralKpis);

const activeGeneral = () => null;

activeGeneral.View = PageWithDelayHOC;
activeGeneral.RouteGuard = Private;
activeGeneral.Layout = Main;
activeGeneral.Name = "General_Indicators"

export default activeGeneral;
