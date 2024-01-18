import { createSignal, createEffect, For, ErrorBoundary, Show } from "solid-js";
import { AddClientModal } from "./Modals/Clients/AddClientModal";
import { DeleteClientModal } from "./Modals/Clients/DeleteClientModal";
import { ShowSelectedClientModal } from "./Modals/Clients/ShowSelectedClientModal";

export interface ClientEntry {
  [key: string]: any;
}

export function ClientsTable() {
  // Signal for storing client data
  const [clients, setClients] = createSignal<ClientEntry[]>([]);
  // State for managing modal visibility
  const [showEditModal, setShowEditModal] = createSignal(false);
  const [showAddModal, setShowAddModal] = createSignal(false);
  const [showDeleteModal, setShowDeleteModal] = createSignal(false);
  const [selectedClient, setSelectedClient] = createSignal(null);
  const [currentClientId, setCurrentClientId] = createSignal(null);
  // State for the search query
  const [searchQuery, setSearchQuery] = createSignal("");
  // State for pagination
  const [currentPage, setCurrentPage] = createSignal(1);
  const itemsPerPage = 10; // How many items should be displayed

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
  const paginatedData = () => {
    const query = searchQuery().toLowerCase();

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

    const start = (currentPage() - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return sortedData?.slice(start, end);
  };

  // Function to handle page change
  const setPage = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Toggle functions for modals
  const toggleEditModal = () => setShowEditModal(!showEditModal());
  const toggleAddModal = () => setShowAddModal(!showAddModal());
  const toggleDeleteModalNoId = () => setShowDeleteModal(!showDeleteModal());
  const toggleDeleteModal = (clientId: any) => {
    setShowDeleteModal(!showDeleteModal());
    setCurrentClientId(clientId);
  };

  const handleClientClick = (client: any) => {
    setSelectedClient(client);
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
                  {/* Headers - Adjust according to your data keys */}
                  {/* <th class="px-6 py-3">
                    <input type="checkbox" />
                  </th> */}
                  <th class="px-6 py-3 border-b border-gray-300 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Name
                  </th>
                  <th class="px-6 py-3 border-b border-gray-300 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Phone
                  </th>
                  <th class="px-6 py-3 border-b border-gray-300 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Email
                  </th>
                  {/* <th class="px-6 py-3 border-b border-gray-300 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Address
                  </th>
                  <th class="px-6 py-3 border-b border-gray-300 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Company
                  </th> */}
                  <th class="px-6 py-3 border-b border-gray-300 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
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
                          onClick={() => handleClientClick(client)}
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
            {/* Pagination Controls */}
            <div class="pagination flex justify-center space-x-4 py-4">
              {Array(Math.ceil(clients().length / itemsPerPage))
                .fill(0)
                .map((_, index) => (
                  <button onClick={() => setPage(index + 1)}>
                    {index + 1}
                  </button>
                ))}
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
        />
      </ErrorBoundary>
    </div>
  );
}
