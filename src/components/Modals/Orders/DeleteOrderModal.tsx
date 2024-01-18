import { Show } from "solid-js";

export function DeleteOrderModal({
  fetchOrders,
  showDeleteModal,
  toggleDeleteModal,
  toggleDeleteModalNoOrder,
  currentOrderId,
}) {
  async function deleteOrder(orderId: string) {
    try {
      const response = await fetch("/api/orders", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId }), // Modify this line
      });
      if (!response.ok) {
        throw new Error("Failed to delete order");
      }
      // Fetch the updated list of orders
      await fetchOrders();
      toggleDeleteModalNoOrder();
    } catch (error) {
      console.error("Error deleting order:", error);
    }
  }

  return (
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
                {currentOrderId()}?
              </h3>
              <button
                onclick={() => deleteOrder(currentOrderId())}
                class="text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-base inline-flex items-center px-3 py-2.5 text-center mr-2"
              >
                Yes, I'm sure
              </button>
              <button
                onclick={toggleDeleteModal}
                class="text-gray-900 bg-white hover:bg-gray-100 focus:ring-4 focus:ring-primary-300 border border-gray-200 font-medium inline-flex items-center rounded-lg text-base px-3 py-2.5 text-center"
                data-modal-toggle="delete-user-modal"
              >
                No, cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </Show>
  );
}
