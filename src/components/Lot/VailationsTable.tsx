import { ChangeEvent, useState } from "react";
import { DataTable } from "primereact/datatable";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Column } from "primereact/column";
import { ConfirmPopup, confirmPopup } from "primereact/confirmpopup";
import { LotType, UserType, ValidationType } from "../../types";
import { showToast } from "../../utils";
import axios from "axios";

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function ValidationsTable({
  lot,
  users,
  fetchLots,
}: {
  lot: LotType;
  users: UserType[];
  fetchLots: () => void;
}) {
  const [validation, setValidation] = useState<ValidationType>({
    user: "",
    duration: 0,
    price: 0,
  });

  const renderDelete = (item: ValidationType) => (
    <button
      onClick={(e) =>
        confirmPopup({
          target: e.currentTarget,
          message: "Do you want to delete this record?",
          accept: () => handleDelete(item),
          reject: () => {},
          defaultFocus: "reject",
          acceptClassName: "p-danger",
        })
      }
      className="max-md:w-full px-4 py-2 bg-red-500 text-white text-sm hover:opacity-80 transition-all ease-in-out rounded-md"
    >
      Delete
    </button>
  );

  const handleDelete = async (item: ValidationType) => {
    try {
      await axios.put(`/lot/${lot._id}`, {
        validations: lot.validations.filter((v) => v._id !== item._id),
      });
      showToast("Validation deleted successfully", true);
      await fetchLots();
    } catch (error) {
      showToast("Error deleting validation");
    }
  };

  const handleCreate = async () => {
    if (validation.duration < 0 || validation.duration >= 10) {
      showToast("Please enter a duration between 0 and 10");
      return;
    }
    if (validation.price < 0) {
      showToast("Enter a price starting from 0");
      return;
    }
    if (!validation.user) {
      showToast("Please select a User");
      return;
    }

    try {
      await axios.put(`/lot/${lot._id}`, {
        validations: [...lot.validations, validation],
      });
      showToast("Validation added successfully", true);
      setValidation({ user: "", duration: 0, price: 0 });
      await fetchLots();
    } catch {
      showToast("Error adding validation");
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setValidation((prevState) => ({
      ...prevState,
      [name]: value ? Number(value) : 0, // Convert value to a number
    }));
  };

  return (
    <>
      <div className="card flex flex-column md:flex-row gap-3">
        <InputText
          placeholder="Duration"
          onChange={handleChange}
          name="duration"
          type={"number"}
          min={0}
          max={10}
          value={validation.duration.toString()}
          className="p-inputgroup flex-1 px-4 py-2 border-2"
        />
        <InputText
          onChange={handleChange}
          value={validation.price.toString()}
          name="price"
          placeholder="Price"
          type={"number"}
          min={0}
          max={10}
          className="p-inputgroup flex-1 px-4 py-2 border-2"
        />
        <Dropdown
          value={users.find((user) => user.email === validation.user)}
          onChange={(e) =>
            setValidation({ ...validation, user: e.target.value.email })
          }
          options={users}
          optionLabel="displayName"
          itemTemplate={(option: UserType) => {
            return (
              <div className="flex items-center gap-1">
                <img
                  className="rounded-full w-10 h-10 min-w-10 min-h-10 float-right"
                  src={
                    option.photoURL ||
                    `${import.meta.env.VITE_API_BACKEND_URL}public/user.png`
                  }
                />
                <div>{option.displayName}</div>
              </div>
            );
          }}
          placeholder="Select a User"
          className="p-inputgroup flex-1 w-full border-2"
        />
        <button
          onClick={handleCreate}
          className="max-md:w-full px-8 py-1 bg-blue-500 text-white text-sm hover:opacity-80 transition-all ease-in-out rounded-md"
        >
          Add
        </button>
      </div>
      <div className="p-2 bg-white rounded-lg w-full">
        <ConfirmPopup />
        <DataTable
          value={lot.validations}
          paginator
          rows={5}
          rowsPerPageOptions={[5, 10, 25, 50]}
          tableStyle={{ minWidth: "10rem" }}
          pt={{
            thead: { className: "text-[14px]" },
            paginator: {
              pageButton: ({ context }: { context: any }) => ({
                className: context.active
                  ? "bg-blue-500 text-white"
                  : undefined,
              }),
            },
          }}
        >
          <Column
            field="user"
            header="Name"
            body={(item: ValidationType) => (
              <div className="flex justify-center items-center gap-2 w-full">
                <img
                  className="rounded-full w-10 h-10 min-w-10 min-h-10 float-right"
                  src={
                    users.find((user) => user.email === item.user)?.photoURL ||
                    `${import.meta.env.VITE_API_BACKEND_URL}public/user.png`
                  }
                />
                <div>
                  {users.find((user) => user.email === item.user)?.displayName}
                </div>
              </div>
            )}
          ></Column>
          <Column
            field="duration"
            header="Duration"
            body={(item: ValidationType) => `${item.duration} hours`}
          ></Column>
          <Column
            field="price"
            header="Price"
            body={(item: ValidationType) => `$${item.price}`}
          ></Column>
          <Column
            field="delete"
            header="Delete"
            style={{ width: "10%" }}
            body={renderDelete}
          ></Column>
        </DataTable>
      </div>
    </>
  );
}
