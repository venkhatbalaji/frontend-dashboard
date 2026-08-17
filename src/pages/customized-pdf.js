import CustomizedPdf from '@/views/CustomizedPdf';
import Private from '@/routeGuards/PrivateRoute';
import Main from '@/layouts/Main';

const customizedPdf = () => null;

customizedPdf.View = CustomizedPdf;
customizedPdf.RouteGuard = Private;
customizedPdf.Layout = Main;
customizedPdf.Name = "Customized_PDF";

export default customizedPdf;

