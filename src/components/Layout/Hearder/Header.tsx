import { FC, useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Badge,
  IconButton,
  Popover,
  List,
  ListItem,
  Divider,
  ListItemText,
  Typography,
} from "@mui/material";
import {
  useAppSelector,
  useAppDispatch,
  RootState,
} from "../../../redux/store";

import { Textarea } from "@tremor/react";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";

import {
  showToast,
  connectSocket,
  disconnectSocket,
  subscribeToMessages,
  unsubscribeFromMessages,
} from "../../../utils";

import axios from "axios";
import { MessageType } from "../../../types";
import { logout } from "../../../redux/slice/authReducer";
import { setSideBarOpen } from "../../../redux/slice/appReducer";
import PlateSearch from "./PlateSearch";

const Header: FC = () => {
  const toast = useRef<Toast>(null);
  const dispatch = useAppDispatch();
  const user = useAppSelector((state: RootState) => state.auth.user);
  const sideBarOpen = useAppSelector(
    (state: RootState) => state.app.sideBarOpen
  );

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [message, setMessage] = useState<string>("");
  const [mBadge, setMBadge] = useState<number>(0);
  const [aBadge, setABadge] = useState<number>(0);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [lestItems, setListItems] = useState<any>([]);

  const alarms = [
    {
      sender: "test 1",
      content: "This is a test alarm",
    },
  ];

  const handleMessageView = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    setListItems(messages);
    setMBadge(0);
  };

  const handleAlarmView = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    setListItems(alarms);
    setABadge(0);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const submitMessage = async () => {
    const res = await axios.post("/message", { message, sender: user?.email });
    if (res.status === 201)
      showToast("Your message was sent to server successfully", true);
    else showToast("Something went wrong", false);
    setMessage("");
    setAnchorEl(null);
  };

  const fetchMessages = async () => {
    const { data } = await axios.get<MessageType[]>("/message");
    setMessages(data);
  };

  useEffect(() => {
    user && connectSocket();

    user?.customClaims.level === 1 && fetchMessages();

    user?.customClaims.level === 1 &&
      subscribeToMessages(async () => {
        await fetchMessages();

        setMBadge((preValue) => preValue + 1);
      });

    return () => {
      unsubscribeFromMessages();
      disconnectSocket();
    };
  }, []);

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  return (
    <div className="w-full h-[90px] bg-white shadow-lg border-b border-gray-200 fixed top-0 z-50">
      <div className="h-full px-6 flex justify-between items-center max-w-[1920px] mx-auto">
        {/* Left Section */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => dispatch(setSideBarOpen(!sideBarOpen))}
            className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors"
            aria-label="Toggle Menu"
          >
            <i className="pi pi-bars text-gray-600 text-xl" />
          </button>

          <Link to="/" className="flex items-center gap-3">
            <img src="./newLogo.png" alt="Logo" className="h-12 w-auto" />
            <div className="hidden md:block">
              <h1 className="text-xl font-bold text-gray-800">
                City Park Authority
              </h1>
              <p className="text-sm text-gray-600">Parking Management System</p>
            </div>
          </Link>
        </div>
        {user?.customClaims.level === 1 && <PlateSearch />}

        {/* Right Section */}
        {user && (
          <div className="flex items-center gap-4">
            {/* Messages */}
            <div className="relative">
              <IconButton
                onClick={handleMessageView}
                className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <Badge
                  badgeContent={user?.customClaims.level === 1 ? mBadge : 0}
                  color="info"
                  className="transform scale-90"
                >
                  <i className="pi pi-envelope text-gray-600 text-xl" />
                </Badge>
              </IconButton>

              <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                className="mt-2"
                PaperProps={{
                  className: "rounded-xl shadow-xl border border-gray-200",
                }}
              >
                {user?.customClaims.level === 1 ? (
                  <List className="w-[320px] max-h-[400px] overflow-y-auto">
                    {lestItems.length ? (
                      lestItems.map((item: any, index: number) => (
                        <div key={index}>
                          <ListItem className="hover:bg-gray-50">
                            <ListItemText
                              primary={
                                <span className="font-medium text-gray-800">
                                  {item.content}
                                </span>
                              }
                              secondary={
                                <span className="text-gray-600 text-sm">
                                  {item.sender}
                                </span>
                              }
                            />
                          </ListItem>
                          <Divider component="li" />
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center">
                        <i className="pi pi-inbox text-4xl text-gray-400 mb-2" />
                        <p className="text-gray-600">No messages</p>
                      </div>
                    )}
                  </List>
                ) : (
                  <div className="p-6 w-[320px]">
                    <Typography variant="h6" className="mb-4 text-gray-800">
                      How can we help you?
                    </Typography>
                    <Textarea
                      placeholder="Type your message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full mb-4 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      maxLength={60}
                    />
                    <Button
                      onClick={submitMessage}
                      disabled={!message}
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl py-2.5"
                    >
                      <i className="pi pi-send mr-2" />
                      Send Message
                    </Button>
                  </div>
                )}
              </Popover>
            </div>

            {/* Notifications */}
            {user?.customClaims.level === 1 && (
              <IconButton
                onClick={handleAlarmView}
                className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <Badge
                  badgeContent={aBadge}
                  color="error"
                  className="transform scale-90"
                >
                  <i className="pi pi-bell text-gray-600 text-xl" />
                </Badge>
              </IconButton>
            )}

            {/* User Profile and Logout */}
            <div className="flex items-center gap-4">
              <div className="hidden md:flex flex-col items-end">
                <p className="font-medium text-gray-800">
                  {user?.displayName || "User"}
                </p>
                <p className="text-sm text-gray-600">{user?.email}</p>
              </div>
              <img
                src={
                  user?.photoURL ||
                  `${import.meta.env.VITE_API_PUBLIC_URL}/user.png`
                }
                alt="Profile"
                className="w-10 h-10 rounded-xl object-cover border-2 border-gray-200"
              />
              <button
                onClick={() => dispatch(logout())}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors"
                aria-label="Logout"
              >
                <i className="pi pi-sign-out text-red-600" />
                <span className="hidden md:inline">Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <Toast ref={toast} />
    </div>
  );
};

export default Header;
