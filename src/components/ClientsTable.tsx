import {
  createSignal,
  createEffect,
  For,
  ErrorBoundary,
  Show,
  createMemo,
} from "solid-js";
import { AddClientModal } from "./Modals/Clients/AddClientModal";
import { DeleteClientModal } from "./Modals/Clients/DeleteClientModal";
import { ShowSelectedClientModal } from "./Modals/Clients/ShowSelectedClientModal";
import { EditClientModal } from "./Modals/Clients/EditClientModal";

export interface ClientEntry {
  [key: string]: any;
}

export function ClientsTable() {
  const tableHeaders = ["Name", "Phone", "Email", "Actions"];

  // Signal for storing client data
  const [clients, setClients] = createSignal<ClientEntry[]>([]);
  // State for managing modal visibility
  const [showAddModal, setShowAddModal] = createSignal(false);
  const [showDeleteModal, setShowDeleteModal] = createSignal(false);
  const [selectedClient, setSelectedClient] = createSignal(null);
  const [editSelectedClient, setEditSelectedClient] = createSignal(null);
  const [currentClientId, setCurrentClientId] = createSignal(null);
  // State for the search query
  const [searchQuery, setSearchQuery] = createSignal("");
  // State for pagination
  const itemsPerPage = 10;
  const [page, setPage] = createSignal(1);
  const totalPages = () => Math.ceil(clients().length / itemsPerPage);
  const start = () => (page() - 1) * itemsPerPage;
  const end = () => start() + itemsPerPage;

  // Fetch clients data from the server
  async function fetchClients() {
    try {
      const response = await fetch("/api/clients");
      if (!response.ok) {
        throw new Error("Failed to fetch clients");
      }
      const data = await response.json();
      setClients(data);
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  }

  // Effect to fetch clients on component mount
  createEffect(() => {
    fetchClients();
  });

  // Update search query
  const updateSearchQuery = (e: Event) => {
    const target = e.target as HTMLInputElement;
    setSearchQuery(target.value);
  };

  // Function to calculate the slice of data to display
  const paginatedData = createMemo(() => {
    const query = searchQuery().toLowerCase();

    // Filter the data based on the search query
    const filteredData = clients()?.filter((client) => {
      const fullName = `${client.first_name} ${client.last_name}`.toLowerCase();
      const phone = client.phone.toLowerCase();
      const email = client.email.toLowerCase();
      return (
        fullName.includes(query) ||
        phone.includes(query) ||
        email.includes(query)
      );
    });

    // Sort the filtered data by first name
    const sortedData = filteredData?.sort((a, b) =>
      a.first_name.localeCompare(b.first_name),
    );

    // Calculate start and end indices for pagination
    const start = (page() - 1) * itemsPerPage;
    const end = start + itemsPerPage;

    // Slice the sorted data for pagination
    return sortedData?.slice(start, end);
  });

  // Toggle functions for modals
  const toggleAddModal = () => setShowAddModal(!showAddModal());
  const toggleDeleteModalNoId = () => setShowDeleteModal(!showDeleteModal());
  const toggleDeleteModal = (clientId: any) => {
    setShowDeleteModal(!showDeleteModal());
    setCurrentClientId(clientId);
  };

  const handleClientClick = (client: any) => {
    setSelectedClient(client);
  };
  const handleEditClick = (client: any) => {
    setEditSelectedClient(client);
  };

  function formatPhoneNumber(phoneNumber: string) {
    const cleaned = ("" + phoneNumber).replace(/\D/g, "");
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return null;
  }

  return (
    <div class="max-w-3xl w-full mx-auto">
      <ErrorBoundary fallback={<div>Something went wrong</div>}>
        <div class="container mt-8">
          <div class="flex justify-between items-center bg-white p-4 rounded-md">
            <h1 class="text-lg font-bold">All Clients</h1>
            <div class="flex justify-between space-x-4">
              {/* Search Input */}
              <input
                type="text"
                class="shadow border rounded py-2 px-3 text-grey-darker"
                placeholder="Search clients"
                onInput={updateSearchQuery}
              />
              <button
                onClick={toggleAddModal}
                class="bg-primary text-white px-4 w-1/3 py-2 rounded-md hover:bg-primary_hover transition"
              >
                Add Client
              </button>
            </div>
          </div>
          <div class="bg-white shadow-md rounded my-6">
            <table class="min-w-full table-auto">
              <thead class="bg-gray-200">
                <tr>
                  <For each={tableHeaders}>
                    {(header) => (
                      <th class="px-6 py-3 border-b border-gray-300 text-left text-xs font-medium uppercase tracking-wider">
                        {header}
                      </th>
                    )}
                  </For>
                </tr>
              </thead>
              <tbody class="bg-white">
                <For each={paginatedData()}>
                  {(client, index) => (
                    <tr class={index() % 2 != 0 ? "bg-gray-100" : ""}>
                      <td
                        onClick={() => handleClientClick(client)}
                        class="px-6 py-4 whitespace-nowrap cursor-pointer"
                      >
                        {client.first_name + " " + client.last_name}
                      </td>
                      <td
                        onClick={() => handleClientClick(client)}
                        class="px-6 py-4 whitespace-nowrap cursor-pointer"
                      >
                        {formatPhoneNumber(client.phone)}
                      </td>
                      <td
                        onClick={() => handleClientClick(client)}
                        class="px-6 py-4 whitespace-nowrap cursor-pointer"
                      >
                        {client.email}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEditClick(client)}
                          class="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                        </button>
                        <button
                          onclick={() => toggleDeleteModal(client.id)}
                          class="text-primary hover:text-primary_hover ml-4"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  )}
                </For>
              </tbody>
            </table>
            <div>
              {/* Pagination */}
              <div class="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                <div class="flex flex-1 justify-between sm:hidden">
                  <button
                    onClick={() => setPage(page() > 1 ? page() - 1 : 1)}
                    class="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() =>
                      setPage(page() < totalPages() ? page() + 1 : totalPages())
                    }
                    class="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
                <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <div>
                    <p class="text-sm text-gray-700">
                      Showing
                      <span class="font-medium mx-1">{start() + 1}</span>
                      to
                      <span class="font-medium mx-1">
                        {Math.min(end(), clients().length)}
                      </span>
                      of
                      <span class="font-medium mx-1">{clients().length}</span>
                      results
                    </p>
                  </div>

                  <div>
                    <nav
                      class="isolate inline-flex -space-x-px rounded-md shadow-sm"
                      aria-label="Pagination"
                    >
                      <button
                        onClick={() => setPage(page() > 1 ? page() - 1 : 1)}
                        class="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                      >
                        <svg
                          class="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fill-rule="evenodd"
                            d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                            clip-rule="evenodd"
                          />
                        </svg>
                      </button>

                      {/* Pagination Buttons */}
                      {Array.from(
                        { length: totalPages() },
                        (_, i) => i + 1,
                      ).map((p) => (
                        <button
                          onClick={() => setPage(p)}
                          class={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                            page() === p
                              ? "bg-primary text-white"
                              : "text-gray-900"
                          } ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0`}
                        >
                          {p}
                        </button>
                      ))}

                      <button
                        onClick={() =>
                          setPage(
                            page() < totalPages() ? page() + 1 : totalPages(),
                          )
                        }
                        class="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                      >
                        <svg
                          class="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fill-rule="evenodd"
                            d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                            clip-rule="evenodd"
                          />
                        </svg>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <AddClientModal
          fetchClients={fetchClients}
          showAddModal={showAddModal}
          toggleAddModal={toggleAddModal}
        />

        <DeleteClientModal
          fetchClients={fetchClients}
          showDeleteModal={showDeleteModal}
          toggleDeleteModal={toggleDeleteModal}
          toggleDeleteModalNoId={toggleDeleteModalNoId}
          currentClientId={currentClientId}
        />

        <ShowSelectedClientModal
          selectedClient={selectedClient}
          setSelectedClient={setSelectedClient}
          formatPhoneNumber={formatPhoneNumber}
          setEditSelectedClient={setEditSelectedClient}
        />

        <EditClientModal
          editSelectedClient={editSelectedClient}
          setEditSelectedClient={setEditSelectedClient}
        />
      </ErrorBoundary>
    </div>
  );
}
