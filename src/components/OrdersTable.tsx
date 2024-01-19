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
  const [currentPage, setCurrentPage] = createSignal(1);
  const itemsPerPage = 10; // Amount of items to display

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
      const ordersWithClientNames = ordersData.map((order) => {
        const client = clientsData.find(
          (client) => client.id === order.client_id,
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

    const start = (currentPage() - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredData?.slice(start, end);
  };

  // Function to handle page change
  const setPage = (pageNumber: number) => {
    setCurrentPage(pageNumber);
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
            {/* Pagination Controls */}
            <div class="pagination flex justify-center space-x-4 py-4">
              {Array(Math.ceil(paginatedData().length / itemsPerPage))
                .fill(0)
                .map((_, index) => (
                  <button onClick={() => setPage(index + 1)}>
                    {index + 1}
                  </button>
                ))}
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
