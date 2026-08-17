import FamilyTreeView from "@/views/FamilyTree";
import Private from "@/routeGuards/PrivateRoute";
import Main from "@/layouts/Main";
import withPageLoadDelay from "@/hocs/withPageLoadDelay";

const PageWithDelayHOC = withPageLoadDelay(FamilyTreeView);

const familyTree = () => null;

familyTree.View = PageWithDelayHOC;
familyTree.RouteGuard = Private;
familyTree.Layout = Main;
familyTree.Name = "Family_Tree";

export default familyTree;
