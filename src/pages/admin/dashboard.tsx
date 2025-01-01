import { HiTrendingDown, HiTrendingUp } from "react-icons/hi";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { BarChart } from "../../components/admin/Charts.tsx";
import Table from "../../components/admin/DashboardTable.tsx";
import { useStatsQuery } from "../../redux/api/dashboardAPI.ts";
import { useSelector } from "react-redux";
import { RootState, server } from "../../redux/store.ts";
import { Skeleton } from "../../components/Loader.tsx";
import { Navigate } from "react-router-dom";
import { getLastMonths } from "../../utils/features.ts";
import Switch from "../../components/Switch.tsx";
import { useCallback, useEffect, useState } from "react";
import { throttle } from 'lodash';
import axios from "axios";
import toast from "react-hot-toast";

// const userImg = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJxA5cTf-5dh5Eusm0puHbvAhOrCRPtckzjA&usqp";

const {last6Months: months} = getLastMonths();

const Dashboard = () => {

  const {user} = useSelector((state: RootState) => state.userReducer);
  const {isLoading, data, isError} = useStatsQuery(user?._id!);

  const [isChecked, setIsChecked] = useState<boolean>(true);

  useEffect(() => {
    // Fetch initial state from backend on component mount
    const fetchInitialState = async () => {
      try {
        const response = await axios.get(`${server}/api/v1/dashboard/orderStatus`);
        setIsChecked(response.data.orderStatusInfo);
        // console.log('ORDER STATUS INFO: ', response.data.orderStatusInfo);
      } catch (error) {
        toast.error('Failed to fetch initial button state');
        // console.log('Failed to fetch initial button state', error);
      }
    };
    fetchInitialState();
  }, []);

  // Only call the function once per second
  const throttledUpdateBackend = useCallback(
    throttle(async (value: boolean) => {
      try {
        await axios.patch(`${server}/api/v1/dashboard/orderStatus?id=${user?._id}`, { 
          id: user?._id, 
          isEnabled: value
        });
        toast.success("Successfully updated Order Status")
      } catch (error) {
        toast.error('Failed to update Order Status');
        // console.log('STATUS POST ERROR: ', error);
      }
    }, 1000, { trailing: false }), 
    []
  );

  const handleToggle = () => {
    const newValue = !isChecked;
    setIsChecked(newValue);
    throttledUpdateBackend(newValue);
  };

  const stats = data?.stats!;

  if(isError) return <Navigate to={"/"} />

  return (
    <div className="admin-container">
      <AdminSidebar />
      <main className="dashboard">
        {
          isLoading ? <Skeleton length={30} /> : (
          <>
            {/* <div className="bar">
              <BsSearch />
              <input type="text" placeholder="Search for data, users, docs" />
              <FaRegBell />
              <img src={user?.photo || userImg} alt="User" />
            </div> */}
            <div className="switch-orders-status">
              <h2>Order Status</h2>
              <div className="switch-orders-button">
                <h3 style={{color: 'grey'}}>Off</h3>
                <Switch
                  checked={isChecked}
                  onChange={handleToggle}
                />
                <h3 style={{color: '#1e90ff'}}>On</h3>
              </div>
            </div>

            <section className="widget-container">
              <WidgetItem
                percent={stats.changePercent.revenue}
                amount={true}
                value={stats.count.revenue}
                heading="Revenue"
                color="rgb(0, 115, 255)"
              />
              <WidgetItem
                percent={stats.changePercent.user}
                value={stats.count.user}
                color="rgb(0 198 202)"
                heading="Users"
              />
              <WidgetItem
                percent={stats.changePercent.order}
                value={stats.count.order}
                color="rgb(255 196 0)"
                heading="Transactions"
              />

              <WidgetItem
                percent={stats.changePercent.product}
                value={stats.count.product}
                color="rgb(76 0 255)"
                heading="Products"
              />
            </section>

            <section className="graph-container">
              <div className="revenue-chart">
                <h2>Revenue & Transaction</h2>
                <BarChart
                  labels={months}
                  data_1={stats.chart.revenue}
                  data_2={stats.chart.order}
                  title_1="Revenue"
                  title_2="Transaction"
                  bgColor_1="rgb(0, 115, 255)"
                  bgColor_2="rgba(53, 162, 235, 0.8)"
                />
              </div>

              <div className="dashboard-categories">
                <h2>Inventory</h2>

                <div>
                  {stats.categoryCount.map((i) => {
                    const [heading, value] = Object.entries(i)[0];
                    return (
                      <CategoryItem
                        key={heading}
                        value={value}
                        heading={heading}
                        color={`hsl(${value * 4}, ${value}%, 50%)`}
                      />
                    )
                  })}
                </div>
              </div>
            </section>

            <section className="transaction-container">
              {/* <div className="gender-chart">
                <h2>Gender Ratio</h2>
                <DoughnutChart
                  labels={["Female", "Male"]}
                  data={[stats.userRatio.female, stats.userRatio.male]}
                  backgroundColor={[
                    "hsl(340, 82%, 56%)",
                    "rgba(53, 162, 235, 0.8)",
                  ]}
                  cutout={90}
                />
                <p>
                  <BiMaleFemale />
                </p>
              </div> */}
              <Table data={stats.latestTransactions} />
            </section>
          </>
          )
        }
      </main>
    </div>
  );
};

interface WidgetItemProps {
  heading: string;
  value: number;
  percent: number;
  color: string;
  amount?: boolean;
}

const WidgetItem = ({
  heading,
  value,
  percent,
  color,
  amount = false,
}: WidgetItemProps) => (
  <article className="widget">
    <div className="widget-info">
      <p>{heading}</p>
      <h4>{amount ? `₹${value}` : value}</h4>
      {percent > 0 ? (
        <span className="green">
          <HiTrendingUp /> +{`${percent > 10000 ? 9999 : percent}%`}
        </span>
      ) : (
        <span className="red">
          <HiTrendingDown /> {`${percent < -10000 ? -9999 : percent}%`}
        </span>
      )}
    </div>

    <div
      className="widget-circle"
      style={{
        background: `conic-gradient(
        ${color} ${(Math.abs(percent) / 100) * 360}deg,
        rgb(255, 255, 255) 0
      )`,
      }}
    >
      <span
        style={{
          color,
        }}
      >
        {percent >= 0 && `${percent > 10000 ? 9999 : percent}%`}
        {percent < 0 && `${percent < -10000 ? -9999 : percent}%`}
      </span>
    </div>
  </article>
);

interface CategoryItemProps {
  color: string;
  value: number;
  heading: string;
}

const CategoryItem = ({ color, value, heading }: CategoryItemProps) => (
  <div className="category-item">
    <h5>{heading}</h5>
    <div>
      <div
        style={{
          backgroundColor: color,
          width: `${value}%`,
        }}
      ></div>
    </div>
    <span>{value}%</span>
  </div>
);

export default Dashboard;
