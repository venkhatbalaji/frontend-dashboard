import Hub from '@/views/Hub';
import Private from '@/routeGuards/PrivateRoute';
import HubLayout from '@/layouts/Hub';

const hub = () => null;

hub.View = Hub;
hub.RouteGuard = Private;
hub.Layout = HubLayout;
hub.Name = "Dashboard_Hub"

export default hub;
