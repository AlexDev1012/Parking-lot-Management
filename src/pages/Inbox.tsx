import { useState, useEffect } from "react";
import axios from "axios";
import { InboxType, MessageContent, UserType } from "../types";
import { Button } from "primereact/button";
import { TextInput } from "@tremor/react";

function InboxComponent() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [messages, setMessages] = useState<InboxType[]>([]);
  const [contents, setContents] = useState<MessageContent[]>([]);

  const fetchUsers = async () => {
    const { data } = await axios.get(`/user`);
    setUsers(data);
  };

  const fetchMessages = async () => {
    const { data } = await axios.get("/message/getAll");
    setMessages(data);
    setContents([]);
  };
  const deleteMessage = async (_id: string) => {
    await axios.delete(`/message/${_id}`);
    fetchMessages();
  };

  useEffect(() => {
    fetchMessages();
    fetchUsers();
  }, []);

  return (
    <div className="space-y-8 p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Header Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <i className="pi pi-inbox text-xl text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800">Inbox</h1>
            </div>
            <p className="text-gray-600">
              Manage and view your messages and conversations
            </p>
          </div>
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-lg">
              <i className="pi pi-envelope text-blue-600" />
              <span className="font-medium text-blue-700">
                {messages.length}
              </span>
              <span className="text-blue-600">Messages</span>
            </div>
            <Button
              icon="pi pi-refresh"
              onClick={fetchMessages}
              className="p-3 hover:shadow-md transition-all"
              severity="secondary"
              aria-label="Refresh"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex gap-6">
        {/* Conversations List */}
        <div className="w-80 bg-white rounded-2xl shadow-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Conversations
              </h2>
              <Button
                icon="pi pi-plus"
                className="p-2 hover:shadow-md transition-all"
                severity="secondary"
                aria-label="New Conversation"
                rounded
              />
            </div>
            <div className="relative">
              <i className="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <TextInput
                placeholder="Search conversations"
                className="w-full pl-10 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all rounded-lg"
              />
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {users &&
              messages.map((message, index) => {
                const user = users.find(
                  (user) => user.email === message.sender
                );
                return (
                  <div
                    key={index}
                    onClick={() => setContents(message.contents)}
                    className={`flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                      contents === message.contents ? "bg-blue-50" : ""
                    }`}
                  >
                    <img
                      className="h-10 w-10 rounded-full object-cover"
                      src={
                        user?.photoURL ||
                        `${import.meta.env.VITE_API_PUBLIC_URL}/user.png`
                      }
                      alt={user?.displayName}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {user?.displayName || "User " + index}
                        </p>
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          {message.count}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate">
                        {message.contents[
                          message.contents.length - 1
                        ]?.content.substring(0, 30)}
                        ...
                      </p>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Messages Content */}
        <div className="flex-1 bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {contents.length > 0 ? (
            <div className="h-full flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">
                  Messages
                </h2>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {contents.map((item, index) => (
                  <div
                    key={index}
                    className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all p-4"
                  >
                    <p className="text-gray-700 mb-3">{item.content}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        {new Date(item.createdAt).toLocaleString()}
                      </span>
                      <Button
                        icon="pi pi-trash"
                        onClick={() => deleteMessage(item.id)}
                        className="p-2"
                        severity="danger"
                        text
                        rounded
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <i className="pi pi-inbox text-4xl mb-4" />
                <p>Select a conversation to view messages</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default InboxComponent;
