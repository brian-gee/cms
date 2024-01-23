import { createSignal, createEffect, For, ErrorBoundary } from "solid-js";

import { AddOrderModal } from "./Modals/Orders/AddOrderModal";
import { DeleteOrderModal } from "./Modals/Orders/DeleteOrderModal";
import { ShowSelectedOrderModal } from "./Modals/Orders/ShowSelectedOrderModal";
import { EditOrderModal } from "./Modals/Orders/EditOrderModal";

export interface OrderEntry {
  [key: string]: any;
}

export function OrdersTable() {
  const [orders, setOrders] = createSignal<OrderEntry[]>([]);
  // State for storing clients
  const [selectedClientId, setSelectedClientId] = createSignal(null);
  // State for managing modal visibility
  const [showEditModal, setShowEditModal] = createSignal(false);
  const [showAddModal, setShowAddModal] = createSignal(false);
  const [showDeleteModal, setShowDeleteModal] = createSignal(false);
  const [currentOrderId, setCurrentOrderId] = createSignal(null);
  const [selectedOrder, setSelectedOrder] = createSignal(null);
  const [editSelectedOrder, setEditSelectedOrder] = createSignal(null);
  // State for the search query
  const [searchQuery, setSearchQuery] = createSignal("");
  // State for pagination
  const itemsPerPage = 10;
  const [page, setPage] = createSignal(1);
  const totalPages = () => Math.ceil(orders().length / itemsPerPage);
  const start = () => (page() - 1) * itemsPerPage;
  const end = () => start() + itemsPerPage;

  // Fetch orders data from the server
  async function fetchOrders() {
    try {
      const ordersResponse = await fetch("/api/orders");
      if (!ordersResponse.ok) {
        throw new Error("Failed to fetch orders");
      }
      const ordersData = await ordersResponse.json();

      const clientsResponse = await fetch("/api/clients");
      if (!clientsResponse.ok) {
        throw new Error("Failed to fetch clients");
      }
      const clientsData = await clientsResponse.json();

      // Map orders to include client names
      const ordersWithClientNames = ordersData.map((order: any) => {
        const client = clientsData.find(
          (client: any) => client.id === order.client_id,
        );
        return {
          ...order,
          clientName: client
            ? `${client.first_name} ${client.last_name}`
            : "Unknown",
        };
      });

      setOrders(ordersWithClientNames);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  }

  // Effect to fetch orders on component mount
  createEffect(() => {
    fetchOrders();
  });

  // Update search query
  const updateSearchQuery = (e: Event) => {
    const target = e.target as HTMLInputElement;
    setSearchQuery(target.value);
  };

  // Function to calculate the slice of data to display
  const paginatedData = () => {
    const query = searchQuery().toLowerCase();
    const filteredData = orders()?.filter((order) => {
      const amount = order.amount.toString().toLowerCase();
      const status = order.status.toLowerCase();
      return amount.includes(query) || status.includes(query);
    });

    // Calculate start and end indices for pagination
    const start = (page() - 1) * itemsPerPage;
    const end = start + itemsPerPage;

    // Slice the sorted data for pagination
    return filteredData?.slice(start, end);
  };

  // Toggle functions for modals
  const toggleEditModal = () => setShowEditModal(!showEditModal());
  const toggleAddModal = () => setShowAddModal(!showAddModal());
  const toggleDeleteModalNoOrder = () => setShowDeleteModal(!showDeleteModal());
  const toggleDeleteModal = (orderId: any) => {
    setShowDeleteModal(!showDeleteModal());
    setCurrentOrderId(orderId);
  };

  const handleOrderClick = (order: any) => {
    setSelectedOrder(order);
  };
  const handleEditOrderClick = (order: any) => {
    setEditSelectedOrder(order);
  };

  return (
    <div class="max-w-3xl w-full mx-auto">
      <ErrorBoundary fallback={<div>Something went wrong</div>}>
        <div class="container mt-8">
          <div class="flex justify-between items-center bg-white p-4 rounded-md">
            <h1 class="text-lg font-bold">All Orders</h1>
            <div class="flex justify-between space-x-4">
              {/* Search Input */}
              <input
                type="text"
                class="shadow border rounded py-2 px-3 text-grey-darker"
                placeholder="Search orders"
                onInput={updateSearchQuery}
              />
              <button
                onClick={toggleAddModal}
                class="bg-primary text-white px-4 w-1/3 py-2 rounded-md hover:bg-primary_hover transition"
              >
                Add Order
              </button>
            </div>
          </div>
          <div class="bg-white shadow-md rounded my-6">
            <table class="min-w-full table-auto">
              <thead class="bg-gray-200">
                <tr>
                  <th class="px-6 py-3 border-b border-gray-300 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Client
                  </th>
                  <th class="px-6 py-3 border-b border-gray-300 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Amount
                  </th>
                  <th class="px-6 py-3 border-b border-gray-300 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th class="px-6 py-3 border-b border-gray-300 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white">
                <For each={paginatedData()}>
                  {(order, index) => (
                    <tr class={index() % 2 != 0 ? "bg-gray-100" : ""}>
                      <td
                        onClick={() => handleOrderClick(order)}
                        class="px-6 py-4 whitespace-nowrap cursor-pointer"
                      >
                        {order.clientName}
                      </td>
                      <td
                        onClick={() => handleOrderClick(order)}
                        class="px-6 py-4 whitespace-nowrap cursor-pointer"
                      >
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "USD",
                        }).format(order.amount)}
                      </td>
                      <td
                        onClick={() => handleOrderClick(order)}
                        class="px-6 py-4 whitespace-nowrap cursor-pointer"
                      >
                        {order.status}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEditOrderClick(order)}
                          class="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                        </button>
                        <button
                          onclick={() => toggleDeleteModal(order.id)}
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
                      {Math.min(end(), orders().length)}
                    </span>
                    of
                    <span class="font-medium mx-1">{orders().length}</span>
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
                    {Array.from({ length: totalPages() }, (_, i) => i + 1).map(
                      (p) => (
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
                      ),
                    )}

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

        <AddOrderModal
          showAddModal={showAddModal}
          toggleAddModal={toggleAddModal}
          setSelectedClientId={setSelectedClientId}
        />

        <DeleteOrderModal
          fetchOrders={fetchOrders}
          showDeleteModal={showDeleteModal}
          toggleDeleteModal={toggleDeleteModal}
          toggleDeleteModalNoOrder={toggleDeleteModalNoOrder}
          currentOrderId={currentOrderId}
        />

        <ShowSelectedOrderModal
          selectedOrder={selectedOrder}
          setselectedOrder={setSelectedOrder}
          setEditSelectedOrder={setEditSelectedOrder}
        />

        <EditOrderModal
          editSelectedOrder={editSelectedOrder}
          setEditSelectedOrder={setEditSelectedOrder}
          setSelectedClientId={setSelectedClientId}
        />
      </ErrorBoundary>
    </div>
  );
}
