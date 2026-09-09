import Sidebar from './Sidebar';
import TopBar from './TopBar';

const Layout = ({ title = '', children }) => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopBar title={title} />
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
