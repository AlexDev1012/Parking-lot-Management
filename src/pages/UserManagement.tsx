import { useEffect, useState } from "react";
import { TextInput } from "@tremor/react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { UserType } from "../types";
import { Dialog } from "primereact/dialog";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

import { Button as PrimeButton } from "primereact/button";
import { confirmDialog } from "primereact/confirmdialog";
import moment from "moment";
import { useAppDispatch, useAppSelector } from "../redux/store";
import {
  fetchUsers,
  removeUser,
  setUserLevel,
  setUserStatus,
} from "../redux/slice/appReducer";
/* eslint-disable @typescript-eslint/no-explicit-any */

interface UserLevelType {
  roleType: string;
  roleValue: number;
}

const userLevels: UserLevelType[] = [
  {
    roleType: "Not Specified",
    roleValue: 0,
  },
  {
    roleType: "Super Admin",
    roleValue: 1,
  },
  {
    roleType: "End User",
    roleValue: 2,
  },
  {
    roleType: "Business Owner",
    roleValue: 3,
  },
];

const UserManagement = () => {
  const { users } = useAppSelector((state) => state.app);
  const dispatch = useAppDispatch();
  const [user, setUser] = useState<UserType | null>(null);
  const [filteredUser, setFilteredUser] = useState<UserType[]>();
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [filter, setFilter] = useState<number>(5);

  const handleRemove = async (uid: string) => {
    await dispatch(removeUser(uid)).unwrap();
    setUser(null);
    fetchData();
  };

  const fetchData = () => {
    dispatch(fetchUsers());
  };

  const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setGlobalFilterValue(value);
  };

  useEffect(() => {
    setFilteredUser(
      users.filter((u) => {
        if (filter === 5) return true;
        else return u.customClaims.level === filter;
      })
    );
  }, [users, filter]);

  const handleLevel = async (uid: string, level: number) => {
    await dispatch(setUserLevel({ uid, level })).unwrap();
    setUser(null);
    fetchData();
  };

  return (
    <div className="space-y-8 p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Header Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <i className="pi pi-users text-xl text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800">
                User Management
              </h1>
            </div>
            <p className="text-gray-600">
              Manage and monitor user accounts across the platform
            </p>
          </div>
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-lg">
              <i className="pi pi-users text-blue-600" />
              <span className="font-medium text-blue-700">{users.length}</span>
              <span className="text-blue-600">Users</span>
            </div>
            <PrimeButton
              icon="pi pi-refresh"
              onClick={() => dispatch(fetchUsers())}
              className="p-3 hover:shadow-md transition-all"
              severity="secondary"
              aria-label="Refresh"
            />
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="flex max-md:flex-col justify-between items-center gap-4">
          <div className="flex flex-wrap gap-2">
            <PrimeButton
              onClick={() => setFilter(1)}
              className="transition-all hover:shadow-md px-4 py-2"
              pt={{
                root: {
                  className: "bg-gradient-to-r from-purple-500 to-purple-600",
                },
              }}
            >
              <i className="pi pi-shield mr-2"></i>
              Super admin
            </PrimeButton>
            <PrimeButton
              onClick={() => setFilter(2)}
              color="yellow"
              className="transition-all hover:shadow-md px-4 py-2"
              pt={{
                root: {
                  className: "bg-gradient-to-r from-yellow-500 to-yellow-600",
                },
              }}
            >
              <i className="pi pi-users mr-2"></i>
              End Users
            </PrimeButton>
            <PrimeButton
              onClick={() => setFilter(3)}
              color="cyan"
              className="transition-all hover:shadow-md px-4 py-2"
              pt={{
                root: {
                  className: "bg-gradient-to-r from-cyan-500 to-cyan-600",
                },
              }}
            >
              <i className="pi pi-building mr-2"></i>
              Business Owners
            </PrimeButton>
            <PrimeButton
              onClick={() => setFilter(4)}
              color="gray"
              className="transition-all hover:shadow-md px-4 py-2"
              pt={{
                root: {
                  className: "bg-gradient-to-r from-gray-500 to-gray-600",
                },
              }}
            >
              <i className="pi pi-clock mr-2"></i>
              Pending Users
            </PrimeButton>
            <PrimeButton
              onClick={() => setFilter(5)}
              color="blue"
              className="transition-all hover:shadow-md px-4 py-2"
              pt={{
                root: {
                  className: "bg-gradient-to-r from-blue-500 to-blue-600",
                },
              }}
            >
              <i className="pi pi-list mr-2"></i>
              All
            </PrimeButton>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
        <div className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <div className="relative">
                <i className="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
                <TextInput
                  value={globalFilterValue}
                  onChange={onGlobalFilterChange}
                  placeholder="Search by email"
                  className="pl-10 w-full border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all rounded-lg"
                />
              </div>
              <span className="text-xs text-gray-500 mt-1 ml-1">
                {globalFilterValue
                  ? `Showing results for "${globalFilterValue}"`
                  : "Enter keywords to search"}
              </span>
            </div>
          </div>

          <DataTable
            onRowPointerDown={(e) => {
              setUser(users.filter((v) => v.uid === e.data.uid)[0]);
            }}
            stripedRows
            rowHover
            className="text-sm cursor-pointer"
            value={filteredUser}
            paginator
            rows={5}
            rowsPerPageOptions={[5, 10, 25, 50]}
            tableStyle={{ minWidth: "50rem" }}
            emptyMessage={
              <div className="text-center py-8">
                <i className="pi pi-inbox text-gray-400 text-4xl mb-4" />
                <p className="text-gray-600">No users found</p>
              </div>
            }
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} users"
            paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
            globalFilter={globalFilterValue}
            globalFilterFields={["email"]}
            pt={{
              wrapper: {
                className:
                  "overflow-hidden rounded-xl border-t border-gray-200",
              },
              thead: { className: "bg-gray-50" },
              paginator: {
                root: { className: "border-t border-gray-200 bg-gray-50" },
                pageButton: ({ context }: { context: any }) => ({
                  className: context.active
                    ? "bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                    : "hover:bg-gray-100 transition-colors",
                }),
              },
            }}
          >
            <Column
              body={(user: UserType) => (
                <img
                  className="rounded-full max-w-10 max-h-10 ml-1"
                  src={
                    user.photoURL ||
                    `${import.meta.env.VITE_API_PUBLIC_URL}/user.png`
                  }
                />
              )}
            ></Column>
            <Column
              header="Email"
              sortField="email"
              body={(user: UserType) => (
                <div className="flex justify-between gap-1">
                  <span>{user.email}</span>
                  <div className="flex gap-1">
                    {user.customClaims.level === 1 && (
                      <span className="p-2 bg-purple-600 text-white rounded-md text-xs">
                        Admin
                      </span>
                    )}
                    {user.customClaims.level === 2 && (
                      <span className="p-2 bg-yellow-600 text-white rounded-md text-xs">
                        User
                      </span>
                    )}
                    {user.customClaims.level === 3 && (
                      <span className="p-2 bg-cyan-600 text-white rounded-md text-xs">
                        Owner
                      </span>
                    )}
                    {user.emailVerified && (
                      <span className="p-2 bg-green-600 text-white rounded-md text-xs">
                        Verified
                      </span>
                    )}{" "}
                    {user.disabled && (
                      <span className="p-2 bg-red-600 text-white rounded-md text-xs">
                        Disabled
                      </span>
                    )}
                  </div>
                </div>
              )}
            ></Column>
            <Column field="displayName" header="User name"></Column>
            <Column
              header="Creation Time"
              body={(user: UserType) => (
                <span>
                  {moment(user.metadata.creationTime)
                    .tz("America/New_York")
                    .format("MM/DD/YYYY")}
                </span>
              )}
            ></Column>
            <Column
              header="Last Signin Time"
              body={(user: UserType) => (
                <span>
                  {moment(user.metadata.lastSignInTime)
                    .tz("America/New_York")
                    .format("MM/DD/YYYY")}
                </span>
              )}
            ></Column>
          </DataTable>
        </div>
      </div>

      {/* User Details Dialog */}
      {user && (
        <Dialog
          pt={{
            root: {
              className:
                "w-full md:w-[80vw] rounded-xl overflow-hidden shadow-2xl",
              style: { width: "60vw", maxHeight: "90vh" },
            },
            header: {
              className: "bg-gradient-to-r from-gray-50 to-white border-b p-6",
            },
            content: { className: "p-8 bg-gray-50" },
          }}
          header={
            <div className="w-full flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <i className="pi pi-user text-xl text-blue-600"></i>
                </div>
                <div>
                  <span className="text-xl font-semibold text-gray-800">
                    User Details
                  </span>
                  <p className="text-sm text-gray-600 mt-1">{user.email}</p>
                </div>
              </div>
            </div>
          }
          visible={!!user}
          onHide={() => setUser(null)}
        >
          <div className="flex flex-col gap-4 w-full max-w-[800px] mx-auto bg-white rounded-xl shadow-sm p-6">
            <Table
              sx={{
                "& .MuiTableCell-root": {
                  borderColor: "rgba(224, 224, 224, 1)",
                  padding: "16px",
                },
                "& .MuiTableHead-root": {
                  backgroundColor: "rgba(245, 247, 250, 1)",
                },
                "& .MuiTableRow-root:hover": {
                  backgroundColor: "rgba(245, 247, 250, 0.5)",
                },
              }}
              aria-label="user details table"
            >
              <TableHead>
                <TableRow>
                  <TableCell
                    width="30%"
                    align="center"
                    sx={{ fontWeight: "bold" }}
                  >
                    Property
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: "bold" }}>
                    Value
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell align="center">Avatar</TableCell>
                  <TableCell align="center">
                    <div className="flex justify-center items-center">
                      <img
                        className="rounded-full w-16 h-16 object-cover border-4 border-gray-100 shadow-sm"
                        src={
                          user.photoURL ||
                          `${import.meta.env.VITE_API_PUBLIC_URL}/user.png`
                        }
                        alt="User avatar"
                      />
                    </div>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell align="center">Role</TableCell>
                  <TableCell align="center">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex gap-2 items-center">
                        {user.customClaims.level === 1 && (
                          <span className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                            Super Admin
                          </span>
                        )}
                        {user.customClaims.level === 2 && (
                          <span className="px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                            End User
                          </span>
                        )}
                        {user.customClaims.level === 3 && (
                          <span className="px-3 py-1.5 bg-cyan-100 text-cyan-700 rounded-full text-xs font-medium">
                            Business Owner
                          </span>
                        )}
                      </div>
                      <Dropdown
                        value={userLevels.find(
                          (u) => u.roleValue === user.customClaims.level
                        )}
                        onChange={(e: DropdownChangeEvent) =>
                          handleLevel(user.uid, e.value.roleValue)
                        }
                        options={userLevels}
                        optionLabel="roleType"
                        placeholder="Change Role"
                        className="w-48 shadow-sm"
                        pt={{
                          root: {
                            className: "border border-gray-200 rounded-lg",
                          },
                          item: { className: "hover:bg-gray-50" },
                        }}
                      />
                    </div>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="center">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex gap-2 items-center">
                        {user.disabled ? (
                          <span className="px-3 py-1.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                            Disabled
                          </span>
                        ) : (
                          <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                            Active
                          </span>
                        )}
                      </div>
                      <button
                        onClick={async () => {
                          await dispatch(
                            setUserStatus({
                              uid: user.uid,
                              status: !user.disabled,
                            })
                          ).unwrap();
                          setUser(null);
                          fetchData();
                        }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
                          ${
                            user.disabled
                              ? "bg-green-600 hover:bg-green-700 text-white"
                              : "bg-red-600 hover:bg-red-700 text-white"
                          }`}
                      >
                        {user.disabled ? "Enable User" : "Disable User"}
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell width="30%" align="center">
                    Email
                  </TableCell>
                  <TableCell align="center">{user.email}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell width="30%" align="center">
                    Display Name
                  </TableCell>
                  <TableCell align="center">{user.displayName}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell width="30%" align="center">
                    Creation Time
                  </TableCell>
                  <TableCell align="center">
                    {new Date(user.metadata.creationTime || "").toLocaleString(
                      "en-us"
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell width="30%" align="center">
                    Last Sign In Time
                  </TableCell>
                  <TableCell align="center">
                    {new Date(
                      user.metadata.lastSignInTime || ""
                    ).toLocaleString("en-us")}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell width="30%" align="center">
                    Last Refresh Time
                  </TableCell>
                  <TableCell align="center">
                    {new Date(
                      user.metadata.lastRefreshTime || ""
                    ).toLocaleString("en-us")}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <PrimeButton
              severity="danger"
              className="flex justify-center items-center w-full p-button-text p-danger"
              onClick={() =>
                confirmDialog({
                  message: "Are you sure you want to remove this user?",
                  header: "Delete Confirmation",
                  icon: "pi pi-exclamation-triangle",
                  accept: () => handleRemove(user?.uid),
                })
              }
            >
              <p className="flex items-center justify-center gap-2">
                <i className="pi pi-trash mr-2"></i>
                Remove User
              </p>
            </PrimeButton>
          </div>
        </Dialog>
      )}
    </div>
  );
};

export default UserManagement;
