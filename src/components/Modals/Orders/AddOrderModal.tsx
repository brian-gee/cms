import { Show, For, createSignal, createEffect, type JSX } from "solid-js";

export function AddOrderModal({
  fetchOrders,
  showAddModal,
  toggleAddModal,
  setSelectedClientId,
}) {
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
    const client_id = formData.get("client");

    if (!amount || !status || !client_id) return;

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, status, client_id }),
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

  const [clients, setClients] = createSignal([]);
  const [searchTerm, setSearchTerm] = createSignal("");
  // Fetch clients from Supabase
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

  // Call fetchClients on component mount
  createEffect(() => {
    fetchClients();
  });

  // Filter clients based on search term
  const filteredClients = () => {
    return clients()
      .filter(
        (client) =>
          client.first_name
            .toLowerCase()
            .includes(searchTerm().toLowerCase()) ||
          client.last_name.toLowerCase().includes(searchTerm().toLowerCase()),
      )
      .sort((a, b) => a.first_name.localeCompare(b.first_name)); // Sorting alphabetically by first name
  };

  return (
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
                      step="any"
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
                  <div class="col-span-6">
                    <label
                      for="client"
                      class="block mb-2 text-sm font-medium text-gray-900"
                    >
                      Select Client
                    </label>
                    <input
                      type="text"
                      placeholder="Search client"
                      onInput={(e) => setSearchTerm(e.target.value)}
                      class="mb-2 shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5"
                    />
                    <select
                      name="client"
                      id="client"
                      onChange={(e) => setSelectedClientId(e.target.value)}
                      class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5"
                    >
                      <For each={filteredClients()}>
                        {(client) => (
                          <option value={client.id}>
                            {client.first_name} {client.last_name}
                          </option>
                        )}
                      </For>
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
  );
}
