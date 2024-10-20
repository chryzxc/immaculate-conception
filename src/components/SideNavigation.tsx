import {
  IconBellRinging,
  IconBuildingChurch,
  IconCheck,
  IconCross,
  IconDroplet,
  IconFlower,
  IconHeart,
  IconLayoutDashboard,
  IconLogout,
} from "@tabler/icons-react";
import { useLocation, useNavigate } from "react-router-dom";

import { routes } from "../constants/routes";
import useUserStore from "../store/user";
import classes from "../styles/SideNavigation.module.css";

const data = [
  { link: routes.dashboard, label: "Dashboard", icon: IconLayoutDashboard },
  { link: routes.priests, label: "Priests", icon: IconCross },
  { link: routes.mass, label: "Mass", icon: IconBuildingChurch },
  { link: routes.baptism, label: " Baptism", icon: IconDroplet },
  { link: routes.confirmation, label: "Confirmations", icon: IconCheck },
  { link: routes.wedding, label: "Wedding", icon: IconHeart },
  { link: routes.funeral, label: "Funeral", icon: IconFlower },
  // { link: routes.schedules, label: "Schedules", icon: IconCalendarCheck },
  { link: routes.announcements, label: "Announcements", icon: IconBellRinging },
];

export default function SideNavigation() {
  const { logout } = useUserStore();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    logout();
  };

  const isActive = (link: string) => {
    if (link === routes.dashboard)
      return location?.pathname === routes.dashboard;

    return location?.pathname.includes(link);
  };

  const links = data.map((item) => (
    <a
      className={classes.link}
      data-active={isActive(item.link) || undefined}
      // href={item.link}
      onClick={() => navigate(item.link)}
      key={item.label}
    >
      <item.icon className={classes.linkIcon} stroke={1.5} />
      <span>{item.label}</span>
    </a>
  ));

  return (
    <nav className={classes.navbar}>
      <div className={classes.navbarMain}>{links}</div>

      <div className={classes.footer}>
        {/* <a href="#" className={classes.link} onClick={(event) => event.preventDefault()}>
                    <IconSwitchHorizontal className={classes.linkIcon} stroke={1.5} />
                    <span>Change account</span>
                </a> */}

        <a href="#" className={classes.link} onClick={handleLogout}>
          <IconLogout className={classes.linkIcon} stroke={1.5} />
          <span>Logout</span>
        </a>
      </div>
    </nav>
  );
}
