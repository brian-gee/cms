import { Show, For, createSignal, createEffect, type JSX } from "solid-js";

export function EditOrderModal({
  editSelectedOrder,
  setEditSelectedOrder,
  setSelectedClientId,
}) {
  // Handler to add a new order
  const editOrderHandler: JSX.EventHandler<
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
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editSelectedOrder().id,
          amount,
          status,
          client_id,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to edit order");
      }
    } catch (error) {
      console.error("Error editing order:", error);
    }

    formElement.reset();
    window.location.href = "/crud/orderSuccess";
  };

  const [clients, setClients] = createSignal([]);
  const [searchTerm, setSearchTerm] = createSignal("");
  const [showDropdown, setShowDropdown] = createSignal(null);
  const [selectedClientName, setSelectedClientName] = createSignal("");
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
    <Show when={editSelectedOrder()}>
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

      <div class="fixed inset-0 z-50 flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
        <div class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:max-w-lg">
          {/* <!-- Modal content --> */}
          <div class="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            {/* <!-- Modal header --> */}
            <div class="flex items-start justify-between p-5 border-b rounded-t">
              <h3 class="text-xl font-semibold">Edit order</h3>
              <button
                type="button"
                class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
                onClick={() => setEditSelectedOrder(null)}
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
              <form onSubmit={editOrderHandler}>
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
                      value={editSelectedOrder().amount}
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
                      value={editSelectedOrder().status}
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
                      value={selectedClientName()} // Bind the input value to the selected client's name
                      onInput={(e) => {
                        setSearchTerm(e.target.value);
                        setSelectedClientName(e.target.value); // Update the input value as the user types
                        setShowDropdown(true);
                      }}
                      onFocus={() => setShowDropdown(true)}
                      onBlur={() => {
                        // Timeout to allow the dropdown to be clicked before hiding
                        setTimeout(() => setShowDropdown(false), 200);
                      }}
                      class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5"
                    />

                    <Show when={showDropdown()}>
                      <ul class="absolute z-10 w-full max-h-56 overflow-auto shadow-sm bg-white border border-gray-300 text-gray-900 sm:text-sm rounded-b-lg">
                        <For each={filteredClients()}>
                          {(client, index) => (
                            <li
                              class={`cursor-pointer p-2.5 ${
                                index() % 2 === 0 ? "bg-gray-50" : "bg-white"
                              } hover:bg-gray-100`}
                              onMouseDown={(e) => e.preventDefault()} // Prevents the input from losing focus
                              onClick={() => {
                                setSelectedClientId(client.id); // Assuming you have this function to set the client ID
                                setSelectedClientName(
                                  `${client.first_name} ${client.last_name}`,
                                ); // Set the selected client's name
                                setShowDropdown(false); // Hide the dropdown
                              }}
                            >
                              {client.first_name} {client.last_name}
                            </li>
                          )}
                        </For>
                      </ul>
                    </Show>
                    {/* Hidden select to submit the form with the client id */}
                    <select
                      name="client"
                      id="client"
                      class="hidden"
                      onChange={(e) => setSelectedClientId(e.target.value)}
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
                <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    class="text-white bg-black hover:bg-black-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                    type="submit"
                  >
                    Save order
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
