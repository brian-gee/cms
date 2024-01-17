import {
  createSignal,
  createEffect,
  For,
  ErrorBoundary,
  Show,
  type JSX,
} from "solid-js";

export interface OrderEntry {
  [key: string]: any;
}

export function OrdersTable() {
  const [orders, setOrders] = createSignal<OrderEntry[]>([]);

  // Fetch orders data from the server
  async function fetchOrders() {
    try {
      const response = await fetch("/api/orders");
      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  }

  // Effect to fetch orders on component mount
  createEffect(() => {
    fetchOrders();
  });

  // Handler to add a new order
  const addOrderHandler: JSX.EventHandler<
    HTMLFormElement,
    SubmitEvent
  > = async (e) => {
    e.preventDefault();
    const formElement = e.currentTarget;
    const formData = new FormData(formElement);
    const amount = formData.get("amount");
    const status = formData.get("status")?.toString();

    if (!amount || !status) return;

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, status }),
      });
      if (!response.ok) {
        throw new Error("Failed to add order");
      }
      // Fetch the updated list of orders
      await fetchOrders();
    } catch (error) {
      console.error("Error adding order:", error);
    }

    formElement.reset();
    window.location.href = "/crud/orderSuccess";
  };
  // State for managing modal visibility
  const [showEditModal, setShowEditModal] = createSignal(false);
  const [showAddModal, setShowAddModal] = createSignal(false);
  const [showDeleteModal, setShowDeleteModal] = createSignal(false);
  const [currentorderId, setCurrentorderId] = createSignal(null);
  const [selectedorder, setSelectedorder] = createSignal(null);
  const [currentPage, setCurrentPage] = createSignal(1);
  const itemsPerPage = 10; // Adjust as needed

  // State for the search query
  const [searchQuery, setSearchQuery] = createSignal("");

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
  const toggleDeleteModal = (orderId: any) => {
    setShowDeleteModal(!showDeleteModal());
    setCurrentorderId(orderId);
  };

  const handleorderClick = (order: any) => {
    setSelectedorder(order);
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
                Add order
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
                    Number
                  </th>
                  <th class="px-6 py-3 border-b border-gray-300 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Amount
                  </th>
                  <th class="px-6 py-3 border-b border-gray-300 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Status
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
                  {(order, index) => (
                    <tr class={index() % 2 != 0 ? "bg-gray-100" : ""}>
                      <td
                        onClick={() => handleorderClick(order)}
                        class="px-6 py-4 whitespace-nowrap cursor-pointer"
                      >
                        {order.client_id}
                      </td>
                      <td
                        onClick={() => handleorderClick(order)}
                        class="px-6 py-4 whitespace-nowrap cursor-pointer"
                      >
                        {order.amount}
                      </td>
                      <td
                        onClick={() => handleorderClick(order)}
                        class="px-6 py-4 whitespace-nowrap cursor-pointer"
                      >
                        {order.status}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleorderClick(order)}
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

        {/* <!-- Add order Modal --> */}
        <Show when={showAddModal()}>
          <div
            class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
            aria-hidden="true"
          ></div>
          <div
            class="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto"
            id="add-user-modal"
          >
            <div class="relative w-full h-full max-w-2xl px-4 md:h-auto">
              {/* <!-- Modal content --> */}
              <div class="relative bg-white rounded-lg shadow">
                {/* <!-- Modal header --> */}
                <div class="flex items-start justify-between p-5 border-b rounded-t">
                  <h3 class="text-xl font-semibold">Add new order</h3>
                  <button
                    type="button"
                    class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
                    onClick={toggleAddModal}
                  >
                    <svg
                      class="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clip-rule="evenodd"
                      ></path>
                    </svg>
                  </button>
                </div>
                {/* <!-- Modal body --> */}
                <div class="p-6 space-y-6">
                  <form onSubmit={addOrderHandler}>
                    <div class="grid grid-cols-6 gap-6">
                      <div class="col-span-6 sm:col-span-3">
                        <label
                          for="amount"
                          class="block mb-2 text-sm font-medium text-gray-900"
                        >
                          Amount
                        </label>
                        <input
                          type="number"
                          name="amount"
                          id="amount"
                          class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 "
                          placeholder="299.00"
                          required
                        />
                      </div>
                      <div class="col-span-6 sm:col-span-3">
                        <label
                          for="status"
                          class="block mb-2 text-sm font-medium text-gray-900 "
                        >
                          Order Status
                        </label>
                        <select
                          name="status"
                          id="status"
                          class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5"
                        >
                          <option value="not_sent">Not Sent</option>
                          <option value="pending">Pending</option>
                          <option value="half_paid">Half-paid</option>
                          <option value="paid">Paid</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>
                      <div class="col-span-6 sm:col-span-3">
                        <label
                          for="invoice"
                          class="block mb-2 text-sm font-medium text-gray-900"
                        >
                          Invoice
                        </label>
                        <input
                          type="file"
                          name="invoice"
                          id="invoice"
                          class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5"
                        />
                      </div>
                    </div>
                    {/* <!-- Modal footer --> */}
                    <div class="items-center p-6 border-t border-gray-200 rounded-b ">
                      <button
                        class="text-white bg-black hover:bg-black-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                        type="submit"
                      >
                        Add order
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </Show>

        {/* // <!-- Edit User Modal --> */}
        <Show when={showEditModal()}>
          <div
            class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
            aria-hidden="true"
          ></div>
          <div
            class="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto"
            id="edit-user-modal"
          >
            <div class="relative w-full h-full max-w-2xl px-4 md:h-auto">
              {/* <!-- Modal content --> */}
              <div class="relative bg-white rounded-lg shadow ">
                {/* <!-- Modal header --> */}
                <div class="flex items-start justify-between p-5 border-b rounded-t ">
                  <h3 class="text-xl font-semibold ">Edit user</h3>
                  <button
                    type="button"
                    class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
                    data-modal-toggle="edit-user-modal"
                  >
                    <svg
                      class="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clip-rule="evenodd"
                      ></path>
                    </svg>
                  </button>
                </div>
                {/* <!-- Modal body --> */}
                <div class="p-6 space-y-6">
                  <form action="#">
                    <div class="grid grid-cols-6 gap-6">
                      <div class="col-span-6 sm:col-span-3">
                        <label
                          for="first-name"
                          class="block mb-2 text-sm font-medium text-gray-900 "
                        >
                          First Name
                        </label>
                        <input
                          type="text"
                          name="first-name"
                          value="Bonnie"
                          id="first-name"
                          class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5      "
                          placeholder="Bonnie"
                          required
                        />
                      </div>
                      <div class="col-span-6 sm:col-span-3">
                        <label
                          for="last-name"
                          class="block mb-2 text-sm font-medium text-gray-900 "
                        >
                          Last Name
                        </label>
                        <input
                          type="text"
                          name="last-name"
                          value="Green"
                          id="last-name"
                          class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5      "
                          placeholder="Green"
                          required
                        />
                      </div>
                      <div class="col-span-6 sm:col-span-3">
                        <label
                          for="email"
                          class="block mb-2 text-sm font-medium text-gray-900 "
                        >
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          value="bonnie@flowbite.com"
                          id="email"
                          class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5      "
                          placeholder="example@company.com"
                          required
                        />
                      </div>
                      <div class="col-span-6 sm:col-span-3">
                        <label
                          for="position"
                          class="block mb-2 text-sm font-medium text-gray-900 "
                        >
                          Position
                        </label>
                        <input
                          type="text"
                          name="position"
                          value="React Developer"
                          id="position"
                          class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5      "
                          placeholder="e.g. React developer"
                          required
                        />
                      </div>
                      <div class="col-span-6 sm:col-span-3">
                        <label
                          for="current-password"
                          class="block mb-2 text-sm font-medium text-gray-900 "
                        >
                          Current Password
                        </label>
                        <input
                          type="password"
                          name="current-password"
                          value="••••••••"
                          id="current-password"
                          class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5      "
                          placeholder="••••••••"
                          required
                        />
                      </div>
                      <div class="col-span-6 sm:col-span-3">
                        <label
                          for="new-password"
                          class="block mb-2 text-sm font-medium text-gray-900 "
                        >
                          New Password
                        </label>
                        <input
                          type="password"
                          name="new-password"
                          value="••••••••"
                          id="new-password"
                          class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5      "
                          placeholder="••••••••"
                          required
                        />
                      </div>
                      <div class="col-span-6">
                        <label
                          for="biography"
                          class="block mb-2 text-sm font-medium text-gray-900 "
                        >
                          Biography
                        </label>
                        <textarea
                          id="biography"
                          rows="4"
                          class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500      "
                          placeholder="👨‍💻Full-stack web developer. Open-source contributor."
                        >
                          👨‍💻Full-stack web developer. Open-source contributor.
                        </textarea>
                      </div>
                    </div>
                  </form>
                  {/* <!-- Modal footer --> */}
                  <div class="items-center p-6 border-t border-gray-200 rounded-b ">
                    <button
                      class="text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                      type="submit"
                    >
                      Save all
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Show>

        {/* <!-- Delete User Modal --> */}
        <Show when={showDeleteModal()}>
          <div
            class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
            aria-hidden="true"
          ></div>
          <div
            class="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto"
            id="delete-user-modal"
          >
            <div class="relative w-full h-full max-w-md px-4 md:h-auto">
              {/* <!-- Modal content --> */}
              <div class="relative bg-white rounded-lg shadow ">
                {/* <!-- Modal header --> */}
                <div class="flex justify-end p-2">
                  <button
                    type="button"
                    class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
                    onClick={toggleDeleteModal}
                  >
                    <svg
                      class="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clip-rule="evenodd"
                      ></path>
                    </svg>
                  </button>
                </div>
                {/* <!-- Modal body --> */}
                <div class="p-6 pt-0 text-center">
                  <svg
                    class="w-16 h-16 mx-auto text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  <h3 class="mt-5 mb-6 text-lg text-gray-500">
                    Are you sure you want to delete order with ID:{" "}
                    {currentorderId()}?
                  </h3>
                  <button
                    onclick={() => deleteorder(currentorderId())}
                    class="text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-base inline-flex items-center px-3 py-2.5 text-center mr-2"
                  >
                    Yes, I'm sure
                  </button>
                  <a
                    href="#"
                    class="text-gray-900 bg-white hover:bg-gray-100 focus:ring-4 focus:ring-primary-300 border border-gray-200 font-medium inline-flex items-center rounded-lg text-base px-3 py-2.5 text-center"
                    data-modal-toggle="delete-user-modal"
                  >
                    No, cancel
                  </a>
                </div>
              </div>
            </div>
          </div>
        </Show>

        {/* Modal for displaying selected order information */}
        <Show when={selectedorder()}>
          <div
            class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
            aria-hidden="true"
          ></div>
          <div
            class="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto"
            id="order-info-modal"
          >
            <div class="relative w-full h-full max-w-2xl px-4 md:h-auto">
              <div class="relative bg-white rounded-lg shadow ">
                <div class="flex items-start justify-between p-5 border-b rounded-t ">
                  <h3 class="text-xl font-semibold ">order Information</h3>
                  <div>
                    <button class="ml-auto text-indigo-600 hover:text-indigo-900">
                      Edit
                    </button>
                    <button
                      type="button"
                      class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center "
                      onClick={() => setSelectedorder(null)}
                    >
                      <svg
                        class="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clip-rule="evenodd"
                        ></path>
                      </svg>
                    </button>
                  </div>
                </div>
                <div class="p-6 space-y-6">
                  {/* Display order information here */}
                  <div>
                    <h4 class="text-lg font-medium">Name</h4>
                    <p>
                      {selectedorder().first_name} {selectedorder().last_name}
                    </p>
                  </div>
                  <div>
                    <h4 class="text-lg font-medium">Phone</h4>
                    <p>{formatPhoneNumber(selectedorder().phone)}</p>
                  </div>
                  <div>
                    <h4 class="text-lg font-medium">Email</h4>
                    <p>{selectedorder().email}</p>
                  </div>
                  <div>
                    <h4 class="text-lg font-medium">Address</h4>
                    <p>
                      {selectedorder().address +
                        " " +
                        selectedorder().city +
                        " " +
                        selectedorder().zip}
                    </p>
                  </div>
                  <div>
                    <h4 class="text-lg font-medium">Company</h4>
                    <p>{selectedorder().company}</p>
                  </div>
                  {/* Add more fields as needed */}
                </div>
              </div>
            </div>
          </div>
        </Show>
      </ErrorBoundary>
    </div>
  );
}
