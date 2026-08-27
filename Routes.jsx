// filepath: /C:/Users/DELL/OneDrive/Desktop/360eye admin panel/Routes.jsx
import { createHashRouter } from "react-router-dom";
import Error from "./src/components/common/Error";
import SignIn from "./src/pages/SignIn";
import AddAlbum from "./src/pages/album/AddAlbumPage";
import AddImage from "./src/pages/album/AddImage";
import Add360Product from "./src/pages/360 Product/Add360Product";
import SEO from "./src/pages/SEO";
import SliderTable from "./src/components/slider/SliderTable";
import AddSlider from "./src/pages/slider/AddSlider";
import Enquiry from "./src/pages/Enquiry";
import PageRedirect from "./src/pages/PageRedirect";
import EmailSetting from "./src/pages/EmailSetting";
import AllowedDomains from "./src/pages/AllowedDomains";
import ChangePassword from "./src/pages/ChangePassword";
import AddProduct from "./src/pages/product/AddProduct";
import AddCommercial from "./src/pages/product/Commercial";
import DashboardLayout from "./src/pages/DashboardLayout";
import ProperyType from "./src/pages/property/ProperyTypePage";
import FiltersPage from "./src/pages/filters/FiltersPage";
// import CareersPage from "./src/pages/careers/CareersPage";
import PartnersPage from "./src/pages/partners/PartnersPage";
import ProtectedRoute from "./src/protectRoute/ProtectedRoute";
import CategoryPage from "./src/pages/category/CategoryPage";
import PropertyStatusPage from "./src/pages/property/PropertyStatusPage";
import ProductTable from "./src/components/products/ProductTable";
import CommerceTable from "./src/components/commercial/CommerceTable";
import Product360Table from "./src/components/products/Product360Table";
import AriaPage from "./src/pages/AreaPage";
import UploadZIP from "./src/pages/album/UploadZIP";
// import BlogTable from "./src/pages/Blog/BlogTable";
// import AddBlog from "./src/pages/Blog/AddBlog";
import ClientAccessTable from "./src/pages/ClientAccess/ClientAccessTable";
import AddClientAccess from "./src/pages/ClientAccess/AddClientAccess";

export const router = createHashRouter([
  {
    path: "/admin",
    element: <SignIn />,
  },
  {
    path: "/",
    element: <ProtectedRoute><DashboardLayout /></ProtectedRoute>,
    children: [
      {
        path: "product/addProduct",
        element: <AddProduct />,
      },
      {
        path: "product/addcommercial",
        element: <AddCommercial />,
      },
      {
        path: "product/editProduct/:id",
        element: <AddProduct isEditing />,
      },
      {
        path: "product/editcommercial/:id",
        element: <AddCommercial isEditing />,
      },  
      {
        path: "/",
        element: <ProductTable />,
      },
      {
        path: "managecommercial",
        element: <CommerceTable />,
      },
      {
        path: "360products/all",
        element: <Product360Table />,
      },
      {
        path: "360products/add360Product",
        element: <Add360Product />,
      },
      {
        path: "360products/edit/:id",
        element: <Add360Product isEditing />,
      },
      {
        path: "album/addAlbum",
        element: <AddAlbum />,
      },
      {
        path: "album/addImage",
        element: <AddImage />,
      },
      {
        path: "album/uploadZip",
        element: <UploadZIP />,
      },
      {
        path: "seo",
        element: <SEO />,
      },
      {
        path: "area",
        element: <AriaPage />
      },
      {
        path: "addMainCategory",
        element: <CategoryPage />,
      },
      {
        path: "slider",
        element: <SliderTable />,
      },
      {
        path: "slider/add",
        element: <AddSlider />,
      },
      {
        path: "slider/edit/:id",
        element: <AddSlider isEditing />,
      },
      {
        path: "enquiry",
        element: <Enquiry />,
      },
      {
        path: "pageRedirect",
        element: <PageRedirect />,
      },
      {
        path: "emailSetting",
        element: <EmailSetting />,
      },
      {
        path: "security/allowed-domains",
        element: <AllowedDomains />,
      },
      {
        path: "changePassword",
        element: <ChangePassword />,
      },
      {
        path: "/property/propertyType",
        element: <ProperyType />
      },
      {
        path: "/property/propertyStatus",
        element: <PropertyStatusPage />
      },
      {
        path: "filters",
        element: <FiltersPage />
      },
      /* {
        path: "careers",
        element: <CareersPage />
      }, */
      {
        path: "partners",
        element: <PartnersPage />
      },
      /* {
        path: "blog",
        element: <BlogTable />
      },
      {
        path: "blog/add",
        element: <AddBlog />
      },
      {
        path: "blog/edit/:id",
        element: <AddBlog isEditing />
      }, */
      {
        path: "client-access",
        element: <ClientAccessTable />
      },
      {
        path: "client-access/add",
        element: <AddClientAccess />
      },
      {
        path: "client-access/edit/:id",
        element: <AddClientAccess isEditing />
      }
    ]
  },
  {
    path: "*",
    element: <Error />,
  },
]);













